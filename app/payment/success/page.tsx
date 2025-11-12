'use client';

import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaReceipt,
  FaTelegram,
  FaTimes,
  FaWallet,
  FaWhatsapp,
} from 'react-icons/fa';
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);
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

function PaymentSuccessContent() {
  const { appName } = useAppNameWithFallback();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  const invoice_id = searchParams?.get('invoice_id');
  const amount = searchParams?.get('amount');
  const transaction_id = searchParams?.get('transaction_id');
  const phone = searchParams?.get('phone');
  useEffect(() => {
    setPageTitle('Payment Success', appName);
  }, [appName]);

  useEffect(() => {
    setToast({
      message: 'Payment successful! Funds have been added to your account.',
      type: 'success',
    });
    const toastTimer = setTimeout(() => setToast(null), 5000);

    return () => clearTimeout(toastTimer);
  }, []);

  const handleViewTransactions = () => {
    const params = new URLSearchParams();
    if (invoice_id) params.set('invoice_id', invoice_id);
    if (amount) params.set('amount', amount);
    if (transaction_id) params.set('transaction_id', transaction_id);
    if (phone) params.set('phone', phone);
    params.set('status', 'success');

    const url = `/transactions${
      params.toString() ? '?' + params.toString() : ''
    }`;
    router.push(url);
  };

  const handleAddMoreFunds = () => {
    router.push('/add-funds');
  };

  return (
    <div className="page-container min-h-screen flex items-center justify-center">
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
        <div className="card-mobile card card-padding">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <FaCheckCircle className="lg:w-20 w-16 lg:h-20 h-16 text-green-500" />
            </div>
            <h2 className="card-title text-center mb-2">Payment Completed!</h2>
            <p className="text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              Funds have been successfully added to your account.
            </p>
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
                      <span className="font-semibold text-lg text-green-600 dark:text-green-400">${amount}</span>
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
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                      <FaCheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Your account balance has been updated successfully. You can now
                use your funds to place orders.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleViewTransactions}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                View Transactions
              </button>

              <button
                onClick={handleAddMoreFunds}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <FaWallet />
                Add More Funds
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {

  return (
    <Suspense
      fallback={
        <div className="page-container">
          <div className="page-content">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center flex flex-col items-center">
                <GradientSpinner size="w-12 h-12" className="mb-3" />
                <div className="text-base font-medium">Loading payment details...</div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}