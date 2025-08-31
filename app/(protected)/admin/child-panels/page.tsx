'use client';

import React, { useEffect, useState } from 'react';
import {
    FaCheckCircle,
    FaClock,
    FaCog,
    FaEllipsisH,
    FaEye,
    FaGlobe,
    FaSearch,
    FaServer,
    FaSync,
    FaTimes,
    FaTimesCircle,
    FaUserCheck
} from 'react-icons/fa';

// Import APP_NAME constant
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatID, formatNumber, formatPrice } from '@/lib/utils';

// Custom Form Components
const FormField = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-2">{children}</div>
);

const FormItem = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
);

const FormLabel = ({ 
  className = "", 
  style, 
  children 
}: { 
  className?: string; 
  style?: React.CSSProperties; 
  children: React.ReactNode 
}) => (
  <label className={`block text-sm font-medium ${className}`} style={style}>
    {children}
  </label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const FormMessage = ({ 
  className = "", 
  children 
}: { 
  className?: string; 
  children?: React.ReactNode 
}) => (
  children ? <div className={`text-xs text-red-500 mt-1 ${className}`}>{children}</div> : null
);

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Toast Component
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
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

// Define interfaces for type safety
interface ChildPanel {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    joinedAt: string;
  };
  domain: string;
  subdomain?: string;
  panelName: string;
  apiKey: string;
  totalOrders: number;
  totalRevenue: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'expired';
  createdAt: string;
  lastActivity: string;
  expiryDate?: string;
  theme: string;
  customBranding: boolean;
  apiCallsToday: number;
  apiCallsTotal: number;
  plan: string;
}

interface ChildPanelStats {
  totalPanels: number;
  activePanels: number;
  inactivePanels: number;
  suspendedPanels: number;
  pendingPanels: number;
  expiredPanels: number;
  totalRevenue: number;
  totalOrders: number;
  totalApiCalls: number;
  todayApiCalls: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Dummy data for SMM Panel child panels
const dummyChildPanels: ChildPanel[] = [
  {
    id: 3001,
    user: {
      id: 4001,
      username: 'panel_master',
      email: 'panelmaster@gmail.com',
      name: 'John Smith',
      joinedAt: '2024-01-10T09:00:00Z',
    },
    domain: 'socialmedia-boost.com',
    panelName: 'SocialMedia Boost',
    apiKey: 'abc123def456',
    totalOrders: 1250,
    totalRevenue: 8750.50,
    status: 'active',
    createdAt: '2024-01-10T09:00:00Z',
    lastActivity: '2025-07-02T14:30:00Z',
    expiryDate: '2025-01-10T09:00:00Z',
    theme: 'Dark Blue',
    customBranding: true,
    apiCallsToday: 145,
    apiCallsTotal: 15420,
    plan: 'Premium'
  },
  {
    id: 3002,
    user: {
      id: 4002,
      username: 'smm_reseller',
      email: 'smmreseller@outlook.com',
      name: 'Maria Garcia',
      joinedAt: '2024-02-15T11:20:00Z',
    },
    domain: 'fastgrowth.panel.mysmm.com',
    subdomain: 'fastgrowth',
    panelName: 'Fast Growth SMM',
    apiKey: 'xyz789uvw012',
    totalOrders: 890,
    totalRevenue: 4250.75,
    status: 'active',
    createdAt: '2024-02-15T11:20:00Z',
    lastActivity: '2025-07-01T18:45:00Z',
    expiryDate: '2025-02-15T11:20:00Z',
    theme: 'Green',
    customBranding: false,
    apiCallsToday: 89,
    apiCallsTotal: 8950,
    plan: 'Standard'
  },
  {
    id: 3003,
    user: {
      id: 4003,
      username: 'viral_solutions',
      email: 'viralsolutions@yahoo.com',
      name: 'Ahmed Hassan',
      joinedAt: '2024-03-05T14:00:00Z',
    },
    domain: 'viral-smm-solutions.net',
    panelName: 'Viral SMM Solutions',
    apiKey: 'pqr345stu678',
    totalOrders: 2150,
    totalRevenue: 12840.25,
    status: 'active',
    createdAt: '2024-03-05T14:00:00Z',
    lastActivity: '2025-07-02T12:15:00Z',
    expiryDate: '2025-03-05T14:00:00Z',
    theme: 'Purple',
    customBranding: true,
    apiCallsToday: 234,
    apiCallsTotal: 28750,
    plan: 'Enterprise'
  },
  {
    id: 3004,
    user: {
      id: 4004,
      username: 'social_hub',
      email: 'socialhub@gmail.com',
      name: 'Lisa Chen',
      joinedAt: '2024-04-20T16:30:00Z',
    },
    domain: 'socialhub.panel.mysmm.com',
    subdomain: 'socialhub',
    panelName: 'Social Hub',
    apiKey: 'mno901klm234',
    totalOrders: 456,
    totalRevenue: 2180.60,
    status: 'inactive',
    createdAt: '2024-04-20T16:30:00Z',
    lastActivity: '2025-06-10T09:20:00Z',
    expiryDate: '2025-04-20T16:30:00Z',
    theme: 'Blue',
    customBranding: false,
    apiCallsToday: 0,
    apiCallsTotal: 4560,
    plan: 'Basic'
  },
  {
    id: 3005,
    user: {
      id: 4005,
      username: 'insta_pro_panel',
      email: 'instapro@protonmail.com',
      name: 'David Rodriguez',
      joinedAt: '2024-05-12T10:45:00Z',
    },
    domain: 'insta-pro-services.com',
    panelName: 'Instagram Pro Services',
    apiKey: 'hij567ghi890',
    totalOrders: 1680,
    totalRevenue: 9420.80,
    status: 'suspended',
    createdAt: '2024-05-12T10:45:00Z',
    lastActivity: '2025-06-25T15:30:00Z',
    expiryDate: '2025-05-12T10:45:00Z',
    theme: 'Pink',
    customBranding: true,
    apiCallsToday: 0,
    apiCallsTotal: 16800,
    plan: 'Premium'
  },
  {
    id: 3006,
    user: {
      id: 4006,
      username: 'tiktok_growth',
      email: 'tiktokgrowth@icloud.com',
      name: 'Sarah Williams',
      joinedAt: '2024-06-08T13:15:00Z',
    },
    domain: 'tiktokgrowth.panel.mysmm.com',
    subdomain: 'tiktokgrowth',
    panelName: 'TikTok Growth Hub',
    apiKey: 'def123abc456',
    totalOrders: 320,
    totalRevenue: 1560.40,
    status: 'pending',
    createdAt: '2024-06-08T13:15:00Z',
    lastActivity: '2025-06-28T11:00:00Z',
    expiryDate: '2025-06-08T13:15:00Z',
    theme: 'Red',
    customBranding: false,
    apiCallsToday: 25,
    apiCallsTotal: 3200,
    plan: 'Standard'
  },
  {
    id: 3007,
    user: {
      id: 4007,
      username: 'youtube_boost',
      email: 'youtubeboost@hotmail.com',
      name: 'Michael Brown',
      joinedAt: '2023-12-20T08:30:00Z',
    },
    domain: 'yt-boost-services.org',
    panelName: 'YouTube Boost Services',
    apiKey: 'tuv901wxy234',
    totalOrders: 2890,
    totalRevenue: 18650.90,
    status: 'expired',
    createdAt: '2023-12-20T08:30:00Z',
    lastActivity: '2024-12-25T10:15:00Z',
    expiryDate: '2024-12-20T08:30:00Z',
    theme: 'Orange',
    customBranding: true,
    apiCallsToday: 0,
    apiCallsTotal: 28900,
    plan: 'Enterprise'
  },
  {
    id: 3008,
    user: {
      id: 4008,
      username: 'social_express',
      email: 'socialexpress@gmail.com',
      name: 'Jennifer Taylor',
      joinedAt: '2024-06-25T15:20:00Z',
    },
    domain: 'social-express.panel.mysmm.com',
    subdomain: 'social-express',
    panelName: 'Social Express',
    apiKey: 'qrs567tuv890',
    totalOrders: 125,
    totalRevenue: 680.25,
    status: 'active',
    createdAt: '2024-06-25T15:20:00Z',
    lastActivity: '2025-07-02T16:45:00Z',
    expiryDate: '2025-06-25T15:20:00Z',
    theme: 'Teal',
    customBranding: false,
    apiCallsToday: 15,
    apiCallsTotal: 1250,
    plan: 'Basic'
  }
];

const dummyStats: ChildPanelStats = {
  totalPanels: 8,
  activePanels: 4,
  inactivePanels: 1,
  suspendedPanels: 1,
  pendingPanels: 1,
  expiredPanels: 1,
  totalRevenue: 58339.45,
  totalOrders: 9761,
  totalApiCalls: 107830,
  todayApiCalls: 508,
};

const ChildPanelsPage = () => {
  const { appName } = useAppNameWithFallback();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Child Panels', appName);
  }, [appName]);

  // State management
  const [childPanels, setChildPanels] = useState<ChildPanel[]>(dummyChildPanels);
  const [stats, setStats] = useState<ChildPanelStats>(dummyStats);

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 8,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(false);
  const [panelsLoading, setPanelsLoading] = useState(false);

  // New state for action modals
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    panelId: number;
    currentStatus: string;
  }>({
    open: false,
    panelId: 0,
    currentStatus: '',
  });
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    panel: ChildPanel | null;
  }>({
    open: false,
    panel: null,
  });

  const [selectedBulkAction, setSelectedBulkAction] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Panel Settings modal state
  const [settingsDialog, setSettingsDialog] = useState<{
    open: boolean;
    panel: ChildPanel | null;
  }>({
    open: false,
    panel: null,
  });
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [settingsData, setSettingsData] = useState({
    panelName: '',
    theme: '',
    customBranding: false,
    language: 'en',
    apiRateLimit: 1000,
    sslEnabled: true,
    customLogo: '',
    maxUsers: 1000,
    featuresEnabled: {
      bulkOrders: true,
      apiAccess: true,
      customDomain: true,
      analytics: true,
      userManagement: true,
      ticketSystem: true,
      massOrders: true,
      drip_feed: true,
    },
  });

  // Calculate status counts from current panels data
  const calculateStatusCounts = (panelsData: ChildPanel[]) => {
    const counts = {
      active: 0,
      inactive: 0,
      suspended: 0,
      pending: 0,
      expired: 0,
    };

    panelsData.forEach((panel) => {
      if (panel.status && counts.hasOwnProperty(panel.status)) {
        counts[panel.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  // Fetch all panels to calculate real status counts
  const fetchAllPanelsForCounts = async () => {
    try {
      console.log('Calculating status counts from dummy data...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const statusCounts = calculateStatusCounts(dummyChildPanels);

      console.log('Calculated status counts:', statusCounts);

      setStats((prev) => ({
        ...prev,
        activePanels: statusCounts.active,
        inactivePanels: statusCounts.inactive,
        suspendedPanels: statusCounts.suspended,
        pendingPanels: statusCounts.pending,
        expiredPanels: statusCounts.expired,
        totalPanels: dummyChildPanels.length,
      }));
    } catch (error) {
      console.error('Error calculating panel counts:', error);
    }
  };

  const fetchChildPanels = async () => {
    try {
      setPanelsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter dummy data based on current filters
      let filteredPanels = [...dummyChildPanels];

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredPanels = filteredPanels.filter(
          panel => panel.status === statusFilter
        );
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredPanels = filteredPanels.filter(
          panel =>
            panel.user.username?.toLowerCase().includes(searchLower) ||
            panel.user.email?.toLowerCase().includes(searchLower) ||
            panel.domain?.toLowerCase().includes(searchLower) ||
            panel.panelName?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedPanels = filteredPanels.slice(startIndex, endIndex);

      console.log('Child panels fetched successfully with filters applied');

      setChildPanels(paginatedPanels);
      setPagination(prev => ({
        ...prev,
        total: filteredPanels.length,
        totalPages: Math.ceil(filteredPanels.length / pagination.limit),
        hasNext: endIndex < filteredPanels.length,
        hasPrev: pagination.page > 1,
      }));
    } catch (error) {
      console.error('Error fetching child panels:', error);
      showToast('Error fetching child panels. Please try again.', 'error');
      setChildPanels([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setPanelsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Loading stats from dummy data...');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('Stats loaded successfully:', dummyStats);

      setStats(dummyStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalPanels: 0,
        activePanels: 0,
        inactivePanels: 0,
        suspendedPanels: 0,
        pendingPanels: 0,
        expiredPanels: 0,
        totalRevenue: 0,
        totalOrders: 0,
        totalApiCalls: 0,
        todayApiCalls: 0,
      });
      showToast('Error fetching statistics. Please refresh the page.', 'error');
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChildPanels();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchChildPanels();
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    setStatsLoading(true);

    const loadData = async () => {
      await Promise.all([fetchStats(), fetchAllPanelsForCounts()]);
      setStatsLoading(false);
    };

    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen !== null) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setDropdownOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Update stats when pagination data changes
  useEffect(() => {
    if (pagination.total > 0) {
      setStats((prev) => ({
        ...prev,
        totalPanels: pagination.total,
      }));
    }
  }, [pagination.total]);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'inactive':
        return <FaClock className="h-3 w-3 text-gray-500" />;
      case 'suspended':
        return <FaTimesCircle className="h-3 w-3 text-red-500" />;
      case 'pending':
        return <FaClock className="h-3 w-3 text-yellow-500" />;
      case 'expired':
        return <FaTimesCircle className="h-3 w-3 text-orange-500" />;
      default:
        return <FaClock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSelectAll = () => {
    const selectablePanels = childPanels.filter(
      (panel) => panel.status !== 'suspended'
    );

    const selectableIds = selectablePanels.map((panel) => 
      panel.id.toString()
    );

    if (
      selectedPanels.length === selectableIds.length &&
      selectableIds.length > 0
    ) {
      setSelectedPanels([]);
    } else {
      setSelectedPanels(selectableIds);
    }
  };

  const handleSelectPanel = (panelId: string) => {
    setSelectedPanels((prev) =>
      prev.includes(panelId)
        ? prev.filter((id) => id !== panelId)
        : [...prev, panelId]
    );
  };

  const handleRefresh = async () => {
    setPanelsLoading(true);
    setStatsLoading(true);

    try {
      await Promise.all([
        fetchChildPanels(),
        fetchStats(),
        fetchAllPanelsForCounts(),
      ]);
      showToast('Child panels data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showToast('Error refreshing data. Please try again.', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (
    panelId: number,
    status: string,
    reason: string
  ) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast('Panel status updated successfully', 'success');
      await Promise.all([
        fetchChildPanels(),
        fetchStats(),
        fetchAllPanelsForCounts(),
      ]);
      setStatusDialog({ open: false, panelId: 0, currentStatus: '' });
      setNewStatus('');
      setStatusReason('');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast(
        error instanceof Error ? error.message : 'Error updating status',
        'error'
      );
    }
  };

  // Open status dialog
  const openStatusDialog = (panelId: number, currentStatus: string) => {
    setStatusDialog({ open: true, panelId, currentStatus });
    setNewStatus(currentStatus);
    setStatusReason('');
  };

  // Open settings dialog
  const openSettingsDialog = (panel: ChildPanel) => {
    setSettingsDialog({ open: true, panel });
    setActiveSettingsTab('general');
    // Populate current settings
    setSettingsData({
      panelName: panel.panelName,
      theme: panel.theme,
      customBranding: panel.customBranding,
      language: 'en',
      apiRateLimit: 1000,
      sslEnabled: true,
      customLogo: '',
      maxUsers: 1000,
      featuresEnabled: {
        bulkOrders: true,
        apiAccess: true,
        customDomain: true,
        analytics: true,
        userManagement: true,
        ticketSystem: true,
        massOrders: true,
        drip_feed: true,
      },
    });
  };

  // Handle settings save
  const handleSaveSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast('Panel settings updated successfully', 'success');
      await Promise.all([
        fetchChildPanels(),
        fetchStats(),
        fetchAllPanelsForCounts(),
      ]);
      setSettingsDialog({ open: false, panel: null });
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast(
        error instanceof Error ? error.message : 'Error updating settings',
        'error'
      );
    }
  };

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
        {/* Controls Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Left: Action Buttons */}
            <div className="flex items-center gap-2">
              <select
                value={pagination.limit}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    limit:
                      e.target.value === 'all'
                        ? 1000
                        : parseInt(e.target.value),
                    page: 1,
                  }))
                }
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={panelsLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync
                  className={
                    panelsLoading || statsLoading ? 'animate-spin' : ''
                  }
                />
                Refresh
              </button>
            </div>

            {/* Right: Search Controls */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${
                    statusFilter === 'all' ? 'all' : statusFilter
                  } panels...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="domain">Domain</option>
              </select>
            </div>
          </div>
        </div>

        {/* Child Panels Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {/* Filter Buttons */}
            <div className="mb-4">
              <div className="block space-y-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'all'
                      ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'all'
                        ? 'bg-white/20'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {stats.totalPanels}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'active'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Active
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'active'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {stats.activePanels}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'inactive'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Inactive
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'inactive'
                        ? 'bg-white/20'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {stats.inactivePanels}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('suspended')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'suspended'
                      ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Suspended
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'suspended'
                        ? 'bg-white/20'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stats.suspendedPanels}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'pending'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pending
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'pending'
                        ? 'bg-white/20'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {stats.pendingPanels}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('expired')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'expired'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Expired
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'expired'
                        ? 'bg-white/20'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {stats.expiredPanels}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {/* Bulk Action Section */}
            {selectedPanels.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4 pt-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {selectedPanels.length} selected
                </span>
                <select
                  className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
                  value={selectedBulkAction}
                  onChange={(e) => {
                    setSelectedBulkAction(e.target.value);
                  }}
                >
                  <option value="" disabled>
                    Bulk Actions
                  </option>
                  <option value="activate">Activate Selected</option>
                  <option value="deactivate">Deactivate Selected</option>
                  <option value="suspend">Suspend Selected</option>
                </select>

                {selectedBulkAction && (
                  <div className="w-full flex justify-center md:w-auto md:block">
                    <button
                      onClick={() => {
                        if (selectedBulkAction === 'activate') {
                          console.log('Bulk activate selected:', selectedPanels);
                          showToast(
                            `Activating ${selectedPanels.length} selected panels...`,
                            'info'
                          );
                        } else if (selectedBulkAction === 'deactivate') {
                          console.log('Bulk deactivate selected:', selectedPanels);
                          showToast(
                            `Deactivating ${selectedPanels.length} selected panels...`,
                            'info'
                          );
                        } else if (selectedBulkAction === 'suspend') {
                          console.log('Bulk suspend selected:', selectedPanels);
                          showToast(
                            `Suspending ${selectedPanels.length} selected panels...`,
                            'info'
                          );
                        }
                        // Reset after action
                        setSelectedBulkAction('');
                        setSelectedPanels([]);
                      }}
                      className="btn btn-primary w-full px-3 py-2.5"
                    >
                      Apply Action
                    </button>
                  </div>
                )}
              </div>
            )}

            {panelsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading child panels...
                  </div>
                </div>
              </div>
            ) : childPanels.length === 0 ? (
              <div className="text-center py-12">
                <FaServer
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No child panels found.
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No child panels match your current filters or no panels
                  exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[1000px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedPanels.length === childPanels.length &&
                              childPanels.length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          ID
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          User
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Domain
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Created
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Status
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {childPanels.map((panel, index) => (
                        <tr
                          key={panel.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            {panel.status !== 'suspended' && (
                              <input
                                type="checkbox"
                                checked={selectedPanels.includes(
                                  panel.id.toString()
                                )}
                                onChange={() =>
                                  handleSelectPanel(panel.id.toString())
                                }
                                className="rounded border-gray-300 w-4 h-4"
                              />
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                              {(pagination.page - 1) * pagination.limit + index + 1}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {panel.user?.username || 'Unknown'}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {panel.user?.email || 'No email'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <a
                              href={`https://${panel.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {panel.domain}
                            </a>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {panel.createdAt
                                  ? new Date(panel.createdAt).toLocaleDateString()
                                  : 'Unknown'}
                              </div>
                              <div className="text-xs">
                                {panel.createdAt
                                  ? new Date(panel.createdAt).toLocaleTimeString()
                                  : ''}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div 
                              className={`flex items-center gap-1 px-2 py-1 rounded-full w-fit text-xs font-medium ${getStatusColor(panel.status)}`}
                            >
                              {getStatusIcon(panel.status)}
                              <span className="capitalize">
                                {panel.status}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                className="btn btn-secondary p-2"
                                title="View Details"
                                onClick={() => {
                                  setViewDialog({
                                    open: true,
                                    panel: panel,
                                  });
                                }}
                              >
                                <FaEye className="h-3 w-3" />
                              </button>

                              <div className="relative">
                                <button
                                  className="btn btn-secondary p-2"
                                  title="More Actions"
                                  onClick={() => {
                                    setDropdownOpen(
                                      dropdownOpen === panel.id 
                                        ? null 
                                        : panel.id
                                    );
                                  }}
                                >
                                  <FaEllipsisH className="h-3 w-3" />
                                </button>

                                {dropdownOpen === panel.id && (
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                      onClick={() => {
                                        setDropdownOpen(null);
                                        openStatusDialog(panel.id, panel.status);
                                      }}
                                    >
                                      <FaUserCheck className="h-3 w-3 text-blue-600" />
                                      Change Status
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                      onClick={() => {
                                        setDropdownOpen(null);
                                        openSettingsDialog(panel);
                                      }}
                                    >
                                      <FaCog className="h-3 w-3 text-gray-600" />
                                      Panel Settings
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                      onClick={() => {
                                        setDropdownOpen(null);
                                        window.open(`https://${panel.domain}`, '_blank');
                                      }}
                                    >
                                      <FaGlobe className="h-3 w-3 text-green-600" />
                                      Visit Panel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {panelsLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading pagination...</span>
                      </div>
                    ) : (
                      `Showing ${formatNumber(
                        (pagination.page - 1) * pagination.limit + 1
                      )} to ${formatNumber(
                        Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )
                      )} of ${formatNumber(pagination.total)} panels`
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={!pagination.hasPrev || panelsLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {panelsLoading ? (
                        <GradientSpinner size="w-4 h-4" />
                      ) : (
                        `Page ${formatNumber(
                          pagination.page
                        )} of ${formatNumber(pagination.totalPages)}`
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={!pagination.hasNext || panelsLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Status Dialog */}
                {statusDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Change Panel Status
                      </h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">New Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="form-label mb-2">
                          Reason for Change
                        </label>
                        <textarea
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                          className="form-field w-full min-h-[120px] resize-y px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="Explain the reason for status change..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setStatusDialog({ 
                              open: false, 
                              panelId: 0, 
                              currentStatus: '' 
                            });
                            setNewStatus('');
                            setStatusReason('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              statusDialog.panelId,
                              newStatus,
                              statusReason
                            )
                          }
                          className="btn btn-primary"
                          disabled={!statusReason.trim() || newStatus === statusDialog.currentStatus}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel Settings Dialog */}
                {settingsDialog.open && settingsDialog.panel && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">
                          Panel Settings - {settingsDialog.panel.panelName}
                        </h3>
                        <button
                          onClick={() =>
                            setSettingsDialog({ open: false, panel: null })
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaTimes className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Tabs */}
                      <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex flex-wrap space-x-0 sm:space-x-8 gap-2">
                          <button
                            onClick={() => setActiveSettingsTab('general')}
                            className={`py-2 px-4 sm:px-1 border-b-2 font-medium text-sm flex-1 text-center ${
                              activeSettingsTab === 'general'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            General
                          </button>
                          <button
                            onClick={() => setActiveSettingsTab('appearance')}
                            className={`py-2 px-4 sm:px-1 border-b-2 font-medium text-sm flex-1 text-center ${
                              activeSettingsTab === 'appearance'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Appearance
                          </button>
                          <button
                            onClick={() => setActiveSettingsTab('api')}
                            className={`py-2 px-4 sm:px-1 border-b-2 font-medium text-sm flex-1 text-center ${
                              activeSettingsTab === 'api'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            API & Limits
                          </button>
                          <button
                            onClick={() => setActiveSettingsTab('features')}
                            className={`py-2 px-4 sm:px-1 border-b-2 font-medium text-sm flex-1 text-center ${
                              activeSettingsTab === 'features'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Features
                          </button>
                        </nav>
                      </div>

                      {/* Tab Content */}
                      <div className="mb-6">
                        {activeSettingsTab === 'general' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <FormLabel
                                  className="text-sm font-medium"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  Panel Name
                                </FormLabel>
                                <input
                                  type="text"
                                  value={settingsData.panelName}
                                  onChange={(e) =>
                                    setSettingsData(prev => ({
                                      ...prev,
                                      panelName: e.target.value
                                    }))
                                  }
                                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                  placeholder="Enter panel name"
                                />
                              </div>
                              <div>
                                <FormLabel
                                  className="text-sm font-medium"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  Language
                                </FormLabel>
                                <select
                                  value={settingsData.language}
                                  onChange={(e) =>
                                    setSettingsData(prev => ({
                                      ...prev,
                                      language: e.target.value
                                    }))
                                  }
                                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                                >
                                  <option value="en">English</option>
                                  <option value="es">Spanish</option>
                                  <option value="fr">French</option>
                                  <option value="de">German</option>
                                  <option value="ar">Arabic</option>
                                </select>
                              </div>
                            </div>
                            
                            <div>
                              <FormLabel
                                className="text-sm font-medium"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                Maximum Users
                              </FormLabel>
                              <input
                                type="number"
                                value={settingsData.maxUsers}
                                onChange={(e) =>
                                  setSettingsData(prev => ({
                                    ...prev,
                                    maxUsers: parseInt(e.target.value) || 0
                                  }))
                                }
                                className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Maximum number of users"
                                min="1"
                                max="10000"
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                Maximum number of users that can register on this panel
                              </div>
                            </div>
                          </div>
                        )}

                        {activeSettingsTab === 'appearance' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <FormLabel
                                  className="text-sm font-medium"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  Theme
                                </FormLabel>
                                <select
                                  value={settingsData.theme}
                                  onChange={(e) =>
                                    setSettingsData(prev => ({
                                      ...prev,
                                      theme: e.target.value
                                    }))
                                  }
                                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                                >
                                  <option value="Dark Blue">Dark Blue</option>
                                  <option value="Green">Green</option>
                                  <option value="Purple">Purple</option>
                                  <option value="Blue">Blue</option>
                                  <option value="Pink">Pink</option>
                                  <option value="Red">Red</option>
                                  <option value="Orange">Orange</option>
                                  <option value="Teal">Teal</option>
                                </select>
                              </div>
                              <div>
                                <FormLabel
                                  className="text-sm font-medium"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  Custom Logo
                                </FormLabel>
                                <input
                                  type="text"
                                  value={settingsData.customLogo}
                                  onChange={(e) =>
                                    setSettingsData(prev => ({
                                      ...prev,
                                      customLogo: e.target.value
                                    }))
                                  }
                                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                  placeholder="Logo URL (optional)"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="flex items-center gap-2 mb-4">
                                <input
                                  type="checkbox"
                                  checked={settingsData.customBranding}
                                  onChange={(e) =>
                                    setSettingsData(prev => ({
                                      ...prev,
                                      customBranding: e.target.checked
                                    }))
                                  }
                                  className="rounded border-gray-300"
                                />
                                <span className="font-medium">Enable Custom Branding</span>
                              </label>
                              <div className="text-sm text-gray-600">
                                Allow this panel to use custom branding, logos, and remove "Powered by" links
                              </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-blue-800 mb-2">Theme Preview</h4>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded border-2 border-white shadow-sm"
                                  style={{
                                    backgroundColor: 
                                      settingsData.theme === 'Dark Blue' ? '#1e40af' :
                                      settingsData.theme === 'Green' ? '#059669' :
                                      settingsData.theme === 'Purple' ? '#7c3aed' :
                                      settingsData.theme === 'Blue' ? '#2563eb' :
                                      settingsData.theme === 'Pink' ? '#db2777' :
                                      settingsData.theme === 'Red' ? '#dc2626' :
                                      settingsData.theme === 'Orange' ? '#ea580c' :
                                      settingsData.theme === 'Teal' ? '#0d9488' : '#6b7280'
                                  }}
                                ></div>
                                <span className="text-sm text-gray-700">Primary Color: {settingsData.theme}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeSettingsTab === 'api' && (
                          <div className="space-y-6">
                            <div>
                              <label className="form-label mb-2">API Rate Limit (per hour)</label>
                              <input
                                type="number"
                                value={settingsData.apiRateLimit}
                                onChange={(e) =>
                                  setSettingsData(prev => ({
                                    ...prev,
                                    apiRateLimit: parseInt(e.target.value) || 0
                                  }))
                                }
                                className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="API calls per hour"
                                min="100"
                                max="10000"
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                Maximum API calls this panel can make per hour
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-gray-800 mb-3">Current API Usage</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-600">Today</div>
                                  <div className="text-lg font-semibold text-blue-600">
                                    {formatNumber(settingsDialog.panel.apiCallsToday)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-600">Total</div>
                                  <div className="text-lg font-semibold text-purple-600">
                                    {formatNumber(settingsDialog.panel.apiCallsTotal)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-yellow-800 mb-2">API Information</h4>
                              <div className="text-sm text-yellow-700 space-y-1">
                                <div>API Key: <span className="font-mono text-xs">{settingsDialog.panel.apiKey}</span></div>
                                <div className="text-xs">Keep this API key secure and do not share it publicly</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeSettingsTab === 'features' && (
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-md font-semibold mb-4 text-gray-800">Panel Features</h4>
                              
                              {/* Select All */}
                              <div className="mb-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={Object.values(settingsData.featuresEnabled).every(v => v)}
                                    onChange={(e) => {
                                      const allEnabled = e.target.checked;
                                      setSettingsData(prev => ({
                                        ...prev,
                                        featuresEnabled: {
                                          bulkOrders: allEnabled,
                                          apiAccess: allEnabled,
                                          customDomain: allEnabled,
                                          analytics: allEnabled,
                                          userManagement: allEnabled,
                                          ticketSystem: allEnabled,
                                          massOrders: allEnabled,
                                          drip_feed: allEnabled,
                                        }
                                      }))
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <span className="font-medium text-sm">Select All Features</span>
                                </label>
                              </div>

                              {/* Features Grid */}
                              <div className="grid grid-cols-2 gap-4">
                                {/* Left Column */}
                                <div className="space-y-3">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={settingsData.featuresEnabled.bulkOrders}
                                      onChange={(e) =>
                                        setSettingsData(prev => ({
                                          ...prev,
                                          featuresEnabled: {
                                            ...prev.featuresEnabled,
                                            bulkOrders: e.target.checked
                                          }
                                        }))
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Bulk Orders</span>
                                  </label>

                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={settingsData.featuresEnabled.userManagement || false}
                                      onChange={(e) =>
                                        setSettingsData(prev => ({
                                          ...prev,
                                          featuresEnabled: {
                                            ...prev.featuresEnabled,
                                            userManagement: e.target.checked
                                          }
                                        }))
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">User Management</span>
                                  </label>

                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={settingsData.featuresEnabled.analytics}
                                      onChange={(e) =>
                                        setSettingsData(prev => ({
                                          ...prev,
                                          featuresEnabled: {
                                            ...prev.featuresEnabled,
                                            analytics: e.target.checked
                                          }
                                        }))
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Analytics Dashboard</span>
                                  </label>

                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={settingsData.featuresEnabled.massOrders || false}
                                      onChange={(e) =>
                                        setSettingsData(prev => ({
                                          ...prev,
                                          featuresEnabled: {
                                            ...prev.featuresEnabled,
                                            massOrders: e.target.checked
                                          }
                                        }))
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Mass Orders</span>
                                  </label>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-3">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={settingsData.featuresEnabled.apiAccess}
                                      onChange={(e) =>
                                        setSettingsData(prev => ({
                                          ...prev,
                                          featuresEnabled: {
                                            ...prev.featuresEnabled,
                                            apiAccess: e.target.checked
                                          }
                                        }))
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">API Access</span>
                                  </label>

                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={settingsData.featuresEnabled.customDomain}
                                      onChange={(e) =>
                                        setSettingsData(prev => ({
                                          ...prev,
                                          featuresEnabled: {
                                            ...prev.featuresEnabled,
                                            customDomain: e.target.checked
                                          }
                                        }))
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Custom Domain</span>
                                  </label>

                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={settingsData.featuresEnabled.ticketSystem || false}
                                      onChange={(e) =>
                                        setSettingsData(prev => ({
                                          ...prev,
                                          featuresEnabled: {
                                            ...prev.featuresEnabled,
                                            ticketSystem: e.target.checked
                                          }
                                        }))
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Ticket System</span>
                                  </label>

                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={settingsData.featuresEnabled.drip_feed || false}
                                      onChange={(e) =>
                                        setSettingsData(prev => ({
                                          ...prev,
                                          featuresEnabled: {
                                            ...prev.featuresEnabled,
                                            drip_feed: e.target.checked
                                          }
                                        }))
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Drip Feed</span>
                                  </label>
                                </div>
                              </div>

                              {/* Status Message */}
                              <div className="mt-4 text-sm text-gray-600">
                                {Object.values(settingsData.featuresEnabled).every(v => !v) ? (
                                  <span className="text-amber-600">No features selected. Panel will have limited functionality.</span>
                                ) : (
                                  <span className="text-green-600">
                                    {Object.values(settingsData.featuresEnabled).filter(v => v).length} features enabled.
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-green-800 mb-2">Current Plan</h4>
                              <div className="text-sm text-green-700">
                                <div className="text-xs">
                                  Expires: {settingsDialog.panel.expiryDate 
                                    ? new Date(settingsDialog.panel.expiryDate).toLocaleDateString()
                                    : 'Never'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                          onClick={() => setSettingsDialog({ open: false, panel: null })}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSettings}
                          className="btn btn-primary"
                        >
                          Save Settings
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Details Dialog */}
                {viewDialog.open && viewDialog.panel && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">
                          Child Panel Details
                        </h3>
                        <button
                          onClick={() =>
                            setViewDialog({ open: false, panel: null })
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaTimes className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Panel Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            Basic Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Panel ID
                              </label>
                              <div className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded w-fit mt-1">
                                {formatID(viewDialog.panel.id.toString())}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Panel Name
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {viewDialog.panel.panelName}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Domain
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                <a 
                                  href={`https://${viewDialog.panel.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {viewDialog.panel.domain}
                                </a>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Owner
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {viewDialog.panel.user?.username} ({viewDialog.panel.user?.email})
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Status
                              </label>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full w-fit text-xs font-medium mt-1 ${getStatusColor(viewDialog.panel.status)}`}>
                                {getStatusIcon(viewDialog.panel.status)}
                                <span className="capitalize">
                                  {viewDialog.panel.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            Performance Metrics
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Total Orders
                              </label>
                              <div className="text-lg font-semibold text-gray-900 mt-1">
                                {formatNumber(viewDialog.panel.totalOrders)}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Total Revenue
                              </label>
                              <div className="text-lg font-semibold text-green-600 mt-1">
                                ${formatPrice(viewDialog.panel.totalRevenue, 2)}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                API Calls Today
                              </label>
                              <div className="text-lg font-semibold text-blue-600 mt-1">
                                {formatNumber(viewDialog.panel.apiCallsToday)}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Total API Calls
                              </label>
                              <div className="text-lg font-semibold text-purple-600 mt-1">
                                {formatNumber(viewDialog.panel.apiCallsTotal)}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Plan
                              </label>
                              <div className="text-lg font-semibold text-gray-900 mt-1">
                                {viewDialog.panel.plan}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Technical Details */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold mb-4 text-gray-800">
                          Technical Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-gray-600 mb-1">
                              API Key
                            </div>
                            <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {viewDialog.panel.apiKey}
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-blue-600 mb-1">
                              Theme
                            </div>
                            <div className="text-sm font-semibold text-blue-700">
                              {viewDialog.panel.theme}
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-green-600 mb-1">
                              Custom Branding
                            </div>
                            <div className="text-sm font-semibold text-green-700">
                              {viewDialog.panel.customBranding ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold mb-4 text-gray-800">
                          Important Dates
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Created
                            </label>
                            <div className="text-sm text-gray-900 mt-1">
                              {new Date(viewDialog.panel.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Last Activity
                            </label>
                            <div className="text-sm text-gray-900 mt-1">
                              {new Date(viewDialog.panel.lastActivity).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Expires
                            </label>
                            <div className="text-sm text-gray-900 mt-1">
                              {viewDialog.panel.expiryDate 
                                ? new Date(viewDialog.panel.expiryDate).toLocaleDateString()
                                : 'Never'
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                          onClick={() => {
                            window.open(`https://${viewDialog.panel!.domain}`, '_blank');
                          }}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <FaGlobe />
                          Visit Panel
                        </button>
                        <button
                          onClick={() => {
                            setViewDialog({ open: false, panel: null });
                            openStatusDialog(viewDialog.panel!.id, viewDialog.panel!.status);
                          }}
                          className="btn btn-primary flex items-center gap-2"
                        >
                          <FaUserCheck />
                          Change Status
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildPanelsPage;