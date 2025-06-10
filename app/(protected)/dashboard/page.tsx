'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useGetUserStatsQuery } from '@/lib/services/dashboardApi';
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaDollarSign,
  FaExternalLinkAlt,
  FaEye,
  FaHistory,
  FaPlus,
  FaShoppingBag,
  FaTicketAlt,
  FaChartLine,
  FaUser,
  FaWallet,
  FaTimes,
  FaTimesCircle,
} from 'react-icons/fa';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

const DashboardPage = () => {
  const user = useCurrentUser();
  const { currency, rate: currencyRate } = useCurrency();
  const router = useRouter();
  const { data: userStatsResponse, error, isLoading } = useGetUserStatsQuery();
  const userStats = userStatsResponse?.data;

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Get recent orders from user stats
  const userOrders = userStats?.recentOrders || [];

  // User data from API or fallback to 0
  const balance = userStats?.balance || 0;
  const totalSpend = userStats?.totalSpent || 0;
  const totalOrders = userStats?.totalOrders || 0;
  const pendingOrders = userStats?.ordersByStatus?.pending || 0;
  const completedOrders = userStats?.ordersByStatus?.completed || 0;
  const processingOrders = userStats?.ordersByStatus?.processing || 0;
  const cancelledOrders = userStats?.ordersByStatus?.cancelled || 0;

  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount =
      currency === 'BDT' ? amount : amount / (currencyRate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };

  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId) {
      router.push(`/new-order?categoryId=${categoryId}`);
    } else {
      router.push('/new-order');
    }
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
      case 'partial':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'processing':
        return <FaClock className="w-4 h-4" />;
      case 'pending':
        return <FaExclamationTriangle className="w-4 h-4" />;
      case 'cancelled':
        return <FaTimesCircle className="w-4 h-4" />;
      default:
        return <FaClock className="w-4 h-4" />;
    }
  };

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatDate = (dateString: string) => {
    return {
      date: moment(dateString).format('DD/MM/YYYY'),
      time: moment(dateString).format('HH:mm'),
    };
  };

  return (
    <div className="px-8 py-8 bg-[#f1f2f6] dark:bg-[#232333]">
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
        {/* User Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* User ID Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaUser />
              </div>
              <div>
                <h3 className="card-title">User ID</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  #{user?.id || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Username Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaUser />
              </div>
              <div>
                <h3 className="card-title">Username</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {user?.username || user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
            </div>
          </div>

          {/* Name Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaUser />
              </div>
              <div>
                <h3 className="card-title">Full Name</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {user?.name || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Balance Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaWallet />
              </div>
              <div className="flex-1">
                <h3 className="card-title">Balance</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => router.push('/add-funds')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaShoppingBag />
              </div>
              <div>
                <h3 className="card-title">Total Orders</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {totalOrders}
                </p>
              </div>
            </div>
          </div>

          {/* Total Spend Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaDollarSign />
              </div>
              <div>
                <h3 className="card-title">Total Spend</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalSpend)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Statistics Overview */}
          <div className="xl:col-span-2 space-y-6">
            {/* Statistics Overview */}
            <div className="card card-padding">
              <div className="card-header mb-4">
                <div className="card-icon">
                  <FaChartLine />
                </div>
                <h3 className="card-title">Order Statistics Overview</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Completed Orders */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-green-600 dark:text-green-400 font-semibold">
                        Completed
                      </div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {completedOrders}
                      </div>
                    </div>
                    <FaCheckCircle className="text-green-500 w-5 h-5" />
                  </div>
                </div>

                {/* Processing Orders */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-blue-600 dark:text-blue-400 font-semibold">
                        Processing
                      </div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {processingOrders}
                      </div>
                    </div>
                    <FaClock className="text-blue-500 w-5 h-5" />
                  </div>
                </div>

                {/* Pending Orders */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                        Pending
                      </div>
                      <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                        {pendingOrders}
                      </div>
                    </div>
                    <FaExclamationTriangle className="text-yellow-500 w-5 h-5" />
                  </div>
                </div>

                {/* Cancelled Orders */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-red-600 dark:text-red-400 font-semibold">
                        Cancelled
                      </div>
                      <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                        {cancelledOrders}
                      </div>
                    </div>
                    <FaTimesCircle className="text-red-500 w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order History Section */}
            <div className="card card-padding">
              <div className="card-header mb-4">
                <div className="card-icon">
                  <FaHistory />
                </div>
                <h3 className="card-title">Recent Orders</h3>
                <div className="ml-auto">
                  <button
                    onClick={() => router.push('/my-orders')}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <FaEye className="w-4 h-4" />
                    View All Orders
                  </button>
                </div>
              </div>

              {userOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Link
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Charge
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Quantity
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Service
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order: any) => {
                        const dateTime = formatDate(order.createdAt);
                        return (
                          <tr
                            key={order.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="py-3 px-4">
                              <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                #{order.id.substring(0, 8)}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {dateTime.date}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {dateTime.time}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="max-w-[120px]">
                                <a
                                  href={order.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs flex items-center hover:underline"
                                  title={order.link}
                                >
                                  <span className="truncate mr-1">
                                    {order.link?.replace(/^https?:\/\//, '') ||
                                      'N/A'}
                                  </span>
                                  <FaExternalLinkAlt className="w-3 h-3 flex-shrink-0" />
                                </a>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {currency === 'USD'
                                  ? `$${order.usdPrice?.toFixed(2) || '0.00'}`
                                  : `৳${order.bdtPrice?.toFixed(2) || '0.00'}`}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {order.qty?.toLocaleString() || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-[200px]">
                              <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                {order.service?.name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {order.category?.category_name || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className="text-center py-8"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <FaClipboardList
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                  />
                  <div className="text-lg font-medium mb-2">
                    No orders found
                  </div>
                  <div className="text-sm mb-4">
                    You haven't placed any orders yet.
                  </div>
                  <button
                    onClick={() => router.push('/new-order')}
                    className="btn btn-primary flex items-center gap-2 mx-auto"
                  >
                    <FaPlus className="w-4 h-4" />
                    Create Your First Order
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Support Ticket */}
          <div className="space-y-6">
            {/* Support Ticket Section */}
            <div className="card card-padding">
              <div className="card-header mb-4">
                <div className="card-icon">
                  <FaTicketAlt />
                </div>
                <h3 className="card-title">Support Ticket</h3>
                <div className="ml-auto">
                  <button
                    onClick={() => router.push('/support-ticket')}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <FaEye className="w-4 h-4" />
                    View All
                  </button>
                </div>
              </div>

              <div
                className="text-center py-8"
                style={{ color: 'var(--text-muted)' }}
              >
                <FaTicketAlt
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                />
                <div className="text-lg font-medium mb-2">
                  No support Ticket found
                </div>
                <div className="text-sm">
                  You haven't created any support Ticket yet.
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card card-padding">
              <div className="card-header mb-4">
                <div className="card-icon">
                  <FaPlus />
                </div>
                <h3 className="card-title">Quick Actions</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/new-order')}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  New Order
                </button>

                <button
                  onClick={() => router.push('/add-funds')}
                  className="btn btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <FaWallet className="w-4 h-4" />
                  Add Funds
                </button>

                <button
                  onClick={() => router.push('/my-orders')}
                  className="btn btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <FaHistory className="w-4 h-4" />
                  Order History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;