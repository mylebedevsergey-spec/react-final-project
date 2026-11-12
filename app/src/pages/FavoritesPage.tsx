import { fetchItems } from '../api/items';
import { useRequest } from '../hooks/useRequest';
import { useFavoritesStore } from '../store/favoritesStore';
import { ItemCard } from '../components/ItemCard';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import styles from './FavoritesPage.module.css';

/** Защищённый маршрут: доступен только авторизованному пользователю. */
export function FavoritesPage() {
  const ids = useFavoritesStore((state) => state.ids);
  const clear = useFavoritesStore((state) => state.clear);
  const { state, reload } = useRequest(() => fetchItems(), []);

  return (
    <section>
      <h1>Избранное</h1>
      <p className={styles.hint}>Список хранится в Zustand с persist в localStorage, доступен только после входа.</p>

      {state.status === 'loading' && <Loader />}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}
      {state.status === 'success' && (() => {
        const favorites = state.data.filter((item) => ids.includes(item.id));
        if (!favorites.length) {
          return <p className={styles.empty}>Пока пусто: добавьте товары звёздочкой в каталоге.</p>;
        }
        return (
          <>
            <div className={styles.grid}>
              {favorites.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
            <button type="button" onClick={clear} className={styles.clear}>
              Очистить избранное
            </button>
          </>
        );
      })()}
    </section>
  );
}
