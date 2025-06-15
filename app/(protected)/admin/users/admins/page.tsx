'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FaUserShield,
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
  FaCrown,
  FaShieldAlt,
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
  id: string;
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
}

interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
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
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
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
    adminId: string;
    currentStatus: string;
  }>({
    open: false,
    adminId: '',
    currentStatus: '',
  });
  const [newStatus, setNewStatus] = useState('');

  // Use debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();

      if (result.success) {
        // Filter data to only include admin roles on client side as backup
        const adminData = (result.data || []).filter(user => 
          ['admin', 'moderator', 'super_admin'].includes(user.role)
        );
        setAdmins(adminData);
        setPagination(prev => ({
          ...prev,
          ...result.pagination,
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      showToast(error instanceof Error ? error.message : 'Error fetching admins', 'error');
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      // Fetch all users and filter for admin roles to calculate stats
      const response = await fetch('/api/admin/users?limit=1000&role=admin,moderator,super_admin');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();

      if (result.success) {
        const allAdmins = (result.data || []).filter(user => 
          ['admin', 'moderator', 'super_admin'].includes(user.role)
        );
        
        // Calculate stats from filtered admin data
        const statusBreakdown: Record<string, number> = {};
        let activeCount = 0;
        let totalBalance = 0;
        let totalSpent = 0;
        
        allAdmins.forEach((admin: Admin) => {
          // Count by status
          const status = admin.status || 'inactive';
          statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
          
          if (status === 'active') {
            activeCount++;
          }
        });

        setStats({
          totalAdmins: allAdmins.length,
          activeAdmins: activeCount,
          totalBalance: 0,
          totalSpent: 0,
          todayRegistrations: 0, // Would need separate endpoint for today's registrations
          statusBreakdown,
        });
      } else {
        throw new Error(result.error || 'Failed to fetch admin stats');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      showToast('Error loading admin statistics', 'error');
      // Set default stats on error
      setStats({
        totalAdmins: 0,
        activeAdmins: 0,
        totalBalance: 0,
        totalSpent: 0,
        todayRegistrations: 0,
        statusBreakdown: {},
      });
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

  const formatCurrency = useCallback((amount: number, currency: string) => {
    const formatters = {
      USD: (amt: number) => `$${amt.toFixed(2)}`,
      BDT: (amt: number) => `৳${amt.toFixed(2)}`,
    };
    return formatters[currency as keyof typeof formatters]?.(amount) || `$${amount.toFixed(2)}`;
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedAdmins(prev => 
      prev.length === admins.length ? [] : admins.map(admin => admin.id)
    );
  }, [admins]);

  const handleSelectAdmin = useCallback((adminId: string) => {
    setSelectedAdmins(prev =>
      prev.includes(adminId)
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  }, []);

  const handleViewAdmin = useCallback((adminId: string) => {
    window.open(`/admin/users/${adminId}`, '_blank');
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchAdmins(), fetchStats()]);
    showToast('Data refreshed successfully!', 'success');
  }, [fetchAdmins, fetchStats, showToast]);

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
        await fetchAdmins();
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
  }, [fetchAdmins, fetchStats, showToast]);

  // Handle admin deletion
  const handleDeleteAdmin = useCallback(async (adminId: string) => {
    const success = await handleApiAction(
      `/api/admin/admins/${adminId}`,
      'DELETE',
      undefined,
      'Admin deleted successfully'
    );
    
    if (success) {
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  }, [handleApiAction]);

  // Handle admin status update
  const handleStatusUpdate = useCallback(async (adminId: string, newStatus: string) => {
    return handleApiAction(
      `/api/admin/admins/${adminId}/status`,
      'PATCH',
      { status: newStatus },
      `Admin status updated to ${newStatus}`
    );
  }, [handleApiAction]);

  // Handle edit balance
  const handleEditBalance = useCallback(async (adminId: string, balance: number) => {
    const success = await handleApiAction(
      `/api/admin/admins/${adminId}/balance`,
      'PATCH',
      { balance },
      'Admin balance updated successfully'
    );
    
    if (success) {
      setEditBalanceDialog({ open: false, adminId: '', currentBalance: 0 });
      setNewBalance('');
    }
  }, [handleApiAction]);

  // Handle edit discount
  const handleEditDiscount = useCallback(async (adminId: string, discount: number) => {
    const success = await handleApiAction(
      `/api/admin/admins/${adminId}/discount`,
      'PATCH',
      { servicesDiscount: discount },
      'Services discount updated successfully'
    );
    
    if (success) {
      setEditDiscountDialog({ open: false, adminId: '', currentDiscount: 0 });
      setNewDiscount('');
    }
  }, [handleApiAction]);

  // Modal handlers
  const openUpdateStatusDialog = useCallback((adminId: string, currentStatus: string) => {
    setUpdateStatusDialog({ open: true, adminId, currentStatus });
    setNewStatus(currentStatus);
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
              disabled={adminsLoading || statsLoading}
              className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <FaSync className={adminsLoading || statsLoading ? 'animate-spin' : ''} />
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
                {stats.totalAdmins.toLocaleString()}
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
                {stats.activeAdmins.toLocaleString()}
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
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            <div className="flex items-center gap-2 flex-1">
              <div className="card-icon">
                <FaUserShield />
              </div>
              <h3 className="card-title">Admins List ({pagination.total.toLocaleString()})</h3>
              <span className="ml-auto bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium">
                Manage Admins
              </span>
            </div>
            {selectedAdmins.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {selectedAdmins.length} selected
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
                  {debouncedSearchTerm || statusFilter !== 'all' 
                    ? 'No admins match your current filters.' 
                    : 'No admins exist yet.'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[1200px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>ID</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Username</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Email</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Role</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Balance</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Registered Date</th>
                        <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              #{admin.id?.slice(-8) || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                              {admin.username || 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {admin.email || 'null'}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {admin.emailVerified ? (
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
                            <div className="flex items-center gap-2">
                              {getRoleIcon(admin.role)}
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                admin.role === 'super_admin' 
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : admin.role === 'admin'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {admin.role === 'super_admin' ? 'SUPER ADMIN' : admin.role === 'admin' ? 'ADMIN' : 'MODERATOR'}
                              </span>
                            </div>
                            {admin.permissions && admin.permissions.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {admin.permissions.length} permissions
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="text-left">
                              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {formatCurrency(admin.balance || 0, admin.currency || 'USD')}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'null'}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {admin.createdAt ? new Date(admin.createdAt).toLocaleTimeString() : 'null'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <AdminActions
                              admin={admin}
                              onView={handleViewAdmin}
                              onUpdateStatus={openUpdateStatusDialog}
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

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {admins.map((admin) => (
                      <AdminCard
                        key={admin.id}
                        admin={admin}
                        isSelected={selectedAdmins.includes(admin.id)}
                        onSelect={handleSelectAdmin}
                        onView={handleViewAdmin}
                        onUpdateStatus={openUpdateStatusDialog}
                        onDelete={(adminId) => {
                          setAdminToDelete(adminId);
                          setDeleteDialogOpen(true);
                        }}
                        getRoleIcon={getRoleIcon}
                        isLoading={actionLoading === admin.id}
                      />
                    ))}
                  </div>
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
            setUpdateStatusDialog({ open: false, adminId: '', currentStatus: '' });
            setNewStatus('');
          }}
          onConfirm={() => {
            handleStatusUpdate(updateStatusDialog.adminId, newStatus).then((success) => {
              if (success) {
                setUpdateStatusDialog({ open: false, adminId: '', currentStatus: '' });
                setNewStatus('');
              }
            });
          }}
          isLoading={actionLoading === `/api/admin/users/${updateStatusDialog.adminId}/status`}
          title="Update Admin Status"
        />
      </div>
    </div>
  );
};

// Extracted Components for better organization
const AdminActions = ({ admin, onView, onUpdateStatus, onDelete, isLoading }) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onView(admin.id)}
        className="btn btn-secondary p-2"
        title="View Admin Details"
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
                  onUpdateStatus(admin.id, admin.status);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaSync className="h-3 w-3" />
                Update Status
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

const AdminCard = ({ admin, isSelected, onSelect, onView, onUpdateStatus, onDelete, getRoleIcon, isLoading }) => (
  <div className="card card-padding border-l-4 border-blue-500 mb-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(admin.id)}
          className="rounded border-gray-300 w-4 h-4"
        />
        <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
          #{admin.id?.slice(-8) || 'null'}
        </div>
      </div>
      <AdminActions
        admin={admin}
        onView={onView}
        onUpdateStatus={onUpdateStatus}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    </div>

    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Username</div>
          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{admin.username || 'null'}</div>
          <div className="flex items-center gap-2 mt-1">
            {getRoleIcon(admin.role)}
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              admin.role === 'super_admin' 
                ? 'bg-yellow-100 text-yellow-700'
                : admin.role === 'admin'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {admin.role === 'super_admin' ? 'SUPER ADMIN' : admin.role === 'admin' ? 'ADMIN' : 'MODERATOR'}
            </span>
          </div>
          {admin.permissions && admin.permissions.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {admin.permissions.length} permissions
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Email</div>
        <div className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{admin.email || 'null'}</div>
        <div className="flex items-center gap-1">
          {admin.emailVerified ? (
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

      <div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Registered: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'null'}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Time: {admin.createdAt ? new Date(admin.createdAt).toLocaleTimeString() : 'null'}
        </div>
        {admin.lastLoginAt && (
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Last login: {new Date(admin.lastLoginAt).toLocaleDateString()}
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
        ).toLocaleString()} of ${pagination.total.toLocaleString()} admins`
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
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 text-red-600">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-secondary text-red" disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UpdateStatusModal = ({ isOpen, currentStatus, newStatus, onStatusChange, onClose, onConfirm, isLoading, title }) => {
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

export default AdminsListPage;