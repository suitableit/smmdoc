'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import axiosInstance from '@/lib/axiosInstance';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import moment from 'moment';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
    FaAward,
    FaBullseye,
    FaCalendar,
    FaChartLine,
    FaCheckCircle,
    FaClock,
    FaCog,
    FaCommentDots,
    FaDollarSign,
    FaEye,
    FaRedo,
    FaShoppingCart,
    FaTimes,
    FaTimesCircle,
    FaUserPlus,
    FaUsers,
} from 'react-icons/fa';

// Optimized dynamic imports without loading states for instant display
const PendingTransactions = dynamic(
  () => import('@/components/admin/main/pending-transactions'),
  { ssr: false }
);

const LatestUsers = dynamic(
  () => import('@/components/admin/main/latest-users'),
  { ssr: false }
);

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

// Cache keys for sessionStorage
const CACHE_KEYS = {
  DASHBOARD_STATS: 'admin_dashboard_stats',
  LATEST_USERS: 'admin_latest_users',
  PENDING_TRANSACTIONS: 'admin_pending_transactions',
  CACHE_TIMESTAMP: 'admin_cache_timestamp'
};

// Different cache durations for different data types
const CACHE_DURATIONS = {
  DASHBOARD_STATS: 2 * 60 * 1000, // 2 minutes for stats (less dynamic)
  LATEST_USERS: 45 * 1000, // 45 seconds for users (moderately dynamic)
  PENDING_TRANSACTIONS: 30 * 1000, // 30 seconds for transactions (highly dynamic)
  DEFAULT: 60 * 1000 // 1 minute default
};

// Cache utility functions
const getCachedData = (key: string) => {
  try {
    if (typeof window === 'undefined') return null;
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Error reading from cache:', error);
    return null;
  }
};

const setCachedData = (key: string, data: any) => {
  try {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, JSON.stringify(data));
    // Set individual timestamps for each data type
    const timestampKey = `${key}_timestamp`;
    sessionStorage.setItem(timestampKey, Date.now().toString());
    // Add cache version for better invalidation
    const versionKey = `${key}_version`;
    sessionStorage.setItem(versionKey, Math.random().toString(36).substr(2, 9));
  } catch (error) {
    console.warn('Error writing to cache:', error);
  }
};

const isCacheValid = (key: string) => {
  try {
    if (typeof window === 'undefined') return false;
    const timestampKey = `${key}_timestamp`;
    const timestamp = sessionStorage.getItem(timestampKey);
    if (!timestamp) return false;
    
    // Get appropriate cache duration for this data type
    let duration = CACHE_DURATIONS.DEFAULT;
    if (key === CACHE_KEYS.DASHBOARD_STATS) duration = CACHE_DURATIONS.DASHBOARD_STATS;
    else if (key === CACHE_KEYS.LATEST_USERS) duration = CACHE_DURATIONS.LATEST_USERS;
    else if (key === CACHE_KEYS.PENDING_TRANSACTIONS) duration = CACHE_DURATIONS.PENDING_TRANSACTIONS;
    
    return Date.now() - parseInt(timestamp) < duration;
  } catch (error) {
    return false;
  }
};

const clearCache = () => {
  try {
    if (typeof window === 'undefined') return;
    Object.values(CACHE_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(`${key}_timestamp`);
      sessionStorage.removeItem(`${key}_version`);
    });
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
};

// Force cache invalidation for specific data type
const invalidateCache = (key: string) => {
  try {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(`${key}_timestamp`);
    sessionStorage.removeItem(`${key}_version`);
  } catch (error) {
    console.warn('Error invalidating cache:', error);
  }
};

// User interfaces
interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  balance: number;
  total_spent: number;
  totalOrders: number;
  servicesDiscount: number;
  specialPricing: boolean;
  status: 'active' | 'suspended' | 'banned';
  currency: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
}

interface PendingTransaction {
  id: number;
  invoice_id: number;
  userId: number;
  username?: string;
  amount: number;
  transaction_id?: string;
  sender_number?: string;
  status: string;
  admin_status: string;
  method?: string;
  payment_method?: string;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

type Order = {
  id: number;
  usdPrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  service: {
    name: string;
  };
};

type DashboardStats = {
  totalOrders: number;
  totalUsers: number;
  totalServices: number;
  totalCategories: number;
  totalRevenue: number;
  recentOrders: Order[];
  ordersByStatus: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    partial: number;
  };
  dailyOrders: {
    date: string;
    orders: number;
  }[];
  todaysOrders: number;
  todaysProfit: number;
  newUsersToday: number;
};

