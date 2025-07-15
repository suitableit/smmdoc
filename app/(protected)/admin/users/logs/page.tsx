'use client';

import React, { useEffect, useState } from 'react';
import {
  FaBox,
  FaCheckCircle,
  FaSearch,
  FaSync,
  FaTimes,
  FaTrash,
  FaExternalLinkAlt,
  FaExclamationTriangle
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

// Define interface for UserActivityLog
interface UserActivityLog {
  id: number;
  slNo: number;
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
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `User Activity Logs — ${APP_NAME}`;
  }, []);

  // Dummy data for user activity logs
  const dummyActivityLogs: UserActivityLog[] = [
    { 
      id: 'log_001', 
      slNo: 1, 
      username: 'john_doe', 
      details: 'User logged in successfully', 
      ipAddress: '192.168.1.100',
      history: '2024-01-15T10:30:00Z' 
    },
    { 
      id: 'log_002', 
      slNo: 2, 
      username: 'sarah_wilson', 
      details: 'Created new order #ORD-2024-001', 
      ipAddress: '203.122.45.67',
      history: '2024-01-15T09:45:00Z' 
    },
    { 
      id: 'log_003', 
      slNo: 3, 
      username: 'mike_johnson', 
      details: 'Failed login attempt - incorrect password', 
      ipAddress: '45.123.89.210',
      history: '2024-01-15T08:15:00Z' 
    },
    { 
      id: 'log_004', 
      slNo: 4, 
      username: 'admin', 
      details: 'Updated user permissions for sarah_wilson', 
      ipAddress: '192.168.1.1',
      history: '2024-01-14T16:20:00Z' 
    },
    { 
      id: 'log_005', 
      slNo: 5, 
      username: 'emily_brown', 
      details: 'Downloaded transaction report', 
      ipAddress: '156.78.234.91',
      history: '2024-01-14T14:10:00Z' 
    },
    { 
      id: 'log_006', 
      slNo: 6, 
      username: 'david_lee', 
      details: 'Changed account password', 
      ipAddress: '98.167.45.123',
      history: '2024-01-14T12:30:00Z' 
    },
    { 
      id: 'log_007', 
      slNo: 7, 
      username: 'jane_smith', 
      details: 'Uploaded new service configuration', 
      ipAddress: '172.16.0.55',
      history: '2024-01-14T11:45:00Z' 
    },
    { 
      id: 'log_008', 
      slNo: 8, 
      username: 'robert_clark', 
      details: 'Deleted inactive user account: test_user', 
      ipAddress: '10.0.0.45',
      history: '2024-01-13T15:25:00Z' 
    },
    { 
      id: 'log_009', 
      slNo: 9, 
      username: 'lisa_garcia', 
      details: 'Exported customer data to CSV', 
      ipAddress: '67.234.112.89',
      history: '2024-01-13T13:15:00Z' 
    },
    { 
      id: 'log_010', 
      slNo: 10, 
      username: 'admin', 
      details: 'System backup completed successfully', 
      ipAddress: '192.168.1.1',
      history: '2024-01-13T10:40:00Z' 
    },
    { 
      id: 'log_011', 
      slNo: 11, 
      username: 'tom_wilson', 
      details: 'API key regenerated for security', 
      ipAddress: '89.123.45.200',
      history: '2024-01-12T17:20:00Z' 
    },
    { 
      id: 'log_012', 
      slNo: 12, 
      username: 'anna_davis', 
      details: 'Accessed billing dashboard', 
      ipAddress: '134.56.78.90',
      history: '2024-01-12T14:55:00Z' 
    }
  ];

  // State management
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>(dummyActivityLogs);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: dummyActivityLogs.length,
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

  // Utility functions
  const formatID = (id: string) => {
    return id.toUpperCase();
  };

  // Generate IP tracker URL
  const getIpTrackerUrl = (ipAddress: string) => {
    return `https://www.ip-tracker.org/locator/ip-lookup.php?ip=${ipAddress}`;
  };

  // Filter activity logs based on search term and search category
  const filteredActivityLogs = activityLogs.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (searchBy) {
      case 'username':
        return log.username.toLowerCase().includes(searchLower);
      case 'details':
        return log.details.toLowerCase().includes(searchLower);
      case 'ip_address':
        return log.ipAddress.toLowerCase().includes(searchLower);
      case 'all':
      default:
        return (
          log.username.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower) ||
          log.ipAddress.toLowerCase().includes(searchLower) ||
          log.id.toLowerCase().includes(searchLower)
        );
    }
  });

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = filteredActivityLogs.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination(prev => ({
      ...prev,
      total,
      totalPages,
      hasNext: prev.page < totalPages,
      hasPrev: prev.page > 1
    }));
  }, [filteredActivityLogs, pagination.limit, pagination.page]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredActivityLogs.slice(startIndex, endIndex);
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
      showToast('User activity logs refreshed successfully!', 'success');
    }, 1000);
  };

  // Handle log deletion
  const handleDeleteLog = async (logId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setActivityLogs(prev => prev.filter(log => log.id !== logId));
      showToast('Activity log deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    } catch (error) {
      console.error('Error deleting activity log:', error);
      showToast('Error deleting activity log', 'error');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setActivityLogs(prev => prev.filter(log => !selectedLogs.includes(log.id)));
      showToast(`${selectedLogs.length} activity logs deleted successfully`, 'success');
      setSelectedLogs([]);
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
                onChange={(e) => setPagination(prev => ({ 
                  ...prev, 
                  limit: e.target.value === 'all' ? 1000 : parseInt(e.target.value), 
                  page: 1 
                }))}
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
                  value={searchTerm}
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
                          Sl. No
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
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {log.slNo}
                            </div>
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
                            <div className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              #{log.slNo}
                            </div>
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
                        <GradientSpinner size="w-4 h-4" />
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
                        `Page ${pagination.page} of ${pagination.totalPages}`
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