import { fetcher } from '@/lib/utils';
import useSWR from 'swr';

// also fetch favorite categories
export const useGetFavCats = () => {
  const {
    data: favoriteCategories,
    error: favoriteError,
    isLoading: isLoadingFavorite,
  } = useSWR('/api/user/services/favorites', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
  });
  return {
    favoriteCategories,
    favoriteError,
    isLoadingFavorite,
  };
};
