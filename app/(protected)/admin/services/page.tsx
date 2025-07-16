'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, { Fragment, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  FaBox,
  FaBriefcase,
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaChevronUp,
  FaEdit,
  FaEllipsisH,
  FaExclamationTriangle,
  FaFileImport,
  FaGripVertical,
  FaPlus,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaSync,
  FaTags,
  FaTimes,
  FaTimesCircle,
  FaToggleOff,
  FaToggleOn,
  FaTrash
} from 'react-icons/fa';
import useSWR from 'swr';

// Import APP_NAME constant
import { PriceDisplay } from '@/components/PriceDisplay';
import { useGetCategories } from '@/hooks/categories-fetch';
import { useGetServices } from '@/hooks/service-fetch';
import { useGetServicesId } from '@/hooks/service-fetch-id';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import { APP_NAME } from '@/lib/constants';
import { formatID, formatNumber } from '@/lib/utils';
import {
  createCategoryDefaultValues,
  createCategorySchema,
  CreateCategorySchema,
} from '@/lib/validators/admin/categories/categories.validator';
import {
  createServiceDefaultValues,
  CreateServiceSchema
} from '@/lib/validators/admin/services/services.validator';
import { mutate } from 'swr';

// Fetcher function for useSWR
const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

// Custom Form Components
const FormField = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-2">{children}</div>
);

const FormItem = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
);

