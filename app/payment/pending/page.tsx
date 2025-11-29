'use client';

import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  FaClock,
  FaReceipt,
  FaWhatsapp,
} from 'react-icons/fa';



function PaymentPendingContent() {
  const { appName } = useAppNameWithFallback();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const [invoice_id, setInvoiceId] = useState<string | null>(null);
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    setPageTitle('Payment Under Review', appName);
  }, [appName]);

  // Get invoice_id from sessionStorage (stored when payment was created)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try sessionStorage first (for new payments)
      const storedInvoiceId = sessionStorage.getItem('payment_invoice_id');
      if (storedInvoiceId) {
        setInvoiceId(storedInvoiceId);
        return;
      }
      // Fallback: Check localStorage for backward compatibility
      try {
        const localStorageSession = localStorage.getItem('uddoktapay_session');
        if (localStorageSession) {
          const sessionData = JSON.parse(localStorageSession);
          if (sessionData.invoice_id) {
            setInvoiceId(sessionData.invoice_id);
            // Also store in sessionStorage for consistency
            sessionStorage.setItem('payment_invoice_id', sessionData.invoice_id);
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  // Check authentication and validate payment access
  useEffect(() => {
    if (sessionStatus === 'loading' || !invoice_id || hasValidatedRef.current) return;

    // Check if user is authenticated
    if (sessionStatus === 'unauthenticated' || !session?.user) {
      router.push('/transactions?error=unauthorized');
      return;
    }

    // Validate payment access only once
    if (hasValidatedRef.current) return;
    hasValidatedRef.current = true;

    const validatePayment = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/payment/validate-access?invoice_id=${invoice_id}`);
        const data = await response.json();

        if (data.valid && data.payment) {
          setIsAuthorized(true);
          setPaymentData(data.payment);
          // Clean up sessionStorage after successful validation
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('payment_invoice_id');
          }
        } else {
          // Clean up sessionStorage on error
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('payment_invoice_id');
          }
          // Unauthorized or payment not found
          router.push('/transactions?error=unauthorized');
        }
      } catch (error) {
        console.error('Error validating payment access:', error);
        // Clean up sessionStorage on error
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('payment_invoice_id');
        }
        router.push('/transactions?error=validation_failed');
      } finally {
        setIsLoading(false);
      }
    };

    validatePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, invoice_id, session?.user?.id]);

  const handleViewTransactions = () => {
    const params = new URLSearchParams();
    if (invoice_id) params.set('invoice_id', invoice_id);
    if (paymentData?.amount) params.set('amount', paymentData.amount.toString());
    if (paymentData?.transaction_id) params.set('transaction_id', paymentData.transaction_id);
    if (paymentData?.sender_number) params.set('phone', paymentData.sender_number);
    params.set('status', 'pending');

    const url = `/transactions${
      params.toString() ? '?' + params.toString() : ''
    }`;
    router.push(url);
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/+8801723139610', '_blank');
  };

  // Redirect if unauthorized (but allow rendering during loading)
  if (!isAuthorized && sessionStatus === 'authenticated' && invoice_id && !isLoading) {
    return null;
  }

  return (
    <div className="page-container min-h-screen flex items-center justify-center">
      <div className="page-content max-w-2xl mx-auto w-full px-0 lg:px-4">
        <div className="card-mobile card card-padding">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <FaClock className="lg:w-20 w-16 lg:h-20 h-16 text-orange-500" />
            </div>
            <h2 className="card-title text-center mb-2">Payment Under Review</h2>
            <p className="text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              Your payment is being processed and requires manual verification.
              You will be notified once approved.
            </p>
            {(invoice_id || paymentData?.amount || paymentData?.transaction_id || paymentData?.sender_number) && (
              <div className="space-y-4 mb-6">
                <div className="card-header">
                  <div className="card-icon">
                    <FaReceipt />
                  </div>
                  <h3 className="card-title">Payment Details</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <span className="form-label">Transaction ID:</span>
                    <span className="font-mono text-sm font-medium">{paymentData?.transaction_id || "-"}</span>
                  </div>

                  {paymentData?.amount && (
                    <div className="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="form-label">Amount:</span>
                      <span className="font-semibold text-lg text-orange-600 dark:text-orange-400">
                        ${Number(paymentData.amount).toFixed(2)}
                      </span>
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
  return (
    <Suspense fallback={null}>
      <PaymentPendingContent />
    </Suspense>
  );
}
