import AffiliateStats from '@/components/user/affiliate/AffiliateStats';
import { Metadata } from 'next';
import { FaUsers, FaDollarSign, FaFile, FaCheckCircle } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Affiliate Program',
  description: 'Join our affiliate program and earn commission',
};

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-[#f1f2f6] dark:bg-[#232333] transition-colors duration-200">
      <div className="mx-auto">
        
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Affiliate Program</h1>
          <p className="text-gray-600 dark:text-gray-300">Share your referral link and earn commission from each referral</p>
        </div>
        
        <div className="space-y-6">
          
          {/* Affiliate Stats Component */}
          <AffiliateStats />
          
          {/* About the Affiliate Program Card */}
          <div className="bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                  <FaUsers className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">About the Affiliate Program</h2>
              </div>
              
              <div className="space-y-6">
                
                {/* How it works section */}
                <div className="bg-white dark:bg-[#2a2b40] rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                      <FaUsers className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How it works?</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Share your unique referral link. When someone signs up using your link and places an order, you'll receive a 1% commission on their order.
                  </p>
                </div>
                
                {/* Payments section */}
                <div className="bg-white dark:bg-[#2a2b40] rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                      <FaDollarSign className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payments</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    When your earnings reach $100 or more, you can request a payment. Payments are processed monthly.
                  </p>
                </div>
                
                {/* Terms and Conditions section */}
                <div className="bg-white dark:bg-[#2a2b40] rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg flex items-center justify-center">
                      <FaFile className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Terms and Conditions</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300">You cannot use your own referral link on your account</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300">Spamming or unethical promotion is prohibited</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300">You can use social media, email, blogs, etc. to share your referral link</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300">The affiliate program is subject to change at any time</p>
                    </div>
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