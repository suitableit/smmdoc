'use client';

import React, { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaEye,
  FaHeart,
  FaRegHeart,
  FaRegStar,
  FaSearch,
  FaStar,
  FaTimes
} from 'react-icons/fa';

import ServiceViewModal from '@/app/(protected)/services/serviceViewModal';
import { PriceDisplay } from '@/components/PriceDisplay';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
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

const FavoriteServicesTable: React.FC = () => {
  const user = useCurrentUser();
  const { appName } = useAppNameWithFallback();
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
  const [limit, setLimit] = useState('10'); // Load 10 categories per page
  const [hasMoreData, setHasMoreData] = useState(true);
  const [favoriteServices, setFavoriteServices] = useState<Service[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const [totalServices, setTotalServices] = useState(0);
  const [displayLimit] = useState(50); // Services to show in favorites section

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Favorite Services', appName);
  }, [appName]);

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

    // Set loading state when search changes
    if (search.trim()) {
      setIsSearchLoading(true);
    } else {
      setIsSearchLoading(false);
    }

    return () => clearTimeout(timer);
  }, [search]);

  // Optimized fetch function with pagination for better performance
  const fetchServices = React.useCallback(async () => {
    // Only show full loading on initial load, not during search
    if (!debouncedSearch && page === 1) {
      setLoading(true);
    }

    try {
      if (!user?.id) {
        showToast(
          'You need to be logged in to view favorite services',
          'error'
        );
        setLoading(false);
        return;
      }

      const currentLimit = limit === 'all' ? '500' : limit; // Limit to 500 instead of 'all' to prevent memory issues

      const searchParams = new URLSearchParams({
        userId: user.id,
        page: page.toString(),
        limit: currentLimit,
        ...(debouncedSearch.trim() && { search: encodeURIComponent(debouncedSearch.trim()) })
      });

      const response = await fetch(
        `/api/user/services/favorites?${searchParams.toString()}`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch favorite services: ${response.statusText}`);
      }

      const data = await response.json();

      // Update pagination info
      setTotalPages(data.totalPages || 1);
      setTotalServices(data.total || 0);
      setHasMoreData(page < (data.totalPages || 1));

      // All services from favorites endpoint are already marked as favorites
      const favoriteServicesData =
        data?.data?.map((service: Service) => ({
          ...service,
          isFavorite: true,
        })) || [];

      setServices(favoriteServicesData);

      // Process services data for grouping
      processServicesData(favoriteServicesData, data.allCategories || []);
    } catch (error) {
      console.error('Error fetching favorite services:', error);
      showToast('Error fetching favorite services. Please try again later.', 'error');
      setServices([]);
      setGroupedServices({});
    } finally {
      setLoading(false);
      setIsSearchLoading(false);
    }
  }, [debouncedSearch, user?.id, page, limit]);

  // Process services data for grouping and favorites
  const processServicesData = React.useCallback((servicesData: Service[], categoriesData: any[]) => {
    // Separate favorite services
    const favorites = servicesData.filter(service => service.isFavorite);
    setFavoriteServices(favorites);

    // Group services by category
    const groupedById: Record<string, { category: any; services: Service[] }> = {};

    // Initialize all active categories (including duplicates by name)
    categoriesData
      .filter((category: any) => category.hideCategory !== 'yes')
      .forEach((category: any) => {
        // Use unique key with ID to handle duplicate names
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

    // Sort categories by position and name
    const sortedGrouped = Object.entries(groupedById)
      .sort(([, a], [, b]) => {
        const posA = a.category.position || 999;
        const posB = b.category.position || 999;
        if (posA !== posB) return posA - posB;
        return a.category.category_name.localeCompare(b.category.category_name);
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, { category: any; services: Service[] }>);

    // Convert to the format expected by the UI
    const grouped: Record<string, Service[]> = {};
    Object.entries(sortedGrouped).forEach(([key, { category, services }]) => {
      // Use category name with ID to handle duplicates
      const displayName = `${category.category_name} (ID: ${category.id})`;
      grouped[displayName] = services;
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
    fetchServices();
  }, [fetchServices, debouncedSearch, page, limit]);

  // Handle limit change
  const handleLimitChange = (newLimit: string) => {
    setLimit(newLimit);
    setPage(1);
    setServices([]);
    setGroupedServices({});
    setHasMoreData(true);
    // Trigger immediate fetch with new limit
    setTimeout(() => {
      fetchServices();
    }, 100);
  };

  // Handle pagination
  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
      setServices([]); // Clear current services
      setGroupedServices({}); // Clear grouped services
      setHasMoreData(true);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
      setServices([]); // Clear current services
      setGroupedServices({}); // Clear grouped services
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

        // Update favorite services list
        setFavoriteServices((prevFavorites) => {
          return prevFavorites.filter(service => service.id !== serviceId);
        });

        showToast(data.message || 'Service removed from favorites', 'success');
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

  if (loading && !debouncedSearch && page === 1) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
            <div className="text-center py-8 flex flex-col items-center">
              <GradientSpinner size="w-14 h-14" className="mb-4" />
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
        <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
          {/* Search Bar and Controls */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Show Per Page Dropdown - Left side */}
              <div className="flex items-center gap-2 h-12">
                <div className="relative">
                  <select
                    value={limit}
                    onChange={(e) => handleLimitChange(e.target.value)}
                    className="form-field pl-4 pr-8 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm min-w-[160px] h-12"
                  >
                    {totalServices > 0 && (
                      <>
                        {totalServices >= 10 && <option value="10">10 per page</option>}
                        {totalServices >= 25 && <option value="25">25 per page</option>}
                        {totalServices >= 50 && <option value="50">50 per page</option>}
                        {totalServices >= 100 && <option value="100">100 per page</option>}
                        {totalServices >= 200 && <option value="200">200 per page</option>}
                        {totalServices >= 500 && <option value="500">500 per page</option>}
                        <option value="all">Show All</option>
                      </>
                    )}
                    {totalServices === 0 && (
                      <option value="50">No services found</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Search Input - Right side with reduced width */}
              <div className="w-full md:w-100 h-12 items-center">
                <div className="form-group mb-0 w-full">
                  <div className="relative flex items-center h-12">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="search"
                      placeholder="Search by ID, Service Name, Category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="form-field w-full pl-10 pr-10 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 h-12"
                      autoComplete="off"
                    />
                    {isSearchLoading && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
                        <GradientSpinner size="w-4 h-4" className="flex-shrink-0" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services by Category */}
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
                  {isSearchLoading ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <GradientSpinner size="w-8 h-8" />
                          <div className="text-sm text-gray-600 dark:text-gray-400">Searching favorite services...</div>
                        </div>
                      </td>
                    </tr>
                  ) : Object.keys(groupedServices).length > 0 ? (
                    Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
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
                                    title="Remove from favorites"
                                  >
                                    <FaStar className="w-4 h-4 text-yellow-500" />
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
                                  <p className="text-sm font-medium">No services found!</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <FaClipboardList className="text-4xl mb-2" />
                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                              No favorite services found!
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Try adjusting your search criteria or add some services to favorites
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          {/* Pagination Controls - Hide when showing all */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
                {' '}({Object.keys(groupedServices).length} categories shown)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={page === totalPages || loading}
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
                  <FaClipboardList className="w-4 h-4 text-blue-500" />
                  <span>Showing <span className="font-medium">{services.length}</span> of <span className="font-medium">{totalServices}</span> favorite services</span>
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
                {limit === 'all' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 dark:text-green-400 font-medium">Showing all favorite services</span>
                  </div>
                )}
                {hasMoreData && limit !== 'all' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-orange-600 dark:text-orange-400">More pages available</span>
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
          service={{
            id: selected.id,
            name: selected.name,
            description: selected.description,
            price: selected.rate,
            min: selected.min_order,
            max: selected.max_order,
            rate: selected.avg_time,
            category: selected.category?.category_name || 'Uncategorized',
            refill: selected.refill,
            cancel: selected.cancel
          }}
        />
      )}
    </div>
  );
};

export default FavoriteServicesTable;
