'use client';

import React, { useEffect, useState } from 'react';
import {
    FaCheckCircle,
    FaClock,
    FaExclamationCircle,
    FaExternalLinkAlt,
    FaEye,
    FaRedo,
    FaSearch,
    FaSync,
    FaTimes
} from 'react-icons/fa';

import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatID, formatNumber, formatPrice } from '@/lib/utils';

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

interface Order {
  id: number;
  user: {
    id: number;
    email: string;
    name: string;
    username?: string;
    currency: string;
    balance: number;
  };
  service: {
    id: number;
    name: string;
    rate: number;
    min_order: number;
    max_order: number;
    status: string;
    seller?: {
      type: 'manual' | 'auto';
      name?: string;
    };
  };
  category: {
    id: number;
    category_name: string;
  };
  qty: number;
  price: number;
  charge: number;
  usdPrice: number;
  bdtPrice: number;
  currency: string;
  status: 'completed' | 'partial';
  createdAt: string;
  updatedAt: string;
  link: string;
  startCount: number;
  remains: number;
  avg_time: string;
  refillRequest?: {
    id: string;
    reason: string;
    status: string;
    adminNotes?: string;
    processedBy?: string;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface RefillInfo {
  eligible: boolean;
  reason?: string;
  order: {
    id: number;
    status: string;
    totalQuantity: number;
    remainingQuantity: number;
    deliveredQuantity: number;
  };
  service: {
    id: number;
    name: string;
    rate: number;
    status: string;
    minOrder: number;
    maxOrder: number;
  };
  user: {
    balance: number;
    currency: string;
  };
  refillOptions: {
    full: {
      quantity: number;
      costUsd: number;
      costBdt: number;
      cost: number;
      affordable: boolean;
    };
    remaining: {
      quantity: number;
      costUsd: number;
      costBdt: number;
      cost: number;
      affordable: boolean;
    };
  };
}

interface RefillOrderStats {
  totalEligible: number;
  partialOrders: number;
  completedOrders: number;
  todayRefills: number;
  totalRefillAmount: number;
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

const RefillOrdersPage = () => {
  const { appName } = useAppNameWithFallback();

  useEffect(() => {
    setPageTitle('Refill Orders', appName);
  }, [appName]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<RefillOrderStats>({
    totalEligible: 0,
    partialOrders: 0,
    completedOrders: 0,
    todayRefills: 0,
    totalRefillAmount: 0,
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
  const [selectedBulkAction, setSelectedBulkAction] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [refillDialogOpen, setRefillDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refillInfo, setRefillInfo] = useState<RefillInfo | null>(null);
  const [refillForm, setRefillForm] = useState({
    type: 'full',
    customQuantity: '',
    reason: '',
  });
  const [processing, setProcessing] = useState(false);

  const calculateStatusCounts = (ordersData: Order[]) => {
    const counts = {
      partial: 0,
      completed: 0,
    };

    ordersData.forEach((order) => {
      if (order.status && counts.hasOwnProperty(order.status)) {
        counts[order.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const fetchEligibleOrders = async () => {
    try {
      setOrdersLoading(true);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      console.log('Fetching refill orders with params:', queryParams.toString());

      const response = await fetch(`/api/admin/refill-requests?${queryParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch eligible orders');
      }

      console.log('Refill requests fetched successfully:', result);

      const transformedOrders = (result.data || [])
        .filter((request: any, index: number, self: any[]) =>

          index === self.findIndex(r => r.order?.id === request.order?.id)
        )
        .map((request: any) => ({
        id: request.order?.id || 0,
        qty: request.order?.qty || 0,
        price: request.order?.price || 0,
        usdPrice: request.order?.usdPrice || 0,
        bdtPrice: request.order?.bdtPrice || 0,
        link: request.order?.link || '',
        status: request.order?.status || 'unknown',
        createdAt: request.order?.createdAt || new Date(),
        user: request.user || {},
        service: {
          name: request.order?.service?.name || 'Unknown Service',
          refill: request.order?.service?.refill || true,
          rate: request.order?.service?.rate || 0
        },
        category: { category_name: 'Refill Request' },
        refillRequest: request
      }));

      setOrders(transformedOrders);
      setPagination({
        page: result.pagination?.page || 1,
        limit: result.pagination?.limit || 20,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 0,
        hasNext: result.pagination?.hasNext || false,
        hasPrev: result.pagination?.hasPrev || false,
      });
    } catch (error) {
      console.error('Error fetching eligible orders:', error);
      showToast('Error fetching eligible orders. Please try again.', 'error');
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
      console.log('Fetching refill stats from API...');

      const response = await fetch('/api/admin/refill-requests/stats');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stats');
      }

      console.log('Refill stats fetched successfully:', result);

      setStats({
        totalEligible: result.data?.eligibleOrdersCount || 0,
        partialOrders: 0,
        completedOrders: 0,
        todayRefills: result.data?.totalRequests || 0,
        totalRefillAmount: 0,
        statusBreakdown: {
          pending: result.data?.pendingRequests || 0,
          approved: result.data?.approvedRequests || 0,
          declined: result.data?.declinedRequests || 0,
          completed: result.data?.completedRequests || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching refill stats:', error);
      setStats({
        totalEligible: 0,
        partialOrders: 0,
        completedOrders: 0,
        todayRefills: 0,
        totalRefillAmount: 0,
        statusBreakdown: {},
      });
      showToast('Error fetching statistics. Please refresh the page.', 'error');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEligibleOrders();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchEligibleOrders();
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    setStatsLoading(true);

    const loadData = async () => {
      await Promise.all([fetchStats()]);
      setStatsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (pagination.total > 0) {
      setStats((prev) => ({
        ...prev,
        totalEligible: pagination.total,
      }));
    }
  }, [pagination.total]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const safeFormatOrderId = (id: any) => {
    return formatID(String(id || 'null'));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'partial':
        return <FaExclamationCircle className="h-3 w-3 text-orange-500" />;
      default:
        return <FaClock className="h-3 w-3 text-gray-500" />;
    }
  };

  const calculateProgress = (qty: number, remains: number) => {
    return qty > 0 ? Math.round(((qty - remains) / qty) * 100) : 0;
  };

  const handleSelectAll = () => {
    if (selectedOrders?.length === orders?.length && orders?.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders?.map((order) => order.id) || []);
    }
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleRefresh = async () => {
    setOrdersLoading(true);
    setStatsLoading(true);

    try {
      await Promise.all([fetchEligibleOrders(), fetchStats()]);
      showToast('Refill orders refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showToast('Error refreshing data. Please try again.', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleOpenRefillDialog = async (order: Order) => {
    try {
      setSelectedOrder(order);
      setRefillDialogOpen(true);

      const response = await fetch(`/api/admin/orders/${order.id}/refill`);
      const result = await response.json();

      if (result.success) {
        setRefillInfo(result.data);
      } else {
        showToast(result.error || 'Failed to fetch refill information', 'error');
        setRefillDialogOpen(false);
      }
    } catch (error) {
      console.error('Error fetching refill info:', error);
      showToast('Error fetching refill information', 'error');
      setRefillDialogOpen(false);
    }
  };

  const handleCreateRefill = async () => {
    if (!selectedOrder || !refillInfo) return;

    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/refill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refillType: refillForm.type,
          customQuantity:
            refillForm.type === 'custom' ? parseInt(refillForm.customQuantity) : undefined,
          reason: refillForm.reason || 'Admin initiated refill',
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('Refill order created successfully', 'success');
        setRefillDialogOpen(false);
        setSelectedOrder(null);
        setRefillInfo(null);
        setRefillForm({ type: 'full', customQuantity: '', reason: '' });
        fetchEligibleOrders();
      } else {
        showToast(result.error || 'Failed to create refill order', 'error');
      }
    } catch (error) {
      console.error('Error creating refill:', error);
      showToast('Error creating refill order', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-container">
      {}
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
        {}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {}
            <div className="flex items-center gap-2">
              <select
                value={pagination.limit}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    limit: e.target.value === 'all' ? 1000 : parseInt(e.target.value),
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
                <FaSync className={ordersLoading || statsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {}
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${statusFilter === 'all' ? 'all' : statusFilter} orders...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="id">Order ID</option>
                <option value="username">Username</option>
              </select>
            </div>
          </div>
        </div>

        {}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {}
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
                      statusFilter === 'all' ? 'bg-white/20' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {statsLoading ? (
                      <span className="inline-block h-4 w-6 gradient-shimmer rounded" />
                    ) : (
                      stats.totalEligible
                    )}
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
                      statusFilter === 'partial' ? 'bg-white/20' : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {statsLoading ? (
                      <span className="inline-block h-4 w-6 gradient-shimmer rounded" />
                    ) : (
                      stats.partialOrders
                    )}
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
                    {statsLoading ? (
                      <span className="inline-block h-4 w-6 gradient-shimmer rounded" />
                    ) : (
                      stats.completedOrders
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {}
            {selectedOrders?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {selectedOrders?.length || 0} selected
                  </span>
                  <select
                    className="w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
                    value={selectedBulkAction}
                    onChange={(e) => {
                      setSelectedBulkAction(e.target.value);
                    }}
                  >
                    <option value="" disabled>
                      Bulk Actions
                    </option>
                    <option value="bulk_refill">Bulk Refill</option>
                    <option value="export">Export Selected</option>
                  </select>
                </div>

                {selectedBulkAction && (
                  <button
                    onClick={() => {
                      if (selectedBulkAction === 'bulk_refill') {
                        console.log('Bulk refill selected:', selectedOrders);
                        showToast(`Creating refills for ${selectedOrders?.length || 0} selected orders...`, 'info');
                      } else if (selectedBulkAction === 'export') {
                        console.log('Export selected:', selectedOrders);
                        showToast(`Exporting ${selectedOrders?.length || 0} selected orders...`, 'info');
                      }

                      setSelectedBulkAction('');
                      setSelectedOrders([]);
                    }}
                    className="btn btn-primary px-3 py-2.5 whitespace-nowrap w-full sm:w-auto"
                  >
                    Apply Action
                  </button>
                )}
              </div>
            )}

            {ordersLoading ? (
              <div style={{ minHeight: '600px' }}>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[1300px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th className="text-left p-3">
                          <div className="h-4 w-4 gradient-shimmer rounded" />
                        </th>
                        {Array.from({ length: 10 }).map((_, idx) => (
                          <th key={idx} className="text-left p-3">
                            <div className="h-4 w-20 gradient-shimmer rounded" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 10 }).map((_, rowIdx) => (
                        <tr key={rowIdx} className="border-t">
                          <td className="p-3">
                            <div className="h-4 w-4 gradient-shimmer rounded" />
                          </td>
                          <td className="p-3">
                            <div className="h-6 w-16 gradient-shimmer rounded" />
                          </td>
                          <td className="p-3">
                            <div className="h-4 w-24 gradient-shimmer rounded mb-1" />
                            <div className="h-3 w-32 gradient-shimmer rounded" />
                          </td>
                          <td className="p-3">
                            <div className="h-4 w-32 gradient-shimmer rounded mb-1" />
                            <div className="h-3 w-24 gradient-shimmer rounded" />
                          </td>
                          <td className="p-3">
                            <div className="h-4 w-16 gradient-shimmer rounded mb-1" />
                            <div className="h-3 w-20 gradient-shimmer rounded" />
                          </td>
                          <td className="p-3">
                            <div className="h-4 w-24 gradient-shimmer rounded" />
                          </td>
                          <td className="p-3 text-right">
                            <div className="h-4 w-12 gradient-shimmer rounded mb-1" />
                            <div className="h-3 w-16 gradient-shimmer rounded" />
                          </td>
                          <td className="p-3 text-right">
                            <div className="h-4 w-16 gradient-shimmer rounded mb-1" />
                            <div className="h-3 w-12 gradient-shimmer rounded" />
                          </td>
                          <td className="p-3 text-center">
                            <div className="h-6 w-20 gradient-shimmer rounded-full mx-auto" />
                          </td>
                          <td className="p-3 text-center">
                            <div className="h-4 w-12 gradient-shimmer rounded mb-1" />
                            <div className="h-1.5 w-24 gradient-shimmer rounded-full mx-auto mb-1" />
                            <div className="h-3 w-16 gradient-shimmer rounded mx-auto" />
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="h-8 w-8 gradient-shimmer rounded" />
                              <div className="h-8 w-8 gradient-shimmer rounded" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="lg:hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="card card-padding border-l-4 border-blue-500 mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 gradient-shimmer rounded" />
                            <div className="h-6 w-16 gradient-shimmer rounded" />
                            <div className="h-6 w-20 gradient-shimmer rounded-full" />
                          </div>
                          <div className="h-8 w-8 gradient-shimmer rounded" />
                        </div>
                        <div className="mb-4 pb-4 border-b">
                          <div className="h-3 w-12 gradient-shimmer rounded mb-2" />
                          <div className="h-4 w-24 gradient-shimmer rounded mb-1" />
                          <div className="h-3 w-32 gradient-shimmer rounded" />
                        </div>
                        <div className="mb-4">
                          <div className="h-4 w-32 gradient-shimmer rounded mb-1" />
                          <div className="h-3 w-24 gradient-shimmer rounded mb-2" />
                          <div className="h-3 w-16 gradient-shimmer rounded mb-1" />
                          <div className="h-3 w-20 gradient-shimmer rounded mb-2" />
                          <div className="h-4 w-24 gradient-shimmer rounded" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="h-3 w-16 gradient-shimmer rounded mb-2" />
                            <div className="h-4 w-16 gradient-shimmer rounded mb-1" />
                            <div className="h-3 w-12 gradient-shimmer rounded" />
                          </div>
                          <div>
                            <div className="h-3 w-20 gradient-shimmer rounded mb-2" />
                            <div className="h-4 w-20 gradient-shimmer rounded mb-1" />
                            <div className="h-3 w-12 gradient-shimmer rounded" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="h-3 w-16 gradient-shimmer rounded mb-2" />
                            <div className="h-4 w-12 gradient-shimmer rounded" />
                            <div className="h-3 w-16 gradient-shimmer rounded mt-1" />
                          </div>
                          <div>
                            <div className="h-3 w-20 gradient-shimmer rounded mb-2" />
                            <div className="h-4 w-16 gradient-shimmer rounded" />
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="h-3 w-16 gradient-shimmer rounded mb-2" />
                          <div className="h-2 w-full gradient-shimmer rounded-full mb-1" />
                          <div className="h-3 w-20 gradient-shimmer rounded" />
                        </div>
                        <div className="flex justify-center">
                          <div className="h-10 w-32 gradient-shimmer rounded-lg" />
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="h-3 w-24 gradient-shimmer rounded mb-1" />
                          <div className="h-3 w-20 gradient-shimmer rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    <div className="h-5 w-48 gradient-shimmer rounded" />
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <div className="h-9 w-20 gradient-shimmer rounded" />
                    <div className="h-5 w-24 gradient-shimmer rounded" />
                    <div className="h-9 w-16 gradient-shimmer rounded" />
                  </div>
                </div>
              </div>
            ) : orders?.length === 0 ? (
              <div className="text-center py-12">
                <FaRedo
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No eligible orders found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No orders are currently eligible for refill or no orders match your filters.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[1300px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <input
                            type="checkbox"
                            checked={selectedOrders?.length === orders?.length && orders?.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Order ID
                        </th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          User
                        </th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Service
                        </th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Seller
                        </th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Link
                        </th>
                        <th className="text-right p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Quantity
                        </th>
                        <th className="text-right p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Amount
                        </th>
                        <th className="text-center p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Status
                        </th>
                        <th className="text-center p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Progress
                        </th>
                        <th className="text-center p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders?.map((order, index) => (
                        <tr
                          key={`${order.id}-${index}`}
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
                              {safeFormatOrderId(order.id)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {order.user?.username ||
                                  order.user?.email?.split('@')[0] ||
                                  order.user?.name ||
                                  'Unknown'}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {order.user?.email || 'No email'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm truncate max-w-44"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {}
                                {order.service?.name || 'Unknown Service'}
                              </div>
                              <div className="text-xs truncate max-w-44" style={{ color: 'var(--text-muted)' }}>
                                {}
                                {order.category?.category_name || 'Unknown Category'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm capitalize"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {order.service?.seller?.type || 'Manual'}
                              </div>
                              {order.service?.seller?.name && (
                                <div className="text-xs truncate max-w-32" style={{ color: 'var(--text-muted)' }}>
                                  {order.service.seller.name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="max-w-28">
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
                                  onClick={() => window.open(order.link, '_blank')}
                                  className="text-blue-500 hover:text-blue-700 p-1 flex-shrink-0"
                                  title="Open link in new tab"
                                >
                                  <FaExternalLinkAlt className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div>
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {formatNumber(order.qty)}
                              </div>
                              <div className="text-xs text-green-600">
                                {formatNumber(order.qty - order.remains)} delivered
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div>
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                ${formatPrice(order.charge || order.price, 2)}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {order.currency}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit mx-auto">
                              {getStatusIcon(order.status)}
                              <span className="text-xs font-medium capitalize">{order.status}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="space-y-1">
                              <div
                                className="text-xs font-medium"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {calculateProgress(order.qty, order.remains)}%
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${calculateProgress(order.qty, order.remains)}%`,
                                  }}
                                />
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {order.remains} remaining
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenRefillDialog(order)}
                                className="btn btn-primary p-2"
                                title="Create Refill"
                              >
                                <FaRedo className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}
                                className="btn btn-secondary p-2"
                                title="View Order Details"
                              >
                                <FaEye className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {}
                <div className="lg:hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {orders?.map((order, index) => (
                      <div
                        key={`${order.id}-${index}`}
                        className="card card-padding border-l-4 border-blue-500 mb-4"
                      >
                        {}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {safeFormatOrderId(order.id)}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                              {getStatusIcon(order.status)}
                              <span className="text-xs font-medium capitalize">{order.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}
                              className="btn btn-secondary p-2"
                              title="View Order Details"
                            >
                              <FaEye className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {}
                        <div className="mb-4 pb-4 border-b">
                          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                            User
                          </div>
                          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {order.user?.username ||
                              order.user?.email?.split('@')[0] ||
                              order.user?.name ||
                              'Unknown'}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {order.user?.email || 'No email'}
                          </div>
                        </div>

                        {}
                        <div className="mb-4">
                          <div
                            className="font-medium text-sm mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {}
                            {order.service?.name || 'Unknown Service'}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {}
                            {order.category?.category_name || 'Unknown Category'}
                          </div>

                          {}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                              Seller:
                            </span>
                            <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                              {order.service?.seller?.type || 'Manual'}
                            </span>
                            {order.service?.seller?.name && (
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                ({order.service.seller.name})
                              </span>
                            )}
                          </div>

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
                              onClick={() => window.open(order.link, '_blank')}
                              className="text-blue-500 hover:text-blue-700 p-1 flex-shrink-0"
                              title="Open link in new tab"
                            >
                              <FaExternalLinkAlt className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Amount
                            </div>
                            <div className="font-semibold text-sm text-blue-600">
                              ${formatPrice(order.charge || order.price, 2)}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {order.currency}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              User Balance
                            </div>
                            <div className="font-semibold text-sm text-green-600">
                              ${formatPrice(order.user?.balance || 0, 2)}
                            </div>
                          </div>
                        </div>

                        {}
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
                              {formatNumber(order.qty)}
                            </div>
                            <div className="text-xs text-green-600">
                              {formatNumber(order.qty - order.remains)} delivered
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
                              {formatNumber(order.startCount)}
                            </div>
                          </div>
                        </div>

                        {}
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
                              {calculateProgress(order.qty, order.remains)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${calculateProgress(order.qty, order.remains)}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {order.remains} remaining
                          </div>
                        </div>

                        {}
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleOpenRefillDialog(order)}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            <FaRedo className="h-4 w-4" />
                            Create Refill
                          </button>
                        </div>

                        {}
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Date: {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Time: {new Date(order.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {ordersLoading ? (
                      <div className="h-5 w-48 gradient-shimmer rounded" />
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
                        <div className="h-5 w-24 gradient-shimmer rounded" />
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
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      {}
      {refillDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Create Refill Order</h3>
              <button
                onClick={() => setRefillDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Create a refill order for #{safeFormatOrderId(selectedOrder?.id)}. This will create a
              new order to replace any lost engagement.
            </p>

            {refillInfo && (
              <div className="space-y-6">
                {}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Original Quantity
                    </div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatNumber(refillInfo.order.totalQuantity)}
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Remaining
                    </div>
                    <div className="font-semibold text-orange-600">
                      {formatNumber(refillInfo.order.remainingQuantity)}
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      User Balance
                    </div>
                    <div className="font-semibold text-green-600">
                      ${formatPrice(refillInfo.user.balance, 2)} {refillInfo.user.currency}
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Service Status
                    </div>
                    <div className="font-semibold text-blue-600 capitalize">
                      {refillInfo.service.status}
                    </div>
                  </div>
                </div>

                {}
                <div className="space-y-4">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Refill Type
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        id="full-refill"
                        name="refillType"
                        value="full"
                        checked={refillForm.type === 'full'}
                        onChange={(e) =>
                          setRefillForm((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        className="text-green-600"
                      />
                      <label htmlFor="full-refill" className="flex-1 cursor-pointer">
                        <div className="font-medium">
                          Full Refill ({formatNumber(refillInfo.refillOptions.full.quantity)})
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          Cost: ${formatPrice(refillInfo.refillOptions.full.cost, 2)}
                          {refillInfo.refillOptions.full.affordable ? (
                            <span className="text-green-600 ml-2">✓ Affordable</span>
                          ) : (
                            <span className="text-red-600 ml-2">✗ Insufficient balance</span>
                          )}
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        id="remaining-refill"
                        name="refillType"
                        value="remaining"
                        checked={refillForm.type === 'remaining'}
                        onChange={(e) =>
                          setRefillForm((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        className="text-green-600"
                      />
                      <label htmlFor="remaining-refill" className="flex-1 cursor-pointer">
                        <div className="font-medium">
                          Remaining Only ({formatNumber(refillInfo.refillOptions.remaining.quantity)})
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          Cost: ${formatPrice(refillInfo.refillOptions.remaining.cost, 2)}
                          {refillInfo.refillOptions.remaining.affordable ? (
                            <span className="text-green-600 ml-2">✓ Affordable</span>
                          ) : (
                            <span className="text-red-600 ml-2">✗ Insufficient balance</span>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Reason (Optional)
                  </div>
                  <input
                    type="text"
                    placeholder="Enter reason for refill..."
                    value={refillForm.reason}
                    onChange={(e) =>
                      setRefillForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => setRefillDialogOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleCreateRefill}
                disabled={processing || !refillInfo?.eligible}
                className="btn btn-primary flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <FaSync className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaRedo className="h-4 w-4" />
                    Create Refill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefillOrdersPage;