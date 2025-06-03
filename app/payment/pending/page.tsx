'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { Suspense } from 'react';
import { toast } from 'sonner';

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  const invoice_id = searchParams.get('invoice_id');
  const amount = searchParams.get('amount');
  const transaction_id = searchParams.get('transaction_id');

  useEffect(() => {
    // Show pending toast
    toast.info('Payment is being processed and requires manual verification. You will be notified once approved.', {
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

  const handleContactSupport = () => {
    window.open('https://wa.me/+8801723139610', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Pending Icon */}
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>

          {/* Pending Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h1>
          <p className="text-gray-600 mb-6">
            Payment is being processed and requires manual verification. You will be notified once approved.
          </p>

          {/* Payment Details */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Payment Details</h3>
            <div className="space-y-2">
              {invoice_id && (
                <div className="flex justify-between">
                  <span className="text-yellow-700">Order ID:</span>
                  <span className="font-mono text-sm text-yellow-900">{invoice_id}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between">
                  <span className="text-yellow-700">Amount:</span>
                  <span className="font-bold text-yellow-900">৳ {amount}</span>
                </div>
              )}
              {transaction_id && (
                <div className="flex justify-between">
                  <span className="text-yellow-700">Transaction ID:</span>
                  <span className="font-mono text-sm text-yellow-900">{transaction_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-yellow-700">Status:</span>
                <span className="font-bold text-yellow-900">⏳ Pending Review</span>
              </div>
            </div>
          </div>

          {/* Information Message */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
            <ul className="text-blue-700 text-sm text-left space-y-1">
              <li>• Our admin team will review your payment</li>
              <li>• You will receive an email notification once approved</li>
              <li>• Funds will be added to your account automatically</li>
              <li>• This usually takes 1-24 hours</li>
            </ul>
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
              onClick={handleContactSupport}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
            >
              Contact Support
            </button>
          </div>

          {/* Auto Redirect Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Automatically redirecting to transactions in {countdown} seconds...
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Notes</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              Your payment is being manually verified for security
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              Please ensure your transaction details are correct
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              You will receive email confirmation once approved
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              Contact support if you have any questions
            </li>
          </ul>
        </div>

        {/* Support Info */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your payment, feel free to contact our support team:
          </p>
          <div className="grid grid-cols-1 gap-3">
            <a 
              href="https://wa.me/+8801723139610" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-md transition duration-200"
            >
              <span className="mr-2">📱</span>
              WhatsApp: +8801723139610
            </a>
            <a 
              href="https://t.me/Smmdoc" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-md transition duration-200"
            >
              <span className="mr-2">💬</span>
              Telegram: @Smmdoc
            </a>
            <a 
              href="mailto:support@example.com"
              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition duration-200"
            >
              <span className="mr-2">📧</span>
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}
