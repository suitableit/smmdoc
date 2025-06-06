'use client';

import axiosInstance from '@/lib/axiosInstance';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle, 
  FaSpinner,
  FaEye,
  FaPlus,
  FaCheckDouble,
  FaTimes
} from 'react-icons/fa';

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
    type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
    type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
    type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
    'bg-yellow-50 border-yellow-200 text-yellow-800'
  }`}>
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default function SuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'processing' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying payment...');
  const [amount, setAmount] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams?.get('invoice_id');
  const hasRedirectedRef = useRef(false);
  const verifyAttemptsRef = useRef(0);
  const maxVerifyAttempts = 3;

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'pending' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  useEffect(() => {
    const verifyPayment = async () => {
      // First check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const urlInvoiceId = urlParams.get('invoice_id') || urlParams.get('invoiceId') || urlParams.get('transaction_id');
      
      // Then check localStorage
      const storedInvoiceId = localStorage.getItem('invoice_id');
      
      // Use URL parameter first, then localStorage, then prop
      const finalInvoiceId = urlInvoiceId || storedInvoiceId || invoiceId;
      
      if (finalInvoiceId) {
        console.log("Using invoice ID:", finalInvoiceId, "from:", urlInvoiceId ? 'URL' : storedInvoiceId ? 'localStorage' : 'prop');
        verifyPaymentWithId(finalInvoiceId);
      } else {
        // No invoice ID found anywhere
        setStatus('error');
        setMessage('Invalid payment information. No invoice ID found.');
        setErrorDetails('Cannot verify payment without an invoice ID. Please try again or contact our support team.');
      }
    };
    
    const verifyPaymentWithId = async (id: string) => {
      try {
        // Call our verification API
        showToast('Verifying payment...', 'pending');
        
        // Retrieve order ID from localStorage if it exists
        const storedOrderId = localStorage.getItem('order_id');
        if (storedOrderId) {
          setOrderId(storedOrderId);
          // Clear it after we've retrieved it
          localStorage.removeItem('order_id');
        }
        
        verifyAttemptsRef.current += 1;
        
        console.log("Verifying payment with invoice ID:", id);
        const response = await axiosInstance.get(`/api/payment/verify-payment?invoice_id=${id}`);
        const data = response.data;
        
        console.log("Payment verification response:", data);
        
        if (data.status === 'COMPLETED') {
          setStatus('success');
          setMessage('Payment successful! Funds have been added to your account.');
          if (data.payment?.amount) {
            setAmount(data.payment.amount);
          }
          showToast(`Payment successful! Funds added to your account. Amount: ${data.payment?.amount || 'N/A'} BDT`, 'success');
          
          // Clean up localStorage after successful payment
          localStorage.removeItem('invoice_id');
          localStorage.removeItem('payment_amount');
          localStorage.removeItem('order_id');
          
          // Set a timeout before redirecting to transactions page
          setTimeout(() => {
            if (!hasRedirectedRef.current) {
              hasRedirectedRef.current = true;
              router.push(`/dashboard/user/transactions?status=success&transaction=${id}`);
            }
          }, 4000);
          
        } else if (data.status === 'PENDING') {
          setStatus('processing');
          setMessage('Your payment is being processed and requires manual verification. You will be notified once approved.');
          showToast('Payment requires manual verification. Your transaction is pending admin approval.', 'info');

          // For pending payments, redirect to transactions page immediately
          // Don't retry verification as it requires manual admin approval
          setTimeout(() => {
            if (!hasRedirectedRef.current) {
              hasRedirectedRef.current = true;
              router.push(`/dashboard/user/transactions?status=pending&transaction=${id}`);
            }
          }, 4000);
        } else {
          setStatus('error');
          setMessage(data.message || 'There was a problem with your payment.');
          setErrorDetails(data.error || 'An issue occurred during payment processing. The payment may have been canceled or there was a processing error.');
          showToast('Payment failed! Please try again or contact support', 'error');
          
          // Clean up localStorage after failed payment
          localStorage.removeItem('invoice_id');
          localStorage.removeItem('payment_amount');
          localStorage.removeItem('order_id');
          
          // Redirect to transactions page with failed status
          setTimeout(() => {
            if (!hasRedirectedRef.current) {
              hasRedirectedRef.current = true;
              router.push(`/dashboard/user/transactions?status=failed&transaction=${id}`);
            }
          }, 3000);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        showToast('Payment verification error! Unable to verify payment status. Please contact support.', 'error');
        setStatus('error');
        setMessage('An error occurred while verifying your payment.');
        setErrorDetails('There was a problem connecting to the server or invalid payment information was provided. Please contact support.');
        
        // Clean up localStorage after error
        localStorage.removeItem('invoice_id');
        localStorage.removeItem('payment_amount');
        localStorage.removeItem('order_id');
        
        // Redirect to transactions page with failed status after error
        setTimeout(() => {
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push(`/dashboard/user/transactions?status=failed&transaction=${id || 'unknown'}`);
          }
        }, 3000);
      }
    };
    
    // Verify payment when component mounts
    verifyPayment();
    
    // Cleanup function for redirects
    return () => {
      hasRedirectedRef.current = true;
    };
  }, [router]);

  return (
    <div className="page-container">
      {/* Toast Container */}
      {toastMessage && (
        <Toast 
          message={toastMessage.message} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
        />
      )}
      
      <div className="page-content">
        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <div className="card card-padding text-center">
            {/* Status Icon */}
            <div className="mb-6">
              {status === 'success' && (
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
              )}
              {status === 'processing' && (
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <FaClock className="w-10 h-10 text-yellow-600 animate-pulse" />
                </div>
              )}
              {status === 'error' && (
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-red-200 rounded-full animate-pulse opacity-75"></div>
                  <div className="relative w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <FaExclamationTriangle className="w-10 h-10 text-red-600" />
                  </div>
                </div>
              )}
              {status === 'verifying' && (
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-2 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-4 border-4 border-t-blue-800 border-l-blue-800 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Status Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {status === 'success' && 'Payment Successful!'}
              {status === 'processing' && 'Payment Under Review'}
              {status === 'error' && 'Payment Failed'}
              {status === 'verifying' && 'Verifying Payment'}
            </h1>

            {/* Status Message */}
            <p className="text-lg text-gray-600 mb-4">{message}</p>

            {/* Additional Status Info */}
            {status === 'success' && (
              <p className="text-sm text-green-600 mb-6">
                Funds have been added to your account. You will be redirected to the transactions page in a few seconds...
              </p>
            )}
            {status === 'processing' && (
              <p className="text-sm text-yellow-600 mb-6">
                Your payment is pending admin approval. You will receive an email notification once it's processed.
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-600 mb-6">
                You will be redirected to the transactions page in a few seconds...
              </p>
            )}
          </div>

          {/* Payment Details */}
          {(status === 'success' || status === 'processing') && (
            <div className="card card-padding mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCheckDouble className="text-blue-600" />
                Payment Details
              </h3>
              <div className="space-y-3">
                {invoiceId && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Invoice ID:</span>
                    <span className="text-sm font-mono text-gray-900">{invoiceId}</span>
                  </div>
                )}
                {orderId && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Order ID:</span>
                    <span className="text-sm font-mono text-gray-900">{orderId}</span>
                  </div>
                )}
                {amount !== null && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Amount:</span>
                    <span className="text-lg font-semibold text-gray-900">{amount} BDT</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {status === 'success' ? (
                      <>
                        <FaCheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </>
                    ) : (
                      <>
                        <FaClock className="w-3 h-3 mr-1" />
                        Processing
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Details */}
          {status === 'error' && (
            <div className="card card-padding mt-6 border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-600" />
                Error Details
              </h3>
              <p className="text-sm text-red-700 mb-4">
                {errorDetails || 'There was a problem processing your payment. Please try again or contact our support team.'}
              </p>
              {invoiceId && (
                <div className="pt-3 border-t border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-700">Invoice ID:</span>
                    <span className="text-sm font-mono text-red-800">{invoiceId}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/dashboard/user/transactions"
              className="btn btn-secondary flex items-center justify-center gap-2"
            >
              <FaEye className="w-4 h-4" />
              View Transactions
            </Link>
            <Link
              href="/dashboard/user/add-funds"
              className={`btn flex items-center justify-center gap-2 ${
                status === 'error' 
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                  : 'btn-primary'
              }`}
            >
              <FaPlus className="w-4 h-4" />
              {status === 'error' ? 'Try Again' : 'Add More Funds'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}