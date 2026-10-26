import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Защищённый маршрут: проверяет токен при прямом переходе по адресу,
 * а не только скрывает ссылку в меню.
 */
export function PrivateRoute({ children }: { children: ReactElement }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
