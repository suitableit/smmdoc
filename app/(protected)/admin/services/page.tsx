'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';
import {
  FaBox,
  FaBriefcase,
  FaCheckCircle,
  FaEdit,
  FaExclamationTriangle,
  FaFileImport,
  FaGlobe,
  FaPlus,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaSync,
  FaTags,
  FaTimes,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaUndo,
} from 'react-icons/fa';
import useSWR from 'swr';

// Import APP_NAME constant
import { PriceDisplay } from '@/components/PriceDisplay';
import { useGetCategories } from '@/hooks/categories-fetch';
import { useGetServicesId } from '@/hooks/service-fetch-id';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatID } from '@/lib/utils';
import {
  createCategoryDefaultValues,
  createCategorySchema,
  CreateCategorySchema,
} from '@/lib/validators/admin/categories/categories.validator';
import {
  createServiceDefaultValues,
  CreateServiceSchema,
} from '@/lib/validators/admin/services/services.validator';
import { mutate } from 'swr';

// Fetcher function for useSWR
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

// Dynamically import CreateCategoryForm component
const CreateCategoryForm = dynamic(
  () =>
    import('@/components/admin/services/create-category-form').then(
      (m) => m.CreateCategoryForm
    ),
  { ssr: false }
);

// Dynamically import EditCategoryForm component
const EditCategoryForm = dynamic(
  () =>
    import('@/components/admin/services/edit-category-form').then(
      (m) => m.EditCategoryForm
    ),
  { ssr: false }
);

// Dynamically import DeleteCategoryModal component
const DeleteCategoryModal = dynamic(
  () =>
    import('@/components/admin/services/delete-category-modal').then(
      (m) => m.DeleteCategoryModal
    ),
  { ssr: false }
);

// Dynamically import CreateServiceForm component
const CreateServiceForm = dynamic(
  () =>
    import('@/components/admin/services/create-service-form').then(
      (m) => m.CreateServiceForm
    ),
  { ssr: false }
);

// Dynamically import EditServiceForm component
const EditServiceForm = dynamic(
  () =>
    import('@/components/admin/services/edit-service-form').then(
      (m) => m.EditServiceForm
    ),
  { ssr: false }
);

// Dynamically import ServicesTable component
const ServicesTable = dynamic(
  () =>
    import('@/components/admin/services/services-table').then(
      (m) => m.ServicesTable
    ),
  { ssr: false }
);

// Dynamically import DeleteConfirmationModal component
const DeleteConfirmationModal = dynamic(
  () =>
    import('@/components/admin/services/delete-confirmation-modal').then(
      (m) => m.DeleteConfirmationModal
    ),
  { ssr: false }
);

// Dynamically import DeleteServicesAndCategoriesModal component
const DeleteServicesAndCategoriesModal = dynamic(
  () =>
    import('@/components/admin/services/delete-services-and-categories-modal').then(
      (m) => m.DeleteServicesAndCategoriesModal
    ),
  { ssr: false }
);

// Custom Form Components
const FormField = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-2">{children}</div>
);

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
  <div
    className={`toast toast-${type} animate-in slide-in-from-top-2 fade-in duration-300`}
  >
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


