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
  FaExternalLinkAlt,
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

// Dummy data generator
const generateDummyData = (): CancelRequest[] => {
  const services = [
    'Instagram Followers',
    'YouTube Views',
    'TikTok Likes',
    'Facebook Page Likes',
    'Twitter Followers',
    'Instagram Likes',
    'YouTube Subscribers',
    'TikTok Followers',
    'LinkedIn Connections',
    'Pinterest Followers'
  ];

  const categories = [
    'Social Media',
    'Video Marketing',
    'Content Boost',
    'Engagement',
    'Growth Services'
  ];

  const sellers = ['Self', 'Auto', 'Manual'];
  const statuses = ['pending', 'approved', 'declined'];
  const users = [
    { name: 'John Doe', username: 'johndoe', email: 'john@example.com' },
    { name: 'Sarah Smith', username: 'sarahsmith', email: 'sarah@example.com' },
    { name: 'Mike Johnson', username: 'mikej', email: 'mike@example.com' },
    { name: 'Emily Davis', username: 'emilyd', email: 'emily@example.com' },
    { name: 'Alex Brown', username: 'alexb', email: 'alex@example.com' },
    { name: 'Lisa Wilson', username: 'lisaw', email: 'lisa@example.com' },
    { name: 'David Chen', username: 'davidc', email: 'david@example.com' },
    { name: 'Jessica Lee', username: 'jessical', email: 'jessica@example.com' }
  ];

  const sampleLinks = [
    'https://instagram.com/p/ABC123xyz',
    'https://youtube.com/watch?v=dQw4w9WgXcQ',
    'https://tiktok.com/@user/video/123456789',
    'https://facebook.com/page/posts/123456',
    'https://twitter.com/user/status/123456789',
    'https://linkedin.com/in/user/posts/123456',
    'https://pinterest.com/pin/123456789'
  ];

  const cancelReasons = [
    'Changed my mind about the order',
    'Found a better price elsewhere',
    'Order taking too long to process',
    'No longer need this service',
    'Made duplicate order by mistake',
    'Quality not as expected',
    'Service not working properly'
  ];

  return Array.from({ length: 25 }, (_, index) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const seller = sellers[Math.floor(Math.random() * sellers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const qty = Math.floor(Math.random() * 10000) + 100;
    const charge = parseFloat((Math.random() * 500 + 5).toFixed(2));
    const link = sampleLinks[Math.floor(Math.random() * sampleLinks.length)];
    const reason = cancelReasons[Math.floor(Math.random() * cancelReasons.length)];

    return {
      id: 1000 + index,
      order: {
        id: 50000 + index,
        service: {
          id: index + 1,
          name: service,
          rate: parseFloat((Math.random() * 0.01).toFixed(4))
        },
        category: {
          id: Math.floor(Math.random() * 5) + 1,
          category_name: category
        },
        qty,
        price: charge,
        charge,
        link,
        status: ['Completed', 'Processing', 'Pending', 'Cancelled'][Math.floor(Math.random() * 4)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        seller
      },
      user: {
        id: index + 1,
        email: user.email,
        name: user.name,
        username: user.username,
        currency: 'USD'
      },
      reason,
      status: status as 'pending' | 'approved' | 'declined',
      requestedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: status !== 'pending' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      processedBy: status !== 'pending' ? 'Admin' : undefined,
      refundAmount: status === 'approved' ? charge : undefined,
      adminNotes: status !== 'pending' ? (status === 'approved' ? 'Refund processed successfully' : 'Request denied - order already completed') : undefined
    };
  });
};

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
  const [statsLoading, setStatsLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);

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
  const [declineDialog, setDeclineDialog] = useState<{
    open: boolean;
    requestId: number;
  }>({
    open: false,
    requestId: 0,
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

  // Initialize with dummy data
  useEffect(() => {
    const dummyData = generateDummyData();
    setCancelRequests(dummyData);
    
    // Calculate stats from dummy data
    const pending = dummyData.filter(r => r.status === 'pending').length;
    const approved = dummyData.filter(r => r.status === 'approved').length;
    const declined = dummyData.filter(r => r.status === 'declined').length;
    const totalRefund = dummyData
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + (r.refundAmount || 0), 0);

    setStats({
      totalRequests: dummyData.length,
      pendingRequests: pending,
      approvedRequests: approved,
      declinedRequests: declined,
      totalRefundAmount: totalRefund,
      todayRequests: Math.floor(dummyData.length * 0.3),
      statusBreakdown: {
        pending,
        approved,
        declined
      }
    });

    setPagination({
      page: 1,
      limit: 20,
      total: dummyData.length,
      totalPages: Math.ceil(dummyData.length / 20),
      hasNext: dummyData.length > 20,
      hasPrev: false
    });
  }, []);

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
    const selectableRequests = cancelRequests.filter(
      (request) =>
        request.status !== 'declined' &&
        request.status !== 'approved' &&
        request.order?.seller === 'Self'
    );

    const selectableIds = selectableRequests.map((request) => request.id.toString());

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
      const newData = generateDummyData();
      setCancelRequests(newData);
      showToast('Cancel requests refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showToast('Error refreshing data. Please try again.', 'error');
    } finally {
      setStatsLoading(false);
      setRequestsLoading(false);
    }
  };

  // Handle request approval
  const handleApproveRequest = async (
    requestId: number,
    refundAmount: number,
    notes: string
  ) => {
    try {
      setCancelRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'approved' as const,
                refundAmount,
                adminNotes: notes,
                processedAt: new Date().toISOString(),
                processedBy: 'Admin'
              }
            : req
        )
      );

      showToast('Cancel request approved successfully', 'success');
      setApproveDialog({ open: false, requestId: 0, refundAmount: 0 });
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
  const handleDeclineRequest = async (requestId: number, reason: string) => {
    try {
      setCancelRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'declined' as const,
                adminNotes: reason,
                processedAt: new Date().toISOString(),
                processedBy: 'Admin'
              }
            : req
        )
      );

      showToast('Cancel request declined successfully', 'success');
      setDeclineDialog({ open: false, requestId: 0 });
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
    requestId: number,
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
  const openDeclineDialog = (requestId: number) => {
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  } requests...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
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
              <div className="flex flex-col md:flex-row items-center gap-2 py-4 border-b mb-4 w-full">
                <span className="text-sm md:w-auto" style={{ color: 'var(--text-muted)' }}>
                  {selectedRequests.length} selected
                </span>
                <select
                  className="w-full md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
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
                    className="btn btn-primary px-3 py-2.5 w-full md:w-auto mt-2 md:mt-0"
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
                          Link
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
                          Amount
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
                                    request.id.toString()
                                  )}
                                  onChange={() =>
                                    handleSelectRequest(request.id.toString())
                                  }
                                  className="rounded border-gray-300 w-4 h-4"
                                />
                              )}
                          </td>
                          
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{formatID(String(request.order.id).slice(-8))}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {request.user?.username ||
                                  request.user?.email?.split('@')[0] ||
                                  request.user?.name ||
                                  'Unknown'}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {request.user?.email || 'No email'}
                              </div>
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
                            <div className="max-w-32">
                              {request.order?.link ? (
                                <a
                                  href={request.order.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs truncate"
                                >
                                  <span className="truncate">{request.order.link}</span>
                                  <FaExternalLinkAlt className="h-3 w-3 flex-shrink-0" />
                                </a>
                              ) : (
                                <span className="text-gray-400 text-xs">No link</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {formatNumber(request.order?.qty || 0)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              ${formatPrice(request.order?.charge || 0, 2)}
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
                                          request.refundAmount || request.order?.charge || 0
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
                        className="card card-padding border-l-4 border-blue-500 mb-4"
                      >
                        {/* Header with ID and Status */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(request.id.toString())}
                              onChange={() => handleSelectRequest(request.id.toString())}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                            
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
                              {request.user?.username ||
                                request.user?.email?.split('@')[0] ||
                                request.user?.name ||
                                'Unknown'}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {request.user?.email || 'No email'}
                            </div>
                          </div>
                          <div
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              request.order?.seller === 'Auto'
                                ? 'bg-green-100 text-green-800'
                                : request.order?.seller === 'Manual'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {request.order?.seller || 'null'}
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
                        <div className="grid grid-cols-3 gap-4 mb-4">
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
                              {formatNumber(request.order?.qty || 0)}
                            </div>
                          </div>
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
                              ${formatPrice(request.order?.charge || 0, 2)}
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
                          </div>
                        </div>

                        {/* Link */}
                        <div className="mb-4">
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Link
                          </div>
                          {request.order?.link ? (
                            <a
                              href={request.order.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                            >
                              <span className="truncate">{request.order.link}</span>
                              <FaExternalLinkAlt className="h-3 w-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">No link provided</span>
                          )}
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
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
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
                              requestId: 0,
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
                                <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit mt-1">
                                  #{viewDialog.request.order.id}
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
                                  Amount
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
                                    viewDialog.request!.refundAmount || viewDialog.request!.order?.charge || 0
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
                            setDeclineDialog({ open: false, requestId: 0 });
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