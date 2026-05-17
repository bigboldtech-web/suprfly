'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { CommentRow } from '@/types';

interface CommentFilters {
  tab?: 'POSTED' | 'PENDING';
  workflowId?: string;
  accountId?: string;
  platform?: 'LINKEDIN' | 'TWITTER';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export function useComments(filters: CommentFilters) {
  return useQuery({
    queryKey: ['comments', filters],
    queryFn: async () => {
      const { data } = await api.get('/comments', { params: filters });
      return {
        items: (data.data?.items ?? []) as CommentRow[],
        counts: data.data?.counts ?? { posted: 0, pending: 0 },
        pagination: data.pagination,
      };
    },
  });
}

export function useApproveComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/comments/${id}/approve`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment approved — queued for posting');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to approve'),
  });
}

export function useEditComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentText }: { id: string; commentText: string }) =>
      api.put(`/comments/${id}`, { commentText }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
  });
}

export function useRejectComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.post(`/comments/${id}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment rejected');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to reject'),
  });
}