function AdminServicesPage() {
  // Hooks
  const user = useCurrentUser();
  const { appName } = useAppNameWithFallback();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('All Services', appName);
  }, [appName]);
  const { data: categoriesData, mutate: refreshCategories } =
    useGetCategories();

  // Fetch active providers from API with error handling - all active providers
  const { data: providersData, mutate: refreshProviders, error: providersError } = useSWR(
    '/api/admin/providers?filter=active',
    async (url) => {
      try {
        console.log('Fetching providers data...');
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add a longer timeout for this specific request
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Providers data fetched successfully:', data);
        return data;
      } catch (error) {
        console.error('Error fetching providers:', error);
        throw error;
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000, // Allow refetch after 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onError: (error) => {
        console.error('SWR providers fetch error:', error);
      }
    }
  );

  // Placeholder for refreshAllData - will be defined after refreshServices

  // State declarations
  const [stats, setStats] = useState({
    totalServices: 0,
    totalCategories: 0,
    activeServices: 0,
    inactiveServices: 0,
    trashServices: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('All');
  const [pageSize, setPageSize] = useState('25'); // Default to 25 categories per page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [allCategoriesCollapsed, setAllCategoriesCollapsed] = useState(false);
  const [activeCategoryToggles, setActiveCategoryToggles] = useState<{
    [key: string]: boolean;
  }>({});

  // Drag and drop state for categories
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [dropTargetCategory, setDropTargetCategory] = useState<string | null>(
    null
  );
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(
    null
  );

  // Drag and drop state for services
  const [draggedService, setDraggedService] = useState<string | null>(null);
  const [serviceOrder, setServiceOrder] = useState<{
    [categoryName: string]: string[];
  }>({});
  const [dropTargetService, setDropTargetService] = useState<string | null>(
    null
  );
  const [dropPositionService, setDropPositionService] = useState<
    'before' | 'after' | null
  >(null);

  // Create Service Modal state
  const [createServiceModal, setCreateServiceModal] = useState(false);
  const [createServiceModalClosing, setCreateServiceModalClosing] =
    useState(false);

  // Create Category Modal state
  const [createCategoryModal, setCreateCategoryModal] = useState(false);
  const [createCategoryModalClosing, setCreateCategoryModalClosing] =
    useState(false);

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
  const [deleteConfirmationModalClosing, setDeleteConfirmationModalClosing] =
    useState(false);

  // Delete services and categories confirmation modal state
  const [deleteServicesAndCategoriesModal, setDeleteServicesAndCategoriesModal] = useState(false);
  const [deleteServicesAndCategoriesModalClosing, setDeleteServicesAndCategoriesModalClosing] =
    useState(false);

  // Delete category modal state
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<{
    open: boolean;
    categoryName: string;
    categoryId: string | number;
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
  type BulkOperation = 'enable' | 'disable' | 'make-secret' | 'remove-secret' | 'delete-pricing' | 'refill-enable' | 'refill-disable' | 'cancel-enable' | 'cancel-disable' | 'delete' | 'delete-services-categories' | '';
  const [selectedBulkOperation, setSelectedBulkOperation] = useState<BulkOperation>('');

  // Show toast notification - defined early
  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' | 'pending' = 'success'
    ) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  // Pagination functions
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Separate API call to get all services for counting purposes
  const { data: allServicesData } = useSWR(
    `/api/admin/services?page=1&limit=999999&search=&filter=all_with_trash`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // Services data fetching with pagination and optimized caching
  const {
    data,
    error,
    isLoading,
    mutate: refreshServices,
  } = useSWR(
    `/api/admin/services?page=${currentPage}&limit=${
      pageSize === 'all' ? '999999' : pageSize
    }&search=${searchTerm}&filter=${statusFilter}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true, // Keep previous data while loading new data
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // Debug logging
  console.log('=== DEBUG INFO ===');
  console.log('pageSize:', pageSize);
  console.log('statusFilter:', statusFilter);
  console.log('API URL:', `/api/admin/services?page=${currentPage}&limit=${pageSize === 'all' ? '999999' : pageSize}&search=${searchTerm}&filter=${statusFilter}`);
  console.log('API Response data:', data);
  console.log('allCategories:', data?.allCategories);
  console.log('services data:', data?.data);

  // Update pagination info when data changes
  useEffect(() => {
    if (data) {
      setTotalPages(data.totalPages || 1);
      setTotalServices(data.total || 0);
    }
  }, [data]);

  // Helper function to get provider name by ID
  const getProviderNameById = useCallback((providerId: number | string | null, providerName?: string) => {
    // Debug logging
    console.log('getProviderNameById called with:', { providerId, providerName });
    console.log('providersData:', providersData);
    console.log('providersError:', providersError);
    
    // If service is self-created (no provider ID), return "Self"
    if (!providerId) {
      console.log('No providerId, returning Self');
      return 'Self';
    }

    // If we have providers data, find the provider by ID
    if (providersData?.data?.providers) {
      console.log('Available providers:', providersData.data.providers);
      const provider = providersData.data.providers.find((p: any) => {
        console.log('Comparing provider:', p.id, 'with providerId:', parseInt(providerId.toString()));
        return p.id === parseInt(providerId.toString());
      });
      console.log('Found provider:', provider);
      if (provider) {
        const resolvedName = provider.label || provider.name || 'Unknown Provider';
        console.log('Resolved provider name:', resolvedName);
        return resolvedName;
      }
    }

    // If there's an error fetching providers, show error state
    if (providersError) {
      console.log('Providers fetch error, using fallback');
      return providerName || 'Provider (Error)';
    }

    // Fallback to static provider name if dynamic resolution fails
    if (providerName && providerName.trim() !== '') {
      console.log('Using fallback provider name:', providerName);
      return providerName;
    }

    console.log('Returning N/A');
    return 'N/A';
  }, [providersData?.data?.providers, providersError]);

  // Update refreshAllData to include refreshServices
  const refreshAllData = useCallback(async () => {
    try {
      // Use Promise.allSettled to ensure all requests complete even if one fails
      const results = await Promise.allSettled([
        refreshServices(),
        refreshCategories(),
        refreshProviders(),
        // Refresh stats
        fetch('/api/admin/services/stats')
          .then((res) => res.json())
          .then((data) => {
            if (data.data) {
              setStats((prev) => ({
                ...prev,
                ...data.data,
                totalCategories:
                  categoriesData?.data?.length || prev.totalCategories,
              }));
            }
          }),
      ]);

      // Log any failed requests for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Refresh operation ${index} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [refreshServices, refreshCategories, refreshProviders, categoriesData?.data?.length]);

  // Enhanced refresh function that includes services data refresh
  const refreshAllDataWithServices = useCallback(async () => {
    try {
      // Use Promise.allSettled to ensure all requests complete even if one fails
      const results = await Promise.allSettled([
        refreshServices(),
        refreshCategories(),
        refreshProviders(),
        // Refresh stats
        fetch('/api/admin/services/stats')
          .then((res) => res.json())
          .then((data) => {
            if (data.data) {
              setStats((prev) => ({
                ...prev,
                ...data.data,
                totalCategories:
                  categoriesData?.data?.length || prev.totalCategories,
              }));
            }
          }),
      ]);

      // Log any failed requests for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Refresh operation ${index} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error refreshing data with services:', error);
    }
  }, [refreshServices, refreshCategories, refreshProviders, categoriesData?.data?.length]);

  // Listen for provider updates from other pages
  useEffect(() => {
    const handleProviderUpdate = (event: CustomEvent) => {
      console.log('Provider updated, refreshing providers data:', event.detail);
      refreshProviders();
    };

    window.addEventListener('providerUpdated', handleProviderUpdate as EventListener);
    
    return () => {
      window.removeEventListener('providerUpdated', handleProviderUpdate as EventListener);
    };
  }, [refreshProviders]);

  // Memoized filter function for better performance
  const filteredServices = useMemo(() => {
    if (!data?.data) return [];

    const searchLower = searchTerm.toLowerCase();

    return data.data.filter((service: any) => {
      // Pre-compute search fields to avoid repeated toLowerCase calls
      // Use direct parameters without mapping
      const serviceName = service.name?.toLowerCase() || '';
      const categoryName = service.category?.category_name?.toLowerCase() || '';
      const dynamicProvider = getProviderNameById(service.providerId, service.provider).toLowerCase();
      const serviceId = service.id?.toString() || '';

      const matchesSearch =
        serviceName.includes(searchLower) ||
        categoryName.includes(searchLower) ||
        dynamicProvider.includes(searchLower) ||
        serviceId.includes(searchLower);

      // Provider filter
      let matchesProvider = true;
      if (providerFilter === 'All') {
        matchesProvider = true;
      } else if (providerFilter === 'Self') {
        // Show services with no provider ID (self-created services)
        matchesProvider = !service.providerId;
      } else {
        // Get dynamic provider name and compare
        const dynamicProviderName = getProviderNameById(service.providerId, service.provider);
        matchesProvider = dynamicProviderName === providerFilter;
      }

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'active') {
        // Active filter: only active services that are not trashed (for display)
        matchesStatus = service.status === 'active' && 
                       (service.deletedAt === null || service.deletedAt === undefined);
      } else if (statusFilter === 'inactive') {
        // Inactive filter: only inactive services that are not trashed (for display)
        matchesStatus = service.status === 'inactive' && 
                       (service.deletedAt === null || service.deletedAt === undefined);
      } else if (statusFilter === 'trash') {
        // Show services that are soft-deleted (have deletedAt field)
        matchesStatus = service.deletedAt !== null && service.deletedAt !== undefined;
      } else if (statusFilter === 'all') {
        // All filter shows both active and inactive services
        // Only excludes services that are explicitly marked as trash (soft-deleted) for display
        matchesStatus = (service.status === 'active' || service.status === 'inactive') && 
                       (service.deletedAt === null || service.deletedAt === undefined);
      }

      // Category filter - exclude services from disabled categories
      // If category has hideCategory === 'yes', it's disabled and should be excluded from bulk operations
      const categoryEnabled = service.category?.hideCategory !== 'yes';

      return matchesSearch && matchesProvider && matchesStatus && categoryEnabled;
    });
  }, [data?.data, searchTerm, statusFilter, providerFilter]);

  // Calculate counts excluding trash services for All/Active/Inactive filters
  const countsWithoutTrash = useMemo(() => {
    if (!allServicesData?.data) return { all: 0, active: 0, inactive: 0 };
    
    const allServices = allServicesData.data;
    console.log('=== COUNTS DEBUG ===');
    console.log('Total services:', allServices.length);
    
    // Only count services that are NOT trashed (deletedAt is null or undefined)
    const nonTrashedServices = allServices.filter((service: any) => 
      service.deletedAt === null || service.deletedAt === undefined
    );
    console.log('Non-trashed services:', nonTrashedServices.length);
    
    const trashedServices = allServices.filter((service: any) => 
      service.deletedAt !== null && service.deletedAt !== undefined
    );
    console.log('Trashed services:', trashedServices.length);
    
    const activeCount = nonTrashedServices.filter((service: any) => service.status === 'active').length;
    const inactiveCount = nonTrashedServices.filter((service: any) => service.status === 'inactive').length;
    const allCount = activeCount + inactiveCount;
    
    console.log('Active (non-trashed):', activeCount);
    console.log('Inactive (non-trashed):', inactiveCount);
    console.log('All (non-trashed):', allCount);
    
    return {
      all: allCount,
      active: activeCount,
      inactive: inactiveCount
    };
  }, [allServicesData?.data]);

  // Calculate trashServices count using all services data
  const trashServicesCount = useMemo(() => {
    if (!allServicesData?.data) return 0;
    const count = allServicesData.data.filter((service: any) => 
      service.deletedAt !== null && service.deletedAt !== undefined
    ).length;
    return count;
  }, [allServicesData?.data]);

  // Update stats when trashServicesCount changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      trashServices: trashServicesCount
    }));
  }, [trashServicesCount]);

  // Get unique providers for filter dropdown - show only providers that have services
  const uniqueProviders = useMemo(() => {
    // Always include 'All' and 'Self'
    const result: string[] = ['All', 'Self'];

    // Collect provider IDs that actually have services (exclude trashed)
    const providerIdsWithServices = new Set<number>();

    const sourceServices = Array.isArray(allServicesData?.data)
      ? allServicesData!.data
      : Array.isArray(data?.data)
        ? data!.data
        : [];

    sourceServices.forEach((s: any) => {
      if (s.providerId && (s.deletedAt === null || s.deletedAt === undefined)) {
        try {
          providerIdsWithServices.add(parseInt(String(s.providerId)));
        } catch (_) {
          // ignore parse errors
        }
      }
    });

    // If providers data is available, filter to only those with services
    if (providersData?.data?.providers && providerIdsWithServices.size > 0) {
      const names = providersData.data.providers
        .filter((p: any) => p.status === 'active')
        .filter((p: any) => providerIdsWithServices.has(Number(p.id)))
        .map((p: any) => p.label || p.name || p.value)
        .filter((name: string) => !!name && name.trim() !== '')
        .sort();

      return [...result, ...names];
    }

    // Fallback: derive provider names directly from services when providers API not ready
    if (sourceServices.length > 0) {
      const nameSet = new Set<string>();
      sourceServices.forEach((s: any) => {
        if (s.providerId && (s.deletedAt === null || s.deletedAt === undefined)) {
          const name = getProviderNameById(s.providerId, s.provider);
          if (name && name !== 'N/A' && name !== 'Provider (Error)') {
            nameSet.add(name);
          }
        }
      });
      return [...result, ...Array.from(nameSet).sort()];
    }

    // Default minimal options when nothing loaded yet
    return result;
  }, [providersData?.data?.providers, allServicesData?.data, data?.data]);

  // Optimized grouping with better performance for large datasets
  const groupedServices = useMemo(() => {
    console.log('=== GROUPED SERVICES DEBUG ===');
    console.log('statusFilter in groupedServices:', statusFilter);
    console.log('pageSize in groupedServices:', pageSize);
    console.log('data?.allCategories:', data?.allCategories);
    console.log('filteredServices.length:', filteredServices.length);
    console.log('data:', data);
    console.log('error:', error);
    console.log('isLoading:', isLoading);
    
    // Use Map for better performance with large datasets
    const groupedById = new Map<string, { category: any; services: any[] }>();

    // Always initialize with all categories when statusFilter is 'all', regardless of other conditions
    // This ensures empty categories are shown only when "All" filter is selected
    if (statusFilter === 'all' && data?.allCategories) {
      console.log('Initializing all categories for statusFilter=all');
      data.allCategories.forEach((category: any) => {
        const categoryKey = `${category.category_name}_${category.id}`;
        console.log('Adding category:', categoryKey, category);
        groupedById.set(categoryKey, {
          category: category,
          services: [],
        });
      });
    }

    // If no data available, return empty for error handling
    if (!data) {
      console.log('No data available - API might have failed');
      return {} as Record<string, any[]>;
    }

    // For non-'all' statusFilter, only show categories if there are services
    if (statusFilter !== 'all' && !filteredServices.length) {
      console.log('No services for non-all statusFilter, returning empty');
      return {} as Record<string, any[]>;
    }

    // Group filtered services by category
    filteredServices.forEach((service: any) => {
      const categoryId = service.category?.id;
      const categoryName = service.category?.category_name || 'Uncategorized';
      const categoryKey = categoryId
        ? `${categoryName}_${categoryId}`
        : 'Uncategorized_0';

      if (!groupedById.has(categoryKey)) {
        groupedById.set(categoryKey, {
          category: service.category || {
            id: 0,
            category_name: 'Uncategorized',
          },
          services: [],
        });
      }
      groupedById.get(categoryKey)!.services.push(service);
    });

    // Convert to array and sort for better performance
    const sortedGroups = Array.from(groupedById.values()).sort((a, b) => {
      const idDiff = (a.category.id || 999) - (b.category.id || 999);
      if (idDiff !== 0) return idDiff;
      return (a.category.position || 999) - (b.category.position || 999);
    });

    // Build final grouped object
    const grouped: Record<string, any[]> = {};

    sortedGroups.forEach(({ category, services }) => {
      const displayName = `${category.category_name} (ID: ${category.id})`;

      // Apply custom service order or default sorting
      const customOrder = serviceOrder[displayName];

      if (customOrder && customOrder.length > 0) {
        // Use Map for O(1) lookup instead of find()
        const serviceMap = new Map(services.map((s) => [s.id, s]));
        const orderedServices: any[] = [];

        customOrder.forEach((serviceId) => {
          const service = serviceMap.get(serviceId);
          if (service) orderedServices.push(service);
        });

        services.forEach((service) => {
          if (!customOrder.includes(service.id)) {
            orderedServices.push(service);
          }
        });

        grouped[displayName] = orderedServices;
      } else {
        // Optimized sorting
        grouped[displayName] = services.sort((a: any, b: any) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];

          if (sortBy === 'rate' || sortBy === 'provider_price') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
          }

          return sortOrder === 'asc'
            ? aValue > bValue
              ? 1
              : -1
            : aValue < bValue
            ? 1
            : -1;
        });
      }
    });

    // Apply custom category order if available
    if (categoryOrder.length > 0) {
      const orderedGrouped: Record<string, any[]> = {};

      categoryOrder.forEach((categoryName) => {
        if (grouped[categoryName]) {
          orderedGrouped[categoryName] = grouped[categoryName];
        }
      });

      Object.keys(grouped).forEach((categoryName) => {
        if (!categoryOrder.includes(categoryName)) {
          orderedGrouped[categoryName] = grouped[categoryName];
        }
      });

      return orderedGrouped;
    }

    return grouped;
  }, [
    filteredServices,
    data?.allCategories,
    sortBy,
    sortOrder,
    categoryOrder,
    serviceOrder,
    statusFilter,
    pageSize,
  ]);


  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
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
    const allCategories = Object.keys(groupedServices);
    
    if (selectedServices.length === allServices.length && selectedCategories.length === allCategories.length) {
      setSelectedServices([]);
      setSelectedCategories([]);
    } else {
      setSelectedServices(allServices.map((service: any) => service.id));
      setSelectedCategories(allCategories);
    }
  };

  const handleSelectCategory = (categoryName: string, categoryServices: any[]) => {
    const categoryIds = categoryServices.map((service) => service.id);
    const allSelected = categoryIds.every((id) =>
      selectedServices.includes(id)
    );
    const categorySelected = selectedCategories.includes(categoryName);

    if (allSelected && categorySelected) {
      // Deselect category and its services
      setSelectedServices((prev) =>
        prev.filter((id) => !categoryIds.includes(id))
      );
      setSelectedCategories((prev) =>
        prev.filter((cat) => cat !== categoryName)
      );
    } else {
      // Select category and its services
      setSelectedServices((prev) => [...new Set([...prev, ...categoryIds])]);
      setSelectedCategories((prev) => [...new Set([...prev, categoryName])]);
    }
  };

  const handleCategoryCheckboxChange = (categoryName: string) => {
    const categoryServices = groupedServices[categoryName] || [];
    handleSelectCategory(categoryName, categoryServices);
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const newSelectedServices = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      
      // Update category selection based on service selection
      updateCategorySelectionBasedOnServices(newSelectedServices);
      
      return newSelectedServices;
    });
  };

  // Helper function to update category selection based on service selection
  const updateCategorySelectionBasedOnServices = (currentSelectedServices: string[]) => {
    setSelectedCategories((prevSelectedCategories) => {
      const newSelectedCategories = [...prevSelectedCategories];
      
      // Check each category to see if it should be selected or deselected
      Object.keys(groupedServices).forEach((categoryName) => {
        const categoryServices = groupedServices[categoryName] || [];
        const categoryServiceIds = categoryServices.map((service: any) => service.id);
        
        // Check if all services in this category are selected
        const allServicesSelected = categoryServiceIds.length > 0 && 
          categoryServiceIds.every((id: string) => currentSelectedServices.includes(id));
        
        // Check if any services in this category are selected
        const anyServiceSelected = categoryServiceIds.some((id: string) => 
          currentSelectedServices.includes(id));
        
        const categoryCurrentlySelected = newSelectedCategories.includes(categoryName);
        
        if (allServicesSelected && !categoryCurrentlySelected) {
          // All services selected, add category to selection
          newSelectedCategories.push(categoryName);
        } else if (!allServicesSelected && categoryCurrentlySelected) {
          // Not all services selected, remove category from selection
          const index = newSelectedCategories.indexOf(categoryName);
          if (index > -1) {
            newSelectedCategories.splice(index, 1);
          }
        }
      });
      
      return newSelectedCategories;
    });
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
    setEditServiceModal((prev) => ({ ...prev, closing: true }));
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
    setEditCategoryModal((prev) => ({ ...prev, closing: true }));
    setTimeout(() => {
      setEditCategoryModal({
        open: false,
        categoryId: '',
        categoryName: '',
        closing: false,
      });
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

  const handleOpenDeleteServicesAndCategoriesConfirmation = () => {
    if (selectedServices.length === 0 && selectedCategories.length === 0) {
      showToast('No services or categories selected', 'error');
      return;
    }
    setDeleteServicesAndCategoriesModal(true);
    setDeleteServicesAndCategoriesModalClosing(false);
  };

  const handleCloseDeleteServicesAndCategoriesConfirmation = () => {
    setDeleteServicesAndCategoriesModalClosing(true);
    setTimeout(() => {
      setDeleteServicesAndCategoriesModal(false);
      setDeleteServicesAndCategoriesModalClosing(false);
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

    if (
      !draggedCategory ||
      draggedCategory === targetCategoryName ||
      !dropPosition
    ) {
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

  const handleServiceDragOver = (
    e: React.DragEvent,
    targetServiceId: string
  ) => {
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

  const handleServiceDrop = (
    e: React.DragEvent,
    targetServiceId: string,
    categoryName: string
  ) => {
    e.preventDefault();
    console.log('Service dropped:', draggedService, 'on', targetServiceId);

    if (
      !draggedService ||
      draggedService === targetServiceId ||
      !dropPositionService
    ) {
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

    setServiceOrder((prev) => ({
      ...prev,
      [categoryName]: newOrder,
    }));

    setDraggedService(null);
    setDropTargetService(null);
    setDropPositionService(null);

    const draggedServiceObj = categoryServices.find(
      (s: any) => s.id === draggedService
    );
    showToast(
      `Moved "${draggedServiceObj?.name || 'Service'}" in ${categoryName}`,
      'success'
    );
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
      // Find the category this service belongs to
      const serviceCategory = Object.entries(groupedServices).find(([categoryName, services]) => 
        (services as any[]).some(s => s.id === service.id)
      );
      
      if (serviceCategory) {
        const [categoryName] = serviceCategory;
        const isCategoryInactive = !activeCategoryToggles[categoryName];
        
        // Prevent activating service if category is inactive
        if (service.status === 'inactive' && isCategoryInactive) {
          showToast('Cannot activate service while category is inactive. Please activate the category first.', 'error');
          return;
        }
      }

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

  const restoreService = async (service: any) => {
    try {
      setIsUpdating(true);
      const response = await axiosInstance.post(
        '/api/admin/services/restore',
        {
          id: service.id,
        }
      );

      if (response.data.success) {
        showToast(response.data.message, 'success');
        await refreshAllData();
      } else {
        showToast('Failed to restore service', 'error');
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

  // Helper function to extract actual category name from display name (remove ID part)
  const getActualCategoryName = (displayCategoryName: string) => {
    return displayCategoryName.includes(' (ID: ')
      ? displayCategoryName.split(' (ID: ')[0]
      : displayCategoryName;
  };

  const toggleCategoryAndServices = async (
    categoryName: string,
    services: any[]
  ) => {
    try {
      setIsUpdating(true);
      const newToggleState = !activeCategoryToggles[categoryName];

      // Extract category ID from the display name (e.g., "asdsdf (ID: 25)" -> "25")
      const categoryIdMatch = categoryName.match(/\(ID:\s*(\d+)\)/);
      if (!categoryIdMatch) {
        showToast('Invalid category format', 'error');
        return;
      }

      const categoryId = parseInt(categoryIdMatch[1]);
      const categoryData = categoriesData?.data?.find(
        (cat: any) => cat.id === categoryId
      );
      if (!categoryData) {
        showToast('Category not found', 'error');
        return;
      }

      showToast(
        `${newToggleState ? 'Activating' : 'Deactivating'} ${
          services.length
        } services in ${categoryName}...`,
        'pending'
      );

      setActiveCategoryToggles((prev) => ({
        ...prev,
        [categoryName]: newToggleState,
      }));

      // Main feature: Toggle all services in category
      // When deactivating category, force all services to inactive
      // When activating category, toggle services to their opposite state
      const promises = services.map((service) => {
        let targetStatus = service.status;
        
        if (!newToggleState) {
          // Category being deactivated - force all services to inactive
          targetStatus = 'active'; // This will be toggled to inactive by the API
        } else {
          // Category being activated - toggle services normally
          targetStatus = service.status;
        }
        
        return axiosInstance.post('/api/admin/services/toggle-status', {
          id: service.id,
          status: targetStatus,
        });
      });

      await Promise.all(promises);

      // Extra feature: Update category hideCategory field based on toggle state
      const hideCategory = newToggleState ? 'no' : 'yes';
      await axiosInstance.put(`/api/admin/categories/${categoryData.id}`, {
        category_name: categoryData.category_name,
        position: categoryData.position,
        hideCategory: hideCategory,
      });

      showToast(
        `Successfully ${
          newToggleState ? 'activated' : 'deactivated'
        } ${categoryName} category`,
        'success'
      );
      await refreshAllData();
    } catch (error: any) {
      setActiveCategoryToggles((prev) => ({
        ...prev,
        [categoryName]: !activeCategoryToggles[categoryName],
      }));
      showToast(
        `Error updating ${categoryName}: ${
          error.message || 'Something went wrong'
        }`,
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteService = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this service?'
    );
    if (!confirmDelete) return;

    try {
      console.log('Deleting service with ID:', id);

      // Optimistic update: Remove service from UI immediately
      const currentData = data?.data || [];
      const updatedServices = currentData.filter(
        (service: any) => service.id.toString() !== id.toString()
      );

      // Update the cache optimistically
      refreshServices(
        { ...data, data: updatedServices },
        { revalidate: false }
      );

      const response = await axiosInstance.delete(
        `/api/admin/services/delete-services?id=${id}`
      );
      console.log('Delete response:', response.data);

      if (response.data.success) {
        showToast(
          response.data.message || 'Service deleted successfully',
          'success'
        );
        // Revalidate to ensure data consistency
        await refreshAllData();
      } else {
        // Revert optimistic update on failure
        await refreshAllData();
        showToast(response.data.error || 'Failed to delete service', 'error');
      }
    } catch (error: any) {
      console.error('Delete service error:', error);
      // Revert optimistic update on error
      await refreshAllData();
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to delete service';
      showToast(errorMessage, 'error');
    }
  };

  const deleteSelectedServices = async () => {
    if (selectedServices.length === 0) return;

    try {
      setIsUpdating(true);
      showToast(
        `Deleting ${selectedServices.length} service${
          selectedServices.length !== 1 ? 's' : ''
        }...`,
        'pending'
      );

      console.log('Deleting services:', selectedServices);

      // Optimistic update: Remove selected services from UI immediately
      const currentData = data?.data || [];
      const updatedServices = currentData.filter(
        (service: any) => !selectedServices.includes(service.id.toString())
      );

      // Update the cache optimistically
      refreshServices(
        { ...data, data: updatedServices },
        { revalidate: false }
      );

      // Clear selection immediately for better UX
      setSelectedServices([]);

      // Delete services in parallel
      const deletePromises = selectedServices.map((serviceId) =>
        axiosInstance.delete(
          `/api/admin/services/delete-services?id=${serviceId}`
        )
      );

      const results = await Promise.all(deletePromises);
      console.log('Delete results:', results);

      // Check if all deletions were successful
      const failedDeletions = results.filter((result) => !result.data.success);

      if (failedDeletions.length > 0) {
        showToast(
          `Failed to delete ${failedDeletions.length} service${
            failedDeletions.length !== 1 ? 's' : ''
          }`,
          'error'
        );
        // Revalidate to ensure data consistency
        await refreshAllData();
      } else {
        showToast(
          `Successfully deleted ${selectedServices.length} service${
            selectedServices.length !== 1 ? 's' : ''
          }`,
          'success'
        );
        // Revalidate to ensure data consistency
        await refreshAllData();
      }

      handleCloseDeleteConfirmation();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      // Revert optimistic update on error
      await refreshAllData();
      const errorMessage =
        error.response?.data?.error || error.message || 'Something went wrong';
      showToast(`Error deleting services: ${errorMessage}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteSelectedServicesAndCategories = async () => {
    if (selectedServices.length === 0 && selectedCategories.length === 0) return;

    try {
      setIsUpdating(true);
      const serviceCount = selectedServices.length;
      const categoryCount = selectedCategories.length;
      
      showToast(
        `Deleting ${serviceCount} service${serviceCount !== 1 ? 's' : ''} and ${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'}...`,
        'pending'
      );

      console.log('Deleting services:', selectedServices);
      console.log('Deleting categories:', selectedCategories);
      console.log('Selected categories raw data:', selectedCategories);

      // Extract category IDs from category names
      const categoryIds = selectedCategories.map((categoryName) => {
        console.log('Processing category name:', categoryName, 'Type:', typeof categoryName);
        
        // Check if the category name has the format "CategoryName (ID: 123)"
        const idMatch = categoryName.match(/\(ID:\s*(\d+)\)/);
        if (idMatch) {
          const categoryId = idMatch[1];
          console.log('Extracted category ID from (ID: X) format:', categoryId, 'from:', categoryName);
          return categoryId;
        }
        
        // Check if the category name has the format "CategoryName_ID"
        const lastUnderscoreIndex = categoryName.lastIndexOf('_');
        if (lastUnderscoreIndex === -1) {
          console.error('Invalid category name format (no underscore or ID format):', categoryName);
          return null;
        }
        
        const categoryId = categoryName.substring(lastUnderscoreIndex + 1);
        console.log('Extracting category ID from underscore format:', categoryName, '-> ID:', categoryId, 'Length:', categoryId.length);
        
        // Trim any whitespace and validate that the extracted ID is a number
        const trimmedCategoryId = categoryId.trim();
        console.log('Trimmed category ID:', trimmedCategoryId);
        
        if (!/^\d+$/.test(trimmedCategoryId)) {
          console.error('Extracted category ID is not a valid number:', trimmedCategoryId, 'from:', categoryName);
          console.error('Character codes:', Array.from(trimmedCategoryId).map(c => c.charCodeAt(0)));
          return null;
        }
        
        return trimmedCategoryId;
      }).filter(id => id !== null); // Remove any null values

      console.log('Category IDs to delete:', categoryIds);

      // Check if we have valid category IDs to delete
      if (selectedCategories.length > 0 && categoryIds.length === 0) {
        showToast('Error: No valid category IDs found for deletion', 'error');
        return;
      }

      // Delete services and categories in parallel
      const deletePromises = [
        ...selectedServices.map((serviceId) =>
          axiosInstance.delete(`/api/admin/services/delete-services?id=${serviceId}`)
        ),
        ...categoryIds.map((categoryId) =>
          axiosInstance.delete(`/api/admin/categories/delete-categories?id=${categoryId}`)
        )
      ];

      const results = await Promise.all(deletePromises);
      console.log('Delete results:', results);

      // Check if all deletions were successful
      const failedDeletions = results.filter((result) => !result.data.success);

      if (failedDeletions.length > 0) {
        showToast(
          `Failed to delete ${failedDeletions.length} item${failedDeletions.length !== 1 ? 's' : ''}`,
          'error'
        );
      } else {
        showToast(
          `Successfully deleted ${serviceCount} service${serviceCount !== 1 ? 's' : ''} and ${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'}`,
          'success'
        );
      }

      // Clear selections and refresh data
      setSelectedServices([]);
      setSelectedCategories([]);
      await refreshAllData();

      handleCloseDeleteServicesAndCategoriesConfirmation();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      await refreshAllData();
      const errorMessage =
        error.response?.data?.error || error.message || 'Something went wrong';
      showToast(`Error deleting services and categories: ${errorMessage}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // NEW: Modified Batch Operations Handler - only sets the operation, doesn't execute
  const handleBatchOperationSelect = (operation: BulkOperation) => {
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
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-status', {
                id: serviceId,
                status: 'inactive',
              })
            )
          );
          showToast(`Successfully enabled ${count} ${serviceText}`, 'success');
          break;

        case 'disable':
          showToast(`Disabling ${count} ${serviceText}...`, 'pending');
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-status', {
                id: serviceId,
                status: 'active',
              })
            )
          );
          showToast(`Successfully disabled ${count} ${serviceText}`, 'success');
          break;

        case 'make-secret':
          showToast(`Making ${count} ${serviceText} secret...`, 'pending');
          // TODO: Implement secret functionality
          showToast(
            `Successfully made ${count} ${serviceText} secret`,
            'success'
          );
          break;

        case 'remove-secret':
          showToast(
            `Removing secret from ${count} ${serviceText}...`,
            'pending'
          );
          // TODO: Implement remove secret functionality
          showToast(
            `Successfully removed secret from ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'delete-pricing':
          showToast(
            `Deleting custom pricing for ${count} ${serviceText}...`,
            'pending'
          );
          // TODO: Implement delete custom pricing functionality
          showToast(
            `Successfully deleted custom pricing for ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'delete':
          handleOpenDeleteConfirmation();
          return; // Exit early, don't clear selection or refresh data yet

        case 'delete-services-categories':
          handleOpenDeleteServicesAndCategoriesConfirmation();
          return; // Exit early, don't clear selection or refresh data yet

        case 'refill-enable':
          showToast(
            `Enabling refill for ${count} ${serviceText}...`,
            'pending'
          );
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-refill', {
                id: serviceId,
                refill: true,
              })
            )
          );
          showToast(
            `Successfully enabled refill for ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'refill-disable':
          showToast(
            `Disabling refill for ${count} ${serviceText}...`,
            'pending'
          );
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-refill', {
                id: serviceId,
                refill: false,
              })
            )
          );
          showToast(
            `Successfully disabled refill for ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'cancel-enable':
          showToast(
            `Enabling cancel for ${count} ${serviceText}...`,
            'pending'
          );
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-cancel', {
                id: serviceId,
                cancel: true,
              })
            )
          );
          showToast(
            `Successfully enabled cancel for ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'cancel-disable':
          showToast(
            `Disabling cancel for ${count} ${serviceText}...`,
            'pending'
          );
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-cancel', {
                id: serviceId,
                cancel: false,
              })
            )
          );
          showToast(
            `Successfully disabled cancel for ${count} ${serviceText}`,
            'success'
          );
          break;

        default:
          showToast('Unknown operation', 'error');
          return;
      }

      // Clear selection and refresh data for all operations except delete
      if (selectedBulkOperation && !['delete', ''].includes(selectedBulkOperation)) {
        setSelectedServices([]);
        setSelectedBulkOperation(''); // Clear the selected operation
        await refreshAllData();
      }
    } catch (error: any) {
      showToast(
        `Error performing batch operation: ${
          error.message || 'Something went wrong'
        }`,
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDeleteCategoryModal = (
    categoryName: string,
    categoryId: string | number,
    servicesCount: number
  ) => {
    setDeleteCategoryModal({
      open: true,
      categoryName,
      categoryId,
      servicesCount,
      closing: false,
    });
  };

  const handleCloseDeleteCategoryModal = () => {
    setDeleteCategoryModal((prev) => ({ ...prev, closing: true }));
    setTimeout(() => {
      setDeleteCategoryModal({
        open: false,
        categoryName: '',
        categoryId: '',
        servicesCount: 0,
        closing: false,
      });
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

  const deleteCategory = async (
    action: 'delete' | 'move',
    targetCategoryId?: string
  ) => {
    const { categoryName, categoryId, servicesCount } = deleteCategoryModal;

    try {
      setIsUpdating(true);
      console.log('Deleting category:', {
        action,
        categoryId,
        categoryName,
        servicesCount,
        targetCategoryId,
      });

      if (action === 'move' && targetCategoryId) {
        // First move all services to the target category
        showToast(
          `Moving ${servicesCount} service${
            servicesCount !== 1 ? 's' : ''
          } to new category...`,
          'pending'
        );

        const moveResponse = await axiosInstance.put(
          `/api/admin/services/move-category`,
          {
            fromCategoryId: categoryId,
            toCategoryId: targetCategoryId,
          }
        );

        console.log('Move response:', moveResponse.data);

        if (!moveResponse.data.success) {
          showToast(
            moveResponse.data.error || 'Failed to move services',
            'error'
          );
          return;
        }
      }

      // Then delete the category
      showToast(`Deleting "${categoryName}" category...`, 'pending');

      const response = await axiosInstance.delete(
        `/api/admin/categories/${categoryId}`
      );
      console.log('Delete category response:', response.data);

      if (response.data.success) {
        // Optimistic update: Remove category and its services from UI immediately
        const currentCategories = categoriesData?.data || [];
        const currentServices = data?.data || [];

        // Remove category from categories list
        const updatedCategories = currentCategories.filter(
          (cat: any) => cat.id.toString() !== categoryId.toString()
        );

        // Remove services from this category if action is 'delete'
        let updatedServices = currentServices;
        if (action === 'delete') {
          updatedServices = currentServices.filter(
            (service: any) =>
              service.categoryId.toString() !== categoryId.toString()
          );
        }

        // Update both caches optimistically
        refreshCategories(
          { ...categoriesData, data: updatedCategories },
          { revalidate: false }
        );

        if (action === 'delete') {
          refreshServices(
            { ...data, data: updatedServices },
            { revalidate: false }
          );
        }

        // Show success message
        if (action === 'move') {
          showToast(
            `Successfully moved ${servicesCount} service${
              servicesCount !== 1 ? 's' : ''
            } and deleted "${categoryName}" category`,
            'success'
          );
        } else {
          showToast(
            response.data.message ||
              `Successfully deleted "${categoryName}" category and all services`,
            'success'
          );
        }

        // Close modal immediately
        handleCloseDeleteCategoryModal();

        // Revalidate to ensure data consistency
        await refreshAllData();
      } else {
        showToast(response.data.error || 'Failed to delete category', 'error');
      }
    } catch (error: any) {
      console.error('Delete category error:', error);
      // Revert optimistic updates on error
      await refreshAllData();
      const errorMessage =
        error.response?.data?.error || error.message || 'Something went wrong';
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
      const initialToggles: { [key: string]: boolean } = {};
      const allCategoryNames = Object.keys(groupedServices);

      Object.keys(groupedServices).forEach((categoryName) => {
        // Extract category ID from the display name (e.g., "asdsdf (ID: 25)" -> "25")
        const categoryIdMatch = categoryName.match(/\(ID:\s*(\d+)\)/);
        if (categoryIdMatch) {
          const categoryId = parseInt(categoryIdMatch[1]);
          const categoryData = categoriesData?.data?.find(
            (cat: any) => cat.id === categoryId
          );
          // If hideCategory is "no" then category is active (toggle ON), if "yes" then inactive (toggle OFF)
          initialToggles[categoryName] = categoryData?.hideCategory === 'no';
        } else {
          // Fallback for categories without ID format
          const actualCategoryName = getActualCategoryName(categoryName);
          const categoryData = categoriesData?.data?.find(
            (cat: any) => cat.category_name === actualCategoryName
          );
          initialToggles[categoryName] = categoryData?.hideCategory === 'no';
        }
      });
      setActiveCategoryToggles(initialToggles);

      // Initialize category order if not set
      if (categoryOrder.length === 0) {
        setCategoryOrder(Object.keys(groupedServices));
      }

      // Update allCategoriesCollapsed state based on current collapsed categories
      const allCollapsed =
        allCategoryNames.length > 0 &&
        allCategoryNames.every((cat) => collapsedCategories.includes(cat));
      setAllCategoriesCollapsed(allCollapsed);
    }
  }, [
    data?.data,
    groupedServices,
    categoryOrder.length,
    collapsedCategories,
    categoriesData?.data,
  ]);

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
    if (
      editServiceModal.open ||
      createServiceModal ||
      createCategoryModal ||
      editCategoryModal.open ||
      deleteConfirmationModal ||
      deleteCategoryModal.open
    ) {
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
  }, [
    editServiceModal.open,
    createServiceModal,
    createCategoryModal,
    editCategoryModal.open,
    deleteConfirmationModal,
    deleteCategoryModal.open,
  ]);

  const serviceStats = [
    {
      title: 'Total Services',
      value: countsWithoutTrash.all,
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
      value: countsWithoutTrash.active,
      icon: <FaCheckCircle className="h-6 w-6" />,
      textColor: 'text-green-600',
    },
    {
      title: 'Inactive Services',
      value: countsWithoutTrash.inactive,
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
                      {stat.value.toString()}
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

              {/* Provider Filter Dropdown - Moved after page view dropdown */}
              <select 
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                {uniqueProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>

              <button
                onClick={handleRefresh}
                disabled={servicesLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync
                  className={
                    servicesLoading || statsLoading ? 'animate-spin' : ''
                  }
                />
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
                  placeholder={`Search ${
                    statusFilter === 'all' ? 'all' : statusFilter
                  } services...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
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
                    {countsWithoutTrash.all.toString()}
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
                    {countsWithoutTrash.active.toString()}
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
                    {countsWithoutTrash.inactive.toString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('trash')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'trash'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Trash
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'trash'
                        ? 'bg-white/20'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {trashServicesCount.toString()}
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
                  <div className="text-base font-medium">
                    Loading services...
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center py-20">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">
                      Loading services...
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <FaExclamationTriangle
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Error Loading Services
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {error}
                </p>
              </div>
            ) : !data || (statusFilter !== 'all' && Object.keys(groupedServices).length === 0) || (statusFilter !== 'all' && Object.values(groupedServices).every(services => services.length === 0)) || (statusFilter === 'all' && Object.keys(groupedServices).length === 0) ? (
              <div className="p-12 text-center">
                <FaGlobe
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
                  {searchTerm && providerFilter !== 'all'
                    ? `No ${providerFilter} services match your search "${searchTerm}".`
                    : searchTerm
                    ? `No services match your search "${searchTerm}".`
                    : providerFilter !== 'all'
                    ? `No ${providerFilter} services found.`
                    : 'No services exist yet.'}
                </p>
              </div>
            ) : (
              <>
                {selectedServices.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {selectedServices.length} selected
                    </span>

                    {/* Modified Batch Operations Dropdown */}
                    <select
                      value={selectedBulkOperation}
                      onChange={(e) => {
                        handleBatchOperationSelect(e.target.value as BulkOperation);
                      }}
                      disabled={isUpdating}
                      className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm disabled:opacity-50"
                    >
                      <option value="">Batch Operations</option>
                      <option value="enable">Enable Selected Services</option>
                      <option value="disable">Disable Selected Services</option>
                      <option value="make-secret">
                        Make Selected Services Secret
                      </option>
                      <option value="remove-secret">
                        Remove Selected from Service Secret
                      </option>
                      <option value="delete-pricing">
                        Delete Selected Services Custom Pricing
                      </option>
                      <option value="refill-enable">
                        Refill Enable Selected Services
                      </option>
                      <option value="refill-disable">
                        Refill Disable Selected Services
                      </option>
                      <option value="cancel-enable">
                        Cancel Enable Selected Services
                      </option>
                      <option value="cancel-disable">
                        Cancel Disable Selected Services
                      </option>
                      <option value="delete">Delete Selected Services</option>
                      <option value="delete-services-categories">Delete Selected Services & Categories</option>
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
                            Saving...
                          </>
                        ) : (
                          <>Save Changes</>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Services Table View */}
                <ServicesTable
                  groupedServices={groupedServices}
                  statusFilter={statusFilter}
                  categoriesData={categoriesData}
                  selectedServices={selectedServices}
                  selectedCategories={selectedCategories}
                  collapsedCategories={collapsedCategories}
                  allCategoriesCollapsed={allCategoriesCollapsed}
                  activeCategoryToggles={activeCategoryToggles}
                  isUpdating={isUpdating}
                  draggedCategory={draggedCategory}
                  dropTargetCategory={dropTargetCategory}
                  dropPosition={dropPosition}
                  draggedService={draggedService}
                  dropTargetService={dropTargetService}
                  dropPositionService={dropPositionService}
                  getProviderNameById={getProviderNameById}
                  handleSelectAll={handleSelectAll}
                  handleSelectCategory={handleSelectCategory}
                  handleCategoryCheckboxChange={handleCategoryCheckboxChange}
                  handleSelectService={handleSelectService}
                  toggleCategory={toggleCategory}
                  toggleAllCategories={toggleAllCategories}
                  toggleCategoryAndServices={toggleCategoryAndServices}
                  handleEditService={handleEditService}
                  toggleServiceStatus={toggleServiceStatus}
                  restoreService={restoreService}
                  deleteService={deleteService}
                  toggleRefill={toggleRefill}
                  toggleCancel={toggleCancel}
                  editCategory={editCategory}
                  handleOpenDeleteCategoryModal={handleOpenDeleteCategoryModal}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDragEnd={handleDragEnd}
                  handleDrop={handleDrop}
                  handleServiceDragStart={handleServiceDragStart}
                  handleServiceDragOver={handleServiceDragOver}
                  handleServiceDragLeave={handleServiceDragLeave}
                  handleServiceDragEnd={handleServiceDragEnd}
                  handleServiceDrop={handleServiceDrop}
                />

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading services...</span>
                      </div>
                    ) : pageSize === 'all' ? (
                      `Showing all ${data?.totalCategories || 0} categories`
                    ) : (
                      `Showing page ${currentPage} of ${totalPages} (${
                        data?.totalCategories || 0
                      } total categories)`
                    )}
                  </div>

                  {/* Pagination Controls - Hide when showing all */}
                  {pageSize !== 'all' && (
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <button
                        onClick={handlePreviousPage}
                        disabled={isLoading || currentPage === 1}
                        className="btn btn-secondary disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {isLoading ? (
                          <GradientSpinner size="w-4 h-4" />
                        ) : (
                          `Page ${currentPage} of ${totalPages}`
                        )}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={isLoading || currentPage === totalPages}
                        className="btn btn-secondary disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit Service Modal */}
        {editServiceModal.open && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              editServiceModal.closing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseEditModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 ${
                editServiceModal.closing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
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
              createServiceModalClosing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseCreateModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 ${
                createServiceModalClosing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <CreateServiceForm
                onClose={handleCloseCreateModal}
                showToast={showToast}
                onRefresh={refreshAllData}
                refreshAllDataWithServices={refreshAllDataWithServices}
              />
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        {createCategoryModal && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              createCategoryModalClosing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseCategoryModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                createCategoryModalClosing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
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
              editCategoryModal.closing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseEditCategoryModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                editCategoryModal.closing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <EditCategoryForm
                categoryId={editCategoryModal.categoryId}
                categoryName={editCategoryModal.categoryName}
                onClose={handleCloseEditCategoryModal}
                showToast={showToast}
                refreshAllData={refreshAllData}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmationModal && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              deleteConfirmationModalClosing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseDeleteConfirmation}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                deleteConfirmationModalClosing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
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

        {/* Delete Services and Categories Confirmation Modal */}
        {deleteServicesAndCategoriesModal && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              deleteServicesAndCategoriesModalClosing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseDeleteServicesAndCategoriesConfirmation}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                deleteServicesAndCategoriesModalClosing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteServicesAndCategoriesModal
                onClose={handleCloseDeleteServicesAndCategoriesConfirmation}
                onConfirm={deleteSelectedServicesAndCategories}
                selectedServiceCount={selectedServices.length}
                selectedCategoryCount={selectedCategories.length}
              />
            </div>
          </div>
        )}

        {/* Delete Category Modal */}
        {deleteCategoryModal.open && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              deleteCategoryModal.closing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseDeleteCategoryModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                deleteCategoryModal.closing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteCategoryModal
                onClose={handleCloseDeleteCategoryModal}
                onConfirm={deleteCategory}
                categoryName={deleteCategoryModal.categoryName}
                categoryId={typeof deleteCategoryModal.categoryId === 'string' ? parseInt(deleteCategoryModal.categoryId) : deleteCategoryModal.categoryId}
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