import { useEffect, useState } from 'react';
import showToastApp from '@app-components/CustomToast/ShowToastApp';
import useCallAPI from './useCallAPI';

const buildQueryString = (params: Record<string, any>) => {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
};

export const useLoadMoreAPI = (url: string, limit: number, extraParams: any = {}, token?: string) => {
  const [dataLoadMore, setDataLoadMore] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (loading || !hasMore) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = { page, limit, ...extraParams };
      const queryStringParams = buildQueryString(params);
      const response = await useCallAPI({
        method: 'GET',
        url: queryStringParams ? `${url}?${queryStringParams}` : url,
        token,
      });

      const newItems = response?.data || response?.result?.data || [];

      if (newItems.length < limit) {
        setHasMore(false);
      }

      setDataLoadMore(prevData => [...prevData, ...newItems]);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      setError('Error loading data');
      showToastApp({
        type: 'error',
        title: 'Error loading data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { dataLoadMore, loading, hasMore, error, fetchData, page };
};
