import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { CatalogPage } from './pages/CatalogPage';
import { ItemPage } from './pages/ItemPage';
import { LoginPage } from './pages/LoginPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';
import { setUnauthorizedHandler } from './api/client';

export default function App() {
  const { loadProfile, logout } = useAuthStore();

  useEffect(() => {
    // При старте подтягиваем профиль, если токен уже есть
    void loadProfile();
    // 401 из любого запроса разлогинивает
    setUnauthorizedHandler(() => logout());
  }, [loadProfile, logout]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="items/:id" element={<ItemPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="favorites"
            element={
              <PrivateRoute>
                <FavoritesPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
