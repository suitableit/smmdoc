'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Fragment } from 'react';
import ServiceCard from './ServiceCard';

interface Service {
  id: string;
  name: string;
  rate: number;
  min_order: number;
  max_order: number;
  avg_time: string;
  description: string;
  category: {
    category_name: string;
    id: string;
  };
  isFavorite?: boolean;
}

interface ServiceGridProps {
  groupedServices: Record<string, Service[]>;
  loading: boolean;
  toggleFavorite: (serviceId: string) => void;
}

export default function ServiceGrid({ groupedServices, loading, toggleFavorite }: ServiceGridProps) {
  const renderSkeletonCards = () => {
    return Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="col-span-1">
        <div className="border rounded-md p-4 h-full">
          <Skeleton className="h-6 w-3/4 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {renderSkeletonCards()}
      </div>
    );
  }

  return (
    <Fragment>
      {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
        <div key={categoryName} className="mb-8">
          <div className="bg-purple-600 text-white font-medium py-2 px-4 rounded-md mb-4">
            {categoryName}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryServices.map((service) => (
              <div key={service.id} className="col-span-1">
                <ServiceCard 
                  service={service} 
                  toggleFavorite={toggleFavorite} 
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </Fragment>
  );
}