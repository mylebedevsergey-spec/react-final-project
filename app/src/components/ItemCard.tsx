import { Link } from 'react-router-dom';
import type { Item } from '../types';
import { useFavoritesStore } from '../store/favoritesStore';
import styles from './ItemCard.module.css';

export function ItemCard({ item }: { item: Item }) {
  const { has, toggle } = useFavoritesStore();
  const isFavorite = has(item.id);

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.category}>{item.category}</span>
        <button
          type="button"
          className={isFavorite ? styles.favoriteActive : styles.favorite}
          onClick={() => toggle(item.id)}
          aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
      <h3 className={styles.title}>
        <Link to={`/items/${item.id}`}>{item.title}</Link>
      </h3>
      <p className={styles.description}>{item.description}</p>
      <div className={styles.bottom}>
        <strong>{item.price.toLocaleString('ru-RU')} руб.</strong>
        <span className={item.in_stock ? styles.inStock : styles.outOfStock}>
          {item.in_stock ? 'в наличии' : 'нет в наличии'}
        </span>
      </div>
    </article>
  );
}
