'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TransactionsList } from './components/TransactionsList';

type Transaction = {
  id: string;
  invoice_id: string;
  amount: number;
  status: 'Success' | 'Processing' | 'Cancelled' | 'Failed';
  method: string;
  payment_method?: string;
  transaction_id?: string;
  createdAt: string;
  transaction_type?: 'deposit' | 'withdrawal' | 'purchase' | 'refund';
  reference_id?: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const status = searchParams?.get('status');
  const transactionId = searchParams?.get('transaction');
  const user = useCurrentUser();
  const router = useRouter();

  // const breadcrumbItems = [
  //   { title: 'Transactions', link: '/dashboard/user/transactions' },
  // ];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/payment/transactions');
        
        // Ensure the data is an array before setting state
        if (Array.isArray(response.data)) {
          setTransactions(response.data);
        } else {
          console.error('Expected array but got:', typeof response.data);
          setTransactions([]);
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
        // For demo purposes, create some sample transactions
        setTransactions([
          {
            id: 'tx-1',
            invoice_id: transactionId || 'INV-123456789',
            amount: 500,
            status: status === 'success' ? 'Success' : status === 'cancelled' ? 'Cancelled' : status === 'pending' ? 'Processing' : 'Failed',
            method: 'uddoktapay',
            payment_method: 'bKash',
            transaction_id: 'TRX-123456',
            createdAt: new Date().toISOString(),
            transaction_type: 'deposit'
          },
          {
            id: 'tx-2',
            invoice_id: 'INV-987654321',
            amount: 1000,
            status: 'Success',
            method: 'uddoktapay',
            payment_method: 'Nagad',
            transaction_id: 'TRX-987654',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            transaction_type: 'deposit'
          },
          {
            id: 'tx-3',
            invoice_id: 'INV-456789123',
            amount: 750,
            status: 'Processing',
            method: 'uddoktapay',
            payment_method: 'Rocket',
            transaction_id: 'TRX-456789',
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            transaction_type: 'deposit'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [status, transactionId]);

  const handleViewDetails = (invoiceId: string) => {
    router.push(`/dashboard/user/success?invoice_id=${invoiceId}`);
  };

  // Make sure transactions is an array before filtering
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Filter transactions by status
  const successTransactions = safeTransactions.filter(tx => tx.status === 'Success');
  const pendingTransactions = safeTransactions.filter(tx => tx.status === 'Processing');
  const failedTransactions = safeTransactions.filter(tx => 
    tx.status === 'Cancelled' || tx.status === 'Failed'
  );

  // Show toast notification for transaction status
  useEffect(() => {
    if (status) {
      if (status === 'success') {
        toast.success('Payment Successful!', {
          description: 'Your account has been credited.',
          position: 'top-right',
        });
      } else if (status === 'pending') {
        toast.info('Payment is being processed', {
          description: 'Your payment is being processed. Please wait while we verify your transaction.',
          position: 'top-right',
        });
      } else if (status === 'cancelled') {
        toast.error('Payment Cancelled', {
          description: 'Your payment has been cancelled. No funds have been deducted.',
          position: 'top-right',
        });
      } else if (status === 'failed') {
        toast.error('Payment Failed', {
          description: 'Your payment has failed. Please try again or contact support.',
          position: 'top-right',
        });
      }
    }
  }, [status]);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>View your payment transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          {status && (
            <Alert className={`mb-4 ${
              status === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
              status === 'pending' ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 
              'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {status === 'success' && <CheckCircle className="h-5 w-5" />}
              {status === 'pending' && <Clock className="h-5 w-5" />}
              {(status === 'cancelled' || status === 'failed') && <AlertCircle className="h-5 w-5" />}
              <AlertTitle>
                {status === 'success' && 'Payment Successful'}
                {status === 'pending' && 'Payment Processing'}
                {status === 'cancelled' && 'Payment Cancelled'}
                {status === 'failed' && 'Payment Failed'}
              </AlertTitle>
              <AlertDescription>
                {status === 'success' && 'Your payment has been successfully processed and your account has been credited.'}
                {status === 'pending' && 'Your payment is being processed. Please wait while we verify your transaction.'}
                {status === 'cancelled' && 'Your payment has been cancelled. No funds have been deducted.'}
                {status === 'failed' && 'Your payment has failed. Please try again or contact support.'}
              </AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="flex flex-col justify-center items-center py-10 space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-dashed border-blue-500 animate-spin"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-blue-600 animate-pulse"></div>
              </div>
              <p className="text-blue-600 font-medium animate-pulse">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All ({safeTransactions.length})</TabsTrigger>
                <TabsTrigger value="success">Success ({successTransactions.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingTransactions.length})</TabsTrigger>
                <TabsTrigger value="failed">Failed/Cancelled ({failedTransactions.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <TransactionsList 
                  transactions={safeTransactions} 
                  onViewDetails={handleViewDetails} 
                />
              </TabsContent>
              
              <TabsContent value="success">
                <TransactionsList 
                  transactions={successTransactions} 
                  onViewDetails={handleViewDetails} 
                />
              </TabsContent>
              
              <TabsContent value="pending">
                <TransactionsList 
                  transactions={pendingTransactions} 
                  onViewDetails={handleViewDetails} 
                />
              </TabsContent>
              
              <TabsContent value="failed">
                <TransactionsList 
                  transactions={failedTransactions} 
                  onViewDetails={handleViewDetails} 
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}