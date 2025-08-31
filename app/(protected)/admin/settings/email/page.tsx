'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import React, { useEffect, useState } from 'react';
import {
  FaCheck,
  FaEnvelope,
  FaEnvelopeOpen,
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

interface EmailSMTPSettings {
  email: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpHostServer: string;
  port: number;
  protocol: 'none' | 'ssl' | 'tls';
}

const EmailSettingsPage = () => {
  const currentUser = useCurrentUser();

  // Set document title
  useEffect(() => {
    document.title = `Email Settings — ${APP_NAME}`;
  }, []);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Email SMTP settings state
  const [emailSettings, setEmailSettings] = useState<EmailSMTPSettings>({
    email: '',
    smtpUsername: '',
    smtpPassword: '',
    smtpHostServer: '',
    port: 587,
    protocol: 'none',
  });

  // Test mail state
  const [testMailData, setTestMailData] = useState({
    recipientEmail: '',
    subject: 'Test Email from ' + APP_NAME,
    message: 'This is a test email to verify SMTP configuration is working correctly.',
  });
  const [isTestingMail, setIsTestingMail] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsPageLoading(true);

        const response = await fetch('/api/admin/email-settings');
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            const settings = data.data;
            setEmailSettings({
              email: settings.email || '',
              smtpUsername: settings.smtp_username || '',
              smtpPassword: settings.smtp_password || '',
              smtpHostServer: settings.smtp_host || '',
              port: settings.smtp_port || 587,
              protocol: settings.smtp_protocol || 'tls'
            });
          }
        } else {
          showToast('Failed to load email settings', 'error');
        }
      } catch (error) {
        console.error('Error loading email settings:', error);
        showToast('Error loading email settings', 'error');
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
  const saveEmailSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailSettings.email,
          smtp_username: emailSettings.smtpUsername,
          smtp_password: emailSettings.smtpPassword,
          smtp_host: emailSettings.smtpHostServer,
          smtp_port: emailSettings.port,
          smtp_protocol: emailSettings.protocol
        }),
      });

      if (response.ok) {
        showToast('Email SMTP settings saved successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to save email settings', 'error');
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      showToast('Error saving email settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test mail function
  const sendTestMail = async () => {
    if (!testMailData.recipientEmail) {
      showToast('Please enter recipient email address', 'error');
      return;
    }

    setIsTestingMail(true);
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testMailData.recipientEmail,
          subject: testMailData.subject || 'SMTP Configuration Test',
          message: testMailData.message || 'This is a test email to verify your SMTP configuration is working correctly. If you receive this email, your SMTP settings are properly configured.'
        }),
      });

      if (response.ok) {
        showToast('Test email sent successfully!', 'success');
        setTestMailData(prev => ({ ...prev, recipientEmail: '' }));
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to send test email', 'error');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      showToast('Error sending test email', 'error');
    } finally {
      setIsTestingMail(false);
    }
  };

  // Show loading state
  if (isPageLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="flex justify-center">
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SMTP Settings Loading Box */}
                <div className="card card-padding">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center flex flex-col items-center">
                      <GradientSpinner size="w-12 h-12" className="mb-3" />
                      <div className="text-base font-medium">Loading SMTP settings...</div>
                    </div>
                  </div>
                </div>
                
                {/* Test Mail Loading Box */}
                <div className="card card-padding">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center flex flex-col items-center">
                      <GradientSpinner size="w-12 h-12" className="mb-3" />
                      <div className="text-base font-medium">Loading test mail...</div>
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

  const protocolOptions = [
    { value: 'none', label: 'None' },
    { value: 'ssl', label: 'SSL' },
    { value: 'tls', label: 'TLS' },
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
          <div className="page-content">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Column - Setup Email SMTP Card */}
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaEnvelope />
                  </div>
                  <h3 className="card-title">Setup Email SMTP</h3>
                </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={emailSettings.email}
                    onChange={(e) =>
                      setEmailSettings(prev => ({ ...prev, email: e.target.value }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Username</label>
                  <input
                    type="text"
                    value={emailSettings.smtpUsername}
                    onChange={(e) =>
                      setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Enter SMTP username"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Password</label>
                  <input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) =>
                      setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Enter SMTP password"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Host Server</label>
                  <input
                    type="text"
                    value={emailSettings.smtpHostServer}
                    onChange={(e) =>
                      setEmailSettings(prev => ({ ...prev, smtpHostServer: e.target.value }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="smtp.example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Port</label>
                  <input
                    type="number"
                    min="1"
                    max="65535"
                    value={emailSettings.port}
                    onChange={(e) =>
                      setEmailSettings(prev => ({
                        ...prev,
                        port: parseInt(e.target.value) || 587
                      }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="587"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Protocol</label>
                  <select
                    value={emailSettings.protocol}
                    onChange={(e) =>
                      setEmailSettings(prev => ({
                        ...prev,
                        protocol: e.target.value as 'none' | 'ssl' | 'tls'
                      }))
                    }
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {protocolOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                  <button
                    onClick={saveEmailSettings}
                    disabled={isLoading}
                    className="btn btn-primary w-full"
                  >
                    {isLoading ? 'Updating...' : 'Save Email SMTP Settings'}
                  </button>
                </div>
              </div>

              {/* Second Column - Test Mail Card */}
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaEnvelopeOpen />
                  </div>
                  <h3 className="card-title">Test Mail</h3>
                </div>

                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Recipient Email</label>
                    <input
                      type="email"
                      value={testMailData.recipientEmail}
                      onChange={(e) =>
                        setTestMailData(prev => ({ ...prev, recipientEmail: e.target.value }))
                      }
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="Enter recipient email address"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      value={testMailData.subject}
                      readOnly
                      className="form-field w-full px-4 py-3 bg-gray-100 dark:bg-gray-600/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 cursor-not-allowed transition-all duration-200"
                      placeholder="Test Email from {APP_NAME}"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      value={testMailData.message}
                      readOnly
                      rows={4}
                      className="form-field w-full px-4 py-3 bg-gray-100 dark:bg-gray-600/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 cursor-not-allowed transition-all duration-200 resize-none"
                      placeholder="This is a test email to verify your SMTP configuration is working correctly."
                    />
                  </div>

                  <button
                    onClick={sendTestMail}
                    disabled={isTestingMail || !testMailData.recipientEmail}
                    className="btn btn-primary w-full"
                  >
                    {isTestingMail ? 'Sending...' : 'Send Test Email'}
                  </button>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <FaEnvelope className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Test Email Configuration
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Use this feature to test your SMTP configuration. Make sure to save your SMTP settings first before sending a test email.
                        </p>
                      </div>
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

export default EmailSettingsPage;