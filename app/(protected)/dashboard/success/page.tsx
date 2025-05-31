'use client';
import axiosInstance from '@/lib/axiosInstance';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [invoiceId, setInvoiceId] = useState('');
  const [status, setStatus] = useState<
    'LOADING' | 'SUCCESS' | 'ALREADY_VERIFIED' | 'FAILED' | 'MISSING'
  >('LOADING');
  const searchParamsObj = useSearchParams();
  const router = useRouter();
  const orderId = searchParamsObj?.get('invoice_id') || '';

  const hasVerifiedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (orderId && !hasVerifiedRef.current) {
      setInvoiceId(orderId);
      verifyAndSavePayment(orderId);
      hasVerifiedRef.current = true;
    } else if (!orderId) {
      toast.error('❌ Invoice ID is missing. Please contact support.');
      setStatus('MISSING');
    }

    // Cleanup function
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [orderId]);

  useEffect(() => {
    // Redirect to transactions page after successful verification
    if (status === 'SUCCESS' || status === 'ALREADY_VERIFIED') {
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard/user/transactions?status=success&transaction=' + invoiceId);
      }, 2000); // 2 second delay to show success message
    }
  }, [status, router, invoiceId]);

  const verifyAndSavePayment = async (invoice_id: string) => {
    try {
      const res = await axiosInstance.get(
        `/api/payment/verify-payment?invoice_id=${invoice_id}`
      );
      if (res?.data?.status === 'COMPLETED') {
        toast.success('✅ Payment verified successfully!');
        setStatus('SUCCESS');
      } else if (res?.data?.message === 'Payment already verified') {
        toast.info('ℹ️ Payment already verified.');
        setStatus('ALREADY_VERIFIED');
      } else {
        toast.error(
          '❌ Payment status: ' + res?.data?.status || 'Unknown error'
        );
        setStatus('FAILED');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('❌ Payment verification failed. Please contact support.');
      setStatus('FAILED');
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-semibold mb-2">Payment Status</h1>
      <p className="text-gray-700">
        Invoice ID: <strong>{invoiceId}</strong>
      </p>

      {status === 'LOADING' && (
        <div className="mt-4">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-500 rounded-full" role="status" aria-label="loading"></div>
          <p className="text-blue-500 mt-2">Verifying payment...</p>
        </div>
      )}
      {status === 'SUCCESS' && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-4 rounded">
          <p className="flex items-center">
            <span className="text-xl mr-2">✅</span>
            <span>Your payment has been verified and recorded successfully!</span>
          </p>
          <p className="mt-2 text-sm">Redirecting to transactions page...</p>
        </div>
      )}
      {status === 'ALREADY_VERIFIED' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4 rounded">
          <p className="flex items-center">
            <span className="text-xl mr-2">ℹ️</span>
            <span>This payment was already verified.</span>
          </p>
          <p className="mt-2 text-sm">Redirecting to transactions page...</p>
        </div>
      )}
      {status === 'FAILED' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded">
          <p className="flex items-center">
            <span className="text-xl mr-2">❌</span>
            <span>Verification failed. Please contact support.</span>
          </p>
        </div>
      )}
      {status === 'MISSING' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded">
          <p className="flex items-center">
            <span className="text-xl mr-2">❌</span>
            <span>No invoice ID found in the URL.</span>
          </p>
        </div>
      )}
    </div>
  );
}
