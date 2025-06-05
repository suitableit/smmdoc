'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useEffect, useState } from 'react';
import {
  FaChartLine,
  FaCoins,
  FaCopy,
  FaDollarSign,
  FaMousePointer,
  FaPercent,
  FaUsers,
} from 'react-icons/fa';
import { toast } from 'sonner';

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

export default function AffiliateStats() {
  const user = useCurrentUser();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
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
        toast.error('Error loading affiliate stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setCopied(true);
        toast.success('Referral link copied!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast.error('Failed to copy');
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="space-y-6">
      {/* Top stats with icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Username */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex items-center space-x-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
            <FaUsers className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Username
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.name || ''}
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex items-center space-x-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
            <FaCopy className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Referral link
            </p>
            <div className="flex items-center">
              <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                {referralLink || 'Login to generate your referral link'}
              </p>
              {referralLink && (
                <button
                  onClick={copyToClipboard}
                  className="ml-2 text-[#5F1DE8] hover:text-[#B131F8] dark:text-[#B131F8] dark:hover:text-[#5F1DE8] transition-colors duration-200"
                  title={copied ? 'Copied!' : 'Copy link'}
                >
                  <FaCopy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Commission Rate */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex items-center space-x-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
            <FaPercent className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Commission rate
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.commissionRate}
            </p>
          </div>
        </div>

        {/* Minimum Payout */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex items-center space-x-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
            <FaCoins className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Minimum payout
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.minimumPayout}
            </p>
          </div>
        </div>
      </div>

      {/* Stats boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Visits */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
              <FaMousePointer className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Visits
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.visits}
          </p>
        </div>

        {/* Registrations */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
              <FaUsers className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Registrations
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.registrations}
          </p>
        </div>

        {/* Referrals */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
              <FaUsers className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Referrals
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.referrals}
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
              <FaChartLine className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Conversion rate
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.conversionRate}
          </p>
        </div>

        {/* Total Earnings */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
              <FaDollarSign className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total earnings
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalEarnings}
          </p>
        </div>

        {/* Available Earnings */}
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
              <FaCoins className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Available earnings
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.availableEarnings}
          </p>
        </div>
      </div>
    </div>
  );
}
