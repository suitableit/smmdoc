'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import {
  FaChartBar,
  FaCheck,
  FaCheckCircle,
  FaCog,
  FaEdit,
  FaEllipsisV,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaGlobe,
  FaPause,
  FaPlay,
  FaPlus,
  FaSearch,
  FaSync,
  FaTimes,
  FaToggleOff,
  FaToggleOn,
  FaTrash
} from 'react-icons/fa';

import { APP_NAME } from '@/lib/constants';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Mock components and hooks for demonstration
const ButtonLoader = () => <div className="loading-spinner"></div>;

// Toast/Twist Message Component using CSS classes
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
    {type === 'success' && <FaCheck className="toast-icon" />}
    {type === 'error' && <FaTimes className="toast-icon" />}
    {type === 'info' && <FaExclamationTriangle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

const Switch = ({ checked, onCheckedChange, onClick, title, disabled }: any) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`switch ${checked ? 'switch-checked' : 'switch-unchecked'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span className="switch-thumb" />
  </button>
);

const PasswordInput = React.forwardRef<HTMLInputElement, any>(
  ({ className, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="password-input-container">
        <input
          type={showPassword ? 'text' : 'password'}
          className={className}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="password-toggle"
          disabled={disabled}
        >
          {showPassword ? (
            <FaEyeSlash className="h-4 w-4" />
          ) : (
            <FaEye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }
);

interface Provider {
  id: number;
  name: string;
  apiUrl: string;
  apiKey: string;
  status: 'active' | 'inactive';
  services: number;
  orders: number;
  importedServices: number;
  activeServices: number;
  currentBalance: number;
  successRate: number;
  avgResponseTime: number;
  createdAt: Date;
  lastSync: Date;
  description?: string;
  username?: string;
  password?: string;
}

const APIProvidersPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `API Providers — ${APP_NAME}`;
  }, []);

  // Real providers data from API
  const [providers, setProviders] = useState<Provider[]>([]);
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncingProvider, setSyncingProvider] = useState<number | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  const [formData, setFormData] = useState({
    customProviderName: '',
    apiKey: '',
    apiUrl: '',
    syncEnabled: true,
    username: '',
    password: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    apiUrl: '',
    apiKey: '',
    syncEnabled: true,
    username: '',
    password: '',
  });

  // Fetch providers data
  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/admin/providers');
      const result = await response.json();

      if (result.success) {
        console.log('Fetched providers:', result.data.providers);
        // Set all available providers for dropdown
        setAvailableProviders(result.data.providers);

        // Convert all providers to Provider format for UI
        const uiProviders = result.data.providers
          .map((p: any) => ({
            id: p.id,
            name: p.label,
            apiUrl: p.apiUrl,
            apiKey: '*********************',
            status: p.status,
            services: 0,
            orders: 0,
            importedServices: 0,
            activeServices: 0,
            currentBalance: 0,
            successRate: 0,
            avgResponseTime: 0,
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            lastSync: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            description: p.description
          }));
        setProviders(uiProviders);
        console.log('Available providers for dropdown:', result.data.providers);
      } else {
        console.error('Failed to fetch providers:', result.error);
        showToast('Failed to fetch providers', 'error');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      showToast('Failed to fetch providers', 'error');
    }
  };

  // Initial loading
  useEffect(() => {
    const loadData = async () => {
      await fetchProviders();
      setIsPageLoading(false);
    };

    loadData();
  }, []);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    showToast('Refreshing providers data...', 'pending');

    try {
      await fetchProviders();
      showToast('Providers data refreshed successfully!', 'success');
    } catch (error) {
      showToast('Failed to refresh providers data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation for custom provider name
    if (!formData.customProviderName.trim()) {
      showToast('Please enter a provider name', 'error');
      setIsLoading(false);
      return;
    }

    // Validate that if username is provided, password is also provided
    if (formData.username.trim() !== '' && formData.password.trim() === '') {
      showToast('Password is required when username is provided', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customProviderName: formData.customProviderName,
          apiKey: formData.apiKey,
          apiUrl: formData.apiUrl,
          username: formData.username,
          password: formData.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh providers list
        await fetchProviders();

        setFormData({
          customProviderName: '',
          apiKey: '',
          apiUrl: '',
          syncEnabled: true,
          username: '',
          password: ''
        });
        setShowAddForm(false);
        showToast(result.message || 'Provider added successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to add provider', 'error');
      }
    } catch (error) {
      console.error('Error adding provider:', error);
      showToast('Failed to add provider', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setEditFormData({
      name: provider.name,
      apiUrl: provider.apiUrl || '',
      apiKey: provider.apiKey || '',
      syncEnabled: true, // Default or derive from provider data
      username: provider.username || '', // Load from provider data
      password: '', // Don't pre-fill password for security
    });
    setShowEditForm(true);
  };

  const handleEditProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;

    // Validate that if username is provided, password is also provided
    if (editFormData.username.trim() !== '' && editFormData.password.trim() === '') {
      showToast('Password is required when username is provided', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingProvider.id,
          apiKey: editFormData.apiKey,
          apiUrl: editFormData.apiUrl,
          username: editFormData.username || null,
          password: editFormData.password || null
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setProviders(prev => prev.map(provider =>
          provider.id === editingProvider.id
            ? {
                ...provider,
                apiUrl: editFormData.apiUrl,
                apiKey: editFormData.apiKey,
                lastSync: new Date(),
              }
            : provider
        ));

        setEditFormData({
          name: '',
          apiUrl: '',
          apiKey: '',
          syncEnabled: true,
          username: '',
          password: '',
        });
        setShowEditForm(false);
        setEditingProvider(null);
        showToast('Provider updated successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to update provider', 'error');
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      showToast('Failed to update provider', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (providerId: number) => {
    try {
      const provider = providers.find(p => p.id === providerId);
      const newStatus = provider?.status === 'active' ? 'inactive' : 'active';

      const response = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: providerId,
          status: newStatus
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setProviders(prev => prev.map(provider =>
          provider.id === providerId
            ? { ...provider, status: newStatus as 'active' | 'inactive' }
            : provider
        ));
        showToast(result.message || `Provider ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
      } else {
        showToast(result.error || 'Failed to update provider status', 'error');
      }
    } catch (error) {
      console.error('Error toggling provider status:', error);
      showToast('Failed to update provider status', 'error');
    }
  };

  const handleDeleteProvider = async (providerId: number) => {
    // Check if providerId is valid
    if (!providerId || providerId === null || providerId === undefined) {
      showToast('Cannot delete unconfigured provider', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this provider?')) {
      try {
        const response = await fetch(`/api/admin/providers?id=${providerId}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
          // Update local state
          setProviders(prev => prev.filter(provider => provider.id !== providerId));
          showToast(result.message || 'Provider deleted successfully!', 'success');
        } else {
          showToast(result.error || 'Failed to delete provider', 'error');
        }
      } catch (error) {
        console.error('Error deleting provider:', error);
        showToast('Failed to delete provider', 'error');
      }
    }
  };

  const handleSyncAllProviders = async () => {
    setSyncingAll(true);

    try {
      const response = await fetch('/api/admin/providers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncType: 'all',
          profitMargin: 20
        })
      });

      const result = await response.json();

      if (result.success) {
        const totals = result.data.totals;
        showToast(
          `All providers synchronized! Updated: ${totals.updated}, Created: ${totals.created}, Price changes: ${totals.priceChanges}`,
          'success'
        );

        // Update last sync time
        setProviders(prev => prev.map(provider => ({
          ...provider,
          lastSync: new Date()
        })));
      } else {
        showToast(`Sync failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error syncing providers:', error);
      showToast('Failed to sync providers', 'error');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncProvider = async (providerId: number) => {
    setSyncingProvider(providerId);

    try {
      const response = await fetch('/api/admin/providers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          syncType: 'all',
          profitMargin: 20
        })
      });

      const result = await response.json();

      if (result.success) {
        const providerResult = result.data.results[0];
        if (providerResult) {
          showToast(
            `${providerResult.provider} synchronized! Updated: ${providerResult.updated}, Created: ${providerResult.created}`,
            'success'
          );
        } else {
          showToast('Provider synchronized successfully!', 'success');
        }

        setProviders(prev => prev.map(provider =>
          provider.id === providerId
            ? { ...provider, lastSync: new Date() }
            : provider
        ));
      } else {
        showToast(`Sync failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error syncing provider:', error);
      showToast('Failed to sync provider', 'error');
    } finally {
      setSyncingProvider(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <FaCheckCircle className="w-4 h-4" />;
      case 'inactive': return <FaTimes className="w-4 h-4" />;
      default: return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  // ProviderActions component
  const ProviderActions = ({ provider }: { provider: Provider }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex items-center gap-2">
        {/* Sync Button */}
        <button
          onClick={() => handleSyncProvider(provider.id)}
          disabled={syncingProvider === provider.id}
          className="btn btn-sm btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sync Provider"
        >
          <FaSync className={`w-3 h-3 ${syncingProvider === provider.id ? 'animate-spin' : ''}`} />
        </button>

        {/* Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-sm btn-secondary p-2"
            title="More actions"
          >
            <FaEllipsisV className="w-3 h-3" />
          </button>

          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleOpenEditProvider(provider);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaEdit className="w-3 h-3" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => {
                      handleToggleStatus(provider.id, provider.status === 'active' ? 'inactive' : 'active');
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    {provider.status === 'active' ? (
                      <>
                        <FaPause className="w-3 h-3" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <FaPlay className="w-3 h-3" />
                        Activate
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      handleDeleteProvider(provider.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <FaTrash className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (isPageLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Loading States */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card card-padding">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">
                      Loading API providers...
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Loading States */}
            <div className="space-y-6">
              <div className="card card-padding">
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">
                      Loading statistics...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Add Provider Modal/Overlay */}
        {showAddForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddForm(false);
                setFormData({
                  providerType: 'predefined',
                  selectedProvider: '',
                  customProviderName: '',
                  apiKey: '',
                  apiUrl: '',
                  syncEnabled: true,
                  username: '',
                  password: ''
                });
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="card card-padding">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">Add New Provider</h3>
                </div>

                <form onSubmit={handleAddProvider} className="space-y-6">
                  {/* Provider Name */}
                  <div className="form-group">
                    <label className="form-label">Provider Name</label>
                    <input
                      type="text"
                      value={formData.customProviderName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customProviderName: e.target.value }))}
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="Enter provider name"
                      required
                    />
                  </div>

                  {/* API Configuration */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">API Configuration</h4>
                    
                    <div className="form-group">
                      <label className="form-label">API Key</label>
                      <PasswordInput
                        value={formData.apiKey}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your API key"
                        disabled={!formData.customProviderName}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">API URL</label>
                      <input
                        type="url"
                        value={formData.apiUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter API URL (e.g., https://provider.com/api/v2)"
                        disabled={!formData.customProviderName}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="form-label">Auto Sync</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Automatically sync services and pricing from this provider
                          </p>
                        </div>
                        <div className="ml-4">
                          <Switch
                            checked={formData.syncEnabled}
                            onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, syncEnabled: checked }))}
                            onClick={() => formData.selectedProvider && setFormData(prev => ({ ...prev, syncEnabled: !prev.syncEnabled }))}
                            title={`${formData.syncEnabled ? 'Disable' : 'Enable'} Auto Sync`}
                            disabled={!formData.customProviderName}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Login Credentials */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Login Credentials</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Enter username"
                          disabled={!formData.customProviderName}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Password
                          {formData.username.trim() !== '' && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <PasswordInput
                          value={formData.password}
                          onChange={(e: any) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Enter password"
                          disabled={!formData.customProviderName}
                          required={formData.username.trim() !== ''}
                        />
                        {formData.username.trim() !== '' && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Password is required when username is provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({
                          providerType: 'predefined',
                          selectedProvider: '',
                          customProviderName: '',
                          apiKey: '',
                          apiUrl: '',
                          syncEnabled: true,
                          username: '',
                          password: ''
                        });
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || (formData.providerType === 'predefined' ? !formData.selectedProvider : !formData.customProviderName)}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <ButtonLoader /> : 'Add Provider'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Provider Modal/Overlay */}
        {showEditForm && editingProvider && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditForm(false);
                setEditingProvider(null);
                setEditFormData({
                  name: '',
                  apiUrl: '',
                  apiKey: '',
                  syncEnabled: true,
                  username: '',
                  password: '',
                });
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="card card-padding">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">Edit Provider - {editingProvider.name}</h3>
                </div>

                <form onSubmit={handleEditProvider} className="space-y-6">
                  {/* Provider Name */}
                  <div className="form-group">
                    <label className="form-label">Provider Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="form-field w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-not-allowed"
                      placeholder="Enter provider name"
                      readOnly
                    />
                  </div>

                  {/* API Configuration */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">API Configuration</h4>
                    
                    <div className="form-group">
                      <label className="form-label">API URL</label>
                      <input
                        type="url"
                        value={editFormData.apiUrl}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter API URL (e.g., https://provider.com/api/v2)"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">API Key</label>
                      <PasswordInput
                        value={editFormData.apiKey}
                        onChange={(e: any) => setEditFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter your API key"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="form-label">Auto Sync</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Automatically sync services and pricing from this provider
                          </p>
                        </div>
                        <div className="ml-4">
                          <Switch
                            checked={editFormData.syncEnabled}
                            onCheckedChange={(checked: boolean) => setEditFormData(prev => ({ ...prev, syncEnabled: checked }))}
                            onClick={() => setEditFormData(prev => ({ ...prev, syncEnabled: !prev.syncEnabled }))}
                            title={`${editFormData.syncEnabled ? 'Disable' : 'Enable'} Auto Sync`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Login Credentials */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Login Credentials</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          value={editFormData.username}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="Enter username"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Password
                          {editFormData.username.trim() !== '' && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <PasswordInput
                          value={editFormData.password}
                          onChange={(e: any) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="Enter password"
                          required={editFormData.username.trim() !== ''}
                        />
                        {editFormData.username.trim() !== '' && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Password is required when username is provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingProvider(null);
                        setEditFormData({
                          name: '',
                          apiUrl: '',
                          apiKey: '',
                          syncEnabled: true,
                          username: '',
                          password: '',
                        });
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <ButtonLoader /> : 'Update Provider'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Header Card with Action Buttons and Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-primary flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Add Provider
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Add Provider Form */}

          {/* API Providers Table */}
          <div className="card card-padding">
            {/* Filter Buttons */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    statusFilter === 'all'
                      ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'all'
                        ? 'bg-white/20'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {providers.length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    statusFilter === 'active'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Active
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'active'
                        ? 'bg-white/20'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}
                  >
                    {providers.filter(p => p.status === 'active').length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    statusFilter === 'inactive'
                      ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Inactive
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'inactive'
                        ? 'bg-white/20'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {providers.filter(p => p.status === 'inactive').length}
                  </span>
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white border-b z-10">
                  <tr>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>ID</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Provider</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Services</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Orders</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Current Balance</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Last Sync</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>API Status</th>
                    <th className="text-right p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers
                    .filter(provider => {
                      // Search filter
                      const matchesSearch = searchQuery === '' ||
                        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        provider.status.toLowerCase().includes(searchQuery.toLowerCase());
                      
                      // Status filter
                      const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
                      
                      return matchesSearch && matchesStatus;
                    })
                    .map((provider, index) => (
                    <tr key={provider.id || `provider-${provider.name}-${index}`} className="border-t hover:bg-gray-50 transition-colors duration-200">
                      {/* ID Column */}
                      <td className="p-3">
                        <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {provider.id}
                        </div>
                      </td>
                      
                      {/* Provider Column */}
                      <td className="p-3">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{provider.name}</div>
                      </td>
                      
                      {/* Services Column */}
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{provider.importedServices || provider.services} Total</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{provider.activeServices} Active</div>
                        </div>
                      </td>
                      
                      {/* Orders Column */}
                      <td className="p-3">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{provider.orders.toLocaleString()}</div>
                      </td>
                      
                      {/* Current Balance Column */}
                      <td className="p-3">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          ${provider.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      
                      {/* Last Sync Column */}
                      <td className="p-3">
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {new Date(provider.lastSync).toLocaleString()}
                        </div>
                      </td>
                      
                      {/* Status Column */}
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleStatus(provider.id)}
                          className={`p-1 rounded transition-colors ${
                            provider.status === 'active'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={
                            provider.status === 'active'
                              ? 'Deactivate Provider'
                              : 'Activate Provider'
                          }
                        >
                          {provider.status === 'active' ? (
                            <FaToggleOn className="h-5 w-5" />
                          ) : (
                            <FaToggleOff className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                      
                      {/* API Status Column */}
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                          provider.apiUrl && provider.apiUrl.trim() !== '' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {provider.apiUrl && provider.apiUrl.trim() !== '' ? 'Connected' : 'Not Connected'}
                        </span>
                      </td>
                      
                      {/* Actions Column */}
                      <td className="p-3">
                        <ProviderActions provider={provider} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {providers
                .filter(provider => {
                  // Search filter
                  const matchesSearch = searchQuery === '' ||
                    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    provider.status.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  // Status filter
                  const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
                  
                  return matchesSearch && matchesStatus;
                })
                .map((provider, index) => (
                <div key={provider.id || `provider-${provider.name}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  {/* Header with ID, Provider Name and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">#{provider.id}</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{provider.name}</div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(provider.id)}
                      className={`p-1 rounded transition-colors ${
                        provider.status === 'active'
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={
                        provider.status === 'active'
                          ? 'Deactivate Provider'
                          : 'Activate Provider'
                      }
                    >
                      {provider.status === 'active' ? (
                        <FaToggleOn className="h-5 w-5" />
                      ) : (
                        <FaToggleOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* API Status */}
                  <div className="mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      provider.apiUrl && provider.apiUrl.trim() !== '' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {provider.apiUrl && provider.apiUrl.trim() !== '' ? 'API Connected' : 'API Not Connected'}
                    </span>
                  </div>
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Services</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{provider.importedServices || provider.services} Total Imported</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{provider.activeServices} Active Services</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Orders</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{provider.orders.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Current Balance</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        ${provider.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Last Sync</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{new Date(provider.lastSync).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <ProviderActions provider={provider} />
                </div>
              ))}
            </div>
            
            {/* No Results Message */}
            {providers.filter(provider =>
              searchQuery === '' ||
              provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              provider.status.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && searchQuery !== '' && (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <FaGlobe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No providers found</h3>
                  <p className="text-sm">No providers match your search criteria "{searchQuery}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Statistics Section - Moved after API Providers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview Stats */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaChartBar />
                </div>
                <h3 className="card-title">Overview</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Providers</span>
                  <span className="font-semibold">{providers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Providers</span>
                  <span className="font-semibold text-green-600">
                    {providers.filter(p => p.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Inactive Providers</span>
                  <span className="font-semibold text-red-600">
                    {providers.filter(p => p.status === 'inactive').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Orders</span>
                  <span className="font-semibold">
                    {providers.reduce((sum, p) => sum + p.orders, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Imported Services</span>
                  <span className="font-semibold text-orange-600">
                    {providers.reduce((sum, p) => sum + p.importedServices, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Services</span>
                  <span className="font-semibold text-purple-600">
                    {providers.reduce((sum, p) => sum + p.activeServices, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Balance</span>
                  <span className="font-semibold text-blue-600">
                    ${providers.reduce((sum, p) => sum + p.currentBalance, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaCog />
                </div>
                <h3 className="card-title">Quick Actions</h3>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleSyncAllProviders}
                  disabled={syncingAll}
                  className="btn btn-secondary w-full justify-start disabled:opacity-50"
                >
                  <FaSync className={`w-4 h-4 mr-2 ${syncingAll ? 'animate-spin' : ''}`} />
                  Sync All Providers
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to deactivate all providers? This will stop all provider services.')) {
                      setProviders(prev => prev.map(provider => ({ ...provider, status: 'inactive' as 'active' | 'inactive' })));
                      showToast('All providers have been deactivated!', 'success');
                    }
                  }}
                  className="btn btn-secondary w-full justify-start"
                >
                  <FaPause className="w-4 h-4 mr-2" />
                  Deactivate All Providers
                </button>
              </div>
            </div>

            {/* Top Performing Provider */}
            {providers.length > 0 && (
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaCheckCircle />
                  </div>
                  <h3 className="card-title">Top Performer</h3>
                </div>

                {(() => {
                  const topProvider = providers.reduce((best, current) => 
                    current.orders > best.orders ? current : best
                  );
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{topProvider.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(topProvider.status)}`}>
                          {topProvider.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Orders: <span className="font-semibold text-green-600">{topProvider.orders.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Imported: <span className="font-semibold text-orange-600">{topProvider.importedServices.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Active: <span className="font-semibold text-purple-600">{topProvider.activeServices.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Balance: <span className="font-semibold text-blue-600">${topProvider.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIProvidersPage;