'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { APP_NAME } from '@/lib/constants';
import React, { useEffect, useState } from 'react';
import {
  FaChartBar,
  FaCheck,
  FaCheckCircle,
  FaCog,
  FaEdit,
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
  FaTrash
} from 'react-icons/fa';

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
  category: string;
}

const APIProvidersPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `API Providers — ${APP_NAME}`;
  }, []);

  // Mock providers data
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: '1',
      name: 'SocialBoost API',
      apiUrl: 'https://api.socialboost.com/v2',
      apiKey: '*********************',
      status: 'active',
      services: 245,
      orders: 12450,
      importedServices: 230,
      activeServices: 220,
      currentBalance: 1250.75,
      successRate: 98.5,
      avgResponseTime: 150,
      createdAt: new Date('2024-01-15'),
      lastSync: new Date(),
      description: 'High-quality social media services with fast delivery',
      category: 'Social Media'
    },
    {
      id: '2',
      name: 'InstantGrow Provider',
      apiUrl: 'https://api.instantgrow.net/v1',
      apiKey: '**********************',
      status: 'active',
      services: 180,
      orders: 8320,
      importedServices: 165,
      activeServices: 158,
      currentBalance: 890.50,
      successRate: 96.2,
      avgResponseTime: 200,
      createdAt: new Date('2024-02-10'),
      lastSync: new Date(Date.now() - 300000), // 5 minutes ago
      description: 'Instant delivery for Instagram and TikTok services',
      category: 'Instagram'
    },
    {
      id: '3',
      name: 'QuickSMM Services',
      apiUrl: 'https://api.quicksmm.com/v3',
      apiKey: 'qs_live_**********************',
      status: 'inactive',
      services: 95,
      orders: 0,
      importedServices: 0,
      activeServices: 0,
      currentBalance: 500.00,
      successRate: 0,
      avgResponseTime: 0,
      createdAt: new Date(),
      lastSync: new Date(),
      description: 'New provider currently inactive',
      category: 'Multi-Platform'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
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
    selectedProvider: '',
    apiKey: '',
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

  const availableProviders = [
    { 
      value: 'smmgen', 
      label: 'SMMGen',
      apiUrl: 'https://api.smmgen.com/v2',
      category: 'Multi-Platform',
      description: 'Premium SMM services with fast delivery'
    },
    { 
      value: 'growfollows', 
      label: 'Growfollows',
      apiUrl: 'https://api.growfollows.com/v1',
      category: 'Social Media',
      description: 'High-quality social media growth services'
    },
    { 
      value: 'attpanel', 
      label: 'ATTPANEL',
      apiUrl: 'https://api.attpanel.com/v3',
      category: 'Multi-Platform',
      description: 'Reliable SMM panel with competitive prices'
    },
    { 
      value: 'smmcoder', 
      label: 'SMMCoder',
      apiUrl: 'https://api.smmcoder.com/v2',
      category: 'Social Media',
      description: 'Advanced SMM solutions for all platforms'
    },
  ];

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
    
    // Simulate refresh operation
    setTimeout(() => {
      // Update last sync time for all providers and simulate data refresh
      setProviders(prev => prev.map(provider => ({
        ...provider,
        lastSync: new Date(),
        // Simulate slight changes in data
        orders: provider.orders + Math.floor(Math.random() * 10),
        currentBalance: provider.currentBalance + (Math.random() * 10 - 5),
      })));
      
      setIsRefreshing(false);
      showToast('Providers data refreshed successfully!', 'success');
    }, 2000);
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const selectedProviderData = availableProviders.find(p => p.value === formData.selectedProvider);
    
    if (!selectedProviderData) {
      showToast('Please select a provider', 'error');
      setIsLoading(false);
      return;
    }

    // Validate that if username is provided, password is also provided
    if (formData.username.trim() !== '' && formData.password.trim() === '') {
      showToast('Password is required when username is provided', 'error');
      setIsLoading(false);
      return;
    }
    
    setTimeout(() => {
      const newProvider: Provider = {
        id: Date.now().toString(),
        name: selectedProviderData.label,
        apiUrl: selectedProviderData.apiUrl,
        apiKey: formData.apiKey,
        status: 'inactive',
        services: 0,
        orders: 0,
        importedServices: 0,
        activeServices: 0,
        currentBalance: 0,
        successRate: 0,
        avgResponseTime: 0,
        createdAt: new Date(),
        lastSync: new Date(),
        description: selectedProviderData.description,
        category: selectedProviderData.category,
      };

      setProviders(prev => [...prev, newProvider]);
      setFormData({ 
        selectedProvider: '', 
        apiKey: '', 
        syncEnabled: true, 
        username: '', 
        password: '' 
      });
      setShowAddForm(false);
      setIsLoading(false);
      showToast('Provider added successfully!', 'success');
    }, 1000);
  };

  const handleOpenEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setEditFormData({
      name: provider.name,
      apiUrl: provider.apiUrl,
      apiKey: provider.apiKey,
      syncEnabled: true, // Default or derive from provider data
      username: '', // These would typically come from provider data
      password: '',
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
    
    setTimeout(() => {
      setProviders(prev => prev.map(provider => 
        provider.id === editingProvider.id 
          ? {
              ...provider,
              name: editFormData.name,
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
      setIsLoading(false);
      showToast('Provider updated successfully!', 'success');
    }, 1000);
  };

  const handleToggleStatus = async (providerId: string) => {
    setProviders(prev => prev.map(provider => 
      provider.id === providerId 
        ? { 
            ...provider, 
            status: provider.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive'
          }
        : provider
    ));
    
    const provider = providers.find(p => p.id === providerId);
    const newStatus = provider?.status === 'active' ? 'inactive' : 'active';
    showToast(`Provider ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      setProviders(prev => prev.filter(provider => provider.id !== providerId));
      showToast('Provider deleted successfully!', 'success');
    }
  };

  const handleSyncAllProviders = async () => {
    setSyncingAll(true);
    
    // Simulate sync all operation
    setTimeout(() => {
      setProviders(prev => prev.map(provider => ({ 
        ...provider, 
        lastSync: new Date() 
      })));
      setSyncingAll(false);
      showToast('All providers synchronized successfully!', 'success');
    }, 3000); // 3 second delay for sync all operation
  };

  const handleSyncProvider = async (providerId: string) => {
    setSyncingProvider(providerId);
    
    // Simulate sync operation
    setTimeout(() => {
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, lastSync: new Date() }
          : provider
      ));
      setSyncingProvider(null);
      showToast('Provider synchronized successfully!', 'success');
    }, 2000); // 2 second delay to show spinning animation
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
                  selectedProvider: '', 
                  apiKey: '', 
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
                  {/* Provider Selection */}
                  <div className="form-group">
                    <label className="form-label">Select Provider</label>
                    <select
                      value={formData.selectedProvider}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        selectedProvider: e.target.value,
                        // Clear other fields when changing provider
                        apiKey: '',
                        username: '',
                        password: '',
                        syncEnabled: true
                      }))}
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Choose a provider...</option>
                      {availableProviders.map((provider) => (
                        <option key={provider.value} value={provider.value}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
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
                        disabled={!formData.selectedProvider}
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
                            disabled={!formData.selectedProvider}
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
                          disabled={!formData.selectedProvider}
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
                          disabled={!formData.selectedProvider}
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
                          selectedProvider: '', 
                          apiKey: '', 
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
                      disabled={isLoading || !formData.selectedProvider}
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
                        className="form-field w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-not-allowed"
                        placeholder="https://api.example.com/v1"
                        readOnly
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card with Action Buttons and Search */}
            <div className="flex items-center justify-between gap-4">
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
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Add Provider Form */}

            {/* Providers List */}
            <div className="space-y-4">
              {providers
                .filter(provider => 
                  searchQuery === '' || 
                  provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  provider.status.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((provider) => (
                <div key={provider.id} className="card card-padding">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="card-icon">
                        <FaGlobe />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{provider.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {provider.services} services
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(provider.status)}`}>
                        {getStatusIcon(provider.status)}
                        {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{provider.orders.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{provider.importedServices.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Imported Services</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{provider.activeServices.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Services</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">${provider.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Current Balance</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Last sync: {new Date(provider.lastSync).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditProvider(provider)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Provider"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSyncProvider(provider.id)}
                        className="btn btn-secondary btn-sm"
                        title="Sync Provider"
                        disabled={syncingProvider === provider.id}
                      >
                        <FaSync className={`w-4 h-4 ${syncingProvider === provider.id ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(provider.id)}
                        className={`btn btn-sm ${provider.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                        title={provider.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {provider.status === 'active' ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Provider"
                      >
                        <FaTrash className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* No Results Message */}
              {providers.filter(provider => 
                searchQuery === '' || 
                provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.status.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && searchQuery !== '' && (
                <div className="card card-padding text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">
                    <FaGlobe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No providers found</h3>
                    <p className="text-sm">No providers match your search criteria "{searchQuery}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div className="space-y-6">
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