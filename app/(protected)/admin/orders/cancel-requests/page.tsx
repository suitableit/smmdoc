'use client';

import React, { useEffect, useState } from 'react';
import {
  FaBan,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaSearch,
  FaSync,
  FaTimes,
  FaTimesCircle,
} from 'react-icons/fa';

// Import APP_NAME constant
import { APP_NAME } from '@/lib/constants';
import { formatID, formatNumber, formatPrice } from '@/lib/utils';

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
interface CancelRequest {
  id: number;
  order: {
    id: number;
    service: {
      id: number;
      name: string;
      rate: number;
    };
    category: {
      id: number;
      category_name: string;
    };
    qty: number;
    price: number;
    charge: number;
    link: string;
    status: string;
    createdAt: string;
    seller: string;
  };
  user: {
    id: number;
    email: string;
    name: string;
    username?: string;
    currency: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  refundAmount?: number;
  adminNotes?: string;
}

interface CancelRequestStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  declinedRequests: number;
  totalRefundAmount: number;
  todayRequests: number;
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

const CancelRequestsPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Order Cancel Requests — ${APP_NAME}`;
  }, []);

  // State management
  const [cancelRequests, setCancelRequests] = useState<CancelRequest[]>([]);
  const [stats, setStats] = useState<CancelRequestStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    declinedRequests: 0,
    totalRefundAmount: 0,
    todayRequests: 0,
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
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // New state for action modals
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    requestId: number;
    refundAmount: number;
  }>({
    open: false,
    requestId: '',
    refundAmount: 0,
  });
  const [newRefundAmount, setNewRefundAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [declineDialog, setDeclineDialog] = useState<{
    open: boolean;
    requestId: number;
  }>({
    open: false,
    requestId: '',
  });
  const [declineReason, setDeclineReason] = useState('');
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    request: CancelRequest | null;
  }>({
    open: false,
    request: null,
  });
  const [selectedBulkAction, setSelectedBulkAction] = useState('');

  // Calculate status counts from current requests data
  const calculateStatusCounts = (requestsData: CancelRequest[]) => {
    const counts = {
      pending: 0,
      approved: 0,
      declined: 0,
    };

    requestsData.forEach((request) => {
      if (request.status && counts.hasOwnProperty(request.status)) {
        counts[request.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  // Fetch all cancel requests to calculate real status counts
  const fetchAllRequestsForCounts = async () => {
    try {
      console.log('Fetching all cancel requests for status counts...');
      const response = await fetch('/api/admin/cancel-requests?limit=1000');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch cancel requests');
      }

      const allRequests = result.data || [];
      const statusCounts = calculateStatusCounts(allRequests);

      console.log('Calculated status counts:', statusCounts);

      setStats((prev) => ({
        ...prev,
        pendingRequests: statusCounts.pending,
        approvedRequests: statusCounts.approved,
        declinedRequests: statusCounts.declined,
        statusBreakdown: {
          ...prev.statusBreakdown,
          pending: statusCounts.pending,
          approved: statusCounts.approved,
          declined: statusCounts.declined,
        },
      }));
    } catch (error) {
      console.error('Error fetching cancel requests for counts:', error);
    }
  };

  const fetchCancelRequests = async () => {
    try {
      setRequestsLoading(true);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      console.log(
        'Fetching cancel requests with params:',
        queryParams.toString()
      );

      const response = await fetch(`/api/admin/cancel-requests?${queryParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch cancel requests');
      }

      console.log('Cancel requests fetched successfully:', result);

