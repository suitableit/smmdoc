'use client';

import React, { useEffect, useState } from 'react';
import {
  FaBox,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaEllipsisH,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaEye,
  FaSearch,
  FaSync,
  FaTimes,
  FaTimesCircle,
  FaBan,
  FaUndo
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
  id: string;
  order: {
    id: number;
    service: {
      id: string;
      name: string;
      rate: number;
    };
    category: {
      id: string;
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
    id: string;
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
    requestId: string;
    refundAmount: number;
  }>({
    open: false,
    requestId: '',
    refundAmount: 0,
  });
  const [newRefundAmount, setNewRefundAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [denyDialog, setDenyDialog] = useState<{
    open: boolean;
    requestId: string;
  }>({
    open: false,
    requestId: '',
  });
  const [denyReason, setDenyReason] = useState('');
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

      if (result.success) {
        const allRequests = result.data;
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
      }
    } catch (error) {
      console.error('Error fetching cancel requests for counts:', error);
    }
  };

  const fetchCancelRequests = async () => {
    try {
      setRequestsLoading(true); // Ensure loading state is set

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/cancel-requests?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        console.log('API Response data sample:', JSON.stringify(result.data[0], null, 2));
        setCancelRequests(result.data);
        setPagination({
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
          hasNext: result.pagination.hasNext,
          hasPrev: result.pagination.hasPrev,
        });
      } else {
        console.error('API Error:', result.error);
        showToast(result.error || 'Error fetching cancel requests', 'error');
        setCancelRequests([]);
        setPagination({
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (error) {
      console.error('Error fetching cancel requests:', error);
      showToast('Error fetching cancel requests', 'error');
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

      if (result.success) {
        console.log('Processed Stats:', result.data);
        setStats(result.data);
      } else {
        console.error('Stats API Error:', result.error);
        setStats({
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          declinedRequests: 0,
          totalRefundAmount: 0,
          todayRequests: 0,
          statusBreakdown: {},
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalRequests: pagination.total,
        pendingRequests: 0,
        approvedRequests: 0,
        declinedRequests: 0,
        totalRefundAmount: 0,
        todayRequests: 0,
        statusBreakdown: {},
      });
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setRequestsLoading(true);
      fetchCancelRequests();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data on component mount and when filters change
  useEffect(() => {
    setRequestsLoading(true);
    fetchCancelRequests();
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    setStatsLoading(true);
    fetchStats();
    fetchAllRequestsForCounts();

    // Simulate stats loading delay
    const timer = setTimeout(() => {
      setStatsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
    const selectableRequests = cancelRequests.filter(req =>
      req.order.seller === 'Self' && req.status === 'pending'
    );

    if (selectedRequests.length === selectableRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(selectableRequests.map(req => req.id));
    }
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleRefresh = () => {
    setRequestsLoading(true);
    fetchCancelRequests();
    fetchStats();
    fetchAllRequestsForCounts();
    showToast('Cancel requests refreshed successfully!', 'success');
  };

  // Handle approve request
  const handleApprove = (requestId: string, refundAmount: number) => {
    setApproveDialog({ open: true, requestId, refundAmount });
    setNewRefundAmount(refundAmount.toString());
    setAdminNotes('');
  };

  // Handle deny request
  const handleDeny = (requestId: string) => {
    setDenyDialog({ open: true, requestId });
    setDenyReason('');
  };

  // Handle view request details
  const handleViewDetails = (request: CancelRequest) => {
    setViewDialog({ open: true, request });
  };

  // Process approve request
  const processApprove = async () => {
    try {
      const refundAmount = parseFloat(newRefundAmount);
      if (isNaN(refundAmount) || refundAmount < 0) {
        showToast('Please enter a valid refund amount', 'error');
        return;
      }

      // Here you would make an API call to approve the request
      // const response = await fetch(`/api/admin/cancel-requests/${approveDialog.requestId}/approve`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ refundAmount, adminNotes })
      // });

      // For now, just update the local state
      setCancelRequests(prev =>
        prev.map(req =>
          req.id === approveDialog.requestId
            ? { ...req, status: 'approved', refundAmount, adminNotes, processedAt: new Date().toISOString(), processedBy: 'admin' }
            : req
        )
      );

      setApproveDialog({ open: false, requestId: '', refundAmount: 0 });
      setNewRefundAmount('');
      setAdminNotes('');
      showToast('Cancel request approved successfully!', 'success');

      // Refresh data
      fetchCancelRequests();
      fetchStats();
      fetchAllRequestsForCounts();
    } catch (error) {
      console.error('Error approving request:', error);
      showToast('Error approving request', 'error');
    }
  };

  // Process deny request
  const processDeny = async () => {
    try {
      if (!denyReason.trim()) {
        showToast('Please provide a reason for denial', 'error');
        return;
      }

      // Here you would make an API call to deny the request
      // const response = await fetch(`/api/admin/cancel-requests/${denyDialog.requestId}/deny`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ reason: denyReason })
      // });

      // For now, just update the local state
      setCancelRequests(prev =>
        prev.map(req =>
          req.id === denyDialog.requestId
            ? { ...req, status: 'declined', adminNotes: denyReason, processedAt: new Date().toISOString(), processedBy: 'admin' }
            : req
        )
      );

      setDenyDialog({ open: false, requestId: '' });
      setDenyReason('');
      showToast('Cancel request denied successfully!', 'success');

      // Refresh data
      fetchCancelRequests();
      fetchStats();
      fetchAllRequestsForCounts();
    } catch (error) {
      console.error('Error denying request:', error);
      showToast('Error denying request', 'error');
    }
  };

  // Open approve dialog
  const openApproveDialog = (requestId: string, currentRefundAmount: number) => {
    setApproveDialog({ open: true, requestId, refundAmount: currentRefundAmount });
    setNewRefundAmount(currentRefundAmount.toString());
    setAdminNotes('');
  };

  // Open deny dialog
  const openDenyDialog = (requestId: string) => {
    setDenyDialog({ open: true, requestId });
    setDenyReason('');
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

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Order Cancel Requests
        </h1>
        <p className="text-base mt-2" style={{ color: 'var(--text-muted)' }}>
          Manage and process customer order cancellation requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Requests */}
        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Total Requests
              </p>
              <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {statsLoading ? (
                  <GradientSpinner size="w-6 h-6" />
                ) : (
                  formatNumber(stats.totalRequests)
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <FaBox className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Pending
              </p>
              <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {statsLoading ? (
                  <GradientSpinner size="w-6 h-6" />
                ) : (
                  formatNumber(stats.pendingRequests)
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <FaClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Approved Requests */}
        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Approved
              </p>
              <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {statsLoading ? (
                  <GradientSpinner size="w-6 h-6" />
                ) : (
                  formatNumber(stats.approvedRequests)
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Refund Amount */}
        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Total Refunds
              </p>
              <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {statsLoading ? (
                  <GradientSpinner size="w-6 h-6" />
                ) : (
                  `$${formatNumber(stats.totalRefundAmount)}`
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <FaDollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {/* Left: Action Buttons */}
          <div className="flex items-center gap-2">
            <select
              value={pagination.limit}
              onChange={(e) => setPagination(prev => ({ ...prev, limit: e.target.value === 'all' ? 1000 : parseInt(e.target.value), page: 1 }))}
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
              <FaSync className={requestsLoading || statsLoading ? 'animate-spin' : ''} />
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
                placeholder={`Search ${statusFilter === 'all' ? 'all' : statusFilter} requests...`}
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
                <option value="" disabled>Bulk Actions</option>
                <option value="approve">Approve Selected</option>
                <option value="decline">Decline Selected</option>
              </select>

              {selectedBulkAction && (
                <button
                  onClick={() => {
                    if (selectedBulkAction === 'approve') {
                      console.log('Bulk approve selected:', selectedRequests);
                      showToast(`Approving ${selectedRequests.length} selected requests...`, 'info');
                    } else if (selectedBulkAction === 'decline') {
                      console.log('Bulk decline selected:', selectedRequests);
                      showToast(`Declining ${selectedRequests.length} selected requests...`, 'info');
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
                <div className="text-base font-medium">Loading cancel requests...</div>
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
                No cancel requests match your current filters or no requests exist yet.
              </p>
            </div>
          ) : (
            <React.Fragment>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm min-w-[1100px]">
                  <thead className="sticky top-0 bg-white border-b z-10">
                    <tr>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        <input
                          type="checkbox"
                          checked={selectedRequests.length === cancelRequests.length && cancelRequests.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 w-4 h-4"
                        />
                      </th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Request ID</th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Order ID</th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>User</th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Service</th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Seller</th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Charge</th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Requested</th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancelRequests.map((request) => (
                      <tr key={request.id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                        <td className="p-3">
                          {request.status !== 'declined' && request.status !== 'approved' && request.order.seller === 'Self' && (
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(request.id)}
                              onChange={() => handleSelectRequest(request.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                            #{formatID(request.id)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            #{request.order.id}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {request.user.username || request.user.email.split('@')[0] || request.user.name}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-sm truncate max-w-44" style={{ color: 'var(--text-primary)' }}>
                              {request.order.service.name}
                            </div>
                            <div className="text-xs truncate max-w-44" style={{ color: 'var(--text-muted)' }}>
                              {request.order.category.category_name}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {request.order.seller || 'null'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-left">
                            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              ${formatPrice(request.order.charge, 2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(request.order.qty)} qty
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
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs">
                              {new Date(request.requestedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
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

                            {request.status !== 'declined' && request.status !== 'approved' && request.order.seller === 'Self' && (
                              <div className="relative">
                                <button
                                  className="btn btn-secondary p-2"
                                  title="More Actions"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                    dropdown.classList.toggle('hidden');
                                  }}
                                >
                                  <FaEllipsisH className="h-3 w-3" />
                                </button>

                                <div className="hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        openApproveDialog(request.id, request.refundAmount || 0);
                                        const dropdown = document.querySelector('.absolute.right-0') as HTMLElement;
                                        dropdown?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaCheckCircle className="h-3 w-3" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        openDenyDialog(request.id);
                                        const dropdown = document.querySelector('.absolute.right-0') as HTMLElement;
                                        dropdown?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <FaTimesCircle className="h-3 w-3 text-red-500" />
                                      Decline
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      {approveDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Approve Cancel Request
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Refund Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newRefundAmount}
                  onChange={(e) => setNewRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter refund amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Add any notes about this approval..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setApproveDialog({ open: false, requestId: '', refundAmount: 0 });
                  setNewRefundAmount('');
                  setAdminNotes('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Dialog */}
      {denyDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Decline Cancel Request
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Reason for Decline
                </label>
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                  placeholder="Please provide a reason for declining this request..."
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setDenyDialog({ open: false, requestId: '' });
                  setDenyReason('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processDeny}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      {viewDialog.open && viewDialog.request && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Cancel Request Details
              </h3>
              <button
                onClick={() => setViewDialog({ open: false, request: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Request Info */}
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Request Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Request ID:</span>
                    <span className="ml-2 font-mono">#{formatID(viewDialog.request.id)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      viewDialog.request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      viewDialog.request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {viewDialog.request.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Requested:</span>
                    <span className="ml-2">{new Date(viewDialog.request.requestedAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Refund Amount:</span>
                    <span className="ml-2 font-semibold">${formatPrice(viewDialog.request.refundAmount || 0, 2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Order Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Order ID:</span>
                    <span className="ml-2 font-mono">#{viewDialog.request.order.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Service:</span>
                    <span className="ml-2">{viewDialog.request.order.service.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2">{viewDialog.request.order.category.category_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <span className="ml-2">{formatNumber(viewDialog.request.order.qty)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Charge:</span>
                    <span className="ml-2 font-semibold">${formatPrice(viewDialog.request.order.charge, 2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Order Status:</span>
                    <span className="ml-2">{viewDialog.request.order.status}</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>User Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2">{viewDialog.request.user.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2">{viewDialog.request.user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Username:</span>
                    <span className="ml-2">{viewDialog.request.user.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Currency:</span>
                    <span className="ml-2">{viewDialog.request.user.currency}</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Cancellation Reason</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {viewDialog.request.reason}
                </p>
              </div>

              {/* Admin Notes (if any) */}
              {viewDialog.request.adminNotes && (
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Admin Notes</h4>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {viewDialog.request.adminNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelRequestsPage;