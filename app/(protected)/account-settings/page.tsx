'use client';
/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCurrentUser } from '@/hooks/use-current-user';
import { getUserDetails } from '@/lib/actions/getUser';
import { APP_NAME } from '@/lib/constants';
import { setUserDetails } from '@/lib/slice/userDetails';
import React, { useEffect, useState } from 'react';
import {
  FaCamera,
  FaCheck,
  FaClock,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaGlobe,
  FaKey,
  FaShieldAlt,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

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
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
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

const PasswordInput = React.forwardRef<HTMLInputElement, any>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="password-input-container">
        <input
          type={showPassword ? 'text' : 'password'}
          className={className}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="password-toggle"
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

interface ApiKey {
  key: string;
  createdAt: Date;
  updatedAt: Date;
  id: number;
  userid: number;
}

const ProfilePage = () => {
  const dispatch = useDispatch();
  const currentUser = useCurrentUser();
  const userDetails = useSelector((state: any) => state.userDetails);

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Account Settings — ${APP_NAME}`;
  }, []);

  // State management
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [twoFactor, setTwoFactor] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTimezone, setSelectedTimezone] = useState('21600');
  const [showApiKey, setShowApiKey] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [formData, setFormData] = useState({
    currentPass: '',
    newPass: '',
    confirmNewPass: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    username: '',
  });
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingEmailChange, setPendingEmailChange] = useState<string | null>(null);
  const [isEmailVerificationPending, setIsEmailVerificationPending] = useState(false);

  // Form validation states
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
    email?: string;
    username?: string;
    currentPass?: string;
    newPass?: string;
    confirmNewPass?: string;
  }>({});
  const [isFormValid, setIsFormValid] = useState(true);

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'bn', label: 'Bengali' },
    { value: 'ar', label: 'Arabic' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'hi', label: 'Hindi' },
  ];

  const timezones = [
    {
      value: '21600',
      label: '(UTC +6:00) Bangladesh Standard Time, Bhutan Time, Omsk Time',
    },
    { value: '0', label: '(UTC) Greenwich Mean Time, Western European Time' },
    {
      value: '3600',
      label: '(UTC +1:00) Central European Time, West Africa Time',
    },
    {
      value: '19800',
      label: '(UTC +5:30) Indian Standard Time, Sri Lanka Time',
    },
    {
      value: '-18000',
      label:
        '(UTC -5:00) Eastern Standard Time, Western Caribbean Standard Time',
    },
  ];

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsUserDataLoading(true);

        // Get user details from server
        const userData = await getUserDetails();

        if (userData) {
          // Dispatch to Redux store
          dispatch(setUserDetails(userData));

          // Set component state from userData
          setTwoFactor(userData.isTwoFactorEnabled || false);
          setSelectedLanguage((userData as any).language || 'en');
          setSelectedTimezone((userData as any).timezone || '21600');

          // Initialize profile data
          setProfileData({
            fullName: userData.name || '',
            email: userData.email || '',
            username: userData.username || '',
          });

          // Set API key if exists
          if ((userData as any).apiKey) {
            setApiKey({
              key: (userData as any).apiKey,
              createdAt: new Date(),
              updatedAt: new Date(),
              id: 1,
              userid: userData.id,
            });
          }
        } else {
          showToast('Failed to load user data', 'error');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading user data', 'error');
      } finally {
        setIsUserDataLoading(false);
        setIsPageLoading(false);
      }
    };

    // Only load if we have a current user
    if (currentUser?.id) {
      loadUserData();
    } else {
      setIsPageLoading(false);
      setIsUserDataLoading(false);
    }
  }, [currentUser?.id, dispatch]);

  // Sync API key from Redux store
  useEffect(() => {
    if (userDetails?.apiKey && !apiKey) {
      setApiKey({
        key: userDetails.apiKey,
        createdAt: new Date(userDetails.apiKeyCreatedAt || new Date()),
        updatedAt: new Date(userDetails.apiKeyUpdatedAt || new Date()),
        id: userDetails.apiKeyId || 1,
        userid: userDetails.id,
      });
    }
  }, [userDetails, apiKey]);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
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

  // Handle password change
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.currentPass ||
      !formData.newPass ||
      !formData.confirmNewPass
    ) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (formData.newPass !== formData.confirmNewPass) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (formData.newPass.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Call API to change password
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPass,
          newPassword: formData.newPass,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setFormData({ currentPass: '', newPass: '', confirmNewPass: '' });
        showToast('Password changed successfully!', 'success');
      } else {
        showToast(result.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showToast('Error changing password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 2FA toggle
  const handleTwoFactorToggle = async () => {
    const nextState = !twoFactor;

    try {
      const response = await fetch('/api/user/toggle-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: nextState,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTwoFactor(nextState);

        // Update Redux store
        dispatch(
          setUserDetails({
            ...userDetails,
            isTwoFactorEnabled: nextState,
          })
        );

        showToast(
          `Two-factor authentication ${
            nextState ? 'enabled' : 'disabled'
          } successfully!`,
          'success'
        );
      } else {
        showToast(result.message || 'Failed to toggle 2FA', 'error');
      }
    } catch (error) {
      console.error('2FA toggle error:', error);
      showToast('Error toggling 2FA', 'error');
    }
  };

  // Handle API key generation
  const handleApiKeyGeneration = async () => {
    try {
      const response = await fetch('/api/user/generate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        const newApiKey = {
          key: result.data.apiKey,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
          id: result.data.id,
          userid: result.data.userId,
        };

        setApiKey(newApiKey);
        setShowApiKey(true);

        // Update Redux store
        dispatch(
          setUserDetails({
            ...userDetails,
            apiKey: result.data.apiKey,
            apiKeyCreatedAt: result.data.createdAt,
            apiKeyUpdatedAt: result.data.updatedAt,
            apiKeyId: result.data.id,
          })
        );

        showToast('API key generated successfully!', 'success');
      } else {
        showToast(result.message || 'Failed to generate API key', 'error');
      }
    } catch (error) {
      console.error('API key generation error:', error);
      showToast('Error generating API key', 'error');
    }
  };

  // Handle timezone save
  const handleTimezoneSave = async () => {
    try {
      const response = await fetch('/api/user/update-timezone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timezone: selectedTimezone,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        dispatch(
          setUserDetails({
            ...userDetails,
            timezone: selectedTimezone,
          })
        );

        showToast('Timezone updated successfully!', 'success');
      } else {
        showToast(result.message || 'Failed to update timezone', 'error');
      }
    } catch (error) {
      console.error('Timezone update error:', error);
      showToast('Error updating timezone', 'error');
    }
  };

  // Handle language save
  const handleLanguageSave = async () => {
    try {
      const response = await fetch('/api/user/update-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        dispatch(
          setUserDetails({
            ...userDetails,
            language: selectedLanguage,
          })
        );

        showToast('Language updated successfully!', 'success');
      } else {
        showToast(result.message || 'Failed to update language', 'error');
      }
    } catch (error) {
      console.error('Language update error:', error);
      showToast('Error updating language', 'error');
    }
  };

  // Handle profile update toggle
  const handleUpdateProfile = () => {
    if (isEditingProfile) {
      // Cancel editing - reset to original values
      setProfileData({
        username: user?.username || '',
        fullName: user?.name || '',
        email: user?.email || '',
      });
      setIsEditingProfile(false);
      setHasProfileChanges(false);
    } else {
      // Enable editing
      setIsEditingProfile(true);
    }
  };

  // Handle profile data changes
  const handleProfileDataChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate field in real-time
    validateProfileField(field, value);

    // Check if there are changes
    const originalFullName = user?.name || '';
    const originalEmail = user?.email || '';
    const originalUsername = user?.username || '';

    const newData = {
      ...profileData,
      [field]: value,
    };

    const hasChanges =
      newData.fullName !== originalFullName || 
      newData.email !== originalEmail ||
      newData.username !== originalUsername;
    setHasProfileChanges(hasChanges);
  };

  // Handle save profile changes
  const handleSaveProfileChanges = async () => {
    if (!hasProfileChanges) return;

    // Validate all fields before submitting
    const emailError = validateEmail(profileData.email);
    const fullNameError = validateFullName(profileData.fullName);
    const usernameError = validateUsername(profileData.username);

    if (emailError || fullNameError || usernameError) {
      setValidationErrors({
        email: emailError,
        fullName: fullNameError,
        username: usernameError,
      });
      showToast('Please fix validation errors before saving', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Check if email is being changed
      const originalEmail = user?.email || '';
      const isEmailChanged = profileData.email !== originalEmail;

      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: profileData.fullName,
          email: profileData.email,
          username: profileData.username,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // If email was changed, set up verification flow
        if (isEmailChanged) {
          setPendingEmailChange(profileData.email);
          setIsEmailVerificationPending(true);
          showToast('Profile updated! Please verify your new email address.', 'info');
        } else {
          showToast('Profile updated successfully!', 'success');
        }

        // Update Redux store
        dispatch(
          setUserDetails({
            ...userDetails,
            name: profileData.fullName,
            username: profileData.username,
            // Only update email if it wasn't changed (to avoid confusion)
            email: isEmailChanged ? userDetails.email : profileData.email,
            emailVerified: isEmailChanged ? false : (result.data?.emailVerified || userDetails.emailVerified),
          })
        );

        setIsEditingProfile(false);
        setHasProfileChanges(false);
      } else {
        // Show specific error message from API
        const errorMessage = result.error || result.message || 'Failed to update profile';
        showToast(errorMessage, 'error');
        console.error('Profile update failed:', result);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showToast('Network error: Unable to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend verification email
  const handleResendVerificationEmail = async () => {
    try {
      const response = await fetch('/api/user/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmailChange || user?.email, // Send to pending email if exists
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const emailTarget = pendingEmailChange || user?.email;
        showToast(`Verification email sent to ${emailTarget}!`, 'success');
      } else {
        showToast(
          result.message || 'Failed to send verification email',
          'error'
        );
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      showToast('Error sending verification email', 'error');
    }
  };

  // Handle profile picture upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔄 Avatar upload started');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📁 File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      showToast('Invalid file type. Only JPEG, PNG, and GIF are allowed.', 'error');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      showToast('File size too large. Maximum size is 5MB.', 'error');
      return;
    }

    console.log('✅ File validation passed');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('📷 Preview created');
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    console.log('🔄 Starting upload...');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      console.log('📤 Sending request to /api/user/upload-avatar');
      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await response.json();
      console.log('📋 Response data:', result);

      if (response.ok) {
        console.log('✅ Upload successful');
        // Update Redux store
        const updatedUserDetails = {
          ...userDetails,
          image: result.data.image,
        };
        dispatch(setUserDetails(updatedUserDetails));

        // Update session
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: result.data.image,
            }),
          });
        } catch (sessionError) {
          console.log('Session update failed, but image uploaded successfully');
        }

        setAvatarPreview(null);
        showToast('Profile picture updated successfully!', 'success');
        
        // Refresh user data to get updated image
        setTimeout(async () => {
          try {
            const updatedUserData = await getUserDetails();
            if (updatedUserData) {
              dispatch(setUserDetails(updatedUserData));
              // Dispatch custom event to notify header component
              window.dispatchEvent(new CustomEvent('avatarUpdated'));
            }
          } catch (error) {
            console.log('Failed to refresh user data, but image uploaded successfully');
          }
        }, 500);
      } else {
        console.log('❌ Upload failed:', result.error);
        showToast(result.error || 'Failed to upload profile picture', 'error');
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      showToast('Error uploading profile picture', 'error');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      console.log('🏁 Upload process finished');
    }
  };

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validateFullName = (name: string): string | null => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Full name must be at least 2 characters';
    return null;
  };

  const validateUsername = (username: string): string | null => {
    if (!username.trim()) return 'Username is required';
    if (username.trim().length < 3) return 'Username must be at least 3 characters';
    if (username.trim().length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  // Real-time validation for profile data
  const validateProfileField = (field: string, value: string) => {
    let error: string | null = null;

    if (field === 'fullName') {
      error = validateFullName(value);
    } else if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'username') {
      error = validateUsername(value);
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return error === null;
  };

  // Real-time validation for password form
  const validatePasswordField = (field: string, value: string) => {
    let error: string | null = null;

    if (field === 'currentPass') {
      error = value ? null : 'Current password is required';
    } else if (field === 'newPass') {
      error = validatePassword(value);
    } else if (field === 'confirmNewPass') {
      error = validateConfirmPassword(formData.newPass, value);
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));

    // Check overall form validity
    const isValid = !error &&
      !!formData.currentPass &&
      !!formData.newPass &&
      !!formData.confirmNewPass &&
      formData.newPass === formData.confirmNewPass;

    setIsFormValid(isValid);

    return error === null;
  };

  if (isPageLoading || isUserDataLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="card card-padding">
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">
                      Loading account information...
                    </div>
                  </div>
                </div>
              </div>
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaCamera />
                  </div>
                  <h3 className="card-title">Profile Picture</h3>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="profile-picture">
                      {currentUser?.username?.charAt(0) || 'U'}
                    </div>
                    <button className="profile-picture-edit">
                      <FaCamera className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="btn btn-primary">Upload Photo</button>
                </div>
              </div>
              {/* Change Password Card - Loading */}
              <div className="card card-padding">
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">
                      Loading password settings...
                    </div>
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
                    <FaShieldAlt />
                  </div>
                  <h3 className="card-title">2FA</h3>
                </div>

                <div className="flex items-center justify-center min-h-[100px]">
                  <GradientSpinner size="w-8 h-8" />
                </div>
              </div>

              {/* API Keys Card */}
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaKey />
                  </div>
                  <h3 className="card-title">API Keys</h3>
                </div>

                <div className="flex items-center justify-center min-h-[150px]">
                  <GradientSpinner size="w-8 h-8" />
                </div>
              </div>

              {/* Timezone Card */}
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaClock />
                  </div>
                  <h3 className="card-title">Timezone</h3>
                </div>

                <div className="flex items-center justify-center min-h-[120px]">
                  <GradientSpinner size="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use userDetails from Redux store for real-time updates
  const user = userDetails || currentUser;

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
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaUser />
                </div>
                <h3 className="card-title">Account Information</h3>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={
                      isEditingProfile ? profileData.username : user?.username || ''
                    }
                    onChange={(e) =>
                      handleProfileDataChange('username', e.target.value)
                    }
                    readOnly={!isEditingProfile}
                    className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border ${
                      validationErrors.username
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                    placeholder="Enter username"
                  />
                  {validationErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) =>
                      handleProfileDataChange('fullName', e.target.value)
                    }
                    className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border ${
                      validationErrors.fullName
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                    placeholder="Enter full name"
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleProfileDataChange('email', e.target.value)
                      }
                      className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border ${
                        validationErrors.email
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                      placeholder="Enter email address"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {(user as any)?.emailVerified && !pendingEmailChange ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                  {pendingEmailChange && (
                    <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                      Pending verification for: {pendingEmailChange}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {hasProfileChanges ? (
                    <button
                      onClick={handleSaveProfileChanges}
                      disabled={isLoading}
                      className="btn btn-primary"
                    >
                      {isLoading ? <ButtonLoader /> : 'Save Changes'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="btn btn-primary opacity-50 cursor-not-allowed"
                    >
                      No Changes to Save
                    </button>
                  )}

                  {(!(user as any)?.emailVerified || pendingEmailChange) && (
                    <button
                      onClick={handleResendVerificationEmail}
                      className="btn btn-secondary"
                    >
                      Send Verification Email
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* User Profile Picture Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaCamera />
                </div>
                <h3 className="card-title">Profile Picture</h3>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile Preview"
                      className="profile-picture opacity-75"
                    />
                  ) : user?.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="profile-picture"
                    />
                  ) : (
                    <div className="profile-picture">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <label htmlFor="avatar-upload" className="profile-picture-edit cursor-pointer">
                    <FaCamera className="w-4 h-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <label htmlFor="avatar-upload" className="btn btn-primary cursor-pointer">
                  {isUploadingAvatar ? <ButtonLoader /> : 'Upload Photo'}
                </label>
                {avatarPreview && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Uploading new profile picture...
                  </p>
                )}
              </div>
            </div>

            {/* Change Password Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaShieldAlt />
                </div>
                <h3 className="card-title">Change Password</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <PasswordInput
                    value={formData.currentPass || ''}
                    onChange={(e: any) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        currentPass: value,
                      }));
                      validatePasswordField('currentPass', value);
                    }}
                    className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border ${
                      validationErrors.currentPass
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                    placeholder="Enter current password"
                  />
                  {validationErrors.currentPass && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.currentPass}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <PasswordInput
                    value={formData.newPass || ''}
                    onChange={(e: any) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        newPass: value,
                      }));
                      validatePasswordField('newPass', value);
                    }}
                    className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border ${
                      validationErrors.newPass
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                    placeholder="Enter new password"
                  />
                  {validationErrors.newPass && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.newPass}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <PasswordInput
                    value={formData.confirmNewPass || ''}
                    onChange={(e: any) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        confirmNewPass: value,
                      }));
                      validatePasswordField('confirmNewPass', value);
                    }}
                    className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border ${
                      validationErrors.confirmNewPass
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                    placeholder="Confirm new password"
                  />
                  {validationErrors.confirmNewPass && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.confirmNewPass}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? <ButtonLoader /> : 'Change Password'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Two Factor Auth Card */}
            <div className="card card-padding">
              <div className="card-header mb-4">
                <div className="card-icon">
                  <FaShieldAlt />
                </div>
                <h3 className="card-title">2FA</h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="form-label">
                    Two-factor authentication
                  </label>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Email-based option to add an extra layer of protection to
                    your account. When signing in you'll need to enter a code
                    that will be sent to your email address.
                  </p>
                </div>
                <div className="ml-4">
                  <Switch
                    checked={twoFactor}
                    onCheckedChange={setTwoFactor}
                    onClick={handleTwoFactorToggle}
                    title={`${
                      twoFactor ? 'Disable' : 'Enable'
                    } Two-Factor Authentication`}
                  />
                </div>
              </div>
            </div>

            {/* API Keys Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaKey />
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
                        value={
                          apiKey && showApiKey
                            ? (apiKey.key || '')
                            : apiKey
                            ? '••••••••••••••••••••••••••••••••'
                            : 'No API key generated'
                        }
                        className="form-field w-full pr-20 font-mono px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      />

                      {apiKey && (
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                        >
                          {showApiKey ? (
                            <FaEyeSlash className="h-4 w-4" />
                          ) : (
                            <FaEye className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      {apiKey && (
                        <div className="api-key-timestamp">
                          <small>
                            Created:{' '}
                            {new Date(apiKey.createdAt).toLocaleString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="api-key-buttons">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(apiKey)}
                        className="btn btn-secondary flex items-center justify-center gap-2"
                        disabled={!apiKey}
                      >
                        <FaCopy className="h-4 w-4" />
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
                  <FaClock />
                </div>
                <h3 className="card-title">Timezone</h3>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Select Timezone</label>
                  <select
                    value={selectedTimezone || ''}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleTimezoneSave}
                  className="btn btn-primary"
                >
                  Save Timezone
                </button>
              </div>
            </div>

            {/* Change Language Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaGlobe />
                </div>
                <h3 className="card-title">Change Language</h3>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Select Language</label>
                  <select
                    value={selectedLanguage || ''}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleLanguageSave}
                  className="btn btn-primary"
                >
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
