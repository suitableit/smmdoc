/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import ServiceViewModal from '@/components/admin/services/serviceViewModal';
import { PriceDisplay } from '@/components/PriceDisplay';
import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import { Fragment, useEffect, useState } from 'react';
import { 
  FaSearch, 
  FaStar, 
  FaEye, 
  FaSpinner, 
  FaExclamationTriangle,
  FaCheckCircle, 
  FaTimes,
  FaHeart
} from 'react-icons/fa';

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
    type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
    type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
    type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
    'bg-yellow-50 border-yellow-200 text-yellow-800'
  }`}>
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

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

export default function FavoriteServices() {
  const user = useCurrentUser();
  const [services, setServices] = useState<Service[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [groupedServices, setGroupedServices] = useState<Record<string, Service[]>>({});
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);

  const limit = 50;

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Favorite Services — ${APP_NAME}`;
  }, []);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'pending' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchFavoriteServices = async () => {
      setLoading(true);
      try {
        if (!user?.id) {
          showToast('You need to be logged in to view favorite services', 'error');
          setLoading(false);
          return;
        }

        // Fetch favorite services
        const response = await fetch(
          `/api/user/services/favorites?userId=${user.id}&page=${page}&limit=${limit}&search=${debouncedSearch}`,
          {
            method: 'GET',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch favorite services: ${response.statusText}`);
        }

        const data = await response.json();
        
        // All services from favorites endpoint are already marked as favorites
        const favoriteServices = data?.data?.map((service: Service) => ({
          ...service,
          isFavorite: true,
        })) || [];
        
        setServices(favoriteServices);
        
        // Group services by category
        const grouped = favoriteServices.reduce((acc: Record<string, Service[]>, service: Service) => {
          const categoryName = service.category?.category_name || 'Uncategorized';
          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push(service);
          return acc;
        }, {});
        
        setGroupedServices(grouped);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching favorite services:', error);
        showToast('Error fetching favorite services. Please try again later.', 'error');
        setServices([]);
        setGroupedServices({});
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteServices();
  }, [page, debouncedSearch, user?.id, limit]);

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const toggleFavorite = async (serviceId: string) => {
    if (!user?.id) {
      showToast('You need to be logged in to favorite services', 'error');
      return;
    }

    try {
      const response = await fetch('/api/user/services/servicefav', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store',
        body: JSON.stringify({
          serviceId,
          userId: user.id,
          action: 'remove', // Always remove since we're in favorites page
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the service from the list
        setServices((prevServices) => 
          prevServices.filter((service) => service.id !== serviceId)
        );
        
        // Remove from grouped services as well
        setGroupedServices((prevGrouped) => {
          const newGrouped = { ...prevGrouped };
          Object.keys(newGrouped).forEach((categoryName) => {
            newGrouped[categoryName] = newGrouped[categoryName].filter(
              (service) => service.id !== serviceId
            );
            // Remove empty categories
            if (newGrouped[categoryName].length === 0) {
              delete newGrouped[categoryName];
            }
          });
          return newGrouped;
        });
        
        showToast(data.message || 'Service removed from favorites', 'success');
      } else {
        throw new Error(data.error || 'Failed to update favorite status');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'An error occurred', 'error');
    }
  };

  const handleViewDetails = (service: Service) => {
    setSelected(service);
    setIsOpen(true);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card card-padding">
            <div className="text-center py-8 flex flex-col items-center">
              <FaSpinner className="text-4xl text-blue-500 mb-4 animate-spin" />
              <div className="text-lg font-medium">Loading favorite services...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Toast Container */}
      {toastMessage && (
        <Toast 
          message={toastMessage.message} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
        />
      )}
      
      <div className="page-content">
        {/* Favorite Services Content Card - Everything in one box */}
        <div className="card card-padding">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="form-group mb-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="search"
                  placeholder="Search favorite services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-10"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Favorite Services */}
          {Object.keys(groupedServices).length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center">
              <FaHeart className="text-4xl text-gray-400 mb-4" />
              <div className="text-lg font-medium">No favorite services yet</div>
              <div className="text-sm text-gray-500">Start adding services to your favorites to see them here</div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 first:rounded-tl-lg">Fav</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rate per 1000</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Min order</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Max order</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Average time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 last:rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
                    <Fragment key={categoryName}>
                      {/* Category Row */}
                      <tr>
                        <td colSpan={8} className="py-0">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium py-3 px-6 shadow-lg">
                            <h3 className="text-lg font-semibold">{categoryName}</h3>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Category Services */}
                      {categoryServices.map((service, index) => {
                        const isLastInCategory = index === categoryServices.length - 1;
                        const isLastCategory = Object.keys(groupedServices).indexOf(categoryName) === Object.keys(groupedServices).length - 1;
                        const isLastRow = isLastInCategory && isLastCategory;
                        
                        return (
                          <tr key={service.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isLastRow ? 'last:border-b-0' : ''}`}>
                            <td className={`py-3 px-4 ${isLastRow ? 'first:rounded-bl-lg' : ''}`}>
                              <button
                                onClick={() => toggleFavorite(service.id)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                                title="Remove from favorites"
                              >
                                <FaStar className="w-4 h-4 text-yellow-500" />
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-mono text-gray-700">{service.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{service.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-900">
                                <PriceDisplay amount={service.rate} originalCurrency={'USD'} />
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700">{service.min_order?.toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700">{service.max_order?.toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700">{service.avg_time || 'N/A'}</span>
                            </td>
                            <td className={`py-3 px-4 ${isLastRow ? 'last:rounded-br-lg' : ''}`}>
                              <button
                                onClick={() => handleViewDetails(service)}
                                className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50 transition-colors duration-200"
                              >
                                <FaEye className="w-3 h-3" />
                                Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Details Modal */}
      {isOpen && selected && (
        <ServiceViewModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          service={selected}
        />
      )}
    </div>
  );
}