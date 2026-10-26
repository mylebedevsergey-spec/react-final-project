import { useCallback, useEffect, useState } from 'react';
import type { AsyncState } from '../types';

/**
 * Универсальный хук: loading / error / data.
 * Возвращает состояние-объединение и функцию перезагрузки.
 */
export function useRequest<T>(request: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  const run = useCallback(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    request()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ status: 'error', error: error instanceof Error ? error.message : 'Неизвестная ошибка' });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  useEffect(run, [run]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { state, reload };
}
