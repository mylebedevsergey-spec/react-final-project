import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchItems } from '../api/items';
import { useRequest } from '../hooks/useRequest';
import { ItemCard } from '../components/ItemCard';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import styles from './CatalogPage.module.css';

const CATEGORIES = ['Все', 'Инструменты', 'Растения', 'Кашпо', 'Уход'];

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const [search, setSearch] = useState(params.get('search') ?? '');

  const { state, reload } = useRequest(() => fetchItems({ category, search: params.get('search') ?? '' }), [category, params.get('search')]);

  return (
    <section>
      <h1>Каталог</h1>
      <p className={styles.lead}>Инструменты, растения, кашпо и уход. Данные приходят с FastAPI-бэкенда.</p>

      <div className={styles.filters}>
        {CATEGORIES.map((item) => {
          const value = item === 'Все' ? '' : item;
          const isActive = (category || 'Все') === item;
          return (
            <button
              key={item}
              type="button"
              className={isActive ? styles.chipActive : styles.chip}
              onClick={() => {
                const next = new URLSearchParams(params);
                if (value) next.set('category', value);
                else next.delete('category');
                setParams(next);
              }}
            >
              {item}
            </button>
          );
        })}
        <form
          className={styles.search}
          onSubmit={(event) => {
            event.preventDefault();
            const next = new URLSearchParams(params);
            if (search.trim()) next.set('search', search.trim());
            else next.delete('search');
            setParams(next);
          }}
        >
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по каталогу" aria-label="Поиск по каталогу" />
          <button type="submit">Найти</button>
        </form>
      </div>

      {state.status === 'loading' && <Loader />}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}
      {state.status === 'success' && (
        state.data.length ? (
          <div className={styles.grid}>
            {state.data.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p className={styles.empty}>Ничего не нашлось. Попробуйте другой запрос.</p>
        )
      )}
    </section>
  );
}
