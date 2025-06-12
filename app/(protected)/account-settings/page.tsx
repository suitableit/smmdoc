'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { APP_NAME } from '@/lib/constants';
import { Copy, User, Shield, Key, DollarSign, Eye, EyeOff, Clock, Globe, Camera, CheckCircle, X } from 'lucide-react';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = "w-16 h-16", className = "" }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Mock components and hooks for demonstration
const ButtonLoader = () => <div className="loading-spinner"></div>;

// Toast/Twist Message Component using CSS classes
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <CheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <X className="toast-close-icon" />
    </button>
  </div>
);

const Switch = ({ checked, onCheckedChange, onClick, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={`switch ${checked ? 'switch-checked' : 'switch-unchecked'}`}
  >
    <span className="switch-thumb" />
  </button>
);

const PasswordInput = React.forwardRef<HTMLInputElement, any>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="password-input-container">
      <input
        type={showPassword ? "text" : "password"}
        className={className}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="password-toggle"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

interface ApiKey {
  key: string;
  createdAt: Date;
  updatedAt: Date;
  id: string;
  userId: string;
}

const ProfilePage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Account Settings — ${APP_NAME}`;
  }, []);

  // Mock user data for demonstration
  const user = {
    name: 'john',
    email: 'john.doe@example.com',
    role: 'User',
    isTwoFactorEnabled: false
  };
  
  const rate = 120; // Mock exchange rate
  const userData = {
    addFunds: [{ amount: 150.50 }],
    currency: 'USD',
    orders: []
  };

  const [apiKey, setApiKey] = useState<ApiKey | null>({
    key: 'sk_test_1234567890abcdef1234567890abcdef',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    id: '1',
    userId: '1'
  });
  
  const [twoFactor, setTwoFactor] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTimezone, setSelectedTimezone] = useState('21600');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);
  const [formData, setFormData] = useState({
    currentPass: '',
    newPass: '',
    confirmNewPass: ''
  });

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'bn', label: 'Bengali' },
    { value: 'ar', label: 'Arabic' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'hi', label: 'Hindi' },
  ];

  const timezones = [
    { value: '21600', label: '(UTC +6:00) Bangladesh Standard Time, Bhutan Time, Omsk Time' },
    { value: '0', label: '(UTC) Greenwich Mean Time, Western European Time' },
    { value: '3600', label: '(UTC +1:00) Central European Time, West Africa Time' },
    { value: '19800', label: '(UTC +5:30) Indian Standard Time, Sri Lanka Time' },
    { value: '-18000', label: '(UTC -5:00) Eastern Standard Time, Western Caribbean Standard Time' },
  ];

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'pending' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // Auto hide after 4 seconds
  };

  const copyToClipboard = (key: ApiKey | null) => {
    if (key) {
      navigator.clipboard.writeText(key.key).then(() => {
        setCopied(true);
        showToast('API key copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setFormData({ currentPass: '', newPass: '', confirmNewPass: '' });
      showToast('Password changed successfully!', 'success');
    }, 1000);
  };

  const handleTwoFactorToggle = async () => {
    const nextState = !twoFactor;
    setTwoFactor(nextState);
    showToast(
      `Two-factor authentication ${nextState ? 'enabled' : 'disabled'} successfully!`, 
      'success'
    );
  };

  const handleApiKeyGeneration = async () => {
    setApiKey({
      key: 'smmdoc_' + Math.random().toString(36).substring(2),
      createdAt: new Date(),
      updatedAt: new Date(),
      id: Math.random().toString(),
      userId: '1'
    });
    showToast('API key generated successfully!', 'success');
  };

  if (isPageLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Loading States */}
            <div className="space-y-6">
              
              {/* Account Information Card - Loading */}
              <div className="card card-padding">
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">Loading account information...</div>
                  </div>
                </div>
              </div>

              {/* User Profile Picture Card - Static */}
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <Camera />
                  </div>
                  <h3 className="card-title">Profile Picture</h3>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="profile-picture">
                      {user?.name?.charAt(0) || 'M'}
                    </div>
                    <button className="profile-picture-edit">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="btn btn-primary">
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Change Password Card - Loading */}
              <div className="card card-padding">
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">Loading password settings...</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Static Cards */}
            <div className="space-y-6">
              
              {/* Two Factor Auth Card */}
              <div className="card card-padding">
                <div className="card-header mb-4">
                  <div className="card-icon">
                    <Shield />
                  </div>
                  <h3 className="card-title">2FA</h3>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="form-label">Two-factor authentication</label>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Email-based option to add an extra layer of protection to your account.
                    </p>
                  </div>
                  <div className="ml-4">
                    <Switch
                      checked={twoFactor}
                      onCheckedChange={setTwoFactor}
                      title={`${twoFactor ? 'Disable' : 'Enable'} Two-Factor Authentication`}
                    />
                  </div>
                </div>
              </div>

              {/* API Keys Card */}
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <Key />
                  </div>
                  <h3 className="card-title">API Keys</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label mb-2">API Key</label>
                    <div className="api-key-container">
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value="********************************"
                          className="form-input api-key-input"
                        />
                      </div>
                      
                      <div className="api-key-buttons">
                        <button className="btn btn-secondary flex items-center justify-center gap-2">
                          <Copy className="h-4 w-4" />
                          Copy
                        </button>
                        
                        <button className="btn btn-primary">
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timezone Card */}
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <Clock />
                  </div>
                  <h3 className="card-title">Timezone</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Select Timezone</label>
                    <select className="form-select">
                      <option>(UTC +6:00) Bangladesh Standard Time</option>
                    </select>
                  </div>
                  <button className="btn btn-primary">
                    Save Timezone
                  </button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Account Information Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <User />
                </div>
                <h3 className="card-title">Account Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={user?.name || 'msrjihad'}
                    readOnly
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={user?.email || 'msrjihad@gmail.com'}
                    readOnly
                    className="form-input"
                  />
                </div>
                
                <button className="btn btn-primary">
                  Change Email
                </button>
              </div>
            </div>

            {/* User Profile Picture Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <Camera />
                </div>
                <h3 className="card-title">Profile Picture</h3>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="profile-picture">
                    {user?.name?.charAt(0) || 'M'}
                  </div>
                  <button className="profile-picture-edit">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <button className="btn btn-primary">
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <Shield />
                </div>
                <h3 className="card-title">Change Password</h3>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <PasswordInput
                    value={formData.currentPass}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, currentPass: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <PasswordInput
                    value={formData.newPass}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, newPass: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <PasswordInput
                    value={formData.confirmNewPass}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, confirmNewPass: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? <ButtonLoader /> : 'Change Password'}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Two Factor Auth Card */}
            <div className="card card-padding">
              <div className="card-header mb-4">
                <div className="card-icon">
                  <Shield />
                </div>
                <h3 className="card-title">2FA</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="form-label">Two-factor authentication</label>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Email-based option to add an extra layer of protection to your account. When signing in you'll need to enter a code that will be sent to your email address.
                  </p>
                </div>
                <div className="ml-4">
                  <Switch
                    checked={twoFactor}
                    onCheckedChange={setTwoFactor}
                    onClick={handleTwoFactorToggle}
                    title={`${twoFactor ? 'Disable' : 'Enable'} Two-Factor Authentication`}
                  />
                </div>
              </div>
            </div>

            {/* API Keys Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <Key />
                </div>
                <h3 className="card-title">API Keys</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label mb-2">API Key</label>
                  <div className="api-key-container">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={apiKey?.key || '********************************'}
                        className="form-input api-key-input"
                      />
                      
                      {/* Responsive timestamp positioning */}
                      {apiKey?.key && (
                        <div className="api-key-timestamp">
                          <small>
                            Created: {new Date(apiKey?.createdAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      )}
                    </div>
                    
                    <div className="api-key-buttons">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(apiKey)}
                        className="btn btn-secondary flex items-center justify-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      
                      <button
                        onClick={handleApiKeyGeneration}
                        className="btn btn-primary"
                      >
                        {apiKey ? 'Generate New' : 'Generate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timezone Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <Clock />
                </div>
                <h3 className="card-title">Timezone</h3>
              </div>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Select Timezone</label>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="form-select"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary">
                  Save Timezone
                </button>
              </div>
            </div>

            {/* Change Language Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <Globe />
                </div>
                <h3 className="card-title">Change Language</h3>
              </div>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Select Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="form-select"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary">
                  Save Language
                </button>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProfilePage;