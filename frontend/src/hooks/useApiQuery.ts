import { useCallback, useEffect, useState } from "react";

export interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  reload: () => void;
}

/**
 * Простой хук для GET-запросов: грузит данные при монтировании и по reload().
 * Заменяет тяжёлые data-библиотеки для небольшого объёма экранов.
 *
 * @param fetcher функция, возвращающая { data, error } по контракту.
 * @param deps зависимости, при изменении которых запрос повторяется.
 */
export function useApiQuery<T>(
  fetcher: () => Promise<{ data: T | undefined; error: string | undefined }>,
  deps: unknown[] = [],
): QueryState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const run = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await fetcher();
    if (result.error) {
      setError(result.error);
      setData(undefined);
    } else {
      setData(result.data);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      setError(undefined);
      const result = await fetcher();
      if (!active) return;
      if (result.error) {
        setError(result.error);
        setData(undefined);
      } else {
        setData(result.data);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: run };
}
