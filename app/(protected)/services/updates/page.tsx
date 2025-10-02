/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { revalidate } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  FaBell,
  FaCheckCircle,
  FaClipboardList,
  FaSearch,
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
  updatedAt: string;
  updateText: string;
}

export default function UpdateServiceTable() {
  const { appName } = useAppNameWithFallback();

  const user = useCurrentUser();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  const limit = 50;

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Service Updates', appName);
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

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // First fetch the services
        const response = await fetch(
          `/api/user/services/getUpdateServices?page=${page}&limit=${limit}&search=${debouncedSearch}`,
          revalidate
        );
        const data = await response.json();

        if (response.ok) {
          setServices(data.data);
          setTotalPages(data.totalPages);
        } else {
          showToast(data.message || 'Error fetching services', 'error');
        }
      } catch (error) {
        showToast('Error fetching services. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [page, debouncedSearch, user?.id]);

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-b border-gray-100">
        <td className="py-3 px-4">
          <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="py-3 px-4">
          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="py-3 px-4">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="py-3 px-4">
          <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
      </tr>
    ));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card card-padding">
            <div className="text-center py-8 flex flex-col items-center">
              <GradientSpinner size="w-14 h-14" className="mb-4" />
              <div className="text-lg font-medium">
                Loading service updates...
              </div>
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
        {/* Service Updates Content Card - Everything in one box */}
        <div className="card card-padding">
          {/* Header with Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="card-icon">
              <FaBell className="w-5 h-5 text-white" />
            </div>
            <h1 className="card-title">Service Updates</h1>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="w-4 h-4 text-gray-500" />
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

          {/* Services Updates Table */}
          {services?.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 first:rounded-tl-lg">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 max-w-[400px]">
                      Service Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 w-[300px] last:rounded-tr-lg">
                      Update
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services?.filter(service => {
                    try {
                      const updateData = JSON.parse(service.updateText || '{}');
                      // Only filter out updates that are explicitly from API providers
                      // Keep all manual admin updates, even if they have provider-like properties
                      const isApiProviderSync = updateData.provider && updateData.providerId && updateData.lastSynced;
                      return !isApiProviderSync;
                    } catch (error) {
                      // Include services with invalid JSON (likely manual updates)
                      return true;
                    }
                  }).map((service, i) => (
                    <tr key={service.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="break-words">
                          {(() => {
                            try {
                              const updateData = JSON.parse(service.updateText || '{}');
                              
                              // Check for new service creation
                              if (updateData.action === 'created' || updateData.type === 'new_service' || updateData.action === 'create') {
                                return 'New service';
                              }
                              
                              // Check for service addition (imported)
                              if (updateData.action === 'added' || updateData.type === 'service_added' || updateData.action === 'import') {
                                return 'New service';
                              }
                              
                              const updates = [];
                              let hasRateChange = false;
                              let hasStatusChange = false;
                              
                              // Check for rate changes with proper decimal formatting
                              const rateChange = updateData.changes?.rate || updateData.rate;
                              if (rateChange && rateChange.from !== undefined && rateChange.to !== undefined) {
                                const oldRate = parseFloat(rateChange.from);
                                const newRate = parseFloat(rateChange.to);
                                
                                // Format rates to remove unnecessary trailing zeros
                                const formatRate = (rate: number) => {
                                  const formatted = rate.toFixed(6);
                                  return parseFloat(formatted).toString();
                                };
                                
                                if (newRate > oldRate) {
                                  updates.push(`Rate increased from $${formatRate(oldRate)} to $${formatRate(newRate)}`);
                                  hasRateChange = true;
                                } else if (newRate < oldRate) {
                                  updates.push(`Rate decreased from $${formatRate(oldRate)} to $${formatRate(newRate)}`);
                                  hasRateChange = true;
                                }
                              }
                              
                              // Check for status changes
                              const statusChange = updateData.changes?.status || updateData.status;
                              if (statusChange && statusChange.from !== undefined && statusChange.to !== undefined) {
                                const oldStatus = statusChange.from;
                                const newStatus = statusChange.to;
                                if (newStatus === 'active' && oldStatus !== 'active') {
                                  updates.push('Service enabled');
                                  hasStatusChange = true;
                                } else if (newStatus !== 'active' && oldStatus === 'active') {
                                  updates.push('Service disabled');
                                  hasStatusChange = true;
                                }
                              }
                              
                              // Check for other service information changes
                              const infoUpdates = [];
                              
                              // Check for min order changes
                              const minOrderChange = updateData.changes?.min_order || updateData.min_order;
                              if (minOrderChange && minOrderChange.from !== undefined && minOrderChange.to !== undefined) {
                                infoUpdates.push('min order');
                              }
                              
                              // Check for max order changes
                              const maxOrderChange = updateData.changes?.max_order || updateData.max_order;
                              if (maxOrderChange && maxOrderChange.from !== undefined && maxOrderChange.to !== undefined) {
                                infoUpdates.push('max order');
                              }
                              
                              // Check for name changes
                              const nameChange = updateData.changes?.name || updateData.name;
                              if (nameChange && nameChange.from !== undefined && nameChange.to !== undefined) {
                                infoUpdates.push('name');
                              }
                              
                              // Check for description changes
                              const descriptionChange = updateData.changes?.description || updateData.description;
                              if (descriptionChange && descriptionChange.from !== undefined && descriptionChange.to !== undefined) {
                                infoUpdates.push('description');
                              }
                              
                              // Check for category changes
                              const categoryChange = updateData.changes?.categoryId || updateData.changes?.category || updateData.category;
                              if (categoryChange && categoryChange.from !== undefined && categoryChange.to !== undefined) {
                                infoUpdates.push('category');
                              }
                              
                              // If there are info updates but no rate/status changes, show "Service info updated"
                              if (infoUpdates.length > 0 && !hasRateChange && !hasStatusChange) {
                                updates.push('Service info updated');
                              }
                              
                              return updates.length > 0 ? updates.join(', ') : 'Service updated';
                              
                            } catch (error) {
                              // Handle plain text updates or invalid JSON
                              const text = service.updateText || '';
                              if (text.toLowerCase().includes('created') || text.toLowerCase().includes('new')) {
                                return 'New service';
                              }
                              if (text.toLowerCase().includes('added') || text.toLowerCase().includes('imported')) {
                                return 'Service added';
                              }
                              if (text.toLowerCase().includes('disabled')) {
                                return 'Service disabled';
                              }
                              if (text.toLowerCase().includes('enabled')) {
                                return 'Service enabled';
                              }
                              return 'Service updated';
                            }
                          })()
                        }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(service.updatedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center">
              <FaClipboardList className="text-4xl text-gray-400 mb-4" />
              <div className="text-lg font-medium">
                No service updates found
              </div>
              <div className="text-sm text-gray-500">
                Try adjusting your search criteria
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={page === 1 || loading}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={page === totalPages || loading}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
