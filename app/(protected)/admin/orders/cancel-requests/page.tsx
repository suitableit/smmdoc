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
    id: string;
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

  // Mock data for demonstration
  const mockCancelRequests: CancelRequest[] = [
    {
      id: 'CR001',
      order: {
        id: 'ORD123456789',
        service: {
          id: 'SRV001',
          name: 'Instagram Followers - High Quality',
          rate: 0.85
        },
        category: {
          id: 'CAT001',
          category_name: 'Instagram'
        },
        qty: 1000,
        price: 8.50,
        charge: 8.50,
        link: 'https://instagram.com/example_user',
        status: 'processing',
        createdAt: '2024-01-15T10:30:00Z',
        seller: 'API Provider 1'
      },
      user: {
        id: 'USR001',
        email: 'john.doe@example.com',
        name: 'John Doe',
        username: 'johndoe',
        currency: 'USD'
      },
      reason: 'Changed my mind about the order. No longer need these followers.',
      status: 'pending',
      requestedAt: '2024-01-16T14:25:00Z',
      refundAmount: 8.50
    },
    {
      id: 'CR002',
      order: {
        id: 'ORD987654321',
        service: {
          id: 'SRV002',
          name: 'YouTube Views - Worldwide',
          rate: 1.20
        },
        category: {
          id: 'CAT002',
          category_name: 'YouTube'
        },
        qty: 5000,
        price: 12.00,
        charge: 12.00,
        link: 'https://youtube.com/watch?v=example',
        status: 'completed',
        createdAt: '2024-01-10T08:15:00Z',
        seller: 'Self'
      },
      user: {
        id: 'USR002',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        username: 'janesmith',
        currency: 'USD'
      },
      reason: 'Service was delivered but quality is not as expected. Requesting partial refund.',
      status: 'approved',
      requestedAt: '2024-01-14T16:45:00Z',
      processedAt: '2024-01-15T09:30:00Z',
      processedBy: 'admin',
      refundAmount: 6.00,
      adminNotes: 'Approved partial refund for quality issues'
    },
    {
      id: 'CR003',
      order: {
        id: 'ORD456789123',
        service: {
          id: 'SRV003',
          name: 'TikTok Likes - Real Users',
          rate: 0.95
        },
        category: {
          id: 'CAT003',
          category_name: 'TikTok'
        },
        qty: 2500,
        price: 9.50,
        charge: 9.50,
        link: 'https://tiktok.com/@example_user',
        status: 'pending',
        createdAt: '2024-01-18T12:00:00Z',
        seller: 'API Provider 2'
      },
      user: {
        id: 'USR003',
        email: 'mike.wilson@example.com',
        name: 'Mike Wilson',
        username: 'mikew',
        currency: 'USD'
      },
      reason: 'Accidentally placed duplicate order. Want to cancel this one.',
      status: 'declined',
      requestedAt: '2024-01-18T15:20:00Z',
      processedAt: '2024-01-19T10:15:00Z',
      processedBy: 'admin',
      adminNotes: 'Order already in processing, cannot cancel'
    },
    {
      id: 'CR004',
      order: {
        id: 'ORD789123456',
        service: {
          id: 'SRV004',
          name: 'Facebook Page Likes - USA',
          rate: 1.50
        },
        category: {
          id: 'CAT004',
          category_name: 'Facebook'
        },
        qty: 750,
        price: 15.75,
        charge: 15.75,
        link: 'https://facebook.com/my-business-page',
        status: 'pending',
        createdAt: '2024-01-20T09:45:00Z',
        seller: 'Self'
      },
      user: {
        id: 'USR004',
        email: 'sarah.johnson@gmail.com',
        name: 'Sarah Johnson',
        username: 'sarahj',
        currency: 'USD'
      },
      reason: 'Business strategy changed. No longer need Facebook marketing.',
      status: 'pending',
      requestedAt: '2024-01-20T11:30:00Z',
      refundAmount: 15.75
    },
    {
      id: 'CR005',
      order: {
        id: 'ORD321654987',
        service: {
          id: 'SRV005',
          name: 'Twitter Followers - Premium',
          rate: 2.25
        },
        category: {
          id: 'CAT005',
          category_name: 'Twitter'
        },
        qty: 2000,
        price: 22.50,
        charge: 22.50,
        link: 'https://twitter.com/my_brand',
        status: 'in_progress',
        createdAt: '2024-01-12T14:20:00Z',
        seller: 'Social Media Pro'
      },
      user: {
        id: 'USR005',
        email: 'alex.brown@company.com',
        name: 'Alex Brown',
        username: 'alexbrown',
        currency: 'USD'
      },
      reason: 'Found a better service provider with lower rates.',
      status: 'pending',
      requestedAt: '2024-01-19T13:15:00Z',
      refundAmount: 22.50
    },
    {
      id: 'CR006',
      order: {
        id: 'ORD654987321',
        service: {
          id: 'SRV006',
          name: 'LinkedIn Connections - Professional',
          rate: 3.00
        },
        category: {
          id: 'CAT006',
          category_name: 'LinkedIn'
        },
        qty: 500,
        price: 30.00,
        charge: 30.00,
        link: 'https://linkedin.com/in/professional-profile',
        status: 'completed',
        createdAt: '2024-01-08T16:30:00Z',
        seller: 'Self'
      },
      user: {
        id: 'USR006',
        email: 'emily.davis@startup.io',
        name: 'Emily Davis',
        username: 'emilyd',
        currency: 'USD'
      },
      reason: 'Received connections but they are not relevant to my industry.',
      status: 'declined',
      requestedAt: '2024-01-16T10:45:00Z',
      processedAt: '2024-01-17T14:20:00Z',
      processedBy: 'admin',
      adminNotes: 'Service was delivered as specified. Cannot refund.'
    },
    {
      id: 'CR007',
      order: {
        id: 'ORD147258369',
        service: {
          id: 'SRV007',
          name: 'Spotify Playlist Followers',
          rate: 0.75
        },
        category: {
          id: 'CAT007',
          category_name: 'Spotify'
        },
        qty: 1500,
        price: 11.25,
        charge: 11.25,
        link: 'https://open.spotify.com/playlist/abc123',
        status: 'pending',
        createdAt: '2024-01-21T08:00:00Z',
        seller: 'Self'
      },
      user: {
        id: 'USR007',
        email: 'david.martinez@music.com',
        name: 'David Martinez',
        username: 'davidm',
        currency: 'USD'
      },
      reason: 'Decided to grow organically instead of using paid services.',
      status: 'pending',
      requestedAt: '2024-01-21T12:30:00Z',
      refundAmount: 11.25
    },
    {
      id: 'CR008',
      order: {
        id: 'ORD963852741',
        service: {
          id: 'SRV008',
          name: 'Discord Server Members',
          rate: 1.10
        },
        category: {
          id: 'CAT008',
          category_name: 'Discord'
        },
        qty: 300,
        price: 5.50,
        charge: 5.50,
        link: 'https://discord.gg/my-server',
        status: 'processing',
        createdAt: '2024-01-17T11:15:00Z',
        seller: 'Gaming Network API'
      },
      user: {
        id: 'USR008',
        email: 'taylor.wilson@gaming.net',
        name: 'Taylor Wilson',
        username: 'taylorw',
        currency: 'USD'
      },
      reason: 'Server was shut down due to lack of engagement.',
      status: 'approved',
      requestedAt: '2024-01-19T09:20:00Z',
      processedAt: '2024-01-20T15:45:00Z',
      processedBy: 'admin',
      refundAmount: 5.50,
      adminNotes: 'Approved due to server closure'
    }
  ];

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
      // In real implementation, this would be an API call
      // const response = await fetch('/api/admin/cancel-requests?limit=1000');
      // const result = await response.json();

      // For now, use mock data
      const allRequests = mockCancelRequests;
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
      setRequestsLoading(true); // Ensure loading state is set
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      // Simulate API loading delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 800));

      // In real implementation, this would be an API call
      // const response = await fetch(`/api/admin/cancel-requests?${queryParams}`);
      // const result = await response.json();

      // For now, filter mock data based on current filters
      let filteredRequests = mockCancelRequests;
      
      if (statusFilter !== 'all') {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
      }
      
      if (searchTerm) {
        filteredRequests = filteredRequests.filter(req => 
          req.order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setCancelRequests(filteredRequests);
      setPagination({
        page: 1,
        limit: 20,
        total: filteredRequests.length,
        totalPages: Math.ceil(filteredRequests.length / 20),
        hasNext: filteredRequests.length > 20,
        hasPrev: false,
      });
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
      // In real implementation, this would be an API call
      // const response = await fetch('/api/admin/cancel-requests/stats?period=all');
      // const result = await response.json();

      // For now, calculate from mock data
      const totalRefund = mockCancelRequests
        .filter(req => req.status === 'approved')
        .reduce((sum, req) => sum + (req.refundAmount || 0), 0);

      const statusBreakdown = calculateStatusCounts(mockCancelRequests);
      
      const processedStats = {
        totalRequests: mockCancelRequests.length,
        pendingRequests: statusBreakdown.pending,
        approvedRequests: statusBreakdown.approved,
        declinedRequests: statusBreakdown.declined,
        totalRefundAmount: totalRefund,
        todayRequests: mockCancelRequests.filter(req => 
          new Date(req.requestedAt).toDateString() === new Date().toDateString()
        ).length,
        statusBreakdown: statusBreakdown,
      };

      console.log('Processed Stats:', processedStats);
      setStats(processedStats);
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
    const selectableRequests = cancelRequests.filter(request => 
      request.status !== 'declined' && 
      request.status !== 'approved' && 
      request.order.seller === 'Self'
    );
    
    const selectableIds = selectableRequests.map(request => request.id);
    
    if (selectedRequests.length === selectableIds.length && selectableIds.length > 0) {
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

  const handleRefresh = () => {
    setRequestsLoading(true);
    fetchCancelRequests();
    fetchStats();
    fetchAllRequestsForCounts();
    showToast('Cancel requests refreshed successfully!', 'success');
  };

  // Handle request approval
  const handleApproveRequest = async (requestId: string, refundAmount: number, notes: string) => {
    try {
      // In real implementation, this would be an API call
      // const response = await fetch(`/api/admin/cancel-requests/${requestId}/approve`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ refundAmount, adminNotes: notes }),
      // });

      showToast('Cancel request approved successfully', 'success');
      fetchCancelRequests();
      fetchStats();
      setApproveDialog({ open: false, requestId: '', refundAmount: 0 });
      setNewRefundAmount('');
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving cancel request:', error);
      showToast('Error approving cancel request', 'error');
    }
  };

  // Handle request denial
  const handleDenyRequest = async (requestId: string, reason: string) => {
    try {
      // In real implementation, this would be an API call
      // const response = await fetch(`/api/admin/cancel-requests/${requestId}/deny`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ adminNotes: reason }),
      // });

      showToast('Cancel request denied', 'success');
      fetchCancelRequests();
      fetchStats();
      setDenyDialog({ open: false, requestId: '' });
      setDenyReason('');
    } catch (error) {
      console.error('Error denying cancel request:', error);
      showToast('Error denying cancel request', 'error');
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

      <div className="page-content">


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
                              #{formatID(request.order.id.slice(-8))}
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

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {cancelRequests.map((request) => (
                      <div key={request.id} className="card card-padding border-l-4 border-purple-500 mb-4">
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
                              #{formatID(request.id)}
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
                                console.log('View request details:', request);
                              }}
                            >
                              <FaEye className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Order and User Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              Order ID
                            </div>
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">
                              #{formatID(request.order.id.slice(-8))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              User
                            </div>
                            <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                              {request.user.username || request.user.email.split('@')[0]}
                            </div>
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="mb-4">
                          <div className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                            {request.order.service.name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {request.order.category.category_name} • Seller: {request.order.seller || 'null'}
                          </div>
                        </div>

                        {/* Financial Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              Charge
                            </div>
                            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              ${formatPrice(request.order.charge, 2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(request.order.qty)} qty
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              Requested
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(request.requestedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 pb-6 border-t">
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {requestsLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading pagination...</span>
                      </div>
                    ) : (
                      `Showing ${formatNumber((pagination.page - 1) * pagination.limit + 1)} to ${formatNumber(Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      ))} of ${formatNumber(pagination.total)} requests`
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={!pagination.hasPrev || requestsLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {requestsLoading ? (
                        <GradientSpinner size="w-4 h-4" />
                      ) : (
                        `Page ${formatNumber(pagination.page)} of ${formatNumber(pagination.totalPages)}`
                      )}
                    </span>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
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
                      <h3 className="text-lg font-semibold mb-4">Approve Cancel Request</h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">Refund Amount</label>
                        <input
                          type="number"
                          value={newRefundAmount}
                          onChange={(e) => setNewRefundAmount(e.target.value)}
                          className="form-field w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-gray-900 transition-all duration-200"
                          placeholder="Enter refund amount"
                          step="0.01"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label mb-2">Admin Notes (Optional)</label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="form-field w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-gray-900 transition-all duration-200"
                          placeholder="Add any notes about the approval..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setApproveDialog({ open: false, requestId: '', refundAmount: 0 });
                            setNewRefundAmount('');
                            setAdminNotes('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleApproveRequest(approveDialog.requestId, parseFloat(newRefundAmount) || 0, adminNotes)}
                          className="btn btn-success"
                        >
                          Approve & Process Refund
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Details Dialog */}
                {viewDialog.open && viewDialog.request && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Cancel Request Details</h3>
                        <button
                          onClick={() => setViewDialog({ open: false, request: null })}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaTimes className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Request Info */}
                      <div className="mb-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Request ID</label>
                            <div className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded w-fit mt-1">
                              #{formatID(viewDialog.request.id)}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
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
                            <label className="text-sm font-medium text-gray-600">Requested</label>
                            <div className="text-sm text-gray-900 mt-1">
                              {new Date(viewDialog.request.requestedAt).toLocaleDateString()} at {new Date(viewDialog.request.requestedAt).toLocaleTimeString()}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">User</label>
                            <div className="text-sm text-gray-900 mt-1">
                              {viewDialog.request.user.username || viewDialog.request.user.email.split('@')[0]} ({viewDialog.request.user.email})
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold mb-4 text-gray-800">Order Summary</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Order ID</label>
                              <div className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit mt-1">
                                #{formatID(viewDialog.request.order.id.slice(-8))}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Order Status</label>
                              <div className="text-sm text-gray-900 mt-1 capitalize">
                                {viewDialog.request.order.status}
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Service</label>
                            <div className="text-sm text-gray-900 mt-1">
                              {viewDialog.request.order.service.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Category: {viewDialog.request.order.category.category_name} • Seller: {viewDialog.request.order.seller || 'N/A'}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Quantity</label>
                              <div className="text-sm text-gray-900 mt-1">
                                {formatNumber(viewDialog.request.order.qty)}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Charge</label>
                              <div className="text-sm text-gray-900 mt-1">
                                ${formatPrice(viewDialog.request.order.charge, 2)}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Order Link</label>
                            <div className="text-sm mt-1">
                              <a
                                href={viewDialog.request.order.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 break-all"
                              >
                                {viewDialog.request.order.link}
                              </a>
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-600">Order Created</label>
                            <div className="text-sm text-gray-900 mt-1">
                              {new Date(viewDialog.request.order.createdAt).toLocaleDateString()} at {new Date(viewDialog.request.order.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold mb-3 text-gray-800">Cancel Reason</h4>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                          <div className="text-sm text-gray-900">
                            {viewDialog.request.reason}
                          </div>
                        </div>
                      </div>

                      {/* Admin Notes (if processed) */}
                      {viewDialog.request.adminNotes && (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold mb-3 text-gray-800">Admin Notes</h4>
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <div className="text-sm text-gray-900">
                              {viewDialog.request.adminNotes}
                            </div>
                            {viewDialog.request.processedAt && (
                              <div className="text-xs text-gray-500 mt-2">
                                Processed on {new Date(viewDialog.request.processedAt).toLocaleDateString()} at {new Date(viewDialog.request.processedAt).toLocaleTimeString()}
                                {viewDialog.request.processedBy && ` by ${viewDialog.request.processedBy}`}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {viewDialog.request.status === 'pending' && viewDialog.request.order.seller === 'Self' && (
                        <div className="flex gap-3 justify-end pt-4 border-t">
                          <button
                            onClick={() => {
                              setViewDialog({ open: false, request: null });
                              openDenyDialog(viewDialog.request!.id);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                          >
                            <FaTimesCircle />
                            Decline
                          </button>
                          <button
                            onClick={() => {
                              setViewDialog({ open: false, request: null });
                              openApproveDialog(viewDialog.request!.id, viewDialog.request!.refundAmount || 0);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                          >
                            <FaCheckCircle />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Deny Dialog */}
                {denyDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">Deny Cancel Request</h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">Reason for Denial</label>
                        <textarea
                          value={denyReason}
                          onChange={(e) => setDenyReason(e.target.value)}
                          className="form-field w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm text-gray-900 transition-all duration-200"
                          placeholder="Explain why this cancel request is being denied..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setDenyDialog({ open: false, requestId: '' });
                            setDenyReason('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDenyRequest(denyDialog.requestId, denyReason)}
                          className="btn btn-danger"
                          disabled={!denyReason.trim()}
                        >
                          Deny Request
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