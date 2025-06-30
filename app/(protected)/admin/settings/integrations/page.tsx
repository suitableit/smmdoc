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
}

interface AnalyticsSettings {
  enabled: boolean;
  googleAnalyticsId: string;
  facebookPixelId: string;
  gtmId: string;
}

interface NotificationSettings {
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  discordWebhook: string;
  slackWebhook: string;
}

interface ReCAPTCHASettings {
  enabled: boolean;
  version: 'v2' | 'v3';
  siteKey: string;
  secretKey: string;
  threshold: number;
}

const IntegrationPage = () => {
  const currentUser = useCurrentUser();

  // Set document title
  useEffect(() => {
    document.title = `Integrations — ${APP_NAME}`;
  }, []);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
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
  });

  const [analyticsSettings, setAnalyticsSettings] = useState<AnalyticsSettings>({
    enabled: false,
    googleAnalyticsId: '',
    facebookPixelId: '',
    gtmId: '',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushNotificationsEnabled: false,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    discordWebhook: '',
    slackWebhook: '',
  });

  const [recaptchaSettings, setRecaptchaSettings] = useState<ReCAPTCHASettings>({
    enabled: false,
    version: 'v3',
    siteKey: '',
    secretKey: '',
    threshold: 0.5,
  });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsPageLoading(true);

        const response = await fetch('/api/admin/integration-settings');
        if (response.ok) {
          const data = await response.json();
          
          if (data.liveChatSettings) setLiveChatSettings(data.liveChatSettings);
          if (data.analyticsSettings) setAnalyticsSettings(data.analyticsSettings);
          if (data.notificationSettings) setNotificationSettings(data.notificationSettings);
          if (data.recaptchaSettings) setRecaptchaSettings(data.recaptchaSettings);
        } else {
          showToast('Failed to load integration settings', 'error');
        }
      } catch (error) {
        console.error('Error loading integration settings:', error);
        showToast('Error loading integration settings', 'error');
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
  const saveIntegrationSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/integration-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveChatSettings,
          analyticsSettings,
          notificationSettings,
          recaptchaSettings,
        }),
      });

      if (response.ok) {
        showToast('Integration settings saved successfully!', 'success');
      } else {
        showToast('Failed to save integration settings', 'error');
      }
    } catch (error) {
      console.error('Error saving integration settings:', error);
      showToast('Error saving integration settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isPageLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Loading cards */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card card-padding h-fit">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Live Chat Integration */}
          <div className="card card-padding h-fit">
            <div className="card-header">
              <div className="card-icon">
                <FaComments />
              </div>
              <h3 className="card-title">Live Chat</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Enable Live Chat</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add live chat functionality to your website
                  </p>
                </div>
                <Switch
                  checked={liveChatSettings.enabled}
                  onClick={() =>
                    setLiveChatSettings(prev => ({
                      ...prev,
                      enabled: !prev.enabled
                    }))
                  }
                  title="Toggle live chat"
                />
              </div>

              {liveChatSettings.enabled && (
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
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Analytics Integration */}
          <div className="card card-padding h-fit">
            <div className="card-header">
              <div className="card-icon">
                <FaChartLine />
              </div>
              <h3 className="card-title">Analytics</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Enable Analytics</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track website analytics and user behavior
                  </p>
                </div>
                <Switch
                  checked={analyticsSettings.enabled}
                  onClick={() =>
                    setAnalyticsSettings(prev => ({
                      ...prev,
                      enabled: !prev.enabled
                    }))
                  }
                  title="Toggle analytics"
                />
              </div>

              {analyticsSettings.enabled && (
                <>
                  <div className="form-group">
                    <label className="form-label">Google Analytics ID</label>
                    <input
                      type="text"
                      value={analyticsSettings.googleAnalyticsId}
                      onChange={(e) =>
                        setAnalyticsSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))
                      }
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Facebook Pixel ID</label>
                    <input
                      type="text"
                      value={analyticsSettings.facebookPixelId}
                      onChange={(e) =>
                        setAnalyticsSettings(prev => ({ ...prev, facebookPixelId: e.target.value }))
                      }
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Enter Facebook Pixel ID"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Google Tag Manager ID</label>
                    <input
                      type="text"
                      value={analyticsSettings.gtmId}
                      onChange={(e) =>
                        setAnalyticsSettings(prev => ({ ...prev, gtmId: e.target.value }))
                      }
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ReCAPTCHA Integration */}
          <div className="card card-padding h-fit">
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

              {recaptchaSettings.enabled && (
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

                  <div className="form-group">
                    <label className="form-label">Site Key</label>
                    <input
                      type="text"
                      value={recaptchaSettings.siteKey}
                      onChange={(e) =>
                        setRecaptchaSettings(prev => ({ ...prev, siteKey: e.target.value }))
                      }
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Enter site key"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Secret Key</label>
                    <input
                      type="password"
                      value={recaptchaSettings.secretKey}
                      onChange={(e) =>
                        setRecaptchaSettings(prev => ({ ...prev, secretKey: e.target.value }))
                      }
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Enter secret key"
                    />
                  </div>

                  {recaptchaSettings.version === 'v3' && (
                    <div className="form-group">
                      <label className="form-label">Score Threshold</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={recaptchaSettings.threshold}
                        onChange={(e) =>
                          setRecaptchaSettings(prev => ({ 
                            ...prev, 
                            threshold: parseFloat(e.target.value) || 0.5 
                          }))
                        }
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Higher values are more restrictive (0.0 - 1.0)
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Notification Integration */}
          <div className="card card-padding h-fit">
            <div className="card-header">
              <div className="card-icon">
                <FaBell />
              </div>
              <h3 className="card-title">Notification</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">Push Notifications</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable browser push notifications
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
                  title="Toggle push notifications"
                />
              </div>

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

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-1">SMS Notifications</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send notifications via SMS
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotificationsEnabled}
                  onClick={() =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      smsNotificationsEnabled: !prev.smsNotificationsEnabled
                    }))
                  }
                  title="Toggle SMS notifications"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discord Webhook URL</label>
                <input
                  type="text"
                  value={notificationSettings.discordWebhook}
                  onChange={(e) =>
                    setNotificationSettings(prev => ({ ...prev, discordWebhook: e.target.value }))
                  }
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slack Webhook URL</label>
                <input
                  type="text"
                  value={notificationSettings.slackWebhook}
                  onChange={(e) =>
                    setNotificationSettings(prev => ({ ...prev, slackWebhook: e.target.value }))
                  }
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={saveIntegrationSettings}
            disabled={isLoading}
            className="btn btn-primary px-8 py-3"
          >
            {isLoading ? <ButtonLoader /> : 'Save All Integration Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPage;