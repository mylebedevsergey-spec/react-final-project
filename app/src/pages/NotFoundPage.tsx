import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.text}>Такой страницы нет, возможно, ссылка устарела.</p>
      <Link to="/" className={styles.link}>Вернуться в каталог</Link>
    </section>
  );
}
