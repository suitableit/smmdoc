/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import ServiceViewModal from '@/app/(protected)/services/serviceViewModal';
import { PriceDisplay } from '@/components/PriceDisplay';
import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import { Fragment, useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaClipboardList,
  FaEye,
  FaRegStar,
  FaSearch,
  FaStar,
  FaTimes,
} from 'react-icons/fa';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Toast Component
const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
      type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : type === 'info'
        ? 'bg-blue-50 border-blue-200 text-blue-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}
  >
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
  serviceType?: {
    id: string;
    name: string;
  };
  isFavorite?: boolean;
}

export default function UserServiceTable() {
  const user = useCurrentUser();
  const [services, setServices] = useState<Service[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [groupedServices, setGroupedServices] = useState<
    Record<string, Service[]>
  >({});
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [limit, setLimit] = useState('50');
  const [isShowAll, setIsShowAll] = useState(false);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `All Services — ${APP_NAME}`;
  }, []);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
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
    const fetchServices = async () => {
      setLoading(true);
      try {
        // First fetch the services
        const response = await fetch(
          `/api/user/services?page=${page}&limit=${limit}&search=${debouncedSearch}`,
          {
            method: 'GET',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.statusText}`);
        }

        const data = await response.json();

        if (!user?.id) {
          const servicesData =
            data?.data?.map((service: Service) => ({
              ...service,
              isFavorite: false,
            })) || [];

          setServices(servicesData);

          // Group services by category ID to handle duplicate names
          const groupedById: Record<string, { category: any; services: Service[] }> = {};

          // First, initialize all categories if available
          if (data.allCategories && data.allCategories.length > 0) {
            data.allCategories.forEach((category: any) => {
              const categoryKey = `${category.category_name}_${category.id}`;
              groupedById[categoryKey] = {
                category: category,
                services: []
              };
            });
          }

          // Then add services to their respective categories
          servicesData.forEach((service: Service) => {
            const categoryId = service.category?.id;
            const categoryName = service.category?.category_name || 'Uncategorized';
            const categoryKey = categoryId ? `${categoryName}_${categoryId}` : 'Uncategorized_0';

            if (!groupedById[categoryKey]) {
              groupedById[categoryKey] = {
                category: service.category || { id: 0, category_name: 'Uncategorized' },
                services: []
              };
            }
            groupedById[categoryKey].services.push(service);
          });

          // Convert to the format expected by the UI
          const grouped: Record<string, Service[]> = {};
          Object.values(groupedById).forEach(({ category, services }) => {
            grouped[category.category_name] = services;
          });

          setGroupedServices(grouped);
          setTotalPages(data.totalPages || 1);
          setIsShowAll(data.isShowAll || false);
          setAllCategories(data.allCategories || []);
          return;
        }

        try {
          // Then fetch favorite status
          const favResponse = await fetch(
            `/api/user/services/favorite-status?userId=${user.id}`,
            {
              method: 'GET',
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache',
              },
            }
          );

          if (!favResponse.ok) {
            throw new Error(
              `Failed to fetch favorites: ${favResponse.statusText}`
            );
          }

          const favData = await favResponse.json();
          const favoriteServiceIds = favData.favoriteServiceIds || [];

          // Merge favorite status with services
          const servicesWithFavorites =
            data?.data?.map((service: Service) => ({
              ...service,
              isFavorite: favoriteServiceIds.includes(service.id),
            })) || [];

          setServices(servicesWithFavorites);

          // Group services by category ID to handle duplicate names
          const groupedById: Record<string, { category: any; services: Service[] }> = {};

          // First, initialize all categories if available
          if (data.allCategories && data.allCategories.length > 0) {
            data.allCategories.forEach((category: any) => {
              const categoryKey = `${category.category_name}_${category.id}`;
              groupedById[categoryKey] = {
                category: category,
                services: []
              };
            });
          }

          // Then add services to their respective categories
          servicesWithFavorites.forEach((service: Service) => {
            const categoryId = service.category?.id;
            const categoryName = service.category?.category_name || 'Uncategorized';
            const categoryKey = categoryId ? `${categoryName}_${categoryId}` : 'Uncategorized_0';

            if (!groupedById[categoryKey]) {
              groupedById[categoryKey] = {
                category: service.category || { id: 0, category_name: 'Uncategorized' },
                services: []
              };
            }
            groupedById[categoryKey].services.push(service);
          });

          // Convert to the format expected by the UI
          const grouped: Record<string, Service[]> = {};
          Object.values(groupedById).forEach(({ category, services }) => {
            grouped[category.category_name] = services;
          });

          setGroupedServices(grouped);
        } catch (favError) {
          console.error('Error fetching favorites:', favError);
          // If favorite fetch fails, still show services without favorites
          const servicesData =
            data?.data?.map((service: Service) => ({
              ...service,
              isFavorite: false,
            })) || [];

          setServices(servicesData);

          // Group services by category ID to handle duplicate names
          const groupedById: Record<string, { category: any; services: Service[] }> = {};

          // First, initialize all categories if available
          if (data.allCategories && data.allCategories.length > 0) {
            data.allCategories.forEach((category: any) => {
              const categoryKey = `${category.category_name}_${category.id}`;
              groupedById[categoryKey] = {
                category: category,
                services: []
              };
            });
          }

          // Then add services to their respective categories
          servicesData.forEach((service: Service) => {
            const categoryId = service.category?.id;
            const categoryName = service.category?.category_name || 'Uncategorized';
            const categoryKey = categoryId ? `${categoryName}_${categoryId}` : 'Uncategorized_0';

            if (!groupedById[categoryKey]) {
              groupedById[categoryKey] = {
                category: service.category || { id: 0, category_name: 'Uncategorized' },
                services: []
              };
            }
            groupedById[categoryKey].services.push(service);
          });

          // Convert to the format expected by the UI
          const grouped: Record<string, Service[]> = {};
          Object.values(groupedById).forEach(({ category, services }) => {
            grouped[category.category_name] = services;
          });

          setGroupedServices(grouped);
        }

        setTotalPages(data.totalPages || 1);
        setIsShowAll(data.isShowAll || false);
        setAllCategories(data.allCategories || []);

        // Update grouped services to include empty categories
        if (data.allCategories && data.allCategories.length > 0) {
          const servicesData = data?.data || [];

          // Group services by category ID to handle duplicate names
          const groupedById: Record<string, { category: any; services: Service[] }> = {};

          // First, initialize all categories
          data.allCategories.forEach((category: any) => {
            groupedById[category.id] = {
              category: category,
              services: []
            };
          });

          // Then add services to their respective categories
          servicesData.forEach((service: Service) => {
            const categoryId = service.category?.id?.toString() || 'uncategorized';
            if (groupedById[categoryId]) {
              groupedById[categoryId].services.push(service);
            } else {
              // Handle uncategorized services
              if (!groupedById['uncategorized']) {
                groupedById['uncategorized'] = {
                  category: { id: 'uncategorized', category_name: 'Uncategorized' },
                  services: []
                };
              }
              groupedById['uncategorized'].services.push(service);
            }
          });

          // Convert to the format expected by the UI (category name as key)
          const grouped: Record<string, Service[]> = {};
          Object.values(groupedById).forEach(({ category, services }) => {
            const displayName = `${category.category_name} (ID: ${category.id})`;
            grouped[displayName] = services;
          });

          setGroupedServices(grouped);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        showToast('Error fetching services. Please try again later.', 'error');
        setServices([]);
        setGroupedServices({});
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [page, debouncedSearch, user?.id, limit]);

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleLimitChange = (newLimit: string) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const toggleFavorite = async (serviceId: string) => {
    if (!user?.id) {
      showToast('You need to be logged in to favorite services', 'error');
      return;
    }

    try {
      // Find the current service to get the current favorite status
      const currentService = services.find(
        (service) => service.id === serviceId
      );
      if (!currentService) return;

      const response = await fetch('/api/user/services/servicefav', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
        body: JSON.stringify({
          serviceId,
          userId: user.id,
          action: currentService.isFavorite ? 'remove' : 'add', // Explicit action
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === serviceId
              ? { ...service, isFavorite: !service.isFavorite }
              : service
          )
        );

        // Update grouped services as well
        setGroupedServices((prevGrouped) => {
          const newGrouped = { ...prevGrouped };
          Object.keys(newGrouped).forEach((categoryName) => {
            newGrouped[categoryName] = newGrouped[categoryName].map((service) =>
              service.id === serviceId
                ? { ...service, isFavorite: !service.isFavorite }
                : service
            );
          });
          return newGrouped;
        });

        showToast(data.message, 'success');
      } else {
        throw new Error(data.error || 'Failed to update favorite status');
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'An error occurred',
        'error'
      );
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
          <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
            <div className="text-center py-8 flex flex-col items-center">
              <GradientSpinner size="w-14 h-14" className="mb-4" />
              <div className="text-lg font-medium">Loading services...</div>
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
        {/* All Services Content Card - Everything in one box */}
        <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
          {/* Search Bar and Controls */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="form-group mb-0">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="search"
                      placeholder="Search services..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              {/* Show Per Page Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  Show:
                </span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="pl-4 pr-8 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm min-w-[80px]"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services by Category */}
          {Object.keys(groupedServices).length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white first:rounded-tl-lg">
                      Fav
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Service
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Rate per 1000
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Min order
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Max order
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Average time
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Refill
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Cancel
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white last:rounded-tr-lg">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedServices).map(
                    ([categoryName, categoryServices]) => (
                      <Fragment key={categoryName}>
                        {/* Category Row */}
                        <tr>
                          <td colSpan={11} className="py-0">
                            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium py-3 px-6 shadow-lg">
                              <h3 className="text-lg font-semibold">
                                {categoryName}
                              </h3>
                            </div>
                          </td>
                        </tr>

                        {/* Category Services */}
                        {categoryServices.map((service, index) => {
                          const isLastInCategory =
                            index === categoryServices.length - 1;
                          const isLastCategory =
                            Object.keys(groupedServices).indexOf(
                              categoryName
                            ) ===
                            Object.keys(groupedServices).length - 1;
                          const isLastRow = isLastInCategory && isLastCategory;

                          return (
                            <tr
                              key={service.id}
                              className={`border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                                isLastRow ? 'last:border-b-0' : ''
                              }`}
                            >
                              <td
                                className={`py-3 px-4 ${
                                  isLastRow ? 'first:rounded-bl-lg' : ''
                                }`}
                              >
                                <button
                                  onClick={() => toggleFavorite(service.id)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                                  title={
                                    service.isFavorite
                                      ? 'Remove from favorites'
                                      : 'Add to favorites'
                                  }
                                >
                                  {service.isFavorite ? (
                                    <FaStar className="w-4 h-4 text-yellow-500" />
                                  ) : (
                                    <FaRegStar className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                                  )}
                                </button>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                  {service.id}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {service.name}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 w-fit">
                                  {service?.serviceType?.name || 'Standard'}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  <PriceDisplay
                                    amount={service.rate}
                                    originalCurrency={'USD'}
                                  />
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {formatNumber(service.min_order || 0)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {formatNumber(service.max_order || 0)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {service.avg_time || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-center gap-1">
                                    {service.refill ? (
                                      <>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-green-600 font-medium">ON</span>
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="text-xs text-red-600 font-medium">OFF</span>
                                      </>
                                    )}
                                  </div>

                                  {/* Show Refill Details when refill is enabled */}
                                  {service.refill && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                                      {service.refillDays && (
                                        <div>Days: {service.refillDays}</div>
                                      )}
                                      {service.refillDisplay && (
                                        <div>Hours: {service.refillDisplay}</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {service.cancel ? (
                                    <>
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-xs text-green-600 font-medium">ON</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                      <span className="text-xs text-red-600 font-medium">OFF</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td
                                className={`py-3 px-4 ${
                                  isLastRow ? 'last:rounded-br-lg' : ''
                                }`}
                              >
                                <button
                                  onClick={() => handleViewDetails(service)}
                                  className="flex items-center gap-2 px-3 py-1 text-sm text-[var(--primary)] dark:text-[var(--secondary)] hover:text-[#4F0FD8] dark:hover:text-[#A121E8] border border-[var(--primary)] dark:border-[var(--secondary)] rounded hover:bg-[var(--primary)]/10 dark:hover:bg-[var(--secondary)]/10 transition-colors duration-200"
                                >
                                  <FaEye className="w-3 h-3" />
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </Fragment>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center">
              <FaClipboardList className="text-4xl text-gray-400 dark:text-gray-500 mb-4" />
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                No services found
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria
              </div>
            </div>
          )}

          {/* Pagination - Hide when showing all */}
          {!isShowAll && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Show total count when displaying all */}
          {isShowAll && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Showing all <span className="font-medium">{services.length}</span> services
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
