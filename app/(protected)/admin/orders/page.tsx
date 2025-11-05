'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState, useRef } from 'react';
import {
  FaBox,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaEdit,
  FaEllipsisH,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaEye,
  FaSearch,
  FaSync,
  FaTimes,
  FaTimesCircle,
} from 'react-icons/fa';

// Import APP_NAME constant
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatID, formatNumber, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

// Dynamic imports for modal components
const ChangeAllStatusModal = dynamic(() => import('@/components/admin/orders/modals/change-all-status'), {
  ssr: false,
});

const StartCountModal = dynamic(() => import('@/components/admin/orders/modals/start-count'), {
  ssr: false,
});

const MarkPartialModal = dynamic(() => import('@/components/admin/orders/modals/mark-partial'), {
  ssr: false,
});

const UpdateOrderStatusModal = dynamic(() => import('@/components/admin/orders/modals/update-order-status'), {
  ssr: false,
});

const OrderTable = dynamic(() => import('@/components/admin/orders/order-table'), {
  ssr: false,
});

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

// Define interfaces for type safety
interface Order {
  id: number;
  user: {
    id: number;
    email: string;
    name: string;
    username?: string;
    currency: string;
  };
  service: {
    id: number;
    name: string;
    rate: number;
    min_order: number;
    max_order: number;
    providerId?: number;
    providerName?: string;
    providerServiceId?: string;
  };
  category: {
    id: number;
    category_name: string;
  };
  qty: number;
  price: number;
  charge: number;
  profit: number;
  usdPrice: number;
  bdtPrice: number;
  currency: string;
  status:
    | 'pending'
    | 'processing'
    | 'in_progress'
    | 'completed'
    | 'partial'
    | 'cancelled'
    | 'refunded'
    | 'failed';
  createdAt: string;
  updatedAt: string;
  link: string;
  startCount: number;
  remains: number;
  avg_time: string;
  seller: string;
  mode: string;
  // Provider order fields
  isProviderService?: boolean;
  providerId?: string;
  providerServiceId?: string;
  providerOrderId?: string;
  providerStatus?: string;
  lastSyncAt?: string;
  apiProvider?: {
    id: string;
    name: string;
    apiUrl: string;
    status: string;
  };
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  statusBreakdown: Record<string, number>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Cache for stats data to avoid repeated API calls
let statsCache: { data: OrderStats; timestamp: number } | null = null;
const STATS_CACHE_DURATION = 30000; // 30 seconds

const AdminOrdersPage = () => {
  const { appName } = useAppNameWithFallback();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('All Orders', appName);
  }, [appName]);

  // Detect page reload vs navigation
  useEffect(() => {
    if (isInitialMount.current) {
      // Use sessionStorage to detect if this is a fresh page load or navigation
      const navigationKey = 'orders_page_visited';
      const hasVisited = typeof window !== 'undefined' && sessionStorage.getItem(navigationKey);
      
      // If not visited before in this session, it's a page reload/fresh load
      const isReload = !hasVisited;
      
      // Mark as visited for subsequent navigations
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(navigationKey, 'true');
      }
      
      setIsPageReload(isReload);
      isInitialMount.current = false;
    }
  }, []);

  // Get currency data
  const { availableCurrencies } = useCurrency();

  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0, // Use real data, not mock
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    statusBreakdown: {},
  });

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Page reload detection
  const isInitialMount = useRef(true);
  const [isPageReload, setIsPageReload] = useState(false);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);



  // New state for action modals
  const [editStartCountDialog, setEditStartCountDialog] = useState<{
    open: boolean;
    orderId: string | number;
    currentCount: number;
  }>({
    open: false,
    orderId: '',
    currentCount: 0,
  });
  const [updateStatusDialog, setUpdateStatusDialog] = useState<{
    open: boolean;
    orderId: string | number;
    currentStatus: string;
  }>({
    open: false,
    orderId: '',
    currentStatus: '',
  });
  const [markPartialDialog, setMarkPartialDialog] = useState<{
    open: boolean;
    orderId: string | number;
  }>({
    open: false,
    orderId: '',
  });

  // New state for bulk status change
  const [bulkStatusDialog, setBulkStatusDialog] = useState<{
    open: boolean;
  }>({
    open: false,
  });
  const [bulkStatus, setBulkStatus] = useState('');

  // Calculate status counts from current orders data
  const calculateStatusCounts = (ordersData: Order[]) => {
    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      partial: 0,
      cancelled: 0,
      in_progress: 0,
      refunded: 0,
      failed: 0,
    };

    ordersData.forEach((order) => {
      if (order.status && counts.hasOwnProperty(order.status)) {
        counts[order.status as keyof typeof counts]++;
      }
    });

    return {
      pending: counts.pending,
      processing: counts.processing + counts.in_progress, // Combine processing and in_progress
      completed: counts.completed,
      partial: counts.partial,
      cancelled: counts.cancelled + counts.refunded, // Combine cancelled and refunded
      failed: counts.failed,
    };
  };

  // Optimized parallel data fetching with caching and fast loading
  const fetchDataOptimized = async (showLoadingState = true) => {
    const loadingStartTime = Date.now();
    const minLoadingTime = 10; // 0.01 seconds minimum loading time
    const REQUEST_TIMEOUT_MS = 10000; // 10s safety timeout to avoid infinite loading

    // Only show loading states if requested (for page reload)
    if (showLoadingState) {
      setOrdersLoading(true);
      setStatsLoading(true);
    }

    // Setup abort controllers for safety timeouts
    const ordersController = new AbortController();
    let statsController: AbortController | null = null;
    const ordersTimeout = setTimeout(() => ordersController.abort(), REQUEST_TIMEOUT_MS);
    let statsTimeout: ReturnType<typeof setTimeout> | null = null;

    try {
      // Create query params for orders
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      // Check cache for stats data
      const now = Date.now();
      const useCache = statsCache && (now - statsCache.timestamp) < STATS_CACHE_DURATION;

      // Prepare promises for parallel execution
      const ordersPromise = fetch(`/api/admin/orders?${queryParams}`, { signal: ordersController.signal })
        .then(res => res.json())
        .catch(err => ({ success: false, error: err?.name === 'AbortError' ? 'Orders request timed out' : 'Failed to fetch orders' }));

      let statsPromise: Promise<any>;
      if (useCache) {
        statsPromise = Promise.resolve({ success: true, data: statsCache.data });
      } else {
        statsController = new AbortController();
        statsTimeout = setTimeout(() => statsController?.abort(), REQUEST_TIMEOUT_MS);
        statsPromise = fetch('/api/admin/orders/stats?period=all', { signal: statsController.signal })
          .then(res => res.json())
          .catch(err => ({ success: false, error: err?.name === 'AbortError' ? 'Stats request timed out' : 'Failed to fetch stats' }));
      }

      // Execute both requests in parallel
      const [ordersResult, statsResult] = await Promise.allSettled([ordersPromise, statsPromise]);

      // Clear timeouts once settled
      clearTimeout(ordersTimeout);
      if (statsTimeout) clearTimeout(statsTimeout);

      // Process orders result
      if (ordersResult.status === 'fulfilled' && ordersResult.value && ordersResult.value.success) {
        const ordersData = ordersResult.value;
        const transformed = (ordersData.data || []).map((o: any) => ({
          ...o,
          mode:
            o?.service?.providerId && o?.service?.providerServiceId
              ? 'Auto'
              : 'Manual',
        }));
        setOrders(transformed);
        setPagination(ordersData.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        });

        // Calculate status counts from current orders for quick stats
        const statusCounts = calculateStatusCounts(ordersData.data || []);
        
        // Update stats with quick counts if no cached data
        if (!useCache) {
          setStats(prev => ({
            ...prev,
            pendingOrders: statusCounts.pending,
            processingOrders: statusCounts.processing,
            completedOrders: statusCounts.completed,
            totalOrders: ordersData.pagination?.total || prev.totalOrders,
          }));
        }
      } else {
        setOrders([]);
        setPagination({
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        });
        if (ordersResult.status === 'fulfilled') {
          showToast(ordersResult.value.error || 'Failed to fetch orders', 'error');
        } else {
          showToast('Failed to fetch orders', 'error');
        }
      }

      // Process stats result
      if (statsResult.status === 'fulfilled' && statsResult.value && statsResult.value.success && !useCache) {
        const data = statsResult.value.data;
        
        // Build status breakdown object from array
        const statusBreakdown: Record<string, number> = {};
        if (data.statusBreakdown && Array.isArray(data.statusBreakdown)) {
          data.statusBreakdown.forEach((item: any) => {
            statusBreakdown[item.status] = item.count || 0;
          });
        }

        const processedStats = {
          totalOrders: data.overview?.totalOrders || pagination.total,
          pendingOrders: statusBreakdown.pending || 0,
          processingOrders: statusBreakdown.processing || 0,
          completedOrders: statusBreakdown.completed || 0,
          totalRevenue: data.overview?.totalRevenue || 0,
          todayOrders: data.dailyTrends?.[0]?.orders || 0,
          statusBreakdown: statusBreakdown,
        };

        setStats(processedStats);
        
        // Update cache
        statsCache = {
          data: processedStats,
          timestamp: now
        };
      } else if (useCache && statsResult.status === 'fulfilled') {
        // Use cached stats data
        setStats(statsCache!.data);
      } else if (statsResult.status === 'rejected') {
        showToast('Failed to fetch stats', 'error');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error fetching data', 'error');
      setOrders([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      // Ensure minimum loading time for smooth UX
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        // Always clear loading flags after requests settle
        setOrdersLoading(false);
        setStatsLoading(false);
        setOrdersLoading(false);
        setStatsLoading(false);
      }, remainingTime);
    }
  };

  // Handle search with optimized debouncing - faster response
  useEffect(() => {
    const timer = setTimeout(() => {
      // Don't show loading state for search (user interaction)
      fetchDataOptimized(false);
    }, 200); // Reduced from 500ms to 200ms for faster response

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data on component mount and when filters change
  useEffect(() => {
    // Don't show loading state for filter changes (user interaction)
    fetchDataOptimized(false);
  }, [pagination.page, pagination.limit, statusFilter]);

  // Initial data load on component mount
  useEffect(() => {
    // Only show loading state if it's a page reload
    fetchDataOptimized(isPageReload);
  }, [isPageReload]);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastNotification({ message, type });
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="h-3 w-3 text-yellow-500" />;
      case 'processing':
      case 'in_progress':
        return <FaSync className="h-3 w-3 text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <FaTimesCircle className="h-3 w-3 text-red-500" />;
      case 'partial':
        return <FaExclamationCircle className="h-3 w-3 text-orange-500" />;
      case 'failed':
        return <FaTimesCircle className="h-3 w-3 text-gray-500" />;
      default:
        return <FaClock className="h-3 w-3 text-gray-500" />;
    }
  };

  const calculateProgress = (qty: number, remains: number) => {
    return qty > 0 ? Math.round(((qty - remains) / qty) * 100) : 0;
  };

  // Function to format currency based on order currency
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `$${formatPrice(amount, 2)}`;
    } else if (currency === 'BDT') {
      return `৳${formatPrice(amount, 2)}`;
    } else if (currency === 'XCD') {
      return `$${formatPrice(amount, 2)}`;
    } else {
      // For other currencies, try to find the symbol from available currencies
      const currencyData = availableCurrencies?.find(c => c.code === currency);
      const symbol = currencyData?.symbol || '$';
      return `${symbol}${formatPrice(amount, 2)}`;
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.id));
    }
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleRefresh = () => {
    // Clear cache to force fresh data
    statsCache = null;
    // Show loading state for manual refresh
    fetchDataOptimized(true);
    showToast('Orders refreshed successfully!', 'success');
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showToast('Order deleted successfully', 'success');
        fetchOrders();
        fetchStats();
        setDeleteDialogOpen(false);
        setOrderToDelete(null);
      } else {
        showToast(result.error || 'Failed to delete order', 'error');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast('Error deleting order', 'error');
    }
  };



  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders/bulk/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          `${selectedOrders.length} orders status updated to ${newStatus}`,
          'success'
        );
        fetchOrders();
        fetchStats();
        fetchAllOrdersForCounts();
        setSelectedOrders([]);
        setBulkStatusDialog({ open: false });
        setBulkStatus('');
      } else {
        showToast(result.error || 'Failed to update orders status', 'error');
      }
    } catch (error) {
      console.error('Error updating orders status:', error);
      showToast('Error updating orders status', 'error');
    }
  };





  // Open mark partial dialog
  const openMarkPartialDialog = (orderId: string | number) => {
    setMarkPartialDialog({ open: true, orderId });
  };

  // Open edit start count dialog
  const openEditStartCountDialog = (orderId: string | number, currentCount: number) => {
    setEditStartCountDialog({ open: true, orderId, currentCount });
  };

  // Open update status dialog
  const openUpdateStatusDialog = (orderId: string | number, currentStatus: string) => {
    setUpdateStatusDialog({ open: true, orderId, currentStatus });
  };

  // Open bulk status dialog
  const openBulkStatusDialog = () => {
    setBulkStatusDialog({ open: true });
    setBulkStatus('');
  };

  // Handle resend order
  const handleResendOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        showToast('Order resent successfully', 'success');
        fetchOrders();
        fetchStats();
        fetchAllOrdersForCounts();
      } else {
        showToast(result.error || 'Failed to resend order', 'error');
      }
    } catch (error) {
      console.error('Error resending order:', error);
      showToast('Error resending order', 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Toast Container */}
      <div className="toast-container">
        {toastNotification && (
        <Toast
          message={toastNotification.message}
          type={toastNotification.type}
          onClose={() => setToastNotification(null)}
        />
      )}
      </div>

      <div className="page-content">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaBox />
              </div>
              <div>
                <h3 className="card-title">Total Orders</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaClock />
              </div>
              <div>
                <h3 className="card-title">Pending Orders</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaCheckCircle />
              </div>
              <div>
                <h3 className="card-title">Completed Orders</h3>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaDollarSign />
              </div>
              <div>
                <h3 className="card-title">Total Revenue</h3>
                <p className="text-2xl font-bold text-purple-600">
                  ${formatPrice(stats.totalRevenue, 2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section - After stats cards */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Page View Dropdown */}
              <select
                value={pagination.limit}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    limit:
                      e.target.value === 'all'
                        ? 1000
                        : parseInt(e.target.value),
                    page: 1,
                  }))
                }
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={ordersLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync
                  className={
                    ordersLoading || statsLoading ? 'animate-spin' : ''
                  }
                />
                Refresh
              </button>


            </div>

            {/* Right: Search Controls Only */}
            <div className="flex flex-row items-center gap-3">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${
                    statusFilter === 'all' ? 'all' : statusFilter
                  } orders...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              {/* Removed search dropdown per requirement: search via input only */}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
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
                    {stats.totalOrders}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'pending'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pending
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'pending'
                        ? 'bg-white/20'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {stats.pendingOrders}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('processing')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'processing'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Processing
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'processing'
                        ? 'bg-white/20'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {stats.processingOrders}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'completed'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Completed
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'completed'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {stats.completedOrders}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('partial')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'partial'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Partial
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'partial'
                        ? 'bg-white/20'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {stats.statusBreakdown?.partial || 0}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'cancelled'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancelled
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'cancelled'
                        ? 'bg-white/20'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {stats.statusBreakdown?.cancelled || 0}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('failed')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'failed'
                      ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Failed
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'failed'
                        ? 'bg-white/20'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stats.statusBreakdown?.failed || 0}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {/* Selected Orders Actions - Top of table */}
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2 py-4 border-b mb-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {selectedOrders.length} selected
                </span>
                <button
                  onClick={openBulkStatusDialog}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FaEdit />
                  Change All Orders Status
                </button>
              </div>
            )}

            {ordersLoading && isPageReload ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">Loading orders...</div>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <FaBox
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No information was found for you.
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No orders match your current filters or no orders exist yet.
                </p>
              </div>
            ) : (
              <OrderTable
                orders={orders}
                selectedOrders={selectedOrders}
                onSelectOrder={handleSelectOrder}
                onSelectAll={handleSelectAll}
                onResendOrder={handleResendOrder}
                onEditStartCount={(orderId: number, currentCount: number) => {
                  openEditStartCountDialog(orderId, currentCount);
                }}
                onMarkPartial={(orderId: number) => {
                  openMarkPartialDialog(orderId);
                }}
                onUpdateStatus={(orderId: number, currentStatus: string) => {
                  openUpdateStatusDialog(orderId, currentStatus);
                }}
                pagination={pagination}
                onPageChange={(newPage: number) => {
                  setPagination(prev => ({ ...prev, page: newPage }));
                }}
                isLoading={ordersLoading}
                formatID={formatID}
                formatNumber={formatNumber}
                formatPrice={formatPrice}
                getStatusIcon={getStatusIcon}
                calculateProgress={calculateProgress}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangeAllStatusModal
        isOpen={bulkStatusDialog.open}
        onClose={() => setBulkStatusDialog({ open: false })}
        selectedOrdersCount={selectedOrders.length}
        bulkStatus={bulkStatus}
        setBulkStatus={setBulkStatus}
        onUpdate={handleBulkStatusUpdate}
      />

      {/* Mark Partial Dialog */}
      <MarkPartialModal
        isOpen={markPartialDialog.open}
        onClose={() => setMarkPartialDialog({ open: false, orderId: '' })}
        orderId={markPartialDialog.orderId}
        onSuccess={() => {
          setMarkPartialDialog({ open: false, orderId: '' });
          fetchOrders();
          showToast('Order marked as partial successfully');
        }}
        showToast={showToast}
      />

      {/* Start Count Dialog */}
      <StartCountModal
        isOpen={editStartCountDialog.open}
        onClose={() => setEditStartCountDialog({ open: false, orderId: '', currentCount: 0 })}
        orderId={editStartCountDialog.orderId}
        currentCount={editStartCountDialog.currentCount}
        onSuccess={() => {
          setEditStartCountDialog({ open: false, orderId: '', currentCount: 0 });
          fetchOrders();
          showToast('Start count updated successfully');
        }}
        showToast={showToast}
      />

      {/* Update Status Dialog */}
      <UpdateOrderStatusModal
        isOpen={updateStatusDialog.open}
        onClose={() => setUpdateStatusDialog({ open: false, orderId: '', currentStatus: '' })}
        orderId={updateStatusDialog.orderId}
        currentStatus={updateStatusDialog.currentStatus}
        onSuccess={() => {
          setUpdateStatusDialog({ open: false, orderId: '', currentStatus: '' });
          fetchOrders();
          showToast('Order status updated successfully');
        }}
        showToast={showToast}
      />
    </div>
  );
};

export default AdminOrdersPage;