/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { PriceDisplay } from '@/components/PriceDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetServices } from '@/hooks/service-fetch';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import {
  FaSearch,
  FaFilter,
  FaHashtag,
  FaBox,
  FaCog,
  FaToggleOn,
  FaToggleOff,
  FaUser,
  FaChartLine,
  FaEllipsisV,
  FaEllipsisH,
  FaEdit,
  FaPencilAlt,
  FaClock,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaStar,
  FaRedo,
  FaFileExport,
  FaLayerGroup,
  FaTimes,
  FaEye,
  FaSync,
  FaExternalLinkAlt,
  FaPlay,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';
import Link from 'next/link';
import { Fragment, useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import ServiceViewModal from './serviceViewModal';

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

interface ServiceTableProps {
  searchTerm?: string;
  statusFilter?: string;
}

export default function ServiceTable({ searchTerm: parentSearchTerm, statusFilter: parentStatusFilter }: ServiceTableProps) {
  const user = useCurrentUser();
  const { data, error, isLoading } = useGetServices();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<any>({});
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [activeCategoryToggles, setActiveCategoryToggles] = useState<{[key: string]: boolean}>({});

  // Use parent search term and status filter if provided
  const searchTerm = parentSearchTerm !== undefined ? parentSearchTerm : localSearchTerm;
  const statusFilter = parentStatusFilter !== undefined ? parentStatusFilter : 'all';

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'pending' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter and group services by category
  const groupedServices = useMemo(() => {
    if (!data?.data) return {} as Record<string, any[]>;

    let filtered = data.data.filter((service: any) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.category_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        service.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.id?.toString().includes(searchTerm);

      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'active')
        return matchesSearch && service.status === 'active';
      if (statusFilter === 'inactive')
        return matchesSearch && service.status === 'inactive';

      return matchesSearch;
    });

    // Group by category
    const grouped = filtered.reduce((acc: Record<string, any[]>, service: any) => {
      const categoryName = service.category?.category_name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(service);
      return acc;
    }, {} as Record<string, any[]>);

    // Sort services within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a: any, b: any) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'rate' || sortBy === 'provider_price') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    });

    return grouped;
  }, [data?.data, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    if (status === 'inactive') {
      return <FaTimesCircle className="h-3 w-3 text-red-500" />;
    }
    return <FaCheckCircle className="h-3 w-3 text-green-500" />;
  };

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSelectAll = () => {
    const allServices = Object.values(groupedServices).flat();
    if (selectedServices.length === allServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(allServices.map((service: any) => service.id));
    }
  };

  const handleSelectCategory = (categoryServices: any[]) => {
    const categoryIds = categoryServices.map(service => service.id);
    const allSelected = categoryIds.every(id => selectedServices.includes(id));
    
    if (allSelected) {
      setSelectedServices(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedServices(prev => [...new Set([...prev, ...categoryIds])]);
    }
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Toggle service status
  const toggleServiceStatus = async (service: any) => {
    try {
      setIsUpdating(true);
      const response = await axiosInstance.post(
        '/api/admin/services/toggle-status',
        {
          id: service.id,
          status: service.status,
        }
      );

      if (response.data.success) {
        showToast(response.data.message, 'success');
        mutate('/api/admin/services/get-services');
        mutate('/api/admin/services/stats');
      } else {
        showToast('Failed to update service status', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle refill
  const toggleRefill = async (service: any) => {
    try {
      const response = await axiosInstance.post(
        '/api/admin/services/toggle-refill',
        {
          id: service.id,
          refill: !service.refill,
        }
      );

      if (response.data.success) {
        showToast('Refill setting updated', 'success');
        mutate('/api/admin/services/get-services');
      } else {
        showToast('Failed to update refill setting', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    }
  };

  // Toggle cancel
  const toggleCancel = async (service: any) => {
    try {
      const response = await axiosInstance.post(
        '/api/admin/services/toggle-cancel',
        {
          id: service.id,
          cancel: !service.cancel,
        }
      );

      if (response.data.success) {
        showToast('Cancel setting updated', 'success');
        mutate('/api/admin/services/get-services');
      } else {
        showToast('Failed to update cancel setting', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    }
  };

  // Initialize category toggles when data loads
  useEffect(() => {
    if (data?.data) {
      const initialToggles: {[key: string]: boolean} = {};
      Object.keys(groupedServices).forEach(categoryName => {
        // Set category toggle to true if any service in the category is active
        const categoryServices = groupedServices[categoryName];
        initialToggles[categoryName] = categoryServices.some((service: any) => service.status === 'active');
      });
      setActiveCategoryToggles(initialToggles);
    }
  }, [data?.data, groupedServices]);

  // Toggle category and all its services
  const toggleCategoryAndServices = async (categoryName: string, services: any[]) => {
    try {
      setIsUpdating(true);
      const newToggleState = !activeCategoryToggles[categoryName];
      const newStatus = newToggleState ? 'active' : 'inactive';
      
      showToast(`${newToggleState ? 'Activating' : 'Deactivating'} ${services.length} services in ${categoryName}...`, 'pending');
      
      // Update local toggle state immediately for UI feedback
      setActiveCategoryToggles(prev => ({
        ...prev,
        [categoryName]: newToggleState
      }));

      // Update all services in the category
      const promises = services.map(service => 
        axiosInstance.post('/api/admin/services/toggle-status', {
          id: service.id,
          status: service.status, // Let the API handle the toggle logic
        })
      );

      await Promise.all(promises);
      
      showToast(`Successfully ${newToggleState ? 'activated' : 'deactivated'} ${categoryName} category`, 'success');
      mutate('/api/admin/services/get-services');
      mutate('/api/admin/services/stats');
    } catch (error: any) {
      // Revert toggle state on error
      setActiveCategoryToggles(prev => ({
        ...prev,
        [categoryName]: !activeCategoryToggles[categoryName]
      }));
      showToast(`Error updating ${categoryName}: ${error.message || 'Something went wrong'}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete service with custom toast
  const deleteService = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this service?');
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(
        `/api/admin/services/delete-services?id=${id}`
      );
      showToast('Service deleted successfully', 'success');
      mutate('/api/admin/services/get-services');
      mutate('/api/admin/services/stats');
    } catch (error) {
      showToast('Failed to delete service', 'error');
    }
  };

  const handleEditService = (serviceId: string) => {
    window.open(`/admin/services/${serviceId}`, '_blank');
  };

  if (isLoading)
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <FaSync className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-lg font-medium">Loading services...</span>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Error Loading Services
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );

  if (!data || Object.keys(groupedServices).length === 0)
    return (
      <div className="text-center py-12">
        <FaBox className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          No information was found for you.
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {searchTerm
            ? `No services match "${searchTerm}"`
            : 'No services exist yet.'}
        </p>
      </div>
    );

  return (
    <Fragment>
      {/* Toast Container */}
      <div className="toast-container">
        {toastMessage && (
          <Toast 
            message={toastMessage.message} 
            type={toastMessage.type} 
            onClose={() => setToastMessage(null)} 
          />
        )}
      </div>

      {selectedServices.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {selectedServices.length} selected
          </span>
          <button className="btn btn-primary flex items-center gap-2">
            <FaTrash />
            Delete Selected
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="sticky top-0 bg-white border-b z-10">
            <tr>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={selectedServices.length === Object.values(groupedServices).flat().length && Object.values(groupedServices).flat().length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 w-4 h-4"
                />
              </th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>ID</th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Service</th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Type</th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Provider</th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Price</th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Min/Max</th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Refill</th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Cancel</th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
              <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Object.entries(groupedServices) as [string, any[]][]).map(([categoryName, services]) => (
              <Fragment key={categoryName}>
                {/* Category Header Row */}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={11} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleCategory(categoryName)}
                          className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
                        >
                          {collapsedCategories.includes(categoryName) ? (
                            <FaChevronRight className="h-3 w-3" />
                          ) : (
                            <FaChevronDown className="h-3 w-3" />
                          )}
                          
                          {/* Category Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategoryAndServices(categoryName, services);
                            }}
                            disabled={isUpdating}
                            className={`p-1 rounded transition-colors ${
                              activeCategoryToggles[categoryName]
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-red-600 hover:bg-red-50'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={`${activeCategoryToggles[categoryName] ? 'Deactivate' : 'Activate'} ${categoryName} category`}
                          >
                            {isUpdating ? (
                              <FaSpinner className="h-4 w-4 animate-spin" />
                            ) : activeCategoryToggles[categoryName] ? (
                              <FaToggleOn className="h-4 w-4" />
                            ) : (
                              <FaToggleOff className="h-4 w-4" />
                            )}
                          </button>
                          
                          <span className="font-semibold text-lg text-gray-800">
                            {categoryName}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                            {services.length} services
                          </span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={services.every(service => selectedServices.includes(service.id))}
                          onChange={() => handleSelectCategory(services)}
                          className="rounded border-gray-300 w-4 h-4"
                          title="Select all services in this category"
                        />
                        <span className="text-xs text-gray-500">Select All</span>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Services Rows */}
                {!collapsedCategories.includes(categoryName) && services.map((service: any, i: number) => (
                  <tr key={service.id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                    <td className="p-3 pl-8">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleSelectService(service.id)}
                        className="rounded border-gray-300 w-4 h-4"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        #{service.id || 'null'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-sm truncate max-w-44" style={{ color: 'var(--text-primary)' }}>
                          {service?.name || 'null'}
                        </div>
                        <div className="text-xs truncate max-w-44" style={{ color: 'var(--text-muted)' }}>
                          {service.category?.category_name || 'null'}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800 w-fit">
                        {service?.service_type || service?.type || 'Standard'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {service?.provider || 'null'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-right">
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          <PriceDisplay
                            amount={service?.rate}
                            originalCurrency={user?.currency || ('USD' as any)}
                          />
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Cost: <PriceDisplay
                            amount={service?.provider_price || service?.self_price || service?.cost_price || service?.rate}
                            originalCurrency={user?.currency || ('USD' as any)}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {service?.min_order} - {service?.max_order}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Min / Max
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleRefill(service)}
                        className={`p-1 rounded transition-colors ${
                          service.refill
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={service.refill ? 'Disable Refill' : 'Enable Refill'}
                      >
                        {service.refill ? (
                          <FaToggleOn className="h-5 w-5" />
                        ) : (
                          <FaToggleOff className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleCancel(service)}
                        className={`p-1 rounded transition-colors ${
                          service.cancel
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={service.cancel ? 'Disable Cancel' : 'Enable Cancel'}
                      >
                        {service.cancel ? (
                          <FaToggleOn className="h-5 w-5" />
                        ) : (
                          <FaToggleOff className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit">
                        {getStatusIcon(service.status)}
                        <span className="text-xs font-medium capitalize">
                          {service.status || 'null'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEditService(service.id)}
                          className="btn btn-secondary p-2"
                          title="Edit Service"
                        >
                          <FaEdit className="h-3 w-3" />
                        </button>
                        
                        {/* 3 Dot Menu */}
                        <div className="relative">
                          <button 
                            className="btn btn-secondary p-2" 
                            title="More Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                              dropdown.classList.toggle('hidden');
                            }}
                          >
                            <FaEllipsisH className="h-3 w-3" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          <div className="hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  toggleServiceStatus(service);
                                  const dropdown = document.querySelector('.absolute.right-0') as HTMLElement;
                                  dropdown?.classList.add('hidden');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FaSync className="h-3 w-3" />
                                {service.status === 'active' ? 'Deactivate' : 'Activate'} Service
                              </button>
                              <button
                                onClick={() => {
                                  deleteService(service?.id);
                                  const dropdown = document.querySelector('.absolute.right-0') as HTMLElement;
                                  dropdown?.classList.add('hidden');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100 flex items-center gap-2"
                              >
                                <FaTrash className="h-3 w-3" />
                                Delete Service
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="space-y-6">
          {(Object.entries(groupedServices) as [string, any[]][]).map(([categoryName, services]) => (
            <div key={categoryName} className="space-y-4">
              {/* Category Header */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleCategory(categoryName)}
                    className="flex items-center gap-2 hover:bg-gray-100 rounded p-2 transition-colors flex-1"
                  >
                    {collapsedCategories.includes(categoryName) ? (
                      <FaChevronRight className="h-3 w-3" />
                    ) : (
                      <FaChevronDown className="h-3 w-3" />
                    )}
                    
                    {/* Category Toggle Button for Mobile */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryAndServices(categoryName, services);
                      }}
                      disabled={isUpdating}
                      className={`p-1 rounded transition-colors ${
                        activeCategoryToggles[categoryName]
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={`${activeCategoryToggles[categoryName] ? 'Deactivate' : 'Activate'} ${categoryName} category`}
                    >
                      {isUpdating ? (
                        <FaSpinner className="h-4 w-4 animate-spin" />
                      ) : activeCategoryToggles[categoryName] ? (
                        <FaToggleOn className="h-4 w-4" />
                      ) : (
                        <FaToggleOff className="h-4 w-4" />
                      )}
                    </button>
                    
                    <span className="font-semibold text-lg text-gray-800">
                      {categoryName}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full ml-auto">
                      {services.length}
                    </span>
                  </button>
                  <input
                    type="checkbox"
                    checked={services.every(service => selectedServices.includes(service.id))}
                    onChange={() => handleSelectCategory(services)}
                    className="rounded border-gray-300 w-4 h-4 ml-2"
                    title="Select all services in this category"
                  />
                </div>
              </div>

              {/* Services Cards */}
              {!collapsedCategories.includes(categoryName) && (
                <div className="space-y-4 ml-4">
                  {services.map((service: any) => (
                    <div key={service.id} className="card card-padding border-l-4 border-blue-500">
                      {/* Header with ID and Actions */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => handleSelectService(service.id)}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                          <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            #{service.id || 'null'}
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                            {getStatusIcon(service.status)}
                            <span className="text-xs font-medium capitalize">
                              {service.status || 'null'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditService(service.id)}
                            className="btn btn-secondary p-2"
                            title="Edit Service"
                          >
                            <FaEdit className="h-3 w-3" />
                          </button>
                          
                          {/* 3 Dot Menu for Mobile */}
                          <div className="relative">
                            <button 
                              className="btn btn-secondary p-2" 
                              title="More Actions"
                              onClick={(e) => {
                                e.stopPropagation();
                                const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                dropdown.classList.toggle('hidden');
                              }}
                            >
                              <FaEllipsisH className="h-3 w-3" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            <div className="hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    toggleServiceStatus(service);
                                    const dropdown = document.querySelector('.absolute.right-0') as HTMLElement;
                                    dropdown?.classList.add('hidden');
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <FaSync className="h-3 w-3" />
                                  {service.status === 'active' ? 'Deactivate' : 'Activate'} Service
                                </button>
                                <button
                                  onClick={() => {
                                    deleteService(service?.id);
                                    const dropdown = document.querySelector('.absolute.right-0') as HTMLElement;
                                    dropdown?.classList.add('hidden');
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100 flex items-center gap-2"
                                >
                                  <FaTrash className="h-3 w-3" />
                                  Delete Service
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="mb-4">
                        <div className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                          {service?.name || 'null'}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {service.category?.category_name || 'null'} • Type: {service?.service_type || service?.type || 'Standard'}
                        </div>
                      </div>

                      {/* Provider and Pricing */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                            Provider
                          </div>
                          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {service?.provider || 'null'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                            Price
                          </div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            <PriceDisplay
                              amount={service?.rate}
                              originalCurrency={user?.currency || ('USD' as any)}
                            />
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Cost: <PriceDisplay
                              amount={service?.provider_price || service?.self_price || service?.cost_price || service?.rate}
                              originalCurrency={user?.currency || ('USD' as any)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Min/Max and Settings */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                            Min / Max Orders
                          </div>
                          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {service?.min_order} - {service?.max_order}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              Refill
                            </div>
                            <button
                              onClick={() => toggleRefill(service)}
                              className={`p-1 rounded transition-colors ${
                                service.refill
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              {service.refill ? (
                                <FaToggleOn className="h-5 w-5" />
                              ) : (
                                <FaToggleOff className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              Cancel
                            </div>
                            <button
                              onClick={() => toggleCancel(service)}
                              className={`p-1 rounded transition-colors ${
                                service.cancel
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              {service.cancel ? (
                                <FaToggleOn className="h-5 w-5" />
                              ) : (
                                <FaToggleOff className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Service View Modal */}
      <ServiceViewModal
        service={selected}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelected({});
        }}
      />
    </Fragment>
  );
}