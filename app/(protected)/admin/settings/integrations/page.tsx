'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useCurrentUser } from '@/hooks/use-current-user';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import React, { useEffect, useState } from 'react';
import {
  FaBell,
  FaCheck,
  FaChartLine,
  FaComments,
  FaPlug,
  FaShieldAlt,
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

interface LiveChatSettings {
  enabled: boolean;
  hoverTitle: string;
  socialMediaEnabled: boolean;
  messengerEnabled: boolean;
  messengerUrl: string;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  telegramEnabled: boolean;
  telegramUsername: string;
  tawkToEnabled: boolean;
  tawkToWidgetCode: string;
  visibility: 'all' | 'not-logged-in' | 'signed-in';
}

interface AnalyticsSettings {
  enabled: boolean;
  googleAnalyticsEnabled: boolean;
  googleAnalyticsCode: string;
  googleAnalyticsVisibility: 'all' | 'not-logged-in' | 'signed-in';
  facebookPixelEnabled: boolean;
  facebookPixelCode: string;
  facebookPixelVisibility: 'all' | 'not-logged-in' | 'signed-in';
  gtmEnabled: boolean;
  gtmCode: string;
  gtmVisibility: 'all' | 'not-logged-in' | 'signed-in';
}

interface NotificationSettings {
  pushNotificationsEnabled: boolean;
  oneSignalCode: string;
  oneSignalVisibility: 'all' | 'not-logged-in' | 'signed-in';
  emailNotificationsEnabled: boolean;
  userNotifications: {
    welcome: boolean;
    apiKeyChanged: boolean;
    orderStatusChanged: boolean;
    newService: boolean;
    serviceUpdates: boolean;
  };
  adminNotifications: {
    apiBalanceAlerts: boolean;
    supportTickets: boolean;
    newMessages: boolean;
    newManualServiceOrders: boolean;
    failOrders: boolean;
    newManualRefillRequests: boolean;
    newManualCancelRequests: boolean;
    newUsers: boolean;
    userActivityLogs: boolean;
    pendingTransactions: boolean;
    apiSyncLogs: boolean;
    newChildPanelOrders: boolean;
  };
}

interface ReCAPTCHASettings {
  enabled: boolean;
  version: 'v2' | 'v3';
  v2: {
    siteKey: string;
    secretKey: string;
  };
  v3: {
    siteKey: string;
    secretKey: string;
    threshold: number;
  };
  enabledForms: {
    signUp: boolean;
    signIn: boolean;
    contact: boolean;
    supportTicket: boolean;
    contactSupport: boolean;
  };
}

const IntegrationPage = () => {
  const { appName } = useAppNameWithFallback();

  const currentUser = useCurrentUser();

  // Set document title
  useEffect(() => {
    setPageTitle('Integrations', appName);
  }, [appName]);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Individual loading states for each integration
  const [liveChatLoading, setLiveChatLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [recaptchaLoading, setRecaptchaLoading] = useState(false);
  
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Integration settings state
  const [liveChatSettings, setLiveChatSettings] = useState<LiveChatSettings>({
    enabled: false,
    hoverTitle: 'Chat with us',
    socialMediaEnabled: false,
    messengerEnabled: false,
    messengerUrl: '',
    whatsappEnabled: false,
    whatsappNumber: '',
    telegramEnabled: false,
    telegramUsername: '',
    tawkToEnabled: false,
    tawkToWidgetCode: '',
    visibility: 'all',
  });

  const [analyticsSettings, setAnalyticsSettings] = useState<AnalyticsSettings>({
    enabled: false,
    googleAnalyticsEnabled: false,
    googleAnalyticsCode: '',
    googleAnalyticsVisibility: 'all',
    facebookPixelEnabled: false,
    facebookPixelCode: '',
    facebookPixelVisibility: 'all',
    gtmEnabled: false,
    gtmCode: '',
    gtmVisibility: 'all',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushNotificationsEnabled: false,
    oneSignalCode: '',
    oneSignalVisibility: 'all',
    emailNotificationsEnabled: true,
    userNotifications: {
      welcome: false,
      apiKeyChanged: false,
      orderStatusChanged: false,
      newService: false,
      serviceUpdates: false,
    },
    adminNotifications: {
      apiBalanceAlerts: false,
      supportTickets: false,
      newMessages: false,
      newManualServiceOrders: false,
      failOrders: false,
      newManualRefillRequests: false,
      newManualCancelRequests: false,
      newUsers: false,
      userActivityLogs: false,
      pendingTransactions: false,
      apiSyncLogs: false,
      newChildPanelOrders: false,
    },
  });

  const [recaptchaSettings, setRecaptchaSettings] = useState<ReCAPTCHASettings>({
    enabled: true,
    version: 'v2',
    v2: {
      siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Google's test key for localhost
      secretKey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', // Google's test secret key
    },
    v3: {
      siteKey: '',
      secretKey: '',
      threshold: 0.5,
    },
    enabledForms: {
      signUp: true,
      signIn: true,
      contact: true,
      supportTicket: true,
      contactSupport: true,
    },
  });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsPageLoading(true);
        console.log('🔄 Loading integration settings...');

        const response = await fetch('/api/admin/integration-settings');
        console.log('📡 API Response status:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 API Response data:', data);
          
          if (data.success && data.integrationSettings) {
            const settings = data.integrationSettings;
            console.log('⚙️ Integration settings loaded:', settings);
            
            // Update ReCAPTCHA settings
            setRecaptchaSettings({
              enabled: settings.recaptchaEnabled,
              version: settings.recaptchaVersion,
              v2: {
                siteKey: settings.v2?.siteKey || '',
                secretKey: settings.v2?.secretKey || '',
              },
              v3: {
                siteKey: settings.v3?.siteKey || '',
                secretKey: settings.v3?.secretKey || '',
                threshold: settings.v3?.threshold || 0.5,
              },
              enabledForms: {
                signUp: settings.recaptchaSignUp,
                signIn: settings.recaptchaSignIn,
                contact: settings.recaptchaContact,
                supportTicket: settings.recaptchaSupportTicket,
                contactSupport: settings.recaptchaContactSupport,
              },
            });
            
            // Update Live Chat settings
            setLiveChatSettings({
              enabled: settings.liveChatEnabled,
              hoverTitle: settings.liveChatHoverTitle,
              socialMediaEnabled: settings.liveChatSocialEnabled,
              messengerEnabled: settings.liveChatMessengerEnabled,
              messengerUrl: settings.liveChatMessengerUrl || '',
              whatsappEnabled: settings.liveChatWhatsappEnabled,
              whatsappNumber: settings.liveChatWhatsappNumber || '',
              telegramEnabled: settings.liveChatTelegramEnabled,
              telegramUsername: settings.liveChatTelegramUsername || '',
              tawkToEnabled: settings.liveChatTawkToEnabled,
              tawkToWidgetCode: settings.liveChatTawkToCode || '',
              visibility: settings.liveChatVisibility,
            });
            
            // Update Analytics settings
            setAnalyticsSettings({
              enabled: settings.analyticsEnabled,
              googleAnalyticsEnabled: settings.googleAnalyticsEnabled,
              googleAnalyticsCode: settings.googleAnalyticsCode || '',
              googleAnalyticsVisibility: settings.googleAnalyticsVisibility,
              facebookPixelEnabled: settings.facebookPixelEnabled,
              facebookPixelCode: settings.facebookPixelCode || '',
              facebookPixelVisibility: settings.facebookPixelVisibility,
              gtmEnabled: settings.gtmEnabled,
              gtmCode: settings.gtmCode || '',
              gtmVisibility: settings.gtmVisibility,
            });
            
            // Update Notification settings
            setNotificationSettings({
              pushNotificationsEnabled: settings.pushNotificationsEnabled,
              oneSignalCode: settings.oneSignalCode || '',
              oneSignalVisibility: settings.oneSignalVisibility,
              emailNotificationsEnabled: settings.emailNotificationsEnabled,
              userNotifications: {
                welcome: settings.userNotifWelcome,
                apiKeyChanged: settings.userNotifApiKeyChanged,
                orderStatusChanged: settings.userNotifOrderStatusChanged,
                newService: settings.userNotifNewService,
                serviceUpdates: settings.userNotifServiceUpdates,
              },
              adminNotifications: {
                apiBalanceAlerts: settings.adminNotifApiBalanceAlerts,
                supportTickets: settings.adminNotifSupportTickets,
                newMessages: settings.adminNotifNewMessages,
                newManualServiceOrders: settings.adminNotifNewManualServiceOrders,
                failOrders: settings.adminNotifFailOrders,
                newManualRefillRequests: settings.adminNotifNewManualRefillRequests,
                newManualCancelRequests: settings.adminNotifNewManualCancelRequests,
                newUsers: settings.adminNotifNewUsers,
                userActivityLogs: settings.adminNotifUserActivityLogs,
                pendingTransactions: settings.adminNotifPendingTransactions,
                apiSyncLogs: settings.adminNotifApiSyncLogs,
                newChildPanelOrders: settings.adminNotifNewChildPanelOrders,
              },
            });
          }
        } else {
          console.error('❌ API request failed:', response.status, response.statusText);
          showToast('Failed to load integration settings', 'error');
        }
      } catch (error) {
        console.error('💥 Error loading integration settings:', error);
        showToast('Error loading integration settings', 'error');
      } finally {
        console.log('✅ Loading complete, setting isPageLoading to false');
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
  // Individual save functions for each integration type
  const saveLiveChatSettings = async () => {
    setLiveChatLoading(true);
    try {
      const response = await fetch('/api/admin/integration-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          integrationSettings: {
            liveChatEnabled: liveChatSettings.enabled,
            liveChatHoverTitle: liveChatSettings.hoverTitle,
            socialMediaEnabled: liveChatSettings.socialMediaEnabled,
            messengerEnabled: liveChatSettings.messengerEnabled,
            messengerUrl: liveChatSettings.messengerUrl,
            whatsappEnabled: liveChatSettings.whatsappEnabled,
            whatsappNumber: liveChatSettings.whatsappNumber,
            telegramEnabled: liveChatSettings.telegramEnabled,
            telegramUsername: liveChatSettings.telegramUsername,
            tawkToEnabled: liveChatSettings.tawkToEnabled,
            tawkToWidgetCode: liveChatSettings.tawkToWidgetCode,
            liveChatVisibility: liveChatSettings.visibility,
          }
        }),
      });

      if (response.ok) {
        showToast('Live Chat settings saved successfully!', 'success');
      } else {
        showToast('Failed to save Live Chat settings', 'error');
      }
    } catch (error) {
      console.error('Error saving Live Chat settings:', error);
      showToast('Error saving Live Chat settings', 'error');
    } finally {
      setLiveChatLoading(false);
    }
  };

  const saveAnalyticsSettings = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/admin/integration-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          integrationSettings: {
            analyticsEnabled: analyticsSettings.enabled,
            googleAnalyticsEnabled: analyticsSettings.googleAnalyticsEnabled,
            googleAnalyticsCode: analyticsSettings.googleAnalyticsCode,
            googleAnalyticsVisibility: analyticsSettings.googleAnalyticsVisibility,
            facebookPixelEnabled: analyticsSettings.facebookPixelEnabled,
            facebookPixelCode: analyticsSettings.facebookPixelCode,
            facebookPixelVisibility: analyticsSettings.facebookPixelVisibility,
            gtmEnabled: analyticsSettings.gtmEnabled,
            gtmCode: analyticsSettings.gtmCode,
            gtmVisibility: analyticsSettings.gtmVisibility,
          }
        }),
      });

      if (response.ok) {
        showToast('Analytics settings saved successfully!', 'success');
      } else {
        showToast('Failed to save Analytics settings', 'error');
      }
    } catch (error) {
      console.error('Error saving Analytics settings:', error);
      showToast('Error saving Analytics settings', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    setNotificationsLoading(true);
    try {
      const response = await fetch('/api/admin/integration-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          integrationSettings: {
            pushNotificationsEnabled: notificationSettings.pushNotificationsEnabled,
            oneSignalCode: notificationSettings.oneSignalCode,
            oneSignalVisibility: notificationSettings.oneSignalVisibility,
            emailNotificationsEnabled: notificationSettings.emailNotificationsEnabled,
            userNotifications: notificationSettings.userNotifications,
            adminNotifications: notificationSettings.adminNotifications,
          }
        }),
      });

      if (response.ok) {
        showToast('Notification settings saved successfully!', 'success');
      } else {
        showToast('Failed to save notification settings', 'error');
      }
    } catch (error) {
      console.error('Error saving Notification settings:', error);
      showToast('Error saving notification settings', 'error');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const saveRecaptchaSettings = async () => {
    setRecaptchaLoading(true);
    try {
      // Validate ReCAPTCHA configuration if enabled
      if (recaptchaSettings.enabled) {
        if (recaptchaSettings.version === 'v2') {
          if (!recaptchaSettings.v2.siteKey || !recaptchaSettings.v2.secretKey) {
            showToast('Please configure ReCAPTCHA v2 Site Key and Secret Key before saving.', 'error');
            setRecaptchaLoading(false);
            return;
          }
        } else if (recaptchaSettings.version === 'v3') {
          if (!recaptchaSettings.v3.siteKey || !recaptchaSettings.v3.secretKey) {
            showToast('Please configure ReCAPTCHA v3 Site Key and Secret Key before saving.', 'error');
            setRecaptchaLoading(false);
            return;
          }
        }
      }

      const integrationSettings = {
        recaptchaEnabled: recaptchaSettings.enabled,
        recaptchaVersion: recaptchaSettings.version,
        recaptchaSiteKey: recaptchaSettings.version === 'v2' ? recaptchaSettings.v2.siteKey : recaptchaSettings.v3.siteKey,
        recaptchaSecretKey: recaptchaSettings.version === 'v2' ? recaptchaSettings.v2.secretKey : recaptchaSettings.v3.secretKey,
        v2: {
          siteKey: recaptchaSettings.v2.siteKey,
          secretKey: recaptchaSettings.v2.secretKey,
        },
        v3: {
          siteKey: recaptchaSettings.v3.siteKey,
          secretKey: recaptchaSettings.v3.secretKey,
          threshold: recaptchaSettings.v3.threshold,
        },
        recaptchaThreshold: recaptchaSettings.v3.threshold,
        recaptchaSignUp: recaptchaSettings.enabledForms.signUp,
        recaptchaSignIn: recaptchaSettings.enabledForms.signIn,
        recaptchaContact: recaptchaSettings.enabledForms.contact,
        recaptchaSupportTicket: recaptchaSettings.enabledForms.supportTicket,
        recaptchaContactSupport: recaptchaSettings.enabledForms.contactSupport,
      };

      const response = await fetch('/api/admin/integration-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationSettings }),
      });

      if (response.ok) {
        showToast('ReCAPTCHA settings saved successfully!', 'success');
      } else {
        showToast('Failed to save ReCAPTCHA settings', 'error');
      }
    } catch (error) {
      console.error('Error saving ReCAPTCHA settings:', error);
      showToast('Error saving ReCAPTCHA settings', 'error');
    } finally {
      setRecaptchaLoading(false);
    }
  };

  const saveIntegrationSettings = async () => {
    setIsLoading(true);
    try {
      // Validate ReCAPTCHA configuration if enabled
      if (recaptchaSettings.enabled) {
        if (recaptchaSettings.version === 'v2') {
          if (!recaptchaSettings.v2.siteKey || !recaptchaSettings.v2.secretKey) {
            showToast('Please configure ReCAPTCHA v2 Site Key and Secret Key before saving.', 'error');
            setIsLoading(false);
            return;
          }
        } else if (recaptchaSettings.version === 'v3') {
          if (!recaptchaSettings.v3.siteKey || !recaptchaSettings.v3.secretKey) {
            showToast('Please configure ReCAPTCHA v3 Site Key and Secret Key before saving.', 'error');
            setIsLoading(false);
            return;
          }
        }
      }

      const integrationSettings = {
        // ReCAPTCHA Settings Only
        recaptchaEnabled: recaptchaSettings.enabled,
        recaptchaVersion: recaptchaSettings.version,
        // Legacy fields (for backward compatibility)
        recaptchaSiteKey: recaptchaSettings.version === 'v2' ? recaptchaSettings.v2.siteKey : recaptchaSettings.v3.siteKey,
        recaptchaSecretKey: recaptchaSettings.version === 'v2' ? recaptchaSettings.v2.secretKey : recaptchaSettings.v3.secretKey,
        // Send both v2 and v3 data structures
        v2: {
          siteKey: recaptchaSettings.v2.siteKey,
          secretKey: recaptchaSettings.v2.secretKey,
        },
        v3: {
          siteKey: recaptchaSettings.v3.siteKey,
          secretKey: recaptchaSettings.v3.secretKey,
          threshold: recaptchaSettings.v3.threshold,
        },
        recaptchaThreshold: recaptchaSettings.v3.threshold,
        recaptchaSignUp: recaptchaSettings.enabledForms.signUp,
        recaptchaSignIn: recaptchaSettings.enabledForms.signIn,
        recaptchaContact: recaptchaSettings.enabledForms.contact,
        recaptchaSupportTicket: recaptchaSettings.enabledForms.supportTicket,
        recaptchaContactSupport: recaptchaSettings.enabledForms.contactSupport,
      };

      const response = await fetch('/api/admin/integration-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationSettings }),
      });

      if (response.ok) {
        showToast('ReCAPTCHA settings saved successfully!', 'success');
      } else {
        showToast('Failed to save ReCAPTCHA settings', 'error');
      }
    } catch (error) {
      console.error('Error saving ReCAPTCHA settings:', error);
      showToast('Error saving ReCAPTCHA settings', 'error');
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
          <div className="page-content">
            <div className="columns-1 md:columns-3 gap-6 space-y-6">
              {/* Loading cards */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card card-padding h-fit break-inside-avoid mb-6">
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-center flex flex-col items-center">
                      <GradientSpinner size="w-12 h-12" className="mb-3" />
                      <div className="text-base font-medium">Loading integrations...</div>
                    </div>
                  </div>
                </div>
              ))}
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
        <div className="justify-center">
          <div className="page-content">
            <div className="columns-1 md:columns-3 gap-6 space-y-6">
              {/* Live Chat Integration */}
              <div className="card card-padding h-fit break-inside-avoid mb-6">
                <div className="card-header">
                  <div className="card-icon">
                    <FaComments />
                  </div>
                  <h3 className="card-title">Live Chat</h3>
                </div>

            <div className="space-y-4">
              {/* Live Chat content is always visible */}
              <>
                <div className="space-y-6">
                    {/* Social Media Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enable social media chat integrations
                          </p>
                        </div>
                        <Switch
                          checked={liveChatSettings.socialMediaEnabled}
                          onClick={() =>
                            setLiveChatSettings(prev => ({
                              ...prev,
                              socialMediaEnabled: !prev.socialMediaEnabled,
                              tawkToEnabled: prev.socialMediaEnabled ? prev.tawkToEnabled : false
                            }))
                          }
                          title="Toggle social media chat"
                        />
                      </div>

                      {liveChatSettings.socialMediaEnabled && (
                        <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                          {/* Hover Title */}
                          <div className="form-group">
                            <label className="form-label">Hover Title</label>
                            <input
                              type="text"
                              value={liveChatSettings.hoverTitle}
                              onChange={(e) =>
                                setLiveChatSettings(prev => ({ ...prev, hoverTitle: e.target.value }))
                              }
                              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="Chat with us"
                            />
                          </div>

                          {/* Messenger */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="form-label mb-1">Messenger</label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Enable Facebook Messenger integration
                                </p>
                              </div>
                              <Switch
                                checked={liveChatSettings.messengerEnabled}
                                onClick={() =>
                                  setLiveChatSettings(prev => ({
                                    ...prev,
                                    messengerEnabled: !prev.messengerEnabled
                                  }))
                                }
                                title="Toggle Messenger"
                              />
                            </div>
                            {liveChatSettings.messengerEnabled && (
                              <div className="form-group">
                                <label className="form-label">Messenger URL</label>
                                <input
                                  type="text"
                                  value={liveChatSettings.messengerUrl}
                                  onChange={(e) =>
                                    setLiveChatSettings(prev => ({ ...prev, messengerUrl: e.target.value }))
                                  }
                                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="https://m.me/yourpage"
                                />
                              </div>
                            )}
                          </div>

                          {/* WhatsApp */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="form-label mb-1">WhatsApp</label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Enable WhatsApp chat integration
                                </p>
                              </div>
                              <Switch
                                checked={liveChatSettings.whatsappEnabled}
                                onClick={() =>
                                  setLiveChatSettings(prev => ({
                                    ...prev,
                                    whatsappEnabled: !prev.whatsappEnabled
                                  }))
                                }
                                title="Toggle WhatsApp"
                              />
                            </div>
                            {liveChatSettings.whatsappEnabled && (
                              <div className="form-group">
                                <label className="form-label">WhatsApp Number</label>
                                <input
                                  type="text"
                                  value={liveChatSettings.whatsappNumber}
                                  onChange={(e) =>
                                    setLiveChatSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))
                                  }
                                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="+1234567890"
                                />
                              </div>
                            )}
                          </div>

                          {/* Telegram */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="form-label mb-1">Telegram</label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Enable Telegram chat integration
                                </p>
                              </div>
                              <Switch
                                checked={liveChatSettings.telegramEnabled}
                                onClick={() =>
                                  setLiveChatSettings(prev => ({
                                    ...prev,
                                    telegramEnabled: !prev.telegramEnabled
                                  }))
                                }
                                title="Toggle Telegram"
                              />
                            </div>
                            {liveChatSettings.telegramEnabled && (
                              <div className="form-group">
                                <label className="form-label">Telegram Username</label>
                                <input
                                  type="text"
                                  value={liveChatSettings.telegramUsername}
                                  onChange={(e) =>
                                    setLiveChatSettings(prev => ({ ...prev, telegramUsername: e.target.value }))
                                  }
                                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="@yourusername"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tawk.to Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Tawk.to</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enable tawk.to free live chat widget
                          </p>
                        </div>
                        <Switch
                          checked={liveChatSettings.tawkToEnabled}
                          onClick={() =>
                            setLiveChatSettings(prev => ({
                              ...prev,
                              tawkToEnabled: !prev.tawkToEnabled,
                              socialMediaEnabled: prev.tawkToEnabled ? prev.socialMediaEnabled : false
                            }))
                          }
                          title="Toggle tawk.to"
                        />
                      </div>

                      {liveChatSettings.tawkToEnabled && (
                        <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                          <div className="form-group">
                            <label className="form-label">Widget Code</label>
                            <textarea
                              value={liveChatSettings.tawkToWidgetCode}
                              onChange={(e) =>
                                setLiveChatSettings(prev => ({ ...prev, tawkToWidgetCode: e.target.value }))
                              }
                              rows={6}
                              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none font-mono text-sm"
                              placeholder="Paste your tawk.to widget code here..."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Visibility Section */}
                    <div className="space-y-4">
                      <div className="form-group">
                        <label className="form-label">Visibility</label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Choose when to show the live chat widget
                        </p>
                        <select
                          value={liveChatSettings.visibility}
                          onChange={(e) =>
                            setLiveChatSettings(prev => ({ 
                              ...prev, 
                              visibility: e.target.value as 'all' | 'not-logged-in' | 'signed-in'
                            }))
                          }
                          className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="all">All pages</option>
                          <option value="not-logged-in">Not logged in</option>
                          <option value="signed-in">Signed in</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Save Button for Live Chat */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={saveLiveChatSettings}
                      disabled={liveChatLoading}
                      className="w-full btn btn-primary px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {liveChatLoading ? (
                        <>
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Live Chat Settings
                        </>
                      )}
                    </button>
                  </div>
                </>
            </div>
          </div>

          {/* Analytics Integration */}
          <div className="card card-padding h-fit break-inside-avoid mb-6">
            <div className="card-header">
              <div className="card-icon">
                <FaChartLine />
              </div>
              <h3 className="card-title">Analytics</h3>
            </div>

            <div className="space-y-4">
              {/* Analytics content is always visible */}
              <>
                <div className="space-y-6">
                  {/* Google Analytics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="form-label mb-1">Google Analytics</label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enable Google Analytics tracking
                        </p>
                      </div>
                      <Switch
                        checked={analyticsSettings.googleAnalyticsEnabled}
                        onClick={() =>
                          setAnalyticsSettings(prev => ({
                            ...prev,
                            googleAnalyticsEnabled: !prev.googleAnalyticsEnabled
                          }))
                        }
                        title="Toggle Google Analytics"
                      />
                    </div>
                    {analyticsSettings.googleAnalyticsEnabled && (
                      <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                        <div className="form-group">
                          <label className="form-label">Google Analytics Code</label>
                          <textarea
                            value={analyticsSettings.googleAnalyticsCode}
                            onChange={(e) =>
                              setAnalyticsSettings(prev => ({ ...prev, googleAnalyticsCode: e.target.value }))
                            }
                            rows={6}
                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none font-mono text-sm"
                            placeholder="Paste your Google Analytics code here..."
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Visibility</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Choose when to load Google Analytics
                          </p>
                          <select
                            value={analyticsSettings.googleAnalyticsVisibility}
                            onChange={(e) =>
                              setAnalyticsSettings(prev => ({ 
                                ...prev, 
                                googleAnalyticsVisibility: e.target.value as 'all' | 'not-logged-in' | 'signed-in'
                              }))
                            }
                            className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                          >
                            <option value="all">All pages</option>
                            <option value="not-logged-in">Not logged in</option>
                            <option value="signed-in">Signed in</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Facebook Pixel */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="form-label mb-1">Facebook Pixel</label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enable Facebook Pixel tracking
                        </p>
                      </div>
                      <Switch
                        checked={analyticsSettings.facebookPixelEnabled}
                        onClick={() =>
                          setAnalyticsSettings(prev => ({
                            ...prev,
                            facebookPixelEnabled: !prev.facebookPixelEnabled
                          }))
                        }
                        title="Toggle Facebook Pixel"
                      />
                    </div>
                    {analyticsSettings.facebookPixelEnabled && (
                      <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                        <div className="form-group">
                          <label className="form-label">Facebook Pixel Code</label>
                          <textarea
                            value={analyticsSettings.facebookPixelCode}
                            onChange={(e) =>
                              setAnalyticsSettings(prev => ({ ...prev, facebookPixelCode: e.target.value }))
                            }
                            rows={6}
                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none font-mono text-sm"
                            placeholder="Paste your Facebook Pixel code here..."
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Visibility</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Choose when to load Facebook Pixel
                          </p>
                          <select
                            value={analyticsSettings.facebookPixelVisibility}
                            onChange={(e) =>
                              setAnalyticsSettings(prev => ({ 
                                ...prev, 
                                facebookPixelVisibility: e.target.value as 'all' | 'not-logged-in' | 'signed-in'
                              }))
                            }
                            className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                          >
                            <option value="all">All pages</option>
                            <option value="not-logged-in">Not logged in</option>
                            <option value="signed-in">Signed in</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Google Tag Manager */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="form-label mb-1">Google Tag Manager</label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enable Google Tag Manager
                        </p>
                      </div>
                      <Switch
                        checked={analyticsSettings.gtmEnabled}
                        onClick={() =>
                          setAnalyticsSettings(prev => ({
                            ...prev,
                            gtmEnabled: !prev.gtmEnabled
                          }))
                        }
                        title="Toggle Google Tag Manager"
                      />
                    </div>
                    {analyticsSettings.gtmEnabled && (
                      <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                        <div className="form-group">
                          <label className="form-label">Google Tag Manager Code</label>
                          <textarea
                            value={analyticsSettings.gtmCode}
                            onChange={(e) =>
                              setAnalyticsSettings(prev => ({ ...prev, gtmCode: e.target.value }))
                            }
                            rows={6}
                            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none font-mono text-sm"
                            placeholder="Paste your Google Tag Manager code here..."
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Visibility</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Choose when to load Google Tag Manager
                          </p>
                          <select
                            value={analyticsSettings.gtmVisibility}
                            onChange={(e) =>
                              setAnalyticsSettings(prev => ({ 
                                ...prev, 
                                gtmVisibility: e.target.value as 'all' | 'not-logged-in' | 'signed-in'
                              }))
                            }
                            className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                          >
                            <option value="all">All pages</option>
                            <option value="not-logged-in">Not logged in</option>
                            <option value="signed-in">Signed in</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Save Button for Analytics */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={saveAnalyticsSettings}
                    disabled={analyticsLoading}
                    className="w-full btn btn-primary px-6 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {analyticsLoading ? (
                      <>
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Analytics Settings
                      </>
                    )}
                  </button>
                </div>
              </>
            </div>
          </div>

          {/* ReCAPTCHA Integration */}
          <div className="card card-padding h-fit break-inside-avoid mb-6">
            <div className="card-header">
              <div className="card-icon">
                <FaShieldAlt />
              </div>
              <h3 className="card-title">ReCAPTCHA</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Enable ReCAPTCHA</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protect forms from spam and abuse
                  </p>
                </div>
                <Switch
                  checked={recaptchaSettings.enabled}
                  onClick={() =>
                    setRecaptchaSettings(prev => ({
                      ...prev,
                      enabled: !prev.enabled
                    }))
                  }
                  title="Toggle ReCAPTCHA"
                />
              </div>

              {/* ReCAPTCHA content is always visible regardless of the main toggle state */}
              <>
                <div className="form-group">
                    <label className="form-label">ReCAPTCHA Version</label>
                    <select
                      value={recaptchaSettings.version}
                      onChange={(e) =>
                        setRecaptchaSettings(prev => ({ 
                          ...prev, 
                          version: e.target.value as 'v2' | 'v3'
                        }))
                      }
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="v2">reCAPTCHA v2</option>
                      <option value="v3">reCAPTCHA v3</option>
                    </select>
                  </div>

                  {/* ReCAPTCHA v2 Configuration */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">ReCAPTCHA v2 Configuration</h4>
                      {recaptchaSettings.version === 'v2' && (!recaptchaSettings.v2.siteKey || !recaptchaSettings.v2.secretKey) && (
                        <div className="flex items-center text-amber-600 dark:text-amber-400">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">Configuration Required</span>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">v2 Site Key</label>
                      <input
                        type="text"
                        value={recaptchaSettings.v2.siteKey}
                        onChange={(e) =>
                          setRecaptchaSettings(prev => ({ 
                            ...prev, 
                            v2: { ...prev.v2, siteKey: e.target.value }
                          }))
                        }
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter ReCAPTCHA v2 site key"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">v2 Secret Key</label>
                      <input
                        type="text"
                        value={recaptchaSettings.v2.secretKey}
                        onChange={(e) =>
                          setRecaptchaSettings(prev => ({ 
                            ...prev, 
                            v2: { ...prev.v2, secretKey: e.target.value }
                          }))
                        }
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter ReCAPTCHA v2 secret key"
                      />
                    </div>
                  </div>

                  {/* ReCAPTCHA v3 Configuration */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">ReCAPTCHA v3 Configuration</h4>
                      {recaptchaSettings.version === 'v3' && (!recaptchaSettings.v3.siteKey || !recaptchaSettings.v3.secretKey) && (
                        <div className="flex items-center text-amber-600 dark:text-amber-400">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">Configuration Required</span>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">v3 Site Key</label>
                      <input
                        type="text"
                        value={recaptchaSettings.v3.siteKey}
                        onChange={(e) =>
                          setRecaptchaSettings(prev => ({ 
                            ...prev, 
                            v3: { ...prev.v3, siteKey: e.target.value }
                          }))
                        }
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter ReCAPTCHA v3 site key"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">v3 Secret Key</label>
                      <input
                        type="text"
                        value={recaptchaSettings.v3.secretKey}
                        onChange={(e) =>
                          setRecaptchaSettings(prev => ({ 
                            ...prev, 
                            v3: { ...prev.v3, secretKey: e.target.value }
                          }))
                        }
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter ReCAPTCHA v3 secret key"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">v3 Score Threshold</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Set the minimum score (0.0 to 1.0) required to pass verification
                      </p>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={recaptchaSettings.v3.threshold}
                        onChange={(e) =>
                          setRecaptchaSettings(prev => ({ 
                            ...prev, 
                            v3: { ...prev.v3, threshold: parseFloat(e.target.value) || 0.5 }
                          }))
                        }
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        placeholder="0.5"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Enable ReCAPTCHA for Forms</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Select which forms should have ReCAPTCHA protection
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                      {/* Select All Option */}
                      <div className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                        <input
                          type="checkbox"
                          id="recaptcha-select-all"
                          checked={Object.values(recaptchaSettings.enabledForms).every(Boolean)}
                          onChange={(e) => {
                            const allSelected = e.target.checked;
                            setRecaptchaSettings(prev => ({
                              ...prev,
                              enabledForms: {
                                signUp: allSelected,
                                signIn: allSelected,
                                contact: allSelected,
                                supportTicket: allSelected,
                                contactSupport: allSelected,
                              }
                            }));
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="recaptcha-select-all" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Select All Forms
                        </label>
                      </div>
                      
                      {/* Form Options in 2 Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="recaptcha-signup"
                            checked={recaptchaSettings.enabledForms.signUp}
                            onChange={(e) =>
                              setRecaptchaSettings(prev => ({
                                ...prev,
                                enabledForms: { ...prev.enabledForms, signUp: e.target.checked }
                              }))
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="recaptcha-signup" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Sign Up
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="recaptcha-signin"
                            checked={recaptchaSettings.enabledForms.signIn}
                            onChange={(e) =>
                              setRecaptchaSettings(prev => ({
                                ...prev,
                                enabledForms: { ...prev.enabledForms, signIn: e.target.checked }
                              }))
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="recaptcha-signin" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Sign In
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="recaptcha-contact"
                            checked={recaptchaSettings.enabledForms.contact}
                            onChange={(e) =>
                              setRecaptchaSettings(prev => ({
                                ...prev,
                                enabledForms: { ...prev.enabledForms, contact: e.target.checked }
                              }))
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="recaptcha-contact" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Contact
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="recaptcha-support-ticket"
                            checked={recaptchaSettings.enabledForms.supportTicket}
                            onChange={(e) =>
                              setRecaptchaSettings(prev => ({
                                ...prev,
                                enabledForms: { ...prev.enabledForms, supportTicket: e.target.checked }
                              }))
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="recaptcha-support-ticket" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Support Ticket
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="recaptcha-contact-support"
                            checked={recaptchaSettings.enabledForms.contactSupport}
                            onChange={(e) =>
                              setRecaptchaSettings(prev => ({
                                ...prev,
                                enabledForms: { ...prev.enabledForms, contactSupport: e.target.checked }
                              }))
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="recaptcha-contact-support" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Contact Support
                          </label>
                        </div>
                      </div>
                      
                      {/* Status Message */}
                      {!Object.values(recaptchaSettings.enabledForms).some(Boolean) && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            No forms selected. ReCAPTCHA will not be active on any forms.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save Button for ReCAPTCHA */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={saveRecaptchaSettings}
                      disabled={recaptchaLoading}
                      className="w-full btn btn-primary px-6 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {recaptchaLoading ? (
                        <>
                          Saving...
                        </>
                      ) : (
                        <>
                          Save ReCAPTCHA Settings
                        </>
                      )}
                    </button>
                  </div>

                </>
            </div>
          </div>

          {/* Notification Integration */}
          <div className="card card-padding h-fit break-inside-avoid mb-6">
            <div className="card-header">
              <div className="card-icon">
                <FaBell />
              </div>
              <h3 className="card-title">Notification</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">Push Notifications (OneSignal)</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable OneSignal push notifications
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotificationsEnabled}
                    onClick={() =>
                      setNotificationSettings(prev => ({
                        ...prev,
                        pushNotificationsEnabled: !prev.pushNotificationsEnabled
                      }))
                    }
                    title="Toggle OneSignal push notifications"
                  />
                </div>
                {notificationSettings.pushNotificationsEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                    <div className="form-group">
                      <label className="form-label">OneSignal Code</label>
                      <textarea
                        value={notificationSettings.oneSignalCode}
                        onChange={(e) =>
                          setNotificationSettings(prev => ({ ...prev, oneSignalCode: e.target.value }))
                        }
                        rows={6}
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none font-mono text-sm"
                        placeholder="Paste your OneSignal code here..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Visibility</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Choose when to load OneSignal notifications
                      </p>
                      <select
                        value={notificationSettings.oneSignalVisibility}
                        onChange={(e) =>
                          setNotificationSettings(prev => ({ 
                            ...prev, 
                            oneSignalVisibility: e.target.value as 'all' | 'not-logged-in' | 'signed-in'
                          }))
                        }
                        className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      >
                        <option value="all">All pages</option>
                        <option value="not-logged-in">Not logged in</option>
                        <option value="signed-in">Signed in</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">Email Notifications</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotificationsEnabled}
                    onClick={() =>
                      setNotificationSettings(prev => ({
                        ...prev,
                        emailNotificationsEnabled: !prev.emailNotificationsEnabled
                      }))
                    }
                    title="Toggle email notifications"
                  />
                </div>
                {notificationSettings.emailNotificationsEnabled && (
                  <div className="space-y-6 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                    {/* User Notifications */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">User Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Email notifications sent to users
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                        {/* Select All User Notifications */}
                        <div className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                          <input
                            type="checkbox"
                            id="user-notifications-select-all"
                            checked={Object.values(notificationSettings.userNotifications).every(Boolean)}
                            onChange={(e) => {
                              const allSelected = e.target.checked;
                              setNotificationSettings(prev => ({
                                ...prev,
                                userNotifications: {
                                  welcome: allSelected,
                                  apiKeyChanged: allSelected,
                                  orderStatusChanged: allSelected,
                                  newService: allSelected,
                                  serviceUpdates: allSelected,
                                }
                              }));
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="user-notifications-select-all" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                            Select All User Notifications
                          </label>
                        </div>
                        
                        {/* User Notification Options */}
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="user-welcome"
                                checked={notificationSettings.userNotifications.welcome}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    userNotifications: { ...prev.userNotifications, welcome: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="user-welcome" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Welcome
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Send welcome notification to new users
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="user-api-key-changed"
                                checked={notificationSettings.userNotifications.apiKeyChanged}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    userNotifications: { ...prev.userNotifications, apiKeyChanged: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="user-api-key-changed" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  API Key Changed
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Notify users when their API key is changed
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="user-order-status-changed"
                                checked={notificationSettings.userNotifications.orderStatusChanged}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    userNotifications: { ...prev.userNotifications, orderStatusChanged: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="user-order-status-changed" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Order Status Changed
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Notify users when order status changes
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="user-new-service"
                                checked={notificationSettings.userNotifications.newService}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    userNotifications: { ...prev.userNotifications, newService: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="user-new-service" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  New Service
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Notify users about new services
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="user-service-updates"
                                checked={notificationSettings.userNotifications.serviceUpdates}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    userNotifications: { ...prev.userNotifications, serviceUpdates: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="user-service-updates" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Service Updates
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Notify users about service updates
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Message */}
                        {!Object.values(notificationSettings.userNotifications).some(Boolean) && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              No user notifications selected. Users will not receive any email notifications.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Notifications */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Email notifications sent to administrators
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                        {/* Select All Admin Notifications */}
                        <div className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                          <input
                            type="checkbox"
                            id="admin-notifications-select-all"
                            checked={Object.values(notificationSettings.adminNotifications).every(Boolean)}
                            onChange={(e) => {
                              const allSelected = e.target.checked;
                              setNotificationSettings(prev => ({
                                ...prev,
                                adminNotifications: {
                                  apiBalanceAlerts: allSelected,
                                  supportTickets: allSelected,
                                  newMessages: allSelected,
                                  newManualServiceOrders: allSelected,
                                  failOrders: allSelected,
                                  newManualRefillRequests: allSelected,
                                  newManualCancelRequests: allSelected,
                                  newUsers: allSelected,
                                  userActivityLogs: allSelected,
                                  pendingTransactions: allSelected,
                                  apiSyncLogs: allSelected,
                                  newChildPanelOrders: allSelected,
                                }
                              }));
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="admin-notifications-select-all" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                            Select All Admin Notifications
                          </label>
                        </div>
                        
                        {/* Admin Notification Options in 2 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-api-balance-alerts"
                                checked={notificationSettings.adminNotifications.apiBalanceAlerts}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, apiBalanceAlerts: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-api-balance-alerts" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  API Balance Alerts
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about API balance alerts
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-support-tickets"
                                checked={notificationSettings.adminNotifications.supportTickets}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, supportTickets: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-support-tickets" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Support Tickets
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about new support tickets
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-new-messages"
                                checked={notificationSettings.adminNotifications.newMessages}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, newMessages: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-new-messages" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  New Messages
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about new messages
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-new-manual-service-orders"
                                checked={notificationSettings.adminNotifications.newManualServiceOrders}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, newManualServiceOrders: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-new-manual-service-orders" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  New Manual Service Orders
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about new manual service orders
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-fail-orders"
                                checked={notificationSettings.adminNotifications.failOrders}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, failOrders: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-fail-orders" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Fail Orders
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about failed orders
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-new-manual-refill-requests"
                                checked={notificationSettings.adminNotifications.newManualRefillRequests}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, newManualRefillRequests: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-new-manual-refill-requests" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  New Manual Refill Requests
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about new manual refill requests
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-new-manual-cancel-requests"
                                checked={notificationSettings.adminNotifications.newManualCancelRequests}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, newManualCancelRequests: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-new-manual-cancel-requests" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  New Manual Cancel Requests
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about new manual cancel requests
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-new-users"
                                checked={notificationSettings.adminNotifications.newUsers}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, newUsers: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-new-users" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  New Users
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about new user registrations
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-user-activity-logs"
                                checked={notificationSettings.adminNotifications.userActivityLogs}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, userActivityLogs: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-user-activity-logs" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  User Activity Logs
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about user activity logs
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-pending-transactions"
                                checked={notificationSettings.adminNotifications.pendingTransactions}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, pendingTransactions: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-pending-transactions" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Pending Transactions
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about pending transactions
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-api-sync-logs"
                                checked={notificationSettings.adminNotifications.apiSyncLogs}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, apiSyncLogs: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-api-sync-logs" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  API Sync Logs
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about API sync logs
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="admin-new-child-panel-orders"
                                checked={notificationSettings.adminNotifications.newChildPanelOrders}
                                onChange={(e) =>
                                  setNotificationSettings(prev => ({
                                    ...prev,
                                    adminNotifications: { ...prev.adminNotifications, newChildPanelOrders: e.target.checked }
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div>
                                <label htmlFor="admin-new-child-panel-orders" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  New Child Panel Orders
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Get notified about new child panel orders
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Message */}
                        {!Object.values(notificationSettings.adminNotifications).some(Boolean) && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              No admin notifications selected. Administrators will not receive any email notifications.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Save Button for Notifications */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={saveNotificationSettings}
                    disabled={notificationsLoading}
                    className="w-full btn btn-primary px-6 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {notificationsLoading ? (
                      <>
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Notification Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPage;