'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
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
import ProviderOrderStatus from '@/components/admin/ProviderOrderStatus';
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

const AdminOrdersPage = () => {
  const { appName } = useAppNameWithFallback();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('All Orders', appName);
  }, [appName]);

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

  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Provider sync handler
  const handleProviderSync = async (orderId: string) => {
    try {
      const response = await fetch('/api/admin/provider-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderIds: [orderId] }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Provider sync completed successfully');
        // Refresh orders after sync
        await fetchOrders();
      } else {
        toast.error(result.error || 'Failed to sync provider order');
      }
    } catch (error) {
      console.error('Error syncing provider order:', error);
      toast.error('Failed to sync provider order');
    }
  };

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

  // Fetch all orders to calculate real status counts
  const fetchAllOrdersForCounts = async () => {
    try {
      console.log('Fetching all orders for status counts...');
      const response = await fetch('/api/admin/orders?limit=1000'); // Get more orders for accurate counts
      const result = await response.json();

      if (result.success && result.data) {
        const allOrders = result.data;
        const statusCounts = calculateStatusCounts(allOrders);

        console.log('Calculated status counts:', statusCounts);

        setStats((prev) => ({
          ...prev,
          pendingOrders: statusCounts.pending,
          processingOrders: statusCounts.processing,
          completedOrders: statusCounts.completed,
          statusBreakdown: {
            ...prev.statusBreakdown,
            pending: statusCounts.pending,
            processing: statusCounts.processing,
            completed: statusCounts.completed,
            partial: statusCounts.partial,
            cancelled: statusCounts.cancelled,
            failed: statusCounts.failed,
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching orders for counts:', error);
    }
  };
  const fetchOrders = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/orders?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data || []);
        setPagination(
          result.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          }
        );
      } else {
        toastNotification && showToast(result.error || 'Failed to fetch orders', 'error');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error fetching orders', 'error');
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
      setOrdersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from API...'); // Debug log
      const response = await fetch('/api/admin/orders/stats?period=all');
      console.log('Stats API response status:', response.status); // Debug log

      const result = await response.json();
      console.log('Stats API full response:', result); // Debug log

      if (result.success) {
        const data = result.data;
        console.log('Stats API data:', data); // Debug log

        // Build status breakdown object from array
        const statusBreakdown: Record<string, number> = {};
        if (data.statusBreakdown && Array.isArray(data.statusBreakdown)) {
          data.statusBreakdown.forEach((item: any) => {
            statusBreakdown[item.status] = item.count || 0;
          });
        }

        const processedStats = {
          totalOrders: data.overview?.totalOrders || pagination.total, // Use pagination total as fallback
          pendingOrders: statusBreakdown.pending || 0,
          processingOrders: statusBreakdown.processing || 0,
          completedOrders: statusBreakdown.completed || 0,
          totalRevenue: data.overview?.totalRevenue || 0,
          todayOrders: data.dailyTrends?.[0]?.orders || 0,
          statusBreakdown: statusBreakdown,
        };

        console.log('Processed Stats:', processedStats); // Debug log
        setStats(processedStats);
      } else {
        console.error('Stats API error:', result.error);
        // Use pagination total as fallback
        setStats({
          totalOrders: pagination.total,
          pendingOrders: 0,
          processingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          todayOrders: 0,
          statusBreakdown: {},
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use pagination total as fallback
      setStats({
        totalOrders: pagination.total,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
        statusBreakdown: {},
      });
    }
  };

  // Handle search with debouncing - only update table, not whole page
  useEffect(() => {
    const timer = setTimeout(() => {
      // Set loading when search changes
      setOrdersLoading(true);
      fetchOrders();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data on component mount and when filters change
  useEffect(() => {
    setOrdersLoading(true);
    fetchOrders();
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchStats();
    fetchAllOrdersForCounts(); // Get real status counts

    // Simulate stats loading delay
    const timer = setTimeout(() => {
      setStatsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Update stats when pagination data changes (real total orders)
  useEffect(() => {
    if (pagination.total > 0) {
      setStats((prev) => ({
        ...prev,
        totalOrders: pagination.total,
      }));
    }
  }, [pagination.total]);

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
    setOrdersLoading(true);
    fetchOrders();
    fetchStats();
    fetchAllOrdersForCounts(); // Refresh status counts too
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalOrders}
                  </p>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pendingOrders}
                  </p>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completedOrders}
                  </p>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-purple-600">
                    ${formatPrice(stats.totalRevenue, 2)}
                  </p>
                )}
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

              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/provider-sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'sync_all' })
                    });
                    if (response.ok) {
                      await fetchOrders();
                      // Show success toast
                    }
                  } catch (error) {
                    console.error('Provider sync failed:', error);
                  }
                }}
                disabled={ordersLoading || statsLoading}
                className="btn btn-secondary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className="h-4 w-4" />
                Sync Providers
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

              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="id">Order ID</option>
                <option value="username">Username</option>
              </select>
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

            {ordersLoading ? (
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
              <React.Fragment>
                {/* Table View - Visible on all screen sizes */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[1200px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedOrders.length === orders.length &&
                              orders.length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
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
                          User
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Charge
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Profit
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Price (Unit/Total)
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Link
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Seller
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Start
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Quantity
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Service
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Provider Status
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Status
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Remains
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Date
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Mode
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {order.id || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {order.user?.username ||
                                order.user?.email?.split('@')[0] ||
                                order.user?.name ||
                                'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-right">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                $
                                {order.charge
                                  ? formatPrice(order.charge, 2)
                                  : '0.00'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-right">
                              <div className="font-semibold text-sm text-green-600">
                                $
                                {order.profit
                                  ? formatPrice(order.profit, 2)
                                  : '0.00'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-right">
                              <div className="font-semibold text-sm text-600">
                                ${formatPrice(order.usdPrice || 0, 2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Rate: ${order.service?.rate || 0}/1000 × {order.qty || 1}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="max-w-28">
                              {order.link ? (
                                <div className="flex items-center gap-1">
                                  <a
                                    href={order.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs truncate flex-1"
                                  >
                                    {order.link.length > 18
                                      ? order.link.substring(0, 18) + '...'
                                      : order.link}
                                  </a>
                                  <button
                                    onClick={() =>
                                      window.open(order.link, '_blank')
                                    }
                                    className="text-blue-500 hover:text-blue-700 p-1 flex-shrink-0"
                                    title="Open link in new tab"
                                  >
                                    <FaExternalLinkAlt className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className="text-xs"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  null
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {order.seller || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {order.startCount
                                ? formatNumber(order.startCount)
                                : 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-right">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {order.qty ? formatNumber(order.qty) : 'null'}
                              </div>
                              <div className="text-xs text-green-600">
                                {order.qty && order.remains
                                  ? formatNumber(order.qty - order.remains)
                                  : '0'}{' '}
                                delivered
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-mono text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {order.service?.id
                                  ? formatID(order.service.id)
                                  : 'null'}
                              </div>
                              <div
                                className="font-medium text-sm truncate max-w-44"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {order.service?.name || 'null'}
                              </div>
                              <div
                                className="text-xs truncate max-w-44"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {order.category?.category_name || 'null'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <ProviderOrderStatus 
                              order={{
                                id: order.id.toString(),
                                status: order.status,
                                isProviderService: order.isProviderService,
                                providerId: order.providerId,
                                providerServiceId: order.providerServiceId,
                                providerOrderId: order.providerOrderId,
                                providerStatus: order.providerStatus,
                                lastSyncAt: order.lastSyncAt,
                                apiProvider: order.apiProvider
                              }}
                              onSync={handleProviderSync}
                            />
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <div
                                className="text-xs font-medium"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {order.qty && order.remains
                                  ? calculateProgress(order.qty, order.remains)
                                  : 0}
                                %
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      order.qty && order.remains
                                        ? calculateProgress(
                                            order.qty,
                                            order.remains
                                          )
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {order.remains
                                  ? formatNumber(order.remains)
                                  : 'null'}{' '}
                                left
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt
                                    ).toLocaleDateString()
                                  : 'null'}
                              </div>
                              <div className="text-xs">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt
                                    ).toLocaleTimeString()
                                  : 'null'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                order.mode === 'Auto'
                                  ? 'bg-green-100 text-green-800'
                                  : order.mode === 'Manual'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.mode || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              {/* 3 Dot Menu */}
                              <div className="relative">
                                <button
                                  className="btn btn-secondary p-2"
                                  title="More Actions"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.currentTarget
                                      .nextElementSibling as HTMLElement;
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
                                        openEditStartCountDialog(
                                          order.id,
                                          order.startCount || 0
                                        );
                                        const dropdown = document.querySelector(
                                          '.absolute.right-0'
                                        ) as HTMLElement;
                                        dropdown?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaEye className="h-3 w-3" />
                                      Edit Start Count
                                    </button>
                                    <button
                                      onClick={() => {
                                        openMarkPartialDialog(order.id);
                                        const dropdown = document.querySelector(
                                          '.absolute.right-0'
                                        ) as HTMLElement;
                                        dropdown?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaExclamationCircle className="h-3 w-3" />
                                      Mark Partial
                                    </button>
                                    <button
                                      onClick={() => {
                                        openUpdateStatusDialog(
                                          order.id,
                                          order.status
                                        );
                                        const dropdown = document.querySelector(
                                          '.absolute.right-0'
                                        ) as HTMLElement;
                                        dropdown?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaSync className="h-3 w-3" />
                                      Update Order Status
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Hidden (using table view instead) */}
                <div className="hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="card card-padding border-l-4 border-blue-500 mb-4"
                      >
                        {/* Header with ID and Actions */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {order.id || 'null'}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                              {getStatusIcon(order.status)}
                              <span className="text-xs font-medium capitalize">
                                {order.status
                                  ? order.status.replace('_', ' ')
                                  : 'null'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {/* 3 Dot Menu for Mobile */}
                            <div className="relative">
                              <button
                                className="btn btn-secondary p-2"
                                title="More Actions"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const dropdown = e.currentTarget
                                    .nextElementSibling as HTMLElement;
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
                                      openEditStartCountDialog(
                                        order.id,
                                        order.startCount || 0
                                      );
                                      const dropdown = document.querySelector(
                                        '.absolute.right-0'
                                      ) as HTMLElement;
                                      dropdown?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <FaEye className="h-3 w-3" />
                                    Edit Start Count
                                  </button>
                                  <button
                                    onClick={() => {
                                      openMarkPartialDialog(order.id);
                                      const dropdown = document.querySelector(
                                        '.absolute.right-0'
                                      ) as HTMLElement;
                                      dropdown?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <FaExclamationCircle className="h-3 w-3" />
                                    Mark Partial
                                  </button>
                                  <button
                                    onClick={() => {
                                      openUpdateStatusDialog(
                                        order.id,
                                        order.status
                                      );
                                      const dropdown = document.querySelector(
                                        '.absolute.right-0'
                                      ) as HTMLElement;
                                      dropdown?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <FaSync className="h-3 w-3" />
                                    Update Order Status
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              User
                            </div>
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {order.user?.username ||
                                order.user?.email?.split('@')[0] ||
                                order.user?.name ||
                                'null'}
                            </div>
                          </div>
                          <div
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              order.mode === 'Auto'
                                ? 'bg-green-100 text-green-800'
                                : order.mode === 'Manual'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {order.mode || 'null'}
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="mb-4">
                          <div
                            className="font-mono text-xs mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {order.service?.id
                              ? formatID(order.service.id)
                              : 'null'}
                          </div>
                          <div
                            className="font-medium text-sm mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {order.service?.name || 'null'}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {order.category?.category_name || 'null'} •
                            Provider: {order.seller || 'null'}
                          </div>
                          {/* Provider Order Status */}
                          {order.isProviderService && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
                              <div className="text-xs font-medium text-gray-600 mb-1">
                                Provider Order Status
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  ID: {order.providerOrderId || 'N/A'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  order.providerStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                  order.providerStatus === 'In progress' ? 'bg-yellow-100 text-yellow-700' :
                                  order.providerStatus === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                  order.providerStatus === 'Canceled' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {order.providerStatus || 'Unknown'}
                                </span>
                              </div>
                              {order.lastSyncAt && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Last sync: {new Date(order.lastSyncAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}
                          {order.link ? (
                            <div className="flex items-center gap-1 mt-1">
                              <a
                                href={order.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs flex-1 truncate"
                              >
                                {order.link.length > 38
                                  ? order.link.substring(0, 38) + '...'
                                  : order.link}
                              </a>
                              <button
                                onClick={() =>
                                  window.open(order.link, '_blank')
                                }
                                className="text-blue-500 hover:text-blue-700 p-1 flex-shrink-0"
                                title="Open link in new tab"
                              >
                                <FaExternalLinkAlt className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span
                              className="text-xs mt-1 block"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              null
                            </span>
                          )}
                        </div>

                        {/* Financial Info */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Unit Price
                            </div>
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ${formatPrice(order.usdPrice || 0, 2)}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Total Price
                            </div>
                            <div className="font-semibold text-sm text-blue-600">
                              ${formatPrice(order.usdPrice || 0, 2)}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Profit
                            </div>
                            <div className="font-semibold text-sm text-green-600">
                              $
                              {order.profit
                                ? formatPrice(order.profit, 2)
                                : '0.00'}
                            </div>
                          </div>
                        </div>

                        {/* Quantity and Progress Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Quantity
                            </div>
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {order.qty ? formatNumber(order.qty) : 'null'}
                            </div>
                            <div className="text-xs text-green-600">
                              {order.qty && order.remains
                                ? formatNumber(order.qty - order.remains)
                                : '0'}{' '}
                              delivered
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Start Count
                            </div>
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {order.startCount
                                ? formatNumber(order.startCount)
                                : 'null'}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span
                              className="text-xs font-medium"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Progress
                            </span>
                            <span
                              className="text-xs font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {order.qty && order.remains
                                ? calculateProgress(order.qty, order.remains)
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  order.qty && order.remains
                                    ? calculateProgress(
                                        order.qty,
                                        order.remains
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {order.remains || 'null'} remaining
                          </div>
                        </div>

                        {/* Date */}
                        <div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Date:{' '}
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : 'null'}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Time:{' '}
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleTimeString()
                              : 'null'}
                          </div>
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
                    {ordersLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading pagination...</span>
                      </div>
                    ) : (
                      `Showing ${formatNumber(
                        (pagination.page - 1) * pagination.limit + 1
                      )} to ${formatNumber(
                        Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )
                      )} of ${formatNumber(pagination.total)} orders`
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
                      disabled={!pagination.hasPrev || ordersLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {ordersLoading ? (
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
                      disabled={!pagination.hasNext || ordersLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Bulk Status Change Dialog */}
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
                    fetchOrders();
                    fetchStats();
                    fetchAllOrdersForCounts();
                  }}
                  showToast={showToast}
                />

                {/* Edit Start Count Dialog */}
                <StartCountModal
                  isOpen={editStartCountDialog.open}
                  onClose={() => setEditStartCountDialog({ open: false, orderId: '', currentCount: 0 })}
                  orderId={editStartCountDialog.orderId}
                  currentCount={editStartCountDialog.currentCount}
                  onSuccess={() => {
                    fetchOrders();
                    fetchStats();
                    fetchAllOrdersForCounts();
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
                    fetchOrders();
                    fetchStats();
                    fetchAllOrdersForCounts();
                  }}
                  showToast={showToast}
                />
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;