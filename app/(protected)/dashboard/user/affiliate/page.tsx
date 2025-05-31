import AffiliateStats from '@/components/user/affiliate/AffiliateStats';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Program',
  description: 'Join our affiliate program and earn commission',
};

export default function AffiliatePage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Affiliate Program</h1>
        <p className="text-gray-500">
          Share your referral link and earn commission from each referral
        </p>
      </div>
      
      <AffiliateStats />
      
      <div className="bg-white rounded-lg border p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">About the Affiliate Program</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">How it works?</h3>
            <p className="text-gray-600">
              Share your unique referral link. When someone signs up using your link and places an order, you'll receive a 1% commission on their order.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Payments</h3>
            <p className="text-gray-600">
              When your earnings reach $100 or more, you can request a payment. Payments are processed monthly.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Terms and Conditions</h3>
            <ul className="list-disc pl-5 text-gray-600">
              <li>You cannot use your own referral link on your account</li>
              <li>Spamming or unethical promotion is prohibited</li>
              <li>You can use social media, email, blogs, etc. to share your referral link</li>
              <li>The affiliate program is subject to change at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 