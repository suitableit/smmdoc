'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaBan,
  FaCheckCircle,
  FaCoins,
  FaDollarSign,
  FaEdit,
  FaEllipsisH,
  FaExclamationCircle,
  FaGift,
  FaSearch,
  FaSignInAlt,
  FaSync,
  FaTimes,
  FaTimesCircle,
  FaTrash,
  FaUserCheck,
  FaUsers,
} from 'react-icons/fa';

// Import APP_NAME constant
import useCurrency from '@/hooks/useCurrency';
import { APP_NAME } from '@/lib/constants';
import { invalidateUserSessions } from '@/lib/session-invalidation';

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
interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  balance: number;
  total_spent: number;
  totalOrders: number;
  servicesDiscount: number;
  specialPricing: boolean;
  status: 'active' | 'suspended' | 'banned';
  currency: string;
  dollarRate?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  totalBalance: number;
  totalSpent: number;
  todayRegistrations: number;
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

interface UserActionsProps {
  user: User;
  onView: (userId: number) => void;
  onEditUser: (userId: number) => void;
  onEditBalance: (userId: number) => void;
  onEditDiscount: (userId: number, currentDiscount: number) => void;
  onChangeRole: (userId: number, currentRole: string) => void;
  onResetSpecialPricing: (userId: number) => Promise<boolean>;
  onSetNewApiKey: (userId: number) => Promise<boolean>;
  onUpdateStatus: (userId: number, currentStatus: string) => void;
  onDelete: (userId: number) => void;
  isLoading: boolean;
}

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: number) => void;
  onView: (userId: number) => void;
  onEditBalance: (userId: number) => void;
  onEditDiscount: (userId: number, currentDiscount: number) => void;
  onChangeRole: (userId: number, currentRole: string) => void;
  onResetSpecialPricing: (userId: number) => Promise<boolean>;
  onSetNewApiKey: (userId: number) => Promise<boolean>;
  onUpdateStatus: (userId: number, currentStatus: string) => void;
  onDelete: (userId: number) => void;
  formatCurrency: (amount: number, currency: string) => string;
  isLoading: boolean;
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (newPage: number) => void;
  isLoading: boolean;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

interface AddDeductBalanceModalProps {
  isOpen: boolean;
  userId: number;
  currentUser: User | null;
  onClose: () => void;
  isLoading: boolean;
  onBalanceUpdate: () => void;
}

interface UpdateStatusModalProps {
  isOpen: boolean;
  currentStatus: string;
  newStatus: string;
  onStatusChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

interface EditDiscountModalProps {
  isOpen: boolean;
  currentDiscount: number;
  newDiscount: string;
  onDiscountChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

interface ChangeRoleModalProps {
  isOpen: boolean;
  currentRole: string;
  newRole: string;
  onRoleChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

// Edit User Modal interfaces - cloned from Edit Balance pattern
interface EditUserModalProps {
  isOpen: boolean;
  currentUser: User | null;
  formData: EditUserFormData;
  onFormDataChange: (
    field: keyof EditUserFormData,
    value: string | number | boolean
  ) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  onGeneratePassword: () => void;
}

interface EditUserFormData {
  username: string;
  name: string;
  email: string;
  balance: string;
  emailVerified: boolean;
  password: string;
}

// Custom hooks for better organization
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || !event.target || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

const UsersListPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `All Users — ${APP_NAME}`;
  }, []);

  // Currency hook
  const { currency, currentCurrencyData, formatCurrency: formatCurrencyFromContext } = useCurrency();

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    bannedUsers: 0,
    totalBalance: 0,
    totalSpent: 0,
    todayRegistrations: 0,
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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [addDeductBalanceDialog, setAddDeductBalanceDialog] = useState<{
    open: boolean;
    userId: number;
    currentUser: User | null;
  }>({
    open: false,
    userId: 0,
    currentUser: null,
  });

