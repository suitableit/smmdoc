'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FaCheck,
    FaCheckCircle,
    FaChevronDown,
    FaChevronLeft,
    FaChevronRight,
    FaChevronUp,
    FaEdit,
    FaExclamationTriangle,
    FaHandshake,
    FaList,
    FaSave,
    FaSearch,
    FaSync,
    FaTimes,
    FaToggleOn,
    FaToggleOff,
} from 'react-icons/fa';

// Import APP_NAME constant
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatID } from '@/lib/utils';

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

// Step Progress Component
const StepProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, title: 'Choose Provider', icon: FaHandshake },
    { number: 2, title: 'Select Category', icon: FaList },
    { number: 3, title: 'Customize Services', icon: FaEdit },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-gradient-to-r from-purple-700 to-purple-500 border-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <FaCheck className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                    style={isActive ? { color: 'var(--text-primary)' } : {}}
                  >
                    Step {step.number}
                  </div>
                  <div
                    className={`text-xs ${
                      isActive
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                    style={isActive ? { color: 'var(--text-muted)' } : {}}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Define interfaces
interface Provider {
  id: string | number;
  name: string;
  url: string;
  status: 'active' | 'inactive';
  description: string;
}

interface ApiCategory {
  id: number;
  name: string;
  servicesCount: number;
  selected?: boolean;
}

interface Service {
  id: string | number;
  name: string;
  category: string;
  min: number;
  max: number;
  rate: number;
  description: string;
  type: string;
  percent?: number;
  providerPrice?: number; // Original price from provider
  refill?: boolean; // Whether refill is available
  cancel?: boolean; // Whether cancel is available
  currency?: string; // Service currency
}

const ImportServicesPage = () => {
  const { appName } = useAppNameWithFallback();

  const router = useRouter();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Import Services', appName);
  }, [appName]);

  // Real providers data from API
  const [realProviders, setRealProviders] = useState<Provider[]>([]);

  // Fetch real providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/admin/providers');
        const result = await response.json();

        if (result.success) {
          const formattedProviders = result.data.providers
            .filter((p: any) => p.configured && p.status === 'active') // Show only active configured providers
            .map((p: any) => ({
              id: p.id?.toString() || '',
              name: p.label,
              url: p.apiUrl,
              status: p.status,
              description: `${p.label} - Ready for service import`
            }));
          setRealProviders(formattedProviders);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        showToast('Failed to fetch providers', 'error');
      }
    };

    fetchProviders();
  }, []);

  // Dummy data for providers (fallback)


  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editedServices, setEditedServices] = useState<{
    [key: string]: Partial<Service>;
  }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<{
    [key: string]: boolean;
  }>({});

  // Step 1 state
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [profitPercent, setProfitPercent] = useState<number>(10);

  // Step 2 state
  const [apiCategories, setApiCategories] =
    useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Step 3 state
  const [services, setServices] = useState<Service[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [hasMoreServices, setHasMoreServices] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Group services by category and filter by search term
  const groupedServices = useMemo(() => {
    const filteredServices = services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.id?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped: { [key: string]: Service[] } = {};
    filteredServices.forEach((service) => {
      if (!grouped[service.category]) {
        grouped[service.category] = [];
      }
      grouped[service.category].push(service);
    });

    return grouped;
  }, [services, searchTerm]);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Toggle category collapse
  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string | number) => {
    setApiCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat
      )
    );
  };

  // Handle select all categories
  const handleSelectAllCategories = () => {
    const allSelected = apiCategories.every((cat) => cat.selected);
    setApiCategories((prev) =>
      prev.map((cat) => ({ ...cat, selected: !allSelected }))
    );
  };

  // Load categories from API
  const loadCategories = async () => {
    setCategoriesLoading(true);
    setIsLoading(true);

    try {
      // Real API call to fetch categories with credentials
      const response = await fetch(`/api/admin/services/import?action=categories&providerId=${selectedProvider}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      console.log('Categories API response:', result); // Debug log

      if (result.success) {
        const categories = result.data.categories.map((cat: any) => ({
          ...cat,
          servicesCount: cat.servicesCount || 0,
          selected: false
        }));

        setApiCategories(categories);

        showToast(
          `Loaded ${categories.length} categories from ${result.data.provider}`,
          'success'
        );
      } else {
        showToast(`Failed to load categories: ${result.error}`, 'error');
        // Keep empty array instead of fallback data
        setApiCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showToast('Failed to load categories', 'error');
      // Keep empty array instead of fallback data
      setApiCategories([]);
    } finally {
      setCategoriesLoading(false);
      setIsLoading(false);
    }
  };

  // Get provider name
  const getProviderName = (providerId: string) => {
    const provider = realProviders.find((p) => p.id?.toString() === providerId);
    return provider ? provider.name : 'Unknown Provider';
  };

  // Load services for selected categories with pagination
  const loadServicesForCategories = async (page = 1, append = false) => {
    if (!append) {
      setIsLoading(true);
      setServices([]); // Clear existing services for new load
      setCurrentPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const selectedCategoryNames = apiCategories
        .filter((cat) => cat.selected)
        .map((cat) => cat.name);

      if (selectedCategoryNames.length === 0) {
        setServices([]);
        setIsLoading(false);
        setLoadingMore(false);
        return;
      }

      // Use POST method to avoid URL length limits with many categories
      const response = await fetch('/api/admin/services/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'services',
          providerId: selectedProvider,
          categories: selectedCategoryNames,
          page: page,
          limit: 1000 // Load 1000 services per batch
        })
      });

      console.log('🔥 API Response status:', response.status);
      console.log('🔥 API Response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 API Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('🔥 Raw API Response:', responseText.substring(0, 500));

      if (!responseText.trim()) {
        throw new Error('Empty response from API');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('🔥 JSON Parse Error:', parseError);
        console.error('🔥 Response text:', responseText);
        throw new Error('Invalid JSON response from API');
      }

      if (result.success) {
        const categoryServices = result.data.services || [];
        const pagination = result.data.pagination || {};

        console.log('📄 Pagination info:', pagination);

        // Store original provider price and apply profit margin to sale price
        const servicesWithProfit = categoryServices.map((service: any) => {
          const providerPrice = parseFloat(service.rate) || 0;
          const salePrice = parseFloat((providerPrice * (1 + profitPercent / 100)).toFixed(2));

          console.log(`🔥 Service: ${service.name}, Provider: $${providerPrice}, Sale: $${salePrice}, Profit: ${profitPercent}%`);
          console.log(`📝 Service Description: "${service.description}" (length: ${service.description?.length || 0})`);
          console.log(`🔄 Refill: ${service.refill}, Cancel: ${service.cancel}`);

          return {
            ...service,
            providerPrice: providerPrice, // Store original provider price
            rate: salePrice, // Calculate initial sale price
            percent: profitPercent, // Set initial percent from Step 1
            description: service.description || '', // Ensure description is preserved
            refill: service.refill || false, // Explicitly preserve refill status
            cancel: service.cancel || false, // Explicitly preserve cancel status
          };
        });

        // Update pagination state with null checks
        setCurrentPage(pagination.page || 1);
        setTotalPages(pagination.totalPages || 1);
        setTotalServices(pagination.total || categoryServices.length);
        setHasMoreServices(pagination.hasMore || false);

        if (append) {
          // Append new services to existing ones
          setServices(prev => [...prev, ...servicesWithProfit]);
          showToast(`Loaded ${servicesWithProfit.length} more services (${services.length + servicesWithProfit.length}/${pagination.total || servicesWithProfit.length} total)`, 'success');
        } else {
          // Replace services with new ones
          setServices(servicesWithProfit);
          showToast(`Loaded ${servicesWithProfit.length} services from selected categories (${pagination.total || servicesWithProfit.length} total available)`, 'success');
        }
      } else {
        showToast(`Failed to load services: ${result.error}`, 'error');
        if (!append) {
          setServices([]);
        }
      }
    } catch (error) {
      console.error('Error loading services:', error);
      showToast('Failed to load services', 'error');
      if (!append) {
        setServices([]);
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more services (next page)
  const loadMoreServices = async () => {
    if (hasMoreServices && !loadingMore && !isLoading) {
      const nextPage = currentPage + 1;
      console.log(`🔄 Loading more services - Page ${nextPage}`);
      await loadServicesForCategories(nextPage, true);
    }
  };

  // Calculate sale price based on provider price and percentage
  const calculateSalePrice = (service: Service, percentage: number) => {
    const providerPrice = parseFloat(service.providerPrice?.toString() || '0') || 0;
    const salePrice = parseFloat((providerPrice * (1 + percentage / 100)).toFixed(2));

    console.log(`💰 Calculating: Provider $${providerPrice} + ${percentage}% = $${salePrice}`);

    return salePrice;
  };

  // Get current sale price (recalculated based on current percentage)
  const getCurrentSalePrice = (service: Service) => {
    const currentPercent = getCurrentValue(service, 'percent') as number;
    return calculateSalePrice(service, currentPercent);
  };

  // Handle field changes in step 3
  const handleFieldChange = (
    serviceId: string | number,
    field: keyof Service,
    value: string | number
  ) => {
    const id = serviceId?.toString();
    if (!id) return;

    setEditedServices((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  // Get current value (edited value or original value)
  const getCurrentValue = (service: Service, field: keyof Service) => {
    if (!service || !service.id) return service?.[field];

    const serviceId = service.id?.toString();
    if (!serviceId) return service[field];

    return editedServices[serviceId]?.[field] !== undefined
      ? editedServices[serviceId][field]
      : service[field];
  };

  // Navigate to next step
  const handleNext = async () => {
    if (currentStep === 1) {
      if (!selectedProvider) {
        showToast('Please select a provider', 'error');
        return;
      }

      // Check if selected provider is active
      const selectedProviderData = realProviders.find(
        (p) => p.id?.toString() === selectedProvider
      );

      if (selectedProviderData?.status === 'inactive') {
        showToast('Selected provider is inactive. Please select an active provider.', 'error');
        return;
      }

      if (profitPercent < 0 || profitPercent > 100) {
        showToast('Profit percent must be between 0 and 100', 'error');
        return;
      }
      setCurrentStep(2);
      await loadCategories();
    } else if (currentStep === 2) {
      const selectedCategories = apiCategories.filter((cat) => cat.selected);
      console.log('🔥 DEBUG: Selected categories for step 3:', selectedCategories);
      if (selectedCategories.length === 0) {
        showToast('Please select at least one category', 'error');
        return;
      }
      console.log('🔥 DEBUG: Moving to step 3, about to load services...');
      setCurrentStep(3);
      console.log('🔥 DEBUG: Current services before loading:', services.length);
      await loadServicesForCategories();
      console.log('🔥 DEBUG: Current services after loading:', services.length);
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Save and import services
  const handleSaveServices = async () => {
    try {
      setIsLoading(true);
      showToast('Importing services...', 'pending');

      // Real API call to import services
      const response = await fetch('/api/admin/services/import', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: parseInt(selectedProvider),
          profitMargin: profitPercent,
          services: services.map(service => ({
            ...service,
            ...editedServices[service.id] // Include any edits
          }))
        }),
      });

      const result = await response.json();

      if (result.success) {
        const { imported, skipped, errors, provider } = result.data;

        showToast(
          `Successfully imported ${imported} services from ${provider}${
            skipped > 0 ? ` (${skipped} skipped)` : ''
          }${errors > 0 ? ` (${errors} errors)` : ''}`,
          'success'
        );

        // Force refresh categories and services cache
        try {
          await fetch('/api/admin/categories/get-categories', {
            method: 'GET',
            cache: 'no-store'
          });
          await fetch('/api/admin/services', {
            method: 'GET',
            cache: 'no-store'
          });
        } catch (refreshError) {
          console.log('Cache refresh error (non-critical):', refreshError);
        }

      } else {
        showToast(`Failed to import services: ${result.error}`, 'error');
        setIsLoading(false);
        return;
      }

      // Reset form
      setCurrentStep(1);
      setSelectedProvider('');
      setServices([]);
      setEditedServices({});

      // Redirect to services page after short delay
      setTimeout(() => {
        router.push('/admin/services');
      }, 1500);
    } catch (error: any) {
      console.error('Error importing services:', error);
      setIsLoading(false);
      showToast(
        `Error importing services: ${error.message || 'Unknown error'}`,
        'error'
      );
    }
  };

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
        {/* Step Progress */}
        <StepProgress currentStep={currentStep} />

        {/* Step Content */}
        <div className="card animate-in fade-in duration-500">
          <div className="px-6 py-6">
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              {currentStep === 1 && 'Choose Provider'}
              {currentStep === 2 && 'Select Categories'}
              {currentStep === 3 && 'Customize Services'}
            </h2>

            {/* Step 1: Choose Provider */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Provider Selection */}
                <div>
                  <label
                    className="form-label mb-3"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Select API Provider
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">-- Select API Provider --</option>
                    {realProviders.map((provider) => (
                      <option
                        key={provider.id}
                        value={provider.id}
                        disabled={provider.status === 'inactive'}
                        style={{
                          color: provider.status === 'inactive' ? '#9CA3AF' : 'inherit',
                          fontStyle: provider.status === 'inactive' ? 'italic' : 'normal'
                        }}
                      >
                        {provider.name} {provider.status === 'inactive' ? '(inactive)' : ''}
                      </option>
                    ))}
                  </select>
                  {selectedProvider && (
                    <div className="mt-2 space-y-2">
                      {(() => {
                        const selectedProviderData = realProviders.find(
                          (p) => p.id?.toString() === selectedProvider
                        );

                        if (selectedProviderData?.status === 'inactive') {
                          return (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FaExclamationTriangle className="text-red-500 w-4 h-4" />
                                <div className="text-sm text-red-700 font-medium">
                                  This provider is inactive and cannot be used for importing services.
                                </div>
                              </div>
                              <div className="text-xs text-red-600 mt-1">
                                Please select an active provider to continue.
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div
                              className="text-sm"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {selectedProviderData?.description}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Profit Percent */}
                <div>
                  <label
                    className="form-label mb-3"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Profit Percent
                  </label>
                  <div className="max-w-md">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={profitPercent}
                        onChange={(e) =>
                          setProfitPercent(parseInt(e.target.value))
                        }
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={profitPercent}
                          onChange={(e) =>
                            setProfitPercent(
                              Math.max(
                                0,
                                Math.min(100, parseInt(e.target.value) || 0)
                              )
                            )
                          }
                          className="form-field w-20 px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                          max="100"
                        />
                        <span
                          className="font-medium"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          %
                        </span>
                      </div>
                    </div>
                    <p
                      className="text-xs mt-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      This percentage will be added to all imported service
                      prices as your profit margin.
                    </p>
                  </div>
                </div>

                {/* Selected Provider Summary */}
                {selectedProvider && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Import Summary
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>
                        <strong>Provider:</strong>{' '}
                        {getProviderName(selectedProvider)}
                      </p>
                      <p>
                        <strong>Profit Margin:</strong> {profitPercent}%
                      </p>
                      <p>
                        <strong>Example:</strong> If provider price is $1.00,
                        your price will be $
                        {(1 * (1 + profitPercent / 100)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Categories */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center flex flex-col items-center">
                      <GradientSpinner size="w-12 h-12" className="mb-3" />
                      <div className="text-base font-medium">
                        Loading categories from{' '}
                        {getProviderName(selectedProvider)}...
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Provider Info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4
                            className="font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            Connected to {getProviderName(selectedProvider)}
                          </h4>
                          <p
                            className="text-sm"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Select categories to import services from
                          </p>
                        </div>
                        <button
                          onClick={loadCategories}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <FaSync />
                          Refresh
                        </button>
                      </div>
                    </div>

                    {/* Categories Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[600px]">
                        <thead className="sticky top-0 bg-white border-b z-10">
                          <tr>
                            <th className="text-left p-3 font-semibold">
                              <input
                                type="checkbox"
                                checked={apiCategories.every(
                                  (cat) => cat.selected
                                )}
                                onChange={handleSelectAllCategories}
                                className="rounded border-gray-300 w-4 h-4"
                              />
                            </th>
                            <th
                              className="text-left p-3 font-semibold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              Category Name
                            </th>
                            <th
                              className="text-left p-3 font-semibold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              Services Count
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
                          {apiCategories.map((category, index) => (
                            <tr
                              key={category.id}
                              className={`border-t hover:bg-gray-50 transition-colors duration-200 animate-in fade-in slide-in-from-left-1 ${
                                category.selected ? 'bg-blue-50' : ''
                              }`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  checked={category.selected || false}
                                  onChange={() =>
                                    handleCategorySelect(category.id)
                                  }
                                  className="rounded border-gray-300 w-4 h-4"
                                />
                              </td>
                              <td className="p-3">
                                <div
                                  className="font-medium"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  {category.name}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-blue-600">
                                    {category.servicesCount.toString()}
                                  </span>
                                  <span
                                    className="text-xs"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    services
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                {category.selected ? (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full w-fit">
                                    <FaCheckCircle className="h-3 w-3 text-green-500" />
                                    <span className="text-xs font-medium text-green-700">
                                      Selected
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit">
                                    <span className="text-xs font-medium text-gray-600">
                                      Available
                                    </span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Selection Summary */}
                    {apiCategories.some((cat) => cat.selected) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">
                          Selection Summary
                        </h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <p>
                            <strong>Selected Categories:</strong>{' '}
                            {apiCategories.filter((cat) => cat.selected).length}
                          </p>
                          <p>
                            <strong>Total Services:</strong>{' '}
                            {apiCategories
                              .filter((cat) => cat.selected)
                              .reduce((sum, cat) => sum + (cat.servicesCount || 0), 0)
                              .toString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 3: Customize Services */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center flex flex-col items-center">
                      <GradientSpinner size="w-16 h-16" className="mb-4" />
                      <div className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Loading Services...
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Fetching services from {getProviderName(selectedProvider)} for selected categories
                      </div>
                      <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        This may take a few moments for large datasets
                      </div>
                    </div>
                  </div>
                )}

                {/* Services Content - Only show when not loading */}
                {!isLoading && (
                  <>
                {/* Summary Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div className="mb-2 md:mb-0">
                      <h4 className="font-semibold text-blue-800">
                        Services Ready for Import
                      </h4>
                      <p className="text-sm text-blue-700">
                        {services.length} services loaded{totalServices > 0 && ` of ${totalServices} total`} with {profitPercent}%
                        profit margin applied
                      </p>
                      {hasMoreServices && (
                        <p className="text-xs text-blue-600 mt-1">
                          📄 Page {currentPage} of {totalPages} • {totalServices - services.length} more services available
                        </p>
                      )}
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-sm text-blue-700">
                        <strong>Provider:</strong>{' '}
                        {getProviderName(selectedProvider)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-2">
                  {/* Left: Search */}
                  <div className="relative flex-1 md:max-w-md">
                    <FaSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    />
                  </div>

                  {/* Right: Changes indicator and collapse toggle */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                    {hasChanges && (
                      <div className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <FaEdit className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800 font-medium">
                          You have unsaved changes
                        </span>
                      </div>
                    )}

                    {/* Collapse/Expand All Toggle */}
                    <button
                      onClick={() => {
                        const allCategories = Object.keys(groupedServices);
                        const allCollapsed = allCategories.every(
                          (cat) => collapsedCategories[cat]
                        );

                        if (allCollapsed) {
                          // Expand all
                          setCollapsedCategories({});
                        } else {
                          // Collapse all
                          const newCollapsed: { [key: string]: boolean } = {};
                          allCategories.forEach((cat) => {
                            newCollapsed[cat] = true;
                          });
                          setCollapsedCategories(newCollapsed);
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title={
                        Object.keys(groupedServices).every(
                          (cat) => collapsedCategories[cat]
                        )
                          ? 'Expand all categories'
                          : 'Collapse all categories'
                      }
                    >
                      {Object.keys(groupedServices).every(
                        (cat) => collapsedCategories[cat]
                      ) ? (
                        <>
                          <FaChevronDown className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Expand All
                          </span>
                        </>
                      ) : (
                        <>
                          <FaChevronUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Collapse All
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Services by Category */}
                {Object.keys(groupedServices).length === 0 ? (
                  <div className="text-center py-12">
                    <FaExclamationTriangle
                      className="h-16 w-16 mx-auto mb-4"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      No services found
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {searchTerm
                        ? 'No services match your search criteria.'
                        : 'No services available for selected categories.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block card animate-in fade-in duration-500">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1000px]">
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
                                Service Name
                              </th>
                              <th
                                className="text-left p-3 font-semibold"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                Type
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
                                Percent
                              </th>
                              <th
                                className="text-center p-3 font-semibold"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                Refill
                              </th>
                              <th
                                className="text-center p-3 font-semibold"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                Cancel
                              </th>
                              <th
                                className="text-left p-3 font-semibold"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(groupedServices).map(
                              ([category, categoryServices]) => (
                                <React.Fragment key={category}>
                                  {/* Category Header Row */}
                                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                                    <td colSpan={8} className="p-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <button
                                            onClick={() =>
                                              toggleCategoryCollapse(category)
                                            }
                                            className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
                                          >
                                            {collapsedCategories[category] ? (
                                              <FaChevronRight className="h-3 w-3" />
                                            ) : (
                                              <FaChevronDown className="h-3 w-3" />
                                            )}
                                          </button>

                                          <span className="font-semibold text-md text-gray-800">
                                            {category}
                                          </span>
                                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                                            {categoryServices.length} service
                                            {categoryServices.length !== 1
                                              ? 's'
                                              : ''}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {categoryServices.filter(
                                            (service) =>
                                              editedServices[service.id]
                                          ).length > 0 && (
                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                              {
                                                categoryServices.filter(
                                                  (service) =>
                                                    editedServices[service.id]
                                                ).length
                                              }{' '}
                                              modified
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Services Rows */}
                                  {!collapsedCategories[category] &&
                                    (categoryServices.length > 0 ? (
                                      categoryServices.map((service, index) => (
                                        <tr
                                          key={`${category}-${service.id}-${index}`}
                                          className={`border-t hover:bg-gray-50 transition-colors duration-200 animate-in fade-in slide-in-from-left-1 ${
                                            editedServices[service.id]
                                              ? 'bg-yellow-50'
                                              : ''
                                          }`}
                                          style={{
                                            animationDelay: `${index * 25}ms`,
                                          }}
                                        >
                                          <td className="p-3 pl-8">
                                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">
                                              {formatID(service.id)}
                                            </div>
                                          </td>
                                          <td className="p-3">
                                            <input
                                              type="text"
                                              value={
                                                getCurrentValue(
                                                  service,
                                                  'name'
                                                ) as string
                                              }
                                              onChange={(e) =>
                                                handleFieldChange(
                                                  service.id,
                                                  'name',
                                                  e.target.value
                                                )
                                              }
                                              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                            />
                                          </td>
                                          <td className="p-3">
                                            <div className="text-sm">
                                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                {service.type || 'Default'}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="p-3">
                                            <div className="text-left">
                                              <div
                                                className="font-semibold text-sm"
                                                style={{
                                                  color: 'var(--text-primary)',
                                                }}
                                              >
                                                ${getCurrentSalePrice(service)}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                Real Provider: $${parseFloat(service.providerPrice || '0').toFixed(2)}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                Provider (+10%): $
                                                {service.providerPrice ? (parseFloat(service.providerPrice.toString()) * 1.1).toFixed(2) : '0.00'}
                                              </div>
                                            </div>
                                          </td>
                                          <td className="p-3">
                                            <input
                                              type="number"
                                              value={
                                                getCurrentValue(
                                                  service,
                                                  'percent'
                                                ) as number
                                              }
                                              onChange={(e) =>
                                                handleFieldChange(
                                                  service.id,
                                                  'percent',
                                                  parseFloat(e.target.value) ||
                                                    0
                                                )
                                              }
                                              className="form-field w-20 px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                              min="0"
                                              max="1000"
                                              step="0.1"
                                            />
                                          </td>
                                          <td className="p-3">
                                            <div className="text-center">
                                              <button
                                                className={`p-1 rounded transition-colors duration-200 ${
                                                  service.refill
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-gray-400 hover:bg-gray-50'
                                                }`}
                                                title={
                                                  service.refill ? 'Refill Enabled' : 'Refill Disabled'
                                                }
                                                onClick={() => toggleRefill(service)}
                                              >
                                                {service.refill ? (
                                                  <FaToggleOn className="h-5 w-5" />
                                                ) : (
                                                  <FaToggleOff className="h-5 w-5" />
                                                )}
                                              </button>
                                            </div>
                                          </td>
                                          <td className="p-3">
                                            <div className="text-center">
                                              <button
                                                className={`p-1 rounded transition-colors duration-200 ${
                                                  service.cancel
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-gray-400 hover:bg-gray-50'
                                                }`}
                                                title={
                                                  service.cancel ? 'Cancel Enabled' : 'Cancel Disabled'
                                                }
                                                onClick={() => toggleCancel(service)}
                                              >
                                                {service.cancel ? (
                                                  <FaToggleOn className="h-5 w-5" />
                                                ) : (
                                                  <FaToggleOff className="h-5 w-5" />
                                                )}
                                              </button>
                                            </div>
                                          </td>
                                          <td className="p-3">
                                            <textarea
                                              value={
                                                getCurrentValue(
                                                  service,
                                                  'description'
                                                ) as string
                                              }
                                              onChange={(e) =>
                                                handleFieldChange(
                                                  service.id,
                                                  'description',
                                                  e.target.value
                                                )
                                              }
                                              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 resize-y"
                                              rows={2}
                                            />
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr className="border-t">
                                        <td
                                          colSpan={8}
                                          className="p-8 text-center"
                                        >
                                          <div className="flex flex-col items-center justify-center text-gray-500">
                                            <FaExclamationTriangle className="h-8 w-8 mb-2 text-gray-400" />
                                            <p className="text-sm font-medium">
                                              No services in this category
                                            </p>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                </React.Fragment>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-6">
                      {Object.entries(groupedServices).map(
                        ([category, categoryServices]) => (
                          <div
                            key={category}
                            className="space-y-4 animate-in fade-in duration-500"
                          >
                            {/* Category Header */}
                            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  <button
                                    onClick={() =>
                                      toggleCategoryCollapse(category)
                                    }
                                    className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
                                  >
                                    {collapsedCategories[category] ? (
                                      <FaChevronRight className="h-3 w-3" />
                                    ) : (
                                      <FaChevronDown className="h-3 w-3" />
                                    )}
                                  </button>

                                  <span className="font-semibold text-md text-gray-800">
                                    {category}
                                  </span>
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium ml-auto">
                                    {categoryServices.length} service
                                    {categoryServices.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              {categoryServices.filter(
                                (service) => editedServices[service.id]
                              ).length > 0 && (
                                <div className="mt-2">
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                    {
                                      categoryServices.filter(
                                        (service) => editedServices[service.id]
                                      ).length
                                    }{' '}
                                    modified
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Services Cards */}
                            {!collapsedCategories[category] && (
                              <div className="space-y-4 ml-4">
                                {categoryServices.length > 0 ? (
                                  categoryServices.map((service, index) => (
                                    <div
                                      key={`${category}-${service.id}-${index}`}
                                      className={`card card-padding border-l-4 border-blue-500 animate-in fade-in slide-in-from-right-1 ${
                                        editedServices[service.id]
                                          ? 'bg-yellow-50'
                                          : ''
                                      }`}
                                      style={{
                                        animationDelay: `${index * 50}ms`,
                                      }}
                                    >
                                      {/* Header */}
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                          {formatID(service.id)}
                                        </div>
                                        {editedServices[service.id] && (
                                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                            Modified
                                          </span>
                                        )}
                                      </div>

                                      {/* Service Name */}
                                      <div className="mb-4">
                                        <label className="form-label mb-2">
                                          Service Name
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            getCurrentValue(
                                              service,
                                              'name'
                                            ) as string
                                          }
                                          onChange={(e) =>
                                            handleFieldChange(
                                              service.id,
                                              'name',
                                              e.target.value
                                            )
                                          }
                                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                        />
                                      </div>

                                      {/* Price and Percent */}
                                      <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                          <label className="form-label mb-2">
                                            Price (USD)
                                          </label>
                                          <div className="space-y-1">
                                            <div
                                              className="font-semibold text-sm bg-gray-50 px-3 py-2 rounded"
                                              style={{
                                                color: 'var(--text-primary)',
                                              }}
                                            >
                                              ${getCurrentSalePrice(service)}
                                            </div>
                                            <div className="text-xs text-gray-500 px-3">
                                              Provider: $
                                              {service.providerPrice ? parseFloat(service.providerPrice.toString()).toFixed(2) : '0.00'}
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="form-label mb-2">
                                            Profit Percent
                                          </label>
                                          <input
                                            type="number"
                                            value={
                                              getCurrentValue(
                                                service,
                                                'percent'
                                              ) as number
                                            }
                                            onChange={(e) =>
                                              handleFieldChange(
                                                service.id,
                                                'percent',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            min="0"
                                            max="1000"
                                            step="0.1"
                                          />
                                        </div>
                                      </div>

                                      {/* Refill and Cancel Toggles */}
                                      <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                          <label className="form-label mb-2">
                                            Refill
                                          </label>
                                          <div className="flex items-center">
                                            <button
                                              className={`p-1 rounded transition-colors duration-200 ${
                                                service.refill
                                                  ? 'text-green-600 hover:bg-green-50'
                                                  : 'text-gray-400 hover:bg-gray-50'
                                              }`}
                                              title={
                                                service.refill ? 'Refill Enabled' : 'Refill Disabled'
                                              }
                                              onClick={() => toggleRefill(service)}
                                            >
                                              {service.refill ? (
                                                <FaToggleOn className="h-6 w-6" />
                                              ) : (
                                                <FaToggleOff className="h-6 w-6" />
                                              )}
                                            </button>
                                            <span className="ml-2 text-sm text-gray-600">
                                              {service.refill ? 'Enabled' : 'Disabled'}
                                            </span>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="form-label mb-2">
                                            Cancel
                                          </label>
                                          <div className="flex items-center">
                                            <button
                                              className={`p-1 rounded transition-colors duration-200 ${
                                                service.cancel
                                                  ? 'text-green-600 hover:bg-green-50'
                                                  : 'text-gray-400 hover:bg-gray-50'
                                              }`}
                                              title={
                                                service.cancel ? 'Cancel Enabled' : 'Cancel Disabled'
                                              }
                                              onClick={() => toggleCancel(service)}
                                            >
                                              {service.cancel ? (
                                                <FaToggleOn className="h-6 w-6" />
                                              ) : (
                                                <FaToggleOff className="h-6 w-6" />
                                              )}
                                            </button>
                                            <span className="ml-2 text-sm text-gray-600">
                                              {service.cancel ? 'Enabled' : 'Disabled'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Description */}
                                      <div>
                                        <label className="form-label mb-2">
                                          Description
                                        </label>
                                        <textarea
                                          value={
                                            getCurrentValue(
                                              service,
                                              'description'
                                            ) as string
                                          }
                                          onChange={(e) =>
                                            handleFieldChange(
                                              service.id,
                                              'description',
                                              e.target.value
                                            )
                                          }
                                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-y"
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-8 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                      <FaExclamationTriangle className="h-8 w-8 mb-2 text-gray-400" />
                                      <p className="text-sm font-medium">
                                        No services in this category
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>

                    {/* Load More Button */}
                    {hasMoreServices && !isLoading && (
                      <div className="flex justify-center py-6">
                        <button
                          onClick={loadMoreServices}
                          disabled={loadingMore}
                          className="btn btn-primary flex items-center gap-2 px-6 py-3"
                        >
                          {loadingMore ? (
                            <>
                              Loading More...
                            </>
                          ) : (
                            <>
                              <FaChevronDown />
                              Load More Services ({totalServices - services.length} remaining)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
                </>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t mt-8">
              <div className="w-full md:w-auto">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    disabled={isLoading}
                    className="btn btn-secondary flex items-center gap-2 w-full justify-center"
                  >
                    <FaChevronLeft />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={
                      isLoading ||
                      (currentStep === 1 && (
                        !selectedProvider ||
                        realProviders.find(
                          (p) => p.id?.toString() === selectedProvider
                        )?.status === 'inactive'
                      ))
                    }
                    className="btn btn-primary flex items-center gap-2 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <FaChevronRight />
                  </button>
                ) : (
                  <button
                    onClick={handleSaveServices}
                    disabled={isLoading || services.length === 0}
                    className="btn btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700 w-full justify-center"
                  >
                    {isLoading ? (
                      <>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Import {services.length} Services
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportServicesPage;