/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaEye,
  FaHeart,
  FaInfinity,
  FaRegHeart,
  FaRegStar,
  FaSearch,
  FaStar,
  FaTimes
} from 'react-icons/fa';

import ServiceViewModal from '@/app/(protected)/services/serviceViewModal';
import { PriceDisplay } from '@/components/PriceDisplay';
import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

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
  refill?: boolean;
  cancel?: boolean;
  refillDays?: number;
  refillDisplay?: number;
}

const UserServiceTable: React.FC = () => {
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
  const [limit, setLimit] = useState('100'); // Load 100 services per page
  const [isShowAll, setIsShowAll] = useState(false); // Don't show all by default
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [favoriteServices, setFavoriteServices] = useState<Service[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showFavoritesFirst, setShowFavoritesFirst] = useState(true);
  const [totalServices, setTotalServices] = useState(0);
  const [displayLimit] = useState(50); // Services to show in favorites section

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

  // Optimized fetch function with pagination for better performance
  const fetchServices = React.useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const currentPage = isLoadMore ? page + 1 : page;
      const response = await fetch(
        `/api/user/services?page=${currentPage}&limit=all&search=${debouncedSearch}&showAll=true`,
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

        // Update pagination info
        setTotalPages(data.totalPages || 1);
        setTotalServices(data.total || 0);
        setHasMoreData(currentPage < (data.totalPages || 1));
        setIsShowAll(data.isShowAll || false);

        if (!user?.id) {
          const servicesData =
            data?.data?.map((service: Service) => ({
              ...service,
              isFavorite: false,
            })) || [];

          // For load more, append to existing services
          if (isLoadMore) {
            setServices(prev => [...prev, ...servicesData]);
            setPage(currentPage);
          } else {
            setServices(servicesData);
          }



          // Process services data for grouping
          const allServicesForGrouping = isLoadMore ? [...services, ...servicesData] : servicesData;
          processServicesData(allServicesForGrouping, data.allCategories || []);
          return;
        }

        // For logged-in users, fetch favorite status
        try {
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

          if (favResponse.ok) {
            const favData = await favResponse.json();
            const favoriteServiceIds = favData.favoriteServiceIds || [];

            const servicesWithFavorites = data?.data?.map((service: Service) => ({
              ...service,
              isFavorite: favoriteServiceIds.includes(service.id),
            })) || [];

            // For load more, append to existing services
            if (isLoadMore) {
              setServices(prev => [...prev, ...servicesWithFavorites]);
              setPage(currentPage);
            } else {
              setServices(servicesWithFavorites);
            }



            // Process services data for grouping
            const allServicesForGrouping = isLoadMore ? [...services, ...servicesWithFavorites] : servicesWithFavorites;
            processServicesData(allServicesForGrouping, data.allCategories || []);
          } else {
            throw new Error('Failed to fetch favorites');
          }
        } catch (favError) {
          console.error('Error fetching favorites:', favError);
          const servicesData = data?.data?.map((service: Service) => ({
            ...service,
            isFavorite: false,
          })) || [];

          // For load more, append to existing services
          if (isLoadMore) {
            setServices(prev => [...prev, ...servicesData]);
            setPage(currentPage);
          } else {
            setServices(servicesData);
          }



          // Process services data for grouping
          const allServicesForGrouping = isLoadMore ? [...services, ...servicesData] : servicesData;
          processServicesData(allServicesForGrouping, data.allCategories || []);
        }
    } catch (error) {
      console.error('Error fetching services:', error);
      showToast('Error fetching services. Please try again later.', 'error');
      if (!isLoadMore) {
        setServices([]);
        setGroupedServices({});

      }
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [debouncedSearch, user?.id, page, limit, services]);

  // Process services data for grouping and favorites
  const processServicesData = React.useCallback((servicesData: Service[], categoriesData: any[]) => {
    // Separate favorite services
    const favorites = servicesData.filter(service => service.isFavorite);
    setFavoriteServices(favorites);

    // Group services by category
    const groupedById: Record<string, { category: any; services: Service[] }> = {};

    // Initialize all active categories
    categoriesData
      .filter((category: any) => category.hideCategory !== 'yes')
      .forEach((category: any) => {
        const categoryKey = `${category.category_name}_${category.id}`;
        groupedById[categoryKey] = {
          category: category,
          services: []
        };
      });

    // Add services to their respective categories
    servicesData.forEach((service: Service) => {
      const categoryId = service.category?.id;
      const categoryName = service.category?.category_name || 'Uncategorized';
      const categoryKey = categoryId ? `${categoryName}_${categoryId}` : 'Uncategorized_0';

      if (!groupedById[categoryKey]) {
        groupedById[categoryKey] = {
          category: service.category || { id: 0, category_name: 'Uncategorized', hideCategory: 'no', position: 999 },
          services: []
        };
      }
      groupedById[categoryKey].services.push(service);
    });

    // Convert to the format expected by the UI and sort by position
    const grouped: Record<string, Service[]> = {};
    Object.values(groupedById)
      .sort((a, b) => (a.category.position || 999) - (b.category.position || 999))
      .forEach(({ category, services }) => {
        grouped[category.category_name] = services;
      });

    setGroupedServices(grouped);

    // Auto-expand categories with services
    const initialExpanded: Record<string, boolean> = {};
    Object.keys(grouped).forEach(categoryName => {
      initialExpanded[categoryName] = true; // Expand all categories by default
    });
    setExpandedCategories(initialExpanded);
  }, []);

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Initial load and search changes
  useEffect(() => {
    fetchServices(false);
  }, [debouncedSearch]);

  // Load more function
  const loadMoreServices = React.useCallback(() => {
    if (!isLoadingMore && hasMoreData && page < totalPages) {
      fetchServices(true);
    }
  }, [fetchServices, isLoadingMore, hasMoreData, page, totalPages]);

  // Handle limit change
  const handleLimitChange = (newLimit: string) => {
    setLimit(newLimit);
    setPage(1);
    setServices([]);
    setGroupedServices({});
    setHasMoreData(true);
  };

  // Handle pagination
  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
      setHasMoreData(true);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handleViewDetails = (service: Service) => {
    setSelected(service);
    setIsOpen(true);
  };

  const toggleFavorite = async (serviceId: number) => {
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

        // Update favorite services list
        setFavoriteServices((prevFavorites) => {
          if (currentService.isFavorite) {
            // Remove from favorites
            return prevFavorites.filter(service => service.id !== serviceId);
          } else {
            // Add to favorites
            const updatedService = { ...currentService, isFavorite: true };
            return [...prevFavorites, updatedService];
          }
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

              {/* Favorites Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFavoritesFirst(!showFavoritesFirst)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    showFavoritesFirst
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white border-transparent'
                      : 'bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {showFavoritesFirst ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
                  <span className="text-sm font-medium">Favorites First</span>
                </button>
              </div>

              {/* Show Per Page Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  Show:
                </span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="pl-4 pr-8 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm min-w-[120px]"
                >
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                  <option value="200">200 per page</option>
                  <option value="all">All Services</option>
                </select>
              </div>
            </div>
          </div>

          {/* Favorite Services Section */}
          {showFavoritesFirst && favoriteServices.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-700 overflow-hidden mb-6">
              {/* Favorite Services Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium py-4 px-6">
                <div className="flex items-center gap-3">
                  <FaHeart className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">
                    Your Favorite Services ({favoriteServices.length})
                  </h3>
                </div>
              </div>

              {/* Favorite Services Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/30">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Fav</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Service</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Rate per 1000</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Min order</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Max order</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Average time</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Refill</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Cancel</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/30">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {favoriteServices.slice(0, displayLimit).map((service) => (
                      <tr
                        key={`fav-${service.id}`}
                        className="border-b border-yellow-100 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 last:border-b-0"
                      >
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleFavorite(service.id)}
                            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded transition-colors duration-200"
                            title="Remove from favorites"
                          >
                            <FaHeart className="w-4 h-4 text-red-500" />
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
                          <div className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 w-fit">
                            {service?.serviceType?.name || 'Standard'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            <PriceDisplay amount={service.rate} originalCurrency={'USD'} />
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
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewDetails(service)}
                            className="flex items-center gap-2 px-3 py-1 text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 border border-yellow-600 dark:border-yellow-400 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-200"
                          >
                            <FaEye className="w-3 h-3" />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Services by Category */}
          {Object.keys(groupedServices).length > 0 ? (
            <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              {/* Table Headers - Always visible at top */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Fav
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Service
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Rate per 1000
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Min order
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Max order
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Average time
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Refill
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Cancel
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Categories and Services */}
                    {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
                      <React.Fragment key={categoryName}>
                        {/* Category Header Row */}
                        <tr>
                          <td colSpan={11} className="p-0">
                            <div
                              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium py-4 px-6 cursor-pointer hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 transition-all duration-200"
                              onClick={() => toggleCategory(categoryName)}
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                  {categoryName} ({categoryServices.length} services)
                                </h3>
                                <div className="flex items-center gap-2">
                                  {expandedCategories[categoryName] ? (
                                    <FaChevronUp className="w-4 h-4" />
                                  ) : (
                                    <FaChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Services for this Category */}
                        {expandedCategories[categoryName] && categoryServices.length > 0 && (
                            categoryServices.map((service) => (
                              <tr
                                key={service.id}
                                className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 last:border-b-0"
                              >
                                <td className="py-3 px-4">
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
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => handleViewDetails(service)}
                                    className="flex items-center gap-2 px-3 py-1 text-sm text-[var(--primary)] dark:text-[var(--secondary)] hover:text-[#4F0FD8] dark:hover:text-[#A121E8] border border-[var(--primary)] dark:border-[var(--secondary)] rounded hover:bg-[var(--primary)]/10 dark:hover:bg-[var(--secondary)]/10 transition-colors duration-200"
                                  >
                                    <FaEye className="w-3 h-3" />
                                    Details
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                          {expandedCategories[categoryName] && categoryServices.length === 0 && (
                            <tr>
                              <td colSpan={11} className="py-8 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                  <FaClipboardList className="text-4xl mb-2" />
                                  <p className="text-sm font-medium">No services in this category</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
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

          {/* Load More Button - Show when not showing all and has more data */}
          {!isShowAll && hasMoreData && (
            <div className="flex justify-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={loadMoreServices}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <GradientSpinner size="w-4 h-4" />
                    Loading more...
                  </>
                ) : (
                  <>
                    <FaInfinity className="w-4 h-4" />
                    Load More Services
                  </>
                )}
              </button>
            </div>
          )}

          {/* Traditional Pagination - Show when not showing all */}
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

          {/* Performance indicator */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {isShowAll ? (
                    <>
                      <FaInfinity className="w-4 h-4 text-blue-500" />
                      <span>Showing all <span className="font-medium">{totalServices}</span> services</span>
                    </>
                  ) : (
                    <>
                      <FaClipboardList className="w-4 h-4 text-blue-500" />
                      <span>Loaded <span className="font-medium">{services.length}</span> of <span className="font-medium">{totalServices}</span> services</span>
                    </>
                  )}
                </div>
                {favoriteServices.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FaHeart className="w-4 h-4 text-red-500" />
                    <span><span className="font-medium">{favoriteServices.length}</span> favorites</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaClipboardList className="w-4 h-4 text-green-500" />
                  <span><span className="font-medium">{Object.keys(groupedServices).length}</span> categories</span>
                </div>
                {hasMoreData && !isShowAll && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-orange-600 dark:text-orange-400">More available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
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
};

export default UserServiceTable;
