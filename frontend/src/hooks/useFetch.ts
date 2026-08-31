import { useEffect, useState } from 'react';

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadData = async () => {
      
      if (cancelled) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const result = (await response.json()) as T;

        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (cancelled || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }

        setError('Could not load data. Please try again.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
}

export default useFetch;