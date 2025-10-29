'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  FaBox,
  FaCheckCircle,
  FaEdit,
  FaExclamationTriangle,
  FaSave,
  FaSearch,
  FaSync,
  FaTag,
  FaTimes 
} from 'react-icons/fa';

// Import APP_NAME constant
import { useGetCategories } from '@/hooks/categories-fetch';
import { useGetServices } from '@/hooks/service-fetch';
import axiosInstance from '@/lib/axiosInstance';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatNumber } from '@/lib/utils';
import { mutate } from 'swr';

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
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

// Define interfaces
interface Category {
  id: number;
  category_name: string;
  hideCategory?: string;
  position?: string;
}

interface Service {
  id: number;
  name: string;
  min_order: number;
  max_order: number;
  rate: number;
  description: string;
  categoryId: number;
  category?: {
    id: number;
    category_name: string;
  };
  status: 'active' | 'inactive';
  provider?: string;
  service_type?: string;
  serviceType?: string;
  refill?: boolean;
  cancel?: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const BulkModifyPage = () => {
  const { appName } = useAppNameWithFallback();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Bulk Modify Services', appName);
  }, [appName]);

  // API hooks
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useGetCategories();
  const { data: servicesData, error: servicesError, isLoading: servicesLoading } = useGetServices();

  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | number>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editedServices, setEditedServices] = useState<{[key: string]: Partial<Service>}>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [tempSelectedCategory, setTempSelectedCategory] = useState<string | number>('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [localServicesLoading, setLocalServicesLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Utility functions
  const formatID = (id: string | number) => {
    return id.toString().toUpperCase();
  };

  // Show toast notification
  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Update categories when data is loaded
  useEffect(() => {
    if (categoriesData?.data) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

  // Load services when data is available
  useEffect(() => {
    if (servicesData?.data) {
      setLocalServicesLoading(true);
      if (selectedCategory) {
        // Filter services by selected category
        const categoryServices = servicesData.data.filter((service: Service) => 
          service.categoryId === parseInt(selectedCategory.toString()) || service.category?.id === parseInt(selectedCategory.toString())
        );
        setServices(categoryServices);
        showToast(`Loaded ${categoryServices.length} services for selected category`, 'success');
      } else {
        // Show all services when no category is selected
        setServices(servicesData.data);
        showToast(`Loaded ${servicesData.data.length} services`, 'success');
      }
      setLocalServicesLoading(false);
      setEditedServices({});
      setHasChanges(false);
    }
  }, [selectedCategory, servicesData, showToast]);

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category?.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = filteredServices.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination(prev => ({
      ...prev,
      total,
      totalPages,
      hasNext: prev.page < totalPages,
      hasPrev: prev.page > 1
    }));
  }, [filteredServices.length, pagination.limit]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredServices.slice(startIndex, endIndex);
  };



  // Handle field changes
  const handleFieldChange = (serviceId: string | number, field: keyof Service, value: string | number) => {
    setEditedServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  // Get current value (edited value or original value)
  const getCurrentValue = (service: Service, field: keyof Service) => {
    return editedServices[service.id]?.[field] !== undefined 
      ? editedServices[service.id][field] 
      : service[field];
  };

  // Handle category selection from modal
  const handleCategorySelect = () => {
    if (tempSelectedCategory) {
      setSelectedCategory(tempSelectedCategory);
      setCategoryModalOpen(false);
      setTempSelectedCategory('');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (selectedCategory) {
      setLocalServicesLoading(true);
      // Trigger SWR revalidation
      mutate('/api/admin/services?page=1&limit=500&search=');
      mutate('/api/admin/categories/get-categories');
      
      setTimeout(() => {
        setLocalServicesLoading(false);
        setEditedServices({});
        setHasChanges(false);
        showToast('Services refreshed successfully!', 'success');
      }, 1000);
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      showToast('Saving changes...', 'pending');
      
      // Prepare bulk update data
      const serviceIds = Object.keys(editedServices).map(id => parseInt(id));
      const updateData: any = {};
      
      // Check if all services have the same changes for bulk update
      const firstServiceChanges = Object.values(editedServices)[0];
      const allServicesSameChanges = Object.values(editedServices).every(changes => 
        JSON.stringify(changes) === JSON.stringify(firstServiceChanges)
      );
      
      if (allServicesSameChanges && firstServiceChanges) {
        // Use bulk update for same changes
        if (firstServiceChanges.rate !== undefined) updateData.rate = parseFloat(firstServiceChanges.rate.toString());
        if (firstServiceChanges.min_order !== undefined) updateData.min_order = parseInt(firstServiceChanges.min_order.toString());
        if (firstServiceChanges.max_order !== undefined) updateData.max_order = parseInt(firstServiceChanges.max_order.toString());
        if (firstServiceChanges.status !== undefined) updateData.status = firstServiceChanges.status;
        
        // Use bulk update API
        await axiosInstance.post('/api/admin/services/bulk-update', {
          serviceIds,
          updateData
        });
      } else {
        // Use individual updates for different changes
        const updatePromises = Object.entries(editedServices).map(async ([serviceId, changes]) => {
          const originalService = services.find(s => s.id === parseInt(serviceId));
          if (!originalService) return;

          // Merge original service data with changes
          const updatedData = {
            name: changes.name || originalService.name,
            description: changes.description || originalService.description,
            rate: changes.rate?.toString() || originalService.rate?.toString(),
            min_order: changes.min_order?.toString() || originalService.min_order?.toString(),
            max_order: changes.max_order?.toString() || originalService.max_order?.toString(),
            categoryId: changes.categoryId || originalService.categoryId,
            serviceType: changes.service_type || changes.serviceType || originalService.service_type || originalService.serviceType || 'other',
            mode: 'manual',
            refill: originalService.refill ? 'on' : 'off',
            refillDays: '0',
            refillDisplay: '0',
            cancel: originalService.cancel ? 'on' : 'off',
            orderLink: 'link',
            serviceSpeed: 'normal'
          };

          return axiosInstance.put(`/api/admin/services/update-services?id=${serviceId}`, updatedData);
        });

        // Execute all updates
        await Promise.all(updatePromises);
      }
      
      // Refresh data
      await mutate('/api/admin/services?page=1&limit=500&search=');
      await mutate('/api/admin/categories/get-categories');
      
      setEditedServices({});
      setHasChanges(false);
      setIsUpdating(false);
      showToast(`Successfully updated ${Object.keys(editedServices).length} services`, 'success');
    } catch (error: any) {
      console.error('Error saving changes:', error);
      setIsUpdating(false);
      showToast(`Error saving changes: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    const category = categories.find(cat => cat.id === parseInt(selectedCategory.toString()));
    return category ? category.category_name : '';
  };

  // Handle error states only (loading will be handled in the content area)
  const isInitialLoading = categoriesLoading || servicesLoading;

  if (categoriesError || servicesError) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="text-center py-12">
            <FaExclamationTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              Error Loading Data
            </h3>
            <p className="text-sm text-gray-600">
              {categoriesError || servicesError}
            </p>
            <button 
              onClick={() => {
                mutate('/api/admin/categories/get-categories');
                mutate('/api/admin/services?page=1&limit=500&search=');
              }}
              className="btn btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Toast Container */}
      <div className="toast-container">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <div className="page-content">
        {/* Controls Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Left: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
              {/* Page View Dropdown */}
              <select 
                value={pagination.limit === filteredServices.length ? 'all' : pagination.limit}
                onChange={(e) => {
                  setPaginationLoading(true);
                  setPagination(prev => ({ 
                    ...prev, 
                    limit: e.target.value === 'all' ? filteredServices.length : parseInt(e.target.value), 
                    page: 1 
                  }));
                  // Simulate loading time for pagination change
                  setTimeout(() => {
                    setPaginationLoading(false);
                  }, 800);
                }}
                disabled={paginationLoading || isInitialLoading}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={localServicesLoading || isInitialLoading || !selectedCategory}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={localServicesLoading ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button
                onClick={() => setCategoryModalOpen(true)}
                disabled={isInitialLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5 w-full md:w-auto"
              >
                <FaTag />
                {isInitialLoading ? 'Loading...' : 'Select Category'}
              </button>

              {hasChanges && (
                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="btn btn-primary flex items-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? (
                    <>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* Right: Search Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="card">
          <div className="px-6 py-6">
            {selectedCategory && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <FaTag className="inline mr-2" />
                  Editing services in: <strong>{getSelectedCategoryName()}</strong>
                </p>
              </div>
            )}

            {hasChanges && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <FaEdit className="inline mr-2" />
                  You have unsaved changes. Click "Save Changes" to apply them.
                </p>
              </div>
            )}

            {(localServicesLoading || isInitialLoading || paginationLoading) ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    {isInitialLoading ? 'Loading data...' : paginationLoading ? 'Updating page view...' : 'Loading services...'}
                  </div>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <FaBox
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No Services Found
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  No services match your current filters. Try adjusting your search or category selection.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="btn btn-primary flex items-center gap-2 px-4 py-2.5 mx-auto"
                >
                  <FaSync />
                  Clear Filters
                </button>
              </div>
            ) : selectedCategory && getPaginatedData().length === 0 ? (
              <div className="text-center py-12">
                <FaBox
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No services found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {searchTerm ? 'No services match your search criteria.' : 'This category has no services yet.'}
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[1200px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          ID
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Name
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Min
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Max
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Price (USD)
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Description
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData().map((service) => (
                        <tr
                          key={service.id}
                          className={`border-t hover:bg-gray-50 transition-colors duration-200 ${
                            editedServices[service.id] ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">
                              {formatID(service.id)}
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={getCurrentValue(service, 'name') as string}
                              onChange={(e) => handleFieldChange(service.id, 'name', e.target.value)}
                              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={getCurrentValue(service, 'min_order') as number}
                              onChange={(e) => handleFieldChange(service.id, 'min_order', parseInt(e.target.value) || 0)}
                              className="form-field w-20 px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min="0"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={getCurrentValue(service, 'max_order') as number}
                              onChange={(e) => handleFieldChange(service.id, 'max_order', parseInt(e.target.value) || 0)}
                              className="form-field w-24 px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min="0"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={getCurrentValue(service, 'rate') as number}
                              onChange={(e) => handleFieldChange(service.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="form-field w-20 px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="p-3">
                            <textarea
                              value={getCurrentValue(service, 'description') as string}
                              onChange={(e) => handleFieldChange(service.id, 'description', e.target.value)}
                              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 resize-y"
                              rows={2}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit">
                              <FaCheckCircle className={`h-3 w-3 ${service.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                              <span className="text-xs font-medium capitalize">
                                {service.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Visible on tablet and mobile */}
                <div className="lg:hidden">
                  <div className="space-y-4 pt-6">
                    {getPaginatedData().map((service) => (
                      <div
                        key={service.id}
                        className={`card card-padding border-l-4 border-blue-500 mb-4 ${
                          editedServices[service.id] ? 'bg-yellow-50' : ''
                        }`}
                      >
                        {/* Header with ID */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {formatID(service.id)}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                              <FaCheckCircle className={`h-3 w-3 ${service.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                              <span className="text-xs font-medium capitalize">
                                {service.status}
                              </span>
                            </div>
                          </div>
                          {editedServices[service.id] && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Modified
                            </span>
                          )}
                        </div>

                        {/* Service Name */}
                        <div className="mb-4">
                          <label className="form-label mb-2">Service Name</label>
                          <input
                            type="text"
                            value={getCurrentValue(service, 'name') as string}
                            onChange={(e) => handleFieldChange(service.id, 'name', e.target.value)}
                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          />
                        </div>

                        {/* Min and Max */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="form-label mb-2">Min Order</label>
                            <input
                              type="number"
                              value={getCurrentValue(service, 'min_order') as number}
                              onChange={(e) => handleFieldChange(service.id, 'min_order', parseInt(e.target.value) || 0)}
                              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="form-label mb-2">Max Order</label>
                            <input
                              type="number"
                              value={getCurrentValue(service, 'max_order') as number}
                              onChange={(e) => handleFieldChange(service.id, 'max_order', parseInt(e.target.value) || 0)}
                              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min="0"
                            />
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                          <label className="form-label mb-2">Price (USD)</label>
                          <input
                            type="number"
                            value={getCurrentValue(service, 'rate') as number}
                            onChange={(e) => handleFieldChange(service.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="form-label mb-2">Description</label>
                          <textarea
                            value={getCurrentValue(service, 'description') as string}
                            onChange={(e) => handleFieldChange(service.id, 'description', e.target.value)}
                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-y"
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {localServicesLoading ? (
                      <div className="flex items-center gap-2">
                        <span>Loading pagination...</span>
                      </div>
                    ) : (
                      `Showing ${
                        (pagination.page - 1) * pagination.limit + 1
                      } to ${
                        Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )
                      } of ${pagination.total} services`
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={!pagination.hasPrev || localServicesLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {localServicesLoading ? (
                        <GradientSpinner size="w-4 h-4" />
                      ) : (
                        `Page ${formatNumber(
                          pagination.page
                        )} of ${formatNumber(pagination.totalPages)}`
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={!pagination.hasNext || localServicesLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>

        {/* Category Selection Modal */}
        {categoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Select Category
              </h3>
              <div className="mb-4">
                <label className="form-label mb-2">
                  Choose a category to modify its services
                </label>
                <select
                  value={tempSelectedCategory}
                  onChange={(e) => setTempSelectedCategory(e.target.value)}
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setCategoryModalOpen(false);
                    setTempSelectedCategory('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCategorySelect}
                  disabled={!tempSelectedCategory}
                  className="btn btn-primary"
                >
                  Load Services
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkModifyPage;