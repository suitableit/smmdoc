'use client';

import React, { useEffect, useState } from 'react';
import {
  FaBox,
  FaCheckCircle,
  FaSearch,
  FaSync,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';

// Import APP_NAME constant
import { APP_NAME } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

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

// Define interface for SyncLog
interface SyncLog {
  id: number;
  slNo: number;
  apiProvider: string;
  serviceName: string;
  changes: string;
  changeType: 'added' | 'updated' | 'deleted' | 'error';
  when: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const SyncLogsPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `API Sync Logs — ${APP_NAME}`;
  }, []);

  // Dummy data for sync logs
  const dummySyncLogs: SyncLog[] = [
    {
      id: 'log_001',
      slNo: 1,
      apiProvider: 'SMM Panel Pro',
      serviceName: 'Instagram Followers',
      changes: 'Service rate updated: $0.50 → $0.45',
      changeType: 'updated',
      when: '2024-01-15T10:30:00Z',
    },
    {
      id: 'log_002',
      slNo: 2,
      apiProvider: 'Social Boost API',
      serviceName: 'YouTube Views',
      changes: 'New service added with rate $1.20',
      changeType: 'added',
      when: '2024-01-15T09:45:00Z',
    },
    {
      id: 'log_003',
      slNo: 3,
      apiProvider: 'Growth Engine',
      serviceName: 'TikTok Likes',
      changes: 'Service discontinued',
      changeType: 'deleted',
      when: '2024-01-15T08:15:00Z',
    },
    {
      id: 'log_004',
      slNo: 4,
      apiProvider: 'Viral Marketing',
      serviceName: 'Facebook Page Likes',
      changes: 'Min/Max quantity updated: 100-50000',
      changeType: 'updated',
      when: '2024-01-14T16:20:00Z',
    },
    {
      id: 'log_005',
      slNo: 5,
      apiProvider: 'SMM Panel Pro',
      serviceName: 'Twitter Retweets',
      changes: 'API connection failed during sync',
      changeType: 'error',
      when: '2024-01-14T14:10:00Z',
    },
    {
      id: 'log_006',
      slNo: 6,
      apiProvider: 'Boost Central',
      serviceName: 'LinkedIn Connections',
      changes: 'Service status changed to active',
      changeType: 'updated',
      when: '2024-01-14T12:30:00Z',
    },
    {
      id: 'log_007',
      slNo: 7,
      apiProvider: 'Social Boost API',
      serviceName: 'Instagram Story Views',
      changes: 'New service added with rate $0.30',
      changeType: 'added',
      when: '2024-01-14T11:45:00Z',
    },
    {
      id: 'log_008',
      slNo: 8,
      apiProvider: 'Growth Engine',
      serviceName: 'Pinterest Saves',
      changes: 'Service temporarily disabled',
      changeType: 'updated',
      when: '2024-01-13T15:25:00Z',
    },
    {
      id: 'log_009',
      slNo: 9,
      apiProvider: 'Viral Marketing',
      serviceName: 'Telegram Members',
      changes: 'Rate increased: $0.80 → $0.95',
      changeType: 'updated',
      when: '2024-01-13T13:15:00Z',
    },
    {
      id: 'log_010',
      slNo: 10,
      apiProvider: 'SMM Panel Pro',
      serviceName: 'Discord Members',
      changes: 'Service removed from catalog',
      changeType: 'deleted',
      when: '2024-01-13T10:40:00Z',
    },
  ];

  // State management
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(dummySyncLogs);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: dummySyncLogs.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [logsLoading, setLogsLoading] = useState(false);

  // Get change type badge
  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Added
          </span>
        );
      case 'updated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Updated
          </span>
        );
      case 'deleted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Deleted
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  // Filter sync logs based on search term and search category
  const filteredSyncLogs = syncLogs.filter((log) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    switch (searchBy) {
      case 'api_provider':
        return log.apiProvider.toLowerCase().includes(searchLower);
      case 'service_name':
        return log.serviceName.toLowerCase().includes(searchLower);
      case 'all':
      default:
        return (
          log.apiProvider.toLowerCase().includes(searchLower) ||
          log.serviceName.toLowerCase().includes(searchLower) ||
          log.changes.toLowerCase().includes(searchLower) ||
          log.id.toLowerCase().includes(searchLower)
        );
    }
  });

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = filteredSyncLogs.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages,
      hasNext: prev.page < totalPages,
      hasPrev: prev.page > 1,
    }));
  }, [filteredSyncLogs, pagination.limit, pagination.page]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredSyncLogs.slice(startIndex, endIndex);
  };

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSelectAll = () => {
    const currentPageData = getPaginatedData();
    if (selectedLogs.length === currentPageData.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(currentPageData.map((log) => log.id));
    }
  };

  const handleSelectLog = (logId: string) => {
    setSelectedLogs((prev) =>
      prev.includes(logId)
        ? prev.filter((id) => id !== logId)
        : [...prev, logId]
    );
  };

  const handleRefresh = () => {
    setLogsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setLogsLoading(false);
      showToast('Sync logs refreshed successfully!', 'success');
    }, 1000);
  };

  // Handle log deletion
  const handleDeleteLog = async (logId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSyncLogs((prev) => prev.filter((log) => log.id !== logId));
      showToast('Sync log deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    } catch (error) {
      console.error('Error deleting sync log:', error);
      showToast('Error deleting sync log', 'error');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSyncLogs((prev) =>
        prev.filter((log) => !selectedLogs.includes(log.id))
      );
      showToast(
        `${selectedLogs.length} sync logs deleted successfully`,
        'success'
      );
      setSelectedLogs([]);
    } catch (error) {
      console.error('Error deleting sync logs:', error);
      showToast('Error deleting sync logs', 'error');
    }
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
                disabled={logsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={logsLoading ? 'animate-spin' : ''} />
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
                    searchBy === 'all'
                      ? 'sync logs'
                      : searchBy === 'api_provider'
                      ? 'API providers'
                      : 'service names'
                  }...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="all">All Fields</option>
                <option value="api_provider">API Provider</option>
                <option value="service_name">Service Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sync Logs Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {selectedLogs.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {selectedLogs.length} selected
                </span>
                <button
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FaTrash />
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '0 24px' }}>
            {logsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading sync logs...
                  </div>
                </div>
              </div>
            ) : getPaginatedData().length === 0 ? (
              <div className="text-center py-12">
                <FaBox
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No sync logs found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No sync logs match your search criteria or no sync logs exist
                  yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[1000px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedLogs.length ===
                                getPaginatedData().length &&
                              getPaginatedData().length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Sl. No
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          API Provider
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Service Name
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Changes
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          When
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
                      {getPaginatedData().map((log) => (
                        <tr
                          key={log.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedLogs.includes(log.id)}
                              onChange={() => handleSelectLog(log.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {log.slNo}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {log.apiProvider}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {log.serviceName}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="max-w-xs">
                              <div className="flex items-center gap-2 mb-1">
                                {getChangeTypeBadge(log.changeType)}
                              </div>
                              <div
                                className="text-sm truncate"
                                style={{ color: 'var(--text-primary)' }}
                                title={log.changes}
                              >
                                {log.changes}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {new Date(log.when).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                {new Date(log.when).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                setLogToDelete(log.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200"
                              title="Delete Log"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Visible on tablet and mobile */}
                <div className="lg:hidden">
                  <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                    {getPaginatedData().map((log) => (
                      <div
                        key={log.id}
                        className="card card-padding border-l-4 border-blue-500 mb-4"
                      >
                        {/* Header with Checkbox, Sl No and Actions */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedLogs.includes(log.id)}
                              onChange={() => handleSelectLog(log.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {log.slNo}
                            </div>
                            {getChangeTypeBadge(log.changeType)}
                          </div>

                          {/* Actions for Mobile */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setLogToDelete(log.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200"
                              title="Delete Log"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* API Provider and Service Name */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              API Provider
                            </div>
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {log.apiProvider}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Service Name
                            </div>
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {log.serviceName}
                            </div>
                          </div>
                        </div>

                        {/* Changes */}
                        <div className="mb-4">
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Changes
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {log.changes}
                          </div>
                        </div>

                        {/* When */}
                        <div>
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            When
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Date: {new Date(log.when).toLocaleDateString()}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Time: {new Date(log.when).toLocaleTimeString()}
                          </div>
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
                    {logsLoading ? (
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
                      )} of ${formatNumber(pagination.total)} sync logs`
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
                      disabled={!pagination.hasPrev || logsLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {logsLoading ? (
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
                      disabled={!pagination.hasNext || logsLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Sync Log</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this sync log? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setLogToDelete(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => logToDelete && handleDeleteLog(logToDelete)}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Dialog */}
        {bulkDeleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Delete Selected Sync Logs
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedLogs.length} selected
                sync log{selectedLogs.length !== 1 ? 's' : ''}? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setBulkDeleteDialogOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleBulkDelete();
                    setBulkDeleteDialogOpen(false);
                  }}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm"
                >
                  Delete {selectedLogs.length} Log
                  {selectedLogs.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncLogsPage;
