'use client';

import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import axiosInstance from '@/lib/axiosInstance';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  FaArrowRight,
  FaAward,
  FaBullseye,
  FaCalendar,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaCommentDots,
  FaDollarSign,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaPhone,
  FaRedo,
  FaShieldAlt,
  FaShoppingCart,
  FaSync,
  FaTimes,
  FaTimesCircle,
  FaUser,
  FaUserPlus,
  FaUsers,
} from 'react-icons/fa';

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

interface PendingTransaction {
  id: string;
  userId: string;
  username?: string;
  amount: number;
  transactionId?: string;
  senderNumber?: string;
  status: string;
  method?: string;
  createdAt: string;
  updatedAt?: string;
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
  };
  dailyOrders: {
    date: string;
    orders: number;
  }[];
};

export default function AdminDashboard() {
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
    },
    dailyOrders: [],
  });

  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch Pending Transactions
  const fetchPendingTransactions = async () => {
    try {
      const response = await axiosInstance.get('/api/transactions');

      // The API returns an array directly
      if (Array.isArray(response.data)) {
        // Filter only pending transactions
        const pending = response.data.filter(
          (transaction: PendingTransaction) => transaction.status === 'pending'
        );

        // Store total count before slicing
        setTotalTransactionCount(pending.length);

        // Show only the latest 3 transactions
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
    fetchPendingTransactions();
    showToast('Transactions refreshed successfully!', 'success');
  };

  // Function to format currency based on selected currency
  const formatCurrency = (amount: number) => {
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

  if (loading) {
    return (
      <div className="px-8 py-8 bg-[#f1f2f6] dark:bg-[#232333]">Loading...</div>
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
                <p className="text-xs text-green-600 font-medium mt-1">
                  +12% from last month
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
                  {formatCurrency(stats.totalRevenue || 0)}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  +8% from last month
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
                <p className="text-xs text-green-600 font-medium mt-1">
                  +15% from last month
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
                  {formatCurrency(stats.totalRevenue || 0)}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  +22% from last month
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
                  {formatCurrency(stats.totalRevenue || 0)}
                </p>
                <p className="text-xs text-cyan-600 font-medium mt-1">
                  Monthly Revenue
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
                  {formatCurrency(stats.totalRevenue || 0)}
                </p>
                <p className="text-xs text-rose-600 font-medium mt-1">
                  Daily Earnings
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
                <p className="text-2xl font-bold text-teal-600">0</p>
                <p className="text-xs text-teal-600 font-medium mt-1">
                  Fresh Orders
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
                <p className="text-2xl font-bold text-indigo-600">0</p>
                <p className="text-xs text-indigo-600 font-medium mt-1">
                  Fresh Registrations
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
                <div className="flex items-center gap-2">
                  <FaSync className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-lg font-medium">
                    Loading transactions...
                  </span>
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
                              {transaction.username || 'N/A'}
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
                              {transaction.transactionId || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ${transaction.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className="text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.senderNumber || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.method || 'BDT'}
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
                              {transaction.username || 'N/A'}
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
                            {transaction.transactionId || 'N/A'}
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
                              ${transaction.amount.toFixed(2)}
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
                              {transaction.senderNumber || 'N/A'}
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
                            {transaction.method || 'BDT'}
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
                  (window.location.href = '/funds?tab=all-transactions')
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

      {/* Recent Orders & Statistics Charts - Section 3 */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="card card-padding">
              <div className="card-header mb-4">
                <div className="card-icon">
                  <FaChartBar />
                </div>
                <h3 className="card-title">Recent Orders</h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                  <FaCheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
                <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  <FaRedo className="h-3 w-3 mr-1" />
                  Processing
                </Badge>
                <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                  <FaClock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
                <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                  <FaChartLine className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
                <Badge className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                  <FaBullseye className="h-3 w-3 mr-1" />
                  Partial
                </Badge>
                <Badge className="bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800">
                  <FaTimes className="h-3 w-3 mr-1" />
                  Canceled
                </Badge>
                <Badge className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
                  <FaRedo className="h-3 w-3 mr-1" />
                  Refunded
                </Badge>
              </div>

              <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  <div
                    className="text-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <FaChartBar
                      className="h-16 w-16 mx-auto mb-4"
                      style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                    />
                    <p className="text-lg font-medium mb-2">
                      Interactive Chart will be displayed here
                    </p>
                    <p className="text-sm">Real-time order analytics</p>
                  </div>
                ) : (
                  <div
                    className="text-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <FaChartPie
                      className="h-16 w-16 mx-auto mb-4"
                      style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                    />
                    <p className="text-lg font-medium mb-2">
                      No recent orders to display
                    </p>
                    <p className="text-sm">
                      Charts will appear when data is available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card card-padding">
              <div className="card-header mb-4">
                <div className="card-icon">
                  <FaChartPie />
                </div>
                <h3 className="card-title">Statistics</h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                  <FaCheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
                <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  <FaRedo className="h-3 w-3 mr-1" />
                  Processing
                </Badge>
                <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                  <FaClock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </div>

              <div className="h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div
                  className="text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <FaChartPie
                    className="h-12 w-12 mx-auto mb-3"
                    style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                  />
                  <p className="text-sm font-medium">Statistics chart</p>
                  <p className="text-xs">Real-time data visualization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last 30 Days Orders - Section 4 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="card-icon">
            <FaCalendar />
          </div>
          <h2 className="card-title text-2xl">Last 30 Days Orders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">
                  Total Orders
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  0
                </div>
              </div>
              <FaShoppingCart className="text-blue-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-600 dark:text-green-400 font-semibold">
                  Completed
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  0
                </div>
              </div>
              <FaCheckCircle className="text-green-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  Processing
                </div>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  0
                </div>
              </div>
              <FaRedo className="text-yellow-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-cyan-600 dark:text-cyan-400 font-semibold">
                  Pending
                </div>
                <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                  0
                </div>
              </div>
              <FaClock className="text-cyan-500 w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-600 dark:text-purple-400 font-semibold">
                  In Progress
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  0
                </div>
              </div>
              <FaChartLine className="text-purple-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Partial
                </div>
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  0
                </div>
              </div>
              <FaBullseye className="text-indigo-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-red-600 dark:text-red-400 font-semibold">
                  Canceled
                </div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  0
                </div>
              </div>
              <FaTimes className="text-red-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-pink-600 dark:text-pink-400 font-semibold">
                  Refunded
                </div>
                <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                  0
                </div>
              </div>
              <FaRedo className="text-pink-500 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Support Tickets - Section 5 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="card-icon">
            <FaCommentDots />
          </div>
          <h2 className="card-title text-2xl">Support Tickets</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">
                  Processing
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  0
                </div>
              </div>
              <FaRedo className="text-blue-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  Pending
                </div>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  0
                </div>
              </div>
              <FaClock className="text-yellow-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-600 dark:text-green-400 font-semibold">
                  Replied
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  0
                </div>
              </div>
              <FaCommentDots className="text-green-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-teal-600 dark:text-teal-400 font-semibold">
                  Answered
                </div>
                <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                  0
                </div>
              </div>
              <FaCheckCircle className="text-teal-500 w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-red-600 dark:text-red-400 font-semibold">
                  Canceled
                </div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  0
                </div>
              </div>
              <FaTimes className="text-red-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-pink-600 dark:text-pink-400 font-semibold">
                  Refunded
                </div>
                <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                  0
                </div>
              </div>
              <FaRedo className="text-pink-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 dark:text-gray-400 font-semibold">
                  Closed
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  0
                </div>
              </div>
              <FaCheckCircle className="text-gray-500 w-5 h-5" />
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-600 dark:text-orange-400 font-semibold">
                  Pending
                </div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  0
                </div>
              </div>
              <FaClock className="text-orange-500 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Latest Users - Section 5 */}
      <div className="mb-6">
        <div className="card card-padding">
          <div className="card-header mb-4">
            <div className="card-icon">
              <FaUsers />
            </div>
            <h3 className="card-title">Latest Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <FaUser className="h-4 w-4 text-green-600" />
                      Username
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="h-4 w-4 text-blue-600" />
                      Email
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <FaPhone className="h-4 w-4 text-purple-600" />
                      Phone
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="h-4 w-4 text-yellow-600" />
                      Balance
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <FaShieldAlt className="h-4 w-4 text-orange-600" />
                      Status
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <FaCog className="h-4 w-4 text-gray-600" />
                      Action
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        M
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">
                          munna
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Premium User
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">alsoadmunna@gmail.com</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FaPhone className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">1770001527</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-bold text-yellow-600">
                        0 USD
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Active
                      </div>
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm flex items-center gap-1">
                        <FaEye className="h-3 w-3" />
                        View
                      </button>
                      <button className="btn btn-secondary btn-sm flex items-center gap-1">
                        <FaEdit className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-200 dark:border-gray-700 mt-4 rounded-b-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FaUsers className="h-4 w-4 text-green-600" />
                Showing 1 of 1 users
              </p>
              <button className="btn btn-primary flex items-center gap-2">
                <FaUserPlus className="h-4 w-4" />
                View All Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
