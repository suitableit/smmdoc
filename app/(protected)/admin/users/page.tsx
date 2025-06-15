'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaDownload,
  FaEllipsisH,
  FaExclamationCircle,
  FaEye,
  FaSearch,
  FaSync,
  FaTimes,
  FaTimesCircle,
  FaTrash,
  FaBan,
  FaUserCheck,
  FaEdit,
  FaUserTimes,
  FaCoins,
  FaGift,
} from 'react-icons/fa';

// Import APP_NAME constant
import { APP_NAME } from '@/lib/constants';

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
  id: string;
  username: string;
  email: string;
  name?: string;
  balance: number;
  spent: number;
  totalOrders: number;
  servicesDiscount: number;
  specialPricing: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  currency: string;
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

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
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
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New state for action modals
  const [editBalanceDialog, setEditBalanceDialog] = useState<{
    open: boolean;
    userId: string;
    currentBalance: number;
  }>({
    open: false,
    userId: '',
    currentBalance: 0,
  });
  const [newBalance, setNewBalance] = useState('');
  const [updateStatusDialog, setUpdateStatusDialog] = useState<{
    open: boolean;
    userId: string;
    currentStatus: string;
  }>({
    open: false,
    userId: '',
    currentStatus: '',
  });
  const [newStatus, setNewStatus] = useState('');
  const [editDiscountDialog, setEditDiscountDialog] = useState<{
    open: boolean;
    userId: string;
    currentDiscount: number;
  }>({
    open: false,
    userId: '',
    currentDiscount: 0,
  });
  const [newDiscount, setNewDiscount] = useState('');

  // Use debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Memoized filter options
  const filterOptions = useMemo(() => [
    { key: 'all', label: 'All', count: stats.totalUsers },
    { key: 'active', label: 'Active', count: stats.activeUsers },
    { key: 'inactive', label: 'Inactive', count: stats.statusBreakdown?.inactive || 0 },
    { key: 'suspended', label: 'Suspended', count: stats.suspendedUsers },
    { key: 'banned', label: 'Banned', count: stats.bannedUsers },
  ], [stats]);

  // API functions
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();

      if (result.success) {
        setUsers(result.data || []);
        setPagination(prev => ({
          ...prev,
          ...result.pagination,
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast(error instanceof Error ? error.message : 'Error fetching users', 'error');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/admin/users/stats?period=all');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
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
  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Utility functions
  const getStatusIcon = (status: string) => {
    const icons = {
      active: <FaCheckCircle className="h-3 w-3 text-green-500" />,
      inactive: <FaClock className="h-3 w-3 text-gray-500" />,
      suspended: <FaExclamationCircle className="h-3 w-3 text-yellow-500" />,
      banned: <FaBan className="h-3 w-3 text-red-500" />,
    };
    return icons[status as keyof typeof icons] || icons.inactive;
  };

  const formatCurrency = useCallback((amount: number, currency: string) => {
    const formatters = {
      USD: (amt: number) => `$${amt.toFixed(2)}`,
      BDT: (amt: number) => `৳${amt.toFixed(2)}`,
    };
    return formatters[currency as keyof typeof formatters]?.(amount) || `$${amount.toFixed(2)}`;
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedUsers(prev => 
      prev.length === users.length ? [] : users.map(user => user.id)
    );
  }, [users]);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleViewUser = useCallback((userId: string) => {
    window.open(`/admin/users/${userId}`, '_blank');
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchStats()]);
    showToast('Data refreshed successfully!', 'success');
  }, [fetchUsers, fetchStats, showToast]);

  const handleExport = useCallback(() => {
    showToast('Export started! Download will begin shortly.', 'info');
    // Implement actual export logic here
  }, [showToast]);

  // Generic API action handler
  const handleApiAction = useCallback(async (
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

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
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
      showToast(error instanceof Error ? error.message : 'Operation failed', 'error');
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [fetchUsers, fetchStats, showToast]);

  // Handle user deletion
  const handleDeleteUser = useCallback(async (userId: string) => {
    const success = await handleApiAction(
      `/api/admin/users/${userId}`,
      'DELETE',
      undefined,
      'User deleted successfully'
    );
    
    if (success) {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }, [handleApiAction]);

  // Handle user status update
  const handleStatusUpdate = useCallback(async (userId: string, newStatus: string) => {
    return handleApiAction(
      `/api/admin/users/${userId}/status`,
      'PATCH',
      { status: newStatus },
      `User status updated to ${newStatus}`
    );
  }, [handleApiAction]);

  // Handle edit balance
  const handleEditBalance = useCallback(async (userId: string, balance: number) => {
    const success = await handleApiAction(
      `/api/admin/users/${userId}/balance`,
      'PATCH',
      { balance },
      'User balance updated successfully'
    );
    
    if (success) {
      setEditBalanceDialog({ open: false, userId: '', currentBalance: 0 });
      setNewBalance('');
    }
  }, [handleApiAction]);

  // Handle edit discount
  const handleEditDiscount = useCallback(async (userId: string, discount: number) => {
    const success = await handleApiAction(
      `/api/admin/users/${userId}/discount`,
      'PATCH',
      { servicesDiscount: discount },
      'Services discount updated successfully'
    );
    
    if (success) {
      setEditDiscountDialog({ open: false, userId: '', currentDiscount: 0 });
      setNewDiscount('');
    }
  }, [handleApiAction]);

  // Handle reset special pricing
  const handleResetSpecialPricing = useCallback(async (userId: string) => {
    return handleApiAction(
      `/api/admin/users/${userId}/special-pricing`,
      'PATCH',
      { specialPricing: false },
      'Special pricing reset successfully'
    );
  }, [handleApiAction]);

  // Handle set new API key
  const handleSetNewApiKey = useCallback(async (userId: string) => {
    return handleApiAction(
      `/api/admin/users/${userId}/api-key`,
      'POST',
      {},
      'New API key generated successfully'
    );
  }, [handleApiAction]);

  // Handle edit user (redirect to edit page)
  const handleEditUser = useCallback((userId: string) => {
    window.open(`/admin/users/${userId}/edit`, '_blank');
  }, []);

  // Modal handlers
  const openEditBalanceDialog = useCallback((userId: string, currentBalance: number) => {
    setEditBalanceDialog({ open: true, userId, currentBalance });
    setNewBalance(currentBalance.toString());
  }, []);

  const openUpdateStatusDialog = useCallback((userId: string, currentStatus: string) => {
    setUpdateStatusDialog({ open: true, userId, currentStatus });
    setNewStatus(currentStatus);
  }, []);

  const openEditDiscountDialog = useCallback((userId: string, currentDiscount: number) => {
    setEditDiscountDialog({ open: true, userId, currentDiscount });
    setNewDiscount(currentDiscount.toString());
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
        {/* Page Header */}
        <div className="page-header mb-6">
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={usersLoading || statsLoading}
              className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <FaSync className={usersLoading || statsLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaDownload />
              Export
            </button>
          </div>
        </div>

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

        {/* Filter Buttons and Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Left: Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
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
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
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
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'inactive'
                  ? 'bg-gradient-to-r from-gray-600 to-gray-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Inactive
              <span
                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  statusFilter === 'inactive'
                    ? 'bg-white/20'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {(stats.statusBreakdown?.inactive || 0).toLocaleString()}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
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
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
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

          {/* Right: Search Bar */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:min-w-[300px]">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            <div className="flex items-center gap-2 flex-1">
              <div className="card-icon">
                <FaUsers />
              </div>
              <h3 className="card-title">Users List ({pagination.total.toLocaleString()})</h3>
              <span className="ml-auto bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium">
                Manage Users
              </span>
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {selectedUsers.length} selected
                </span>
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  disabled={actionLoading !== null}
                >
                  <FaTrash />
                  Delete Selected
                </button>
              </div>
            )}
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
                  {debouncedSearchTerm || statusFilter !== 'all' 
                    ? 'No users match your current filters.' 
                    : 'No users exist yet.'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[1200px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>ID</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Username</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Email</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Balance</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Spent</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Orders</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Services Discount</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Special Pricing</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Registered Date</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{user.id?.slice(-8) || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                              {user.username || 'null'}
                            </div>
                            {user.role !== 'user' && (
                              <div className={`text-xs px-2 py-1 rounded-full mt-1 w-fit ${
                                user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {user.email || 'null'}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
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
                          </td>
                          <td className="p-3">
                            <div className="text-right">
                              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {formatCurrency(user.balance || 0, user.currency || 'USD')}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-right">
                              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {formatCurrency(user.spent || 0, user.currency || 'USD')}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-center">
                              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {(user.totalOrders || 0).toLocaleString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-center">
                              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {user.servicesDiscount || 0}%
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-center">
                              {user.specialPricing ? (
                                <div className="flex items-center justify-center">
                                  <FaGift className="h-4 w-4 text-purple-500" />
                                  <span className="text-xs text-purple-600 ml-1">Yes</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">No</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'null'}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {user.createdAt ? new Date(user.createdAt).toLocaleTimeString() : 'null'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <UserActions
                              user={user}
                              onView={handleViewUser}
                              onEditUser={handleEditUser}
                              onEditBalance={openEditBalanceDialog}
                              onEditDiscount={openEditDiscountDialog}
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
                <div className="lg:hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        isSelected={selectedUsers.includes(user.id)}
                        onSelect={handleSelectUser}
                        onView={handleViewUser}
                        onEditBalance={openEditBalanceDialog}
                        onEditDiscount={openEditDiscountDialog}
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

        <EditBalanceModal
          isOpen={editBalanceDialog.open}
          currentBalance={editBalanceDialog.currentBalance}
          newBalance={newBalance}
          onBalanceChange={setNewBalance}
          onClose={() => {
            setEditBalanceDialog({ open: false, userId: '', currentBalance: 0 });
            setNewBalance('');
          }}
          onConfirm={() => handleEditBalance(editBalanceDialog.userId, parseFloat(newBalance) || 0)}
          isLoading={actionLoading === `/api/admin/users/${editBalanceDialog.userId}/balance`}
        />

        <UpdateStatusModal
          isOpen={updateStatusDialog.open}
          currentStatus={updateStatusDialog.currentStatus}
          newStatus={newStatus}
          onStatusChange={setNewStatus}
          onClose={() => {
            setUpdateStatusDialog({ open: false, userId: '', currentStatus: '' });
            setNewStatus('');
          }}
          onConfirm={() => {
            handleStatusUpdate(updateStatusDialog.userId, newStatus).then((success) => {
              if (success) {
                setUpdateStatusDialog({ open: false, userId: '', currentStatus: '' });
                setNewStatus('');
              }
            });
          }}
          isLoading={actionLoading === `/api/admin/users/${updateStatusDialog.userId}/status`}
        />

        <EditDiscountModal
          isOpen={editDiscountDialog.open}
          currentDiscount={editDiscountDialog.currentDiscount}
          newDiscount={newDiscount}
          onDiscountChange={setNewDiscount}
          onClose={() => {
            setEditDiscountDialog({ open: false, userId: '', currentDiscount: 0 });
            setNewDiscount('');
          }}
          onConfirm={() => handleEditDiscount(editDiscountDialog.userId, parseInt(newDiscount) || 0)}
          isLoading={actionLoading === `/api/admin/users/${editDiscountDialog.userId}/discount`}
        />
      </div>
    </div>
  );
};

// Extracted Components for better organization
const UserActions = ({ user, onView, onEditUser, onEditBalance, onEditDiscount, onResetSpecialPricing, onSetNewApiKey, onUpdateStatus, onDelete, isLoading }) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onView(user.id)}
        className="btn btn-secondary p-2"
        title="View User Details"
        disabled={isLoading}
      >
        <FaEye className="h-3 w-3" />
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
                  onEditBalance(user.id, user.balance || 0);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaCoins className="h-3 w-3" />
                Edit Balance
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

const UserCard = ({ user, isSelected, onSelect, onView, onEditUser, onEditBalance, onEditDiscount, onResetSpecialPricing, onSetNewApiKey, onUpdateStatus, onDelete, formatCurrency, isLoading }) => (
  <div className="card card-padding border-l-4 border-blue-500 mb-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(user.id)}
          className="rounded border-gray-300 w-4 h-4"
        />
        <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
          #{user.id?.slice(-8) || 'null'}
        </div>
      </div>
      <UserActions
        user={user}
        onView={onView}
        onEditUser={onEditUser}
        onEditBalance={onEditBalance}
        onEditDiscount={onEditDiscount}
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
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Username</div>
          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{user.username || 'null'}</div>
          {user.role !== 'user' && (
            <div className={`text-xs px-2 py-1 rounded-full mt-1 w-fit ${
              user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {user.role}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Special Pricing</div>
          {user.specialPricing ? (
            <div className="flex items-center justify-end">
              <FaGift className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-purple-600 ml-1">Yes</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">No</span>
          )}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Email</div>
        <div className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{user.email || 'null'}</div>
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
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Balance</div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(user.balance || 0, user.currency || 'USD')}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Total Spent</div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(user.spent || 0, user.currency || 'USD')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Total Orders</div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {(user.totalOrders || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Services Discount</div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {user.servicesDiscount || 0}%
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'null'}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Time: {user.createdAt ? new Date(user.createdAt).toLocaleTimeString() : 'null'}
        </div>
        {user.lastLoginAt && (
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  </div>
);

const Pagination = ({ pagination, onPageChange, isLoading }) => (
  <div className="flex items-center justify-between pt-4 border-t" style={{ padding: '16px 24px 24px 24px' }}>
    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <GradientSpinner size="w-4 h-4" />
          <span>Loading pagination...</span>
        </div>
      ) : (
        `Showing ${((pagination.page - 1) * pagination.limit + 1).toLocaleString()} to ${Math.min(
          pagination.page * pagination.limit,
          pagination.total
        ).toLocaleString()} of ${pagination.total.toLocaleString()} users`
      )}
    </div>
    <div className="flex items-center gap-2">
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
        onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
        disabled={!pagination.hasNext || isLoading}
        className="btn btn-secondary disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
);

// Modal Components
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Delete User</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger" disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditBalanceModal = ({ isOpen, currentBalance, newBalance, onBalanceChange, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Edit User Balance</h3>
        <div className="mb-4">
          <label className="form-label mb-2">New Balance Amount</label>
          <input
            type="number"
            step="0.01"
            value={newBalance}
            onChange={(e) => onBalanceChange(e.target.value)}
            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Enter new balance amount"
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UpdateStatusModal = ({ isOpen, currentStatus, newStatus, onStatusChange, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Update User Status</h3>
        <div className="mb-4">
          <label className="form-label mb-2">Select New Status</label>
          <select
            value={newStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
            disabled={isLoading}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditDiscountModal = ({ isOpen, currentDiscount, newDiscount, onDiscountChange, onClose, onConfirm, isLoading }) => {
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
            value={newDiscount}
            onChange={(e) => onDiscountChange(e.target.value)}
            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Enter discount percentage (0-100)"
            disabled={isLoading}
          />
          <div className="text-xs text-gray-500 mt-1">
            Enter a value between 0 and 100 (percentage)
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;