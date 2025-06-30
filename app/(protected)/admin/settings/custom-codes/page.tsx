'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import React, { useEffect, useState } from 'react';
import {
  FaCode,
  FaCheck,
  FaTimes,
  FaInfoCircle,
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

interface CustomCodesSettings {
  headerCodes: string;
  footerCodes: string;
}

const CustomCodesPage = () => {
  const currentUser = useCurrentUser();

  // Set document title
  useEffect(() => {
    document.title = `Custom Codes — ${APP_NAME}`;
  }, []);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Custom codes settings state
  const [customCodesSettings, setCustomCodesSettings] = useState<CustomCodesSettings>({
    headerCodes: '',
    footerCodes: '',
  });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsPageLoading(true);

        const response = await fetch('/api/admin/custom-codes-settings');
        if (response.ok) {
          const data = await response.json();
          
          if (data.customCodesSettings) setCustomCodesSettings(data.customCodesSettings);
        } else {
          showToast('Failed to load custom codes settings', 'error');
        }
      } catch (error) {
        console.error('Error loading custom codes settings:', error);
        showToast('Error loading custom codes settings', 'error');
      } finally {
        setIsPageLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Save function
  const saveCustomCodesSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/custom-codes-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customCodesSettings,
        }),
      });

      if (response.ok) {
        showToast('Custom codes settings saved successfully!', 'success');
      } else {
        showToast('Failed to save custom codes settings', 'error');
      }
    } catch (error) {
      console.error('Error saving custom codes settings:', error);
      showToast('Error saving custom codes settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isPageLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loading cards */}
            {[1, 2].map((i) => (
              <div key={i} className="card card-padding h-fit">
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">Loading custom codes...</div>
                  </div>
                </div>
              </div>
            ))}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header Codes */}
          <div className="card card-padding h-fit">
            <div className="card-header">
              <div className="card-icon">
                <FaCode />
              </div>
              <h3 className="card-title">Header Codes</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add custom HTML, CSS, or JavaScript code that will be inserted into the &lt;head&gt; section of your website. This is perfect for analytics tracking codes, custom CSS styles, or meta tags.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Header Code</label>
                <textarea
                  value={customCodesSettings.headerCodes}
                  onChange={(e) =>
                    setCustomCodesSettings(prev => ({ ...prev, headerCodes: e.target.value }))
                  }
                  rows={15}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none font-mono text-sm"
                  placeholder={`<!-- Example: Analytics tracking code -->
<script>
  // Your custom JavaScript code here
</script>

<style>
  /* Your custom CSS code here */
</style>

<!-- Custom meta tags -->
<meta name="custom-tag" content="value">`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This code will be inserted into the &lt;head&gt; section of every page.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Codes */}
          <div className="card card-padding h-fit">
            <div className="card-header">
              <div className="card-icon">
                <FaCode />
              </div>
              <h3 className="card-title">Footer Codes</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add custom HTML, CSS, or JavaScript code that will be inserted before the closing &lt;/body&gt; tag. This is ideal for chat widgets, analytics scripts, or custom JavaScript functionality.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Footer Code</label>
                <textarea
                  value={customCodesSettings.footerCodes}
                  onChange={(e) =>
                    setCustomCodesSettings(prev => ({ ...prev, footerCodes: e.target.value }))
                  }
                  rows={15}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none font-mono text-sm"
                  placeholder={`<!-- Example: Chat widget or tracking scripts -->
<script>
  // Your custom JavaScript code here
  // This runs after the page content loads
</script>

<!-- Custom HTML elements -->
<div id="custom-footer-content">
  <!-- Your custom HTML here -->
</div>`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This code will be inserted before the closing &lt;/body&gt; tag of every page.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes Section */}
        <div className="mt-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <FaInfoCircle className="mr-2" />
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• <strong>Header codes</strong> are loaded in the &lt;head&gt; section and execute before page content loads</li>
              <li>• <strong>Footer codes</strong> are loaded before &lt;/body&gt; and execute after page content loads</li>
              <li>• Always test your custom codes thoroughly before saving to avoid breaking your website</li>
              <li>• Use proper HTML, CSS, and JavaScript syntax to prevent errors</li>
              <li>• These codes will be applied to all pages of your website</li>
              <li>• For security reasons, avoid inserting untrusted third-party scripts</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={saveCustomCodesSettings}
            disabled={isLoading}
            className="btn btn-primary px-8 py-3"
          >
            {isLoading ? <ButtonLoader /> : 'Save Custom Codes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomCodesPage;