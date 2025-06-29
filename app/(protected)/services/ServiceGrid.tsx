'use client';

import { GradientSpinner } from '@/components/ui/GradientSpinner';
import { Fragment } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import ServiceCard from '../../../app/(protected)/services/ServiceCard';

interface Service {
  id: number;
  name: string;
  rate: number;
  min_order: number;
  max_order: number;
  avg_time: string;
  description: string;
  category: {
    category_name: string;
    id: number;
  };
  isFavorite?: boolean;
}

interface ServiceGridProps {
  groupedServices: Record<string, Service[]>;
  loading: boolean;
  toggleFavorite: (serviceId: string) => void;
}

export default function ServiceGrid({
  groupedServices,
  loading,
  toggleFavorite,
}: ServiceGridProps) {
  const renderSkeletonCards = () => {
    return Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="card h-full">
        <div className="p-6">
          {/* Title skeleton */}
          <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>

          {/* Details skeleton */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-14 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="space-y-2 mb-4">
            <div className="w-full h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-full h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Button skeleton */}
        <div className="p-6 pt-0 border-t border-gray-100">
          <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Services</h1>
            <p className="page-description">
              Browse and manage available services
            </p>
          </div>

          <div className="card card-padding mb-6">
            <div className="text-center py-8 flex flex-col items-center">
              <GradientSpinner size="w-16 h-16" className="mb-4" />
              <div className="text-lg font-medium">Loading services...</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderSkeletonCards()}
          </div>
        </div>
      </div>
    );
  }

  // Check if there are any services
  const hasServices = Object.keys(groupedServices).length > 0;

  if (!hasServices) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Services</h1>
            <p className="page-description">
              Browse and manage available services
            </p>
          </div>

          <div className="card card-padding">
            <div className="text-center py-8 flex flex-col items-center">
              <FaClipboardList className="text-4xl text-gray-400 mb-4" />
              <div className="text-lg font-medium">No services found</div>
              <div className="text-sm text-gray-500">
                Try adjusting your search criteria
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Services</h1>
          <p className="page-description">
            Browse and manage available services
          </p>
        </div>

        {/* Services by Category */}
        <Fragment>
          {Object.entries(groupedServices).map(
            ([categoryName, categoryServices]) => (
              <div key={categoryName} className="mb-8">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg mb-6">
                  <h3 className="text-lg font-bold">{categoryName}</h3>
                  <p className="text-sm opacity-90">
                    {categoryServices.length} service
                    {categoryServices.length !== 1 ? 's' : ''} available
                  </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            )
          )}
        </Fragment>
      </div>
    </div>
  );
}
