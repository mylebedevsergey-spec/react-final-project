

import axios, { AxiosError } from 'axios';

export const TOKEN_KEY = 'garden-shop-token';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Колбэк, который вызывает App при истечении токена. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      onUnauthorized?.();
    }
    const detail = error.response?.data?.detail;
    return Promise.reject(new Error(detail || error.message || 'Ошибка сети'));
  },
);
