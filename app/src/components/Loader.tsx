export function Loader({ label = 'Загружаем…' }: { label?: string }) {
  return <div role="status" aria-live="polite" style={{ padding: '40px 0', textAlign: 'center', color: '#6b7a70' }}>{label}</div>;
}