  // Add/Deduct Balance form state
  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    action: 'add',
    notes: '',
  });
  const [balanceSubmitting, setBalanceSubmitting] = useState(false);
  const [updateStatusDialog, setUpdateStatusDialog] = useState<{
    open: boolean;
    userId: number;
    currentStatus: string;
  }>({
    open: false,
    userId: 0,
    currentStatus: '',
  });
  const [newStatus, setNewStatus] = useState('');
  const [editDiscountDialog, setEditDiscountDialog] = useState<{
    open: boolean;
    userId: number;
    currentDiscount: number;
  }>({
    open: false,
    userId: 0,
    currentDiscount: 0,
  });
  const [newDiscount, setNewDiscount] = useState('');
  const [changeRoleDialog, setChangeRoleDialog] = useState<{
    open: boolean;
    userId: number;
    currentRole: string;
  }>({
    open: false,
    userId: 0,
    currentRole: '',
  });
  const [newRole, setNewRole] = useState('');

  // Edit User Modal state - cloned from Edit Balance pattern
  const [editUserDialog, setEditUserDialog] = useState<{
    open: boolean;
    userId: number;
    currentUser: User | null;
  }>({
    open: false,
    userId: 0,
    currentUser: null,
  });

  const [editUserFormData, setEditUserFormData] = useState<EditUserFormData>({
    username: '',
    name: '',
    email: '',
    balance: '',
    emailVerified: false,
    password: '',
  });

  // Use debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Memoized filter options
  const filterOptions = useMemo(
    () => [
      { key: 'all', label: 'All', count: stats.totalUsers },
      { key: 'active', label: 'Active', count: stats.activeUsers },
      { key: 'suspended', label: 'Suspended', count: stats.suspendedUsers },
      { key: 'banned', label: 'Banned', count: stats.bannedUsers },
    ],
    [stats]
  );

  // API functions
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        role: 'user', // Only fetch users with 'user' role
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        // Client-side filter as backup to ensure no admins slip through
        const filteredUsers = (result.data || []).filter(
          (user: User) => user.role === 'user'
        );
        setUsers(filteredUsers);
        setPagination((prev) => ({
          ...prev,
          ...result.pagination,
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast(
        error instanceof Error ? error.message : 'Error fetching users',
        'error'
      );
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      // Remove role parameter as the API endpoint doesn't support it
      const response = await fetch('/api/admin/users/stats?period=all');
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        const statusBreakdown: Record<string, number> = {};

        if (data.statusBreakdown && Array.isArray(data.statusBreakdown)) {
          data.statusBreakdown.forEach((item: any) => {
            statusBreakdown[item.status] = item.count || 0;
          });
        }

        setStats({
          totalUsers: data.overview?.totalUsers || 0,
          activeUsers: statusBreakdown.active || 0,
          suspendedUsers: statusBreakdown.suspended || 0,
          bannedUsers: statusBreakdown.banned || 0,
          totalBalance: data.overview?.totalBalance || 0,
          totalSpent: data.overview?.totalSpent || 0,
          todayRegistrations: data.dailyTrends?.[0]?.registrations || 0,
          statusBreakdown,
        });
      } else {
        throw new Error(result.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast('Error loading statistics', 'error');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Show toast notification
  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' | 'pending' = 'success'
    ) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  // Utility functions
  const getStatusIcon = (status: string) => {
    const icons = {
      active: <FaCheckCircle className="h-3 w-3 text-green-500" />,
      suspended: <FaExclamationCircle className="h-3 w-3 text-yellow-500" />,
      banned: <FaBan className="h-3 w-3 text-red-500" />,
    };
    return icons[status as keyof typeof icons] || icons.active;
  };

  // Use currency context formatting function
  const formatCurrency = useCallback((amount: number) => {
    return formatCurrencyFromContext(amount);
  }, [formatCurrencyFromContext]);

  const handleSelectAll = useCallback(() => {
    setSelectedUsers((prev) =>
      prev.length === users.length ? [] : users.map((user) => user.id)
    );
  }, [users]);

  const handleSelectUser = useCallback((userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId.toString())
        ? prev.filter((id) => id !== userId.toString())
        : [...prev, userId.toString()]
    );
  }, []);

  const handleViewUser = useCallback((userId: number) => {
    window.open(`/admin/users/${userId}`, '_blank');
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchStats()]);
    showToast('Data refreshed successfully!', 'success');
  }, [fetchUsers, fetchStats, showToast]);

  // Generic API action handler
  const handleApiAction = useCallback(
    async (
      url: string,
      method: string,
      body?: any,
      successMessage?: string
    ) => {
      try {
        setActionLoading(url);
        const response = await fetch(url, {
          method,
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        if (result.success) {
          if (successMessage) showToast(successMessage, 'success');
          await fetchUsers();
          await fetchStats();
          return true;
        } else {
          throw new Error(result.error || 'Operation failed');
        }
      } catch (error) {
        console.error('API action error:', error);
        showToast(
          error instanceof Error ? error.message : 'Operation failed',
          'error'
        );
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [fetchUsers, fetchStats, showToast]
  );

  // Handle user deletion
  const handleDeleteUser = useCallback(
    async (userId: number) => {
      const success = await handleApiAction(
        `/api/admin/users/${userId}`,
        'DELETE',
        undefined,
        'User deleted successfully'
      );

      if (success) {
        // Broadcast session invalidation for live logout
        await invalidateUserSessions(userId);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    },
    [handleApiAction]
  );

  // Handle user status update
  const handleStatusUpdate = useCallback(
    async (userId: number, newStatus: string) => {
      const success = await handleApiAction(
        `/api/admin/users/${userId}/status`,
        'PUT',
        { status: newStatus },
        `User status updated to ${newStatus}`
      );

      // If user is suspended or banned, broadcast session invalidation for live logout
      if (success && (newStatus === 'suspended' || newStatus === 'banned')) {
        await invalidateUserSessions(userId);
      }

      return success;
    },
    [handleApiAction]
  );

  // Handle add/deduct balance
  const handleBalanceSubmit = useCallback(async () => {
    if (!balanceForm.amount || !addDeductBalanceDialog.currentUser) {
      showToast('Please fill in all required fields', 'error');
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
          username: addDeductBalanceDialog.currentUser.username,
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
          } balance ${balanceForm.action === 'add' ? 'to' : 'from'} ${addDeductBalanceDialog.currentUser.username}`,
          'success'
        );
        setAddDeductBalanceDialog({ open: false, userId: 0, currentUser: null });
        setBalanceForm({ amount: '', action: 'add', notes: '' });
        // Refresh users list
        fetchUsers();
      } else {
        showToast(result.error || 'Failed to update user balance', 'error');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      showToast('Failed to update user balance', 'error');
    } finally {
      setBalanceSubmitting(false);
    }
  }, [balanceForm, addDeductBalanceDialog.currentUser, fetchUsers]);

  // Handle edit discount
  const handleEditDiscount = useCallback(
    async (userId: number, discount: number) => {
      const success = await handleApiAction(
        `/api/admin/users/${userId}/discount`,
        'PUT',
        { discount },
        'Services discount updated successfully'
      );

      if (success) {
        setEditDiscountDialog({ open: false, userId: 0, currentDiscount: 0 });
        setNewDiscount('');
      }
    },
    [handleApiAction]
  );

  // Handle change role
  const handleChangeRole = useCallback(
    async (userId: number, role: string) => {
      const success = await handleApiAction(
        `/api/admin/users/${userId}/role`,
        'PUT',
        { role },
        `User role updated to ${role}`
      );

      if (success) {
        setChangeRoleDialog({ open: false, userId: 0, currentRole: '' });
        setNewRole('');
      }
    },
    [handleApiAction]
  );

  // Handle reset special pricing
  const handleResetSpecialPricing = useCallback(
    async (userId: number) => {
      return handleApiAction(
        `/api/admin/users/${userId}/special-pricing`,
        'DELETE',
        undefined,
        'Special pricing reset successfully'
      );
    },
    [handleApiAction]
  );

  // Handle set new API key
  const handleSetNewApiKey = useCallback(
    async (userId: number) => {
      return handleApiAction(
        `/api/admin/users/${userId}/api-key`,
        'POST',
        {},
        'New API key generated successfully'
      );
    },
    [handleApiAction]
  );

  // Edit User functions - cloned from Edit Balance pattern
  const openEditUserDialog = useCallback(
    (userId: number, currentUser: User) => {
      setEditUserDialog({ open: true, userId, currentUser });
      setEditUserFormData({
        username: currentUser.username || '',
        name: currentUser.name || '',
        email: currentUser.email || '',
        balance: (currentUser.balance || 0).toString(),
        emailVerified: currentUser.emailVerified || false,
        password: '',
      });
    },
    []
  );

  const handleEditUserFormDataChange = useCallback(
    (field: keyof EditUserFormData, value: string | number | boolean) => {
      setEditUserFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleGeneratePassword = useCallback(() => {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setEditUserFormData((prev) => ({
      ...prev,
      password: password,
    }));
  }, []);

  const handleEditUserSubmit = useCallback(async () => {
    const userData = {
      username: editUserFormData.username,
      name: editUserFormData.name,
      email: editUserFormData.email,
      balance: parseFloat(editUserFormData.balance) || 0,
      emailVerified: editUserFormData.emailVerified,
      ...(editUserFormData.password && { password: editUserFormData.password }),
    };

    const success = await handleApiAction(
      `/api/admin/users/${editUserDialog.userId}`,
      'PUT',
      userData,
      'User updated successfully'
    );

    if (success) {
      setEditUserDialog({ open: false, userId: 0, currentUser: null });
      setEditUserFormData({
        username: '',
        name: '',
        email: '',
        balance: '',
        emailVerified: false,
        password: '',
      });
    }
  }, [editUserDialog.userId, editUserFormData, handleApiAction]);

  const handleEditUser = useCallback(
    (userId: number) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        openEditUserDialog(userId, user);
      }
    },
    [users, openEditUserDialog]
  );

  // Modal handlers
  const openAddDeductBalanceDialog = useCallback(
    (userId: number) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setAddDeductBalanceDialog({ open: true, userId, currentUser: user });
        setBalanceForm({ amount: '', action: 'add', notes: '' });
      }
    },
    [users]
  );

  const openUpdateStatusDialog = useCallback(
    (userId: number, currentStatus: string) => {
      setUpdateStatusDialog({ open: true, userId, currentStatus });
      setNewStatus(currentStatus);
    },
    []
  );

  const openEditDiscountDialog = useCallback(
    (userId: number, currentDiscount: number) => {
      setEditDiscountDialog({ open: true, userId, currentDiscount });
      setNewDiscount(currentDiscount.toString());
    },
    []
  );

  const openChangeRoleDialog = useCallback(
    (userId: number, currentRole: string) => {
      setChangeRoleDialog({ open: true, userId, currentRole });
      setNewRole(currentRole);
    },
    []
  );

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaUsers />
              </div>
              <div>
                <h3 className="card-title">Total Users</h3>
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaUserCheck />
              </div>
              <div>
                <h3 className="card-title">Active Users</h3>
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activeUsers.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaExclamationCircle />
              </div>
              <div>
                <h3 className="card-title">Suspended Users</h3>
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.suspendedUsers.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaBan />
              </div>
              <div>
                <h3 className="card-title">Banned Users</h3>
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <GradientSpinner size="w-6 h-6" />
                    <span className="text-lg text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-red-600">
                    {stats.bannedUsers.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section - After stats cards */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Page View Dropdown */}
              <select
                value={pagination.limit}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    limit: parseInt(e.target.value),
                    page: 1,
                  }))
                }
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={pagination.total || 1000}>All</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={usersLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync
                  className={usersLoading || statsLoading ? 'animate-spin' : ''}
                />
                Refresh
              </button>
            </div>

            {/* Right: Search Controls Only */}
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
                  } users...`}
                  value={searchTerm || ''}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="username">Username</option>
                <option value="id">User ID</option>
                <option value="email">User Email</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {/* Filter Buttons - Inside table header */}
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
                    {stats.totalUsers.toLocaleString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'active'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Active
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'active'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {stats.activeUsers.toLocaleString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('suspended')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'suspended'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Suspended
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'suspended'
                        ? 'bg-white/20'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {stats.suspendedUsers.toLocaleString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('banned')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'banned'
                      ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Banned
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'banned'
                        ? 'bg-white/20'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stats.bannedUsers.toLocaleString()}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {usersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">Loading users...</div>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <FaUsers
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No users found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {debouncedSearchTerm && statusFilter !== 'all'
                    ? `No ${statusFilter} users match your search "${debouncedSearchTerm}".`
                    : debouncedSearchTerm
                    ? `No users match your search "${debouncedSearchTerm}".`
                    : statusFilter !== 'all'
                    ? `No ${statusFilter} users found.`
                    : 'No users exist yet.'}
                </p>
              </div>
            ) : (
              <>
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
                          Username
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Email
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
                          Balance
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Spent
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Orders
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Services Discount
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Special Pricing
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Registered Date
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
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {user.id || 'N/A'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {user.username || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {user.email || 'null'}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {user.emailVerified ? (
                                <>
                                  <FaCheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-green-600">
                                    Verified
                                  </span>
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle className="h-3 w-3 text-red-500" />
                                  <span className="text-xs text-red-600">
                                    Unverified
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-start">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : user.status === 'suspended'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : user.status === 'banned'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {user.status || 'active'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-left">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {formatCurrency(user.balance || 0)}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-left">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {formatCurrency(user.total_spent || 0)}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-center">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {(user.totalOrders || 0).toLocaleString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-center">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {user.servicesDiscount || 0}%
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-center">
                              {user.specialPricing ? (
                                <div className="flex items-center justify-center">
                                  <FaGift className="h-4 w-4 text-purple-500" />
                                  <span
                                    className="text-sm ml-1"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    Yes
                                  </span>
                                </div>
                              ) : (
                                <span
                                  className="text-sm"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  No
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {user.createdAt
                                  ? new Date(
                                      user.createdAt
                                    ).toLocaleDateString()
                                  : 'null'}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {user.createdAt
                                  ? new Date(
                                      user.createdAt
                                    ).toLocaleTimeString()
                                  : 'null'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <UserActions
                              user={user}
                              onView={handleViewUser}
                              onEditUser={handleEditUser}
                              onEditBalance={openAddDeductBalanceDialog}
                              onEditDiscount={openEditDiscountDialog}
                              onChangeRole={openChangeRoleDialog}
                              onResetSpecialPricing={handleResetSpecialPricing}
                              onSetNewApiKey={handleSetNewApiKey}
                              onUpdateStatus={openUpdateStatusDialog}
                              onDelete={(userId) => {
                                setUserToDelete(userId);
                                setDeleteDialogOpen(true);
                              }}
                              isLoading={actionLoading === user.id}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        isSelected={selectedUsers.includes(user.id.toString())}
                        onSelect={handleSelectUser}
                        onView={handleViewUser}
                        onEditBalance={openAddDeductBalanceDialog}
                        onEditDiscount={openEditDiscountDialog}
                        onChangeRole={openChangeRoleDialog}
                        onResetSpecialPricing={handleResetSpecialPricing}
                        onSetNewApiKey={handleSetNewApiKey}
                        onUpdateStatus={openUpdateStatusDialog}
                        onDelete={(userId) => {
                          setUserToDelete(userId);
                          setDeleteDialogOpen(true);
                        }}
                        formatCurrency={formatCurrency}
                        isLoading={actionLoading === user.id}
                      />
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  isLoading={usersLoading}
                />
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        <DeleteConfirmationModal
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={() => userToDelete && handleDeleteUser(userToDelete)}
          isLoading={actionLoading === `/api/admin/users/${userToDelete}`}
        />

        <AddDeductBalanceModal
          isOpen={addDeductBalanceDialog.open}
          userId={addDeductBalanceDialog.userId}
          currentUser={addDeductBalanceDialog.currentUser}
          onClose={() => {
            setAddDeductBalanceDialog({
              open: false,
              userId: 0,
              currentUser: null,
            });
            setBalanceForm({ amount: '', action: 'add', notes: '' });
            setBalanceSubmitting(false);
          }}
          isLoading={balanceSubmitting}
          onBalanceUpdate={() => {
            fetchUsers();
            fetchStats();
          }}
        />

        <UpdateStatusModal
          isOpen={updateStatusDialog.open}
          currentStatus={updateStatusDialog.currentStatus}
          newStatus={newStatus}
          onStatusChange={setNewStatus}
          onClose={() => {
            setUpdateStatusDialog({
              open: false,
              userId: 0,
              currentStatus: '',
            });
            setNewStatus('');
          }}
          onConfirm={() => {
            handleStatusUpdate(updateStatusDialog.userId, newStatus).then(
              (success) => {
                if (success) {
                  setUpdateStatusDialog({
                    open: false,
                    userId: 0,
                    currentStatus: '',
                  });
                  setNewStatus('');
                }
              }
            );
          }}
          isLoading={
            actionLoading ===
            `/api/admin/users/${updateStatusDialog.userId}/status`
          }
        />

        <EditDiscountModal
          isOpen={editDiscountDialog.open}
          currentDiscount={editDiscountDialog.currentDiscount}
          newDiscount={newDiscount}
          onDiscountChange={setNewDiscount}
          onClose={() => {
            setEditDiscountDialog({
              open: false,
              userId: 0,
              currentDiscount: 0,
            });
            setNewDiscount('');
          }}
          onConfirm={() =>
            handleEditDiscount(
              editDiscountDialog.userId,
              parseInt(newDiscount) || 0
            )
          }
          isLoading={
            actionLoading ===
            `/api/admin/users/${editDiscountDialog.userId}/discount`
          }
        />

        <ChangeRoleModal
          isOpen={changeRoleDialog.open}
          currentRole={changeRoleDialog.currentRole}
          newRole={newRole}
          onRoleChange={setNewRole}
          onClose={() => {
            setChangeRoleDialog({ open: false, userId: 0, currentRole: '' });
            setNewRole('');
          }}
          onConfirm={() => {
            handleChangeRole(changeRoleDialog.userId, newRole).then(
              (success) => {
                if (success) {
                  setChangeRoleDialog({
                    open: false,
                    userId: 0,
                    currentRole: '',
                  });
                  setNewRole('');
                }
              }
            );
          }}
          isLoading={
            actionLoading === `/api/admin/users/${changeRoleDialog.userId}/role`
          }
        />

        {/* Edit User Modal - cloned from Edit Balance pattern */}
        <EditUserModal
          isOpen={editUserDialog.open}
          currentUser={editUserDialog.currentUser}
          formData={editUserFormData}
          onFormDataChange={handleEditUserFormDataChange}
          onClose={() => {
            setEditUserDialog({ open: false, userId: 0, currentUser: null });
            setEditUserFormData({
              username: '',
              name: '',
              email: '',
              balance: '',
              emailVerified: false,
              password: '',
            });
          }}
          onConfirm={handleEditUserSubmit}
          onGeneratePassword={handleGeneratePassword}
          isLoading={
            actionLoading === `/api/admin/users/${editUserDialog.userId}`
          }
        />
      </div>
    </div>
  );
};

// Extracted Components for better organization
const UserActions: React.FC<UserActionsProps> = ({
  user,
  onView,
  onEditUser,
  onEditBalance,
  onEditDiscount,
  onChangeRole,
  onResetSpecialPricing,
  onSetNewApiKey,
  onUpdateStatus,
  onDelete,
  isLoading,
}) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onView(user.id)}
        className="btn btn-secondary p-2"
        title="Switch to this User"
        disabled={isLoading}
      >
        <FaSignInAlt className="h-3 w-3" />
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          className="btn btn-secondary p-2"
          title="More Actions"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <FaEllipsisH className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  onEditUser(user.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaEdit className="h-3 w-3" />
                Edit User
              </button>
              <button
                onClick={() => {
                  onEditBalance(user.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaCoins className="h-3 w-3" />
                Add/Deduct Balance
              </button>
              <button
                onClick={() => {
                  onEditDiscount(user.id, user.servicesDiscount || 0);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaGift className="h-3 w-3" />
                Edit Discount
              </button>
              <button
                onClick={() => {
                  onChangeRole(user.id, user.role || 'user');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaUserCheck className="h-3 w-3" />
                Change Role
              </button>
              <button
                onClick={() => {
                  onResetSpecialPricing(user.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaTimesCircle className="h-3 w-3" />
                Reset Special Pricing
              </button>
              <button
                onClick={() => {
                  onSetNewApiKey(user.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaSync className="h-3 w-3" />
                Set New API Key
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(user.id, user.status);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaUserCheck className="h-3 w-3" />
                Update User Status
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  onDelete(user.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <FaTrash className="h-3 w-3" />
                Delete User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelected,
  onSelect,
  onView,
  onEditBalance,
  onEditDiscount,
  onChangeRole,
  onResetSpecialPricing,
  onSetNewApiKey,
  onUpdateStatus,
  onDelete,
  formatCurrency,
  isLoading,
}) => (
  <div className="card card-padding border-l-4 border-blue-500 mb-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
          {user.id || 'N/A'}
        </div>
      </div>
      <UserActions
        user={user}
        onView={onView}
        onEditUser={(userId: string) => {
          const foundUser = [user].find((u) => u.id === userId);
          if (foundUser) {
            onView(userId);
          }
        }}
        onEditBalance={onEditBalance}
        onEditDiscount={onEditDiscount}
        onChangeRole={onChangeRole}
        onResetSpecialPricing={onResetSpecialPricing}
        onSetNewApiKey={onSetNewApiKey}
        onUpdateStatus={onUpdateStatus}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    </div>

    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Username
          </div>
          <div
            className="font-medium text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            {user.username || 'null'}
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Special Pricing
          </div>
          {user.specialPricing ? (
            <div className="flex items-center justify-end">
              <FaGift className="h-4 w-4 text-purple-500" />
              <span
                className="text-sm ml-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Yes
              </span>
            </div>
          ) : (
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              No
            </span>
          )}
        </div>
      </div>

      <div>
        <div
          className="text-xs font-medium mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Email
        </div>
        <div className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
          {user.email || 'null'}
        </div>
        <div className="flex items-center gap-1">
          {user.emailVerified ? (
            <>
              <FaCheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">Verified</span>
            </>
          ) : (
            <>
              <FaTimesCircle className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-600">Unverified</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Balance
          </div>
          <div
            className="font-semibold text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatCurrency(user.balance || 0, user.currency || 'USD')}
          </div>
        </div>
        <div>
          <div
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Total Spent
          </div>
          <div
            className="font-semibold text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatCurrency(user.spent || 0, user.currency || 'USD')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Total Orders
          </div>
          <div
            className="font-semibold text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            {(user.totalOrders || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Services Discount
          </div>
          <div
            className="font-semibold text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            {user.servicesDiscount || 0}%
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Registered:{' '}
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : 'null'}
        </div>
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Time:{' '}
          {user.createdAt
            ? new Date(user.createdAt).toLocaleTimeString()
            : 'null'}
        </div>
        {user.lastLoginAt && (
          <div
            className="text-sm mt-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  </div>
);

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  isLoading,
}) => (
  <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <GradientSpinner size="w-4 h-4" />
          <span>Loading pagination...</span>
        </div>
      ) : (
        `Showing ${(
          (pagination.page - 1) * pagination.limit +
          1
        ).toLocaleString()} to ${Math.min(
          pagination.page * pagination.limit,
          pagination.total
        ).toLocaleString()} of ${pagination.total.toLocaleString()} users`
      )}
    </div>
    <div className="flex items-center gap-2 mt-4 md:mt-0">
      <button
        onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
        disabled={!pagination.hasPrev || isLoading}
        className="btn btn-secondary disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {isLoading ? (
          <GradientSpinner size="w-4 h-4" />
        ) : (
          `Page ${pagination.page} of ${pagination.totalPages}`
        )}
      </span>
      <button
        onClick={() =>
          onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
        }
        disabled={!pagination.hasNext || isLoading}
        className="btn btn-secondary disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
);

// Modal Components
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Delete User</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this user? This action cannot be
          undone and will permanently remove all user data.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </div>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AddDeductBalanceModal: React.FC<AddDeductBalanceModalProps> = ({
  isOpen,
  userId,
  currentUser,
  onClose,
  isLoading,
  onBalanceUpdate,
}) => {
  // Get currency from context
  const { currency, currentCurrencyData, availableCurrencies, convertAmount } = useCurrency();

  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    action: 'add',
    notes: '',
    username: '',
  });
  const [balanceSubmitting, setBalanceSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBalanceForm({
        amount: '',
        action: 'add',
        notes: '',
        username: currentUser?.username || '',
      });
    }
  }, [isOpen, currentUser]);

  // Function to convert user balance to admin's currency for display
  const getDisplayBalance = () => {
    if (!currentUser) return '0.00';
    
    const userBalance = currentUser.balance || 0;
    const userRate = currentUser.dollarRate || 121.45;
    const isAdminUSD = currency === 'USD' || currency === 'USDT';
    
    if (isAdminUSD) {
      // Convert BDT to USD for display
      const convertedBalance = userBalance / userRate;
      return convertedBalance.toFixed(2);
    } else {
      // Show BDT directly
      return userBalance.toFixed(2);
    }
  };

  // Simple toast function for this modal
  const showModalToast = (message: string, type: 'success' | 'error') => {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[9999] px-4 py-2 rounded-lg text-white font-medium ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const handleBalanceSubmit = async () => {
    if (!balanceForm.amount || !currentUser) {
      showModalToast('Please fill in all required fields', 'error');
      return;
    }

    if (parseFloat(balanceForm.amount) <= 0) {
      showModalToast('Amount must be greater than 0', 'error');
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
          username: currentUser.username,
          amount: parseFloat(balanceForm.amount),
          action: balanceForm.action,
          notes: balanceForm.notes,
          adminCurrency: currency, // Pass admin's current currency
        }),
      });

      const result = await response.json();

      if (result.success) {
        showModalToast(
          result.message || `Successfully ${
            balanceForm.action === 'add' ? 'added' : 'deducted'
          } balance ${balanceForm.action === 'add' ? 'to' : 'from'} ${currentUser.username}`,
          'success'
        );
        onClose();
        onBalanceUpdate();
      } else {
        showModalToast(result.error || 'Failed to update user balance', 'error');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      showModalToast('Failed to update user balance', 'error');
    } finally {
      setBalanceSubmitting(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] mx-4">
        <h3 className="text-lg font-semibold mb-4">Add/Deduct User Balance</h3>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">User: <span className="font-medium">{currentUser.username}</span></div>
          <div className="text-sm text-gray-600">User Currency: <span className="font-medium">{currentUser.currency || 'USD'}</span></div>
          <div className="text-sm text-gray-600">Current Balance: <span className="font-medium">৳{currentUser.balance?.toFixed(2) || '0.00'}</span> <span className="text-xs text-gray-500">(stored in BDT)</span></div>
          <div className="text-sm text-gray-600">Admin Currency: <span className="font-medium">{currency}</span></div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="form-label mb-2">Action <span className="text-red-500">*</span></label>
            <select
              value={balanceForm.action || 'add'}
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
                value={balanceForm.amount || ''}
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
              value={balanceForm.notes || ''}
              onChange={(e) =>
                setBalanceForm((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            />
          </div>

          {/* Conversion Preview */}
          {balanceForm.amount && parseFloat(balanceForm.amount) > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Conversion Preview:</div>
                <div>Admin Amount: {currentCurrencyData?.symbol || '$'}{balanceForm.amount} ({currency})</div>
                <div>Will be stored as: ৳{(() => {
                  const amount = parseFloat(balanceForm.amount);
                  if (currency === 'BDT') {
                    return amount.toFixed(2);
                  }
                  // Use the convertAmount function from context
                  const convertedAmount = convertAmount(amount, currency, 'BDT');
                  return convertedAmount.toFixed(2);
                })()} (BDT)</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleBalanceSubmit}
            disabled={!balanceForm.amount || balanceSubmitting}
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
  );
};

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  currentStatus,
  newStatus,
  onStatusChange,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Update User Status</h3>
        <div className="mb-4">
          <label className="form-label mb-2">Select New Status</label>
          <select
            value={newStatus || ''}
            onChange={(e) => onStatusChange(e.target.value)}
            className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
            disabled={isLoading}
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditDiscountModal: React.FC<EditDiscountModalProps> = ({
  isOpen,
  currentDiscount,
  newDiscount,
  onDiscountChange,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Edit Services Discount</h3>
        <div className="mb-4">
          <label className="form-label mb-2">Discount Percentage</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={newDiscount || ''}
            onChange={(e) => onDiscountChange(e.target.value)}
            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Enter discount percentage (0-100)"
            disabled={isLoading}
          />
          <div className="text-xs text-gray-500 mt-1">
            Enter a value between 0 and 100 (percentage)
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  isOpen,
  currentRole,
  newRole,
  onRoleChange,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
        <div className="mb-4">
          <label className="form-label mb-2">Select New Role</label>
          <select
            value={newRole || ''}
            onChange={(e) => onRoleChange(e.target.value)}
            className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
            disabled={isLoading}
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <div className="text-xs text-gray-500 mt-1">
            Current role:{' '}
            <span className="font-medium capitalize">{currentRole}</span>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component - cloned from Edit Balance pattern
const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  currentUser,
  formData,
  onFormDataChange,
  onClose,
  onConfirm,
  isLoading,
  onGeneratePassword,
}) => {
  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Edit User</h3>

        <div className="space-y-4">
          {/* Username */}
          <div className="mb-4">
            <label className="form-label mb-2">Username</label>
            <input
              type="text"
              value={formData.username || ''}
              onChange={(e) => onFormDataChange('username', e.target.value)}
              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Enter username"
              disabled={isLoading}
            />
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="form-label mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => onFormDataChange('name', e.target.value)}
              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Enter full name"
              disabled={isLoading}
            />
          </div>

          {/* User Email */}
          <div className="mb-4">
            <label className="form-label mb-2">User Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFormDataChange('email', e.target.value)}
              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Enter email address"
              disabled={isLoading}
            />
          </div>

          {/* Balance */}
          <div className="mb-4">
            <label className="form-label mb-2">Balance Amount (in USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.balance || ''}
              onChange={(e) => onFormDataChange('balance', e.target.value)}
              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="Enter balance amount"
              disabled={isLoading}
            />
          </div>

          {/* Email Confirmation */}
          <div className="mb-4">
            <label
              className={`flex items-center gap-3 ${
                currentUser.emailVerified ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.emailVerified}
                onChange={(e) =>
                  onFormDataChange('emailVerified', e.target.checked)
                }
                className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                  currentUser.emailVerified
                    ? 'opacity-75 cursor-not-allowed'
                    : ''
                }`}
                disabled={isLoading || currentUser.emailVerified}
                readOnly={currentUser.emailVerified}
              />
              <span className="form-label">
                Email Confirmed
                {currentUser.emailVerified && (
                  <span className="ml-2 text-xs text-green-600 font-medium">
                    (Already Verified)
                  </span>
                )}
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              {currentUser.emailVerified
                ? 'This user has already verified their email address'
                : "Check this if the user's email is verified"}
            </p>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label mb-2">Password</label>
            <div className="relative">
              <input
                type="text"
                value={formData.password || ''}
                onChange={(e) => onFormDataChange('password', e.target.value)}
                className="form-field w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Leave blank to keep current password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={onGeneratePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                title="Generate random password"
                disabled={isLoading}
              >
                <FaSync className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Leave blank to keep current password, or click the refresh icon to
              generate a new one
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;
