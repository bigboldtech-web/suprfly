'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { isLoggedIn } from '@/lib/auth';

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
      return data.data;
    },
    enabled: isLoggedIn(),
    staleTime: 5 * 60 * 1000,
  });
}
