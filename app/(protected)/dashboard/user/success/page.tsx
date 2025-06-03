'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axiosInstance from '@/lib/axiosInstance';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function SuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'processing' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying payment...');
  const [amount, setAmount] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams?.get('invoice_id');
  const hasRedirectedRef = useRef(false);
  const verifyAttemptsRef = useRef(0);
  const maxVerifyAttempts = 3;

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
        toast.loading('Verifying payment...', { id: 'payment-verify' });
        
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
        toast.dismiss('payment-verify');
        
        if (data.status === 'COMPLETED') {
          setStatus('success');
          setMessage('Payment successful! Funds have been added to your account.');
          if (data.payment?.amount) {
            setAmount(data.payment.amount);
          }
          toast.success('Payment successful! Funds added to your account.', {
            duration: 5000,
            description: `Amount: ${data.payment?.amount || 'N/A'} BDT`
          });
          
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
          toast.info('Payment requires manual verification', {
            duration: 6000,
            description: 'Your transaction is pending admin approval. Please wait for confirmation.'
          });

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
          toast.error('Payment failed!', {
            duration: 5000,
            description: 'Please try again or contact support'
          });
          
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
        toast.dismiss('payment-verify');
        toast.error('Payment verification error!', {
          duration: 5000,
          description: 'Unable to verify payment status. Please contact support.'
        });
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
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto shadow-md bg-white dark:bg-gray-800 overflow-hidden">
        <CardHeader className={`text-center pb-2 ${
          status === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
            : status === 'processing' 
              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' 
              : status === 'error' 
                ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
        }`}>
          <div className="mx-auto mb-4">
            {status === 'success' && (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 animate-ping opacity-75"></div>
                <CheckCircle className="h-20 w-20 text-green-500 relative z-10" />
              </div>
            )}
            {status === 'processing' && (
              <div className="relative">
                <Clock className="h-20 w-20 text-yellow-500 animate-pulse" />
        </div>
      )}
            {status === 'error' && (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/30 animate-pulse opacity-75"></div>
                <AlertCircle className="h-20 w-20 text-red-500 relative z-10" />
        </div>
      )}
            {status === 'verifying' && (
              <div className="relative flex items-center justify-center">
                <div className="h-20 w-20 border-4 border-dashed rounded-full border-blue-500 animate-spin opacity-30"></div>
                <div className="absolute h-16 w-16 border-t-4 border-blue-600 rounded-full animate-spin"></div>
                <div className="absolute h-12 w-12 border-t-4 border-l-4 border-blue-700 rounded-full animate-spin"></div>
        </div>
      )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'success' && 'Payment Successful!'}
            {status === 'processing' && 'Payment Under Review'}
            {status === 'error' && 'Payment Failed'}
            {status === 'verifying' && 'Verifying Payment'}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {message}
          </CardDescription>
          {status === 'success' && (
            <p className="text-sm text-green-600 mt-2">
              Funds have been added to your account. You will be redirected to the transactions page in a few seconds...
            </p>
          )}
          {status === 'processing' && (
            <p className="text-sm text-yellow-600 mt-2">
              Your payment is pending admin approval. You will receive an email notification once it's processed.
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-600 mt-2">
              You will be redirected to the transactions page in a few seconds...
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Payment Details */}
            {(status === 'success' || status === 'processing') && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium mb-2">Payment Details</h3>
                <div className="space-y-2">
                  {invoiceId && (
                    <p className="text-sm">
                      <span className="font-medium">Invoice ID:</span> {invoiceId}
                    </p>
                  )}
                  {orderId && (
                    <p className="text-sm">
                      <span className="font-medium">Order ID:</span> {orderId}
                    </p>
                  )}
                  {amount !== null && (
                    <p className="text-sm">
                      <span className="font-medium">Amount:</span> {amount} BDT
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`${status === 'success' ? 'text-green-600 dark:text-green-400' : status === 'processing' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {status === 'success' ? 'Completed' : status === 'processing' ? 'Processing' : 'Failed'}
                    </span>
                  </p>
                </div>
        </div>
      )}
            
            {status === 'error' && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                <h3 className="text-lg font-medium mb-2 text-red-800 dark:text-red-300">Error Details</h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {errorDetails || 'There was a problem processing your payment. Please try again or contact our support team.'}
                </p>
                {invoiceId && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Invoice ID:</span> {invoiceId}
          </p>
        </div>
      )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button asChild variant="outline" className="transition-all duration-200 hover:scale-105">
                <Link href="/dashboard/user/transactions">
                  View Transactions
                </Link>
              </Button>
              <Button asChild className={`bg-gradient-to-r transition-all duration-200 hover:scale-105 ${
                status === 'error' 
                  ? 'from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                  : 'from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              }`}>
                <Link href="/dashboard/user/add-funds">
                  {status === 'error' ? 'Try Again' : 'Add More Funds'}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}