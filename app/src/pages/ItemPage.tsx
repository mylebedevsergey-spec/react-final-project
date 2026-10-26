import { Link, useParams } from 'react-router-dom';
import { fetchItem } from '../api/items';
import { useRequest } from '../hooks/useRequest';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import { useFavoritesStore } from '../store/favoritesStore';
import styles from './ItemPage.module.css';

export function ItemPage() {
  // Динамический маршрут: параметр типизирован и проверяется на число
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);

  const { state, reload } = useRequest(
    () => (Number.isFinite(itemId) ? fetchItem(itemId) : Promise.reject(new Error('Некорректный идентификатор товара'))),
    [itemId],
  );
  const { has, toggle } = useFavoritesStore();

  return (
    <section>
      <Link to="/" className={styles.back}>← В каталог</Link>
      {state.status === 'loading' && <Loader />}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}
      {state.status === 'success' && (
        <article className={styles.card}>
          <span className={styles.category}>{state.data.category}</span>
          <h1>{state.data.title}</h1>
          <p className={styles.price}>{state.data.price.toLocaleString('ru-RU')} руб.</p>
          <p>{state.data.description}</p>
          <p className={styles.stock}>{state.data.in_stock ? 'В наличии' : 'Нет в наличии'}</p>
          <button type="button" className={styles.favorite} onClick={() => toggle(state.data.id)}>
            {has(state.data.id) ? '★ В избранном' : '☆ В избранное'}
          </button>
        </article>
      )}
    </section>
  );
}
