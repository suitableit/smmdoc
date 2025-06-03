'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axiosInstance from '@/lib/axiosInstance';
import { AlertCircle, CheckCircle, Clock, XCircle, Users, DollarSign, Phone, Calendar, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PendingTransaction {
  id: string;
  invoice_id: string;
  amount: number;
  transaction_id?: string;
  sender_number?: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

interface PendingTransactionNotificationsProps {
  refreshInterval?: number;
}

export default function PendingTransactionNotifications({ 
  refreshInterval = 30000 // 30 seconds default
}: PendingTransactionNotificationsProps) {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPendingTransactions = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/funds/pending?limit=5');
      if (response.data.success) {
        setPendingTransactions(response.data.data.transactions);
        setTotalCount(response.data.data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTransactions();
    
    // Set up polling for new pending transactions
    const interval = setInterval(fetchPendingTransactions, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleApprove = async (transactionId: string) => {
    try {
      const response = await axiosInstance.post(`/api/admin/funds/${transactionId}/approve`);
      
      if (response.data.success) {
        // Remove from pending list
        setPendingTransactions(prev => prev.filter(t => t.id !== transactionId));
        setTotalCount(prev => prev - 1);
        
        toast.success('Transaction approved successfully!', {
          description: 'User has been notified and funds have been added to their account.',
        });
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    }
  };

  const handleCancel = async (transactionId: string) => {
    if (!confirm('Are you sure you want to cancel this transaction? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await axiosInstance.post(`/api/admin/funds/${transactionId}/cancel`);
      
      if (response.data.success) {
        // Remove from pending list
        setPendingTransactions(prev => prev.filter(t => t.id !== transactionId));
        setTotalCount(prev => prev - 1);
        
        toast.success('Transaction cancelled successfully!', {
          description: 'User has been notified about the cancellation.',
        });
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast.error('Failed to cancel transaction');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-orange-50 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500"></div>
      <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Transactions
          {totalCount > 0 && (
            <Badge className="ml-2 bg-white/20 text-white border-white/30 hover:bg-white/30">
              {totalCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-orange-100">
          Transactions requiring manual approval
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {pendingTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg mx-auto w-fit mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <p className="text-gray-600 font-medium">No pending transactions</p>
            <p className="text-sm text-gray-500">All transactions are up to date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-orange-50 to-red-50 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100">
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      User
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Amount
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      Phone
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <Settings className="h-4 w-4 text-gray-600" />
                      Actions
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200"
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {transaction.user.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {transaction.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-green-700">{transaction.amount}</span>
                        <span className="text-sm text-gray-600">BDT</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-700">
                        {transaction.sender_number || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 shadow-md">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          onClick={() => handleApprove(transaction.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          onClick={() => handleCancel(transaction.id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {totalCount > pendingTransactions.length && (
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" size="sm" asChild>
                  <a href="/dashboard/admin/funds">
                    View All {totalCount} Pending Transactions
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
