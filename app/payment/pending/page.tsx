'use client';

import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { useEffect, useState } from 'react';
import {
  FaClock,
  FaEnvelope,
  FaInfoCircle,
  FaReceipt,
  FaTelegram,
  FaTimes,
  FaWhatsapp,
} from 'react-icons/fa';

// Custom Gradient Spinner Component (matching Profile page)
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Mock hook for demonstration
const useSearchParams = () => {
  return {
    get: (key: string) => {
      const params = {
        invoice_id: 'INV-123456789',
        amount: '500.00',
        transaction_id: 'TRX-987654321',
        phone: '01712345678',
      };
      return params[key as keyof typeof params] || null;
    },
  };
};

const useRouter = () => {
  return {
    push: (path: string) => {
      console.log(`Navigating to: ${path}`);
      // Actual navigation for browser
      window.location.href = path;
    },
  };
};

// Toast Component (matching Profile page style)
const Toast = ({
  message,
  type = 'info',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'info' && <FaInfoCircle className="toast-icon" />}
    {type === 'pending' && <FaClock className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  const invoice_id = searchParams.get('invoice_id');
  const amount = searchParams.get('amount');
  const transaction_id = searchParams.get('transaction_id');
  const phone = searchParams.get('phone');

  // Set document title
  useEffect(() => {
    setPageTitle('Payment Under Review', appName);
  }, [appName]);

  useEffect(() => {
    // Show pending toast only once when component mounts
    setToast({
      message:
        'Payment is being processed and requires manual verification. You will be notified once approved.',
      type: 'info',
    });

    // Auto-hide toast after 5 seconds
    const toastTimer = setTimeout(() => setToast(null), 5000);

    return () => clearTimeout(toastTimer);
  }, []); // Empty dependency array to run only once

  const handleViewTransactions = () => {
    // Pass the pending transaction details as URL parameters
    const params = new URLSearchParams();
    if (invoice_id) params.set('invoice_id', invoice_id);
    if (amount) params.set('amount', amount);
    if (transaction_id) params.set('transaction_id', transaction_id);
    if (phone) params.set('phone', phone);
    params.set('status', 'pending'); // Mark as pending transaction

    const url = `/transactions${
      params.toString() ? '?' + params.toString() : ''
    }`;
    router.push(url);
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/+8801723139610', '_blank');
  };

  return (
    <div className="page-container min-h-screen flex items-center justify-center">
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

      <div className="page-content max-w-2xl mx-auto w-full px-0 lg:px-4">
        {/* Main Pending Card */}
        <div className="card-mobile card card-padding">
          <div className="text-center">
            {/* Pending Icon - Just Clock */}
            <div className="flex justify-center mb-6">
              <FaClock className="lg:w-20 w-16 lg:h-20 h-16 text-orange-500" />
            </div>

            {/* Pending Message */}
            <h2 className="card-title text-center mb-2">Payment Under Review</h2>
            <p className="text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              Your payment is being processed and requires manual verification.
              You will be notified once approved.
            </p>

            {/* Payment Details */}
            {(invoice_id || amount || transaction_id || phone) && (
              <div className="space-y-4 mb-6">
                <div className="card-header">
                  <div className="card-icon">
                    <FaReceipt />
                  </div>
                  <h3 className="card-title">Payment Details</h3>
                </div>

                <div className="space-y-3">
                  {invoice_id && (
                    <div className="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="form-label">Order ID:</span>
                      <span className="font-mono text-sm font-medium">{invoice_id}</span>
                    </div>
                  )}

                  {amount && (
                    <div className="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="form-label">Amount:</span>
                      <span className="font-semibold text-lg text-orange-600 dark:text-orange-400">${amount}</span>
                    </div>
                  )}

                  {transaction_id && (
                    <div className="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="form-label">Transaction ID:</span>
                      <span className="font-mono text-sm font-medium">{transaction_id}</span>
                    </div>
                  )}

                  {phone && (
                    <div className="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="form-label">Phone Number:</span>
                      <span className="font-medium">{phone}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <span className="form-label">Status:</span>
                    <span className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
                      <FaClock className="w-4 h-4" />
                      Pending Review
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                What happens next?
              </h4>
              <div className="text-orange-800 dark:text-orange-200 text-sm space-y-1">
                <p>• Our admin team will review your payment</p>
                <p>• You will receive an email notification once approved</p>
                <p>• Funds will be added to your account automatically</p>
                <p>• This usually takes 1-24 hours</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleViewTransactions}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                View Transactions
              </button>

              <button
                onClick={handleContactSupport}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <FaWhatsapp />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  const { appName } = useAppNameWithFallback();

  return <PaymentPendingContent />;
}