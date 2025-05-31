'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { Coins, Copy, Percent, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    minimumPayout: '$100.00'
  });
  
  // Generate referral link based on user's ID
  const referralLink = user?.id ? `https://smmgen.com/ref/${user.id}` : '';
  
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
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopied(true);
        toast.success('Referral link copied!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        toast.error('Failed to copy');
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="space-y-6">
      {/* Top stats with icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Username */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
          <div className="bg-purple-600 rounded-full p-3">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">{user?.name || ''}</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
          <div className="bg-purple-600 rounded-full p-3">
            <Copy className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">Referral link</p>
            <div className="flex items-center">
              <p className="truncate font-medium">{referralLink || 'Login to generate your referral link'}</p>
              {referralLink && (
                <button 
                  onClick={copyToClipboard} 
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Commission Rate */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
          <div className="bg-purple-600 rounded-full p-3">
            <Percent className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commission rate</p>
            <p className="font-medium">{stats.commissionRate}</p>
          </div>
        </div>

        {/* Minimum Payout */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
          <div className="bg-purple-600 rounded-full p-3">
            <Coins className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Minimum payout</p>
            <p className="font-medium">{stats.minimumPayout}</p>
          </div>
        </div>
      </div>

      {/* Stats boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Visits */}
        <div className="bg-white rounded-lg border p-4">
          <p className="text-gray-500">Visits</p>
          <p className="text-xl font-medium">{stats.visits}</p>
        </div>

        {/* Registrations */}
        <div className="bg-white rounded-lg border p-4">
          <p className="text-gray-500">Registrations</p>
          <p className="text-xl font-medium">{stats.registrations}</p>
        </div>

        {/* Referrals */}
        <div className="bg-white rounded-lg border p-4">
          <p className="text-gray-500">Referrals</p>
          <p className="text-xl font-medium">{stats.referrals}</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-lg border p-4">
          <p className="text-gray-500">Conversion rate</p>
          <p className="text-xl font-medium">{stats.conversionRate}</p>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-lg border p-4">
          <p className="text-gray-500">Total earnings</p>
          <p className="text-xl font-medium">{stats.totalEarnings}</p>
        </div>

        {/* Available Earnings */}
        <div className="bg-white rounded-lg border p-4">
          <p className="text-gray-500">Available earnings</p>
          <p className="text-xl font-medium">{stats.availableEarnings}</p>
        </div>
      </div>
    </div>
  );
} 