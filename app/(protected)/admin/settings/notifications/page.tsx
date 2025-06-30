'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import React, { useEffect, useState } from 'react';
import {
  FaBell,
  FaCheck,
  FaCog,
  FaTimes,
  FaUser,
  FaUserShield,
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

// Switch Component
const Switch = ({ checked, onCheckedChange, onClick, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={`switch ${checked ? 'switch-checked' : 'switch-unchecked'}`}
  >
    <span className="switch-thumb" />
  </button>
);

interface UserNotifications {
  welcomeEnabled: boolean;
  apiKeyChangedEnabled: boolean;
  orderStatusChangedEnabled: boolean;
  newServiceEnabled: boolean;
  serviceUpdatesEnabled: boolean;
}

interface AdminNotifications {
  apiBalanceAlertsEnabled: boolean;
  supportTicketsEnabled: boolean;
  newMessagesEnabled: boolean;
  newManualServiceOrdersEnabled: boolean;
  failOrdersEnabled: boolean;
  newManualRefillRequestsEnabled: boolean;
  newManualCancelRequestsEnabled: boolean;
  newUsersEnabled: boolean;
  userActivityLogsEnabled: boolean;
  pendingTransactionsEnabled: boolean;
  apiSyncLogsEnabled: boolean;
  newChildPanelOrdersEnabled: boolean;
}

const NotificationSettingsPage = () => {
  const currentUser = useCurrentUser();

  // Set document title
  useEffect(() => {
    document.title = `Notification Settings — ${APP_NAME}`;
  }, []);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Notification settings state
  const [userNotifications, setUserNotifications] = useState<UserNotifications>({
    welcomeEnabled: true,
    apiKeyChangedEnabled: true,
    orderStatusChangedEnabled: true,
    newServiceEnabled: true,
    serviceUpdatesEnabled: true,
  });

  const [adminNotifications, setAdminNotifications] = useState<AdminNotifications>({
    apiBalanceAlertsEnabled: true,
    supportTicketsEnabled: true,
    newMessagesEnabled: true,
    newManualServiceOrdersEnabled: true,
    failOrdersEnabled: true,
    newManualRefillRequestsEnabled: true,
    newManualCancelRequestsEnabled: true,
    newUsersEnabled: true,
    userActivityLogsEnabled: false,
    pendingTransactionsEnabled: true,
    apiSyncLogsEnabled: false,
    newChildPanelOrdersEnabled: true,
  });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsPageLoading(true);

        const response = await fetch('/api/admin/notification-settings');
        if (response.ok) {
          const data = await response.json();
          
          if (data.userNotifications) setUserNotifications(data.userNotifications);
          if (data.adminNotifications) setAdminNotifications(data.adminNotifications);
        } else {
          showToast('Failed to load notification settings', 'error');
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
        showToast('Error loading notification settings', 'error');
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

  // Save functions
  const saveUserNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/user-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNotifications }),
      });

      if (response.ok) {
        showToast('User notification settings saved successfully!', 'success');
      } else {
        showToast('Failed to save user notification settings', 'error');
      }
    } catch (error) {
      console.error('Error saving user notification settings:', error);
      showToast('Error saving user notification settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAdminNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/admin-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotifications }),
      });

      if (response.ok) {
        showToast('Admin notification settings saved successfully!', 'success');
      } else {
        showToast('Failed to save admin notification settings', 'error');
      }
    } catch (error) {
      console.error('Error saving admin notification settings:', error);
      showToast('Error saving admin notification settings', 'error');
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
              <div key={i} className="card card-padding">
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">Loading notification settings...</div>
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
          {/* Admin Notifications Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaUserShield />
              </div>
              <h3 className="card-title">Admin Notifications</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">API Balance Alerts</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about API balance alerts
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.apiBalanceAlertsEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      apiBalanceAlertsEnabled: !prev.apiBalanceAlertsEnabled
                    }))
                  }
                  title="Toggle API balance alert notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Support Tickets</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about new support tickets
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.supportTicketsEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      supportTicketsEnabled: !prev.supportTicketsEnabled
                    }))
                  }
                  title="Toggle support ticket notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">New Messages</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about new messages
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.newMessagesEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      newMessagesEnabled: !prev.newMessagesEnabled
                    }))
                  }
                  title="Toggle new message notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">New Manual Service Orders</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about new manual service orders
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.newManualServiceOrdersEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      newManualServiceOrdersEnabled: !prev.newManualServiceOrdersEnabled
                    }))
                  }
                  title="Toggle manual service order notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Fail Orders</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about failed orders
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.failOrdersEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      failOrdersEnabled: !prev.failOrdersEnabled
                    }))
                  }
                  title="Toggle fail order notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">New Manual Refill Requests</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about new manual refill requests
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.newManualRefillRequestsEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      newManualRefillRequestsEnabled: !prev.newManualRefillRequestsEnabled
                    }))
                  }
                  title="Toggle manual refill request notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">New Manual Cancel Requests</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about new manual cancel requests
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.newManualCancelRequestsEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      newManualCancelRequestsEnabled: !prev.newManualCancelRequestsEnabled
                    }))
                  }
                  title="Toggle manual cancel request notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">New Users</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about new user registrations
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.newUsersEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      newUsersEnabled: !prev.newUsersEnabled
                    }))
                  }
                  title="Toggle new user notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">User Activity Logs</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about user activity logs
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.userActivityLogsEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      userActivityLogsEnabled: !prev.userActivityLogsEnabled
                    }))
                  }
                  title="Toggle user activity log notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Pending Transactions</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about pending transactions
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.pendingTransactionsEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      pendingTransactionsEnabled: !prev.pendingTransactionsEnabled
                    }))
                  }
                  title="Toggle pending transaction notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">API Sync Logs</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about API sync logs
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.apiSyncLogsEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      apiSyncLogsEnabled: !prev.apiSyncLogsEnabled
                    }))
                  }
                  title="Toggle API sync log notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">New Child Panel Orders</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about new child panel orders
                  </p>
                </div>
                <Switch
                  checked={adminNotifications.newChildPanelOrdersEnabled}
                  onClick={() =>
                    setAdminNotifications(prev => ({
                      ...prev,
                      newChildPanelOrdersEnabled: !prev.newChildPanelOrdersEnabled
                    }))
                  }
                  title="Toggle child panel order notifications"
                />
              </div>

              <button
                onClick={saveAdminNotifications}
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? <ButtonLoader /> : 'Save Admin Notifications'}
              </button>
            </div>
          </div>

          {/* User Notifications Card */}
          <div className="card card-padding h-fit">
            <div className="card-header">
              <div className="card-icon">
                <FaUser />
              </div>
              <h3 className="card-title">User Notifications</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Welcome</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send welcome notification to new users
                  </p>
                </div>
                <Switch
                  checked={userNotifications.welcomeEnabled}
                  onClick={() =>
                    setUserNotifications(prev => ({
                      ...prev,
                      welcomeEnabled: !prev.welcomeEnabled
                    }))
                  }
                  title="Toggle welcome notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">API Key Changed</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notify users when their API key is changed
                  </p>
                </div>
                <Switch
                  checked={userNotifications.apiKeyChangedEnabled}
                  onClick={() =>
                    setUserNotifications(prev => ({
                      ...prev,
                      apiKeyChangedEnabled: !prev.apiKeyChangedEnabled
                    }))
                  }
                  title="Toggle API key change notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Order Status Changed</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notify users when order status changes
                  </p>
                </div>
                <Switch
                  checked={userNotifications.orderStatusChangedEnabled}
                  onClick={() =>
                    setUserNotifications(prev => ({
                      ...prev,
                      orderStatusChangedEnabled: !prev.orderStatusChangedEnabled
                    }))
                  }
                  title="Toggle order status change notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">New Service</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notify users about new services
                  </p>
                </div>
                <Switch
                  checked={userNotifications.newServiceEnabled}
                  onClick={() =>
                    setUserNotifications(prev => ({
                      ...prev,
                      newServiceEnabled: !prev.newServiceEnabled
                    }))
                  }
                  title="Toggle new service notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Service Updates</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notify users about service updates
                  </p>
                </div>
                <Switch
                  checked={userNotifications.serviceUpdatesEnabled}
                  onClick={() =>
                    setUserNotifications(prev => ({
                      ...prev,
                      serviceUpdatesEnabled: !prev.serviceUpdatesEnabled
                    }))
                  }
                  title="Toggle service update notifications"
                />
              </div>

              <button
                onClick={saveUserNotifications}
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? <ButtonLoader /> : 'Save User Notifications'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;