'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Tone } from '@/types';
import { apiErrorMessage } from '@/lib/utils';

export function useTones() {
  return useQuery<Tone[]>({
    queryKey: ['tones'],
    queryFn: async () => {
      const { data } = await api.get('/tones');
      return data.data;
    },
  });
}

export function useTone(id: string | null) {
  return useQuery<Tone>({
    queryKey: ['tones', id],
    queryFn: async () => {
      const { data } = await api.get(`/tones/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Tone>) => api.post('/tones', input).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tones'] });
      toast.success('Tone created');
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err) || 'Failed to create tone'),
  });
}

export function useUpdateTone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Tone> & { id: string }) =>
      api.put(`/tones/${id}`, patch).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tones'] });
      toast.success('Tone saved');
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err) || 'Failed to save tone'),
  });
}

export function useDeleteTone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tones/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tones'] });
      toast.success('Tone deleted');
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err) || 'Failed to delete tone'),
  });
}
