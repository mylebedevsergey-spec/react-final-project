import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import styles from './Layout.module.css';

export function Layout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const favoritesCount = useFavoritesStore((state) => state.ids.length);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 20C4 11 10 5 20 4c0 9-6 16-16 16Z" fill="#2f7d4f"/><path d="M6 18C9 13 13 9 18 6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/></svg>
          Сад и Огород
        </Link>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
            Каталог
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
            Избранное ({favoritesCount})
          </NavLink>
        </nav>
        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <span className={styles.user}>{user?.full_name ?? user?.email}</span>
              <button type="button" className={styles.logout} onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.login}>Войти</Link>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        Учебный проект: React + TypeScript + FastAPI · JWT, Zustand, Axios, React Router
      </footer>
    </div>
  );
}
