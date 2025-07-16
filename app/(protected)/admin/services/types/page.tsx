'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    FaBox,
    FaCheckCircle,
    FaEdit,
    FaEllipsisH,
    FaPlus,
    FaSearch,
    FaSync,
    FaTimes,
    FaTrash,
} from 'react-icons/fa';

// Import APP_NAME constant
import axiosInstance from '@/lib/axiosInstance';
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

// Define interface for ServiceType with Service Count
interface ServiceType {
  id: string;
  name: string;
  description?: string;
  status: string;
  serviceCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ServiceTypes = () => {
  // Toast function
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // API Functions
  const fetchServiceTypes = useCallback(async () => {
    try {
      setServiceTypesLoading(true);
      const response = await axiosInstance.get('/api/admin/service-types');

      if (response.data.success) {
        setServiceTypes(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.length,
          totalPages: Math.ceil(response.data.data.length / prev.limit)
        }));
      } else {
        showToast('Failed to fetch service types', 'error');
      }
    } catch (error) {
      console.error('Error fetching service types:', error);
      showToast('Error fetching service types', 'error');
    } finally {
      setServiceTypesLoading(false);
    }
  }, []);

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Service Types — ${APP_NAME}`;
  }, []);

  // Fetch service types on component mount
  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

  // State management
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState<string | null>(
    null
  );
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [serviceTypesLoading, setServiceTypesLoading] = useState(true);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingServiceType, setEditingServiceType] =
    useState<ServiceType | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newServiceTypeName, setNewServiceTypeName] = useState('');
  const [newServiceTypeDescription, setNewServiceTypeDescription] = useState('');



  // Utility functions
  const formatID = (id: string, index: number) => {
    // Generate a numeric ID based on the index
    return String(index + 1).padStart(3, '0');
  };

  // Filter service types based on search term
  const filteredServiceTypes = serviceTypes.filter(
    (serviceType) =>
      serviceType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceType.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = filteredServiceTypes.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages,
      hasNext: prev.page < totalPages,
      hasPrev: prev.page > 1,
    }));
  }, [filteredServiceTypes.length, pagination.limit]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredServiceTypes.slice(startIndex, endIndex);
  };



  const handleRefresh = () => {
    fetchServiceTypes();
    showToast('Service types refreshed successfully!', 'success');
  };

  // Handle service type deletion
  const handleDeleteServiceType = async (serviceTypeId: string) => {
    try {
      const response = await axiosInstance.delete(`/api/admin/service-types/${serviceTypeId}`);

      if (response.data.success) {
        setServiceTypes((prev) => prev.filter((st) => st.id !== serviceTypeId));
        showToast('Service type deleted successfully', 'success');
        setDeleteDialogOpen(false);
        setServiceTypeToDelete(null);
      } else {
        showToast(response.data.error || 'Failed to delete service type', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting service type:', error);
      showToast(error.response?.data?.error || 'Error deleting service type', 'error');
    }
  };

  // Handle service type editing
  const handleEditServiceType = async () => {
    if (!editingServiceType || !editName.trim()) return;

    try {
      const response = await axiosInstance.put(`/api/admin/service-types/${editingServiceType.id}`, {
        name: editName.trim(),
        description: editDescription.trim() || null,
        status: editingServiceType.status
      });

      if (response.data.success) {
        setServiceTypes((prev) =>
          prev.map((st) =>
            st.id === editingServiceType.id
              ? { ...st, name: editName.trim(), description: editDescription.trim() || undefined }
              : st
          )
        );

        showToast('Service type updated successfully', 'success');
        setEditDialogOpen(false);
        setEditingServiceType(null);
        setEditName('');
        setEditDescription('');
      } else {
        showToast(response.data.error || 'Failed to update service type', 'error');
      }
    } catch (error: any) {
      console.error('Error updating service type:', error);
      showToast(error.response?.data?.error || 'Error updating service type', 'error');
    }
  };

  // Handle adding new service type
  const handleAddServiceType = async () => {
    if (!newServiceTypeName.trim()) return;

    try {
      const response = await axiosInstance.post('/api/admin/service-types', {
        name: newServiceTypeName.trim(),
        description: newServiceTypeDescription.trim() || null
      });

      if (response.data.success) {
        const newServiceType = {
          ...response.data.data,
          serviceCount: 0
        };
        setServiceTypes((prev) => [newServiceType, ...prev]);
        showToast('Service type added successfully', 'success');
        setAddDialogOpen(false);
        setNewServiceTypeName('');
        setNewServiceTypeDescription('');
      } else {
        showToast(response.data.error || 'Failed to add service type', 'error');
      }
    } catch (error: any) {
      console.error('Error adding service type:', error);
      showToast(error.response?.data?.error || 'Error adding service type', 'error');
    }
  };

  // Open edit dialog
  const openEditDialog = (serviceType: ServiceType) => {
    setEditingServiceType(serviceType);
    setEditName(serviceType.name);
    setEditDescription(serviceType.description || '');
    setEditDialogOpen(true);
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Left: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
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
                disabled={serviceTypesLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={serviceTypesLoading ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button
                onClick={() => setAddDialogOpen(true)}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5 w-full md:w-auto"
              >
                <FaPlus />
                Add Service Type
              </button>
            </div>

            {/* Right: Search Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search service types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Service Types Table */}
        <div className="card">
          <div style={{ padding: '24px 24px 0px 24px' }}>
            {serviceTypesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading service types...
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
                  No information was found for you.
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No service types match your search criteria or no service
                  types exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
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
                          Name
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Description
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Service Count
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Created
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
                      {getPaginatedData().map((serviceType, index) => (
                        <tr
                          key={serviceType.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {formatID(serviceType.id, (pagination.page - 1) * pagination.limit + index)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {serviceType.name}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="text-sm text-gray-600"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {serviceType.description || 'No description'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {serviceType.serviceCount}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {new Date(
                                  serviceType.createdAt
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                {new Date(
                                  serviceType.createdAt
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {/* 3 Dot Menu */}
                            <div className="relative">
                              <button
                                className="btn btn-secondary p-2"
                                title="More Actions"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const dropdown = e.currentTarget
                                    .nextElementSibling as HTMLElement;
                                  // Close other dropdowns
                                  document
                                    .querySelectorAll('.dropdown-menu')
                                    .forEach((menu) => {
                                      if (menu !== dropdown)
                                        menu.classList.add('hidden');
                                    });
                                  dropdown.classList.toggle('hidden');
                                }}
                              >
                                <FaEllipsisH className="h-3 w-3" />
                              </button>

                              {/* Dropdown Menu */}
                              <div className="dropdown-menu hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      openEditDialog(serviceType);
                                      document
                                        .querySelector(
                                          '.dropdown-menu:not(.hidden)'
                                        )
                                        ?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <FaEdit className="h-3 w-3" />
                                    Edit Service Type
                                  </button>
                                  <button
                                    onClick={() => {
                                      setServiceTypeToDelete(serviceType.id);
                                      setDeleteDialogOpen(true);
                                      document
                                        .querySelector(
                                          '.dropdown-menu:not(.hidden)'
                                        )
                                        ?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <FaTrash className="h-3 w-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {serviceTypesLoading ? (
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
                      )} of ${formatNumber(pagination.total)} service types`
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
                      disabled={!pagination.hasPrev || serviceTypesLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {serviceTypesLoading ? (
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
                      disabled={!pagination.hasNext || serviceTypesLoading}
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
                Delete Service Type
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this service type? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setServiceTypeToDelete(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    serviceTypeToDelete &&
                    handleDeleteServiceType(serviceTypeToDelete)
                  }
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Service Type Dialog */}
        {editDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Service Type</h3>
              <div className="mb-4">
                <label className="form-label mb-2">Service Type Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter service type name"
                />
              </div>
              <div className="mb-4">
                <label className="form-label mb-2">Description (Optional)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter service type description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingServiceType(null);
                    setEditName('');
                    setEditDescription('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditServiceType}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Service Type Dialog */}
        {addDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Add New Service Type
              </h3>
              <div className="mb-4">
                <label className="form-label mb-2">Service Type Name</label>
                <input
                  type="text"
                  value={newServiceTypeName}
                  onChange={(e) => setNewServiceTypeName(e.target.value)}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter service type name"
                />
              </div>
              <div className="mb-4">
                <label className="form-label mb-2">Description (Optional)</label>
                <textarea
                  value={newServiceTypeDescription}
                  onChange={(e) => setNewServiceTypeDescription(e.target.value)}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter service type description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setAddDialogOpen(false);
                    setNewServiceTypeName('');
                    setNewServiceTypeDescription('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddServiceType}
                  className="btn btn-primary"
                >
                  Add Service Type
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceTypes;