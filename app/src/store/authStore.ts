import { create } from 'zustand';
import { hasToken, logout as clearToken } from '../api/auth';
import { fetchMe, login as loginRequest } from '../api/auth';
import type { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loadProfile: () => Promise<void>;
  logout: () => void;
}

/** Хранилище авторизации: токен в localStorage, профиль в памяти. */
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: hasToken(),
  user: null,
  error: null,
  loading: false,

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      await loginRequest({ email, password });
      const user = await fetchMe();
      set({ isAuthenticated: true, user, loading: false });
      return true;
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Не удалось войти',
      });
      return false;
    }
  },

  async loadProfile() {
    if (!hasToken()) return;
    try {
      const user = await fetchMe();
      set({ user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  logout() {
    clearToken();
    set({ isAuthenticated: false, user: null, error: null });
  },
}));
