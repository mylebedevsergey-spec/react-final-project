import { api } from './client';
import type { Item } from '../types';

/** GET /items с фильтрами. Пустые значения не отправляем. */
export async function fetchItems(params: { category?: string; search?: string } = {}): Promise<Item[]> {
  const { data } = await api.get<Item[]>('/items', {
    params: {
      ...(params.category ? { category: params.category } : {}),
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return data;
}

/** GET /items/{id}, динамический маршрут. */
export async function fetchItem(id: number): Promise<Item> {
  const { data } = await api.get<Item>(`/items/${id}`);
  return data;
}
