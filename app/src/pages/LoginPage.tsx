import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from './LoginPage.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuthStore();

  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password123');
  const [touched, setTouched] = useState(false);

  const emailError = !EMAIL_RE.test(email) ? 'Введите корректный e-mail' : '';
  const passwordError = password.length < 4 ? 'Пароль не короче 4 символов' : '';
  const isValid = !emailError && !passwordError;

  const from = (location.state as { from?: string } | null)?.from ?? '/favorites';

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!isValid) return;
    const ok = await login(email, password);
    if (ok) navigate(from, { replace: true });
  }

  return (
    <section className={styles.wrap}>
      <h1>Вход</h1>
      <p className={styles.hint}>Демо-доступ: student@example.com / password123</p>

      <form onSubmit={onSubmit} className={styles.form} noValidate>
        <label className={styles.field}>
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(touched && emailError)}
          />
          {touched && emailError && <em className={styles.error}>{emailError}</em>}
        </label>

        <label className={styles.field}>
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(touched && passwordError)}
          />
          {touched && passwordError && <em className={styles.error}>{passwordError}</em>}
        </label>

        {error && <div className={styles.alert} role="alert">{error}</div>}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </section>
  );
}
