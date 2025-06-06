'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Suspense } from 'react';

function UddoktaPayVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [phone, setPhone] = useState('');
  const [responseType, setResponseType] = useState('pending');
  const [paymentSession, setPaymentSession] = useState(null);

  let invoice_id = searchParams.get('invoice_id');
  let amount = searchParams.get('amount');

  useEffect(() => {
    console.log('Search params:', { invoice_id, amount });
    console.log('Current URL:', window.location.href);
    console.log('Search string:', window.location.search);

    // If no URL parameters, try to get from localStorage
    if (!invoice_id || !amount) {
      const storedSession = localStorage.getItem('uddoktapay_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          console.log('Found stored session:', session);
          setPaymentSession(session);
          invoice_id = session.invoice_id;
          amount = session.amount;
          // Auto-populate phone number if available
          if (session.phone) {
            setPhone(session.phone);
          }
        } catch (error) {
          console.error('Error parsing stored session:', error);
        }
      }
    } else {
      // Store session in localStorage for fallback
      const session = { invoice_id, amount };
      localStorage.setItem('uddoktapay_session', JSON.stringify(session));
      setPaymentSession(session);
    }

    if (!invoice_id) {
      console.log('No invoice_id found, redirecting...');
      toast.error('Invalid payment session');
      setTimeout(() => {
        router.push('/dashboard/user/add-funds');
      }, 1000);
    }
  }, [invoice_id, amount, router]);

  const handleVerify = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    if (!phone.trim()) {
      toast.error('Please enter phone number');
      return;
    }

    // Get current session data
    const currentInvoiceId = invoice_id || paymentSession?.invoice_id;
    const currentAmount = amount || paymentSession?.amount;

    if (!currentInvoiceId) {
      toast.error('Invalid payment session');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/payment/uddoktapay-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: currentInvoiceId,
          transaction_id: transactionId,
          phone,
          response_type: responseType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'COMPLETED') {
          // Success - redirect to success page
          const successUrl = `/payment/success?invoice_id=${currentInvoiceId}&amount=${currentAmount}&transaction_id=${transactionId}&phone=${phone}`;
          router.push(successUrl);
        } else if (data.status === 'PENDING') {
          // Pending - redirect to pending page
          const pendingUrl = `/payment/pending?invoice_id=${currentInvoiceId}&amount=${currentAmount}&transaction_id=${transactionId}&phone=${phone}`;
          router.push(pendingUrl);
        } else {
          // Cancelled/Failed
          toast.error('Payment verification failed or was cancelled');
          setTimeout(() => {
            router.push('/dashboard/user/transactions');
          }, 2000);
        }
      } else {
        toast.error(data.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Get display data
  const displayInvoiceId = invoice_id || paymentSession?.invoice_id;
  const displayAmount = amount || paymentSession?.amount;

  if (!displayInvoiceId && !paymentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Payment Session</h1>
          <p className="text-gray-600">Redirecting to add funds page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">UddoktaPay Sandbox</h1>
            <p className="text-gray-600 mt-2">Verify your payment transaction</p>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Invoice ID:</span>
              <span className="font-mono text-sm">{displayInvoiceId}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-lg text-blue-600">৳ {displayAmount}</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Transaction ID
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter Transaction ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Phone Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Type (Sandbox)
              </label>
              <select
                value={responseType}
                onChange={(e) => setResponseType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'VERIFY'
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Sandbox Instructions:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>Pending:</strong> Payment will require manual admin approval</li>
              <li>• <strong>Completed:</strong> Payment will be automatically approved and balance added</li>
              <li>• <strong>Cancelled:</strong> Payment will be marked as failed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UddoktaPayVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment verification...</p>
        </div>
      </div>
    }>
      <UddoktaPayVerifyContent />
    </Suspense>
  );
}
