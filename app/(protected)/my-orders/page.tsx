'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { useGetUserOrdersQuery } from '@/lib/services/userOrderApi';
import { formatID, formatNumber, formatPrice, formatCount } from '@/lib/utils';
import moment from 'moment';
import { useRouter, useSearchParams } from 'next/navigation';
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
    FaTimes
} from 'react-icons/fa';

interface CancelRequest {
  id: number;
  status: string;
  createdAt: string;
}

interface OrderWithCancelRequests {
  id: number;
  status: string;
  cancelRequests?: CancelRequest[];
  service?: {
    cancel?: boolean;
    refill?: boolean;
    name?: string;
  };
  [key: string]: any;
}

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

const RefillModal = ({
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Request Refill
          </h3>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            You are requesting a refill for Order #{orderId ? formatID(orderId) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Refill requests are reviewed within 24 hours.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the issue (e.g., followers dropped, likes decreased, etc.)"
            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OrdersList() {
  const { appName } = useAppNameWithFallback();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [isSearchLoading, setIsSearchLoading] = useState(false);
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

  const [refillModal, setRefillModal] = useState<{
    isOpen: boolean;
    orderId: number | null;
    reason: string;
  }>({
    isOpen: false,
    orderId: null,
    reason: ''
  });

  const [localPendingCancelRequests, setLocalPendingCancelRequests] = useState<Set<number>>(new Set());

  const { currency, availableCurrencies, currentCurrencyData } = useCurrency();

  const { data, isLoading, error } = useGetUserOrdersQuery({
    page,
    limit,
    status,
    search,
  });

  useEffect(() => {
    setPageTitle('My Orders', appName);
  }, [appName]);

  useEffect(() => {
    const urlStatus = searchParams?.get('status');
    const newStatus = urlStatus ? urlStatus.replace('-', '_') : 'all';
    setStatus(newStatus);
  }, []);

  useEffect(() => {
    const urlStatus = searchParams?.get('status');
    const newStatus = urlStatus ? urlStatus.replace('-', '_') : 'all';
    if (newStatus !== status) {
      setStatus(newStatus);
    }
  }, [searchParams, status]);

  useEffect(() => {
    if (data?.data) {
      const ordersWithDeclinedRequests = data.data.filter((order: any) => 
        order.cancelRequests && 
        order.cancelRequests.length > 0 && 
        order.cancelRequests[0].status === 'declined'
      );

      if (ordersWithDeclinedRequests.length > 0) {
        setLocalPendingCancelRequests(prev => {
          const newSet = new Set(prev);
          ordersWithDeclinedRequests.forEach((order: any) => {
            newSet.delete(order.id);
          });
          return newSet;
        });
      }
    }
  }, [data]);

  useEffect(() => {
    if (search.trim()) {
      setIsSearchLoading(true);
      const timer = setTimeout(() => {
        setIsSearchLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsSearchLoading(false);
    }
  }, [search]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = (statusKey: string) => {
    setStatus(statusKey);
    setPage(1);

    const currentParams = searchParams?.toString() || '';
    const params = new URLSearchParams(currentParams);

    if (statusKey === 'all') {
      params.delete('status');
    } else {

      const urlStatus = statusKey.replace('_', '-');
      params.set('status', urlStatus);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '/my-orders';
    router.push(newUrl);
  };

  const orders = useMemo(() => {
    let filteredOrders = data?.data || [];

    if (status !== 'all') {
      filteredOrders = filteredOrders.filter((order: any) => {
        const displayStatus = order.providerStatus === 'forward_failed' && order.status === 'failed' ? 'pending' : order.status;
        return displayStatus === status;
      });
    }

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

  const handleRefill = (orderId: number) => {
    showToast(`Refill request submitted for order #${formatID(orderId)}`, 'success');
  };

  const handleCancel = (orderId: number) => {
    setCancelModal({
      isOpen: true,
      orderId,
      reason: ''
    });
  };

  const handleCancelConfirm = async () => {
    if (!cancelModal.orderId || !cancelModal.reason.trim()) {
      setToastMessage({
        message: 'Please provide a reason for cancellation',
        type: 'error'
      });
      return;
    }

    try {
      const response = await fetch(`/api/user/orders/${cancelModal.orderId}/cancel-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: cancelModal.reason.trim()
        })
      });

      const result = await response.json();

      if (result.success) {

        setLocalPendingCancelRequests(prev => new Set(prev).add(cancelModal.orderId!));

        setToastMessage({
          message: result.data.message || 'Cancel request submitted successfully',
          type: 'success'
        });
        handleCancelClose();
      } else {
        setToastMessage({
          message: result.error || 'Failed to submit cancel request',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting cancel request:', error);
      setToastMessage({
        message: 'Failed to submit cancel request',
        type: 'error'
      });
    }
  };

  const handleCancelClose = () => {
    setCancelModal({
      isOpen: false,
      orderId: null,
      reason: ''
    });
  };

  const handleRefillClose = () => {
    setRefillModal({
      isOpen: false,
      orderId: null,
      reason: ''
    });
  };

  const handleRefillConfirm = async () => {
    if (!refillModal.orderId) {
      setToastMessage({
        message: 'Invalid order ID',
        type: 'error'
      });
      return;
    }

    try {
      const response = await fetch('/api/user/refill-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: refillModal.orderId,
          reason: refillModal.reason.trim() || 'Customer requested refill due to drop in count'
        })
      });

      const result = await response.json();

      if (result.success) {
        setToastMessage({
          message: result.data.message || 'Refill request submitted successfully',
          type: 'success'
        });
        handleRefillClose();
      } else {
        setToastMessage({
          message: result.error || 'Failed to submit refill request',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting refill request:', error);
      setToastMessage({
        message: 'Failed to submit refill request',
        type: 'error'
      });
    }
  };

  const getStatusCount = (statusKey: string) => {
    const allOrders = data?.data || [];
    if (statusKey === 'all') return allOrders.length;
    return allOrders.filter((order: any) => order.status === statusKey).length;
  };

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
      label: 'Cancelled',
      icon: FaBan,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  const formatStatusDisplay = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'failed':
        return 'Failed';
      case 'partial':
        return 'Partial';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

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


  return (
    <div className="page-container">
      <CancelModal
        isOpen={cancelModal.isOpen}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        orderId={cancelModal.orderId}
        reason={cancelModal.reason}
        setReason={(reason) => setCancelModal(prev => ({ ...prev, reason }))}
      />
      <RefillModal
        isOpen={refillModal.isOpen}
        onClose={handleRefillClose}
        onConfirm={handleRefillConfirm}
        orderId={refillModal.orderId}
        reason={refillModal.reason}
        setReason={(reason) => setRefillModal(prev => ({ ...prev, reason }))}
      />
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="page-content">
        <div className="card card-padding">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="search"
                placeholder="Search by Order ID, Service name, or Category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="form-field w-full pl-10 pr-10 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                autoComplete="off"
              />
              {isSearchLoading && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
                  <div className="h-4 w-4 gradient-shimmer rounded-full" />
                </div>
              )}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {isLoading ? (
                <>
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <div key={idx} className="h-9 w-24 gradient-shimmer rounded-full" />
                  ))}
                </>
              ) : (
                statusFilters.map((filter) => {
                  const IconComponent = filter.icon;
                  const isActive = status === filter.key;
                  const count = getStatusCount(filter.key);

                  return (
                    <button
                      key={filter.key}
                      onClick={() => handleStatusChange(filter.key)}
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
                })
              )}
            </div>
          </div>
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
                {isLoading ? (
                  <>
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="h-4 w-16 gradient-shimmer rounded" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-20 gradient-shimmer rounded mb-1" />
                          <div className="h-3 w-12 gradient-shimmer rounded" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-32 gradient-shimmer rounded" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-16 gradient-shimmer rounded" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-12 gradient-shimmer rounded" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-12 gradient-shimmer rounded" />
                        </td>
                        <td className="py-3 px-4 max-w-[200px]">
                          <div className="h-4 w-40 gradient-shimmer rounded mb-1" />
                          <div className="h-3 w-24 gradient-shimmer rounded" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-12 gradient-shimmer rounded" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-6 w-20 gradient-shimmer rounded-full" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-6 w-16 gradient-shimmer rounded" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : error ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-red-500">
                      <div className="flex flex-col items-center">
                        <FaExclamationTriangle className="text-4xl mb-4" />
                        <div className="text-lg font-medium">Error loading orders!</div>
                        <div className="text-sm mt-2">Please try refreshing the page</div>
                      </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
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
                            {order.id}
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
                            {(() => {

                              const usdPrice = order.usdPrice || 0;

                              if (!currentCurrencyData) {
                                return `$${formatPrice(usdPrice)}`;
                              }

                              let displayAmount = 0;

                              if (currentCurrencyData.code === 'USD') {
                                displayAmount = usdPrice;
                              } else if (currentCurrencyData.code === 'BDT') {
                                displayAmount = usdPrice * (order.user?.dollarRate || 121.52);
                              } else {

                                displayAmount = usdPrice * currentCurrencyData.rate;
                              }

                              return `${currentCurrencyData.symbol}${formatPrice(displayAmount)}`;
                            })()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {formatCount(order.startCount || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCount(order.qty || 0)}
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
                            {formatCount(order.remains || order.qty || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              order.providerStatus === 'forward_failed' && order.status === 'failed' ? 'pending' : order.status
                            )}`}
                          >
                            {formatStatusDisplay(
                              order.providerStatus === 'forward_failed' && order.status === 'failed' ? 'pending' : order.status
                            )}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 ${
                            isLastRow ? 'last:rounded-br-lg' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {order.status === 'completed' && order.service?.refill && (
                              <button
                                onClick={() => setRefillModal({
                                  isOpen: true,
                                  orderId: order.id,
                                  reason: ''
                                })}
                                className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                                title="Refill Order"
                              >
                                Refill
                              </button>
                            )}
                            {order.status === 'pending' && order.service?.cancel && (() => {


                              const hasPendingCancelRequest = 
                                (order.cancelRequests && order.cancelRequests.some((req: CancelRequest) => req.status === 'pending')) ||
                                localPendingCancelRequests.has(order.id);

                              return hasPendingCancelRequest ? (
                                <button
                                  disabled
                                  className="text-gray-400 text-xs px-2 py-1 border border-gray-300 rounded bg-gray-50 opacity-60 cursor-not-allowed"
                                  title="Cancel request submitted"
                                >
                                  Cancel Requested
                                </button>
                              ) : (
                                <button
                                  onClick={() => setCancelModal({
                                    isOpen: true,
                                    orderId: order.id,
                                    reason: ''
                                  })}
                                  className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                                  title="Cancel Order"
                                >
                                  Cancel
                                </button>
                              );
                            })()}
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
                          No results found!
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