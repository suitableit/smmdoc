'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaEdit,
  FaEllipsisH,
  FaSearch,
  FaSync,
  FaTimes,
  FaTimesCircle,
  FaTrash,
  FaUserCheck,
  FaUserShield,
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
interface Admin {
  id: number;
  username: string;
  email: string;
  name?: string;
  balance: number;
  spent: number;
  totalOrders: number;
  servicesDiscount: number;
  specialPricing: boolean;
  status: 'active' | 'inactive';
  currency: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  role: 'admin' | 'moderator' | 'super_admin';
  permissions: string[];
  password?: string;
}

interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;
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

interface AdminActionsProps {
  admin: Admin;
  onEdit: (adminId: string) => void;
  onChangeRole: (adminId: string, currentRole: string) => void;
  onDelete: (adminId: string) => void;
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
  title: string;
  message: string;
}

interface UpdateStatusModalProps {
  isOpen: boolean;
  currentStatus: string;
  newStatus: string;
  onStatusChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
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

interface EditAdminModalProps {
  isOpen: boolean;
  admin: Admin | null;
  onClose: () => void;
  onSave: (adminData: Partial<Admin>) => void;
  isLoading: boolean;
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

const AdminsListPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `All Admins — ${APP_NAME}`;
  }, []);

  // State management
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalAdmins: 0,
    activeAdmins: 0,
    inactiveAdmins: 0,
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New state for action modals
  const [updateStatusDialog, setUpdateStatusDialog] = useState<{
    open: boolean;
    adminId: number;
    currentStatus: string;
  }>({
    open: false,
    adminId: '',
    currentStatus: '',
  });
  const [newStatus, setNewStatus] = useState('');
  const [changeRoleDialog, setChangeRoleDialog] = useState<{
    open: boolean;
    adminId: number;
    currentRole: string;
  }>({
    open: false,
    adminId: '',
    currentRole: '',
  });
  const [newRole, setNewRole] = useState('');

  // Edit modal state
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    admin: Admin | null;
  }>({
    open: false,
    admin: null,
  });
  const [editFormData, setEditFormData] = useState<Partial<Admin>>({});

  // Use debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Memoized filter options
  const filterOptions = useMemo(
    () => [
      { key: 'all', label: 'All', count: stats.totalAdmins },
      { key: 'active', label: 'Active', count: stats.activeAdmins },
      { key: 'inactive', label: 'Inactive', count: stats.inactiveAdmins },
    ],
    [stats]
  );

  // API functions
  const fetchAdmins = useCallback(async () => {
    try {
      setAdminsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        role: 'admin,moderator,super_admin', // Filter for admin roles only
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        // Filter data to only include admin roles on client side as backup
        const adminData = (result.data || []).filter((user: Admin) =>
          ['admin', 'moderator', 'super_admin'].includes(user.role)
        );
        setAdmins(adminData);
        setPagination((prev) => ({
          ...prev,
          ...result.pagination,
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      showToast(
        error instanceof Error ? error.message : 'Error fetching admins',
        'error'
      );
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
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
          totalAdmins: data.overview?.totalUsers || 0,
          activeAdmins: statusBreakdown.active || 0,
          inactiveAdmins: statusBreakdown.inactive || 0,
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
    fetchAdmins();
  }, [fetchAdmins]);

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
      inactive: <FaClock className="h-3 w-3 text-gray-500" />,
    };
    return icons[status as keyof typeof icons] || icons.inactive;
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      super_admin: <FaCrown className="h-3 w-3 text-yellow-500" />,
      admin: null, // No icon for admin
      moderator: <FaUserShield className="h-3 w-3 text-purple-500" />,
    };
    return icons[role as keyof typeof icons] || null;
  };

  // Updated formatCurrency function to only show USD with comma separators
  const formatCurrency = useCallback((amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  const handleEditAdmin = useCallback(
    (adminId: string) => {
      const admin = admins.find((a) => a.id === adminId);
      if (admin) {
        setEditDialog({ open: true, admin });
        setEditFormData({
          username: admin.username,
          email: admin.email,
          name: admin.name,
          balance: admin.balance,
          status: admin.status,
          role: admin.role,
        });
      }
    },
    [admins]
  );

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchAdmins(), fetchStats()]);
    showToast('Data refreshed successfully!', 'success');
  }, [fetchAdmins, fetchStats, showToast]);

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
          await fetchAdmins();
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
    [fetchAdmins, fetchStats, showToast]
  );

  // Handle admin deletion
  const handleDeleteAdmin = useCallback(
    async (adminId: string) => {
      const success = await handleApiAction(
        `/api/admin/users/${adminId}`,
        'DELETE',
        undefined,
        'Admin deleted successfully'
      );

      if (success) {
        setDeleteDialogOpen(false);
        setAdminToDelete(null);
      }
    },
    [handleApiAction]
  );

  // Handle admin status update
  const handleStatusUpdate = useCallback(
    async (adminId: string, newStatus: string) => {
      return handleApiAction(
        `/api/admin/users/${adminId}/status`,
        'PATCH',
        { status: newStatus },
        `Admin status updated to ${newStatus}`
      );
    },
    [handleApiAction]
  );

  // Handle change role
  const handleChangeRole = useCallback(
    async (adminId: string, role: string) => {
      const success = await handleApiAction(
        `/api/admin/users/${adminId}/role`,
        'PATCH',
        { role },
        `Admin role updated to ${role}`
      );

      if (success) {
        setChangeRoleDialog({ open: false, adminId: '', currentRole: '' });
        setNewRole('');
      }
    },
    [handleApiAction]
  );

  // Modal handlers
  const openUpdateStatusDialog = useCallback(
    (adminId: string, currentStatus: string) => {
      setUpdateStatusDialog({ open: true, adminId, currentStatus });
      setNewStatus(currentStatus);
    },
    []
  );

  const openChangeRoleDialog = useCallback(
    (adminId: string, currentRole: string) => {
      setChangeRoleDialog({ open: true, adminId, currentRole });
      setNewRole(currentRole);
    },
    []
  );

  // Handle edit admin save
  const handleEditSave = useCallback(
    async (adminData: Partial<Admin>) => {
      if (!editDialog.admin) return;

      const success = await handleApiAction(
        `/api/admin/users/${editDialog.admin.id}`,
        'PATCH',
        adminData,
        'Admin updated successfully'
      );

      if (success) {
        setEditDialog({ open: false, admin: null });
        setEditFormData({});
      }
    },
    [editDialog.admin, handleApiAction]
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
        {/* Controls Section */}
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
                disabled={adminsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync
                  className={adminsLoading ? 'animate-spin' : ''}
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
                  } admins...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="username">Username</option>
                <option value="id">Admin ID</option>
                <option value="email">Admin Email</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admins Table */}
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
                    {stats.totalAdmins.toLocaleString()}
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
                    {stats.activeAdmins.toLocaleString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
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
                    {stats.inactiveAdmins.toLocaleString()}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {adminsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">Loading admins...</div>
                </div>
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-12">
                <FaUserShield
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No admins found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {debouncedSearchTerm && statusFilter !== 'all'
                    ? `No ${statusFilter} admins match your search "${debouncedSearchTerm}".`
                    : debouncedSearchTerm
                    ? `No admins match your search "${debouncedSearchTerm}".`
                    : statusFilter !== 'all'
                    ? `No ${statusFilter} admins found.`
                    : 'No admins exist yet.'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[1400px]">
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
                          Role
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
                          Registered Date
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Last Login
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
                      {admins.map((admin) => (
                        <tr
                          key={admin.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{admin.id?.slice(-8) || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {admin.username || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {admin.email || 'null'}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {admin.emailVerified ? (
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
                            <div className="flex items-center gap-2">
                              {getRoleIcon(admin.role)}
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  admin.role === 'super_admin'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : admin.role === 'admin'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {admin.role === 'super_admin'
                                  ? 'SUPER ADMIN'
                                  : admin.role === 'admin'
                                  ? 'Admin'
                                  : 'MODERATOR'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-left">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {formatCurrency(admin.balance || 0)}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {admin.createdAt
                                  ? new Date(
                                      admin.createdAt
                                    ).toLocaleDateString()
                                  : 'null'}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {admin.createdAt
                                  ? new Date(
                                      admin.createdAt
                                    ).toLocaleTimeString()
                                  : 'null'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              {admin.lastLoginAt ? (
                                <>
                                  <div
                                    className="text-xs"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {new Date(
                                      admin.lastLoginAt
                                    ).toLocaleDateString()}
                                  </div>
                                  <div
                                    className="text-xs"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {new Date(
                                      admin.lastLoginAt
                                    ).toLocaleTimeString()}
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-gray-500">
                                  Never
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <AdminActions
                              admin={admin}
                              onEdit={handleEditAdmin}
                              onChangeRole={openChangeRoleDialog}
                              onDelete={(adminId) => {
                                setAdminToDelete(adminId);
                                setDeleteDialogOpen(true);
                              }}
                              isLoading={actionLoading === admin.id}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  isLoading={adminsLoading}
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
            setAdminToDelete(null);
          }}
          onConfirm={() => adminToDelete && handleDeleteAdmin(adminToDelete)}
          isLoading={actionLoading === `/api/admin/users/${adminToDelete}`}
          title="Delete Admin"
          message="Are you sure you want to delete this admin? This action cannot be undone and will permanently remove all admin data and access."
        />

        <UpdateStatusModal
          isOpen={updateStatusDialog.open}
          currentStatus={updateStatusDialog.currentStatus}
          newStatus={newStatus}
          onStatusChange={setNewStatus}
          onClose={() => {
            setUpdateStatusDialog({
              open: false,
              adminId: '',
              currentStatus: '',
            });
            setNewStatus('');
          }}
          onConfirm={() => {
            handleStatusUpdate(updateStatusDialog.adminId, newStatus).then(
              (success) => {
                if (success) {
                  setUpdateStatusDialog({
                    open: false,
                    adminId: '',
                    currentStatus: '',
                  });
                  setNewStatus('');
                }
              }
            );
          }}
          isLoading={
            actionLoading ===
            `/api/admin/users/${updateStatusDialog.adminId}/status`
          }
          title="Update Admin Status"
        />

        <ChangeRoleModal
          isOpen={changeRoleDialog.open}
          currentRole={changeRoleDialog.currentRole}
          newRole={newRole}
          onRoleChange={setNewRole}
          onClose={() => {
            setChangeRoleDialog({ open: false, adminId: '', currentRole: '' });
            setNewRole('');
          }}
          onConfirm={() => {
            handleChangeRole(changeRoleDialog.adminId, newRole).then(
              (success) => {
                if (success) {
                  setChangeRoleDialog({
                    open: false,
                    adminId: '',
                    currentRole: '',
                  });
                  setNewRole('');
                }
              }
            );
          }}
          isLoading={
            actionLoading ===
            `/api/admin/users/${changeRoleDialog.adminId}/role`
          }
        />

        <EditAdminModal
          isOpen={editDialog.open}
          admin={editDialog.admin}
          onClose={() => {
            setEditDialog({ open: false, admin: null });
            setEditFormData({
              username: '',
              email: '',
              name: '',
              status: 'active',
              role: 'admin',
              password: '',
              permissions: [],
            });
          }}
          onSave={handleEditSave}
          isLoading={
            actionLoading === `/api/admin/users/${editDialog.admin?.id}`
          }
        />
      </div>
    </div>
  );
};

// Extracted Components for better organization
const AdminActions: React.FC<AdminActionsProps> = ({
  admin,
  onEdit,
  onChangeRole,
  onDelete,
  isLoading,
}) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onEdit(admin.id)}
        className="btn btn-secondary p-2"
        title="Edit Admin"
        disabled={isLoading}
      >
        <FaEdit className="h-3 w-3" />
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
                  onChangeRole(admin.id, admin.role);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaUserCheck className="h-3 w-3" />
                Change Role
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  onDelete(admin.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <FaTrash className="h-3 w-3" />
                Delete Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
        ).toLocaleString()} of ${pagination.total.toLocaleString()} admins`
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
          `Page ${pagination.page.toLocaleString()} of ${pagination.totalPages.toLocaleString()}`
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
        <h3 className="text-lg font-semibold mb-4 text-red-600">
          Delete Admin?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this admin? This action cannot be
          undone and will permanently remove all admin data.
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

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  currentStatus,
  newStatus,
  onStatusChange,
  onClose,
  onConfirm,
  isLoading,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
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
        <h3 className="text-lg font-semibold mb-4">Change Admin Role</h3>
        <div className="mb-4">
          <label className="form-label mb-2">Select New Role</label>
          <select
            value={newRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
            disabled={isLoading}
          >
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
          <div className="text-xs text-gray-500 mt-1">
            Current role:{' '}
            <span className="font-medium capitalize">
              {currentRole.replace('_', ' ')}
            </span>
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

const EditAdminModal: React.FC<EditAdminModalProps> = ({
  isOpen,
  admin,
  onClose,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<Admin>>({});

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username,
        email: admin.email,
        name: admin.name || '',
        status: admin.status,
        role: admin.role,
        password: '',
        permissions: admin.permissions || [],
      });
    }
  }, [admin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof Admin, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData((prev) => ({ ...prev, password: password }));
  };

  // Available permissions
  const availablePermissions = [
    { id: 'view_users', label: 'View Users' },
    { id: 'moderate_content', label: 'Moderate Content' },
    { id: 'manage_tickets', label: 'Manage Tickets' },
    { id: 'handle_disputes', label: 'Handle Disputes' },
    { id: 'view_reports', label: 'View Reports' },
    { id: 'manage_announcements', label: 'Manage Announcements' },
  ];

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...(prev.permissions || []), permissionId]
        : (prev.permissions || []).filter((p) => p !== permissionId),
    }));
  };

  const handleSelectAllPermissions = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked ? availablePermissions.map((p) => p.id) : [],
    }));
  };

  const getSelectAllState = () => {
    const currentPermissions = formData.permissions || [];
    if (currentPermissions.length === 0)
      return { checked: false, indeterminate: false };
    if (currentPermissions.length === availablePermissions.length)
      return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Edit Admin</h3>

        <div className="space-y-4">
          {/* Username */}
          <div className="mb-4">
            <label className="form-label mb-2">Username</label>
            <input
              type="text"
              value={formData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Enter username"
              disabled={isLoading}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="form-label mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Enter email address"
              disabled={isLoading}
              required
            />
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="form-label mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Enter full name"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label mb-2">Password</label>
            <div className="relative">
              <input
                type="text"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="form-field w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Leave blank to keep current password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={generatePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-purple-600 transition-colors duration-200"
                title="Generate random password"
                disabled={isLoading}
              >
                <FaSync className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to keep current password, or click the refresh icon to
              generate a new one
            </p>
          </div>

          {/* Status - Only show for non-Admin roles */}
          {formData.role !== 'admin' && (
            <div className="mb-4">
              <label className="form-label mb-2">Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                disabled={isLoading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          {/* Role */}
          <div className="mb-4">
            <label className="form-label mb-2">Role</label>
            <select
              value={formData.role || 'admin'}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
              disabled={isLoading}
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Permissions - Only show for Moderator role */}
          {formData.role === 'moderator' && (
            <div className="mb-4">
              <label className="form-label mb-2">Permissions</label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Select All Option */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getSelectAllState().checked}
                      ref={(el) => {
                        if (el)
                          el.indeterminate = getSelectAllState().indeterminate;
                      }}
                      onChange={(e) =>
                        handleSelectAllPermissions(e.target.checked)
                      }
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      disabled={isLoading}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Select All Permissions
                    </span>
                  </label>
                </div>

                {/* Individual Permissions */}
                <div className="grid grid-cols-2 gap-3">
                  {availablePermissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(formData.permissions || []).includes(
                          permission.id
                        )}
                        onChange={(e) =>
                          handlePermissionChange(
                            permission.id,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700">
                        {permission.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Status Message */}
                {formData.permissions && formData.permissions.length === 0 ? (
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                    No permissions selected. Moderator will have limited access.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                    {formData.permissions?.length || 0} of{' '}
                    {availablePermissions.length} permissions selected.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-6">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
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

export default AdminsListPage;
