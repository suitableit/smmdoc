'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useEffect, useState } from 'react';
import { APP_NAME } from '@/lib/constants'; // Added import for APP_NAME
import {
  FaChartLine,
  FaCoins,
  FaCopy,
  FaDollarSign,
  FaMousePointer,
  FaPercent,
  FaUsers,
  FaFile,
  FaCheckCircle,
  FaUser,
  FaLink,
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

function AffiliateStatsCards() {
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
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {user?.username || user?.email?.split('@')[0] || 'User'}
              </p>
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
              <div className="flex items-center">
                <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                  {referralLink ? referralLink.replace('https://', '') : 'Login to generate'}
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
        </div>

        {/* Commission Rate Card */}
        <div className="card card-padding">
          <div className="card-content">
            <div className="card-icon">
              <FaPercent />
            </div>
            <div>
              <h3 className="card-title">Commission Rate</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {stats.commissionRate}
              </p>
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
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {stats.minimumPayout}
              </p>
            </div>
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
                  {stats.visits}
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
                  {stats.registrations}
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
                  {stats.referrals}
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
                  {stats.conversionRate}
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
                  {stats.totalEarnings}
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
                  {stats.availableEarnings}
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

export default function AffiliateProgram() {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Affiliate Program — ${APP_NAME}`;
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f2f6] dark:bg-[#232333] transition-colors duration-200">
        <div className="space-y-6">
          
          {/* Affiliate Stats Component */}
          <AffiliateStatsCards />
          
          {/* About the Affiliate Program Card */}
          <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                  <FaUsers className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  About the Affiliate Program
                </h2>
              </div>
              
              <div className="space-y-6">
                
                {/* How it works section */}
                <div className="bg-gray-50 dark:bg-[#1e1f2e] rounded-lg p-5 border border-gray-200 dark:border-gray-600 shadow-sm transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                      <FaUsers className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      How it works?
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Share your unique referral link. When someone signs up using your link and places an order, you'll receive a 1% commission on their order.
                  </p>
                </div>
                
                {/* Payments section */}
                <div className="bg-gray-50 dark:bg-[#1e1f2e] rounded-lg p-5 border border-gray-200 dark:border-gray-600 shadow-sm transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                      <FaDollarSign className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Payments
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    When your earnings reach $100 or more, you can request a payment. Payments are processed monthly.
                  </p>
                </div>
                
                {/* Terms and Conditions section */}
                <div className="bg-gray-50 dark:bg-[#1e1f2e] rounded-lg p-5 border border-gray-200 dark:border-gray-600 shadow-sm transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                      <FaFile className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Terms and Conditions
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300">
                        You cannot use your own referral link on your account
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300">
                        Spamming or unethical promotion is prohibited
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300">
                        You can use social media, email, blogs, etc. to share your referral link
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300">
                        The affiliate program is subject to change at any time
                      </p>
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