const FormLabel = ({ 
  className = "", 
  style, 
  children 
}: { 
  className?: string; 
  style?: React.CSSProperties; 
  children: React.ReactNode 
}) => (
  <label className={`block text-sm font-medium ${className}`} style={style}>
    {children}
  </label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const FormMessage = ({ 
  className = "", 
  children 
}: { 
  className?: string; 
  children?: React.ReactNode 
}) => (
  children ? <div className={`text-xs text-red-500 mt-1 ${className}`}>{children}</div> : null
);

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Toast Component with animation
const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div className={`toast toast-${type} animate-in slide-in-from-top-2 fade-in duration-300`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button 
      onClick={onClose} 
      className="toast-close hover:bg-gray-100 rounded transition-colors duration-200"
      title="Close notification"
    >
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ onClose, onConfirm, selectedCount }: { 
  onClose: () => void; 
  onConfirm: () => void;
  selectedCount: number;
}) => {
  return (
    <div className="w-full max-w-md">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Confirm Deletion
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-4">
          {/* Warning Icon and Message */}
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <FaExclamationTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                Delete {selectedCount} Service{selectedCount !== 1 ? 's' : ''}?
              </p>
              <p className="text-sm text-red-600 mt-1">
                This action cannot be undone. All selected services will be permanently removed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary px-6 py-2"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-2"
            >
              <FaTrash className="h-4 w-4" />
              Delete {selectedCount > 1 ? 'All' : 'Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Category Confirmation Modal Component
const DeleteCategoryModal = ({ onClose, onConfirm, categoryName, categoryId, isUpdating, servicesCount, categoriesData }: { 
  onClose: () => void; 
  onConfirm: (action: 'delete' | 'move', targetCategoryId?: string) => void;
  categoryName: string;
  categoryId: number;
  isUpdating: boolean;
  servicesCount: number;
  categoriesData: any;
}) => {
  const [deleteAction, setDeleteAction] = useState<'delete' | 'move'>('delete');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');

  // Filter out the current category from available options
  const availableCategories = categoriesData?.data?.filter((cat: any) => cat.id !== categoryId) || [];

  const handleConfirm = () => {
    if (deleteAction === 'move' && !targetCategoryId) {
      return; // Don't proceed if no target category selected
    }
    onConfirm(deleteAction, targetCategoryId || undefined);
  };

  return (
    <div className="w-full max-w-lg">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Delete "{categoryName}" Category
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-4">
          {/* Warning Icon and Message */}
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <FaExclamationTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                This category contains {servicesCount} service{servicesCount !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Choose how to handle the services before deleting the category.
              </p>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-3">
            <p className="font-medium text-gray-800">What would you like to do with the services?</p>
            
            {/* Option 1: Delete with services */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="deleteAction"
                value="delete"
                checked={deleteAction === 'delete'}
                onChange={(e) => setDeleteAction(e.target.value as 'delete')}
                className="mt-0.5"
              />
              <div>
                <div className="font-medium text-gray-800">Delete category with all services</div>
                <div className="text-sm text-gray-600">
                  Permanently remove the category and all {servicesCount} service{servicesCount !== 1 ? 's' : ''}
                </div>
              </div>
            </label>

            {/* Option 2: Move services */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="deleteAction"
                value="move"
                checked={deleteAction === 'move'}
                onChange={(e) => setDeleteAction(e.target.value as 'move')}
                className="mt-0.5"
                disabled={availableCategories.length === 0}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  Move services to another category
                  {availableCategories.length === 0 && (
                    <span className="text-red-500 text-sm ml-2">(No other categories available)</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Transfer all services to a different category before deleting this one
                </div>
                
                {/* Category Selection Dropdown */}
                {deleteAction === 'move' && availableCategories.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select target category:
                    </label>
                    <select
                      value={targetCategoryId}
                      onChange={(e) => setTargetCategoryId(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-900 transition-all duration-200 appearance-none cursor-pointer"
  
                    >
                      <option value="">Choose a category...</option>
                      {availableCategories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Additional Warning for Delete Action */}
          {deleteAction === 'delete' && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete both the category and all {servicesCount} service{servicesCount !== 1 ? 's' : ''} inside it. This action cannot be undone.
              </p>
            </div>
          )}

          {/* Success info for Move Action */}
          {deleteAction === 'move' && targetCategoryId && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Ready:</strong> All services will be moved to "{availableCategories.find((cat: any) => cat.id === targetCategoryId)?.category_name}" before deleting this category.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="btn btn-secondary px-6 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating || (deleteAction === 'move' && !targetCategoryId)}
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <GradientSpinner size="w-4 h-4" />
                  {deleteAction === 'delete' ? 'Deleting...' : 'Moving & Deleting...'}
                </>
              ) : (
                <>
                  <FaTrash className="h-4 w-4" />
                  {deleteAction === 'delete' ? 'Delete All' : 'Move & Delete Category'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Service Form Component (integrated)
const CreateServiceForm: React.FC<{
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'pending') => void;
  onRefresh?: () => void;
  refreshAllData?: () => Promise<void>;
}> = ({ onClose, showToast, onRefresh, refreshAllData }) => {
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useGetCategories();
  const { data: serviceTypesData, error: serviceTypesError, isLoading: serviceTypesLoading } = useSWR('/api/admin/service-types', fetcher);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<CreateServiceSchema>({
    mode: 'onChange',
    // No resolver to allow empty fields
    defaultValues: {
      ...createServiceDefaultValues,
      mode: 'manual', // Set default mode to manual
    },
  });
  
  // Watch refill field to control readonly state of refill days and display
  const refillValue = watch('refill');

  const onSubmit: SubmitHandler<CreateServiceSchema> = async (values) => {
    console.log('Form submitted with values:', values);

    // Validate required fields
    if (!values.categoryId || values.categoryId === '') {
      showToast('Please select a service category', 'error');
      return;
    }

    if (!values.serviceTypeId || values.serviceTypeId === '') {
      showToast('Please select a service type', 'error');
      return;
    }

    // Filter out empty values for create service
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => {
        if (value === '' || value === null || value === undefined) return false;
        return true;
      })
    );

    console.log('Filtered values to send:', filteredValues);

    startTransition(async () => {
      try {
        console.log('Sending request to API...');
        const response = await axiosInstance.post('/api/admin/services', filteredValues);
        console.log('API response:', response.data);
        if (response.data.success) {
          reset();
          showToast(response.data.message, 'success');
          // Live refresh all data
          if (refreshAllData) {
            await refreshAllData();
          }
          if (onRefresh) onRefresh();
          onClose(); // Close modal on success
        } else {
          showToast(response.data.error, 'error');
        }
      } catch (error: any) {
        console.error('API Error:', error);
        showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
      }
    });
  };

  if (categoriesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center flex flex-col items-center">
            <GradientSpinner size="w-12 h-12" className="mb-3" />
            <div className="text-base font-medium">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading categories</p>
          <p className="text-gray-500 text-sm mt-1">{categoriesError}</p>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!categoriesData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaExclamationTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No categories available</p>
          <p className="text-gray-500 text-sm mt-1">Please add categories first</p>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Create New Service
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Name - 100% width - REQUIRED */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Name
              </FormLabel>
              <FormControl>
                <input
                  type="text"
                  placeholder="Enter service name"
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  {...register('name')}
                  disabled={isPending}
                  required
                />
              </FormControl>
              <FormMessage>{errors.name?.message}</FormMessage>
            </FormItem>

            {/* Service Category - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Category
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('categoryId')}
                  disabled={isPending}
                  required
                >
                  <option value={''} hidden>
                    Select Service Category
                  </option>
                  {categoriesData?.data?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category?.category_name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage>{errors.categoryId?.message}</FormMessage>
            </FormItem>

            {/* Service Type - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Type <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('serviceTypeId')}
                  disabled={isPending || serviceTypesLoading}
                  required
                >
                  <option value="">Select Service Type</option>
                  {serviceTypesData?.data?.map((serviceType: any) => (
                    <option key={serviceType.id} value={serviceType.id}>
                      {serviceType.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage>{errors.serviceTypeId?.message}</FormMessage>
            </FormItem>

            {/* Mode - 100% width - REQUIRED with default manual */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Mode <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('mode')}
                  disabled={isPending}
                  required
                >
                  <option value="manual">Manual</option>
                  <option value="auto">Auto (API)</option>
                </select>
              </FormControl>
              <FormMessage>{errors.mode?.message}</FormMessage>
            </FormItem>

            {/* Service Price - 33% width - special grid - REQUIRED */}
            <div className="md:col-span-2 grid grid-cols-3 gap-6">
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Service Price{' '}
                  <span className="text-red-500">* (Always USD Price)</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter service price"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('rate')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.rate?.message}</FormMessage>
              </FormItem>

              {/* Minimum Order - 33% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Minimum Order <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter minimum order"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('min_order')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.min_order?.message}</FormMessage>
              </FormItem>

              {/* Maximum Order - 33% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Maximum Order <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter maximum order"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('max_order')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.max_order?.message}</FormMessage>
              </FormItem>
            </div>

            {/* Per Quantity and Average Time - 50% width each - REQUIRED */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Per Quantity - 50% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Per Quantity (Default: 1000)
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={1}
                    placeholder="Enter per quantity (default: 1000)"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('perqty')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.perqty?.message}</FormMessage>
              </FormItem>

              {/* Average Time - 50% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Average Time <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    placeholder="e.g., 1-2 hours, 24 hours"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    {...register('avg_time')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.avg_time?.message}</FormMessage>
              </FormItem>
            </div>

            {/* Refill - 100% width - REQUIRED */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Refill <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('refill', {
                    setValueAs: (value) => value === 'true'
                  })}
                  disabled={isPending}
                  required
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </FormControl>
              <FormMessage>{errors.refill?.message}</FormMessage>
            </FormItem>

            {/* Refill Days - 50% width (show only when refill is on) - REQUIRED */}
            {refillValue === true && (
              <FormItem className="md:col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Refill Days <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter refill days"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('refillDays')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.refillDays?.message}</FormMessage>
              </FormItem>
            )}

            {/* Refill Display - 50% width (show only when refill is on) - REQUIRED */}
            {refillValue === true && (
              <FormItem className="md:col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Refill Display (in hours){' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter refill display hours"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('refillDisplay')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.refillDisplay?.message}</FormMessage>
              </FormItem>
            )}

            {/* Cancel - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Cancel <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('cancel', {
                    setValueAs: (value) => value === 'true'
                  })}
                  disabled={isPending}
                  required
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </FormControl>
              <FormMessage>{errors.cancel?.message}</FormMessage>
            </FormItem>

            {/* Personalized Service - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Personalized Service <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('personalizedService')}
                  disabled={isPending}
                  required
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </FormControl>
              <FormMessage>{errors.personalizedService?.message}</FormMessage>
            </FormItem>

            {/* Order Link - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Order Link <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('orderLink')}
                  disabled={isPending}
                  required
                >
                  <option value="link">Link</option>
                  <option value="username">Username</option>
                </select>
              </FormControl>
              <FormMessage>{errors.orderLink?.message}</FormMessage>
            </FormItem>

            {/* Service Speed - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Speed <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('serviceSpeed')}
                  disabled={isPending}
                  required
                >
                  <option value="slow">Slow</option>
                  <option value="sometimes_slow">Sometimes Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </FormControl>
              <FormMessage>{errors.serviceSpeed?.message}</FormMessage>
            </FormItem>
          </div>

          {/* Refill and Cancel Options - Hidden from UI */}
          {/*
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="md:col-span-1">
              <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Refill Enabled
              </FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300 rounded"
                    {...register('refill')}
                    disabled={isPending}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Enable refill for this service
                  </span>
                </div>
              </FormControl>
              <FormMessage>{errors.refill?.message}</FormMessage>
            </FormItem>

            <FormItem className="md:col-span-1">
              <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Cancel Enabled
              </FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300 rounded"
                    {...register('cancel')}
                    disabled={isPending}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Enable cancel for this service
                  </span>
                </div>
              </FormControl>
              <FormMessage>{errors.cancel?.message}</FormMessage>
            </FormItem>
          </div>
          */}

          {/* Duplicate Refill Days field removed - using the one in grid layout above */}

          {/* Processing Mode - 100% width - COMMENTED OUT */}
          {/*
          <div className="grid grid-cols-1 gap-6">
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Processing Mode
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('mode')}
                  disabled={isPending}
                >
                  <option value="manual">Manual</option>
                  <option value="auto">Auto</option>
                </select>
              </FormControl>
              <FormMessage>{errors.mode?.message}</FormMessage>
            </FormItem>
          </div>
          */}

          {/* Service Description - 100% width - REQUIRED */}
          <FormItem>
            <FormLabel
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Service Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <textarea
                placeholder="Enter service description"
                className="form-field w-full min-h-[120px] resize-y px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                {...register('description')}
                disabled={isPending}
                required
              />
            </FormControl>
            <FormMessage>{errors.description?.message}</FormMessage>
          </FormItem>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex items-center gap-2 px-8 py-3"
            >
              {isPending ? (
                <>
                  <GradientSpinner size="w-4 h-4" />
                  Creating Service...
                </>
              ) : (
                <>
                  <FaPlus className="h-4 w-4" />
                  Create Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Category Form Component (integrated)
const CreateCategoryForm = ({ onClose, showToast, onRefresh }: {
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'pending') => void;
  onRefresh?: () => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    mode: 'all',
    defaultValues: {
      ...createCategoryDefaultValues,
      hideCategory: 'no',
      position: 'top',
    },
  });

  const onSubmit: SubmitHandler<CreateCategorySchema> = async (values) => {
    startTransition(() => {
      // handle form submission
      axiosInstance.post('/api/admin/categories', values).then((res) => {
        if (res.data.success) {
          reset();
          showToast(res.data.message || 'Category created successfully', 'success');
          mutate('/api/admin/categories');
          // Live refresh parent data
          if (onRefresh) onRefresh();
          onClose();
        } else {
          showToast(res.data.error || 'Failed to create category', 'error');
        }
      }).catch((error) => {
        showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
      });
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3 className="text-lg font-semibold">
          Create New Category
        </h3>
      </div>

      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Name */}
          <FormItem>
            <FormLabel className="form-label">
              Category Name
            </FormLabel>
            <FormControl>
              <input
                type="text"
                placeholder="Enter category name"
                className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                {...register('category_name')}
                disabled={isPending}
                autoFocus
              />
            </FormControl>
            <FormMessage>{errors.category_name?.message}</FormMessage>
          </FormItem>

          {/* Hide Category */}
          <FormItem>
            <FormLabel className="form-label">
              Hide Category
            </FormLabel>
            <FormControl>
              <select
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                {...register('hideCategory')}
                disabled={isPending}
              >
                <option value="no">No (Category will be visible/active)</option>
                <option value="yes">Yes (Category will be hidden/deactivated)</option>
              </select>
            </FormControl>
            <FormMessage>{errors.hideCategory?.message}</FormMessage>
          </FormItem>

          {/* Position */}
          <FormItem>
            <FormLabel className="form-label">
              Position
            </FormLabel>
            <FormControl>
              <select
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                {...register('position')}
                disabled={isPending}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </FormControl>
            <FormMessage>{errors.position?.message}</FormMessage>
          </FormItem>
          
          {/* Submit Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex items-center gap-2 px-8 py-3"
            >
              {isPending ? (
                <>
                  <GradientSpinner size="w-4 h-4" />
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Category Form Component (integrated)
const EditCategoryForm = ({ categoryId, categoryName, onClose, showToast }: {
  categoryId: string;
  categoryName: string;
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'pending') => void;
}) => {
  const { data: categoriesData } = useGetCategories();
  const [isPending, startTransition] = useTransition();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    mode: 'all',
    defaultValues: {
      ...createCategoryDefaultValues,
      hideCategory: 'no',
      position: 'top',
    },
  });

  // Pre-populate form with existing category data
  useEffect(() => {
    if (categoriesData?.data && categoryId) {
      const category = categoriesData.data.find((cat: any) => cat.id === categoryId);
      if (category) {
        reset({
          category_name: category.category_name || '',
          hideCategory: category.hideCategory || 'no',
          position: category.position || 'top',
        });
      }
    }
  }, [categoriesData, categoryId, reset]);

  const onSubmit: SubmitHandler<CreateCategorySchema> = async (values) => {
    startTransition(() => {
      // handle form submission for updating
      axiosInstance.put(`/api/admin/categories/${categoryId}`, values).then((res) => {
        if (res.data.success) {
          showToast(res.data.message || 'Category updated successfully', 'success');
          mutate('/api/admin/categories');
          mutate('/api/admin/services'); // Refresh services to show updated category names
          onClose();
        } else {
          showToast(res.data.error || 'Failed to update category', 'error');
        }
      }).catch((error) => {
        showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
      });
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3 className="text-lg font-semibold">
          Edit Category
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Name */}
          <FormItem>
            <FormLabel className="form-label">
              Category Name
            </FormLabel>
            <FormControl>
              <input
                type="text"
                placeholder="Enter category name"
                className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                {...register('category_name')}
                disabled={isPending}
                autoFocus
              />
            </FormControl>
            <FormMessage>{errors.category_name?.message}</FormMessage>
          </FormItem>

          {/* Hide Category */}
          <FormItem>
            <FormLabel className="form-label">
              Hide Category
            </FormLabel>
            <FormControl>
              <select
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                {...register('hideCategory')}
                disabled={isPending}
              >
                <option value="no">No (Category will be visible/active)</option>
                <option value="yes">Yes (Category will be hidden/deactivated)</option>
              </select>
            </FormControl>
            <FormMessage>{errors.hideCategory?.message}</FormMessage>
          </FormItem>

          {/* Position */}
          <FormItem>
            <FormLabel className="form-label">
              Position
            </FormLabel>
            <FormControl>
              <select
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                {...register('position')}
                disabled={isPending}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </FormControl>
            <FormMessage>{errors.position?.message}</FormMessage>
          </FormItem>
          
          {/* Submit Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex items-center gap-2 px-8 py-3"
            >
              {isPending ? (
                <>
                  <GradientSpinner size="w-4 h-4" />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  Update Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Service Form Component (integrated)
const EditServiceForm = ({ serviceId, onClose, showToast, refreshAllData }: {
  serviceId: number;
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'pending') => void;
  refreshAllData?: () => Promise<void>;
}) => {
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useGetCategories();
  const { data: serviceTypesData, error: serviceTypesError, isLoading: serviceTypesLoading } = useSWR('/api/admin/service-types', fetcher);
  const { data: serviceData, error: serviceError, isLoading: serviceLoading } = useGetServicesId(serviceId);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<CreateServiceSchema>({
    mode: 'onChange',
    // No resolver for edit form to allow empty fields
    defaultValues: {
      ...createServiceDefaultValues,
      mode: 'manual',
    },
  });
  
  // Watch refill field to control readonly state of refill days and display
  const refillValue = watch('refill');

  useEffect(() => {
    if (serviceData?.data && categoriesData?.data) {
      reset({
        categoryId: serviceData.data.categoryId || '',
        name: serviceData.data.name || '',
        description: serviceData.data.description || '',
        rate: String(serviceData.data.rate) || '',
        min_order: String(serviceData.data.min_order) || '0',
        max_order: String(serviceData.data.max_order) || '0',
        perqty: String(serviceData.data.perqty) || '1000',
        avg_time: serviceData.data.avg_time || '',
        updateText: serviceData.data.updateText || '',
        serviceTypeId: serviceData.data.serviceTypeId || '',
        mode: serviceData.data.mode || 'manual',
        refill: Boolean(serviceData.data.refill),
        refillDays: serviceData.data.refillDays || 30,
        refillDisplay: serviceData.data.refillDisplay || 24,
        cancel: serviceData.data.cancel || false,
        personalizedService: serviceData.data.personalizedService || 'no',
        serviceSpeed: serviceData.data.serviceSpeed || 'normal',
        orderLink: serviceData.data.orderLink || 'username',
      });
    }
  }, [categoriesData, reset, serviceData]);

  const onSubmit: SubmitHandler<CreateServiceSchema> = async (values) => {
    console.log('Edit form submitted with values:', values);
    console.log('Service ID:', serviceId);

    // Validate required fields
    if (!values.categoryId || values.categoryId === '') {
      showToast('Please select a service category', 'error');
      return;
    }

    if (!values.serviceTypeId || values.serviceTypeId === '') {
      showToast('Please select a service type', 'error');
      return;
    }

    // Filter out empty values and only send changed fields
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => {
        if (value === '' || value === null || value === undefined) return false;
        return true;
      })
    );

    console.log('Filtered values to send:', filteredValues);

    startTransition(async () => {
      try {
        console.log('Sending edit request to API...');
        const response = await axiosInstance.put(`/api/admin/services/update-services?id=${serviceId}`, filteredValues);
        console.log('Edit API response:', response.data);
        if (response.data.success) {
          showToast(response.data.message || 'Service updated successfully', 'success');
          // Live refresh all data
          if (refreshAllData) {
            await refreshAllData();
          }
          onClose(); // Close modal on success
        } else {
          showToast(response.data.error || 'Failed to update service', 'error');
        }
      } catch (error: any) {
        console.error('Edit API Error:', error);
        showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
      }
    });
  };

  if (categoriesLoading || serviceLoading || !serviceData?.data) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center flex flex-col items-center">
            <GradientSpinner size="w-12 h-12" className="mb-3" />
            <div className="text-base font-medium">Loading service data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesError || serviceError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading service data</p>
          <p className="text-gray-500 text-sm mt-1">{categoriesError || serviceError}</p>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!categoriesData || !serviceData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaExclamationTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No service data available</p>
          <p className="text-gray-500 text-sm mt-1">Service not found or data unavailable</p>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Edit Service
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Name - 100% width - REQUIRED */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Name
              </FormLabel>
              <FormControl>
                <input
                  type="text"
                  placeholder="Enter service name"
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  {...register('name')}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage>{errors.name?.message}</FormMessage>
            </FormItem>

            {/* Service Category - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Category
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('categoryId')}
                  disabled={isPending}
                  required
                >
                  <option value={''} hidden>
                    Select Service Category
                  </option>
                  {categoriesData?.data?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category?.category_name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage>{errors.categoryId?.message}</FormMessage>
            </FormItem>

            {/* Service Type - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Type
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('serviceTypeId')}
                  disabled={isPending || serviceTypesLoading}
                  required
                >
                  <option value="">Select Service Type</option>
                  {serviceTypesData?.data?.map((serviceType: any) => (
                    <option key={serviceType.id} value={serviceType.id}>
                      {serviceType.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage>{errors.serviceType?.message}</FormMessage>
            </FormItem>

            {/* Mode - 100% width - REQUIRED with default manual */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Mode
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('mode')}
                  disabled={isPending}
                >
                  <option value="manual">Manual</option>
                  <option value="auto">Auto (API)</option>
                </select>
              </FormControl>
              <FormMessage>{errors.mode?.message}</FormMessage>
            </FormItem>

            {/* Service Price - 33% width - special grid - REQUIRED */}
            <div className="md:col-span-2 grid grid-cols-3 gap-6">
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Service Price (Always USD Price)
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter service price"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('rate')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.rate?.message}</FormMessage>
              </FormItem>

              {/* Minimum Order - 33% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Minimum Order
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter minimum order"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('min_order')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.min_order?.message}</FormMessage>
              </FormItem>

              {/* Maximum Order - 33% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Maximum Order <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter maximum order"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('max_order')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.max_order?.message}</FormMessage>
              </FormItem>
            </div>

            {/* Per Quantity and Average Time - 50% width each - REQUIRED */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Per Quantity - 50% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Per Quantity (Default: 1000) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={1}
                    placeholder="Enter per quantity (default: 1000)"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('perqty')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.perqty?.message}</FormMessage>
              </FormItem>

              {/* Average Time - 50% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Average Time <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    placeholder="e.g., 1-2 hours, 24 hours"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    {...register('avg_time')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.avg_time?.message}</FormMessage>
              </FormItem>
            </div>

            {/* Refill - 100% width - REQUIRED */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Refill <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('refill', {
                    setValueAs: (value) => value === 'true'
                  })}
                  disabled={isPending}
                  required
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </FormControl>
              <FormMessage>{errors.refill?.message}</FormMessage>
            </FormItem>

            {/* Refill Days - 50% width (show only when refill is on) - REQUIRED */}
            {refillValue === true && (
              <FormItem className="md:col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Refill Days <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter refill days"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('refillDays')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.refillDays?.message}</FormMessage>
              </FormItem>
            )}

            {/* Refill Display - 50% width (show only when refill is on) - REQUIRED */}
            {refillValue === true && (
              <FormItem className="md:col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Refill Display (in hours){' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter refill display hours"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('refillDisplay')}
                    disabled={isPending}

                  />
                </FormControl>
                <FormMessage>{errors.refillDisplay?.message}</FormMessage>
              </FormItem>
            )}

            {/* Cancel - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Cancel <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('cancel', {
                    setValueAs: (value) => value === 'true'
                  })}
                  disabled={isPending}
                  required
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </FormControl>
              <FormMessage>{errors.cancel?.message}</FormMessage>
            </FormItem>

            {/* Personalized Service - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Personalized Service <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('personalizedService')}
                  disabled={isPending}
                  required
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </FormControl>
              <FormMessage>{errors.personalizedService?.message}</FormMessage>
            </FormItem>

            {/* Order Link - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Order Link <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('orderLink')}
                  disabled={isPending}
                  required
                >
                  <option value="link">Link</option>
                  <option value="username">Username</option>
                </select>
              </FormControl>
              <FormMessage>{errors.orderLink?.message}</FormMessage>
            </FormItem>

            {/* Service Speed - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Speed <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('serviceSpeed')}
                  disabled={isPending}
                  required
                >
                  <option value="">Select Service Speed</option>
                  <option value="slow">Slow</option>
                  <option value="sometimes_slow">Sometimes Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </FormControl>
              <FormMessage>{errors.serviceSpeed?.message}</FormMessage>
            </FormItem>
          </div>

          {/* Service Description - 100% width - REQUIRED */}
          <FormItem>
            <FormLabel
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Service Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <textarea
                placeholder="Enter service description"
                className="form-field w-full min-h-[120px] resize-y px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                {...register('description')}
                disabled={isPending}
                required
              />
            </FormControl>
            <FormMessage>{errors.description?.message}</FormMessage>
          </FormItem>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex items-center gap-2 px-8 py-3"
            >
              {isPending ? (
                <>
                  <GradientSpinner size="w-4 h-4" />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  Update Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function AdminServicesPage() {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `All Services — ${APP_NAME}`;
  }, []);

  // Hooks
  const user = useCurrentUser();
  const { data, error, isLoading, mutate: refreshServices } = useGetServices();
  const { data: categoriesData, mutate: refreshCategories } = useGetCategories();

  // Global refresh function for live updates
  const refreshAllData = useCallback(async () => {
    try {
      await Promise.all([
        refreshServices(),
        refreshCategories(),
        // Refresh stats
        fetch('/api/admin/services/stats').then(res => res.json()).then(data => {
          if (data.data) {
            setStats(prev => ({
              ...prev,
              ...data.data,
              totalCategories: categoriesData?.data?.length || prev.totalCategories,
            }));
          }
        })
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [refreshServices, refreshCategories, categoriesData?.data?.length]);

  // State declarations
  const [stats, setStats] = useState({
    totalServices: 0,
    totalCategories: 0,
    activeServices: 0,
    inactiveServices: 0,
  });
  
  const [statsLoading, setStatsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState('25');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // ServiceTable related state
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<any>({});
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [allCategoriesCollapsed, setAllCategoriesCollapsed] = useState(false);
  const [activeCategoryToggles, setActiveCategoryToggles] = useState<{[key: string]: boolean}>({});
  
  // Drag and drop state for categories
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [dropTargetCategory, setDropTargetCategory] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  // Drag and drop state for services
  const [draggedService, setDraggedService] = useState<string | null>(null);
  const [serviceOrder, setServiceOrder] = useState<{[categoryName: string]: string[]}>({});
  const [dropTargetService, setDropTargetService] = useState<string | null>(null);
  const [dropPositionService, setDropPositionService] = useState<'before' | 'after' | null>(null);

  // Create Service Modal state
  const [createServiceModal, setCreateServiceModal] = useState(false);
  const [createServiceModalClosing, setCreateServiceModalClosing] = useState(false);

  // Create Category Modal state
  const [createCategoryModal, setCreateCategoryModal] = useState(false);
  const [createCategoryModalClosing, setCreateCategoryModalClosing] = useState(false);

  // Edit Category Modal state
  const [editCategoryModal, setEditCategoryModal] = useState<{
    open: boolean;
    categoryId: string;
    categoryName: string;
    closing: boolean;
  }>({
    open: false,
    categoryId: '',
    categoryName: '',
    closing: false,
  });

  // Edit Service Modal state with animation
  const [editServiceModal, setEditServiceModal] = useState<{
    open: boolean;
    serviceId: number;
    closing: boolean;
  }>({
    open: false,
    serviceId: 0,
    closing: false,
  });

  // Delete confirmation modal state
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteConfirmationModalClosing, setDeleteConfirmationModalClosing] = useState(false);

  // Delete category modal state
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<{
    open: boolean;
    categoryName: string;
    categoryId: string;
    servicesCount: number;
    closing: boolean;
  }>({
    open: false,
    categoryName: '',
    categoryId: '',
    servicesCount: 0,
    closing: false,
  });

  // NEW: Add state for selected bulk operation
  const [selectedBulkOperation, setSelectedBulkOperation] = useState('');

  // Show toast notification - defined early
  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Filter and group services by category with service ordering
  const groupedServices = useMemo(() => {
    if (!data?.data) return {} as Record<string, any[]>;

    const filtered = data.data.filter((service: any) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.category_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        service.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.id?.toString().includes(searchTerm);

      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'active')
        return matchesSearch && service.status === 'active';
      if (statusFilter === 'inactive')
        return matchesSearch && service.status === 'inactive';

      return matchesSearch;
    });

    // Initialize grouped object with all categories
    const grouped: Record<string, any[]> = {};
    
    // Add all categories from categoriesData, even if empty
    if (categoriesData?.data) {
      categoriesData.data.forEach((category: any) => {
        grouped[category.category_name] = [];
      });
    }

    // Group filtered services by category
    filtered.forEach((service: any) => {
      const categoryName = service.category?.category_name || 'Uncategorized';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(service);
    });

    // Apply custom service order within each category
    Object.keys(grouped).forEach(category => {
      const categoryServices = grouped[category];
      const customOrder = serviceOrder[category];
      
      if (customOrder && customOrder.length > 0) {
        const orderedServices: any[] = [];
        
        customOrder.forEach(serviceId => {
          const service = categoryServices.find(s => s.id === serviceId);
          if (service) {
            orderedServices.push(service);
          }
        });
        
        categoryServices.forEach(service => {
          if (!customOrder.includes(service.id)) {
            orderedServices.push(service);
          }
        });
        
        grouped[category] = orderedServices;
      } else {
        grouped[category].sort((a: any, b: any) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];

          if (sortBy === 'rate' || sortBy === 'provider_price') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
          }

          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }
    });

    // Apply custom category order if available
    if (categoryOrder.length > 0) {
      const orderedGrouped: Record<string, any[]> = {};
      
      // First add categories in custom order
      categoryOrder.forEach(categoryName => {
        if (grouped[categoryName]) {
          orderedGrouped[categoryName] = grouped[categoryName];
        }
      });
      
      // Then add any remaining categories that aren't in the custom order
      Object.keys(grouped).forEach(categoryName => {
        if (!categoryOrder.includes(categoryName)) {
          orderedGrouped[categoryName] = grouped[categoryName];
        }
      });
      
      return orderedGrouped;
    }

    return grouped;
  }, [data?.data, categoriesData?.data, searchTerm, statusFilter, sortBy, sortOrder, categoryOrder, serviceOrder]);

  // Utility functions that use groupedServices - defined after groupedServices
  const getStatusIcon = (status: string) => {
    if (status === 'inactive') {
      return <FaTimesCircle className="h-3 w-3 text-red-500" />;
    }
    return <FaCheckCircle className="h-3 w-3 text-green-500" />;
  };

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleAllCategories = () => {
    const allCategoryNames = Object.keys(groupedServices);
    
    if (allCategoriesCollapsed) {
      // Expand all - clear collapsed categories
      setCollapsedCategories([]);
      setAllCategoriesCollapsed(false);
    } else {
      // Collapse all - add all categories to collapsed
      setCollapsedCategories(allCategoryNames);
      setAllCategoriesCollapsed(true);
    }
  };

  const handleSelectAll = () => {
    const allServices = Object.values(groupedServices).flat();
    if (selectedServices.length === allServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(allServices.map((service: any) => service.id));
    }
  };

  const handleSelectCategory = (categoryServices: any[]) => {
    const categoryIds = categoryServices.map(service => service.id);
    const allSelected = categoryIds.every(id => selectedServices.includes(id));
    
    if (allSelected) {
      setSelectedServices(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedServices(prev => [...new Set([...prev, ...categoryIds])]);
    }
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleEditService = (serviceId: number) => {
    setEditServiceModal({
      open: true,
      serviceId: serviceId,
      closing: false,
    });
  };

  const handleCreateService = () => {
    setCreateServiceModal(true);
    setCreateServiceModalClosing(false);
  };

  const handleCreateCategory = () => {
    setCreateCategoryModal(true);
    setCreateCategoryModalClosing(false);
  };



  const handleCloseEditModal = () => {
    setEditServiceModal(prev => ({ ...prev, closing: true }));
    setTimeout(() => {
      setEditServiceModal({ open: false, serviceId: 0, closing: false });
    }, 300); // Match animation duration
  };

  const handleCloseCreateModal = () => {
    setCreateServiceModalClosing(true);
    setTimeout(() => {
      setCreateServiceModal(false);
      setCreateServiceModalClosing(false);
    }, 300); // Match animation duration
  };

  const handleCloseCategoryModal = () => {
    setCreateCategoryModalClosing(true);
    setTimeout(() => {
      setCreateCategoryModal(false);
      setCreateCategoryModalClosing(false);
    }, 300); // Match animation duration
  };

  const handleCloseEditCategoryModal = () => {
    setEditCategoryModal(prev => ({ ...prev, closing: true }));
    setTimeout(() => {
      setEditCategoryModal({ open: false, categoryId: '', categoryName: '', closing: false });
    }, 300); // Match animation duration
  };

  const handleOpenDeleteConfirmation = () => {
    if (selectedServices.length === 0) {
      showToast('No services selected', 'error');
      return;
    }
    setDeleteConfirmationModal(true);
    setDeleteConfirmationModalClosing(false);
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmationModalClosing(true);
    setTimeout(() => {
      setDeleteConfirmationModal(false);
      setDeleteConfirmationModalClosing(false);
    }, 300); // Match animation duration
  };

  // Category drag and drop handlers
  const handleDragStart = (e: React.DragEvent, categoryName: string) => {
    console.log('Category drag start:', categoryName);
    setDraggedCategory(categoryName);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', categoryName);
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, targetCategoryName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedCategory || draggedCategory === targetCategoryName) {
      return;
    }

    // Calculate drop position based on mouse position within the element
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';
    
    setDropTargetCategory(targetCategoryName);
    setDropPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropTargetCategory(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCategoryName: string) => {
    e.preventDefault();
    console.log('Category dropped:', draggedCategory, 'on', targetCategoryName);
    
    if (!draggedCategory || draggedCategory === targetCategoryName || !dropPosition) {
      setDraggedCategory(null);
      setDropTargetCategory(null);
      setDropPosition(null);
      return;
    }

    const currentCategories = Object.keys(groupedServices);
    const newOrder = [...currentCategories];
    
    const draggedIndex = newOrder.indexOf(draggedCategory);
    const targetIndex = newOrder.indexOf(targetCategoryName);
    
    // Remove dragged category from its current position
    newOrder.splice(draggedIndex, 1);
    
    // Calculate final position based on drop position
    let finalIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      finalIndex = targetIndex - 1; // Adjust for removal
    }
    
    if (dropPosition === 'after') {
      finalIndex += 1;
    }
    
    // Insert dragged category at final position
    newOrder.splice(finalIndex, 0, draggedCategory);
    
    setCategoryOrder(newOrder);
    setDraggedCategory(null);
    setDropTargetCategory(null);
    setDropPosition(null);
    
    showToast(`Moved "${draggedCategory}" category`, 'success');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('Category drag end');
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging');
    setDraggedCategory(null);
    setDropTargetCategory(null);
    setDropPosition(null);
  };

  // Service drag and drop handlers
  const handleServiceDragStart = (e: React.DragEvent, serviceId: string) => {
    console.log('Service drag start:', serviceId);
    setDraggedService(serviceId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', serviceId);
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
  };

  const handleServiceDragOver = (e: React.DragEvent, targetServiceId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedService || draggedService === targetServiceId) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';
    
    setDropTargetService(targetServiceId);
    setDropPositionService(position);
  };

  const handleServiceDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropTargetService(null);
      setDropPositionService(null);
    }
  };

  const handleServiceDrop = (e: React.DragEvent, targetServiceId: string, categoryName: string) => {
    e.preventDefault();
    console.log('Service dropped:', draggedService, 'on', targetServiceId);
    
    if (!draggedService || draggedService === targetServiceId || !dropPositionService) {
      setDraggedService(null);
      setDropTargetService(null);
      setDropPositionService(null);
      return;
    }

    const categoryServices = groupedServices[categoryName] || [];
    const currentServiceIds = categoryServices.map((s: any) => s.id);
    const currentOrder = serviceOrder[categoryName] || currentServiceIds;
    const newOrder = [...currentOrder];
    
    const draggedIndex = newOrder.indexOf(draggedService);
    const targetIndex = newOrder.indexOf(targetServiceId);
    
    newOrder.splice(draggedIndex, 1);
    
    let finalIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      finalIndex = targetIndex - 1;
    }
    
    if (dropPositionService === 'after') {
      finalIndex += 1;
    }
    
    newOrder.splice(finalIndex, 0, draggedService);
    
    setServiceOrder(prev => ({
      ...prev,
      [categoryName]: newOrder
    }));
    
    setDraggedService(null);
    setDropTargetService(null);
    setDropPositionService(null);
    
    const draggedServiceObj = categoryServices.find((s: any) => s.id === draggedService);
    showToast(`Moved "${draggedServiceObj?.name || 'Service'}" in ${categoryName}`, 'success');
  };

  const handleServiceDragEnd = (e: React.DragEvent) => {
    console.log('Service drag end');
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging');
    setDraggedService(null);
    setDropTargetService(null);
    setDropPositionService(null);
  };

  // API functions
  const toggleServiceStatus = async (service: any) => {
    try {
      setIsUpdating(true);
      const response = await axiosInstance.post(
        '/api/admin/services/toggle-status',
        {
          id: service.id,
          status: service.status,
        }
      );

      if (response.data.success) {
        showToast(response.data.message, 'success');
        await refreshAllData();
      } else {
        showToast('Failed to update service status', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleRefill = async (service: any) => {
    try {
      const response = await axiosInstance.post(
        '/api/admin/services/toggle-refill',
        {
          id: service.id,
          refill: !service.refill,
        }
      );

      if (response.data.success) {
        showToast('Refill setting updated', 'success');
        await refreshAllData();
      } else {
        showToast('Failed to update refill setting', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    }
  };

  const toggleCancel = async (service: any) => {
    try {
      const response = await axiosInstance.post(
        '/api/admin/services/toggle-cancel',
        {
          id: service.id,
          cancel: !service.cancel,
        }
      );

      if (response.data.success) {
        showToast('Cancel setting updated', 'success');
        await refreshAllData();
      } else {
        showToast('Failed to update cancel setting', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    }
  };

  const toggleCategoryAndServices = async (categoryName: string, services: any[]) => {
    try {
      setIsUpdating(true);
      const newToggleState = !activeCategoryToggles[categoryName];

      // Find the category data
      const categoryData = categoriesData?.data?.find((cat: any) => cat.category_name === categoryName);
      if (!categoryData) {
        showToast('Category not found', 'error');
        return;
      }

      showToast(`${newToggleState ? 'Activating' : 'Deactivating'} ${services.length} services in ${categoryName}...`, 'pending');

      setActiveCategoryToggles(prev => ({
        ...prev,
        [categoryName]: newToggleState
      }));

      // Main feature: Toggle all services in category
      const promises = services.map(service =>
        axiosInstance.post('/api/admin/services/toggle-status', {
          id: service.id,
          status: service.status,
        })
      );

      await Promise.all(promises);

      // Extra feature: Update category hideCategory field based on toggle state
      const hideCategory = newToggleState ? 'no' : 'yes';
      await axiosInstance.put(`/api/admin/categories/${categoryData.id}`, {
        category_name: categoryData.category_name,
        position: categoryData.position,
        hideCategory: hideCategory
      });

      showToast(`Successfully ${newToggleState ? 'activated' : 'deactivated'} ${categoryName} category`, 'success');
      await refreshAllData();
    } catch (error: any) {
      setActiveCategoryToggles(prev => ({
        ...prev,
        [categoryName]: !activeCategoryToggles[categoryName]
      }));
      showToast(`Error updating ${categoryName}: ${error.message || 'Something went wrong'}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteService = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this service?');
    if (!confirmDelete) return;

    try {
      console.log('Deleting service with ID:', id);
      const response = await axiosInstance.delete(`/api/admin/services/delete-services?id=${id}`);
      console.log('Delete response:', response.data);

      if (response.data.success) {
        showToast(response.data.message || 'Service deleted successfully', 'success');
        await refreshAllData();
      } else {
        showToast(response.data.error || 'Failed to delete service', 'error');
      }
    } catch (error: any) {
      console.error('Delete service error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete service';
      showToast(errorMessage, 'error');
    }
  };

  const deleteSelectedServices = async () => {
    if (selectedServices.length === 0) return;

    try {
      setIsUpdating(true);
      showToast(`Deleting ${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''}...`, 'pending');

      console.log('Deleting services:', selectedServices);

      // Delete services in parallel
      const deletePromises = selectedServices.map(serviceId =>
        axiosInstance.delete(`/api/admin/services/delete-services?id=${serviceId}`)
      );

      const results = await Promise.all(deletePromises);
      console.log('Delete results:', results);

      // Check if all deletions were successful
      const failedDeletions = results.filter(result => !result.data.success);

      if (failedDeletions.length > 0) {
        showToast(`Failed to delete ${failedDeletions.length} service${failedDeletions.length !== 1 ? 's' : ''}`, 'error');
      } else {
        showToast(`Successfully deleted ${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''}`, 'success');
      }

      setSelectedServices([]); // Clear selection
      await refreshAllData();
      handleCloseDeleteConfirmation();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
      showToast(`Error deleting services: ${errorMessage}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // NEW: Modified Batch Operations Handler - only sets the operation, doesn't execute
  const handleBatchOperationSelect = (operation: string) => {
    if (selectedServices.length === 0) {
      showToast('No services selected', 'error');
      return;
    }

    setSelectedBulkOperation(operation);
  };

  // NEW: Execute the selected batch operation
  const executeBatchOperation = async () => {
    if (selectedServices.length === 0) {
      showToast('No services selected', 'error');
      return;
    }

    if (!selectedBulkOperation) {
      showToast('No operation selected', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      const count = selectedServices.length;
      const serviceText = count !== 1 ? 'services' : 'service';

      switch (selectedBulkOperation) {
        case 'enable':
          showToast(`Enabling ${count} ${serviceText}...`, 'pending');
          await Promise.all(selectedServices.map(serviceId => 
            axiosInstance.post('/api/admin/services/toggle-status', { id: serviceId, status: 'inactive' })
          ));
          showToast(`Successfully enabled ${count} ${serviceText}`, 'success');
          break;

        case 'disable':
          showToast(`Disabling ${count} ${serviceText}...`, 'pending');
          await Promise.all(selectedServices.map(serviceId => 
            axiosInstance.post('/api/admin/services/toggle-status', { id: serviceId, status: 'active' })
          ));
          showToast(`Successfully disabled ${count} ${serviceText}`, 'success');
          break;

        case 'make-secret':
          showToast(`Making ${count} ${serviceText} secret...`, 'pending');
          // TODO: Implement secret functionality
          showToast(`Successfully made ${count} ${serviceText} secret`, 'success');
          break;

        case 'remove-secret':
          showToast(`Removing secret from ${count} ${serviceText}...`, 'pending');
          // TODO: Implement remove secret functionality
          showToast(`Successfully removed secret from ${count} ${serviceText}`, 'success');
          break;

        case 'delete-pricing':
          showToast(`Deleting custom pricing for ${count} ${serviceText}...`, 'pending');
          // TODO: Implement delete custom pricing functionality
          showToast(`Successfully deleted custom pricing for ${count} ${serviceText}`, 'success');
          break;

        case 'delete':
          handleOpenDeleteConfirmation();
          return; // Exit early, don't clear selection or refresh data yet

        case 'refill-enable':
          showToast(`Enabling refill for ${count} ${serviceText}...`, 'pending');
          await Promise.all(selectedServices.map(serviceId => 
            axiosInstance.post('/api/admin/services/toggle-refill', { id: serviceId, refill: true })
          ));
          showToast(`Successfully enabled refill for ${count} ${serviceText}`, 'success');
          break;

        case 'refill-disable':
          showToast(`Disabling refill for ${count} ${serviceText}...`, 'pending');
          await Promise.all(selectedServices.map(serviceId => 
            axiosInstance.post('/api/admin/services/toggle-refill', { id: serviceId, refill: false })
          ));
          showToast(`Successfully disabled refill for ${count} ${serviceText}`, 'success');
          break;

        case 'cancel-enable':
          showToast(`Enabling cancel for ${count} ${serviceText}...`, 'pending');
          await Promise.all(selectedServices.map(serviceId => 
            axiosInstance.post('/api/admin/services/toggle-cancel', { id: serviceId, cancel: true })
          ));
          showToast(`Successfully enabled cancel for ${count} ${serviceText}`, 'success');
          break;

        case 'cancel-disable':
          showToast(`Disabling cancel for ${count} ${serviceText}...`, 'pending');
          await Promise.all(selectedServices.map(serviceId => 
            axiosInstance.post('/api/admin/services/toggle-cancel', { id: serviceId, cancel: false })
          ));
          showToast(`Successfully disabled cancel for ${count} ${serviceText}`, 'success');
          break;

        default:
          showToast('Unknown operation', 'error');
          return;
      }

      // Clear selection and refresh data for all operations except delete
      if (selectedBulkOperation !== 'delete') {
        setSelectedServices([]);
        setSelectedBulkOperation(''); // Clear the selected operation
        await refreshAllData();
      }
    } catch (error: any) {
      showToast(`Error performing batch operation: ${error.message || 'Something went wrong'}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDeleteCategoryModal = (categoryName: string, categoryId: string, servicesCount: number) => {
    setDeleteCategoryModal({
      open: true,
      categoryName,
      categoryId,
      servicesCount,
      closing: false,
    });
  };

  const handleCloseDeleteCategoryModal = () => {
    setDeleteCategoryModal(prev => ({ ...prev, closing: true }));
    setTimeout(() => {
      setDeleteCategoryModal({ open: false, categoryName: '', categoryId: '', servicesCount: 0, closing: false });
    }, 300); // Match animation duration
  };

  const editCategory = (categoryName: string, categoryId: string) => {
    setEditCategoryModal({
      open: true,
      categoryId: categoryId,
      categoryName: categoryName,
      closing: false,
    });
  };

  const deleteCategory = async (action: 'delete' | 'move', targetCategoryId?: string) => {
    const { categoryName, categoryId, servicesCount } = deleteCategoryModal;

    try {
      setIsUpdating(true);
      console.log('Deleting category:', { action, categoryId, categoryName, servicesCount, targetCategoryId });

      if (action === 'move' && targetCategoryId) {
        // First move all services to the target category
        showToast(`Moving ${servicesCount} service${servicesCount !== 1 ? 's' : ''} to new category...`, 'pending');

        const moveResponse = await axiosInstance.put(`/api/admin/services/move-category`, {
          fromCategoryId: categoryId,
          toCategoryId: targetCategoryId
        });

        console.log('Move response:', moveResponse.data);

        if (!moveResponse.data.success) {
          showToast(moveResponse.data.error || 'Failed to move services', 'error');
          return;
        }
      }

      // Then delete the category
      showToast(`Deleting "${categoryName}" category...`, 'pending');

      const response = await axiosInstance.delete(`/api/admin/categories/${categoryId}`);
      console.log('Delete category response:', response.data);

      if (response.data.success) {
        if (action === 'move') {
          showToast(`Successfully moved ${servicesCount} service${servicesCount !== 1 ? 's' : ''} and deleted "${categoryName}" category`, 'success');
        } else {
          showToast(response.data.message || `Successfully deleted "${categoryName}" category and all services`, 'success');
        }

        await refreshAllData();
        handleCloseDeleteCategoryModal();
      } else {
        showToast(response.data.error || 'Failed to delete category', 'error');
      }
    } catch (error: any) {
      console.error('Delete category error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = () => {
    setStatsLoading(true);
    setServicesLoading(true);
    showToast('Services refreshed successfully!', 'success');
    setTimeout(() => {
      setStatsLoading(false);
      setServicesLoading(false);
    }, 1500);
  };

  // Effects - all defined after groupedServices and functions
  useEffect(() => {
    const fetchServiceStats = async () => {
      try {
        const response = await fetch('/api/admin/services/stats');
        if (response.ok) {
          const data = await response.json();
          const baseStats = data.data || {
            totalServices: 0,
            activeServices: 0,
            inactiveServices: 0,
          };
          
          // Calculate total categories from categoriesData
          const totalCategories = categoriesData?.data?.length || 0;
          
          setStats({
            ...baseStats,
            totalCategories,
          });
        }
      } catch (error) {
        console.error('Failed to fetch service stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchServiceStats();
    const timer = setTimeout(() => setStatsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [categoriesData?.data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setServicesLoading(true);
      setTimeout(() => setServicesLoading(false), 1000);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setServicesLoading(true);
    setTimeout(() => setServicesLoading(false), 800);
  }, [statusFilter]);

  useEffect(() => {
    if (data?.data && Object.keys(groupedServices).length > 0) {
      const initialToggles: {[key: string]: boolean} = {};
      const allCategoryNames = Object.keys(groupedServices);
      
      Object.keys(groupedServices).forEach(categoryName => {
        // Find the category data to check hideCategory field
        const categoryData = categoriesData?.data?.find((cat: any) => cat.category_name === categoryName);
        // If hideCategory is "no" then category is active (toggle ON), if "yes" then inactive (toggle OFF)
        initialToggles[categoryName] = categoryData?.hideCategory === 'no';
      });
      setActiveCategoryToggles(initialToggles);
      
      // Initialize category order if not set
      if (categoryOrder.length === 0) {
        setCategoryOrder(Object.keys(groupedServices));
      }

      // Update allCategoriesCollapsed state based on current collapsed categories
      const allCollapsed = allCategoryNames.length > 0 && allCategoryNames.every(cat => collapsedCategories.includes(cat));
      setAllCategoriesCollapsed(allCollapsed);
    }
  }, [data?.data, groupedServices, categoryOrder.length, collapsedCategories, categoriesData?.data]);

  // Handle keyboard events for modal close and body scroll lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editServiceModal.open) {
          handleCloseEditModal();
        } else if (createServiceModal) {
          handleCloseCreateModal();
        } else if (createCategoryModal) {
          handleCloseCategoryModal();
        } else if (editCategoryModal.open) {
          handleCloseEditCategoryModal();
        } else if (deleteConfirmationModal) {
          handleCloseDeleteConfirmation();
        } else if (deleteCategoryModal.open) {
          handleCloseDeleteCategoryModal();
        }
      }
    };

    // Lock body scroll when any modal is open
    if (editServiceModal.open || createServiceModal || createCategoryModal || editCategoryModal.open || deleteConfirmationModal || deleteCategoryModal.open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [editServiceModal.open, createServiceModal, createCategoryModal, editCategoryModal.open, deleteConfirmationModal, deleteCategoryModal.open]);

  const serviceStats = [
    {
      title: 'Total Services',
      value: stats.totalServices,
      icon: <FaBriefcase className="h-6 w-6" />,
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: <FaTags className="h-6 w-6" />,
      textColor: 'text-purple-600',
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: <FaCheckCircle className="h-6 w-6" />,
      textColor: 'text-green-600',
    },
    {
      title: 'Inactive Services',
      value: stats.inactiveServices,
      icon: <FaShieldAlt className="h-6 w-6" />,
      textColor: 'text-red-600',
    },
  ];

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {serviceStats.map((stat, index) => (
            <div 
              key={stat.title} 
              className="card card-padding animate-in fade-in duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="card-content">
                <div className="card-icon">{stat.icon}</div>
                <div>
                  <h3 className="card-title">{stat.title}</h3>
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <GradientSpinner size="w-6 h-6" />
                      <span className="text-lg text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <p className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Section - After stats cards */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Left: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
              {/* Page View Dropdown */}
              <select 
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={servicesLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={servicesLoading || statsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button
                onClick={handleCreateService}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaPlus />
                Create Service
              </button>

              <button
                onClick={handleCreateCategory}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaPlus />
                Create Category
              </button>

              <Link
                href="/admin/services/import"
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5 w-full md:w-auto"
                title="Import Services"
              >
                <FaFileImport />
                Import Services
              </Link>
            </div>
            
            {/* Right: Search Controls Only */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${statusFilter === 'all' ? 'all' : statusFilter} services...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
              
              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="id">Service ID</option>
                <option value="name">Service Name</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Table with new card style */}
        <div className="card animate-in fade-in duration-500">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {/* Filter Buttons - Inside table header */}
            <div className="mb-4">
              <div className="block space-y-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'all'
                      ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'all'
                        ? 'bg-white/20'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {stats.totalServices.toLocaleString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'active'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Active
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'active'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {stats.activeServices.toLocaleString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'inactive'
                      ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Inactive
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'inactive'
                        ? 'bg-white/20'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stats.inactiveServices.toLocaleString()}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {servicesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">Loading services...</div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center py-20">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">Loading services...</div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <FaExclamationTriangle className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Error Loading Services
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
              </div>
            ) : !data || Object.keys(groupedServices).length === 0 ? (
              <div className="text-center py-12">
                <FaBox className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No information was found for you.
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {searchTerm
                    ? `No services match "${searchTerm}"`
                    : 'No services exist yet.'}
                </p>
              </div>
            ) : (
              <>
                {selectedServices.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {selectedServices.length} selected
                    </span>
                    
                    {/* Modified Batch Operations Dropdown */}
                    <select 
                      value={selectedBulkOperation}
                      onChange={(e) => {
                        handleBatchOperationSelect(e.target.value);
                      }}
                      disabled={isUpdating}
                      className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm disabled:opacity-50"
                    >
                      <option value="">Batch Operations</option>
                      <option value="enable">Enable Selected Services</option>
                      <option value="disable">Disable Selected Services</option>
                      <option value="make-secret">Make Selected Services Secret</option>
                      <option value="remove-secret">Remove Selected from Service Secret</option>
                      <option value="delete-pricing">Delete Selected Services Custom Pricing</option>
                      <option value="refill-enable">Refill Enable Selected Services</option>
                      <option value="refill-disable">Refill Disable Selected Services</option>
                      <option value="cancel-enable">Cancel Enable Selected Services</option>
                      <option value="cancel-disable">Cancel Disable Selected Services</option>
                      <option value="delete">Delete Selected Services</option>
                    </select>

                    {/* NEW: Save Changes Button */}
                    {selectedBulkOperation && (
                      <button
                        onClick={executeBatchOperation}
                        disabled={isUpdating}
                        className="btn btn-primary flex items-center gap-2 px-4 py-2.5 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <>
                            <GradientSpinner size="w-4 h-4" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Save Changes
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Servicees Table View */}
                <div className="lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[1200px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>ID</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Service</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Type</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Provider</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Price</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Min/Max</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Refill</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Cancel</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                        <th className="text-left p-3 font-semibold relative" style={{ color: 'var(--text-primary)' }}>
                          Actions
                          {/* Collapse/Expand All Toggle */}
                          <button
                            onClick={toggleAllCategories}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                            title={allCategoriesCollapsed ? "Expand all categories" : "Collapse all categories"}
                          >
                            {allCategoriesCollapsed ? (
                              <FaChevronDown className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                            ) : (
                              <FaChevronUp className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                            )}
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Object.entries(groupedServices) as [string, any[]][])
                        .sort(([categoryNameA], [categoryNameB]) => {
                          // Sort categories by position: top categories first, then bottom
                          const categoryA = categoriesData?.data?.find((cat: any) => cat.category_name === categoryNameA);
                          const categoryB = categoriesData?.data?.find((cat: any) => cat.category_name === categoryNameB);

                          const positionA = categoryA?.position || 'bottom';
                          const positionB = categoryB?.position || 'bottom';

                          if (positionA === 'top' && positionB === 'bottom') return -1;
                          if (positionA === 'bottom' && positionB === 'top') return 1;
                          return categoryNameA.localeCompare(categoryNameB);
                        })
                        .map(([categoryName, services], categoryIndex) => (
                        <Fragment key={categoryName}>
                          {/* Drop zone before category */}
                          {draggedCategory && draggedCategory !== categoryName && (
                            <tr 
                              className={`transition-all duration-200 ${
                                dropTargetCategory === categoryName && dropPosition === 'before'
                                  ? 'h-8 bg-blue-100 border-2 border-dashed border-blue-400'
                                  : 'h-1'
                              }`}
                              onDragOver={(e) => handleDragOver(e, categoryName)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, categoryName)}
                            >
                              <td colSpan={11}>
                                {dropTargetCategory === categoryName && dropPosition === 'before' && (
                                  <div className="flex items-center justify-center h-6 text-blue-600 text-sm font-medium">
                                    Drop here
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}

                          {/* Category Header Row */}
                          <tr 
                            className={`bg-gray-50 border-t-2 border-gray-200 ${
                              draggedCategory === categoryName ? 'opacity-50' : ''
                            }`}
                            onDragOver={(e) => handleDragOver(e, categoryName)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, categoryName)}
                          >
                            <td colSpan={11} className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FaGripVertical 
                                    className="h-4 w-4 text-gray-400 cursor-grab hover:text-gray-600 transition-colors active:cursor-grabbing select-none"
                                    title="Drag to reorder category"
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, categoryName)}
                                    onDragEnd={handleDragEnd}
                                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                                  />
                                  <button
                                    onClick={() => toggleCategory(categoryName)}
                                    className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
                                  >
                                    {collapsedCategories.includes(categoryName) ? (
                                      <FaChevronRight className="h-3 w-3" />
                                    ) : (
                                      <FaChevronDown className="h-3 w-3" />
                                    )}
                                  </button>

                                  {/* Category Toggle Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCategoryAndServices(categoryName, services);
                                    }}
                                    disabled={isUpdating}
                                    className={`p-1 rounded transition-colors ${
                                      activeCategoryToggles[categoryName]
                                        ? 'text-green-600 hover:bg-green-50'
                                        : 'text-red-600 hover:bg-red-50'
                                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={`${activeCategoryToggles[categoryName] ? 'Deactivate' : 'Activate'} ${categoryName} category`}
                                  >
                                    {isUpdating ? (
                                      <GradientSpinner size="w-4 h-4" />
                                    ) : activeCategoryToggles[categoryName] ? (
                                      <FaToggleOn className="h-4 w-4" />
                                    ) : (
                                      <FaToggleOff className="h-4 w-4" />
                                    )}
                                  </button>

                                  <span className="font-semibold text-md text-gray-800">
                                    {categoryName}
                                  </span>
                                  <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                    {services.length} service{services.length !== 1 ? 's' : ''}
                                  </span>
                                  
                                  {/* Category Edit Icon */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const category = categoriesData?.data?.find((cat: any) => cat.category_name === categoryName);
                                      if (category) {
                                        editCategory(categoryName, category.id);
                                      }
                                    }}
                                    disabled={isUpdating}
                                    className="p-1 hover:bg-blue-50 hover:text-blue-600 text-gray-400 rounded transition-colors disabled:opacity-50"
                                    title={`Edit ${categoryName} category`}
                                  >
                                    <FaEdit className="h-3 w-3" />
                                  </button>
                                  
                                  {/* Category Delete Icon */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const category = categoriesData?.data?.find((cat: any) => cat.category_name === categoryName);
                                      if (category) {
                                        handleOpenDeleteCategoryModal(categoryName, category.id, services.length);
                                      }
                                    }}
                                    disabled={isUpdating}
                                    className="p-1 hover:bg-red-50 hover:text-red-600 text-red-600 rounded transition-colors disabled:opacity-50"
                                    title={`Delete ${categoryName} category`}
                                  >
                                    <FaTrash className="h-3 w-3" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={services.every(service => selectedServices.includes(service.id))}
                                    onChange={() => handleSelectCategory(services)}
                                    className="rounded border-gray-300 w-4 h-4"
                                    title="Select all services in this category"
                                  />
                                  <span className="text-xs text-gray-500">Select All</span>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Services Rows */}
                          {!collapsedCategories.includes(categoryName) && (
                            services.length > 0 ? (
                              services.map((service: any, i: number) => (
                                <Fragment key={service.id}>
                                  {/* Drop zone before service */}
                                  {draggedService && draggedService !== service.id && (
                                    <tr 
                                      className={`transition-all duration-200 ${
                                        dropTargetService === service.id && dropPositionService === 'before'
                                          ? 'h-2 bg-blue-100'
                                          : 'h-0'
                                      }`}
                                      onDragOver={(e) => handleServiceDragOver(e, service.id)}
                                      onDragLeave={handleServiceDragLeave}
                                      onDrop={(e) => handleServiceDrop(e, service.id, categoryName)}
                                    >
                                      <td colSpan={11}>
                                        {dropTargetService === service.id && dropPositionService === 'before' && (
                                          <div className="h-1 bg-blue-400 rounded"></div>
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                  
                                  <tr 
                                    className={`border-t hover:bg-gray-50 transition-all duration-200 animate-in fade-in slide-in-from-left-1 ${
                                      draggedService === service.id ? 'opacity-50' : ''
                                    }`}
                                    style={{ animationDelay: `${i * 50}ms` }}
                                    onDragOver={(e) => handleServiceDragOver(e, service.id)}
                                    onDragLeave={handleServiceDragLeave}
                                    onDrop={(e) => handleServiceDrop(e, service.id, categoryName)}
                                  >
                                    <td className="p-3 pl-8">
                                      <div className="flex items-center gap-2">
                                        <FaGripVertical 
                                          className="h-3 w-3 text-gray-400 cursor-grab hover:text-gray-600 transition-colors active:cursor-grabbing select-none"
                                          title="Drag to reorder service"
                                          draggable={true}
                                          onDragStart={(e) => handleServiceDragStart(e, service.id)}
                                          onDragEnd={handleServiceDragEnd}
                                          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                                        />
                                        <input
                                          type="checkbox"
                                          checked={selectedServices.includes(service.id)}
                                          onChange={() => handleSelectService(service.id)}
                                          className="rounded border-gray-300 w-4 h-4"
                                        />
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        {service.id ? formatID(service.id) : 'null'}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div>
                                        <div className="font-medium text-sm truncate max-w-44" style={{ color: 'var(--text-primary)' }}>
                                          {service?.name || 'null'}
                                        </div>
                                        <div className="text-xs truncate max-w-44" style={{ color: 'var(--text-muted)' }}>
                                          {service.category?.category_name || 'null'}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800 w-fit">
                                        {service?.serviceType?.name || 'Standard'}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {service?.provider || 'null'}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="text-left">
                                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                          <PriceDisplay
                                            amount={service?.rate}
                                            originalCurrency={user?.currency || ('USD' as any)}
                                          />
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                          Cost: <PriceDisplay
                                            amount={service?.provider_price || service?.self_price || service?.cost_price || service?.rate}
                                            originalCurrency={user?.currency || ('USD' as any)}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div>
                                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                          {formatNumber(service?.min_order || 0)} - {formatNumber(service?.max_order || 0)}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                          Min / Max
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="space-y-2">
                                        <button
                                          onClick={() => toggleRefill(service)}
                                          className={`p-1 rounded transition-colors ${
                                            service.refill
                                              ? 'text-green-600 hover:bg-green-50'
                                              : 'text-red-600 hover:bg-red-50'
                                          }`}
                                          title={service.refill ? 'Disable Refill' : 'Enable Refill'}
                                        >
                                          {service.refill ? (
                                            <FaToggleOn className="h-5 w-5" />
                                          ) : (
                                            <FaToggleOff className="h-5 w-5" />
                                          )}
                                        </button>

                                        {/* Show Refill Details when refill is enabled */}
                                        {service.refill && (
                                          <div className="text-xs text-gray-600 space-y-1">
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
                                    <td className="p-3">
                                      <button
                                        onClick={() => toggleCancel(service)}
                                        className={`p-1 rounded transition-colors ${
                                          service.cancel
                                            ? 'text-green-600 hover:bg-green-50'
                                            : 'text-red-600 hover:bg-red-50'
                                        }`}
                                        title={service.cancel ? 'Disable Cancel' : 'Enable Cancel'}
                                      >
                                        {service.cancel ? (
                                          <FaToggleOn className="h-5 w-5" />
                                        ) : (
                                          <FaToggleOff className="h-5 w-5" />
                                        )}
                                      </button>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit">
                                        {getStatusIcon(service.status)}
                                        <span className="text-xs font-medium capitalize">
                                          {service.status || 'null'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-1">
                                        <button 
                                          onClick={() => handleEditService(service.id)}
                                          className="btn btn-secondary p-2"
                                          title="Edit Service"
                                        >
                                          <FaEdit className="h-3 w-3" />
                                        </button>
                                        
                                        {/* 3 Dot Menu */}
                                        <div className="relative">
                                          <button 
                                            className="btn btn-secondary p-2" 
                                            title="More Actions"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                              dropdown.classList.toggle('hidden');
                                            }}
                                          >
                                            <FaEllipsisH className="h-3 w-3" />
                                          </button>
                                          
                                          {/* Dropdown Menu */}
                                          <div className="hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <div className="py-1">
                                              <button
                                                onClick={() => {
                                                  toggleServiceStatus(service);
                                                  const dropdown = document.querySelector('.absolute.right-0') as HTMLElement;
                                                  dropdown?.classList.add('hidden');
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                              >
                                                <FaSync className="h-3 w-3" />
                                                {service.status === 'active' ? 'Deactivate' : 'Activate'} Service
                                              </button>
                                              <button
                                                onClick={() => {
                                                  deleteService(service?.id);
                                                  const dropdown = document.querySelector('.absolute.right-0') as HTMLElement;
                                                  dropdown?.classList.add('hidden');
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100 flex items-center gap-2"
                                              >
                                                <FaTrash className="h-3 w-3" />
                                                Delete Service
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                  
                                  {/* Drop zone after service */}
                                  {draggedService && draggedService !== service.id && (
                                    <tr 
                                      className={`transition-all duration-200 ${
                                        dropTargetService === service.id && dropPositionService === 'after'
                                          ? 'h-2 bg-blue-100'
                                          : 'h-0'
                                      }`}
                                      onDragOver={(e) => handleServiceDragOver(e, service.id)}
                                      onDragLeave={handleServiceDragLeave}
                                      onDrop={(e) => handleServiceDrop(e, service.id, categoryName)}
                                    >
                                      <td colSpan={11}>
                                        {dropTargetService === service.id && dropPositionService === 'after' && (
                                          <div className="h-1 bg-blue-400 rounded"></div>
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </Fragment>
                              ))
                            ) : (
                              <tr className="border-t">
                                <td colSpan={11} className="p-8 text-center">
                                  <div className="flex flex-col items-center justify-center text-gray-500">
                                    <FaBriefcase className="h-8 w-8 mb-2 text-gray-400" />
                                    <p className="text-sm font-medium">No services in this category</p>
                                    <p className="text-xs">Add services to populate this category</p>
                                  </div>
                                </td>
                              </tr>
                            )
                          )}

                          {/* Drop zone after category */}
                          {draggedCategory && draggedCategory !== categoryName && (
                            <tr 
                              className={`transition-all duration-200 ${
                                dropTargetCategory === categoryName && dropPosition === 'after'
                                  ? 'h-8 bg-blue-100 border-2 border-dashed border-blue-400'
                                  : 'h-1'
                              }`}
                              onDragOver={(e) => handleDragOver(e, categoryName)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, categoryName)}
                            >
                              <td colSpan={11}>
                                {dropTargetCategory === categoryName && dropPosition === 'after' && (
                                  <div className="flex items-center justify-center h-6 text-blue-600 text-sm font-medium">
                                    Drop here
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {servicesLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading pagination...</span>
                      </div>
                    ) : (() => {
                      const totalServices = Object.values(groupedServices).flat().length;
                      const from = totalServices > 0 ? 1 : 0;
                      const to = totalServices;
                      return `Showing ${from} to ${to} of ${totalServices} services`;
                    })()}
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button
                      disabled={servicesLoading}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {servicesLoading ? (
                        <GradientSpinner size="w-4 h-4" />
                      ) : (
                        `Page 1`
                      )}
                    </span>
                    <button
                      disabled={servicesLoading}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit Service Modal */}
        {editServiceModal.open && (
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              editServiceModal.closing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseEditModal}
          >
            <div 
              className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 ${
                editServiceModal.closing ? 'modal-content-exit' : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <EditServiceForm
                serviceId={editServiceModal.serviceId}
                onClose={handleCloseEditModal}
                showToast={showToast}
                refreshAllData={refreshAllData}
              />
            </div>
          </div>
        )}

        {/* Create Service Modal */}
        {createServiceModal && (
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              createServiceModalClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseCreateModal}
          >
            <div 
              className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 ${
                createServiceModalClosing ? 'modal-content-exit' : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <CreateServiceForm
                onClose={handleCloseCreateModal}
                showToast={showToast}
                onRefresh={refreshAllData}
                refreshAllData={refreshAllData}
              />
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        {createCategoryModal && (
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              createCategoryModalClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseCategoryModal}
          >
            <div 
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                createCategoryModalClosing ? 'modal-content-exit' : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <CreateCategoryForm
                onClose={handleCloseCategoryModal}
                showToast={showToast}
                onRefresh={refreshAllData}
              />
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editCategoryModal.open && (
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              editCategoryModal.closing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseEditCategoryModal}
          >
            <div 
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                editCategoryModal.closing ? 'modal-content-exit' : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <EditCategoryForm
                categoryId={editCategoryModal.categoryId}
                categoryName={editCategoryModal.categoryName}
                onClose={handleCloseEditCategoryModal}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmationModal && (
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              deleteConfirmationModalClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseDeleteConfirmation}
          >
            <div 
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                deleteConfirmationModalClosing ? 'modal-content-exit' : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteConfirmationModal
                onClose={handleCloseDeleteConfirmation}
                onConfirm={deleteSelectedServices}
                selectedCount={selectedServices.length}
              />
            </div>
          </div>
        )}

        {/* Delete Category Modal */}
        {deleteCategoryModal.open && (
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              deleteCategoryModal.closing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseDeleteCategoryModal}
          >
            <div 
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                deleteCategoryModal.closing ? 'modal-content-exit' : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteCategoryModal
                onClose={handleCloseDeleteCategoryModal}
                onConfirm={deleteCategory}
                categoryName={deleteCategoryModal.categoryName}
                categoryId={deleteCategoryModal.categoryId}
                isUpdating={isUpdating}
                servicesCount={deleteCategoryModal.servicesCount}
                categoriesData={categoriesData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminServicesPage;
