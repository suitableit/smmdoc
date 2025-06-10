'use client';

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

// Toast Component
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
    // Show success toast only once when component mounts
    setToast({
      message: 'Payment successful! Funds have been added to your account.',
      type: 'success',
    });

    // Auto-hide toast after 5 seconds
    const toastTimer = setTimeout(() => setToast(null), 5000);

    return () => clearTimeout(toastTimer);
  }, []); // Empty dependency array to run only once

  const handleViewTransactions = () => {
    // Pass the successful transaction details as URL parameters
    const params = new URLSearchParams();
    if (invoice_id) params.set('invoice_id', invoice_id);
    if (amount) params.set('amount', amount);
    if (transaction_id) params.set('transaction_id', transaction_id);
    if (phone) params.set('phone', phone);
    params.set('status', 'success'); // Mark as successful transaction

    const url = `/transactions${
      params.toString() ? '?' + params.toString() : ''
    }`;
    router.push(url);
  };

  const handleAddMoreFunds = () => {
    router.push('/add-funds');
  };

  return (
    <div className="page-container">
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

      <div className="page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Payment Successful!</h1>
          <p className="page-description">
            Your transaction has been completed successfully
          </p>
        </div>

        {/* Main Success Card */}
        <div className="card card-padding">
          <div className="text-center">
            {/* Success Icon */}
            <div className="success-icon">
              <FaCheckCircle />
            </div>

            {/* Success Message */}
            <h2 className="card-title text-center">Payment Completed!</h2>
            <p
              className="text-center"
              style={{ color: '#64748b', marginBottom: '1.5rem' }}
            >
              Funds have been successfully added to your account.
            </p>

            {/* Payment Details */}
            {(invoice_id || amount || transaction_id || phone) && (
              <div className="details-grid">
                <h3
                  className="font-semibold"
                  style={{ color: '#1e293b', marginBottom: '1rem' }}
                >
                  Payment Details
                </h3>

                {invoice_id && (
                  <div className="detail-row">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{invoice_id}</span>
                  </div>
                )}

                {amount && (
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">${amount}</span>
                  </div>
                )}

                {transaction_id && (
                  <div className="detail-row">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value">{transaction_id}</span>
                  </div>
                )}

                {phone && (
                  <div className="detail-row">
                    <span className="detail-label">Phone Number:</span>
                    <span className="detail-value">{phone}</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="status-success">
                    <FaCheckCircle />
                    Completed
                  </span>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="info-box">
              <p className="info-text">
                Your account balance has been updated successfully. You can now
                use your funds to place orders.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleViewTransactions}
                className="btn btn-primary"
              >
                <FaReceipt style={{ marginRight: '0.5rem' }} />
                View Transactions
                <FaArrowRight style={{ marginLeft: '0.5rem' }} />
              </button>

              <button
                onClick={handleAddMoreFunds}
                className="btn btn-secondary"
              >
                <FaWallet style={{ marginRight: '0.5rem' }} />
                Add More Funds
              </button>
            </div>
          </div>
        </div>

        {/* What's Next Card */}
        <div className="card card-padding">
          <div className="card-header">
            <div className="card-icon">
              <FaReceipt />
            </div>
            <h3 className="card-title">What's Next?</h3>
          </div>

          <ul className="features-list">
            <li className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Your account balance has been updated</span>
            </li>
            <li className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>You can now place orders using your balance</span>
            </li>
            <li className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Check your email for payment confirmation</span>
            </li>
            <li className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>View transaction history anytime in your dashboard</span>
            </li>
          </ul>
        </div>

        {/* Support Card */}
        <div className="card card-padding">
          <div className="text-center">
            <h3
              className="font-semibold"
              style={{ color: '#1e293b', marginBottom: '1rem' }}
            >
              Need Help?
            </h3>
            <p
              style={{
                color: '#64748b',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              Our support team is here to assist you
            </p>

            <div className="support-links">
              <a href="https://wa.me/+8801723139610" className="support-link">
                <FaWhatsapp />
                WhatsApp
              </a>
              <a href="https://t.me/Smmdoc" className="support-link">
                <FaTelegram />
                Telegram
              </a>
              <a href="mailto:support@example.com" className="support-link">
                <FaEnvelope />
                Email
              </a>
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
