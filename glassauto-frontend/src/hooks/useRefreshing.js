import { useCallback, useState } from 'react';
import { useHrData } from './useHrData';

export const useRefreshing = () => {
  const { refresh } = useHrData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refresh(), new Promise((resolve) => setTimeout(resolve, 600))]);
    setRefreshing(false);
  }, [refresh]);

  return { refreshing, onRefresh };
};