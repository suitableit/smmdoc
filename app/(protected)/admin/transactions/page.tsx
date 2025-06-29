'use client';

import React, { useEffect, useState } from 'react';
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

// Import APP_NAME constant
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
  transactionId: number;
  amount: number;
  currency: string;
  phone: string;
  method: string;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'cancelled';
  admin_status: 'pending' | 'Success' | 'Cancelled' | 'Suspicious';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
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
  const [transactions, setTransactions] =
    useState<Transaction[]>(dummyTransactions);
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 9,
    pendingTransactions: 4,
    completedTransactions: 5,
    totalVolume: 7550,
    todayTransactions: 2,
    statusBreakdown: {
      pending: 4,
      completed: 5,
      cancelled: 1,
      Success: 5,
      Pending: 4,
      Cancelled: 1,
      Suspicious: 1,
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
    transactionId: '',
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
    transactionId: '',
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
    transactionId: '',
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
  const fetchAllTransactionsForCounts = async () => {
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
  };

  const fetchTransactions = async () => {
    try {
      let filteredTransactions = dummyTransactions;

      if (statusFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(
          (t) => t.admin_status === statusFilter || t.status === statusFilter
        );
      }

      if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(
          (t) => t.type === typeFilter
        );
      }

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filteredTransactions = filteredTransactions.filter(
          (t) =>
            t.transactionId.toLowerCase().includes(search) ||
            t.phone?.toLowerCase().includes(search) ||
            t.user?.username?.toLowerCase().includes(search) ||
            t.user?.email?.toLowerCase().includes(search)
        );
      }

      setTransactions(filteredTransactions);
      setPagination((prev) => ({
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
      const totalTransactions = dummyTransactions.length;
      const pendingCount = dummyTransactions.filter(
        (t) => t.admin_status === 'pending' || t.status === 'pending'
      ).length;
      const successCount = dummyTransactions.filter(
        (t) => t.admin_status === 'Success' || t.status === 'completed'
      ).length;
      const totalVolume = dummyTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      setStats({
        totalTransactions,
        pendingTransactions: pendingCount,
        completedTransactions: successCount,
        totalVolume,
        todayTransactions: 2,
        statusBreakdown: {
          pending: pendingCount,
          completed: successCount,
          cancelled: dummyTransactions.filter(
            (t) => t.admin_status === 'Cancelled'
          ).length,
          Success: successCount,
          Pending: pendingCount,
          Cancelled: dummyTransactions.filter(
            (t) => t.admin_status === 'Cancelled'
          ).length,
          Suspicious: dummyTransactions.filter(
            (t) => t.admin_status === 'Suspicious'
          ).length,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactionsLoading(true);
      fetchTransactions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setTransactionsLoading(true);
    fetchTransactions();
  }, [pagination.page, pagination.limit, statusFilter, typeFilter]);

  useEffect(() => {
    fetchStats();
    fetchAllTransactionsForCounts();
    setStatsLoading(false);
  }, []);

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
      case 'pending':
      case 'Pending':
        return <FaClock className="h-3 w-3 text-yellow-500" />;
      case 'completed':
      case 'Success':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'cancelled':
      case 'Cancelled':
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
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full w-fit">
            <FaCheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs font-medium text-green-700">Success</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full w-fit">
            <FaClock className="h-3 w-3 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-700">Pending</span>
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

  const handleBalanceSubmit = async () => {
    if (!balanceForm.username || !balanceForm.amount) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (parseFloat(balanceForm.amount) <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }

    try {
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
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          `Successfully ${
            balanceForm.action === 'add' ? 'added' : 'deducted'
          } ${balanceForm.amount} to ${balanceForm.username}'s balance`,
          'success'
        );
        setAddDeductBalanceDialog({ open: false });
        setBalanceForm({ username: '', amount: '', action: 'add', notes: '' });
      } else {
        showToast(result.error || 'Failed to update user balance', 'error');
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
      showToast('Error updating user balance', 'error');
    }
  };

  const handleApprove = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    setApproveConfirmDialog({
      open: true,
      transactionId,
      transaction: transaction || null,
    });
    setApproveTransactionId(''); // Reset transaction ID input
  };

  const confirmApprove = async (transactionId: string) => {
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
                  admin_status: 'Success',
                  status: 'completed',
                  transactionId:
                    transaction.type === 'withdrawal'
                      ? approveTransactionId.trim()
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
        transactionId: '',
        transaction: null,
      });
      setApproveTransactionId('');
    }
  };

  const handleCancel = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    setCancelConfirmDialog({
      open: true,
      transactionId,
      transaction: transaction || null,
    });
  };

  const confirmCancel = async (transactionId: string) => {
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
        transactionId: '',
        transaction: null,
      });
    }
  };

  const handleStatusUpdate = async (
    transactionId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/transactions/${transactionId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showToast(`Transaction status updated to ${newStatus}`, 'success');
        fetchTransactions();
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
    transactionId: string,
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
          <div className="flex items-center justify-between">
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

              <button
                onClick={handleAddDeductBalance}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaPlus />
                Add/Deduct User Balance
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>

              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${
                    statusFilter === 'all' ? 'all' : statusFilter
                  } transactions...`}
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
                <div className="hidden lg:block overflow-x-auto">
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
                              #
                              {transaction.id
                                ? formatID(transaction.id.slice(-8))
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
                              <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded max-w-32 truncate">
                                {transaction.transactionId}
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
                              {transaction.currency === 'BDT' ? '৳' : '$'}
                              {formatPrice(transaction.amount, 2)}
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
                            {transaction.admin_status === 'pending' ||
                            transaction.status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(transaction.id)}
                                  className="btn btn-primary flex items-center gap-1 px-3 py-1.5 text-xs bg-green-500 text-white border border-green-500 hover:bg-green-600"
                                  title="Approve"
                                >
                                  <FaCheckCircle className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleCancel(transaction.id)}
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

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="card card-padding border-l-4 border-blue-500 mb-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #
                              {transaction.id
                                ? formatID(transaction.id.slice(-8))
                                : 'null'}
                            </div>
                            {getStatusBadge(
                              transaction.admin_status || transaction.status
                            )}
                          </div>
                          <div className="flex items-center">
                            {transaction.admin_status === 'pending' ||
                            transaction.status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(transaction.id)}
                                  className="btn btn-primary flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white border border-green-500 hover:bg-green-600"
                                  title="Approve transaction"
                                >
                                  <FaCheckCircle className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleCancel(transaction.id)}
                                  className="btn btn-secondary flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white border border-red-500 hover:bg-red-600"
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
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

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
                            {transaction.transactionId ? (
                              <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded w-fit">
                                {transaction.transactionId}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Not assigned
                              </span>
                            )}
                          </div>
                        </div>

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
                            {displayMethod(transaction) ? (
                              <div className="text-xs font-medium text-gray-700 capitalize">
                                {displayMethod(transaction)}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Phone
                            </div>
                            <span
                              className="text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {transaction.phone || 'null'}
                            </span>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Type
                            </div>
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded capitalize w-fit ${getTypeColor(
                                transaction.type
                              )}`}
                            >
                              {transaction.type}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Date:{' '}
                            {transaction.createdAt
                              ? new Date(
                                  transaction.createdAt
                                ).toLocaleDateString()
                              : 'null'}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Time:{' '}
                            {transaction.createdAt
                              ? new Date(
                                  transaction.createdAt
                                ).toLocaleTimeString()
                              : 'null'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                      `Showing ${formatNumber(
                        (pagination.page - 1) * pagination.limit + 1
                      )} to ${formatNumber(
                        Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )
                      )} of ${formatNumber(pagination.total)} transactions`
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
                              #{formatID(viewDetailsDialog.transaction.id)}
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
                            handleStatusUpdate(
                              updateStatusDialog.transactionId,
                              newStatus
                            );
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

                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => {
                              setApproveConfirmDialog({
                                open: false,
                                transactionId: '',
                                transaction: null,
                              });
                              setApproveTransactionId('');
                            }}
                            className="btn btn-secondary"
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
                            className="btn btn-primary flex items-center gap-2"
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

                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() =>
                              setCancelConfirmDialog({
                                open: false,
                                transactionId: '',
                                transaction: null,
                              })
                            }
                            className="btn btn-secondary"
                          >
                            Keep Transaction
                          </button>
                          <button
                            onClick={() =>
                              confirmCancel(cancelConfirmDialog.transactionId)
                            }
                            className="btn btn-primary flex items-center gap-2"
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
                          <label className="form-label mb-2">Username *</label>
                          <input
                            type="text"
                            placeholder="Enter username"
                            value={balanceForm.username}
                            onChange={(e) =>
                              setBalanceForm((prev) => ({
                                ...prev,
                                username: e.target.value,
                              }))
                            }
                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="form-label mb-2">Action *</label>
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
                          <label className="form-label mb-2">Amount *</label>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={balanceForm.amount}
                            onChange={(e) =>
                              setBalanceForm((prev) => ({
                                ...prev,
                                amount: e.target.value,
                              }))
                            }
                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
                            step="0.01"
                          />
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
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBalanceSubmit}
                          className="btn btn-primary flex items-center gap-2"
                        >
                          <FaDollarSign className="h-4 w-4" />
                          {balanceForm.action === 'add'
                            ? 'Add Balance'
                            : 'Deduct Balance'}
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
