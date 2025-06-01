/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { Copy, User, Shield, Key, DollarSign, Eye, EyeOff, Clock, Globe, Camera } from 'lucide-react';

// Mock components and hooks for demonstration
const ButtonLoader = () => <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>;

const Switch = ({ checked, onCheckedChange, onClick, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-[#5F1DE8]' : 'bg-gray-300 dark:bg-gray-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const PasswordInput = React.forwardRef<HTMLInputElement, any>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        className={className}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTimezone, setSelectedTimezone] = useState('21600');
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

  const copyToClipboard = (key: ApiKey | null) => {
    if (key) {
      navigator.clipboard.writeText(key.key).then(() => {
        setCopied(true);
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
      alert('Password changed successfully!');
    }, 1000);
  };

  const handleTwoFactorToggle = async () => {
    const nextState = !twoFactor;
    setTwoFactor(nextState);
    alert(`Two-factor authentication ${nextState ? 'enabled' : 'disabled'}.`);
  };

  const handleApiKeyGeneration = async () => {
    setApiKey({
      key: 'sk_test_' + Math.random().toString(36).substring(2),
      createdAt: new Date(),
      updatedAt: new Date(),
      id: Math.random().toString(),
      userId: '1'
    });
    alert('API Key generated successfully!');
  };

  return (
    <div className="min-h-screen bg-[#f1f2f6] dark:bg-[#232333] transition-colors duration-200">
      <div className="mx-auto">
        
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account information and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Account Information Card */}
            <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Account Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user?.name || 'msrjihad'}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151428] border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || 'msrjihad@gmail.com'}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151428] border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  
                  <button className="bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 hover:-translate-y-0.5">
                    Change Email
                  </button>
                </div>
              </div>
            </div>

            {/* User Profile Picture Card */}
            <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Picture</h3>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0) || 'M'}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  <button className="bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 hover:-translate-y-0.5">
                    Upload Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <PasswordInput
                      value={formData.currentPass}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, currentPass: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#151428] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <PasswordInput
                      value={formData.newPass}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, newPass: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#151428] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <PasswordInput
                      value={formData.confirmNewPass}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, confirmNewPass: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#151428] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] transition-colors duration-200"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                  >
                    {isLoading ? <ButtonLoader /> : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Two Factor Auth Card */}
            <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">2FA</h3>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Two-factor authentication
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
            </div>

            {/* API Keys Card */}
            <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">API Keys</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Key
                    </label>
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={apiKey?.key || '********************************'}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151428] border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none font-mono text-sm"
                        />
                        
                        {/* Responsive timestamp positioning */}
                        {apiKey?.key && (
                          <div className="mt-2 lg:absolute lg:-bottom-6 lg:left-0 lg:mt-0">
                            <small className="text-xs text-gray-500 dark:text-gray-400">
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
                      
                      <div className="flex gap-2 lg:mt-6">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(apiKey)}
                          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        
                        <button
                          onClick={handleApiKeyGeneration}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 hover:-translate-y-0.5 font-medium"
                        >
                          {apiKey ? 'Generate New' : 'Generate'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timezone Card */}
            <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Timezone</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Timezone
                    </label>
                    <select
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#151428] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] transition-colors duration-200"
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 hover:-translate-y-0.5">
                    Save Timezone
                  </button>
                </div>
              </div>
            </div>

            {/* Change Language Card */}
            <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Change Language</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#151428] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] transition-colors duration-200"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 hover:-translate-y-0.5">
                    Save Language
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProfilePage;