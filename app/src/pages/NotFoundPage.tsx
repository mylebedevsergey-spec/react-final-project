import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section style={{ textAlign: 'center', padding: '60px 0' }}>
      <h1 style={{ fontSize: 64, margin: 0 }}>404</h1>
      <p style={{ color: '#6b7a70' }}>Такой страницы нет, возможно, ссылка устарела.</p>
      <Link to="/" style={{ color: '#2f7d4f', fontWeight: 700 }}>Вернуться в каталог</Link>
    </section>
  );
}
