'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import React, { useEffect, useState } from 'react';
import {
  FaCheck,
  FaDollarSign,
  FaTimes,
} from 'react-icons/fa';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Mock components for demonstration
const ButtonLoader = () => <div className="loading-spinner"></div>;

// Toast Message Component
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
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

interface Provider {
  id: string;
  name: string;
}

interface PriceUpdateSettings {
  serviceType: 'all-services' | 'provider-services' | 'manual-services';
  profitPercentage: number;
  providerId?: string;
}

const UpdatePricePage = () => {
  const currentUser = useCurrentUser();

  // Set document title
  useEffect(() => {
    document.title = `Update Price — ${APP_NAME}`;
  }, []);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Price update settings state
  const [priceSettings, setPriceSettings] = useState<PriceUpdateSettings>({
    serviceType: 'all-services',
    profitPercentage: 10,
    providerId: '',
  });

  // Providers list
  const [providers, setProviders] = useState<Provider[]>([]);

  // Load settings and providers on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsPageLoading(true);

        // Load existing price settings
        const settingsResponse = await fetch('/api/admin/price-settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          if (settingsData.priceSettings) {
            setPriceSettings(settingsData.priceSettings);
          }
        }

        // Load providers list
        const providersResponse = await fetch('/api/admin/providers');
        if (providersResponse.ok) {
          const providersData = await providersResponse.json();
          if (providersData.providers) {
            setProviders(providersData.providers);
          }
        } else {
          showToast('Failed to load providers', 'error');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data', 'error');
      } finally {
        setIsPageLoading(false);
      }
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

  // Update prices function
  const updatePrices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/update-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceSettings }),
      });

      if (response.ok) {
        const result = await response.json();
        showToast(`Prices updated successfully! ${result.updatedCount || 0} services updated.`, 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to update prices', 'error');
      }
    } catch (error) {
      console.error('Error updating prices:', error);
      showToast('Error updating prices', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isPageLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="card card-padding">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">Loading price settings...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const serviceTypeOptions = [
    { value: 'all-services', label: 'All Services' },
    { value: 'provider-services', label: 'Provider Services' },
    { value: 'manual-services', label: 'Manual Services' },
  ];

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
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            {/* Update Price Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaDollarSign />
                </div>
                <h3 className="card-title">Update Price</h3>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Service Types</label>
                  <select
                    value={priceSettings.serviceType}
                    onChange={(e) =>
                      setPriceSettings(prev => ({
                        ...prev,
                        serviceType: e.target.value as 'all-services' | 'provider-services' | 'manual-services',
                        // Clear provider when switching away from provider services
                        providerId: e.target.value === 'provider-services' ? prev.providerId : ''
                      }))
                    }
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {serviceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Provider Field */}
                {priceSettings.serviceType === 'provider-services' && (
                  <div className="form-group">
                    <label className="form-label">Provider</label>
                    <select
                      value={priceSettings.providerId || ''}
                      onChange={(e) =>
                        setPriceSettings(prev => ({
                          ...prev,
                          providerId: e.target.value
                        }))
                      }
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">Select Provider</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Profit Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={priceSettings.profitPercentage}
                      onChange={(e) =>
                        setPriceSettings(prev => ({
                          ...prev,
                          profitPercentage: parseFloat(e.target.value) || 0
                        }))
                      }
                      className="form-field w-full px-4 py-3 pr-8 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="10"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      %
                    </span>
                  </div>
                </div>

                <button
                  onClick={updatePrices}
                  disabled={
                    isLoading || 
                    (priceSettings.serviceType === 'provider-services' && !priceSettings.providerId)
                  }
                  className="btn btn-primary w-full"
                >
                  {isLoading ? <ButtonLoader /> : 'Update Prices'}
                </button>

                {priceSettings.serviceType === 'provider-services' && !priceSettings.providerId && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    Please select a provider to update prices for provider services.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePricePage;