'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import { formatID, formatNumber, formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaChartLine,
  FaCheckCircle,
  FaCoins,
  FaCopy,
  FaDollarSign,
  FaExclamationTriangle,
  FaFile,
  FaLink,
  FaMousePointer,
  FaPercent,
  FaRedo,
  FaSearch,
  FaSync,
  FaTimes,
  FaUser,
  FaUsers,
  FaEye,
  FaExternalLinkAlt,
  FaCreditCard,
} from 'react-icons/fa';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Custom Toast Component
const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
      type === 'success'
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
        : type === 'error'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        : type === 'info'
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      {type === 'error' && <FaExclamationTriangle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default function AffiliateProgram() {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Affiliate Program — ${APP_NAME}`;
  }, []);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] dark:bg-[var(--page-bg)] transition-colors duration-200">
      <div className="space-y-6">
        {/* Affiliate Stats Component */}
        <AffiliateStatsCards />
        
        {/* Affiliate Earnings Section */}
        <AffiliateEarningsSection />
      </div>
    </div>
  );
}

interface AffiliateStats {
  visits: number;
  registrations: number;
  referrals: number;
  conversionRate: string;
  totalEarnings: string;
  availableEarnings: string;
  commissionRate: string;
  minimumPayout: string;
}

// Define interface for affiliate earning records
interface AffiliateEarning {
  id: number;
  signupDate: string;
  service: string;
  amount: number;
  commission: number;
  status: 'completed' | 'pending' | 'cancelled';
  user: {
    id: number;
    email: string;
    name: string;
    username?: string;
  };
  currency: string;
}

interface EarningsPaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function AffiliateStatsCards() {
  const user = useCurrentUser();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfoLoading, setUserInfoLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [stats, setStats] = useState<AffiliateStats>({
    visits: 0,
    registrations: 0,
    referrals: 0,
    conversionRate: '0.00%',
    totalEarnings: '$0.00',
    availableEarnings: '$0.00',
    commissionRate: '1%',
    minimumPayout: '$100.00',
  });

  // Generate referral link based on user's ID
  const referralLink = user?.id ? `https://smmdoc.com/ref/${user.id}` : '';

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setStatsLoading(true);
        const response = await fetch('/api/user/affiliate/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch affiliate stats');
        }

        const data = await response.json();
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching affiliate stats:', error);
        showToast('Error loading affiliate stats', 'error');
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    const loadUserInfo = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setUserInfoLoading(false);
    };

    fetchStats();
    loadUserInfo();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setCopied(true);
        showToast('Referral link copied!', 'success');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        showToast('Failed to copy', 'error');
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* User Information Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Username Card */}
        <div className="card card-padding">
          <div className="card-content">
            <div className="card-icon">
              <FaUser />
            </div>
            <div>
              <h3 className="card-title">Username</h3>
              {userInfoLoading ? (
                <div className="flex items-center gap-2">
                  <GradientSpinner size="w-4 h-4" />
                  <span className="text-xs text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {user?.username || user?.email?.split('@')[0] || 'User'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="card card-padding">
          <div className="card-content">
            <div className="card-icon">
              <FaLink />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="card-title">Referral Link</h3>
              {userInfoLoading ? (
                <div className="flex items-center gap-2">
                  <GradientSpinner size="w-4 h-4" />
                  <span className="text-xs text-gray-400">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <p
                    className="text-sm truncate"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {referralLink
                      ? referralLink.replace('https://', '')
                      : 'Login to generate'}
                  </p>
                  {referralLink && (
                    <button
                      onClick={copyToClipboard}
                      className="ml-2 text-[var(--primary)] hover:text-[var(--secondary)] dark:text-[var(--secondary)] dark:hover:text-[var(--primary)] transition-colors duration-200"
                      title={copied ? 'Copied!' : 'Copy link'}
                    >
                      <FaCopy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Commission Rate Card */}
        <div className="card card-padding">
          <div className="card-content">
            <div className="card-icon">
              <FaPercent />
            </div>
            <div>
              <h3 className="card-title">Commission Rate</h3>
              {userInfoLoading ? (
                <div className="flex items-center gap-2">
                  <GradientSpinner size="w-4 h-4" />
                  <span className="text-xs text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {stats.commissionRate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Minimum Payout Card */}
        <div className="card card-padding">
          <div className="card-content">
            <div className="card-icon">
              <FaCoins />
            </div>
            <div>
              <h3 className="card-title">Minimum Payout</h3>
              {userInfoLoading ? (
                <div className="flex items-center gap-2">
                  <GradientSpinner size="w-4 h-4" />
                  <span className="text-xs text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {stats.minimumPayout}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Your Unique Referral Link Section */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <label className="text-sm font-medium text-white/80 whitespace-nowrap">
            Your Unique Referral Link
          </label>
          <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-sm w-full md:flex-1">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-white px-4 py-3 text-gray-800 font-medium text-sm outline-none border-none"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 text-[var(--primary)] hover:text-[var(--secondary)] hover:bg-gray-50 transition-colors duration-200 border-none"
              title={copied ? 'Copied!' : 'Copy link'}
            >
              <FaCopy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Statistics Overview Style Cards */}
      <div className="card card-padding">
        <div className="card-header mb-4">
          <div className="card-icon">
            <FaChartLine />
          </div>
          <h3 className="card-title">Affiliate Statistics Overview</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Total Visits */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">
                  Total Visits
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    stats.visits
                  )}
                </div>
              </div>
              <FaMousePointer className="text-blue-500 w-5 h-5" />
            </div>
          </div>

          {/* Registrations */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-600 dark:text-green-400 font-semibold">
                  Registrations
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    stats.registrations
                  )}
                </div>
              </div>
              <FaUsers className="text-green-500 w-5 h-5" />
            </div>
          </div>

          {/* Referrals */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-600 dark:text-purple-400 font-semibold">
                  Referrals
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    stats.referrals
                  )}
                </div>
              </div>
              <FaUsers className="text-purple-500 w-5 h-5" />
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-600 dark:text-orange-400 font-semibold">
                  Conversion Rate
                </div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    stats.conversionRate
                  )}
                </div>
              </div>
              <FaChartLine className="text-orange-500 w-5 h-5" />
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Total Earnings
                </div>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    stats.totalEarnings
                  )}
                </div>
              </div>
              <FaDollarSign className="text-emerald-500 w-5 h-5" />
            </div>
          </div>

          {/* Available Earnings */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Available Earnings
                </div>
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    stats.availableEarnings
                  )}
                </div>
              </div>
              <FaCoins className="text-indigo-500 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// New Affiliate Earnings Section Component
