import { fetcher } from '@/lib/utils';
import useSWR from 'swr';

export const useGetServices = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/admin/services',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );
  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
