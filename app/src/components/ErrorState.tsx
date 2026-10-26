export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" style={{ padding: 20, borderRadius: 14, background: 'rgba(192,68,47,.10)', color: '#c0442f' }}>
      <strong>Не удалось загрузить данные.</strong>
      <p style={{ margin: '6px 0 0' }}>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} style={{ marginTop: 12, padding: '9px 16px', borderRadius: 999, border: 0, background: '#c0442f', color: '#fff', fontWeight: 700 }}>
          Повторить
        </button>
      )}
    </div>
  );
}
