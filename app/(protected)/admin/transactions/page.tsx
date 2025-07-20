'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaDollarSign,
  FaEllipsisH,
  FaExclamationCircle,
  FaEye,
  FaPlus,
  FaSearch,
  FaSync,
  FaTimes,
  FaTimesCircle,
} from 'react-icons/fa';

// Import APP_NAME constant and useCurrency hook
import useCurrency from '@/hooks/useCurrency';
import { APP_NAME } from '@/lib/constants';
const formatID = (id) => id;
const formatNumber = (num) => num.toLocaleString();
const formatPrice = (price, decimals = 2) => price.toFixed(decimals);

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
  id: number;
  user: {
    id: number;
    email: string;
    name: string;
    username?: string;
  };
  transactionId: number | string;
  amount: number;
  currency: string;
  phone: string;
  method: string;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'cancelled' | 'Processing' | 'Success' | 'Cancelled';
  admin_status: 'Pending' | 'pending' | 'Success' | 'Cancelled' | 'Suspicious';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  notes?: string;
}

interface TransactionStats {
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
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
  // Set document title
  useEffect(() => {
    document.title = `All Transactions — ${APP_NAME}`;
  }, []);

  // Currency hook
  const { currency, currentCurrencyData } = useCurrency();

  // Dummy data for testing - Updated to show empty Transaction IDs for pending withdrawals
  const dummyTransactions: Transaction[] = [
    {
      id: 'txn_001',
      user: {
        id: 'user_001',
        email: 'john.doe@example.com',
        name: 'John Doe',
        username: 'johndoe',
      },
      transactionId: '', // Empty for pending withdrawal
      amount: 500,
      currency: 'BDT',
      phone: '+8801712345678',
      method: 'bkash',
      type: 'withdrawal',
      status: 'pending',
      admin_status: 'pending',
      notes: 'Pending withdrawal - awaiting approval',
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
      transactionId: '', // Empty for pending withdrawal
      amount: 250,
      currency: 'USD',
      phone: '+8801555123456',
      method: 'rocket',
      type: 'withdrawal',
      status: 'pending',
      admin_status: 'pending',
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
      status: 'pending',
      admin_status: 'pending',
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
      status: 'completed',
      admin_status: 'Suspicious',
      createdAt: '2024-01-11T11:25:00Z',
      updatedAt: '2024-01-11T11:40:00Z',
    },
    {
      id: 'txn_006',
      user: {
        id: 'user_006',
        email: 'robert.taylor@example.com',
        name: 'Robert Taylor',
        username: 'robertt',
      },
      transactionId: '', // Empty for pending withdrawal
      amount: 600,
      currency: 'BDT',
      phone: '+8801444567890',
      method: 'nagad',
      type: 'withdrawal',
      status: 'pending',
      admin_status: 'pending',
      createdAt: '2024-01-09T16:20:00Z',
      updatedAt: '2024-01-09T16:20:00Z',
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
      admin_status: 'pending',
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
      status: 'pending',
      admin_status: 'pending',
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
      createdAt: '2024-01-06T17:10:00Z',
      updatedAt: '2024-01-06T17:25:00Z',
      processedAt: '2024-01-06T17:25:00Z',
    },
  ];

  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    totalVolume: 0,
    todayTransactions: 0,
    statusBreakdown: {
      pending: 0,
      completed: 0,
      cancelled: 0,
      Success: 0,
      Pending: 0,
      Cancelled: 0,
      Suspicious: 0,
    },
  });

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 9,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('id'); // 'id', 'username', 'phone'
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Dialog states
  const [viewDetailsDialog, setViewDetailsDialog] = useState<{
    open: boolean;
    transaction: Transaction | null;
  }>({
    open: false,
    transaction: null,
  });

  const [updateStatusDialog, setUpdateStatusDialog] = useState<{
    open: boolean;
    transactionId: number;
    currentStatus: string;
  }>({
    open: false,
    transactionId: 0,
    currentStatus: '',
  });
  const [newStatus, setNewStatus] = useState('');

  // Confirmation modals state
  const [approveConfirmDialog, setApproveConfirmDialog] = useState<{
    open: boolean;
    transactionId: number;
    transaction: Transaction | null;
  }>({
    open: false,
    transactionId: 0,
    transaction: null,
  });

  // New state for approve transaction ID input
  const [approveTransactionId, setApproveTransactionId] = useState('');

  const [cancelConfirmDialog, setCancelConfirmDialog] = useState<{
    open: boolean;
    transactionId: number;
    transaction: Transaction | null;
  }>({
    open: false,
    transactionId: 0,
    transaction: null,
  });

  // Add/Deduct Balance modal state
  const [addDeductBalanceDialog, setAddDeductBalanceDialog] = useState<{
    open: boolean;
  }>({
    open: false,
  });

  const [balanceForm, setBalanceForm] = useState({
    username: '',
    amount: '',
    action: 'add',
    notes: '',
  });

  // Username search states
  const [usernameSearching, setUsernameSearching] = useState(false);
  const [userFound, setUserFound] = useState<{
    id: number;
    username: string;
    name: string;
    email: string;
  } | null>(null);
  const [balanceSubmitting, setBalanceSubmitting] = useState(false);

  // Calculate status counts
  const calculateStatusCounts = (transactionsData: Transaction[]) => {
    const counts = {
      pending: 0,
      completed: 0,
      cancelled: 0,
    };

    transactionsData.forEach((transaction) => {
      if (transaction.status && counts.hasOwnProperty(transaction.status)) {
        counts[transaction.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  // Fetch functions
  const fetchAllTransactionsForCounts = useCallback(async () => {
    try {
      const statusCounts = calculateStatusCounts(dummyTransactions);

      setStats((prev) => ({
        ...prev,
        pendingTransactions: statusCounts.pending,
        completedTransactions: statusCounts.completed,
        statusBreakdown: {
          ...prev.statusBreakdown,
          pending: statusCounts.pending,
          completed: statusCounts.completed,
          cancelled: statusCounts.cancelled,
        },
      }));
    } catch (error) {
      console.error('Error fetching transactions for counts:', error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        admin: 'true',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
        params.append('searchType', searchType);
      }



      const response = await fetch(`/api/transactions?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      // Handle both new structured response and legacy array response
      if (result.success) {
        // New structured response
        setTransactions(result.data || []);

        if (result.pagination) {
          setPagination({
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
            hasNext: result.pagination.hasNext,
            hasPrev: result.pagination.hasPrev,
          });
        }

        if (result.stats) {
          setStats({
            totalTransactions: result.stats.totalTransactions,
            pendingTransactions: result.stats.pendingTransactions,
            completedTransactions: result.stats.completedTransactions,
            totalVolume: result.stats.totalVolume,
            todayTransactions: result.stats.todayTransactions,
            statusBreakdown: {
              pending: result.stats.pendingTransactions,
              completed: result.stats.completedTransactions,
              cancelled: result.stats.cancelledTransactions || 0,
              Success: result.stats.completedTransactions,
              Pending: result.stats.pendingTransactions,
              Cancelled: result.stats.cancelledTransactions || 0,
              Suspicious: result.stats.suspiciousTransactions || 0,
            },
          });
        }
      } else if (Array.isArray(result)) {
        // Legacy array response - fallback
        console.log('Using legacy array response');
        setTransactions(result);
        setPagination({
          page: 1,
          limit: result.length,
          total: result.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        });
      } else {
        throw new Error(result.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);

      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
      showToast(`Database Error: ${errorMessage}`, 'error');

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
  }, [pagination.page, pagination.limit, statusFilter, typeFilter, searchTerm, searchType]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const response = await fetch('/api/transactions/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction stats');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setStats({
          totalTransactions: result.data.totalTransactions,
          pendingTransactions: result.data.pendingTransactions,
          completedTransactions: result.data.completedTransactions,
          totalVolume: result.data.totalVolume,
          todayTransactions: result.data.todayTransactions,
          statusBreakdown: {
            pending: result.data.pendingTransactions,
            completed: result.data.completedTransactions,
            cancelled: result.data.cancelledTransactions || 0,
            Success: result.data.completedTransactions,
            Pending: result.data.pendingTransactions,
            Cancelled: result.data.cancelledTransactions || 0,
            Suspicious: result.data.suspiciousTransactions || 0,
          },
        });
      } else {
        throw new Error(result.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast('Failed to fetch transaction stats', 'error');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactionsLoading(true);
      fetchTransactions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchTransactions]);

  useEffect(() => {
    setTransactionsLoading(true);
    fetchTransactions();
  }, [pagination.page, pagination.limit, statusFilter, typeFilter, fetchTransactions]);

  useEffect(() => {
    fetchStats();
    fetchAllTransactionsForCounts();
  }, [fetchStats, fetchAllTransactionsForCounts]);

  useEffect(() => {
    if (pagination.total > 0) {
      setStats((prev) => ({
        ...prev,
        totalTransactions: pagination.total,
      }));
    }
  }, [pagination.total]);

  // Utility functions
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'pending':
      case 'Processing':
        return <FaClock className="h-3 w-3 text-yellow-500" />;
      case 'Success':
      case 'completed':
      case 'approved':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'Cancelled':
      case 'cancelled':
      case 'rejected':
        return <FaTimesCircle className="h-3 w-3 text-red-500" />;
      case 'Suspicious':
        return <FaExclamationCircle className="h-3 w-3 text-purple-500" />;
      default:
        return <FaClock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
      case 'completed':
      case 'approved':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full w-fit">
            <FaCheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs font-medium text-green-700">Success</span>
          </div>
        );
      case 'Pending':
      case 'pending':
      case 'Processing':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full w-fit">
            <FaClock className="h-3 w-3 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-700">Pending</span>
          </div>
        );
      case 'Cancelled':
      case 'cancelled':
      case 'rejected':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full w-fit">
            <FaTimesCircle className="h-3 w-3 text-red-500" />
            <span className="text-xs font-medium text-red-700">Cancel</span>
          </div>
        );
      case 'Suspicious':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full w-fit">
            <FaExclamationCircle className="h-3 w-3 text-purple-500" />
            <span className="text-xs font-medium text-purple-700">
              Suspicious
            </span>
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
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to display method (without background colors)
  const displayMethod = (transaction: Transaction) => {
    return transaction.method || 'null';
  };

  // Action handlers
  const handleRefresh = () => {
    setTransactionsLoading(true);
    fetchTransactions();
    fetchStats();
    fetchAllTransactionsForCounts();
    showToast('Transactions refreshed successfully!', 'success');
  };

  const handleAddDeductBalance = () => {
    setAddDeductBalanceDialog({ open: true });
  };

  // Username search function
  const searchUsername = async (username: string) => {
    if (!username.trim()) {
      setUserFound(null);
      return;
    }

    try {
      setUsernameSearching(true);
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(username)}`);
      const result = await response.json();

      console.log('Search result for:', username, result); // Debug log

      if (result.users && result.users.length > 0) {
        // Find exact username match first, otherwise take first result
        const exactMatch = result.users.find((user: any) =>
          user.username?.toLowerCase() === username.toLowerCase()
        );
        const foundUser = exactMatch || result.users[0];
        console.log('Found user:', foundUser); // Debug log
        setUserFound(foundUser);
      } else {
        console.log('No users found for:', username); // Debug log
        setUserFound(null);
      }
    } catch (error) {
      console.error('Error searching username:', error);
      setUserFound(null);
    } finally {
      setUsernameSearching(false);
    }
  };

  // Debounced username search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (balanceForm.username.trim()) {
        searchUsername(balanceForm.username.trim());
      } else {
        setUserFound(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [balanceForm.username]);

  const handleBalanceSubmit = async () => {
    if (!balanceForm.username || !balanceForm.amount || !userFound) {
      showToast('Please fill in all required fields and ensure user is found', 'error');
      return;
    }

    if (parseFloat(balanceForm.amount) <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }

    try {
      setBalanceSubmitting(true);
      const response = await fetch('/api/admin/users/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: balanceForm.username,
          amount: parseFloat(balanceForm.amount),
          action: balanceForm.action,
          notes: balanceForm.notes,
          adminCurrency: currency, // Pass admin's current currency
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          result.message || `Successfully ${
            balanceForm.action === 'add' ? 'added' : 'deducted'
          } balance ${balanceForm.action === 'add' ? 'to' : 'from'} ${balanceForm.username}`,
          'success'
        );
        setAddDeductBalanceDialog({ open: false });
        setBalanceForm({ username: '', amount: '', action: 'add', notes: '' });
        setUserFound(null);
        // Refresh transactions to show new admin transaction
        fetchTransactions();
      } else {
        showToast(result.error || 'Failed to update user balance', 'error');
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
      showToast('Error updating user balance', 'error');
    } finally {
      setBalanceSubmitting(false);
    }
  };

  const handleApprove = (transactionId: string) => {
    const numericId = parseInt(transactionId);
    const transaction = transactions.find((t) => t.id === numericId);
    setApproveConfirmDialog({
      open: true,
      transactionId: numericId,
      transaction: transaction || null,
    });
    setApproveTransactionId(''); // Reset transaction ID input
  };

  const confirmApprove = async (transactionId: number) => {
    const transaction = approveConfirmDialog.transaction;

    // Only require transaction ID for withdrawal transactions
    if (transaction?.type === 'withdrawal' && !approveTransactionId.trim()) {
      showToast('Please enter a transaction ID', 'error');
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/funds/${transactionId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId:
              transaction?.type === 'withdrawal'
                ? approveTransactionId.trim()
                : transaction?.transactionId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setTransactions((prevTransactions) =>
          prevTransactions.map((transaction) =>
            transaction.id === transactionId
              ? {
                  ...transaction,
                  admin_status: 'Success' as const,
                  status: 'completed' as const,
                  transactionId:
                    transaction.type === 'withdrawal'
                      ? parseInt(approveTransactionId.trim()) || transaction.transactionId
                      : transaction.transactionId,
                }
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
    } finally {
      setApproveConfirmDialog({
        open: false,
        transactionId: 0,
        transaction: null,
      });
      setApproveTransactionId('');
    }
  };

  const handleCancel = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id.toString() === transactionId);
    setCancelConfirmDialog({
      open: true,
      transactionId: parseInt(transactionId),
      transaction: transaction || null,
    });
  };

  const confirmCancel = async (transactionId: number) => {
    try {
      const response = await fetch(`/api/admin/funds/${transactionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setTransactions((prevTransactions) =>
          prevTransactions.map((transaction) =>
            transaction.id === transactionId
              ? {
                  ...transaction,
                  admin_status: 'Cancelled',
                  status: 'cancelled',
                }
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
    } finally {
      setCancelConfirmDialog({
        open: false,
        transactionId: 0,
        transaction: null,
      });
    }
  };

  const handleStatusUpdate = async (
    transactionId: number,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(`Transaction status updated to ${newStatus}`, 'success');

        // Update local state optimistically
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction.id === transactionId
              ? {
                  ...transaction,
                  admin_status: newStatus as 'pending' | 'Success' | 'Cancelled' | 'Suspicious',
                  status: newStatus === 'Success' ? 'completed' as const :
                         newStatus === 'Cancelled' ? 'cancelled' as const :
                         newStatus === 'Pending' ? 'pending' as const : 'pending' as const,
                  updatedAt: new Date().toISOString()
                }
              : transaction
          )
        );

        // Refresh data
        fetchStats();
        fetchAllTransactionsForCounts();
      } else {
        showToast(
          result.error || 'Failed to update transaction status',
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      showToast('Error updating transaction status', 'error');
    }
  };

  // Dialog openers
  const openViewDetailsDialog = (transaction: Transaction) => {
    setViewDetailsDialog({ open: true, transaction });
  };

  const openUpdateStatusDialog = (
    transactionId: number,
    currentStatus: string
  ) => {
    setUpdateStatusDialog({ open: true, transactionId, currentStatus });
    setNewStatus(currentStatus);
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
            <div className="flex flex-col md:flex-row items-left gap-2">
              <div className="flex items-center gap-2 justify-start"> {/* Page View Dropdown and Refresh Button */} 
                {/* Page View Dropdown */}
                <select
                  value={pagination.limit}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      limit:
                        e.target.value === 'all'
                          ? 999999 // Very large number to get all transactions
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
                  disabled={transactionsLoading || statsLoading}
                  className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
                >
                  <FaSync
                    className={
                      transactionsLoading || statsLoading ? 'animate-spin' : ''
                    }
                  />
                  Refresh
                </button>
              </div>

              {/* Add/Deduct User Balance button */}
              <div className="w-full md:w-auto">
                <button
                  onClick={handleAddDeductBalance}
                  className="btn btn-primary flex items-center gap-2 px-3 py-2.5 w-full justify-center"
                >
                  <FaPlus />
                  Add/Deduct User Balance
                </button>
              </div>
            </div>

            

            

            {/* Search Controls */}
            <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm w-full md:w-auto"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full">
                  <FaSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    placeholder={`Search ${statusFilter === 'all' ? 'all' : statusFilter} transactions...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>

                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
                >
                  <option value="id">Transaction ID</option>
                  <option value="phone">Phone Number</option>
                  <option value="username">Username</option>
                </select>
              </div>
            </div>


          </div>
        </div>

        {/* Transactions Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
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
                    {stats.pendingTransactions}
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
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading transactions...
                  </div>
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
                  No transactions match your current filters or no transactions
                  exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[1200px]">
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
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {transaction.id
                                ? formatID(transaction.id.toString().slice(-8))
                                : 'null'}
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
                            {transaction.transactionId ? (
                              <div
                                className={`text-xs px-2 py-1 rounded ${
                                  transaction.transactionId === 'Deducted by Admin'
                                    ? 'font-mono bg-red-100 text-red-700'
                                    : transaction.transactionId === 'Added by Admin'
                                    ? 'font-mono bg-green-100 text-green-700'
                                    : ''
                                }`}
                              >
                                {transaction.transactionId === 'Added by Admin' ||
                                transaction.transactionId === 'Deducted by Admin'
                                  ? transaction.notes || transaction.transactionId
                                  : transaction.transactionId}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.currency === 'USD' || transaction.currency === 'USDT'
                                ? `$${formatPrice(transaction.amount, 2)}`
                                : `৳${formatPrice(transaction.amount, 2)}`
                              }
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
                            {displayMethod(transaction) ? (
                              <div className="text-xs font-medium text-gray-700 capitalize">
                                {displayMethod(transaction)}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded capitalize ${getTypeColor(
                                transaction.type
                              )}`}
                            >
                              {transaction.type}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {transaction.createdAt
                                  ? new Date(
                                      transaction.createdAt
                                    ).toLocaleDateString()
                                  : 'null'}
                              </div>
                              <div className="text-xs">
                                {transaction.createdAt
                                  ? new Date(
                                      transaction.createdAt
                                    ).toLocaleTimeString()
                                  : 'null'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {getStatusBadge(
                              transaction.admin_status || transaction.status
                            )}
                          </td>
                          <td className="p-3">
                            {(transaction.admin_status === 'Pending' || transaction.admin_status === 'pending') ||
                            (transaction.status === 'pending' || transaction.status === 'Processing') ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(transaction.id.toString())}
                                  className="btn btn-primary flex items-center gap-1 px-3 py-1.5 text-xs bg-green-500 text-white border border-green-500 hover:bg-green-600"
                                  title="Approve"
                                >
                                  <FaCheckCircle className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleCancel(transaction.id.toString())}
                                  className="btn btn-secondary flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500 text-white border border-red-500 hover:bg-red-600"
                                  title="Cancel"
                                >
                                  <FaTimesCircle className="h-3 w-3" />
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
                                          const dropdown =
                                            document.querySelector(
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
                                          const dropdown =
                                            document.querySelector(
                                              '.absolute.right-0'
                                            ) as HTMLElement;
                                          dropdown?.classList.add('hidden');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FaSync className="h-3 w-3" />
                                        Update Status
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

                

                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
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
                      pagination.limit > 10000
                        ? `Showing all ${formatNumber(pagination.total)} transactions`
                        : `Showing ${formatNumber(
                            (pagination.page - 1) * pagination.limit + 1
                          )} to ${formatNumber(
                            Math.min(
                              pagination.page * pagination.limit,
                              pagination.total
                            )
                          )} of ${formatNumber(pagination.total)} transactions`
                    )}
                  </div>
                  {pagination.limit <= 10000 && (
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
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
                        disabled={!pagination.hasNext || transactionsLoading}
                        className="btn btn-secondary"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                {/* View Details Dialog */}
                {viewDetailsDialog.open && viewDetailsDialog.transaction && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] mx-4 max-h-[80vh] overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4">
                        Transaction Details
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Transaction ID
                            </label>
                            <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                              {viewDetailsDialog.transaction.transactionId ||
                                'Not assigned'}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Internal ID
                            </label>
                            <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                              {formatID(viewDetailsDialog.transaction.id)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              User
                            </label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {viewDetailsDialog.transaction.user?.username ||
                                viewDetailsDialog.transaction.user?.email ||
                                'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Phone
                            </label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {viewDetailsDialog.transaction.phone || 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Amount
                            </label>
                            <div className="text-sm bg-gray-50 p-2 rounded font-semibold">
                              {viewDetailsDialog.transaction.currency === 'BDT'
                                ? '৳'
                                : '$'}
                              {formatPrice(
                                viewDetailsDialog.transaction.amount,
                                2
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Type
                            </label>
                            <div
                              className={`text-xs font-medium px-2 py-2 rounded capitalize ${getTypeColor(
                                viewDetailsDialog.transaction.type
                              )}`}
                            >
                              {viewDetailsDialog.transaction.type}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Method
                            </label>
                            {displayMethod(viewDetailsDialog.transaction) ? (
                              <div className="text-xs font-medium p-2 text-gray-700 capitalize">
                                {displayMethod(viewDetailsDialog.transaction)}
                              </div>
                            ) : (
                              <div className="text-sm bg-gray-50 p-2 rounded text-gray-400">
                                -
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(
                              viewDetailsDialog.transaction.admin_status ||
                                viewDetailsDialog.transaction.status
                            )}
                            <span className="text-sm font-medium capitalize">
                              {viewDetailsDialog.transaction.admin_status ||
                                viewDetailsDialog.transaction.status}
                            </span>
                          </div>
                        </div>

                        {viewDetailsDialog.transaction.notes && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Notes
                            </label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {viewDetailsDialog.transaction.notes}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Created
                            </label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {new Date(
                                viewDetailsDialog.transaction.createdAt
                              ).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Updated
                            </label>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {new Date(
                                viewDetailsDialog.transaction.updatedAt
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() =>
                            setViewDetailsDialog({
                              open: false,
                              transaction: null,
                            })
                          }
                          className="btn btn-secondary"
                        >
                          Close
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
                              transactionId: 0,
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
                            handleStatusUpdate(
                              updateStatusDialog.transactionId,
                              newStatus
                            );
                            setUpdateStatusDialog({
                              open: false,
                              transactionId: 0,
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

                {/* Approve Confirmation Dialog with Transaction ID Input */}
                {approveConfirmDialog.open &&
                  approveConfirmDialog.transaction && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-green-600">
                          Approve Transaction
                        </h3>

                        <div className="mb-6">
                          <p className="text-gray-700 mb-4">
                            Are you sure you want to approve this{' '}
                            {approveConfirmDialog.transaction?.type}? This will{' '}
                            {approveConfirmDialog.transaction?.type ===
                            'withdrawal'
                              ? 'process the withdrawal and assign a transaction ID'
                              : "add funds to the user's account"}
                            .
                          </p>

                          <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Transaction ID:
                              </span>
                              <span className="font-mono text-sm">
                                {approveConfirmDialog.transaction
                                  .transactionId || 'Not assigned'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                User:
                              </span>
                              <span>
                                {approveConfirmDialog.transaction.user
                                  ?.username ||
                                  approveConfirmDialog.transaction.user
                                    ?.email ||
                                  'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Amount:
                              </span>
                              <span className="font-semibold text-lg text-green-600">
                                {approveConfirmDialog.transaction.currency ===
                                'BDT'
                                  ? '৳'
                                  : '$'}
                                {formatPrice(
                                  approveConfirmDialog.transaction.amount,
                                  2
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Method:
                              </span>
                              <span className="capitalize">
                                {displayMethod(
                                  approveConfirmDialog.transaction
                                ) || '-'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Phone:
                              </span>
                              <span>
                                {approveConfirmDialog.transaction.phone}
                              </span>
                            </div>
                          </div>

                          {/* Transaction ID Input Field - Only for Withdrawals */}
                          {approveConfirmDialog.transaction?.type ===
                            'withdrawal' && (
                            <div className="mb-4">
                              <label className="form-label mb-2">
                                Transaction ID *
                              </label>
                              <input
                                type="text"
                                placeholder="Enter transaction ID"
                                value={approveTransactionId}
                                onChange={(e) =>
                                  setApproveTransactionId(e.target.value)
                                }
                                className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                This transaction ID will be assigned to the
                                approved withdrawal.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col-reverse md:flex-row gap-3 justify-center md:justify-end">
                          <button
                            onClick={() => {
                              setApproveConfirmDialog({
                                open: false,
                                transactionId: 0,
                                transaction: null,
                              });
                              setApproveTransactionId('');
                            }}
                            className="btn btn-secondary w-full md:w-auto"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              confirmApprove(approveConfirmDialog.transactionId)
                            }
                            disabled={
                              approveConfirmDialog.transaction?.type ===
                                'withdrawal' && !approveTransactionId.trim()
                            }
                            className="btn btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
                          >
                            <FaCheckCircle className="h-4 w-4" />
                            Approve Transaction
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Cancel Confirmation Dialog */}
                {cancelConfirmDialog.open &&
                  cancelConfirmDialog.transaction && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">
                          Cancel Transaction
                        </h3>

                        <div className="mb-6">
                          <p className="text-gray-700 mb-2">
                            Are you sure you want to cancel this transaction?
                          </p>
                          <p className="text-red-600 text-sm font-medium mb-4">
                            This action cannot be undone and will notify the
                            user.
                          </p>

                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Transaction ID:
                              </span>
                              <span className="font-mono text-sm">
                                {cancelConfirmDialog.transaction
                                  .transactionId || 'Not assigned'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                User:
                              </span>
                              <span>
                                {cancelConfirmDialog.transaction.user
                                  ?.username ||
                                  cancelConfirmDialog.transaction.user?.email ||
                                  'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Amount:
                              </span>
                              <span className="font-semibold text-lg">
                                {cancelConfirmDialog.transaction.currency ===
                                'BDT'
                                  ? '৳'
                                  : '$'}
                                {formatPrice(
                                  cancelConfirmDialog.transaction.amount,
                                  2
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Method:
                              </span>
                              <span className="capitalize">
                                {displayMethod(
                                  cancelConfirmDialog.transaction
                                ) || '-'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Phone:
                              </span>
                              <span>
                                {cancelConfirmDialog.transaction.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col-reverse md:flex-row gap-3 justify-center md:justify-end">
                          <button
                            onClick={() =>
                              setCancelConfirmDialog({
                                open: false,
                                transactionId: 0,
                                transaction: null,
                              })
                            }
                            className="btn btn-secondary w-full md:w-auto"
                          >
                            Keep Transaction
                          </button>
                          <button
                            onClick={() =>
                              confirmCancel(cancelConfirmDialog.transactionId)
                            }
                            className="btn btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
                          >
                            <FaTimesCircle className="h-4 w-4" />
                            Cancel Transaction
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Add/Deduct User Balance Dialog */}
                {addDeductBalanceDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Add/Deduct User Balance
                      </h3>

                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="form-label mb-2">Username <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter username"
                              value={balanceForm.username}
                              onChange={(e) => {
                                setBalanceForm((prev) => ({
                                  ...prev,
                                  username: e.target.value,
                                }));
                                if (!e.target.value.trim()) {
                                  setUserFound(null);
                                }
                              }}
                              className="form-field w-full px-4 py-3 pr-10 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                            />
                            {usernameSearching && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary)]"></div>
                              </div>
                            )}
                          </div>
                          {userFound && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-700 font-medium">
                                  User found: {userFound.username} ({userFound.email})
                                </span>
                              </div>
                            </div>
                          )}
                          {balanceForm.username && !usernameSearching && !userFound && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-red-700">
                                  User not found
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="form-label mb-2">Action <span className="text-red-500">*</span></label>
                          <select
                            value={balanceForm.action}
                            onChange={(e) =>
                              setBalanceForm((prev) => ({
                                ...prev,
                                action: e.target.value,
                              }))
                            }
                            className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                          >
                            <option value="add">Add Balance</option>
                            <option value="deduct">Deduct Balance</option>
                          </select>
                        </div>

                        <div>
                          <label className="form-label mb-2">Amount ({currency}) <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                              {balanceForm.action === 'deduct' ? '-' : ''}{currentCurrencyData?.symbol || '$'}
                            </span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={balanceForm.amount}
                              onChange={(e) =>
                                setBalanceForm((prev) => ({
                                  ...prev,
                                  amount: e.target.value,
                                }))
                              }
                              className="form-field w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="form-label mb-2">Notes</label>
                          <input
                            type="text"
                            placeholder="Add notes (optional)"
                            value={balanceForm.notes}
                            onChange={(e) =>
                              setBalanceForm((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => {
                            setAddDeductBalanceDialog({ open: false });
                            setBalanceForm({
                              username: '',
                              amount: '',
                              action: 'add',
                              notes: '',
                            });
                            setUserFound(null);
                            setUsernameSearching(false);
                            setBalanceSubmitting(false);
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBalanceSubmit}
                          disabled={!balanceForm.username || !balanceForm.amount || !userFound || balanceSubmitting}
                          className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {balanceSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              {balanceForm.action === 'add' ? 'Adding...' : 'Deducting...'}
                            </>
                          ) : (
                            <>
                              <FaDollarSign className="h-4 w-4" />
                              {balanceForm.action === 'add'
                                ? 'Add Balance'
                                : 'Deduct Balance'}
                            </>
                          )}
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
