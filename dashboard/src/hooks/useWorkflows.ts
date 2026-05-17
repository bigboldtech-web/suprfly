'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Workflow } from '@/types';
import { apiErrorMessage } from '@/lib/utils';

export function useWorkflows() {
  return useQuery<Workflow[]>({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data } = await api.get('/workflows');
      return data.data;
    },
  });
}

export function useWorkflow(id: string | null) {
  return useQuery<Workflow>({
    queryKey: ['workflows', id],
    queryFn: async () => {
      const { data } = await api.get(`/workflows/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Workflow>) => api.post('/workflows', input).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Workflow created');
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err) || 'Failed to create workflow'),
  });
}

export function useUpdateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Workflow> & { id: string }) =>
      api.put(`/workflows/${id}`, patch).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      qc.invalidateQueries({ queryKey: ['workflows', vars.id] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Workflow saved');
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err) || 'Failed to save workflow'),
  });
}

export function useDeleteWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/workflows/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Workflow deleted');
    },
  });
}

export function useToggleWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.post(`/workflows/${id}/${active ? 'activate' : 'deactivate'}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Keywords (nested)
export function useAddKeyword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, keyword }: { workflowId: string; keyword: string }) =>
      api.post(`/workflows/${workflowId}/keywords`, { keyword }).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workflows', vars.workflowId] });
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err) || 'Failed to add keyword'),
  });
}

export function useDeleteKeyword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, keywordId }: { workflowId: string; keywordId: string }) =>
      api.delete(`/workflows/${workflowId}/keywords/${keywordId}`).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workflows', vars.workflowId] });
    },
  });
}

// Creators (nested)
export function useAddCreator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, ...creator }: { workflowId: string } & Record<string, unknown>) =>
      api.post(`/workflows/${workflowId}/creators`, creator).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workflows', vars.workflowId] });
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err) || 'Failed to add creator'),
  });
}

export function useDeleteCreator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, creatorId }: { workflowId: string; creatorId: string }) =>
      api.delete(`/workflows/${workflowId}/creators/${creatorId}`).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workflows', vars.workflowId] });
    },
  });
}
