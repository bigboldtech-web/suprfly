'use client';

import Cookies from 'js-cookie';
import api from './api';
import type { User } from '@/types';

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  if (data.success) {
    Cookies.set('suprfly_token', data.data.accessToken, { expires: 1 });
    Cookies.set('suprfly_refresh', data.data.refreshToken, { expires: 30 });
    return data.data.user as User;
  }
  throw new Error(data.message || 'Login failed');
}

export async function register(email: string, password: string, name?: string) {
  const { data } = await api.post('/auth/register', { email, password, name });
  if (data.success) {
    Cookies.set('suprfly_token', data.data.accessToken, { expires: 1 });
    Cookies.set('suprfly_refresh', data.data.refreshToken, { expires: 30 });
    return data.data.user as User;
  }
  throw new Error(data.message || 'Registration failed');
}

export async function logout() {
  const refreshToken = Cookies.get('suprfly_refresh');
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch {}
  Cookies.remove('suprfly_token');
  Cookies.remove('suprfly_refresh');
}

export function getToken() {
  return Cookies.get('suprfly_token');
}

export function isLoggedIn() {
  return !!Cookies.get('suprfly_token');
}
