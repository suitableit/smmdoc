'use client';

import { useEffect, useState } from 'react';
import {
  FaClock,
  FaEnvelope,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPhone,
  FaReceipt,
  FaTelegram,
  FaTimes,
  FaWhatsapp,
} from 'react-icons/fa';

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

// Toast Component
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

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'info'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

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

    const url = `/transactions${
      params.toString() ? '?' + params.toString() : ''
    }`;
    router.push(url);
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/+8801723139610', '_blank');
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
          <h1 className="page-title">Payment Pending</h1>
          <p className="page-description">
            Your payment is being processed and under review
          </p>
        </div>

        {/* Main Pending Card */}
        <div className="card card-padding">
          <div className="text-center">
            {/* Pending Icon */}
            <div className="pending-icon">
              <FaClock />
            </div>

            {/* Pending Message */}
            <h2 className="card-title text-center">Payment Under Review</h2>
            <p
              className="text-center"
              style={{ color: '#64748b', marginBottom: '1.5rem' }}
            >
              Your payment is being processed and requires manual verification.
              You will be notified once approved.
            </p>

            {/* Payment Details */}
            {(invoice_id || amount || transaction_id) && (
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

                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="status-pending">
                    <FaClock />
                    Pending Review
                  </span>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="info-box">
              <h4
                className="font-semibold"
                style={{ color: '#1e40af', marginBottom: '0.5rem' }}
              >
                What happens next?
              </h4>
              <ul className="info-list">
                <li>• Our admin team will review your payment</li>
                <li>• You will receive an email notification once approved</li>
                <li>• Funds will be added to your account automatically</li>
                <li>• This usually takes 1-24 hours</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleViewTransactions}
                className="btn btn-primary"
              >
                <FaReceipt style={{ marginRight: '0.5rem' }} />
                View Transactions
              </button>

              <button
                onClick={handleContactSupport}
                className="btn btn-secondary"
              >
                <FaWhatsapp style={{ marginRight: '0.5rem' }} />
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Important Notes Card */}
        <div className="card card-padding">
          <div className="card-header">
            <div className="card-icon">
              <FaExclamationTriangle />
            </div>
            <h3 className="card-title">Important Notes</h3>
          </div>

          <ul className="features-list">
            <li className="feature-item">
              <FaClock className="feature-icon" />
              <span>Your payment is being manually verified for security</span>
            </li>
            <li className="feature-item">
              <FaClock className="feature-icon" />
              <span>Please ensure your transaction details are correct</span>
            </li>
            <li className="feature-item">
              <FaClock className="feature-icon" />
              <span>You will receive email confirmation once approved</span>
            </li>
            <li className="feature-item">
              <FaClock className="feature-icon" />
              <span>Contact support if you have any questions</span>
            </li>
          </ul>
        </div>

        {/* Support Card */}
        <div className="card card-padding">
          <div className="card-header">
            <div className="card-icon">
              <FaPhone />
            </div>
            <h3 className="card-title">Need Help?</h3>
          </div>

          <p
            style={{
              color: '#64748b',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            If you have any questions about your payment, feel free to contact
            our support team:
          </p>

          <div className="support-grid">
            <a
              href="https://wa.me/+8801723139610"
              target="_blank"
              rel="noopener noreferrer"
              className="support-card whatsapp"
            >
              <FaWhatsapp className="support-card-icon" />
              <div>
                <div className="support-card-title">WhatsApp</div>
                <div className="support-card-subtitle">+8801723139610</div>
              </div>
            </a>

            <a
              href="https://t.me/Smmdoc"
              target="_blank"
              rel="noopener noreferrer"
              className="support-card telegram"
            >
              <FaTelegram className="support-card-icon" />
              <div>
                <div className="support-card-title">Telegram</div>
                <div className="support-card-subtitle">@Smmdoc</div>
              </div>
            </a>

            <a href="mailto:support@example.com" className="support-card email">
              <FaEnvelope className="support-card-icon" />
              <div>
                <div className="support-card-title">Email</div>
                <div className="support-card-subtitle">support@example.com</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return <PaymentPendingContent />;
}
