'use client';

import React, { useEffect, useState } from 'react';
import {
  FaBox,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaSearch,
  FaSync,
  FaTimes,
  FaTrash
} from 'react-icons/fa';

// Import APP_NAME constant
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';

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

// Define interface for UserActivityLog
interface UserActivityLog {
  id: string;
  username: string;
  details: string;
  ipAddress: string;
  history: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const UserActivityLogsPage = () => {
  const { appName } = useAppNameWithFallback();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('User Activity Logs', appName);
  }, [appName]);

  // State management
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
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
  const [logsLoading, setLogsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch activity logs from API
  const fetchActivityLogs = async (page = 1, search = '', searchBy = 'all') => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search,
        searchBy
      });

      const response = await fetch(`/api/admin/activity-logs?${params}`);
      const result = await response.json();

      if (result.success) {
        setActivityLogs(result.data || []);
        setPagination(result.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        });
      } else {
        console.error('Failed to fetch activity logs:', result.error);
        showToast('Failed to fetch activity logs', 'error');
        setActivityLogs([]);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      showToast('Error fetching activity logs', 'error');
      setActivityLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // Load activity logs on component mount and when search changes
  useEffect(() => {
    fetchActivityLogs(pagination.page, searchTerm, searchBy);
  }, [pagination.page, searchTerm, searchBy]);

  // Initial load
  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // Utility functions
  const formatID = (id: string) => {
    return id.toUpperCase();
  };

  // Generate IP tracker URL
  const getIpTrackerUrl = (ipAddress: string) => {
    return `https://www.ip-tracker.org/locator/ip-lookup.php?ip=${ipAddress}`;
  };

  // Get current page data (server-side pagination)
  const getPaginatedData = () => {
    return activityLogs;
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchActivityLogs(newPage, searchTerm, searchBy);
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
    fetchActivityLogs(pagination.page, searchTerm, searchBy);
    showToast('User activity logs refreshed successfully!', 'success');
  };

  // Handle log deletion
  const handleDeleteLog = async (logId: string) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/activity-logs/${logId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state for immediate UI update
        setActivityLogs(prev => prev.filter(log => log.id !== logId));
        showToast('Activity log deleted successfully', 'success');
        setDeleteDialogOpen(false);
        setLogToDelete(null);
        // Refresh data to ensure consistency
        fetchActivityLogs(pagination.page, searchTerm, searchBy);
      } else {
        showToast(result.error || 'Failed to delete activity log', 'error');
      }
    } catch (error) {
      console.error('Error deleting activity log:', error);
      showToast('Error deleting activity log', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const response = await fetch('/api/admin/activity-logs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedLogs }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state for immediate UI update
        setActivityLogs(prev => prev.filter(log => !selectedLogs.includes(log.id)));
        showToast(`${selectedLogs.length} activity logs deleted successfully`, 'success');
        setSelectedLogs([]);
        setBulkDeleteDialogOpen(false);
        // Refresh data to ensure consistency
        fetchActivityLogs(pagination.page, searchTerm, searchBy);
      } else {
        showToast(result.error || 'Failed to delete activity logs', 'error');
      }
    } catch (error) {
      console.error('Error deleting activity logs:', error);
      showToast('Error deleting activity logs', 'error');
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
                onChange={(e) => {
                  const newLimit = e.target.value === 'all' ? 1000 : parseInt(e.target.value);
                  setPagination(prev => ({
                    ...prev,
                    limit: newLimit,
                    page: 1
                  }));
                  fetchActivityLogs(1, searchTerm, searchBy);
                }}
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
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${searchBy === 'all' ? 'activity logs' : searchBy === 'username' ? 'usernames' : searchBy === 'details' ? 'details' : 'IP addresses'}...`}
                  value={searchTerm || ''}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
              
              <select 
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="all">All Fields</option>
                <option value="username">Username</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Logs Table */}
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
                  <div className="text-base font-medium">Loading activity logs...</div>
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
                  No activity logs found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No activity logs match your search criteria or no activity logs exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View */}
                <div className="overflow-x-auto">
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
                              selectedLogs.length === getPaginatedData().length &&
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
                          User
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Details
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          IP Address
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          History
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Action
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
                              className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                              {log.username}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="max-w-xs">
                              <div
                                className="text-sm"
                                style={{ color: 'var(--text-primary)' }}
                                title={log.details}
                              >
                                {log.details.length > 50 ? `${log.details.substring(0, 50)}...` : log.details}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <a
                              href={getIpTrackerUrl(log.ipAddress)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm font-mono"
                              title="Click to track IP address"
                            >
                              {log.ipAddress}
                              <FaExternalLinkAlt className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {new Date(log.history).toLocaleDateString()}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {new Date(log.history).toLocaleTimeString()}
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
                <div className="hidden">
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

                            <div className="font-medium text-sm font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {log.username}
                            </div>
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

                        {/* Details */}
                        <div className="mb-4">
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Details
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {log.details}
                          </div>
                        </div>

                        {/* IP Address and History */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              IP Address
                            </div>
                            <a
                              href={getIpTrackerUrl(log.ipAddress)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm font-mono"
                              title="Click to track IP address"
                            >
                              {log.ipAddress}
                              <FaExternalLinkAlt className="h-3 w-3" />
                            </a>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              History
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {new Date(log.history).toLocaleDateString()}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {new Date(log.history).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div
                  className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t"
                >
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {logsLoading ? (
                      <div className="flex items-center gap-2">
                        <span>Loading pagination...</span>
                      </div>
                    ) : (
                      `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )} of ${pagination.total} activity logs`
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
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
                        `Page ${pagination.page} of ${pagination.totalPages}`
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
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
              <h3 className="text-lg font-semibold mb-4">
                Delete Activity Log
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this activity log? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setLogToDelete(null);
                  }}
                  disabled={deleteLoading}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => logToDelete && handleDeleteLog(logToDelete)}
                  disabled={deleteLoading}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 shadow-sm text-white ${
                    deleteLoading 
                      ? 'bg-red-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {deleteLoading ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
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
                Delete Selected Activity Logs
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedLogs.length} selected activity log{selectedLogs.length !== 1 ? 's' : ''}? This action cannot be undone.
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
                  Delete {selectedLogs.length} Log{selectedLogs.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityLogsPage;