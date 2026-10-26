import { fetchItems } from '../api/items';
import { useRequest } from '../hooks/useRequest';
import { useFavoritesStore } from '../store/favoritesStore';
import { ItemCard } from '../components/ItemCard';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';

/** Защищённый маршрут: доступен только авторизованному пользователю. */
export function FavoritesPage() {
  const ids = useFavoritesStore((state) => state.ids);
  const clear = useFavoritesStore((state) => state.clear);
  const { state, reload } = useRequest(() => fetchItems(), []);

  return (
    <section>
      <h1>Избранное</h1>
      <p style={{ color: '#6b7a70' }}>Список хранится в Zustand с persist в localStorage, доступен только после входа.</p>

      {state.status === 'loading' && <Loader />}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}
      {state.status === 'success' && (() => {
        const favorites = state.data.filter((item) => ids.includes(item.id));
        if (!favorites.length) {
          return <p style={{ padding: '20px 0', color: '#6b7a70' }}>Пока пусто: добавьте товары звёздочкой в каталоге.</p>;
        }
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 18 }}>
              {favorites.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
            <button type="button" onClick={clear} style={{ marginTop: 18, padding: '10px 18px', borderRadius: 999, border: '1px solid #e2e7dd', background: '#fff', fontWeight: 700 }}>
              Очистить избранное
            </button>
          </>
        );
      })()}
    </section>
  );
}
