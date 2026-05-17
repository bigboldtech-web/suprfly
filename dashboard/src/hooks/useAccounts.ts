'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import type { ConnectedAccount } from '@/types';

export function useAccounts() {
  const setAccounts = useAuthStore((s) => s.setAccounts);
  return useQuery<ConnectedAccount[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get('/accounts');
      setAccounts(data.data);
      return data.data;
    },
  });
}

export function useToggleAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/accounts/${id}/toggle`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account toggled');
    },
  });
}

export function useDisconnectAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account disconnected');
    },
  });
}

export function useRefreshSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/accounts/${id}/refresh`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Session refreshed');
    },
  });
}