export default function AdminDashboardPage() {
  const { appName } = useAppNameWithFallback();

  // Set document title
  useEffect(() => {
    setPageTitle('Admin Dashboard', appName);
  }, [appName]);

  const { currency, rate } = useCurrency();

  // Initialize state with cached data if available and valid
  const initializeWithCache = () => {
    // Check cache validity for each data type individually
    const statsValid = isCacheValid(CACHE_KEYS.DASHBOARD_STATS);
    const usersValid = isCacheValid(CACHE_KEYS.LATEST_USERS);
    const transactionsValid = isCacheValid(CACHE_KEYS.PENDING_TRANSACTIONS);
    
    // Initialize stats with cached data or defaults
    const cachedStats = statsValid ? getCachedData(CACHE_KEYS.DASHBOARD_STATS) : null;
    const defaultStats = {
      totalOrders: 0,
      totalUsers: 0,
      totalServices: 0,
      totalCategories: 0,
      totalRevenue: 0,
      recentOrders: [],
      ordersByStatus: {
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        partial: 0,
      },
      dailyOrders: [],
      todaysOrders: 0,
      todaysProfit: 0,
      newUsersToday: 0,
    };

    return {
      stats: cachedStats || defaultStats,
      latestUsers: usersValid ? getCachedData(CACHE_KEYS.LATEST_USERS) || [] : [],
      pendingTransactions: transactionsValid ? getCachedData(CACHE_KEYS.PENDING_TRANSACTIONS) || [] : [],
      hasStatsCache: statsValid && cachedStats !== null,
      hasUsersCache: usersValid,
      hasTransactionsCache: transactionsValid
    };
  };

  const initialData = initializeWithCache();

  const [stats, setStats] = useState<DashboardStats>(initialData.stats);

  // Optimized: Start with false for instant display, only show loading if no cache
  const [statsLoading, setStatsLoading] = useState(!initialData.hasStatsCache);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  // Latest Users State - Initialize with cached data
  const [latestUsers, setLatestUsers] = useState<User[]>(initialData.latestUsers);
  const [latestUsersLoading, setLatestUsersLoading] = useState(!initialData.hasUsersCache);

  // Pending Transactions State - Initialize with cached data
  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >(initialData.pendingTransactions);
  const [transactionsLoading, setTransactionsLoading] = useState(!initialData.hasTransactionsCache);
  const [totalTransactionCount, setTotalTransactionCount] = useState(initialData.pendingTransactions.length);
  const [customToast, setCustomToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Optimized: Parallel data fetching with caching and stale-while-revalidate
  const fetchAllData = useCallback(async (isBackgroundRefresh = false) => {
    try {
      // Check individual cache validity for each data type
      const statsValid = isCacheValid(CACHE_KEYS.DASHBOARD_STATS);
      const usersValid = isCacheValid(CACHE_KEYS.LATEST_USERS);
      const transactionsValid = isCacheValid(CACHE_KEYS.PENDING_TRANSACTIONS);

      // Only show loading states if this is not a background refresh and we don't have valid cached data
      if (!isBackgroundRefresh) {
        if (!statsValid) setStatsLoading(true);
        if (!usersValid) setLatestUsersLoading(true);
        if (!transactionsValid) setTransactionsLoading(true);
      }

      // Prepare all API calls to run in parallel
      const statsPromise = fetch('/api/admin/dashboard/stats').then(res => res.json());
      
      const usersQueryParams = new URLSearchParams({
        page: '1',
        limit: '5',
        role: 'user',
        sort: 'createdAt',
        order: 'desc',
      });
      const usersPromise = fetch(`/api/admin/users?${usersQueryParams}`).then(res => res.json());
      
      const transactionsPromise = axiosInstance.get('/api/transactions', {
        params: {
          admin: 'true',
          status: 'pending',
          limit: 10,
          offset: 0,
        },
        timeout: 5000, // Reduced timeout for faster response
      });

      // Execute all API calls in parallel
      const [statsResult, usersResult, transactionsResponse] = await Promise.all([
        statsPromise,
        usersPromise,
        transactionsPromise,
      ]);

      // Process stats data
      if (statsResult.success) {
        setStats(statsResult.data);
        setCachedData(CACHE_KEYS.DASHBOARD_STATS, statsResult.data);
      }

      // Process users data
      if (usersResult.success) {
        const filteredUsers = (usersResult.data || []).filter(
          (user: User) => user.role === 'user'
        );
        const usersToShow = filteredUsers.slice(0, 5);
        setLatestUsers(usersToShow);
        setCachedData(CACHE_KEYS.LATEST_USERS, usersToShow);
      }

      // Process transactions data
      let transactionsToShow: PendingTransaction[] = [];
      if (transactionsResponse.data) {
        if (transactionsResponse.data.transactions) {
          const transactions = transactionsResponse.data.transactions;
          setTotalTransactionCount(transactions.length);
          transactionsToShow = transactions.slice(0, 3);
          setPendingTransactions(transactionsToShow);
        } else if (Array.isArray(transactionsResponse.data)) {
          const pending = transactionsResponse.data.filter(
            (transaction: PendingTransaction) => transaction.status === 'pending'
          );
          setTotalTransactionCount(pending.length);
          transactionsToShow = pending.slice(0, 3);
          setPendingTransactions(transactionsToShow);
        }
        setCachedData(CACHE_KEYS.PENDING_TRANSACTIONS, transactionsToShow);
      }

      // Hide loading states
      setStatsLoading(false);
      setLatestUsersLoading(false);
      setTransactionsLoading(false);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Only set fallback empty states if we don't have any valid cached data
      const statsValid = isCacheValid(CACHE_KEYS.DASHBOARD_STATS);
      const usersValid = isCacheValid(CACHE_KEYS.LATEST_USERS);
      const transactionsValid = isCacheValid(CACHE_KEYS.PENDING_TRANSACTIONS);
      
      if (!usersValid) {
        setLatestUsers([]);
      }
      if (!transactionsValid) {
        setPendingTransactions([]);
        setTotalTransactionCount(0);
      }

      // Hide loading states even on error
      setStatsLoading(false);
      setLatestUsersLoading(false);
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check individual cache validity for each data type
    const statsValid = isCacheValid(CACHE_KEYS.DASHBOARD_STATS);
    const usersValid = isCacheValid(CACHE_KEYS.LATEST_USERS);
    const transactionsValid = isCacheValid(CACHE_KEYS.PENDING_TRANSACTIONS);
    
    // Always fetch fresh data in background, but show loading states only if no valid cache exists
    const hasAnyValidCache = statsValid || usersValid || transactionsValid;
    
    if (hasAnyValidCache) {
      // Background refresh without loading states - always fetch fresh data
      fetchAllData(true);
    } else {
      // Normal fetch with loading states when no cache exists
      fetchAllData(false);
    }

    // Set up more aggressive polling for background updates
    // Use shorter intervals for more dynamic data
    const interval = setInterval(() => {
      // Always do background refresh during polling
      fetchAllData(true);
    }, 15000); // Reduced from 30 seconds to 15 seconds for more frequent updates

    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setCustomToast({ message, type });
    setTimeout(() => setCustomToast(null), 4000);
  };

  // Utility functions
  const formatCurrency = useCallback((amount: number, currency: string) => {
    const formatters = {
      USD: (amt: number) => `${amt.toFixed(2)}`,
      BDT: (amt: number) => `৳${amt.toFixed(2)}`,
    };
    return (
      formatters[currency as keyof typeof formatters]?.(amount) ||
      `${amount.toFixed(2)}`
    );
  }, []);

  const handleApprove = async (transactionId: string | number) => {
    try {
      const response = await axiosInstance.patch(
        `/api/transactions/${transactionId}`,
        {
          status: 'approved',
        }
      );

      if (response.status === 200) {
        // Remove from pending list
        const updatedTransactions = pendingTransactions.filter((t) => t.id !== transactionId);
        setPendingTransactions(updatedTransactions);
        setTotalTransactionCount((prev) => prev - 1);

        // Update cache with new transaction list
        setCachedData(CACHE_KEYS.PENDING_TRANSACTIONS, updatedTransactions);
        
        // Invalidate related caches to force fresh data
        invalidateCache(CACHE_KEYS.DASHBOARD_STATS);
        
        // Trigger immediate background refresh for all data
        setTimeout(() => fetchAllData(true), 100);

        showToast('Transaction approved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      showToast('Failed to approve transaction', 'error');
    }
  };

  const handleCancel = async (transactionId: string | number) => {
    if (
      !confirm(
        'Are you sure you want to cancel this transaction? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/api/transactions/${transactionId}`,
        {
          status: 'cancelled',
        }
      );

      if (response.status === 200) {
        // Remove from pending list
        const updatedTransactions = pendingTransactions.filter((t) => t.id !== transactionId);
        setPendingTransactions(updatedTransactions);
        setTotalTransactionCount((prev) => prev - 1);

        // Update cache with new transaction list
        setCachedData(CACHE_KEYS.PENDING_TRANSACTIONS, updatedTransactions);
        
        // Invalidate related caches to force fresh data
        invalidateCache(CACHE_KEYS.DASHBOARD_STATS);
        
        // Trigger immediate background refresh for all data
        setTimeout(() => fetchAllData(true), 100);

        showToast('Transaction cancelled successfully!', 'success');
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      showToast('Failed to cancel transaction', 'error');
    }
  };

  const handleTransactionUpdate = useCallback((transactionId: number) => {
    // Remove from pending list and update count
    const updatedTransactions = pendingTransactions.filter((t) => t.id !== transactionId);
    setPendingTransactions(updatedTransactions);
    setTotalTransactionCount((prev) => prev - 1);

    // Update cache with new transaction list
    setCachedData(CACHE_KEYS.PENDING_TRANSACTIONS, updatedTransactions);
    
    // Invalidate related caches to force fresh data
    invalidateCache(CACHE_KEYS.DASHBOARD_STATS);
    
    // Trigger immediate background refresh for all data
    setTimeout(() => fetchAllData(true), 100);
  }, [pendingTransactions, fetchAllData]);

  const handleRefreshTransactions = () => {
    setTransactionsLoading(true);
    fetchPendingTransactions();
    showToast('Transactions refreshed successfully!', 'success');
  };

  // Function to format currency based on selected currency
  const formatDashboardCurrency = useCallback((amount: number) => {
    // Admin stats are stored in BDT, so we need to convert if USD is selected
    if (currency === 'USD' && rate) {
      const amountInUSD = amount / rate;
      return `$${amountInUSD.toFixed(2)}`;
    } else {
      return `৳${amount.toFixed(2)}`;
    }
  }, [currency, rate]);

  // Function to format date
  const formatDate = useCallback((dateString: string) => {
    return {
      date: moment(dateString).format('DD/MM/YYYY'),
      time: moment(dateString).format('HH:mm'),
    };
  }, []);

  if (false) {
    return (
      <div className="px-4 sm:px-8 py-4 sm:py-8 bg-[var(--page-bg)] dark:bg-[var(--page-bg)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Toast Container */}
      <div className="toast-container">
        {customToast && (
          <Toast
            message={customToast.message}
            type={customToast.type}
            onClose={() => setCustomToast(null)}
          />
        )}
      </div>

      {/* Statistics Overview - Section 1 */}
      <div className="mb-6">
        {/* First Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaUsers />
              </div>
              <div className="flex-1">
                <h3 className="card-title">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalUsers || 1}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaDollarSign />
              </div>
              <div className="flex-1">
                <h3 className="card-title">Total Balance</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatDashboardCurrency(stats.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaShoppingCart />
              </div>
              <div className="flex-1">
                <h3 className="card-title">Total Orders</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaBullseye />
              </div>
              <div className="flex-1">
                <h3 className="card-title">Total Payments</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {formatDashboardCurrency(stats.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaChartLine />
              </div>
              <div className="flex-1">
                <h3 className="card-title">Last 30 Days</h3>
                <p className="text-2xl font-bold text-cyan-600">
                  {formatDashboardCurrency(stats.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaAward />
              </div>
              <div className="flex-1">
                <h3 className="card-title">Today Profit</h3>
                <p className="text-2xl font-bold text-rose-600">
                  {formatDashboardCurrency(stats.todaysProfit || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaShoppingCart />
              </div>
              <div className="flex-1">
                <h3 className="card-title">Today's Orders</h3>
                <p className="text-2xl font-bold text-teal-600">
                  {stats.todaysOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaUserPlus />
              </div>
              <div className="flex-1">
                <h3 className="card-title">New Users Today</h3>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.newUsersToday || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Section 2 */}
      <div className="mb-6">
        <div className="card card-padding">
          <div className="card-header mb-4">
            <div className="card-icon">
              <FaCog />
            </div>
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/transactions"
              className={`btn btn-primary w-full flex items-center justify-center gap-2`}
            >
              <FaDollarSign className="w-4 h-4" />
              Manage Transactions
            </Link>
            <Link
              href="/admin/users"
              className={`btn btn-secondary w-full flex items-center justify-center gap-2`}
            >
              <FaUsers className="w-4 h-4" />
              Manage Users
            </Link>
            <Link
              href="/admin/orders"
              className={`btn btn-secondary w-full flex items-center justify-center gap-2`}
            >
              <FaShoppingCart className="w-4 h-4" />
              Manage Orders
            </Link>
            <Link
              href="/admin/services"
              className={`btn btn-secondary w-full flex items-center justify-center gap-2`}
            >
              <FaCog className="w-4 h-4" />
              Manage Services
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Transactions - Section 3 */}
      <PendingTransactions
        pendingTransactions={pendingTransactions}
        transactionsLoading={transactionsLoading}
        onTransactionUpdate={handleTransactionUpdate}
        showToast={showToast}
      />

      {/* Latest Users - Section 7 */}
      <LatestUsers
        latestUsers={latestUsers}
        latestUsersLoading={latestUsersLoading}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
