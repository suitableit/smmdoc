'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useAppNameWithFallback, updateGlobalAppName } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    FaCheck,
    FaGlobe,
    FaHeadset,
    FaImage,
    FaPlus,
    FaPuzzlePiece,
    FaSearch,
    FaTicketAlt,
    FaTimes,
    FaTrash,
    FaUpload,
    FaUsers
} from 'react-icons/fa';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Image Skeleton/Wireframe Component
const ImageSkeleton = ({ width, height, className = '' }: { width: number; height: number; className?: string }) => (
  <div 
    className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse rounded flex items-center justify-center`}
    style={{ width: `${width}px`, height: `${height}px` }}
  >
    <FaImage className="text-gray-400 dark:text-gray-500" size={Math.min(width, height) * 0.4} />
  </div>
);

// Keyword Tag Component
const KeywordTag = ({ keyword, onRemove }: { keyword: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full border border-blue-200 dark:border-blue-700">
    {keyword}
    <button
      onClick={onRemove}
      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 transition-colors"
      type="button"
    >
      <FaTimes className="w-3 h-3" />
    </button>
  </span>
);

// Keywords Input Component
const KeywordsInput = ({ 
  keywords, 
  onChange 
}: { 
  keywords: string[]; 
  onChange: (keywords: string[]) => void 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !keywords.includes(trimmedValue)) {
        onChange([...keywords, trimmedValue]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      // Remove last keyword when backspace is pressed on empty input
      onChange(keywords.slice(0, -1));
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    onChange(keywords.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="form-group">
      <label className="form-label">Keywords</label>
      <div className="min-h-[48px] w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-[var(--primary)] dark:focus-within:ring-[var(--secondary)] focus-within:border-transparent shadow-sm transition-all duration-200">
        <div className="flex flex-wrap gap-2 mb-2">
          {keywords.map((keyword, index) => (
            <KeywordTag
              key={index}
              keyword={keyword}
              onRemove={() => removeKeyword(index)}
            />
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder={keywords.length === 0 ? "Enter keywords and press comma or enter" : "Add more keywords..."}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Press comma (,) or Enter to add keywords. Keywords: {keywords.join(', ')}
      </p>
    </div>
  );
};

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

// Custom Switch Component with original UI
const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
      checked ? 'bg-indigo-600' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// Dynamic List Item Component
const DynamicListItem = ({
  item,
  onEdit,
  onDelete,
}: {
  item: { id: number; name: string };
  onEdit: (id: number, name: string) => void;
  onDelete: (id: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(item.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(item.name);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
      {isEditing ? (
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            autoFocus
          />
          </div>
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title="Save"
          >
            <FaCheck className="w-3 h-3" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            title="Cancel"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <span
            className="flex-1 text-sm cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {item.name}
          </span>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

interface GeneralSettings {
  siteTitle: string;
  tagline: string;
  siteIcon: string;
  siteLogo: string;
  siteDarkLogo: string;
  adminEmail: string;
}

interface MetaSettings {
  googleTitle: string;
  siteTitle: string;
  siteDescription: string;
  keywords: string[];
  thumbnail: string;
}

interface UserSettings {
  resetPasswordEnabled: boolean;
  signUpPageEnabled: boolean;
  nameFieldEnabled: boolean;
  emailConfirmationEnabled: boolean;
  resetLinkMax: number;
  transferFundsPercentage: number;
  userFreeBalanceEnabled: boolean;
  freeAmount: number;
  paymentBonusEnabled: boolean;
  bonusPercentage: number;
}

interface TicketSettings {
  ticketSystemEnabled: boolean;
  maxPendingTickets: string;
  subjects: { id: number; name: string }[];
}

interface ContactSettings {
  contactSystemEnabled: boolean;
  maxPendingContacts: string;
  categories: { id: number | null; name: string }[];
}

interface ModuleSettings {
  // Affiliate
  affiliateSystemEnabled: boolean;
  commissionRate: number;
  minimumPayout: number;
  // Child Panel
  childPanelSellingEnabled: boolean;
  childPanelPrice: number;
  // Others
  serviceUpdateLogsEnabled: boolean;
  massOrderEnabled: boolean;
  servicesListPublic: boolean;
}

const GeneralSettingsPage = () => {
  const currentUser = useCurrentUser();

  const { appName } = useAppNameWithFallback();

  // Set document title
  useEffect(() => {
    setPageTitle('General Settings', appName);
  }, [appName]);

  // State management
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Separate loading states for each settings section
  const [loadingStates, setLoadingStates] = useState({
    general: false,
    meta: false,
    user: false,
    ticket: false,
    contact: false,
    module: false,
  });

  // Image loading states
  const [imageLoadingStates, setImageLoadingStates] = useState({
    siteIcon: false,
    siteLogo: false,
    siteDarkLogo: false,
  });

  // Settings state
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteTitle: '',
    tagline: '',
    siteIcon: '',
    siteLogo: '',
    siteDarkLogo: '',
    adminEmail: '',
  });

  const [metaSettings, setMetaSettings] = useState<MetaSettings>({
    googleTitle: '',
    siteTitle: '',
    siteDescription: '',
    keywords: [],
    thumbnail: '',
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    resetPasswordEnabled: true,
    signUpPageEnabled: true,
    nameFieldEnabled: true,
    emailConfirmationEnabled: true,
    resetLinkMax: 3,
    transferFundsPercentage: 3,
    userFreeBalanceEnabled: false,
    freeAmount: 0,
    paymentBonusEnabled: false,
    bonusPercentage: 0,
  });

  const [ticketSettings, setTicketSettings] = useState<TicketSettings>({
    ticketSystemEnabled: true,
    maxPendingTickets: '3',
    subjects: [],
  });

  const [originalTicketSettings, setOriginalTicketSettings] = useState<TicketSettings>({
    ticketSystemEnabled: true,
    maxPendingTickets: '3',
    subjects: [],
  });

  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    contactSystemEnabled: true,
    maxPendingContacts: 'unlimited',
    categories: [
      { id: 1, name: 'General Inquiry' },
      { id: 2, name: 'Business Partnership' },
      { id: 3, name: 'Media & Press' },
    ],
  });

  const [moduleSettings, setModuleSettings] = useState<ModuleSettings>({
    // Affiliate
    affiliateSystemEnabled: false,
    commissionRate: 5,
    minimumPayout: 10,
    // Child Panel
    childPanelSellingEnabled: false,
    childPanelPrice: 10,
    // Others
    serviceUpdateLogsEnabled: true,
    massOrderEnabled: false,
    servicesListPublic: true,
  });

  // New item inputs
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsPageLoading(true);

        // Load all settings in parallel
        const [
          generalResponse,
          metaResponse,
          userResponse,
          ticketResponse,
          contactResponse,
          moduleResponse
        ] = await Promise.all([
          fetch('/api/admin/general-settings'),
          fetch('/api/admin/meta-settings'),
          fetch('/api/admin/user-settings'),
          fetch('/api/admin/ticket-settings'),
          fetch('/api/admin/contact-settings'),
          fetch('/api/admin/module-settings')
        ]);

        // Process general settings
        if (generalResponse.ok) {
          const data = await generalResponse.json();
          if (data.generalSettings) setGeneralSettings(data.generalSettings);
        }

        // Process meta settings
        if (metaResponse.ok) {
          const data = await metaResponse.json();
          if (data.metaSettings) {
            const processedMetaSettings = {
              ...data.metaSettings,
              keywords: data.metaSettings.keywords 
                ? (typeof data.metaSettings.keywords === 'string' 
                    ? data.metaSettings.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
                    : data.metaSettings.keywords)
                : []
            };
            setMetaSettings(processedMetaSettings);
          }
        }

        // Process user settings
        if (userResponse.ok) {
          const data = await userResponse.json();
          if (data.userSettings) setUserSettings(data.userSettings);
        }

        // Process ticket settings
        if (ticketResponse.ok) {
          const data = await ticketResponse.json();
          if (data.ticketSettings) {
            setTicketSettings(data.ticketSettings);
            setOriginalTicketSettings(data.ticketSettings);
          }
        }

        // Process contact settings
        if (contactResponse.ok) {
          const data = await contactResponse.json();
          console.log('🔍 Frontend - Contact settings response:', data);
          if (data.success && data.contactSettings) {
            console.log('🔍 Frontend - Setting contact settings:', data.contactSettings);
            setContactSettings(data.contactSettings);
          } else {
            console.error('🔍 Frontend - Invalid contact settings response:', data);
          }
        } else {
          console.error('🔍 Frontend - Contact settings API failed:', contactResponse.status);
        }

        // Process module settings
        if (moduleResponse.ok) {
          const data = await moduleResponse.json();
          if (data.moduleSettings) setModuleSettings(data.moduleSettings);
        }

        showToast('Settings loaded successfully', 'success');
      } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Error loading settings', 'error');
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
  const saveGeneralSettings = async () => {
    setLoadingStates(prev => ({ ...prev, general: true }));
    try {
      const response = await fetch('/api/admin/general-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generalSettings }),
      });

      if (response.ok) {
        showToast('General settings saved successfully!', 'success');
        // Update the global app name context with the new site title
        updateGlobalAppName(generalSettings.siteTitle);
      } else {
        showToast('Failed to save general settings', 'error');
      }
    } catch (error) {
      console.error('Error saving general settings:', error);
      showToast('Error saving general settings', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, general: false }));
    }
  };

  const saveMetaSettings = async () => {
    setLoadingStates(prev => ({ ...prev, meta: true }));
    try {
      // Convert keywords array to comma-separated string for API
      const metaSettingsForAPI = {
        ...metaSettings,
        keywords: metaSettings.keywords.join(', ')
      };

      const response = await fetch('/api/admin/meta-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaSettings: metaSettingsForAPI }),
      });

      if (response.ok) {
        showToast('Meta (SEO) settings saved successfully!', 'success');
      } else {
        showToast('Failed to save meta settings', 'error');
      }
    } catch (error) {
      console.error('Error saving meta settings:', error);
      showToast('Error saving meta settings', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, meta: false }));
    }
  };

  const saveUserSettings = async () => {
    setLoadingStates(prev => ({ ...prev, user: true }));
    try {
      const response = await fetch('/api/admin/user-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSettings }),
      });

      if (response.ok) {
        showToast('User settings saved successfully!', 'success');
      } else {
        showToast('Failed to save user settings', 'error');
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
      showToast('Error saving user settings', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, user: false }));
    }
  };

  const hasTicketSettingsChanged = () => {
    // Compare basic settings
    if (ticketSettings.ticketSystemEnabled !== originalTicketSettings.ticketSystemEnabled ||
        ticketSettings.maxPendingTickets !== originalTicketSettings.maxPendingTickets) {
      return true;
    }

    // Compare subjects
    if (ticketSettings.subjects.length !== originalTicketSettings.subjects.length) {
      return true;
    }

    // Check if any subject has changed
    for (let i = 0; i < ticketSettings.subjects.length; i++) {
      const current = ticketSettings.subjects[i];
      const original = originalTicketSettings.subjects.find(s => s.id === current.id);
      
      if (!original || current.name !== original.name) {
        return true;
      }
    }

    return false;
  };

  const saveTicketSettings = async () => {
    // Check if there are any changes
    if (!hasTicketSettingsChanged()) {
      showToast('No unsaved changes to save', 'info');
      return;
    }

    setLoadingStates(prev => ({ ...prev, ticket: true }));
    try {
      const response = await fetch('/api/admin/ticket-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketSettings }),
      });

      if (response.ok) {
        showToast('Ticket settings saved successfully!', 'success');
        // Update the original settings to reflect the saved state
        setOriginalTicketSettings(ticketSettings);
      } else {
        showToast('Failed to save ticket settings', 'error');
      }
    } catch (error) {
      console.error('Error saving ticket settings:', error);
      showToast('Error saving ticket settings', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, ticket: false }));
    }
  };

  const saveContactSettings = async () => {
    setLoadingStates(prev => ({ ...prev, contact: true }));
    try {
      console.log('🔍 Frontend - Saving contact settings:', contactSettings);
      const response = await fetch('/api/admin/contact-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactSettings }),
      });

      const responseData = await response.json();
      console.log('🔍 Frontend - Save response:', responseData);

      if (response.ok && responseData.success) {
        showToast('Contact settings saved successfully!', 'success');
      } else {
        showToast('Failed to save contact settings', 'error');
      }
    } catch (error) {
      console.error('Error saving contact settings:', error);
      showToast('Error saving contact settings', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, contact: false }));
    }
  };

  const saveModuleSettings = async () => {
    setLoadingStates(prev => ({ ...prev, module: true }));
    try {
      const response = await fetch('/api/admin/module-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleSettings }),
      });

      if (response.ok) {
        showToast('Module settings saved successfully!', 'success');
      } else {
        showToast('Failed to save module settings', 'error');
      }
    } catch (error) {
      console.error('Error saving module settings:', error);
      showToast('Error saving module settings', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, module: false }));
    }
  };

  // File upload handlers
  // Delete uploaded image
  const handleDeleteImage = async (field: 'siteIcon' | 'siteLogo' | 'siteDarkLogo') => {
    const imageType = field === 'siteIcon' ? 'Site Icon' : field === 'siteLogo' ? 'Site Logo' : 'Site Dark Logo';
    
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete the ${imageType}? This action cannot be undone.`);
    
    if (!confirmed) {
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, general: true }));
      showToast('Removing image...', 'pending');

      // Update local state
      setGeneralSettings(prev => ({ ...prev, [field]: '' }));
      
      // Auto-save to database to persist the change
      const updatedSettings = { ...generalSettings, [field]: '' };
      const saveResponse = await fetch('/api/admin/general-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generalSettings: updatedSettings }),
      });
      
      if (saveResponse.ok) {
        showToast(`${imageType} removed successfully!`, 'success');
      } else {
        showToast(`Failed to remove ${imageType}`, 'error');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      showToast('Error removing image', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, general: false }));
    }
  };

  const handleFileUpload = async (field: 'siteIcon' | 'siteLogo' | 'siteDarkLogo' | 'thumbnail', file: File) => {
    try {
      // Validate PNG format for site icon, site logo, and site dark logo
      if ((field === 'siteIcon' || field === 'siteLogo' || field === 'siteDarkLogo') && file.type !== 'image/png') {
        showToast('Only PNG format is allowed for site icon, site logo, and site dark logo', 'error');
        return;
      }

      setLoadingStates(prev => ({ ...prev, general: true }));
      // Set image loading state for the specific field
      if (field === 'siteIcon' || field === 'siteLogo' || field === 'siteDarkLogo') {
        setImageLoadingStates(prev => ({ ...prev, [field]: true }));
      }
      showToast('Uploading file...', 'pending');

      const formData = new FormData();
      formData.append('file', file);
      
      // Set upload type based on field
      if (field === 'siteIcon' || field === 'siteLogo' || field === 'siteDarkLogo' || field === 'thumbnail') {
        formData.append('type', 'general');
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const fileUrl = data.fileUrl;

        if (field === 'thumbnail') {
          setMetaSettings(prev => ({ ...prev, [field]: fileUrl }));
          showToast('Thumbnail uploaded successfully!', 'success');
        } else {
          // Update local state
          setGeneralSettings(prev => ({ ...prev, [field]: fileUrl }));
          
          // Auto-save to database to persist the change
          try {
            const updatedSettings = { ...generalSettings, [field]: fileUrl };
            const saveResponse = await fetch('/api/admin/general-settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ generalSettings: updatedSettings }),
            });
            
            if (saveResponse.ok) {
              const fieldName = field === 'siteIcon' ? 'Site Icon' : field === 'siteLogo' ? 'Site Logo' : 'Site Dark Logo';
              showToast(`${fieldName} uploaded and saved successfully!`, 'success');
            } else {
              const fieldName = field === 'siteIcon' ? 'Site Icon' : field === 'siteLogo' ? 'Site Logo' : 'Site Dark Logo';
              showToast(`${fieldName} uploaded but failed to save to database`, 'error');
            }
          } catch (saveError) {
            console.error('Error auto-saving general settings:', saveError);
            const fieldName = field === 'siteIcon' ? 'Site Icon' : field === 'siteLogo' ? 'Site Logo' : 'Site Dark Logo';
            showToast(`${fieldName} uploaded but failed to save to database`, 'error');
          }
        }
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to upload file', 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Error uploading file', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, general: false }));
    }
  };

  // Dynamic list handlers
  const addSubject = () => {
    if (newSubject.trim()) {
      const newId = Math.max(...ticketSettings.subjects.map(s => s.id), 0) + 1;
      setTicketSettings(prev => ({
        ...prev,
        subjects: [...prev.subjects, { id: newId, name: newSubject.trim() }]
      }));
      setNewSubject('');
    }
  };

  const editSubject = (id: number, name: string) => {
    setTicketSettings(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, name } : s)
    }));
  };

  const deleteSubject = (id: number) => {
    setTicketSettings(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id)
    }));
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      // Use null for new categories - backend will assign proper ID
      setContactSettings(prev => ({
        ...prev,
        categories: [...prev.categories, { id: null, name: newCategory.trim() }]
      }));
      setNewCategory('');
    }
  };

  const editCategory = (id: number, name: string) => {
    setContactSettings(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, name } : c)
    }));
  };

  const deleteCategory = (id: number) => {
    setContactSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id)
    }));
  };

  // Show loading state
  if (isPageLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loading cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card card-padding">
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">Loading settings...</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: 'unlimited', label: 'Unlimited' },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* General Settings Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaGlobe />
                </div>
                <h3 className="card-title">General Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Site Title</label>
                  <input
                    type="text"
                    value={generalSettings.siteTitle}
                    onChange={(e) =>
                      setGeneralSettings(prev => ({ ...prev, siteTitle: e.target.value }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Enter site title"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tagline</label>
                  <input
                    type="text"
                    value={generalSettings.tagline}
                    onChange={(e) =>
                      setGeneralSettings(prev => ({ ...prev, tagline: e.target.value }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Enter site tagline"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Site Icon</label>
                  <div className="flex items-center gap-3">
                    {isPageLoading || imageLoadingStates.siteIcon ? (
                      <ImageSkeleton width={32} height={32} className="rounded" />
                    ) : generalSettings.siteIcon ? (
                      <div className="relative group">
                        <Image
                          src={generalSettings.siteIcon}
                          alt="Site Icon"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded object-cover"
                          onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, siteIcon: true }))}
                          onLoad={() => setImageLoadingStates(prev => ({ ...prev, siteIcon: false }))}
                          onError={() => setImageLoadingStates(prev => ({ ...prev, siteIcon: false }))}
                        />
                        <button
                          onClick={() => handleDeleteImage('siteIcon')}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Remove Site Icon"
                        >
                          <FaTimes className="w-2 h-2" />
                        </button>
                      </div>
                    ) : null}
                    <label className="btn btn-secondary cursor-pointer">
                      <FaUpload className="w-4 h-4 mr-2" />
                      Upload Icon
                      <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('siteIcon', file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Site Logo Column */}
                    <div>
                      <label className="form-label text-sm mb-2 block">Site Logo</label>
                      <div className="flex items-center gap-3">
                        {isPageLoading || imageLoadingStates.siteLogo ? (
                          <ImageSkeleton width={128} height={32} className="rounded" />
                        ) : generalSettings.siteLogo ? (
                          <div className="relative group">
                            <Image
                              src={generalSettings.siteLogo}
                              alt="Site Logo"
                              width={128}
                              height={32}
                              className="h-8 max-w-32 object-contain"
                              onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, siteLogo: true }))}
                              onLoad={() => setImageLoadingStates(prev => ({ ...prev, siteLogo: false }))}
                              onError={() => setImageLoadingStates(prev => ({ ...prev, siteLogo: false }))}
                            />
                            <button
                              onClick={() => handleDeleteImage('siteLogo')}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              title="Remove Site Logo"
                            >
                              <FaTimes className="w-2 h-2" />
                            </button>
                          </div>
                        ) : null}
                        <label className="btn btn-secondary cursor-pointer">
                          <FaUpload className="w-4 h-4 mr-2" />
                          Upload Logo
                          <input
                            type="file"
                            accept="image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('siteLogo', file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Site Dark Logo Column */}
                    <div>
                      <label className="form-label text-sm mb-2 block">Site Dark Logo</label>
                      <div className="flex items-center gap-3">
                        {isPageLoading || imageLoadingStates.siteDarkLogo ? (
                          <ImageSkeleton width={128} height={32} className="rounded" />
                        ) : generalSettings.siteDarkLogo ? (
                          <div className="relative group">
                            <Image
                              src={generalSettings.siteDarkLogo}
                              alt="Site Dark Logo"
                              width={128}
                              height={32}
                              className="h-8 max-w-32 object-contain"
                              onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, siteDarkLogo: true }))}
                              onLoad={() => setImageLoadingStates(prev => ({ ...prev, siteDarkLogo: false }))}
                              onError={() => setImageLoadingStates(prev => ({ ...prev, siteDarkLogo: false }))}
                            />
                            <button
                              onClick={() => handleDeleteImage('siteDarkLogo')}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              title="Remove Site Dark Logo"
                            >
                              <FaTimes className="w-2 h-2" />
                            </button>
                          </div>
                        ) : null}
                        <label className="btn btn-secondary cursor-pointer">
                          <FaUpload className="w-4 h-4 mr-2" />
                          Upload Dark Logo
                          <input
                            type="file"
                            accept="image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('siteDarkLogo', file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Administration Email Address</label>
                  <input
                    type="email"
                    value={generalSettings.adminEmail}
                    onChange={(e) =>
                      setGeneralSettings(prev => ({ ...prev, adminEmail: e.target.value }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="admin@example.com"
                  />
                </div>

                <button
                  onClick={saveGeneralSettings}
                  disabled={loadingStates.general}
                  className="btn btn-primary w-full"
                >
                  {loadingStates.general ? 'Updating...' : 'Save General Settings'}
                </button>
              </div>
            </div>

            {/* Meta (SEO) Settings Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaSearch />
                </div>
                <h3 className="card-title">Meta (SEO) Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Title you want the site to appear on Google</label>
                  <input
                    type="text"
                    value={metaSettings.googleTitle}
                    onChange={(e) =>
                      setMetaSettings(prev => ({ ...prev, googleTitle: e.target.value }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Enter Google search title"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Site Title</label>
                  <input
                    type="text"
                    value={metaSettings.siteTitle}
                    onChange={(e) =>
                      setMetaSettings(prev => ({ ...prev, siteTitle: e.target.value }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Enter meta site title"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Site Description 
                    <span className="text-sm text-gray-500 ml-2">
                      ({metaSettings.siteDescription.length}/160 characters)
                    </span>
                  </label>
                  <textarea
                    value={metaSettings.siteDescription}
                    onChange={(e) => {
                      if (e.target.value.length <= 160) {
                        setMetaSettings(prev => ({ ...prev, siteDescription: e.target.value }));
                      }
                    }}
                    maxLength={160}
                    rows={3}
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none"
                    placeholder="Enter site description for search engines (max 160 characters)"
                  />
                </div>

                <KeywordsInput
                  keywords={metaSettings.keywords}
                  onChange={(keywords) => setMetaSettings(prev => ({ ...prev, keywords }))}
                />

                <div className="form-group">
                  <label className="form-label">Thumbnail (1200x630px)</label>
                  <div className="flex items-center gap-3">
                    {metaSettings.thumbnail ? (
                      <div className="relative group">
                        <Image
                          src={metaSettings.thumbnail}
                          alt="SEO Thumbnail"
                          width={80}
                          height={40}
                          className="w-20 h-10 rounded object-cover border"
                        />
                        <button
                          onClick={() => {
                            setMetaSettings(prev => ({ ...prev, thumbnail: '' }));
                            showToast('Thumbnail removed successfully!', 'success');
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Remove Thumbnail"
                        >
                          <FaTimes className="w-2 h-2" />
                        </button>
                      </div>
                    ) : null}
                    <label className="btn btn-secondary cursor-pointer">
                      <FaImage className="w-4 h-4 mr-2" />
                      Upload Thumbnail
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('thumbnail', file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended size: 1200x630px for optimal social media sharing
                  </p>
                </div>

                <button
                  onClick={saveMetaSettings}
                  disabled={loadingStates.meta}
                  className="btn btn-primary w-full"
                >
                  {loadingStates.meta ? 'Updating...' : 'Save Meta (SEO) Settings'}
                </button>
              </div>
            </div>

            {/* User Settings Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaUsers />
                </div>
                <h3 className="card-title">User Settings</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">Reset Password</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow users to reset their passwords via email
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.resetPasswordEnabled}
                    onCheckedChange={(checked) =>
                      setUserSettings(prev => ({
                        ...prev,
                        resetPasswordEnabled: checked
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">Sign Up Page</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable user registration
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.signUpPageEnabled}
                    onCheckedChange={(checked) =>
                      setUserSettings(prev => ({
                        ...prev,
                        signUpPageEnabled: checked
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">Name Field</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Require name field during registration
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.nameFieldEnabled}
                    onCheckedChange={(checked) =>
                      setUserSettings(prev => ({
                        ...prev,
                        nameFieldEnabled: checked
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">Email Confirmation</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Require email verification after registration
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.emailConfirmationEnabled}
                    onCheckedChange={(checked) =>
                      setUserSettings(prev => ({
                        ...prev,
                        emailConfirmationEnabled: checked
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reset Link Max</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={userSettings.resetLinkMax}
                    onChange={(e) =>
                      setUserSettings(prev => ({
                        ...prev,
                        resetLinkMax: parseInt(e.target.value) || 3
                      }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transfer Funds Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={userSettings.transferFundsPercentage}
                    onChange={(e) =>
                      setUserSettings(prev => ({
                        ...prev,
                        transferFundsPercentage: parseFloat(e.target.value) || 3
                      }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">User Free Balance</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable or disable free balance for new users
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.userFreeBalanceEnabled}
                    onCheckedChange={(checked) =>
                      setUserSettings(prev => ({
                        ...prev,
                        userFreeBalanceEnabled: checked
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Free Amount (in USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={userSettings.freeAmount}
                    onChange={(e) =>
                      setUserSettings(prev => ({
                        ...prev,
                        freeAmount: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">Payment Bonus</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get a bonus when the user add funds using payment gateway
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.paymentBonusEnabled}
                    onCheckedChange={(checked) =>
                      setUserSettings(prev => ({
                        ...prev,
                        paymentBonusEnabled: checked
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bonus Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={userSettings.bonusPercentage}
                    onChange={(e) =>
                      setUserSettings(prev => ({
                        ...prev,
                        bonusPercentage: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <button
                  onClick={saveUserSettings}
                  disabled={loadingStates.user}
                  className="btn btn-primary w-full"
                >
                  {loadingStates.user ? 'Updating...' : 'Save User Settings'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Ticket Settings Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaTicketAlt />
                </div>
                <h3 className="card-title">Ticket Settings</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">Ticket System</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable or disable the support ticket system
                    </p>
                  </div>
                  <Switch
                    checked={ticketSettings.ticketSystemEnabled}
                    onCheckedChange={(checked) =>
                      setTicketSettings(prev => ({
                        ...prev,
                        ticketSystemEnabled: checked
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Pending Tickets per User</label>
                  <select
                    value={ticketSettings.maxPendingTickets}
                    onChange={(e) =>
                      setTicketSettings(prev => ({
                        ...prev,
                        maxPendingTickets: e.target.value
                      }))
                    }
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {maxOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subjects</label>
                  <div className="space-y-2">
                    {ticketSettings.subjects.map((subject) => (
                      <DynamicListItem
                        key={subject.id}
                        item={subject}
                        onEdit={editSubject}
                        onDelete={deleteSubject}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                      placeholder="Add new subject"
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    </div>
                    <button
                      onClick={addSubject}
                      className="btn btn-secondary btn-sm"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={saveTicketSettings}
                  disabled={loadingStates.ticket}
                  className="btn btn-primary w-full"
                >
                  {loadingStates.ticket ? 'Updating...' : 'Save Ticket Settings'}
                </button>
              </div>
            </div>

            {/* Contact Settings Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaHeadset />
                </div>
                <h3 className="card-title">Contact Settings</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-1">Contact System</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable or disable the contact form system
                    </p>
                  </div>
                  <Switch
                    checked={contactSettings.contactSystemEnabled}
                    onCheckedChange={(checked) =>
                      setContactSettings(prev => ({
                        ...prev,
                        contactSystemEnabled: checked
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Pending Contacts per User</label>
                  <select
                    value={contactSettings.maxPendingContacts}
                    onChange={(e) =>
                      setContactSettings(prev => ({
                        ...prev,
                        maxPendingContacts: e.target.value
                      }))
                    }
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {maxOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Categories</label>
                  <div className="space-y-2">
                    {contactSettings.categories.map((category) => (
                      <DynamicListItem
                        key={category.id}
                        item={{ id: category.id || 0, name: category.name }}
                        onEdit={editCategory}
                        onDelete={deleteCategory}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                      placeholder="Add new category"
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    </div>
                    <button
                      onClick={addCategory}
                      className="btn btn-secondary btn-sm"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={saveContactSettings}
                  disabled={loadingStates.contact}
                  className="btn btn-primary w-full"
                >
                  {loadingStates.contact ? 'Updating...' : 'Save Contact Settings'}
                </button>
              </div>
            </div>

            {/* Module Settings Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaPuzzlePiece />
                </div>
                <h3 className="card-title">Module</h3>
              </div>

              <div className="space-y-6">
                {/* Affiliate Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                    Affiliate
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="form-label mb-1">Affiliate System</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable or disable the affiliate system
                      </p>
                    </div>
                    <Switch
                      checked={moduleSettings.affiliateSystemEnabled}
                      onCheckedChange={(checked) =>
                        setModuleSettings(prev => ({
                          ...prev,
                          affiliateSystemEnabled: checked
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Commission rate, %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={moduleSettings.commissionRate}
                      onChange={(e) =>
                        setModuleSettings(prev => ({
                          ...prev,
                          commissionRate: parseFloat(e.target.value) || 0
                        }))
                      }
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Minimum payout (in USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={moduleSettings.minimumPayout}
                      onChange={(e) =>
                        setModuleSettings(prev => ({
                          ...prev,
                          minimumPayout: parseFloat(e.target.value) || 0
                        }))
                      }
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Child Panel Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                    Child Panel
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="form-label mb-1">Child Panel Selling</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable or disable child panel selling
                      </p>
                    </div>
                    <Switch
                      checked={moduleSettings.childPanelSellingEnabled}
                      onCheckedChange={(checked) =>
                        setModuleSettings(prev => ({
                          ...prev,
                          childPanelSellingEnabled: checked
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Child Panel Price (Monthly in USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={moduleSettings.childPanelPrice}
                      onChange={(e) =>
                        setModuleSettings(prev => ({
                          ...prev,
                          childPanelPrice: parseFloat(e.target.value) || 10
                        }))
                      }
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Others Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                    Others
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="form-label mb-1">Service Update Logs</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable or disable service update logs
                      </p>
                    </div>
                    <Switch
                      checked={moduleSettings.serviceUpdateLogsEnabled}
                      onCheckedChange={(checked) =>
                        setModuleSettings(prev => ({
                          ...prev,
                          serviceUpdateLogsEnabled: checked
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="form-label mb-1">Mass Order</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable or disable mass order functionality
                      </p>
                    </div>
                    <Switch
                      checked={moduleSettings.massOrderEnabled}
                      onCheckedChange={(checked) =>
                        setModuleSettings(prev => ({
                          ...prev,
                          massOrderEnabled: checked
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="form-label mb-1">Services List</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Make services list public or private for logged-in users
                      </p>
                    </div>
                    <Switch
                      checked={moduleSettings.servicesListPublic}
                      onCheckedChange={(checked) =>
                        setModuleSettings(prev => ({
                          ...prev,
                          servicesListPublic: checked
                        }))
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={saveModuleSettings}
                  disabled={loadingStates.module}
                  className="btn btn-primary w-full"
                >
                  {loadingStates.module ? 'Updating...' : 'Save Module Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;