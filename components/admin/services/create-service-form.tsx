'use client';

import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  FaExclamationTriangle,
  FaPlus,
  FaTimes,
} from 'react-icons/fa';
import useSWR from 'swr';

import { useGetCategories } from '@/hooks/categories-fetch';
import axiosInstance from '@/lib/axiosInstance';
import {
  createServiceDefaultValues,
  CreateServiceSchema,
} from '@/lib/validators/admin/services/services.validator';

// Fetcher function for useSWR
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

// Custom Form Components
const FormItem = ({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={`space-y-2 ${className}`}>{children}</div>;

const FormLabel = ({
  className = '',
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => (
  <label className={`block text-sm font-medium ${className}`} style={style}>
    {children}
  </label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const FormMessage = ({
  className = '',
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) =>
  children ? (
    <div className={`text-xs text-red-500 mt-1 ${className}`}>{children}</div>
  ) : null;

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Create Service Form Component
export const CreateServiceForm: React.FC<{
  onClose: () => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info' | 'pending'
  ) => void;
  onRefresh?: () => void;
  refreshAllDataWithServices?: () => Promise<void>;
}> = ({ onClose, showToast, onRefresh, refreshAllDataWithServices }) => {
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetCategories();
  const {
    data: serviceTypesData,
    error: serviceTypesError,
    isLoading: serviceTypesLoading,
  } = useSWR('/api/admin/service-types', fetcher);

  // Debug service types data
  useEffect(() => {
    console.log('🔍 Service Types Debug in Admin Services:');
    console.log('📊 serviceTypesData:', serviceTypesData);
    console.log('📊 serviceTypesError:', serviceTypesError);
    console.log('📊 serviceTypesLoading:', serviceTypesLoading);
    if (serviceTypesData?.data) {
      console.log('📋 Service types count:', serviceTypesData.data.length);
      serviceTypesData.data.forEach((type: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${type.id}, Name: ${type.name}`);
      });
    }
  }, [serviceTypesData, serviceTypesError, serviceTypesLoading]);
  const {
    data: providersData,
    error: providersError,
    isLoading: providersLoading,
  } = useSWR('/api/admin/providers?filter=active', fetcher);



  const [isPending, startTransition] = useTransition();
  const [orderLinkType, setOrderLinkType] = useState<'link' | 'username'>('link');

  // Helper function to detect if service requires username based on name/type patterns
  const detectOrderLinkType = useCallback((serviceName: string, serviceType?: string): 'link' | 'username' => {
    const name = serviceName.toLowerCase();
    const type = serviceType?.toLowerCase() || '';
    
    // Keywords that typically require username
    const usernameKeywords = ['comment', 'mention', 'reply', 'custom', 'dm', 'message', 'tag'];
    
    // Keywords that typically require link
    const linkKeywords = ['follower', 'like', 'view', 'subscriber', 'share', 'watch', 'impression'];
    
    // Check for username patterns first (more specific)
    if (usernameKeywords.some(keyword => name.includes(keyword) || type.includes(keyword))) {
      return 'username';
    }
    
    // Check for link patterns
    if (linkKeywords.some(keyword => name.includes(keyword) || type.includes(keyword))) {
      return 'link';
    }
    
    // Default to link if uncertain
    return 'link';
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateServiceSchema>({
    mode: 'onChange',
    // No resolver to allow empty fields
    defaultValues: {
      ...createServiceDefaultValues,
      mode: 'manual', // Set default mode to manual
      orderLink: 'link', // Set default order link to 'link'
    },
  });

  // Auto-select Default service type when service types are loaded
  useEffect(() => {
    if (serviceTypesData?.data && !watch('serviceTypeId')) {
      const defaultServiceType = serviceTypesData.data.find(
        (serviceType: any) => serviceType.name === 'Default'
      );
      if (defaultServiceType) {
        setValue('serviceTypeId', defaultServiceType.id.toString());
      }
    }
  }, [serviceTypesData, setValue, watch]);

  // Watch refill field to control readonly state of refill days and display
  const refillValue = watch('refill');
  
  // Watch mode field to control API provider field visibility
  const modeValue = watch('mode');


  
  // Watch provider field for API services
  const providerIdValue = watch('providerId');

  // Fetch API services when provider is selected
  const {
    data: apiServicesData,
    error: apiServicesError,
    isLoading: apiServicesLoading,
  } = useSWR(
    modeValue === 'auto' && providerIdValue ? `/api/admin/providers/${providerIdValue}/services` : null,
    fetcher
  );

  // Watch API service selection for auto-fill
  const providerServiceIdValue = watch('providerServiceId');

  // Function to map API service type to internal service type ID
  const mapApiServiceTypeToInternalType = (apiServiceType: string): string | null => {
    if (!apiServiceType || !serviceTypesData?.data) return null;
    
    // Normalize the API service type for comparison
    const normalizedApiType = apiServiceType.toLowerCase().trim();
    
    // Define mapping rules (case-insensitive)
    const typeMapping: { [key: string]: string[] } = {
      '1': ['default', 'standard', 'normal', 'regular', 'basic'], // Default
      '2': ['package', 'pack', 'bundle', 'fixed'], // Package
      '3': ['special comments', 'custom comments', 'comments', 'special comment'], // Special Comments
      '4': ['package comments', 'pack comments', 'bundle comments', 'package comment'], // Package Comments
      '11': ['auto likes', 'auto like', 'subscription likes', 'auto-likes'], // Auto Likes
      '12': ['auto views', 'auto view', 'subscription views', 'auto-views'], // Auto Views
      '13': ['auto comments', 'auto comment', 'subscription comments', 'auto-comments'], // Auto Comments
      '14': ['limited auto likes', 'limited likes', 'limited auto like'], // Limited Auto Likes
      '15': ['limited auto views', 'limited views', 'limited auto view'], // Limited Auto Views
    };
    
    // Find matching service type
    for (const [internalTypeId, apiTypeVariants] of Object.entries(typeMapping)) {
      if (apiTypeVariants.some(variant => normalizedApiType.includes(variant))) {
        // Verify this service type exists in our system
        const serviceTypeExists = serviceTypesData.data.find(
          (type: any) => type.id.toString() === internalTypeId
        );
        if (serviceTypeExists) {
          return internalTypeId;
        }
      }
    }
    
    // If no exact match found, try partial matching
    for (const serviceType of serviceTypesData.data) {
      const normalizedInternalName = serviceType.name.toLowerCase();
      if (normalizedApiType.includes(normalizedInternalName) || 
          normalizedInternalName.includes(normalizedApiType)) {
        return serviceType.id.toString();
      }
    }
    
    return null; // No match found
  };

  // Auto-fill form fields when API service is selected
  useEffect(() => {
    if (providerServiceIdValue && apiServicesData?.data?.services) {
      const selectedService = apiServicesData.data.services.find(
        (service: any) => service.id.toString() === providerServiceIdValue
      );
      
      if (selectedService) {
        setValue('name', selectedService.name || '');
        setValue('description', selectedService.description || '');
        setValue('rate', selectedService.rate?.toString() || '');
        setValue('min_order', selectedService.min?.toString() || '');
        setValue('max_order', selectedService.max?.toString() || '');
        setValue('perqty', '1000'); // Keep default per quantity
        setValue('avg_time', '0-1 hours'); // Default average time
        
        // Auto-fill service type based on API service type
        if (selectedService.type && serviceTypesData?.data) {
          const mappedServiceTypeId = mapApiServiceTypeToInternalType(selectedService.type);
          if (mappedServiceTypeId) {
            setValue('serviceTypeId', mappedServiceTypeId);
            console.log(`🎯 Auto-filled service type: ${selectedService.type} → ID ${mappedServiceTypeId}`);
          } else {
            console.log(`⚠️ No mapping found for service type: ${selectedService.type}`);
          }
        }
        
        // Auto-fill refill and cancel settings from provider service
        // Handle refill field - convert to boolean for form
        let refillBoolValue = false; // default
        if (selectedService.refill !== undefined && selectedService.refill !== null) {
          if (typeof selectedService.refill === 'boolean') {
            refillBoolValue = selectedService.refill;
          } else if (typeof selectedService.refill === 'string') {
            const refillStr = selectedService.refill.toLowerCase();
            refillBoolValue = (refillStr === 'true' || refillStr === '1' || refillStr === 'on' || refillStr === 'yes');
          } else if (typeof selectedService.refill === 'number') {
            refillBoolValue = selectedService.refill > 0;
          }
        }
        
        // Handle cancel field - convert to boolean for form
        let cancelBoolValue = false; // default
        if (selectedService.cancel !== undefined && selectedService.cancel !== null) {
          if (typeof selectedService.cancel === 'boolean') {
            cancelBoolValue = selectedService.cancel;
          } else if (typeof selectedService.cancel === 'string') {
            const cancelStr = selectedService.cancel.toLowerCase();
            cancelBoolValue = (cancelStr === 'true' || cancelStr === '1' || cancelStr === 'on' || cancelStr === 'yes');
          } else if (typeof selectedService.cancel === 'number') {
            cancelBoolValue = selectedService.cancel > 0;
          }
        }
        
        setValue('refill', refillBoolValue);
        setValue('cancel', cancelBoolValue);
        
        // Set refill days and refill display if refill is enabled
        if (refillBoolValue) {
          // Set default values for refill days and display if not provided
          const refillDays = selectedService.refillDays || selectedService.refill_days || 30;
          const refillDisplay = selectedService.refillDisplay || selectedService.refill_display || 24;
          
          setValue('refillDays', Number(refillDays) as any);
          setValue('refillDisplay', Number(refillDisplay) as any);
        } else {
          // Clear refill days and display when refill is disabled
          setValue('refillDays', undefined as any);
          setValue('refillDisplay', undefined as any);
        }
        
        // Detect and set order link type based on service name and type
        const detectedType = detectOrderLinkType(selectedService.name, selectedService.type);
        setValue('orderLink', detectedType);
        setOrderLinkType(detectedType);
      }
    } else {
      // Reset to default when no API service is selected
      setValue('orderLink', 'link');
      setOrderLinkType('link');
      setValue('refill', false);
      setValue('cancel', false);
      setValue('refillDays', undefined as any);
      setValue('refillDisplay', undefined as any);
    }
  }, [providerServiceIdValue, apiServicesData, serviceTypesData, detectOrderLinkType]);

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

    // Validate API provider when mode is auto
    if (values.mode === 'auto' && (!values.providerId || values.providerId === '')) {
      showToast('Please select an API provider when mode is Auto (API)', 'error');
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
        const response = await axiosInstance.post(
          '/api/admin/services',
          filteredValues
        );
        console.log('API response:', response.data);
        if (response.data.success) {
          reset();
          showToast(response.data.message, 'success');
          // Live refresh all data
          if (refreshAllDataWithServices) {
            await refreshAllDataWithServices();
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
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
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
          <p className="text-gray-500 text-sm mt-1">
            Please add categories first
          </p>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
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
                Service Name <span className="text-red-500">*</span>
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
                Service Category <span className="text-red-500">*</span>
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

            {/* API Provider - 100% width - CONDITIONAL - Only show when mode is auto */}
            {modeValue === 'auto' && (
              <FormItem className="md:col-span-2">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  API Provider <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    {...register('providerId')}
                    disabled={isPending || providersLoading}
                    required={modeValue === 'auto'}
                  >
                    <option value="">Select API Provider</option>
                    {providersData?.data?.providers?.map((provider: any) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage>{errors.providerId?.message}</FormMessage>
              </FormItem>
            )}



            {/* API Service - Only show when mode is auto and provider is selected */}
            {modeValue === 'auto' && providerIdValue && (
              <FormItem className="md:col-span-2">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  API Service <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    {...register('providerServiceId')}
                    disabled={isPending || apiServicesLoading}
                    required={modeValue === 'auto' && !!providerIdValue}
                  >
                    <option value="">
                      {apiServicesLoading ? 'Loading services...' : 'Select API Service'}
                    </option>
                    {apiServicesData?.data?.services?.map((service: any) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage>{errors.providerServiceId?.message}</FormMessage>
                {apiServicesError && (
                  <p className="text-sm text-red-500 mt-1">
                    Failed to load services. Please try again.
                  </p>
                )}
              </FormItem>
            )}

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
                    setValueAs: (value) => value === 'true',
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
                    setValueAs: (value) => value === 'true',
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



            {/* Order Link - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {orderLinkType === 'username' ? 'Username' : 'Order Link'} <span className="text-red-500">*</span>
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
            <FormItem className="md:col-span-2">
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

            {/* Example Link - 100% width - OPTIONAL */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Example Link
              </FormLabel>
              <FormControl>
                <input
                  type="url"
                  placeholder="Enter example link (optional)"
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  {...register('exampleLink')}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage>{errors.exampleLink?.message}</FormMessage>
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

