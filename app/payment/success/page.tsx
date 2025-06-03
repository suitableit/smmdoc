'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';
import { toast } from 'sonner';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  const invoice_id = searchParams.get('invoice_id');
  const amount = searchParams.get('amount');
  const transaction_id = searchParams.get('transaction_id');

  useEffect(() => {
    // Show success toast
    toast.success('Payment successful! Funds have been added to your account.', {
      position: 'top-right',
      duration: 5000,
    });

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard/user/transactions');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleViewTransactions = () => {
    router.push('/dashboard/user/transactions');
  };

  const handleAddMoreFunds = () => {
    router.push('/dashboard/user/add-funds');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Payment successful! Funds have been added to your account.
          </p>

          {/* Payment Details */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Payment Details</h3>
            <div className="space-y-2">
              {invoice_id && (
                <div className="flex justify-between">
                  <span className="text-green-700">Order ID:</span>
                  <span className="font-mono text-sm text-green-900">{invoice_id}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between">
                  <span className="text-green-700">Amount:</span>
                  <span className="font-bold text-green-900">৳ {amount}</span>
                </div>
              )}
              {transaction_id && (
                <div className="flex justify-between">
                  <span className="text-green-700">Transaction ID:</span>
                  <span className="font-mono text-sm text-green-900">{transaction_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-green-700">Status:</span>
                <span className="font-bold text-green-900">✓ Completed</span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              Funds have been added to your account. You will be redirected to the transactions page in a few seconds...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleViewTransactions}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
            >
              View Transactions
            </button>
            
            <button
              onClick={handleAddMoreFunds}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-md transition duration-200"
            >
              Add More Funds
            </button>
          </div>

          {/* Auto Redirect Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Automatically redirecting in {countdown} seconds...
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Your account balance has been updated
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              You can now place orders using your balance
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Check your email for payment confirmation
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              View transaction history anytime in your dashboard
            </li>
          </ul>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Need help?</p>
          <div className="flex justify-center space-x-4 text-sm">
            <a href="https://wa.me/+8801723139610" className="text-green-600 hover:text-green-700">
              WhatsApp
            </a>
            <a href="https://t.me/Smmdoc" className="text-blue-600 hover:text-blue-700">
              Telegram
            </a>
            <a href="mailto:support@example.com" className="text-gray-600 hover:text-gray-700">
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