      setCancelRequests(result.data || []);
      setPagination({
        page: result.pagination?.page || 1,
        limit: result.pagination?.limit || 20,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 0,
        hasNext: result.pagination?.hasNext || false,
        hasPrev: result.pagination?.hasPrev || false,
      });
    } catch (error) {
      console.error('Error fetching cancel requests:', error);
      showToast('Error fetching cancel requests. Please try again.', 'error');
      setCancelRequests([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from API...');

      const response = await fetch('/api/admin/cancel-requests/stats');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch stats');
      }

      console.log('Stats fetched successfully:', result);

      setStats({
        totalRequests: result.totalRequests || 0,
        pendingRequests: result.pendingRequests || 0,
        approvedRequests: result.approvedRequests || 0,
        declinedRequests: result.declinedRequests || 0,
        totalRefundAmount: result.totalRefundAmount || 0,
        todayRequests: result.todayRequests || 0,
        statusBreakdown: result.statusBreakdown || {},
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        declinedRequests: 0,
        totalRefundAmount: 0,
        todayRequests: 0,
        statusBreakdown: {},
      });
      showToast('Error fetching statistics. Please refresh the page.', 'error');
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCancelRequests();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchCancelRequests();
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    setStatsLoading(true);

    const loadData = async () => {
      await Promise.all([fetchStats(), fetchAllRequestsForCounts()]);
      setStatsLoading(false);
    };

    loadData();
  }, []);

  // Update stats when pagination data changes
  useEffect(() => {
    if (pagination.total > 0) {
      setStats((prev) => ({
        ...prev,
        totalRequests: pagination.total,
      }));
    }
  }, [pagination.total]);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Safe ID formatter to prevent slice errors - following Order page pattern
  const safeFormatOrderId = (id: any) => {
    return id || 'null'; // Just return the ID directly like in Order page
  };

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="h-3 w-3 text-yellow-500" />;
      case 'approved':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'declined':
        return <FaTimesCircle className="h-3 w-3 text-red-500" />;
      default:
        return <FaClock className="h-3 w-3 text-gray-500" />;
    }
  };

  const handleSelectAll = () => {
    // Only select requests that can be selected (Self orders that are pending)
    const selectableRequests = cancelRequests.filter(
      (request) =>
        request.status !== 'declined' &&
        request.status !== 'approved' &&
        request.order?.seller === 'Self'
    );

    const selectableIds = selectableRequests.map((request) => request.id);

    if (
      selectedRequests.length === selectableIds.length &&
      selectableIds.length > 0
    ) {
      // If all selectable requests are selected, deselect all
      setSelectedRequests([]);
    } else {
      // Select all selectable requests
      setSelectedRequests(selectableIds);
    }
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleRefresh = async () => {
    setRequestsLoading(true);
    setStatsLoading(true);

    try {
      await Promise.all([
        fetchCancelRequests(),
        fetchStats(),
        fetchAllRequestsForCounts(),
      ]);
      showToast('Cancel requests refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showToast('Error refreshing data. Please try again.', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle request approval
  const handleApproveRequest = async (
    requestId: string,
    refundAmount: number,
    notes: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/cancel-requests/${requestId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refundAmount,
            adminNotes: notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to approve cancel request');
      }

      showToast('Cancel request approved successfully', 'success');
      await Promise.all([
        fetchCancelRequests(),
        fetchStats(),
        fetchAllRequestsForCounts(),
      ]);
      setApproveDialog({ open: false, requestId: '', refundAmount: 0 });
      setNewRefundAmount('');
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving cancel request:', error);
      showToast(
        error instanceof Error
          ? error.message
          : 'Error approving cancel request',
        'error'
      );
    }
  };

  // Handle request decline
  const handleDeclineRequest = async (requestId: string, reason: string) => {
    try {
      const response = await fetch(
        `/api/admin/cancel-requests/${requestId}/decline`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminNotes: reason,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to decline cancel request');
      }

      showToast('Cancel request declined successfully', 'success');
      await Promise.all([
        fetchCancelRequests(),
        fetchStats(),
        fetchAllRequestsForCounts(),
      ]);
      setDeclineDialog({ open: false, requestId: '' });
      setDeclineReason('');
    } catch (error) {
      console.error('Error declining cancel request:', error);
      showToast(
        error instanceof Error
          ? error.message
          : 'Error declining cancel request',
        'error'
      );
    }
  };

  // Open approve dialog
  const openApproveDialog = (
    requestId: string,
    currentRefundAmount: number
  ) => {
    setApproveDialog({
      open: true,
      requestId,
      refundAmount: currentRefundAmount,
    });
    setNewRefundAmount(currentRefundAmount.toString());
    setAdminNotes('');
  };

  // Open decline dialog
  const openDeclineDialog = (requestId: string) => {
    setDeclineDialog({ open: true, requestId });
    setDeclineReason('');
  };

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
        {/* Controls Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {/* Left: Action Buttons */}
            <div className="flex items-center gap-2">
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
                disabled={requestsLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync
                  className={
                    requestsLoading || statsLoading ? 'animate-spin' : ''
                  }
                />
                Refresh
              </button>
            </div>

            {/* Right: Search Controls */}
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
                  } requests...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="id">Request ID</option>
                <option value="order_id">Order ID</option>
                <option value="username">Username</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cancel Requests Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {/* Filter Buttons */}
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
                    {stats.totalRequests}
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
                    {stats.pendingRequests}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'approved'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Approved
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'approved'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {stats.approvedRequests}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('declined')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'declined'
                      ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Declined
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'declined'
                        ? 'bg-white/20'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stats.declinedRequests}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {/* Bulk Action Section */}
            {selectedRequests.length > 0 && (
              <div className="flex items-center gap-2 mb-4 pt-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {selectedRequests.length} selected
                </span>
                <select
                  className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
                  value={selectedBulkAction}
                  onChange={(e) => {
                    setSelectedBulkAction(e.target.value);
                  }}
                >
                  <option value="" disabled>
                    Bulk Actions
                  </option>
                  <option value="approve">Approve Selected</option>
                  <option value="decline">Decline Selected</option>
                </select>

                {selectedBulkAction && (
                  <button
                    onClick={() => {
                      if (selectedBulkAction === 'approve') {
                        console.log('Bulk approve selected:', selectedRequests);
                        showToast(
                          `Approving ${selectedRequests.length} selected requests...`,
                          'info'
                        );
                      } else if (selectedBulkAction === 'decline') {
                        console.log('Bulk decline selected:', selectedRequests);
                        showToast(
                          `Declining ${selectedRequests.length} selected requests...`,
                          'info'
                        );
                      }
                      // Reset after action
                      setSelectedBulkAction('');
                      setSelectedRequests([]);
                    }}
                    className="btn btn-primary px-3 py-2.5"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            )}

            {requestsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading cancel requests...
                  </div>
                </div>
              </div>
            ) : cancelRequests.length === 0 ? (
              <div className="text-center py-12">
                <FaBan
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No cancel requests found.
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No cancel requests match your current filters or no requests
                  exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[1100px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedRequests.length ===
                                cancelRequests.length &&
                              cancelRequests.length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Request ID
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Order ID
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
                          Service
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
                          Charge
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
                          Requested
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
                      {cancelRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            {request.status !== 'declined' &&
                              request.status !== 'approved' &&
                              request.order?.seller === 'Self' && (
                                <input
                                  type="checkbox"
                                  checked={selectedRequests.includes(
                                    request.id
                                  )}
                                  onChange={() =>
                                    handleSelectRequest(request.id)
                                  }
                                  className="rounded border-gray-300 w-4 h-4"
                                />
                              )}
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                              #{formatID(String(request?.id || 'null'))}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{formatID(String(request.order.id).slice(-8))}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {request.user?.username ||
                                request.user?.email?.split('@')[0] ||
                                request.user?.name ||
                                'Unknown'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm truncate max-w-44"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {request.order?.service?.name ||
                                  'Unknown Service'}
                              </div>
                              <div
                                className="text-xs truncate max-w-44"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {request.order?.category?.category_name ||
                                  'Unknown Category'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {request.order?.seller || 'Unknown'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-left">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                ${formatPrice(request.order?.charge || 0, 2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatNumber(request.order?.qty || 0)} qty
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit">
                              {getStatusIcon(request.status)}
                              <span className="text-xs font-medium capitalize">
                                {request.status}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {request.requestedAt
                                  ? new Date(
                                      request.requestedAt
                                    ).toLocaleDateString()
                                  : 'Unknown'}
                              </div>
                              <div className="text-xs">
                                {request.requestedAt
                                  ? new Date(
                                      request.requestedAt
                                    ).toLocaleTimeString()
                                  : ''}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                className="btn btn-secondary p-2"
                                title="View Details"
                                onClick={() => {
                                  setViewDialog({
                                    open: true,
                                    request: request,
                                  });
                                }}
                              >
                                <FaEye className="h-3 w-3" />
                              </button>

                              {request.status !== 'declined' &&
                                request.status !== 'approved' &&
                                request.order?.seller === 'Self' && (
                                  <>
                                    <button
                                      className="btn btn-primary p-2"
                                      title="Approve"
                                      onClick={() =>
                                        openApproveDialog(
                                          request.id,
                                          request.refundAmount || 0
                                        )
                                      }
                                    >
                                      <FaCheckCircle className="h-3 w-3" />
                                    </button>
                                    <button
                                      className="btn btn-secondary p-2"
                                      title="Decline"
                                      onClick={() =>
                                        openDeclineDialog(request.id)
                                      }
                                    >
                                      <FaTimesCircle className="h-3 w-3" />
                                    </button>
                                  </>
                                )}
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
                    {cancelRequests.map((request) => (
                      <div
                        key={request.id}
                        className="card card-padding border-l-4 border-purple-500 mb-4"
                      >
                        {/* Header with ID and Status */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(request.id)}
                              onChange={() => handleSelectRequest(request.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                            <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                              #{formatID(String(request?.id || 'null'))}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                              {getStatusIcon(request.status)}
                              <span className="text-xs font-medium capitalize">
                                {request.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              className="btn btn-secondary p-2"
                              title="View Details"
                              onClick={() => {
                                setViewDialog({ open: true, request: request });
                              }}
                            >
                              <FaEye className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Order and User Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Order ID
                            </div>
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">
                              #{formatID(String(request?.order?.id || 'null'))}
                            </div>
                          </div>
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
                              {request.user?.username ||
                                request.user?.email?.split('@')[0] ||
                                'Unknown'}
                            </div>
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="mb-4">
                          <div
                            className="font-medium text-sm mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {request.order?.service?.name || 'Unknown Service'}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {request.order?.category?.category_name ||
                              'Unknown Category'}{' '}
                            • Seller: {request.order?.seller || 'Unknown'}
                          </div>
                        </div>

                        {/* Financial Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Charge
                            </div>
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ${formatPrice(request.order?.charge || 0, 2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(request.order?.qty || 0)} qty
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Requested
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {request.requestedAt
                                ? new Date(
                                    request.requestedAt
                                  ).toLocaleDateString()
                                : 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.requestedAt
                                ? new Date(
                                    request.requestedAt
                                  ).toLocaleTimeString()
                                : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 pb-6 border-t">
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {requestsLoading ? (
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
                      )} of ${formatNumber(pagination.total)} requests`
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={!pagination.hasPrev || requestsLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {requestsLoading ? (
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
                      disabled={!pagination.hasNext || requestsLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Approve Dialog */}
                {approveDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Approve Cancel Request
                      </h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">Refund Amount</label>
                        <input
                          type="number"
                          value={newRefundAmount}
                          onChange={(e) => setNewRefundAmount(e.target.value)}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="Enter refund amount"
                          step="0.01"
                          readOnly
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label mb-2">
                          Admin Notes (Optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="form-field w-full min-h-[120px] resize-y px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="Add any notes about the approval..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setApproveDialog({
                              open: false,
                              requestId: '',
                              refundAmount: 0,
                            });
                            setNewRefundAmount('');
                            setAdminNotes('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleApproveRequest(
                              approveDialog.requestId,
                              parseFloat(newRefundAmount) || 0,
                              adminNotes
                            )
                          }
                          className="btn btn-primary"
                        >
                          Approve & Process Refund
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Details Dialog */}
                {viewDialog.open &&
                  viewDialog.request &&
                  viewDialog.request.order && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold">
                            Cancel Request Details
                          </h3>
                          <button
                            onClick={() =>
                              setViewDialog({ open: false, request: null })
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaTimes className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Request Info */}
                        <div className="mb-6">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Request ID
                              </label>
                              <div className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded w-fit mt-1">
                                #
                                {formatID(String(viewDialog.request?.id || ''))}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Status
                              </label>
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit mt-1">
                                {getStatusIcon(viewDialog.request.status)}
                                <span className="text-xs font-medium capitalize">
                                  {viewDialog.request.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Requested
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {viewDialog.request.requestedAt ? (
                                  <>
                                    {new Date(
                                      viewDialog.request.requestedAt
                                    ).toLocaleDateString()}{' '}
                                    at{' '}
                                    {new Date(
                                      viewDialog.request.requestedAt
                                    ).toLocaleTimeString()}
                                  </>
                                ) : (
                                  'Unknown'
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                User
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {viewDialog.request.user?.username ||
                                  viewDialog.request.user?.email?.split(
                                    '@'
                                  )[0] ||
                                  'Unknown'}{' '}
                                ({viewDialog.request.user?.email || 'No email'})
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="mb-6">
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            Order Summary
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Order ID
                                </label>
                                <div className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit mt-1">
                                  #
                                  {formatID(
                                    viewDialog.request.order.id.slice(-8)
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Order Status
                                </label>
                                <div className="text-sm text-gray-900 mt-1 capitalize">
                                  {viewDialog.request.order?.status ||
                                    'Unknown'}
                                </div>
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="text-sm font-medium text-gray-600">
                                Service
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {viewDialog.request.order?.service?.name ||
                                  'Unknown Service'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Category:{' '}
                                {viewDialog.request.order?.category
                                  ?.category_name || 'Unknown'}{' '}
                                • Seller:{' '}
                                {viewDialog.request.order?.seller || 'Unknown'}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Quantity
                                </label>
                                <div className="text-sm text-gray-900 mt-1">
                                  {formatNumber(
                                    viewDialog.request.order?.qty || 0
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Charge
                                </label>
                                <div className="text-sm text-gray-900 mt-1">
                                  $
                                  {formatPrice(
                                    viewDialog.request.order?.charge || 0,
                                    2
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Order Link
                              </label>
                              <div className="text-sm mt-1">
                                {viewDialog.request.order?.link ? (
                                  <a
                                    href={viewDialog.request.order.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 break-all"
                                  >
                                    {viewDialog.request.order.link}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">
                                    No link provided
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className="text-sm font-medium text-gray-600">
                                Order Created
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {viewDialog.request.order?.createdAt ? (
                                  <>
                                    {new Date(
                                      viewDialog.request.order.createdAt
                                    ).toLocaleDateString()}{' '}
                                    at{' '}
                                    {new Date(
                                      viewDialog.request.order.createdAt
                                    ).toLocaleTimeString()}
                                  </>
                                ) : (
                                  'Unknown'
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mb-6">
                          <h4 className="text-md font-semibold mb-3 text-gray-800">
                            Cancel Reason
                          </h4>
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div className="text-sm text-gray-900">
                              {viewDialog.request.reason ||
                                'No reason provided'}
                            </div>
                          </div>
                        </div>

                        {/* Admin Notes (if processed) */}
                        {viewDialog.request.adminNotes && (
                          <div className="mb-6">
                            <h4 className="text-md font-semibold mb-3 text-gray-800">
                              Admin Notes
                            </h4>
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                              <div className="text-sm text-gray-900">
                                {viewDialog.request.adminNotes}
                              </div>
                              {viewDialog.request.processedAt && (
                                <div className="text-xs text-gray-500 mt-2">
                                  Processed on{' '}
                                  {new Date(
                                    viewDialog.request.processedAt
                                  ).toLocaleDateString()}{' '}
                                  at{' '}
                                  {new Date(
                                    viewDialog.request.processedAt
                                  ).toLocaleTimeString()}
                                  {viewDialog.request.processedBy &&
                                    ` by ${viewDialog.request.processedBy}`}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {viewDialog.request.status === 'pending' &&
                          viewDialog.request.order?.seller === 'Self' && (
                            <div className="flex gap-3 justify-end pt-4 border-t">
                              <button
                                onClick={() => {
                                  setViewDialog({ open: false, request: null });
                                  openDeclineDialog(viewDialog.request!.id);
                                }}
                                className="btn btn-secondary flex items-center gap-2"
                              >
                                <FaTimesCircle />
                                Decline
                              </button>
                              <button
                                onClick={() => {
                                  setViewDialog({ open: false, request: null });
                                  openApproveDialog(
                                    viewDialog.request!.id,
                                    viewDialog.request!.refundAmount || 0
                                  );
                                }}
                                className="btn btn-primary flex items-center gap-2"
                              >
                                <FaCheckCircle />
                                Approve
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                {/* Decline Dialog */}
                {declineDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Decline Cancel Request
                      </h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">
                          Reason for Decline
                        </label>
                        <textarea
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          className="form-field w-full min-h-[120px] resize-y px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="Explain why this cancel request is being declined..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setDeclineDialog({ open: false, requestId: '' });
                            setDeclineReason('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleDeclineRequest(
                              declineDialog.requestId,
                              declineReason
                            )
                          }
                          className="btn btn-primary"
                          disabled={!declineReason.trim()}
                        >
                          Decline Request
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelRequestsPage;
