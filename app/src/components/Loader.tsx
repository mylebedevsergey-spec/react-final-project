import styles from './Loader.module.css';

export function Loader({ label = 'Загружаем…' }: { label?: string }) {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      {label}
    </div>
  );
}
