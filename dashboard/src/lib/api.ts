'use client';

import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('suprfly_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get('suprfly_refresh');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          Cookies.set('suprfly_token', data.data.accessToken);
          Cookies.set('suprfly_refresh', data.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(error.config);
        } catch {
          Cookies.remove('suprfly_token');
          Cookies.remove('suprfly_refresh');
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
