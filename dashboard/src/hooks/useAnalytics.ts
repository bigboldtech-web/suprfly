'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import type { AnalyticsSummary, QuotaSnapshot, TimeseriesPoint } from '@/types';

export function useAnalyticsSummary() {
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/summary');
      return data.data;
    },
    enabled: isLoggedIn(),
    refetchInterval: 60_000,
  });
}

export function useAnalyticsTimeseries(range: '24h' | '7d' | '30d') {
  return useQuery<TimeseriesPoint[]>({
    queryKey: ['analytics', 'timeseries', range],
    queryFn: async () => {
      const { data } = await api.get('/analytics/timeseries', { params: { range } });
      return data.data;
    },
    enabled: isLoggedIn(),
  });
}

export function useGlobalQuota() {
  return useQuery<QuotaSnapshot>({
    queryKey: ['analytics', 'quota'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/quota');
      return data.data;
    },
    enabled: isLoggedIn(),
    refetchInterval: 30_000,
  });
}