function AffiliateEarningsSection() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<EarningsPaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Withdrawal modal states
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    selectedPaymentMethod: '',
  });
  const [withdrawalProcessing, setWithdrawalProcessing] = useState(false);

  // User's configured payment methods (this would come from API)
  const userPaymentMethods = [
    {
      id: '1',
      method: 'bKash',
      accountNumber: '01712345678'
    },
    {
      id: '2', 
      method: 'Nagad',
      accountNumber: '01798765432'
    },
    {
      id: '3',
      method: 'Rocket',
      accountNumber: '01655554444'
    },
    {
      id: '4',
      method: 'Bank Transfer',
      accountNumber: 'Dutch Bangla Bank - 1234567890123'
    }
  ];

  // Get payment method icon and color
  const getPaymentMethodStyle = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return { bg: 'bg-gradient-to-r from-pink-500 to-red-500', icon: 'bK' };
      case 'nagad':
        return { bg: 'bg-gradient-to-r from-orange-500 to-red-500', icon: 'Na' };
      case 'rocket':
        return { bg: 'bg-gradient-to-r from-purple-500 to-blue-500', icon: 'Ro' };
      case 'upay':
        return { bg: 'bg-gradient-to-r from-blue-500 to-green-500', icon: 'Up' };
      default:
        return { bg: 'bg-gradient-to-r from-gray-500 to-gray-600', icon: method.charAt(0) };
    }
  };

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Sample data for demonstration
  const sampleEarnings: AffiliateEarning[] = [
    {
      id: 1,
      signupDate: '2024-01-15T10:30:00Z',
      service: 'Instagram Followers',
      amount: 25.50,
      commission: 2.55,
      status: 'completed',
      user: {
        id: 101,
        email: 'user1@example.com',
        name: 'John Doe',
        username: 'johndoe'
      },
      currency: 'USD'
    },
    {
      id: 2,
      signupDate: '2024-01-16T14:20:00Z',
      service: 'Facebook Likes',
      amount: 15.75,
      commission: 1.58,
      status: 'pending',
      user: {
        id: 102,
        email: 'user2@example.com',
        name: 'Jane Smith',
        username: 'janesmith'
      },
      currency: 'USD'
    },
    {
      id: 3,
      signupDate: '2024-01-17T09:45:00Z',
      service: 'YouTube Views',
      amount: 45.20,
      commission: 4.52,
      status: 'completed',
      user: {
        id: 103,
        email: 'user3@example.com',
        name: 'Mike Johnson',
        username: 'mikejohnson'
      },
      currency: 'USD'
    },
    {
      id: 4,
      signupDate: '2024-01-18T16:15:00Z',
      service: 'TikTok Followers',
      amount: 32.80,
      commission: 3.28,
      status: 'cancelled',
      user: {
        id: 104,
        email: 'user4@example.com',
        name: 'Sarah Wilson',
        username: 'sarahwilson'
      },
      currency: 'USD'
    }
  ];

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch earnings data
  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter sample data based on status filter
      let filteredEarnings = sampleEarnings;
      if (statusFilter !== 'all') {
        filteredEarnings = sampleEarnings.filter(earning => earning.status === statusFilter);
      }
      
      // Filter by search term
      if (searchTerm) {
        filteredEarnings = filteredEarnings.filter(earning => 
          earning.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          earning.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          earning.user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setEarnings(filteredEarnings);
      setPagination(prev => ({
        ...prev,
        total: filteredEarnings.length,
        totalPages: Math.ceil(filteredEarnings.length / prev.limit)
      }));
      
    } catch (error) {
      console.error('Error fetching earnings:', error);
      showToast('Error fetching earnings data', 'error');
    } finally {
      setEarningsLoading(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEarnings();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchEarnings();
  }, []);

  // Safe ID formatter
  const safeFormatId = (id: any) => {
    return formatID(String(id || 'null'));
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'pending':
        return <FaExclamationTriangle className="h-3 w-3 text-orange-500" />;
      case 'cancelled':
        return <FaTimes className="h-3 w-3 text-red-500" />;
      default:
        return <FaExclamationTriangle className="h-3 w-3 text-gray-500" />;
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await fetchEarnings();
    showToast('Affiliate earnings refreshed successfully!', 'success');
  };

  // Handle withdrawal request
  const handleWithdrawalRequest = async () => {
    if (!withdrawalForm.amount || parseFloat(withdrawalForm.amount) <= 0) {
      showToast('Please enter a valid withdrawal amount', 'error');
      return;
    }

    if (!withdrawalForm.paymentDetails.trim()) {
      showToast('Please enter your payment details', 'error');
      return;
    }

    const amount = parseFloat(withdrawalForm.amount);
    const minWithdrawal = 100; // Minimum withdrawal amount
    
    if (amount < minWithdrawal) {
      showToast(`Minimum withdrawal amount is ${minWithdrawal}`, 'error');
      return;
    }

    try {
      setWithdrawalProcessing(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('Withdrawal request submitted successfully!', 'success');
      setWithdrawalModalOpen(false);
      setWithdrawalForm({
        amount: '',
        paymentMethod: 'paypal',
        paymentDetails: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      showToast('Error submitting withdrawal request', 'error');
    } finally {
      setWithdrawalProcessing(false);
    }
  };

  // Calculate status counts
  const statusCounts = {
    all: sampleEarnings.length,
    pending: sampleEarnings.filter(e => e.status === 'pending').length,
    completed: sampleEarnings.filter(e => e.status === 'completed').length,
    cancelled: sampleEarnings.filter(e => e.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Controls Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Action Buttons */}
          <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-2">
            <div className="w-full md:w-auto flex items-center gap-2">
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
                className="w-[20%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={earningsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={earningsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-2">
              <button
                onClick={() => setWithdrawalModalOpen(true)}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5 w-full md:w-auto mb-2 md:mb-0"
              >
                <FaDollarSign className="w-4 h-4" />
                Request Withdrawal
              </button>

              <button
                onClick={() => router.push('/affiliate/payment-methods')}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5 w-full md:w-auto"
              >
                <FaCreditCard className="w-4 h-4" />
                Payment Methods
              </button>
            </div>
          </div>

          {/* Right: Search Controls */}
          <div className="w-full md:w-auto flex items-center gap-3">
            <div className="relative w-full md:w-auto">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder={`Search ${
                  statusFilter === 'all' ? 'all' : statusFilter
                } earnings...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate Earnings Table */}
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
                    statusFilter === 'all' ? 'bg-white/20' : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {statusCounts.all}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                  statusFilter === 'pending'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pending
                <span
                  className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    statusFilter === 'pending' ? 'bg-white/20' : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {statusCounts.pending}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                  statusFilter === 'completed'
                    ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Completed
                <span
                  className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    statusFilter === 'completed'
                      ? 'bg-white/20'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {statusCounts.completed}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                  statusFilter === 'cancelled'
                    ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cancelled
                <span
                  className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    statusFilter === 'cancelled'
                      ? 'bg-white/20'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {statusCounts.cancelled}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 24px' }}>
          {earningsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center flex flex-col items-center">
                <GradientSpinner size="w-12 h-12" className="mb-3" />
                <div className="text-base font-medium">Loading affiliate earnings...</div>
              </div>
            </div>
          ) : earnings.length === 0 ? (
            <div className="text-center py-12">
              <FaDollarSign
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No earnings found
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No affiliate earnings match your current filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop and Mobile Table View */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="sticky top-0 bg-white border-b z-10">
                    <tr>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ID
                      </th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        User
                      </th>
                      <th className="text-left p-3 font-semibold hidden md:table-cell" style={{ color: 'var(--text-primary)' }}>
                        Signup Date
                      </th>
                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Service
                      </th>
                      <th className="text-right p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Amount
                      </th>
                      <th className="text-right p-3 font-semibold hidden md:table-cell" style={{ color: 'var(--text-primary)' }}>
                        Commission
                      </th>
                      <th className="text-center p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map((earning) => (
                      <tr
                        key={earning.id}
                        className="border-t hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="p-3">
                          <div className="font-mono text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            #{safeFormatId(earning.id)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {earning.user?.username ||
                                earning.user?.email?.split('@')[0] ||
                                earning.user?.name ||
                                'Unknown'}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {earning.user?.email || 'No email'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {new Date(earning.signupDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(earning.signupDate).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {earning.service}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            ${formatPrice(earning.amount, 2)}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {earning.currency}
                          </div>
                        </td>
                        <td className="p-3 text-right hidden md:table-cell">
                          <td className="p-3 text-right hidden md:table-cell">
                          <div className="text-sm font-semibold text-green-600">
                            ${formatPrice(earning.commission, 2)}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {((earning.commission / earning.amount) * 100).toFixed(1)}%
                          </div>
                        </td>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit mx-auto">
                            {getStatusIcon(earning.status)}
                            <span className="text-xs font-medium capitalize">{earning.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 pb-6 border-t gap-3">
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Showing {formatNumber((pagination.page - 1) * pagination.limit + 1)} to {formatNumber(Math.min(pagination.page * pagination.limit, pagination.total))} of {formatNumber(pagination.total)} earnings
                </div>
                <div className="flex flex-row items-center justify-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page <= 1}
                    className="btn btn-secondary w-full sm:w-auto"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-center w-full sm:w-auto" style={{ color: 'var(--text-muted)' }}>
                    Page {formatNumber(pagination.page)} of {formatNumber(pagination.totalPages)}
                  </span>
                  <button
                    onClick={() =>
                      setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    className="btn btn-secondary w-full sm:w-auto"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {withdrawalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Request Withdrawal</h3>
              <button
                onClick={() => setWithdrawalModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Available Balance Info */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 font-medium mb-1">Available Balance</div>
                <div className="text-2xl font-bold text-green-700">$245.50</div>
                <div className="text-xs text-green-600 mt-1">Minimum withdrawal: $100.00</div>
              </div>

              {/* Withdrawal Amount */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawalForm.amount}
                    onChange={(e) =>
                      setWithdrawalForm(prev => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className="form-field w-full pl-8 px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Payment Method
                </label>
                <select
                  value={withdrawalForm.selectedPaymentMethod}
                  onChange={(e) =>
                    setWithdrawalForm(prev => ({
                      ...prev,
                      selectedPaymentMethod: e.target.value,
                    }))
                  }
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select payment method</option>
                  {userPaymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.method}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Choose from your configured payment methods
                </div>
              </div>

              {/* Important Notice */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-800 mb-1">Processing Information</div>
                    <div className="text-xs text-blue-700">
                      • Withdrawals are processed within 1-3 business days<br/>
                      • Minimum withdrawal amount is $100.00<br/>
                      • Processing fees may apply depending on payment method
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button 
                onClick={() => setWithdrawalModalOpen(false)} 
                className="btn btn-secondary"
                disabled={withdrawalProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawalRequest}
                disabled={withdrawalProcessing}
                className="btn btn-primary flex items-center gap-2"
              >
                {withdrawalProcessing ? (
                  <>
                    <FaSync className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaDollarSign className="h-4 w-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}