import styles from './ErrorState.module.css';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.error} role="alert">
      <strong>Не удалось загрузить данные.</strong>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}
