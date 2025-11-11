'use client';

import React, { useEffect, useState } from 'react';
import {
    FaCheckCircle,
    FaClock,
    FaEllipsisH,
    FaEye,
    FaMoneyBillWave,
    FaNetworkWired,
    FaSearch,
    FaSync,
    FaTimes,
    FaTimesCircle,
    FaUserCheck
} from 'react-icons/fa';

import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatID, formatNumber, formatPrice } from '@/lib/utils';

const ShimmerStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    .gradient-shimmer {
      background: linear-gradient(90deg, #f0f0f0 0%, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%, #f0f0f0 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .dark .gradient-shimmer {
      background: linear-gradient(90deg, #2d2d2d 0%, #353535 25%, #2f2f2f 50%, #353535 75%, #2d2d2d 100%);
      background-size: 200% 100%;
    }
  `}} />
);

const AffiliatesTableSkeleton = () => {
  const rows = Array.from({ length: 10 });

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1400px]">
          <thead className="sticky top-0 bg-white dark:bg-gray-800 border-b z-10">
            <tr>
              {Array.from({ length: 12 }).map((_, idx) => (
                <th key={idx} className="text-left p-3">
                  <div className="h-4 rounded w-3/4 gradient-shimmer" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((_, rowIdx) => (
              <tr key={rowIdx} className="border-t dark:border-gray-700">
                <td className="p-3">
                  <div className="h-4 w-4 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-6 w-16 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-4 w-24 gradient-shimmer rounded mb-2" />
                  <div className="h-3 w-32 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-4 w-16 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-4 w-12 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-4 w-16 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-4 w-20 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-4 w-20 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-4 w-20 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-4 w-20 gradient-shimmer rounded" />
                </td>
                <td className="p-3">
                  <div className="h-5 w-20 gradient-shimmer rounded-full" />
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <div className="h-8 w-8 gradient-shimmer rounded" />
                    <div className="h-8 w-8 gradient-shimmer rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="h-5 w-48 gradient-shimmer rounded" />
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="h-9 w-20 gradient-shimmer rounded" />
          <div className="h-5 w-24 gradient-shimmer rounded" />
          <div className="h-9 w-16 gradient-shimmer rounded" />
        </div>
      </div>
    </>
  );
};

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

interface AffiliateReferral {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    joinedAt: string;
  };
  referralCode: string;
  totalVisits: number;
  signUps: number;
  conversionRate: number;
  totalFunds: number;
  earnedCommission: number;
  requestedCommission: number;
  totalCommission: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: string;
  lastActivity: string;
  commissionRate: number;
  paymentMethod: string;
  payoutHistory: PayoutRecord[];
}

interface PayoutRecord {
  id: number;
  amount: number;
  requestedAt: string;
  processedAt?: string;
  status: 'pending' | 'approved' | 'declined' | 'paid';
  method: string;
  notes?: string;
}

interface AffiliateStats {
  totalAffiliates: number;
  activeAffiliates: number;
  inactiveAffiliates: number;
  suspendedAffiliates: number;
  totalVisits: number;
  totalSignUps: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  pendingPayouts: number;
  averageConversionRate: number;
  topPerformers: number;
  todaySignUps: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const dummyAffiliates: AffiliateReferral[] = [
  {
    id: 1001,
    user: {
      id: 2001,
      username: 'social_king',
      email: 'socialking@gmail.com',
      name: 'Alex Rodriguez',
      joinedAt: '2024-01-15T10:30:00Z',
    },
    referralCode: 'SOCIAL2024',
    totalVisits: 2847,
    signUps: 142,
    conversionRate: 4.99,
    totalFunds: 15420.50,
    earnedCommission: 1542.05,
    requestedCommission: 450.00,
    totalCommission: 1992.05,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastActivity: '2025-07-01T14:22:00Z',
    commissionRate: 10.0,
    paymentMethod: 'PayPal',
    payoutHistory: [
      {
        id: 1,
        amount: 250.00,
        requestedAt: '2024-06-15T09:00:00Z',
        processedAt: '2024-06-16T11:30:00Z',
        status: 'paid',
        method: 'paypal',
        notes: 'Regular monthly payout'
      }
    ]
  },
  {
    id: 1002,
    user: {
      id: 2002,
      username: 'insta_guru',
      email: 'instaguru99@outlook.com',
      name: 'Sarah Chen',
      joinedAt: '2024-02-03T08:15:00Z',
    },
    referralCode: 'INSTA99',
    totalVisits: 1923,
    signUps: 89,
    conversionRate: 4.63,
    totalFunds: 8750.25,
    earnedCommission: 875.03,
    requestedCommission: 200.00,
    totalCommission: 1075.03,
    status: 'active',
    createdAt: '2024-02-03T08:15:00Z',
    lastActivity: '2025-06-30T16:45:00Z',
    commissionRate: 10.0,
    paymentMethod: 'Bank Transfer',
    payoutHistory: []
  },
  {
    id: 1003,
    user: {
      id: 2003,
      username: 'tiktok_master',
      email: 'tiktokmaster@yahoo.com',
      name: 'Mike Johnson',
      joinedAt: '2024-03-20T12:00:00Z',
    },
    referralCode: 'TIKTOK2024',
    totalVisits: 3256,
    signUps: 198,
    conversionRate: 6.08,
    totalFunds: 22840.75,
    earnedCommission: 2284.08,
    requestedCommission: 800.00,
    totalCommission: 3084.08,
    status: 'active',
    createdAt: '2024-03-20T12:00:00Z',
    lastActivity: '2025-07-02T09:30:00Z',
    commissionRate: 10.0,
    paymentMethod: 'Cryptocurrency (Bitcoin)',
    payoutHistory: [
      {
        id: 2,
        amount: 500.00,
        requestedAt: '2024-05-20T10:00:00Z',
        processedAt: '2024-05-21T14:15:00Z',
        status: 'paid',
        method: 'bank_transfer',
        notes: 'First major payout'
      }
    ]
  },
  {
    id: 1004,
    user: {
      id: 2004,
      username: 'youtube_pro',
      email: 'youtubepro@gmail.com',
      name: 'Emma Wilson',
      joinedAt: '2024-01-08T14:20:00Z',
    },
    referralCode: 'YTPRO2024',
    totalVisits: 1567,
    signUps: 67,
    conversionRate: 4.28,
    totalFunds: 5890.30,
    earnedCommission: 589.03,
    requestedCommission: 0.00,
    totalCommission: 589.03,
    status: 'inactive',
    createdAt: '2024-01-08T14:20:00Z',
    lastActivity: '2025-05-15T11:20:00Z',
    commissionRate: 10.0,
    paymentMethod: 'PayPal',
    payoutHistory: []
  },
  {
    id: 1005,
    user: {
      id: 2005,
      username: 'smm_expert',
      email: 'smmexpert@protonmail.com',
      name: 'David Kim',
      joinedAt: '2024-04-12T09:45:00Z',
    },
    referralCode: 'SMMEXP24',
    totalVisits: 4521,
    signUps: 267,
    conversionRate: 5.91,
    totalFunds: 31250.80,
    earnedCommission: 3125.08,
    requestedCommission: 1200.00,
    totalCommission: 4325.08,
    status: 'active',
    createdAt: '2024-04-12T09:45:00Z',
    lastActivity: '2025-07-02T13:10:00Z',
    commissionRate: 10.0,
    paymentMethod: 'Cryptocurrency (USDT)',
    payoutHistory: [
      {
        id: 3,
        amount: 750.00,
        requestedAt: '2024-06-01T08:00:00Z',
        processedAt: '2024-06-02T10:30:00Z',
        status: 'paid',
        method: 'crypto',
        notes: 'BTC payout as requested'
      }
    ]
  },
  {
    id: 1006,
    user: {
      id: 2006,
      username: 'social_boost',
      email: 'socialboost@gmail.com',
      name: 'Lisa Anderson',
      joinedAt: '2024-05-25T11:30:00Z',
    },
    referralCode: 'BOOST2024',
    totalVisits: 892,
    signUps: 34,
    conversionRate: 3.81,
    totalFunds: 2140.50,
    earnedCommission: 214.05,
    requestedCommission: 100.00,
    totalCommission: 314.05,
    status: 'pending',
    createdAt: '2024-05-25T11:30:00Z',
    lastActivity: '2025-06-28T15:45:00Z',
    commissionRate: 10.0,
    paymentMethod: 'Bank Transfer',
    payoutHistory: []
  },
  {
    id: 1007,
    user: {
      id: 2007,
      username: 'viral_marketer',
      email: 'viralmarketer@hotmail.com',
      name: 'James Thompson',
      joinedAt: '2024-02-14T16:00:00Z',
    },
    referralCode: 'VIRAL24',
    totalVisits: 756,
    signUps: 12,
    conversionRate: 1.59,
    totalFunds: 450.25,
    earnedCommission: 45.03,
    requestedCommission: 0.00,
    totalCommission: 45.03,
    status: 'suspended',
    createdAt: '2024-02-14T16:00:00Z',
    lastActivity: '2025-04-10T08:20:00Z',
    commissionRate: 10.0,
    paymentMethod: 'PayPal',
    payoutHistory: []
  },
  {
    id: 1008,
    user: {
      id: 2008,
      username: 'growth_hacker',
      email: 'growthhacker@icloud.com',
      name: 'Rachel Green',
      joinedAt: '2024-06-10T13:15:00Z',
    },
    referralCode: 'GROWTH24',
    totalVisits: 1245,
    signUps: 78,
    conversionRate: 6.27,
    totalFunds: 6820.40,
    earnedCommission: 682.04,
    requestedCommission: 300.00,
    totalCommission: 982.04,
    status: 'active',
    createdAt: '2024-06-10T13:15:00Z',
    lastActivity: '2025-07-01T12:30:00Z',
    commissionRate: 10.0,
    paymentMethod: 'Wise (formerly TransferWise)',
    payoutHistory: []
  }
];

const dummyStats: AffiliateStats = {
  totalAffiliates: 8,
  activeAffiliates: 5,
  inactiveAffiliates: 1,
  suspendedAffiliates: 1,
  totalVisits: 17007,
  totalSignUps: 887,
  totalCommissionEarned: 9356.39,
  totalCommissionPaid: 1500.00,
  pendingPayouts: 3050.00,
  averageConversionRate: 4.82,
  topPerformers: 3,
  todaySignUps: 12,
};

const AffiliateReferralsPage = () => {
  const { appName } = useAppNameWithFallback();

  useEffect(() => {
    setPageTitle('Affiliate Referrals', appName);
  }, [appName]);

  const [affiliates, setAffiliates] = useState<AffiliateReferral[]>(dummyAffiliates);
  const [stats, setStats] = useState<AffiliateStats>(dummyStats);

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
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  const [statsLoading, setStatsLoading] = useState(true);
  const [affiliatesLoading, setAffiliatesLoading] = useState(true);

  const [payoutDialog, setPayoutDialog] = useState<{
    open: boolean;
    affiliateId: number;
    requestedAmount: number;
    availableAmount: number;
    paymentMethod: string;
  }>({
    open: false,
    affiliateId: 0,
    requestedAmount: 0,
    availableAmount: 0,
    paymentMethod: '',
  });
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    affiliateId: number;
    currentStatus: string;
  }>({
    open: false,
    affiliateId: 0,
    currentStatus: '',
  });
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    affiliate: AffiliateReferral | null;
  }>({
    open: false,
    affiliate: null,
  });

  const [selectedBulkAction, setSelectedBulkAction] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  const calculateStatusCounts = (affiliatesData: AffiliateReferral[]) => {
    const counts = {
      active: 0,
      inactive: 0,
      suspended: 0,
      pending: 0,
    };

    affiliatesData.forEach((affiliate) => {
      if (affiliate.status && counts.hasOwnProperty(affiliate.status)) {
        counts[affiliate.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const fetchAllAffiliatesForCounts = async () => {
    try {
      console.log('Calculating status counts from dummy data...');

      await new Promise(resolve => setTimeout(resolve, 200));

      const statusCounts = calculateStatusCounts(dummyAffiliates);

      console.log('Calculated status counts:', statusCounts);

      setStats((prev) => ({
        ...prev,
        activeAffiliates: statusCounts.active,
        inactiveAffiliates: statusCounts.inactive,
        suspendedAffiliates: statusCounts.suspended,
        totalAffiliates: dummyAffiliates.length,
      }));
    } catch (error) {
      console.error('Error calculating affiliate counts:', error);
    }
  };

  const fetchAffiliates = async () => {
    try {
      setAffiliatesLoading(true);

      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredAffiliates = [...dummyAffiliates];

      if (statusFilter !== 'all') {
        filteredAffiliates = filteredAffiliates.filter(
          affiliate => affiliate.status === statusFilter
        );
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredAffiliates = filteredAffiliates.filter(
          affiliate =>
            affiliate.user.username?.toLowerCase().includes(searchLower) ||
            affiliate.user.email?.toLowerCase().includes(searchLower) ||
            affiliate.referralCode?.toLowerCase().includes(searchLower)
        );
      }

      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedAffiliates = filteredAffiliates.slice(startIndex, endIndex);

      console.log('Affiliates fetched successfully with filters applied');

      setAffiliates(paginatedAffiliates);
      setPagination(prev => ({
        ...prev,
        total: filteredAffiliates.length,
        totalPages: Math.ceil(filteredAffiliates.length / pagination.limit),
        hasNext: endIndex < filteredAffiliates.length,
        hasPrev: pagination.page > 1,
      }));
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      showToast('Error fetching affiliates. Please try again.', 'error');
      setAffiliates([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setAffiliatesLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Loading stats from dummy data...');

      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('Stats loaded successfully:', dummyStats);

      setStats(dummyStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalAffiliates: 0,
        activeAffiliates: 0,
        inactiveAffiliates: 0,
        suspendedAffiliates: 0,
        totalVisits: 0,
        totalSignUps: 0,
        totalCommissionEarned: 0,
        totalCommissionPaid: 0,
        pendingPayouts: 0,
        averageConversionRate: 0,
        topPerformers: 0,
        todaySignUps: 0,
      });
      showToast('Error fetching statistics. Please refresh the page.', 'error');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAffiliates();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchAffiliates();
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    setStatsLoading(true);

    const loadData = async () => {
      await Promise.all([fetchStats(), fetchAllAffiliatesForCounts()]);
      setStatsLoading(false);
    };

    loadData();
  }, []);

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

  useEffect(() => {
    if (pagination.total > 0) {
      setStats((prev) => ({
        ...prev,
        totalAffiliates: pagination.total,
      }));
    }
  }, [pagination.total]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateConversionRate = (signUps: number, visits: number) => {
    if (visits === 0) return 0;
    return (signUps / visits) * 100;
  };

  const handleSelectAll = () => {
    const selectableAffiliates = affiliates.filter(
      (affiliate) => affiliate.status !== 'suspended'
    );

    const selectableIds = selectableAffiliates.map((affiliate) => 
      affiliate.id.toString()
    );

    if (
      selectedAffiliates.length === selectableIds.length &&
      selectableIds.length > 0
    ) {
      setSelectedAffiliates([]);
    } else {
      setSelectedAffiliates(selectableIds);
    }
  };

  const handleSelectAffiliate = (affiliateId: string) => {
    setSelectedAffiliates((prev) =>
      prev.includes(affiliateId)
        ? prev.filter((id) => id !== affiliateId)
        : [...prev, affiliateId]
    );
  };

  const handleRefresh = async () => {
    setAffiliatesLoading(true);
    setStatsLoading(true);

    try {
      await Promise.all([
        fetchAffiliates(),
        fetchStats(),
        fetchAllAffiliatesForCounts(),
      ]);
      showToast('Affiliate data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showToast('Error refreshing data. Please try again.', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleProcessPayout = async (
    affiliateId: number,
    amount: number,
    method: string,
    notes: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/affiliates/${affiliateId}/payout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            method,
            notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to process payout');
      }

      showToast('Payout processed successfully', 'success');
      await Promise.all([
        fetchAffiliates(),
        fetchStats(),
        fetchAllAffiliatesForCounts(),
      ]);
      setPayoutDialog({ 
        open: false, 
        affiliateId: 0, 
        requestedAmount: 0, 
        availableAmount: 0,
        paymentMethod: '',
      });
      setPayoutAmount('');
      setPayoutMethod('');
      setPayoutNotes('');
    } catch (error) {
      console.error('Error processing payout:', error);
      showToast(
        error instanceof Error ? error.message : 'Error processing payout',
        'error'
      );
    }
  };

  const handleStatusChange = async (
    affiliateId: number,
    status: string,
    reason: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/affiliates/${affiliateId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            reason,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      showToast('Affiliate status updated successfully', 'success');
      await Promise.all([
        fetchAffiliates(),
        fetchStats(),
        fetchAllAffiliatesForCounts(),
      ]);
      setStatusDialog({ open: false, affiliateId: 0, currentStatus: '' });
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

  const openPayoutDialog = (
    affiliateId: number,
    requestedAmount: number,
    availableAmount: number,
    paymentMethod: string
  ) => {
    setPayoutDialog({
      open: true,
      affiliateId,
      requestedAmount,
      availableAmount,
      paymentMethod,
    });
    setPayoutAmount(requestedAmount.toString());
    setPayoutMethod(paymentMethod);
    setPayoutNotes('');
  };

  const openStatusDialog = (affiliateId: number, currentStatus: string) => {
    setStatusDialog({ open: true, affiliateId, currentStatus });
    setNewStatus(currentStatus);
    setStatusReason('');
  };

  return (
    <div className="page-container">
      {}
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
        <ShimmerStyles />
        {}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {}
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
                disabled={affiliatesLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync
                  className={
                    affiliatesLoading || statsLoading ? 'animate-spin' : ''
                  }
                />
                Refresh
              </button>
            </div>

            {}
            <div className="flex flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${
                    statusFilter === 'all' ? 'all' : statusFilter
                  } affiliates...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="referral_code">Referral Code</option>
              </select>
            </div>
          </div>
        </div>

        {}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {}
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
                    {stats.totalAffiliates}
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
                    {stats.activeAffiliates}
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
                    {stats.inactiveAffiliates}
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
                    {stats.suspendedAffiliates}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {}
            {selectedAffiliates.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4 pt-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {selectedAffiliates.length} selected
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
                  <option value="process_payouts">Process Payouts</option>
                </select>

                {selectedBulkAction && (
                  <div className="w-full flex justify-center md:w-auto md:block">
                    <button
                      onClick={() => {
                        if (selectedBulkAction === 'activate') {
                          console.log('Bulk activate selected:', selectedAffiliates);
                          showToast(
                            `Activating ${selectedAffiliates.length} selected affiliates...`,
                            'info'
                          );
                        } else if (selectedBulkAction === 'deactivate') {
                          console.log('Bulk deactivate selected:', selectedAffiliates);
                          showToast(
                            `Deactivating ${selectedAffiliates.length} selected affiliates...`,
                            'info'
                          );
                        } else if (selectedBulkAction === 'process_payouts') {
                          console.log('Bulk process payouts selected:', selectedAffiliates);
                          showToast(
                            `Processing payouts for ${selectedAffiliates.length} selected affiliates...`,
                            'info'
                          );
                        }

                        setSelectedBulkAction('');
                        setSelectedAffiliates([]);
                      }}
                      className="btn btn-primary w-full px-3 py-2.5"
                    >
                      Apply Action
                    </button>
                  </div>
                )}
              </div>
            )}

            {affiliatesLoading ? (
              <div className="min-h-[600px]">
                <AffiliatesTableSkeleton />
              </div>
            ) : affiliates.length === 0 ? (
              <div className="text-center py-12">
                <FaNetworkWired
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No affiliates found.
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No affiliates match your current filters or no affiliates
                  exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[1400px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedAffiliates.length === affiliates.length &&
                              affiliates.length > 0
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
                          Total Visits
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Sign Up
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Conversion Rate
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Total Funds
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Earned Commission
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Requested Commission
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Total Commission
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
                      {affiliates.map((affiliate) => (
                        <tr
                          key={affiliate.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            {affiliate.status !== 'suspended' && (
                              <input
                                type="checkbox"
                                checked={selectedAffiliates.includes(
                                  affiliate.id.toString()
                                )}
                                onChange={() =>
                                  handleSelectAffiliate(affiliate.id.toString())
                                }
                                className="rounded border-gray-300 w-4 h-4"
                              />
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                              {formatID(affiliate.id.toString())}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {affiliate.user?.username || 'Unknown'}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {affiliate.user?.email || 'No email'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {formatNumber(affiliate.totalVisits)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {formatNumber(affiliate.signUps)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {affiliate.conversionRate.toFixed(1)}%
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ${formatPrice(affiliate.totalFunds, 2)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-semibold text-sm text-green-600"
                            >
                              ${formatPrice(affiliate.earnedCommission, 2)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className={`font-semibold text-sm ${
                                affiliate.requestedCommission > 0 
                                  ? 'text-yellow-600' 
                                  : 'text-gray-500'
                              }`}
                            >
                              ${formatPrice(affiliate.requestedCommission, 2)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-semibold text-sm text-blue-600"
                            >
                              ${formatPrice(affiliate.totalCommission, 2)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div 
                              className={`flex items-center gap-1 px-2 py-1 rounded-full w-fit text-xs font-medium ${getStatusColor(affiliate.status)}`}
                            >
                              {getStatusIcon(affiliate.status)}
                              <span className="capitalize">
                                {affiliate.status}
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
                                    affiliate: affiliate,
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
                                      dropdownOpen === affiliate.id 
                                        ? null 
                                        : affiliate.id
                                    );
                                  }}
                                >
                                  <FaEllipsisH className="h-3 w-3" />
                                </button>

                                {dropdownOpen === affiliate.id && (
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                                    {affiliate.requestedCommission > 0 && (
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                        onClick={() => {
                                          setDropdownOpen(null);
                                          openPayoutDialog(
                                            affiliate.id,
                                            affiliate.requestedCommission,
                                            affiliate.totalCommission,
                                            affiliate.paymentMethod || 'bank_transfer'
                                          );
                                        }}
                                      >
                                        <FaMoneyBillWave className="h-3 w-3 text-green-600" />
                                        Process Payout
                                      </button>
                                    )}
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                      onClick={() => {
                                        setDropdownOpen(null);
                                        openStatusDialog(affiliate.id, affiliate.status);
                                      }}
                                    >
                                      <FaUserCheck className="h-3 w-3 text-blue-600" />
                                      Change Status
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

                {}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {affiliatesLoading ? (
                      <div className="flex items-center gap-2">
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
                      )} of ${formatNumber(pagination.total)} affiliates`
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
                      disabled={!pagination.hasPrev || affiliatesLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {affiliatesLoading ? (
                        <div className="h-4 w-24 gradient-shimmer rounded" />
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
                      disabled={!pagination.hasNext || affiliatesLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {}
                {payoutDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Process Payout
                      </h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">Payout Amount (in USD)</label>
                        <input
                          type="number"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="Enter payout amount"
                          step="0.01"
                          max={payoutDialog.availableAmount}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Available: ${formatPrice(payoutDialog.availableAmount, 2)}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="form-label mb-2">Payment Method</label>
                        <input
                          type="text"
                          value={payoutMethod}
                          readOnly
                          className="form-field w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed transition-all duration-200"
                          placeholder="Payment method selected by affiliate"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={payoutNotes}
                          onChange={(e) => setPayoutNotes(e.target.value)}
                          className="form-field w-full min-h-[120px] resize-y px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="Add any notes about the payout..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setPayoutDialog({
                              open: false,
                              affiliateId: 0,
                              requestedAmount: 0,
                              availableAmount: 0,
                              paymentMethod: '',
                            });
                            setPayoutAmount('');
                            setPayoutMethod('');
                            setPayoutNotes('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleProcessPayout(
                              payoutDialog.affiliateId,
                              parseFloat(payoutAmount) || 0,
                              payoutMethod,
                              payoutNotes
                            )
                          }
                          className="btn btn-primary"
                          disabled={!payoutAmount}
                        >
                          Process Payout
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {}
                {statusDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Change Affiliate Status
                      </h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">New Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
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
                              affiliateId: 0, 
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
                              statusDialog.affiliateId,
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

                {}
                {viewDialog.open && viewDialog.affiliate && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">
                          Affiliate Details
                        </h3>
                        <button
                          onClick={() =>
                            setViewDialog({ open: false, affiliate: null })
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaTimes className="h-5 w-5" />
                        </button>
                      </div>

                      {}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            Basic Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Affiliate ID
                              </label>
                              <div className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded w-fit mt-1">
                                {formatID(viewDialog.affiliate.id.toString())}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Username
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {viewDialog.affiliate.user?.username || 'Unknown'}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Email
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {viewDialog.affiliate.user?.email || 'No email'}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Referral Code
                              </label>
                              <div className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit mt-1">
                                {viewDialog.affiliate.referralCode || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Status
                              </label>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full w-fit text-xs font-medium mt-1 ${getStatusColor(viewDialog.affiliate.status)}`}>
                                {getStatusIcon(viewDialog.affiliate.status)}
                                <span className="capitalize">
                                  {viewDialog.affiliate.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            Performance Metrics
                          </h4>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Total Visits
                              </label>
                              <div className="text-lg font-semibold text-gray-900 mt-1">
                                {formatNumber(viewDialog.affiliate.totalVisits)}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Sign Ups
                              </label>
                              <div className="text-lg font-semibold text-gray-900 mt-1">
                                {formatNumber(viewDialog.affiliate.signUps)}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Conversion Rate
                              </label>
                              <div className="text-lg font-semibold text-blue-600 mt-1">
                                {viewDialog.affiliate.conversionRate.toFixed(2)}%
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Commission Rate
                              </label>
                              <div className="text-lg font-semibold text-purple-600 mt-1">
                                {viewDialog.affiliate.commissionRate?.toFixed(1) || '5.0'}%
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Payment Method
                              </label>
                              <div className="text-lg font-semibold text-gray-900 mt-1">
                                {viewDialog.affiliate.paymentMethod || 'Not set'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold mb-4 text-gray-800">
                          Financial Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-blue-600 mb-1">
                              Total Funds Generated
                            </div>
                            <div className="text-xl font-bold text-blue-700">
                              ${formatPrice(viewDialog.affiliate.totalFunds, 2)}
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-green-600 mb-1">
                              Earned Commission
                            </div>
                            <div className="text-xl font-bold text-green-700">
                              ${formatPrice(viewDialog.affiliate.earnedCommission, 2)}
                            </div>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-yellow-600 mb-1">
                              Requested Commission
                            </div>
                            <div className="text-xl font-bold text-yellow-700">
                              ${formatPrice(viewDialog.affiliate.requestedCommission, 2)}
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-purple-600 mb-1">
                              Total Commission
                            </div>
                            <div className="text-xl font-bold text-purple-700">
                              ${formatPrice(viewDialog.affiliate.totalCommission, 2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {}
                      {viewDialog.affiliate.payoutHistory && 
                       viewDialog.affiliate.payoutHistory.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            Payout History
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-3">
                              {viewDialog.affiliate.payoutHistory.map((payout, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                  <div>
                                    <div className="font-medium text-sm">
                                      ${formatPrice(payout.amount, 2)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {payout.method} • {new Date(payout.requestedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                                    {payout.status}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {}
                      <div className="flex gap-3 justify-end pt-4 border-t">
                        {viewDialog.affiliate.requestedCommission > 0 && (
                          <button
                            onClick={() => {
                              setViewDialog({ open: false, affiliate: null });
                              openPayoutDialog(
                                viewDialog.affiliate!.id,
                                viewDialog.affiliate!.requestedCommission,
                                viewDialog.affiliate!.totalCommission,
                                viewDialog.affiliate!.paymentMethod
                              );
                            }}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            <FaMoneyBillWave />
                            Process Payout
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setViewDialog({ open: false, affiliate: null });
                            openStatusDialog(viewDialog.affiliate!.id, viewDialog.affiliate!.status);
                          }}
                          className="btn btn-secondary flex items-center gap-2"
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

export default AffiliateReferralsPage;