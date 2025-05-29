'use client';
import axiosInstance from '@/lib/axiosInstance';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [invoiceId, setInvoiceId] = useState('');
  const [status, setStatus] = useState<
    'LOADING' | 'SUCCESS' | 'ALREADY_VERIFIED' | 'FAILED' | 'MISSING'
  >('LOADING');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('invoice_id') || '';

  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (orderId && !hasVerifiedRef.current) {
      setInvoiceId(orderId);
      verifyAndSavePayment(orderId);
      hasVerifiedRef.current = true;
    } else if (!orderId) {
      toast.error('❌ Invoice ID is missing. Please contact support.');
      setStatus('MISSING');
    }
  }, [orderId]);

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
        <p className="text-blue-500 mt-4">Verifying payment...</p>
      )}
      {status === 'SUCCESS' && (
        <p className="text-green-600 mt-4">
          ✅ Your payment has been verified and recorded.
        </p>
      )}
      {status === 'ALREADY_VERIFIED' && (
        <p className="text-orange-500 mt-4">
          ℹ️ This payment was already verified.
        </p>
      )}
      {status === 'FAILED' && (
        <p className="text-red-600 mt-4">
          ❌ Verification failed. Please contact support.
        </p>
      )}
      {status === 'MISSING' && (
        <p className="text-red-600 mt-4">❌ No invoice ID found in the URL.</p>
      )}
    </div>
  );
}
