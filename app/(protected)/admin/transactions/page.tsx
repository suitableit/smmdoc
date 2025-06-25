'use client';

import React, { useEffect, useState } from 'react';
import {
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaEllipsisH,
  FaExclamationCircle,
  FaEye,
  FaSearch,
  FaSync,
  FaTimes,
  FaTimesCircle,
  FaEdit,
  FaPhone,
  FaUser
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
interface Transaction {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    username?: string;
  };
  transactionId: string;
  amount: number;
  currency: string;
  phone: string;
  method: string; // bkash, nagad, rocket, card, etc.
  type: 'deposit' | 'withdrawal' | 'refund' | 'payment';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  admin_status: 'pending' | 'Success' | 'Cancelled' | 'Suspicious';
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

interface TransactionStats {
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  todayTransactions: number;
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

const AdminAllTransactionsPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `All Transactions — ${APP_NAME}`;
  }, []);

  // 🎬 DEMO DATA - Replace with API calls when backend is ready
  // This component currently uses dummy data for demonstration purposes

  // Dummy data for testing
  const dummyTransactions: Transaction[] = [
    {
      id: 'txn_001',
      user: {
        id: 'user_001',
        email: 'john.doe@example.com',
        name: 'John Doe',
        username: 'johndoe',
      },
      transactionId: 'TXN202401001',
      amount: 500,
      currency: 'BDT',
      phone: '+8801712345678',
      method: 'bkash',
      type: 'deposit',
      status: 'pending',
      admin_status: 'Pending',
      reference: 'BKS123456789',
      notes: 'Initial deposit by new user',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'txn_002',
      user: {
        id: 'user_002',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        username: 'janesmith',
      },
      transactionId: 'TXN202401002',
      amount: 1000,
      currency: 'BDT',
      phone: '+8801887654321',
      method: 'nagad',
      type: 'deposit',
      status: 'completed',
      admin_status: 'Success',
      reference: 'NGD987654321',
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-14T16:00:00Z',
      processedAt: '2024-01-14T16:00:00Z',
    },
    {
      id: 'txn_003',
      user: {
        id: 'user_003',
        email: 'alex.johnson@example.com',
        name: 'Alex Johnson',
        username: 'alexj',
      },
      transactionId: 'TXN202401003',
      amount: 250,
      currency: 'USD',
      phone: '+8801555123456',
      method: 'rocket',
      type: 'withdrawal',
      status: 'cancelled',
      admin_status: 'Cancelled',
      reference: 'RKT456789123',
      notes: 'Cancelled due to insufficient verification',
      createdAt: '2024-01-13T09:20:00Z',
      updatedAt: '2024-01-13T09:35:00Z',
    },
    {
      id: 'txn_004',
      user: {
        id: 'user_004',
        email: 'sarah.wilson@example.com',
        name: 'Sarah Wilson',
        username: 'sarahw',
      },
      transactionId: 'TXN202401004',
      amount: 750,
      currency: 'BDT',
      phone: '+8801666789012',
      method: 'bkash',
      type: 'deposit',
      status: 'processing',
      admin_status: 'Pending',
      reference: 'BKS789012345',
      createdAt: '2024-01-12T14:10:00Z',
      updatedAt: '2024-01-12T14:10:00Z',
    },
    {
      id: 'txn_005',
      user: {
        id: 'user_005',
        email: 'mike.brown@example.com',
        name: 'Mike Brown',
        username: 'mikeb',
      },
      transactionId: 'TXN202401005',
      amount: 2000,
      currency: 'BDT',
      phone: '+8801777345678',
      method: 'card',
      type: 'deposit',
      status: 'failed',
      admin_status: 'Suspicious',
      reference: 'CARD123789456',
      notes: 'Flagged for manual review - unusual activity pattern',
      createdAt: '2024-01-11T11:25:00Z',
      updatedAt: '2024-01-11T11:40:00Z',
    },
    {
      id: 'txn_006',
      user: {
        id: 'user_006',
        email: 'emma.davis@example.com',
        name: 'Emma Davis',
        username: 'emmad',
      },
      transactionId: 'TXN202401006',
      amount: 300,
      currency: 'USD',
      phone: '+8801888456789',
      method: 'nagad',
      type: 'refund',
      status: 'completed',
      admin_status: 'Success',
      reference: 'NGD654321987',
      notes: 'Refund for cancelled order #ORD123',
      createdAt: '2024-01-10T16:30:00Z',
      updatedAt: '2024-01-10T16:45:00Z',
      processedAt: '2024-01-10T16:45:00Z',
    },
    {
      id: 'txn_007',
      user: {
        id: 'user_007',
        email: 'david.lee@example.com',
        name: 'David Lee',
        username: 'davidl',
      },
      transactionId: 'TXN202401007',
      amount: 1500,
      currency: 'BDT',
      phone: '+8801999567890',
      method: 'rocket',
      type: 'payment',
      status: 'completed',
      admin_status: 'Success',
      reference: 'RKT321654987',
      createdAt: '2024-01-09T13:15:00Z',
      updatedAt: '2024-01-09T13:30:00Z',
      processedAt: '2024-01-09T13:30:00Z',
    },
    {
      id: 'txn_008',
      user: {
        id: 'user_008',
        email: 'lisa.garcia@example.com',
        name: 'Lisa Garcia',
        username: 'lisag',
      },
      transactionId: 'TXN202401008',
      amount: 850,
      currency: 'BDT',
      phone: '+8801111234567',
      method: 'bkash',
      type: 'deposit',
      status: 'pending',
      admin_status: 'Pending',
      reference: 'BKS567890123',
      notes: 'Waiting for payment confirmation',
      createdAt: '2024-01-08T08:45:00Z',
      updatedAt: '2024-01-08T08:45:00Z',
    },
    {
      id: 'txn_009',
      user: {
        id: 'user_009',
        email: 'chris.martinez@example.com',
        name: 'Chris Martinez',
        username: 'chrism',
      },
      transactionId: 'TXN202401009',
      amount: 400,
      currency: 'USD',
      phone: '+8801222345678',
      method: 'card',
      type: 'withdrawal',
      status: 'processing',
      admin_status: 'Pending',
      reference: 'CARD789456123',
      createdAt: '2024-01-07T12:20:00Z',
      updatedAt: '2024-01-07T12:20:00Z',
    },
    {
      id: 'txn_010',
      user: {
        id: 'user_010',
        email: 'anna.robinson@example.com',
        name: 'Anna Robinson',
        username: 'annar',
      },
      transactionId: 'TXN202401010',
      amount: 1200,
      currency: 'BDT',
      phone: '+8801333456789',
      method: 'nagad',
      type: 'deposit',
      status: 'completed',
      admin_status: 'Success',
      reference: 'NGD147258369',
      notes: 'Large deposit - verified manually',
      createdAt: '2024-01-06T17:10:00Z',
      updatedAt: '2024-01-06T17:25:00Z',
      processedAt: '2024-01-06T17:25:00Z',
    },
  ];

  // State management
  const [transactions, setTransactions] = useState<Transaction[]>(dummyTransactions);
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 10,
    pendingTransactions: 3,
    completedTransactions: 5,
    failedTransactions: 1,
    totalVolume: 8750,
    todayTransactions: 2,
    statusBreakdown: {
      pending: 3,
      completed: 5,
      failed: 1,
      cancelled: 1,
      processing: 0,
      Success: 5,
      Pending: 3,
      Cancelled: 1,
      Suspicious: 1,
    },
  });

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // New state for action modals
  const [viewDetailsDialog, setViewDetailsDialog] = useState<{
    open: boolean;
    transaction: Transaction | null;
  }>({
    open: false,
    transaction: null,
  });

  const [updateStatusDialog, setUpdateStatusDialog] = useState<{
    open: boolean;
    transactionId: string;
    currentStatus: string;
  }>({
    open: false,
    transactionId: '',
    currentStatus: '',
  });
  const [newStatus, setNewStatus] = useState('');

  const [bulkStatusDialog, setBulkStatusDialog] = useState<{
    open: boolean;
  }>({
    open: false,
  });
  const [bulkStatus, setBulkStatus] = useState('');

  const [addNotesDialog, setAddNotesDialog] = useState<{
    open: boolean;
    transactionId: string;
    currentNotes: string;
  }>({
    open: false,
    transactionId: '',
    currentNotes: '',
  });
  const [newNotes, setNewNotes] = useState('');

  // Calculate status counts from current transactions data
  const calculateStatusCounts = (transactionsData: Transaction[]) => {
    const counts = {
      pending: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      processing: 0,
    };

    transactionsData.forEach((transaction) => {
      if (transaction.status && counts.hasOwnProperty(transaction.status)) {
        counts[transaction.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  // Fetch all transactions to calculate real status counts
  const fetchAllTransactionsForCounts = async () => {
    try {
      // Using dummy data for demo purposes
      // Uncomment below lines when API is ready
      /*
      console.log('Fetching all transactions for status counts...');
      const response = await fetch('/api/admin/transactions?limit=1000');
      const result = await response.json();

      if (result.success && result.data) {
        const allTransactions = result.data;
        const statusCounts = calculateStatusCounts(allTransactions);

        console.log('Calculated status counts:', statusCounts);

        setStats((prev) => ({
          ...prev,
          pendingTransactions: statusCounts.pending,
          completedTransactions: statusCounts.completed,
          failedTransactions: statusCounts.failed,
          statusBreakdown: {
            ...prev.statusBreakdown,
            pending: statusCounts.pending,
            completed: statusCounts.completed,
            failed: statusCounts.failed,
            cancelled: statusCounts.cancelled,
            processing: statusCounts.processing,
          },
        }));
      }
      */
      
      // Demo: Calculate from dummy data
      const statusCounts = calculateStatusCounts(dummyTransactions);
      
      setStats((prev) => ({
        ...prev,
        pendingTransactions: statusCounts.pending,
        completedTransactions: statusCounts.completed,
        failedTransactions: statusCounts.failed,
        statusBreakdown: {
          ...prev.statusBreakdown,
          pending: statusCounts.pending,
          completed: statusCounts.completed,
          failed: statusCounts.failed,
          cancelled: statusCounts.cancelled,
          processing: statusCounts.processing,
        },
      }));
    } catch (error) {
      console.error('Error fetching transactions for counts:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Using dummy data for demo purposes
      // Uncomment below lines when API is ready
      /*
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/transactions?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data || []);
        setPagination(
          result.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          }
        );
      } else {
        toast && showToast(result.error || 'Failed to fetch transactions', 'error');
        setTransactions([]);
      }
      */
      
      // Demo: Filter dummy data based on current filters
      let filteredTransactions = dummyTransactions;
      
      if (statusFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => 
          t.admin_status === statusFilter || t.status === statusFilter
        );
      }
      
      if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
      }
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filteredTransactions = filteredTransactions.filter(t =>
          t.transactionId.toLowerCase().includes(search) ||
          t.phone?.toLowerCase().includes(search) ||
          t.user?.username?.toLowerCase().includes(search) ||
          t.user?.email?.toLowerCase().includes(search)
        );
      }
      
      setTransactions(filteredTransactions);
      setPagination(prev => ({
        ...prev,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / prev.limit),
      }));
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast('Error fetching transactions', 'error');
      setTransactions([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Using dummy stats for demo purposes
      // Uncomment below lines when API is ready
      /*
      console.log('Fetching stats from API...');
      const response = await fetch('/api/admin/transactions/stats?period=all');
      console.log('Stats API response status:', response.status);

      const result = await response.json();
      console.log('Stats API full response:', result);

      if (result.success) {
        const data = result.data;
        console.log('Stats API data:', data);

        const statusBreakdown: Record<string, number> = {};
        if (data.statusBreakdown && Array.isArray(data.statusBreakdown)) {
          data.statusBreakdown.forEach((item: any) => {
            statusBreakdown[item.status] = item.count || 0;
          });
        }

        const processedStats = {
          totalTransactions: data.overview?.totalTransactions || pagination.total,
          pendingTransactions: statusBreakdown.pending || 0,
          completedTransactions: statusBreakdown.completed || 0,
          failedTransactions: statusBreakdown.failed || 0,
          totalVolume: data.overview?.totalVolume || 0,
          todayTransactions: data.dailyTrends?.[0]?.transactions || 0,
          statusBreakdown: statusBreakdown,
        };

        console.log('Processed Stats:', processedStats);
        setStats(processedStats);
      } else {
        console.error('Stats API error:', result.error);
      }
      */
      
      // Demo: Calculate stats from dummy data
      const totalTransactions = dummyTransactions.length;
      const pendingCount = dummyTransactions.filter(t => 
        t.admin_status === 'Pending' || t.status === 'pending'
      ).length;
      const successCount = dummyTransactions.filter(t => 
        t.admin_status === 'Success' || t.status === 'completed'
      ).length;
      const failedCount = dummyTransactions.filter(t => 
        t.admin_status === 'Suspicious' || t.status === 'failed'
      ).length;
      const totalVolume = dummyTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      setStats({
        totalTransactions,
        pendingTransactions: pendingCount,
        completedTransactions: successCount,
        failedTransactions: failedCount,
        totalVolume,
        todayTransactions: 2,
        statusBreakdown: {
          pending: pendingCount,
          completed: successCount,
          failed: failedCount,
          cancelled: dummyTransactions.filter(t => t.admin_status === 'Cancelled').length,
          processing: dummyTransactions.filter(t => t.status === 'processing').length,
          Success: successCount,
          Pending: pendingCount,
          Cancelled: dummyTransactions.filter(t => t.admin_status === 'Cancelled').length,
          Suspicious: dummyTransactions.filter(t => t.admin_status === 'Suspicious').length,
        },
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactionsLoading(true);
      fetchTransactions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data on component mount and when filters change
  useEffect(() => {
    setTransactionsLoading(true);
    fetchTransactions();
  }, [pagination.page, pagination.limit, statusFilter, typeFilter]);

  useEffect(() => {
    fetchStats();
    fetchAllTransactionsForCounts();
    
    // No loading delay needed for demo data
    setStatsLoading(false);
  }, []);

  // Update stats when pagination data changes
  useEffect(() => {
    if (pagination.total > 0) {
      setStats((prev) => ({
        ...prev,
        totalTransactions: pagination.total,
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

  // Handle transaction approval
  const handleApprove = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/funds/${transactionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Update local state to reflect the change
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction.id === transactionId
              ? { ...transaction, admin_status: 'Success', status: 'completed' }
              : transaction
          )
        );

        showToast('Transaction approved successfully!', 'success');
        fetchStats();
        fetchAllTransactionsForCounts();
      } else {
        showToast(result.error || 'Failed to approve transaction', 'error');
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      showToast('Error approving transaction', 'error');
    }
  };

  // Handle transaction cancellation
  const handleCancel = async (transactionId: string) => {
    if (!confirm('Are you sure you want to cancel this transaction? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/funds/${transactionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Update local state to reflect the change
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction.id === transactionId
              ? { ...transaction, admin_status: 'Cancelled', status: 'cancelled' }
              : transaction
          )
        );

        showToast('Transaction cancelled successfully!', 'success');
        fetchStats();
        fetchAllTransactionsForCounts();
      } else {
        showToast(result.error || 'Failed to cancel transaction', 'error');
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      showToast('Error cancelling transaction', 'error');
    }
  };

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'Pending':
        return <FaClock className="h-3 w-3 text-yellow-500" />;
      case 'processing':
        return <FaSync className="h-3 w-3 text-blue-500" />;
      case 'completed':
      case 'Success':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'cancelled':
      case 'Cancelled':
        return <FaTimesCircle className="h-3 w-3 text-red-500" />;
      case 'failed':
        return <FaTimesCircle className="h-3 w-3 text-gray-500" />;
      case 'Suspicious':
        return <FaExclamationCircle className="h-3 w-3 text-purple-500" />;
      default:
        return <FaClock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full w-fit">
            <FaCheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs font-medium text-green-700">Success</span>
          </div>
        );
      case 'Pending':
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full w-fit">
            <FaClock className="h-3 w-3 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-700">Pending</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full w-fit">
            <FaSync className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium text-blue-700">Processing</span>
          </div>
        );
      case 'Cancelled':
      case 'cancelled':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full w-fit">
            <FaTimesCircle className="h-3 w-3 text-red-500" />
            <span className="text-xs font-medium text-red-700">Cancelled</span>
          </div>
        );
      case 'Suspicious':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full w-fit">
            <FaExclamationCircle className="h-3 w-3 text-purple-500" />
            <span className="text-xs font-medium text-purple-700">Suspicious</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit">
            <FaClock className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">{status}</span>
          </div>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-800';
      case 'withdrawal':
        return 'bg-red-100 text-red-800';
      case 'refund':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return 'bg-pink-100 text-pink-800';
      case 'nagad':
        return 'bg-orange-100 text-orange-800';
      case 'rocket':
        return 'bg-purple-100 text-purple-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map((transaction) => transaction.id));
    }
  };

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleRefresh = () => {
    setTransactionsLoading(true);
    fetchTransactions();
    fetchStats();
    fetchAllTransactionsForCounts();
    showToast('Transactions refreshed successfully!', 'success');
  };

  // Handle transaction status update
  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(`Transaction status updated to ${newStatus}`, 'success');
        fetchTransactions();
        fetchStats();
        fetchAllTransactionsForCounts();
      } else {
        showToast(result.error || 'Failed to update transaction status', 'error');
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      showToast('Error updating transaction status', 'error');
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch('/api/admin/transactions/bulk/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transactionIds: selectedTransactions,
          status: newStatus 
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(`${selectedTransactions.length} transactions status updated to ${newStatus}`, 'success');
        fetchTransactions();
        fetchStats();
        fetchAllTransactionsForCounts();
        setSelectedTransactions([]);
        setBulkStatusDialog({ open: false });
        setBulkStatus('');
      } else {
        showToast(result.error || 'Failed to update transactions status', 'error');
      }
    } catch (error) {
      console.error('Error updating transactions status:', error);
      showToast('Error updating transactions status', 'error');
    }
  };

  // Handle add notes
  const handleAddNotes = async (transactionId: string, notes: string) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: notes }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('Notes updated successfully', 'success');
        fetchTransactions();
        setAddNotesDialog({ open: false, transactionId: '', currentNotes: '' });
        setNewNotes('');
      } else {
        showToast(result.error || 'Failed to update notes', 'error');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      showToast('Error updating notes', 'error');
    }
  };

  // Open dialog functions
  const openViewDetailsDialog = (transaction: Transaction) => {
    setViewDetailsDialog({ open: true, transaction });
  };

  const openUpdateStatusDialog = (transactionId: string, currentStatus: string) => {
    setUpdateStatusDialog({ open: true, transactionId, currentStatus });
    setNewStatus(currentStatus);
  };

  const openBulkStatusDialog = () => {
    setBulkStatusDialog({ open: true });
    setBulkStatus('');
  };

  const openAddNotesDialog = (transactionId: string, currentNotes: string) => {
    setAddNotesDialog({ open: true, transactionId, currentNotes });
    setNewNotes(currentNotes);
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
              {/* Page View Dropdown */}
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
                disabled={transactionsLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={transactionsLoading || statsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            
            {/* Right: Search and Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="refund">Refund</option>
                <option value="payment">Payment</option>
              </select>

              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${statusFilter === 'all' ? 'all' : statusFilter} transactions...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
              
              <select className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="id">Transaction ID</option>
                <option value="phone">Phone Number</option>
                <option value="username">Username</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
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
                    {stats.totalTransactions}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Pending'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pending
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Pending'
                        ? 'bg-white/20'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {stats.pendingTransactions}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('processing')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'processing'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Processing
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'processing'
                        ? 'bg-white/20'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {stats.statusBreakdown?.processing || 0}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Success')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Success'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Success
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Success'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {stats.completedTransactions}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('failed')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'failed'
                      ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Failed
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'failed'
                        ? 'bg-white/20'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stats.failedTransactions}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Cancelled')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Cancelled'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancelled
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Cancelled'
                        ? 'bg-white/20'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {stats.statusBreakdown?.cancelled || 0}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Suspicious')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Suspicious'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Suspicious
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Suspicious'
                        ? 'bg-white/20'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {stats.statusBreakdown?.Suspicious || 0}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {/* Selected Transactions Actions */}
            {selectedTransactions.length > 0 && (
              <div className="flex items-center gap-2 py-4 border-b mb-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {selectedTransactions.length} selected
                </span>
                <button 
                  onClick={openBulkStatusDialog}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FaEdit />
                  Change All Status
                </button>
              </div>
            )}

            {transactionsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">Loading transactions...</div>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <FaCreditCard
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No transactions found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No transactions match your current filters or no transactions exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[1200px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedTransactions.length === transactions.length &&
                              transactions.length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
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
                          User
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
                          Phone
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
                          Type
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Date
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
                      {transactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(transaction.id)}
                              onChange={() => handleSelectTransaction(transaction.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{transaction.id ? formatID(transaction.id.slice(-8)) : 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.user?.username ||
                                transaction.user?.email?.split('@')[0] ||
                                transaction.user?.name ||
                                'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded max-w-32 truncate">
                              {transaction.transactionId || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-right">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {transaction.currency === 'BDT' ? '৳' : '$'}
                                {formatPrice(transaction.amount, 2)}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className="text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.phone || 'null'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded capitalize ${getMethodColor(transaction.method || '')}`}
                            >
                              {transaction.method || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded capitalize ${getTypeColor(transaction.type)}`}
                            >
                              {transaction.type}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="text-xs"
                              >
                                {transaction.createdAt
                                  ? new Date(transaction.createdAt).toLocaleDateString()
                                  : 'null'}
                              </div>
                              <div
                                className="text-xs"
                              >
                                {transaction.createdAt
                                  ? new Date(transaction.createdAt).toLocaleTimeString()
                                  : 'null'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {getStatusBadge(transaction.admin_status || transaction.status)}
                          </td>
                          <td className="p-3">
                            {(transaction.admin_status === 'Pending' || transaction.admin_status === 'pending' || 
                              (!transaction.admin_status && transaction.status === 'pending')) ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(transaction.id)}
                                  className="btn btn-primary flex items-center gap-1 px-3 py-1.5 text-xs bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20"
                                  title="Approve transaction and add funds to user account"
                                >
                                  <FaCheckCircle className="h-3 w-3" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleCancel(transaction.id)}
                                  className="btn btn-secondary flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20"
                                  title="Cancel transaction and notify user"
                                >
                                  <FaTimesCircle className="h-3 w-3" />
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="relative">
                                  <button
                                    className="btn btn-secondary p-2"
                                    title="More Actions"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const dropdown = e.currentTarget
                                        .nextElementSibling as HTMLElement;
                                      dropdown.classList.toggle('hidden');
                                    }}
                                  >
                                    <FaEllipsisH className="h-3 w-3" />
                                  </button>

                                  <div className="hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          openViewDetailsDialog(transaction);
                                          const dropdown = document.querySelector(
                                            '.absolute.right-0'
                                          ) as HTMLElement;
                                          dropdown?.classList.add('hidden');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FaEye className="h-3 w-3" />
                                        View Details
                                      </button>
                                      <button
                                        onClick={() => {
                                          openUpdateStatusDialog(
                                            transaction.id,
                                            transaction.status
                                          );
                                          const dropdown = document.querySelector(
                                            '.absolute.right-0'
                                          ) as HTMLElement;
                                          dropdown?.classList.add('hidden');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FaSync className="h-3 w-3" />
                                        Update Status
                                      </button>
                                      <button
                                        onClick={() => {
                                          openAddNotesDialog(
                                            transaction.id,
                                            transaction.notes || ''
                                          );
                                          const dropdown = document.querySelector(
                                            '.absolute.right-0'
                                          ) as HTMLElement;
                                          dropdown?.classList.add('hidden');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FaEdit className="h-3 w-3" />
                                        Add Notes
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="card card-padding border-l-4 border-blue-500 mb-4"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(transaction.id)}
                              onChange={() => handleSelectTransaction(transaction.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{transaction.id ? formatID(transaction.id.slice(-8)) : 'null'}
                            </div>
                            {getStatusBadge(transaction.admin_status || transaction.status)}
                          </div>
                          <div className="flex items-center">
                            {(transaction.admin_status === 'Pending' || transaction.admin_status === 'pending' || 
                              (!transaction.admin_status && transaction.status === 'pending')) ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(transaction.id)}
                                  className="btn btn-primary flex items-center gap-1 px-2 py-1 text-xs bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20"
                                  title="Approve transaction"
                                >
                                  <FaCheckCircle className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleCancel(transaction.id)}
                                  className="btn btn-secondary flex items-center gap-1 px-2 py-1 text-xs bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20"
                                  title="Cancel transaction"
                                >
                                  <FaTimesCircle className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="relative">
                                <button
                                  className="btn btn-secondary p-2"
                                  title="More Actions"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.currentTarget
                                      .nextElementSibling as HTMLElement;
                                    dropdown.classList.toggle('hidden');
                                  }}
                                >
                                  <FaEllipsisH className="h-3 w-3" />
                                </button>

                                <div className="hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        openViewDetailsDialog(transaction);
                                        const dropdown = document.querySelector(
                                          '.absolute.right-0'
                                        ) as HTMLElement;
                                        dropdown?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaEye className="h-3 w-3" />
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => {
                                        openUpdateStatusDialog(
                                          transaction.id,
                                          transaction.status
                                        );
                                        const dropdown = document.querySelector(
                                          '.absolute.right-0'
                                        ) as HTMLElement;
                                        dropdown?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaSync className="h-3 w-3" />
                                      Update Status
                                    </button>
                                    <button
                                      onClick={() => {
                                        openAddNotesDialog(
                                          transaction.id,
                                          transaction.notes || ''
                                        );
                                        const dropdown = document.querySelector(
                                          '.absolute.right-0'
                                        ) as HTMLElement;
                                        dropdown?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaEdit className="h-3 w-3" />
                                      Add Notes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* User and Transaction Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
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
                              {transaction.user?.username ||
                                transaction.user?.email?.split('@')[0] ||
                                transaction.user?.name ||
                                'null'}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Transaction ID
                            </div>
                            <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded w-fit">
                              {transaction.transactionId || 'null'}
                            </div>
                          </div>
                        </div>

                        {/* Amount and Payment Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Amount
                            </div>
                            <div
                              className="font-semibold text-lg"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.currency === 'BDT' ? '৳' : '$'}
                              {formatPrice(transaction.amount, 2)}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Method
                            </div>
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded capitalize w-fit ${getMethodColor(transaction.method || '')}`}
                            >
                              {transaction.method || 'null'}
                            </div>
                          </div>
                        </div>

                        {/* Phone and Type */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Phone
                            </div>
                            <div className="flex items-center gap-1">
                              <FaPhone className="h-3 w-3 text-gray-400" />
                              <span
                                className="text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {transaction.phone || 'null'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Type
                            </div>
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded capitalize w-fit ${getTypeColor(transaction.type)}`}
                            >
                              {transaction.type}
                            </div>
                          </div>
                        </div>

                        {/* Date */}
                        <div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Date:{' '}
                            {transaction.createdAt
                              ? new Date(transaction.createdAt).toLocaleDateString()
                              : 'null'}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Time:{' '}
                            {transaction.createdAt
                              ? new Date(transaction.createdAt).toLocaleTimeString()
                              : 'null'}
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
                    {transactionsLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading pagination...</span>
                      </div>
                    ) : (
                      `Showing ${formatNumber((pagination.page - 1) * pagination.limit + 1)} to ${formatNumber(Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      ))} of ${formatNumber(pagination.total)} transactions`
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
                      disabled={!pagination.hasPrev || transactionsLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {transactionsLoading ? (
                        <GradientSpinner size="w-4 h-4" />
                      ) : (
                        `Page ${formatNumber(pagination.page)} of ${formatNumber(pagination.totalPages)}`
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={!pagination.hasNext || transactionsLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* View Details Dialog */}
                {viewDetailsDialog.open && viewDetailsDialog.transaction && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] mx-4 max-h-[80vh] overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaEye />
                        Transaction Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                            <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                              {viewDetailsDialog.transaction.transactionId}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Internal ID</label>
                            <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                              #{formatID(viewDetailsDialog.transaction.id)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">User</label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {viewDetailsDialog.transaction.user?.username || 
                               viewDetailsDialog.transaction.user?.email || 
                               'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {viewDetailsDialog.transaction.phone || 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Amount</label>
                            <div className="text-sm bg-gray-50 p-2 rounded font-semibold">
                              {viewDetailsDialog.transaction.currency === 'BDT' ? '৳' : '$'}
                              {formatPrice(viewDetailsDialog.transaction.amount, 2)}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Type</label>
                            <div className={`text-xs font-medium px-2 py-2 rounded capitalize ${getTypeColor(viewDetailsDialog.transaction.type)}`}>
                              {viewDetailsDialog.transaction.type}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Method</label>
                            <div className={`text-xs font-medium px-2 py-2 rounded capitalize ${getMethodColor(viewDetailsDialog.transaction.method || '')}`}>
                              {viewDetailsDialog.transaction.method || 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Status</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(viewDetailsDialog.transaction.admin_status || viewDetailsDialog.transaction.status)}
                            <span className="text-sm font-medium capitalize">
                              {viewDetailsDialog.transaction.admin_status || viewDetailsDialog.transaction.status}
                            </span>
                          </div>
                        </div>

                        {viewDetailsDialog.transaction.reference && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Reference</label>
                            <div className="text-sm bg-gray-50 p-2 rounded font-mono">
                              {viewDetailsDialog.transaction.reference}
                            </div>
                          </div>
                        )}

                        {viewDetailsDialog.transaction.notes && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Notes</label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {viewDetailsDialog.transaction.notes}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Created</label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {new Date(viewDetailsDialog.transaction.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Updated</label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {new Date(viewDetailsDialog.transaction.updatedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() => setViewDetailsDialog({ open: false, transaction: null })}
                          className="btn btn-secondary"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bulk Status Dialog */}
                {bulkStatusDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Change All Transactions Status
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        This will change the status of {selectedTransactions.length} selected transaction{selectedTransactions.length !== 1 ? 's' : ''}.
                      </p>
                      <div className="mb-4">
                        <label className="form-label mb-2">
                          Select New Status
                        </label>
                        <select
                          value={bulkStatus}
                          onChange={(e) => setBulkStatus(e.target.value)}
                          className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="">Select status...</option>
                          <option value="Pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="Success">Success</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Suspicious">Suspicious</option>
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setBulkStatusDialog({ open: false });
                            setBulkStatus('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleBulkStatusUpdate(bulkStatus)}
                          disabled={!bulkStatus}
                          className="btn btn-primary"
                        >
                          Update All
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Update Status Dialog */}
                {updateStatusDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Update Transaction Status
                      </h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">
                          Select New Status
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="Success">Success</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Suspicious">Suspicious</option>
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setUpdateStatusDialog({
                              open: false,
                              transactionId: '',
                              currentStatus: '',
                            });
                            setNewStatus('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleStatusUpdate(updateStatusDialog.transactionId, newStatus);
                            setUpdateStatusDialog({
                              open: false,
                              transactionId: '',
                              currentStatus: '',
                            });
                            setNewStatus('');
                          }}
                          className="btn btn-primary"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Notes Dialog */}
                {addNotesDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Add Notes
                      </h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">
                          Notes
                        </label>
                        <textarea
                          value={newNotes}
                          onChange={(e) => setNewNotes(e.target.value)}
                          rows={4}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none"
                          placeholder="Enter notes about this transaction..."
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setAddNotesDialog({ open: false, transactionId: '', currentNotes: '' });
                            setNewNotes('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddNotes(addNotesDialog.transactionId, newNotes)}
                          className="btn btn-primary"
                        >
                          Save Notes
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

export default AdminAllTransactionsPage;