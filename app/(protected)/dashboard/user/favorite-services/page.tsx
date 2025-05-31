import FavoriteServices from '@/components/user/services/favorite-services';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favorite Services',
  description: 'View your favorite services',
};

export default function FavoriteServicesPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-2xl font-bold">Favorite Services</h1>
        <p className="text-gray-500">
          View and manage your favorite services
        </p>
      </div>
      
      <FavoriteServices />
    </div>
  );
} 