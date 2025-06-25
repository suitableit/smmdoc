'use client';

import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import axiosInstance from '@/lib/axiosInstance';
import { APP_NAME } from '@/lib/constants';
import moment from 'moment';
import { useEffect, useState, useCallback } from 'react';
import {
    FaArrowRight,
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
    FaSync,
    FaTimes,
    FaTimesCircle,
    FaUserPlus,
    FaUsers,
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
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

// User interfaces
interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  balance: number;
  spent: number;
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
  id: string;
  invoice_id: string;
  userId: string;
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
  id: string;
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
  // Set document title
  useEffect(() => {
    document.title = `Admin Dashboard — ${APP_NAME}`;
  }, []);

  const { currency, rate } = useCurrency();
  const [stats, setStats] = useState<DashboardStats>({
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
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  // Latest Users State
  const [latestUsers, setLatestUsers] = useState<User[]>([]);
  const [latestUsersLoading, setLatestUsersLoading] = useState(true);

  // Pending Transactions State
  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);
  const [customToast, setCustomToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Fetch Latest Users
  const fetchLatestUsers = useCallback(async () => {
    try {
      setLatestUsersLoading(true);
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '5', // Get latest 5 users
        role: 'user', // Only fetch users with 'user' role
        sort: 'createdAt', // Sort by creation date
        order: 'desc', // Newest first
      });

      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();

      if (result.success) {
        // Client-side filter as backup to ensure no admins slip through
        const filteredUsers = (result.data || []).filter((user: User) => user.role === 'user');
        // Ensure we only show exactly 5 users maximum
        setLatestUsers(filteredUsers.slice(0, 5));
      } else {
        throw new Error(result.error || 'Failed to fetch latest users');
      }
    } catch (error) {
      console.error('Error fetching latest users:', error);
      setLatestUsers([]);
    } finally {
      setLatestUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setStatsLoading(false);
        setOrdersLoading(false);
        setTicketsLoading(false);
        setUsersLoading(false);
        setChartLoading(false);
      }
    };

    fetchStats();
    fetchLatestUsers();
  }, [fetchLatestUsers]);

  // Fetch Pending Transactions
  const fetchPendingTransactions = async () => {
    try {
      // Use optimized endpoint with admin flag and limit
      const response = await axiosInstance.get('/api/transactions', {
        params: {
          admin: 'true',
          status: 'pending',
          limit: 10,
          offset: 0
        },
        timeout: 10000 // 10 second timeout
      });

      // Handle the response structure
      if (response.data && response.data.transactions) {
        const transactions = response.data.transactions;
        setTotalTransactionCount(transactions.length);
        setPendingTransactions(transactions.slice(0, 3));
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        const pending = response.data.filter(
          (transaction: PendingTransaction) => transaction.status === 'pending'
        );
        setTotalTransactionCount(pending.length);
        setPendingTransactions(pending.slice(0, 3));
      } else {
        setPendingTransactions([]);
        setTotalTransactionCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      setPendingTransactions([]);
      setTotalTransactionCount(0);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTransactions();

    // Set up polling for new pending transactions
    const interval = setInterval(fetchPendingTransactions, 30000);

    return () => clearInterval(interval);
  }, []);

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
    return formatters[currency as keyof typeof formatters]?.(amount) || `${amount.toFixed(2)}`;
  }, []);

  const handleApprove = async (transactionId: string) => {
    try {
      const response = await axiosInstance.patch(
        `/api/transactions/${transactionId}`,
        {
          status: 'approved',
        }
      );

      if (response.status === 200) {
        // Remove from pending list
        setPendingTransactions((prev) =>
          prev.filter((t) => t.id !== transactionId)
        );
        setTotalTransactionCount((prev) => prev - 1);

        showToast('Transaction approved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      showToast('Failed to approve transaction', 'error');
    }
  };

  const handleCancel = async (transactionId: string) => {
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
        setPendingTransactions((prev) =>
          prev.filter((t) => t.id !== transactionId)
        );
        setTotalTransactionCount((prev) => prev - 1);

        showToast('Transaction cancelled successfully!', 'success');
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      showToast('Failed to cancel transaction', 'error');
    }
  };

  const handleRefreshTransactions = () => {
    setTransactionsLoading(true);
    fetchPendingTransactions();
    showToast('Transactions refreshed successfully!', 'success');
  };

  // Function to format currency based on selected currency
  const formatDashboardCurrency = (amount: number) => {
    // Admin stats are stored in BDT, so we need to convert if USD is selected
    if (currency === 'USD' && rate) {
      const amountInUSD = amount / rate;
      return `$${amountInUSD.toFixed(2)}`;
    } else {
      return `৳${amount.toFixed(2)}`;
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return {
      date: moment(dateString).format('DD/MM/YYYY'),
      time: moment(dateString).format('HH:mm'),
    };
  };

  if (false) {
    return (
      <div className="px-8 py-8 bg-[var(--page-bg)] dark:bg-[var(--page-bg)]">
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalUsers || 1}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      +12% from last month
                    </p>
                  </>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-600">
                      {formatDashboardCurrency(stats.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      +8% from last month
                    </p>
                  </>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalOrders || 0}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      +15% from last month
                    </p>
                  </>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatDashboardCurrency(stats.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      +22% from last month
                    </p>
                  </>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-cyan-600">
                      {formatDashboardCurrency(stats.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-cyan-600 font-medium mt-1">
                      Monthly Revenue
                    </p>
                  </>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-rose-600">
                      {formatDashboardCurrency(stats.todaysProfit || 0)}
                    </p>
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      Daily Earnings
                    </p>
                  </>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-teal-600">{stats.todaysOrders || 0}</p>
                    <p className="text-xs text-teal-600 font-medium mt-1">
                      Fresh Orders
                    </p>
                  </>
                )}
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
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-indigo-600">{stats.newUsersToday || 0}</p>
                    <p className="text-xs text-indigo-600 font-medium mt-1">
                      Fresh Registrations
                    </p>
                  </>
                )}
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
            <a
              href="/admin/funds"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <FaDollarSign className="h-4 w-4" />
              Manage Funds
            </a>
            <a
              href="/admin/users"
              className="btn btn-secondary w-full flex items-center justify-center gap-2"
            >
              <FaUsers className="h-4 w-4" />
              Manage Users
            </a>
            <a
              href="/admin/orders"
              className="btn btn-secondary w-full flex items-center justify-center gap-2"
            >
              <FaShoppingCart className="h-4 w-4" />
              Manage Orders
            </a>
            <a
              href="/admin/services"
              className="btn btn-secondary w-full flex items-center justify-center gap-2"
            >
              <FaCog className="h-4 w-4" />
              Manage Services
            </a>
          </div>
        </div>
      </div>

      {/* Pending Transactions - Section 3 */}
      <div className="mb-6">
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1">
                <div className="card-icon">
                  <FaClock />
                </div>
                <h3 className="card-title">
                  Pending Transactions
                  {totalTransactionCount > 0 && (
                    <span className="ml-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium">
                      {totalTransactionCount}
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={handleRefreshTransactions}
                className="btn btn-secondary flex items-center gap-2"
                disabled={transactionsLoading}
              >
                <FaSync className={transactionsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading transactions...
                  </div>
                </div>
              </div>
            ) : pendingTransactions.length === 0 ? (
              <div className="text-center py-12">
                <FaCheckCircle
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No pending transactions
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  All transactions are up to date
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
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
                          Username
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Date and Time
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Transaction ID
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Amount
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Phone Number
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Method
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Status
                        </th>
                        <th
                          className="text-center p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{transaction.id.slice(-8)}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.user?.name || transaction.username || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleDateString()}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className="font-mono text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.transaction_id || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.currency === 'USD' || transaction.currency === 'USDT'
                                ? `$${transaction.amount.toFixed(2)}`
                                : `৳${transaction.amount.toFixed(2)}`}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className="text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.sender_number || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.payment_method || transaction.method || 'uddoktapay'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full w-fit">
                              <FaClock className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-800">
                                Pending
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleApprove(transaction.id)}
                                className="btn btn-primary flex items-center gap-2"
                              >
                                <FaCheckCircle className="h-3 w-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleCancel(transaction.id)}
                                className="btn btn-secondary flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
                              >
                                <FaTimesCircle className="h-3 w-3" />
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {pendingTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="card card-padding border-l-4 border-yellow-500 mb-4"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{transaction.id.slice(-8)}
                            </div>
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.user?.name || transaction.username || 'N/A'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                            <FaClock className="h-3 w-3 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-800">
                              Pending
                            </span>
                          </div>
                        </div>

                        {/* Transaction ID */}
                        <div className="mb-4 pb-4 border-b">
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Transaction ID
                          </div>
                          <div
                            className="font-mono text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.transaction_id || 'N/A'}
                          </div>
                        </div>

                        {/* Financial Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Amount
                            </div>
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.currency === 'USD' || transaction.currency === 'USDT'
                                ? `$${transaction.amount.toFixed(2)}`
                                : `৳${transaction.amount.toFixed(2)}`}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Phone
                            </div>
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.sender_number || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Method */}
                        <div className="mb-4">
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Method
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.payment_method || transaction.method || 'uddoktapay'}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="mb-4">
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Date:{' '}
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Time:{' '}
                            {new Date(
                              transaction.createdAt
                            ).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(transaction.id)}
                            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                          >
                            <FaCheckCircle className="h-3 w-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleCancel(transaction.id)}
                            className="btn btn-secondary flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
                          >
                            <FaTimesCircle className="h-3 w-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* View More Button */}
          {totalTransactionCount > 0 && (
            <div className="flex justify-center p-4 border-t bg-gray-50">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() =>
                  (window.location.href = '/admin/funds?tab=pending-transactions')
                }
              >
                <FaEye className="h-4 w-4" />
                View More Pending Transactions
                {totalTransactionCount > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                    +{totalTransactionCount - 3}
                  </span>
                )}
                <FaArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Last 30 Days Orders - Section 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card card-padding">
          <div className="card-header mb-6">
            <div className="card-icon">
              <FaCalendar />
            </div>
            <h3 className="card-title">Last 30 Days Orders</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/orders"
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">
                    All
                  </div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {stats.totalOrders || 0}
                    </div>
                  )}
                </div>
                <FaShoppingCart className="text-blue-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/admin/orders"
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    Pending
                  </div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {stats.ordersByStatus?.pending || 0}
                    </div>
                  )}
                </div>
                <FaClock className="text-yellow-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/admin/orders"
              className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-cyan-600 dark:text-cyan-400 font-semibold">
                    Processing
                  </div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                      {stats.ordersByStatus?.processing || 0}
                    </div>
                  )}
                </div>
                <FaRedo className="text-cyan-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/admin/orders"
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-600 dark:text-green-400 font-semibold">
                    Completed
                  </div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {stats.ordersByStatus?.completed || 0}
                    </div>
                  )}
                </div>
                <FaCheckCircle className="text-green-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/admin/orders"
              className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    Partial
                  </div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                      {stats.ordersByStatus?.partial || 0}
                    </div>
                  )}
                </div>
                <FaBullseye className="text-indigo-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/admin/orders"
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-red-600 dark:text-red-400 font-semibold">
                    Cancelled
                  </div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {stats.ordersByStatus?.cancelled || 0}
                    </div>
                  )}
                </div>
                <FaTimes className="text-red-500 w-5 h-5" />
              </div>
            </a>
          </div>
        </div>

        {/* Support Tickets - Section 6 */}
        <div className="card card-padding">
          <div className="card-header mb-6">
            <div className="card-icon">
              <FaCommentDots />
            </div>
            <h3 className="card-title">Support Tickets</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/manage-tickets"
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">
                    Open
                  </div>
                  {ticketsLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      0
                    </div>
                  )}
                </div>
                <FaClock className="text-blue-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/manage-tickets"
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-600 dark:text-green-400 font-semibold">
                    Answered
                  </div>
                  {ticketsLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      0
                    </div>
                  )}
                </div>
                <FaCheckCircle className="text-green-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/manage-tickets"
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    Customer Reply
                  </div>
                  {ticketsLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      0
                    </div>
                  )}
                </div>
                <FaCommentDots className="text-yellow-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/manage-tickets"
              className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-orange-600 dark:text-orange-400 font-semibold">
                    On Hold
                  </div>
                  {ticketsLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      0
                    </div>
                  )}
                </div>
                <FaClock className="text-orange-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/manage-tickets"
              className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-purple-600 dark:text-purple-400 font-semibold">
                    In Progress
                  </div>
                  {ticketsLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      0
                    </div>
                  )}
                </div>
                <FaRedo className="text-purple-500 w-5 h-5" />
              </div>
            </a>

            <a
              href="/manage-tickets"
              className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 dark:text-gray-400 font-semibold">
                    Closed
                  </div>
                  {ticketsLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      0
                    </div>
                  )}
                </div>
                <FaTimes className="text-gray-500 w-5 h-5" />
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Latest Users - Section 7 */}
      <div className="mb-6">
        <div className="card card-padding">
          <div className="card-header mb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="card-icon">
                  <FaUsers />
                </div>
                <h3 className="card-title">Latest Users</h3>
              </div>
              <button 
                onClick={() => window.open('/admin/users', '_blank')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <FaUserPlus className="h-4 w-4" />
                View All Users
              </button>
            </div>
          </div>

          <div>
            {latestUsersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">Loading users...</div>
                </div>
              </div>
            ) : latestUsers.length === 0 ? (
              <div className="text-center py-12">
                <FaUsers
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No users found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {latestUsers.length === 0 ? 'No users exist yet.' : 'No users match your criteria.'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>ID</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Username</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Email</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Balance</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestUsers.map((user) => (
                        <tr key={user.id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{user.id?.slice(-8) || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                              {user.username || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {user.email || 'null'}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {user.emailVerified ? (
                                <>
                                  <FaCheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-green-600">Verified</span>
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle className="h-3 w-3 text-red-500" />
                                  <span className="text-xs text-red-600">Unverified</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-left">
                              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {formatCurrency(user.balance || 0, user.currency || 'USD')}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'null'}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                {user.createdAt ? new Date(user.createdAt).toLocaleTimeString() : 'null'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="space-y-4">
                    {latestUsers.map((user) => (
                      <div key={user.id} className="card card-padding border-l-4 border-blue-500 mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{user.id?.slice(-8) || 'null'}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Username</div>
                            <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{user.username || 'null'}</div>
                          </div>

                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Email</div>
                            <div className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{user.email || 'null'}</div>
                            <div className="flex items-center gap-1">
                              {user.emailVerified ? (
                                <>
                                  <FaCheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-green-600">Verified</span>
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle className="h-3 w-3 text-red-500" />
                                  <span className="text-xs text-red-600">Unverified</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Balance</div>
                            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {formatCurrency(user.balance || 0, user.currency || 'USD')}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'null'}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              Time: {user.createdAt ? new Date(user.createdAt).toLocaleTimeString() : 'null'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}