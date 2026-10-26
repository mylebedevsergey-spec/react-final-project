import { api, TOKEN_KEY } from './client';
import type { LoginPayload, TokenResponse, User } from '../types';

/** POST /auth/login: сохраняем токен, чтобы interceptor его подхватил. */
export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/login', payload);
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}
