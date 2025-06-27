'use client';

import useCurrency from '@/hooks/useCurrency';
import { APP_NAME } from '@/lib/constants';
import { useGetUserOrdersQuery } from '@/lib/services/userOrderApi';
import { formatNumber, formatID, formatPrice } from '@/lib/utils';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import {
  FaBan,
  FaCheck,
  FaCheckCircle,
  FaCircleNotch,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaList,
  FaRss,
  FaSearch,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Cancel Modal Component
const CancelModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  reason,
  setReason,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderId: number | null;
  reason: string;
  setReason: (reason: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Cancel Order #{formatID(orderId || 0)}
        </h3>
        
        <div className="mb-4">
          <label className="form-label mb-2">
            Cancellation Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for cancelling this order..."
            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none"
            rows={4}
            required
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim()}
            className="btn btn-primary"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

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
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
      type === 'success'
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
        : type === 'error'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        : type === 'info'
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default function OrdersList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    orderId: number | null;
    reason: string;
  }>({
    isOpen: false,
    orderId: null,
    reason: ''
  });
  const { currency } = useCurrency();

  // Dummy data with refill enabled examples
  const dummyData = {
    data: [
      {
        id: 12345,
        createdAt: "2025-06-25T10:30:00Z",
        link: "https://instagram.com/p/abc123def",
        usdPrice: 25.50,
        bdtPrice: 2805.50,
        startCount: 150,
        qty: 1000,
        service: {
          name: "Instagram Likes - Real & Active",
          refillEnabled: true  // ✅ Refill button will show
        },
        category: {
          category_name: "Instagram"
        },
        remains: 200,
        status: "completed"
      },
      {
        id: 67890,
        createdAt: "2025-06-24T14:15:00Z", 
        link: "https://youtube.com/watch?v=xyz789abc",
        usdPrice: 45.00,
        bdtPrice: 4950.00,
        startCount: 500,
        qty: 2500,
        service: {
          name: "YouTube Views - High Retention", 
          refillEnabled: true  // ✅ Refill button will show
        },
        category: {
          category_name: "YouTube"
        },
        remains: 1200,
        status: "partial"
      },
      {
        id: 11111,
        createdAt: "2025-06-23T09:45:00Z",
        link: "https://tiktok.com/@user/video/123",
        usdPrice: 15.00,
        bdtPrice: 1650.00,
        startCount: 100,
        qty: 500,
        service: {
          name: "TikTok Followers - Basic",
          refillEnabled: false  // ❌ No refill button
        },
        category: {
          category_name: "TikTok"
        },
        remains: 0,
        status: "completed"
      },
      {
        id: 22222,
        createdAt: "2025-06-22T16:20:00Z",
        link: "https://facebook.com/post/456789",
        usdPrice: 35.75,
        bdtPrice: 3932.25,
        startCount: 80,
        qty: 1500,
        service: {
          name: "Facebook Post Likes - Premium",
          refillEnabled: true  // ✅ Refill button will show
        },
        category: {
          category_name: "Facebook"
        },
        remains: 750,
        status: "pending"  // Will show both Refill and Cancel buttons
      },
      {
        id: 33333,
        createdAt: "2025-06-21T11:10:00Z",
        link: "https://twitter.com/status/987654321",
        usdPrice: 12.25,
        bdtPrice: 1347.75,
        startCount: 25,
        qty: 300,
        service: {
          name: "Twitter Retweets - Fast",
          refillEnabled: false  // ❌ No refill button
        },
        category: {
          category_name: "Twitter"
        },
        remains: 0,
        status: "pending"  // Will show only Cancel button
      },
      {
        id: 44444,
        createdAt: "2025-06-20T08:30:00Z",
        link: "https://instagram.com/reel/def456ghi",
        usdPrice: 18.90,
        bdtPrice: 2079.00,
        startCount: 320,
        qty: 800,
        service: {
          name: "Instagram Reel Views - Real",
          refillEnabled: true  // ✅ Refill button will show
        },
        category: {
          category_name: "Instagram"
        },
        remains: 150,
        status: "in_progress"
      }
    ],
    pagination: {
      total: 6,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  };

  // Comment out real API call and use dummy data
  // const { data, isLoading, error } = useGetUserOrdersQuery({
  //   page,
  //   limit,
  //   status,
  //   search,
  // });

  // For demo purposes, simulate loading and use dummy data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(dummyData);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `My Orders — ${APP_NAME}`;
  }, []);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const orders = useMemo(() => {
    let filteredOrders = data?.data || [];
    
    // Filter by status
    if (status !== 'all') {
      filteredOrders = filteredOrders.filter((order: any) => order.status === status);
    }
    
    // Filter by search
    if (search) {
      filteredOrders = filteredOrders.filter((order: any) => 
        order.id.toString().includes(search) ||
        order.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.category?.category_name?.toLowerCase().includes(search.toLowerCase()) ||
        order.link?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return filteredOrders;
  }, [data, status, search]);

  const pagination = useMemo(() => {
    return {
      total: orders.length,
      page: 1,
      limit: 10,
      totalPages: Math.ceil(orders.length / 10)
    };
  }, [orders]);

  // Handle refill button click
  const handleRefill = (orderId: number) => {
    showToast(`Refill request submitted for order #${formatID(orderId)}`, 'success');
  };

  // Handle cancel button click
  const handleCancel = (orderId: number) => {
    setCancelModal({
      isOpen: true,
      orderId,
      reason: ''
    });
  };

  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    if (cancelModal.orderId && cancelModal.reason.trim()) {
      showToast(`Order #${formatID(cancelModal.orderId)} has been cancelled successfully`, 'info');
      setCancelModal({
        isOpen: false,
        orderId: null,
        reason: ''
      });
    }
  };

  // Handle cancel modal close
  const handleCancelClose = () => {
    setCancelModal({
      isOpen: false,
      orderId: null,
      reason: ''
    });
  };

  // Calculate counts for each status filter
  const getStatusCount = (statusKey: string) => {
    const allOrders = data?.data || [];
    if (statusKey === 'all') return allOrders.length;
    return allOrders.filter((order: any) => order.status === statusKey).length;
  };

  // Status filter buttons configuration
  const statusFilters = [
    {
      key: 'all',
      label: 'All',
      icon: FaList,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'pending',
      label: 'Pending',
      icon: FaClock,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'in_progress',
      label: 'In progress',
      icon: FaSpinner,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: FaCheck,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'partial',
      label: 'Partial',
      icon: FaCircleNotch,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'processing',
      label: 'Processing',
      icon: FaRss,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'cancelled',
      label: 'Canceled',
      icon: FaBan,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
      case 'in_progress':
        return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800';
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

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card card-padding">
            <div className="text-red-500 text-center flex flex-col items-center py-8">
              <FaExclamationTriangle className="text-4xl mb-4" />
              <div className="text-lg font-medium">Error loading orders!</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card card-padding">
            <div className="text-center py-8 flex flex-col items-center">
              <GradientSpinner size="w-14 h-14" className="mb-4" />
              <div className="text-lg font-medium">Loading orders...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Cancel Modal */}
      <CancelModal
        isOpen={cancelModal.isOpen}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        orderId={cancelModal.orderId}
        reason={cancelModal.reason}
        setReason={(reason) => setCancelModal(prev => ({ ...prev, reason }))}
      />

      {/* Toast Container */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="page-content">
        {/* Orders Content Card - Everything in one box */}
        <div className="card card-padding">
          {/* Search Bar - Default Style without Button */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="search"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Status Filter Buttons with Counters - Updated with Services Page Gradient */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {statusFilters.map((filter) => {
                const IconComponent = filter.icon;
                const isActive = status === filter.key;
                const count = getStatusCount(filter.key);

                return (
                  <button
                    key={filter.key}
                    onClick={() => {
                      setStatus(filter.key);
                      setPage(1);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-lg'
                        : filter.color
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 first:rounded-tl-lg">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Link
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Charge
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Start count
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Remains
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 last:rounded-tr-lg">
                    Quick Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order: any, index: number) => {
                    const isLastRow = index === orders.length - 1;
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          isLastRow ? 'last:border-b-0' : ''
                        }`}
                      >
                        <td
                          className={`py-3 px-4 ${
                            isLastRow ? 'first:rounded-bl-lg' : ''
                          }`}
                        >
                          <span className="text-sm font-mono text-gray-700">
                            #{formatID(order.id)}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {moment(order.createdAt).format('DD/MM/YYYY')}
                          </span>
                          <div className="text-xs text-gray-500">
                            {moment(order.createdAt).format('HH:mm')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-[120px]">
                            <a
                              href={order.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center hover:underline"
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
                          <span className="text-sm font-medium text-gray-900">
                            {currency === 'USD'
                              ? `$${formatPrice(order.usdPrice || 0)}`
                              : `৳${formatPrice(order.bdtPrice || 0)}`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {formatNumber(order.startCount || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {formatNumber(order.qty || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-[200px]">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {order.service?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.category?.category_name || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {formatNumber(order.remains || order.qty || 0)}
                          </span>
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
                        <td
                          className={`py-3 px-4 ${
                            isLastRow ? 'last:rounded-br-lg' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {order.service?.refillEnabled && (
                              <button
                                onClick={() => handleRefill(order.id)}
                                className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                                title="Refill Order"
                              >
                                Refill
                              </button>
                            )}
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleCancel(order.id)}
                                className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                                title="Cancel Order"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaClipboardList className="text-4xl text-gray-400 mb-4" />
                        <div className="text-lg font-medium">
                          No orders found
                        </div>
                        <div className="text-sm">
                          Try adjusting your search or filter criteria
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-medium">{formatNumber((page - 1) * limit + 1)}</span> to{' '}
                <span className="font-medium">
                  {formatNumber(Math.min(page * limit, pagination.total))}
                </span>{' '}
                of <span className="font-medium">{formatNumber(pagination.total)}</span>{' '}
                orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, page + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}