import FavoriteServices from '@/components/user/services/favorite-services';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favorite Services',
  description: 'View your favorite services',
};

export default function FavoriteServicesPage() {
  return (
      <FavoriteServices />
  );
} 