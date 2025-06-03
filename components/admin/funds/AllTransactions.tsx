'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCurrency } from '@/contexts/CurrencyContext';
import axiosInstance from '@/lib/axiosInstance';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  date?: Date;
  user?: {
    name?: string;
    email?: string;
  };
  transaction_id?: string;
  amount: number;
  payment_method?: string;
  method?: string;
  status: string;
  admin_status: string;
  userId?: string;
}

export default function AllTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/funds/transactions', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Set mock data if API fails
      const mockTransactions = [
        {
          id: 'TRX-1001',
          date: new Date(),
          user: { name: 'John Doe', email: 'john@example.com' },
          transaction_id: 'PAY123456789',
          amount: 50.00,
          payment_method: 'bKash',
          status: 'Success',
          admin_status: 'Success',
          userId: 'user-123'
        },
        {
          id: 'TRX-1002',
          date: new Date(),
          user: { name: 'Jane Smith', email: 'jane@example.com' },
          transaction_id: 'PAY987654321',
          amount: 100.00,
          payment_method: 'Nagad',
          status: 'Processing',
          admin_status: 'Pending',
          userId: 'user-456'
        },
        {
          id: 'TRX-1003',
          date: new Date(),
          user: { name: 'Bob Johnson', email: 'bob@example.com' },
          transaction_id: 'PAY456789123',
          amount: 75.00,
          payment_method: 'Rocket',
          status: 'Cancelled',
          admin_status: 'Cancelled',
          userId: 'user-789'
        },
        {
          id: 'TRX-1004',
          date: new Date(),
          user: { name: 'Alice Brown', email: 'alice@example.com' },
          transaction_id: 'PAY789123456',
          amount: 200.00,
          payment_method: 'bKash',
          status: 'Processing',
          admin_status: 'Suspicious',
          userId: 'user-012'
        }
      ];
      setTransactions(mockTransactions);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleApprove = async (transactionId: string) => {
    try {
      const response = await axiosInstance.post(`/api/admin/funds/${transactionId}/approve`);

      if (response.data.success) {
        // Update local state to reflect the change
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction.id === transactionId
              ? { ...transaction, admin_status: 'approved', status: 'Success' }
              : transaction
          )
        );

        alert('Transaction approved successfully!');
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Failed to approve transaction');
    }
  };

  const handleCancel = async (transactionId: string) => {
    if (!confirm('Are you sure you want to cancel this transaction? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/admin/funds/${transactionId}/cancel`);

      if (response.data.success) {
        // Update local state to reflect the change
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction.id === transactionId
              ? { ...transaction, admin_status: 'cancelled', status: 'Cancelled' }
              : transaction
          )
        );

        alert('Transaction cancelled successfully!');
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      alert('Failed to cancel transaction');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <Badge className="bg-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Success</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'Processing':
        return <Badge className="bg-yellow-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Processing</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-500 flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      case 'Suspicious':
        return <Badge className="bg-purple-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Suspicious</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">All Transactions</CardTitle>
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <Input
              placeholder="Search by user, transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Suspicious">Suspicious</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {transaction.date ? format(new Date(transaction.date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{transaction.user?.name || 'Unknown'}</TableCell>
                      <TableCell>{transaction.transaction_id || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{transaction.payment_method || transaction.method || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(transaction.admin_status)}</TableCell>
                      <TableCell>
                        {(transaction.admin_status === 'Pending' || transaction.admin_status === 'pending') && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                              onClick={() => handleApprove(transaction.id)}
                              title="Approve transaction and add funds to user account"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                              onClick={() => handleCancel(transaction.id)}
                              title="Cancel transaction and notify user"
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Cancel
                            </Button>
                          </div>
                        )}
                        {(transaction.admin_status !== 'Pending' && transaction.admin_status !== 'pending') && (
                          <span className="text-gray-500 text-sm">No actions available</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="w-24"
                    >
                      Previous
                    </Button>
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="w-24"
                    >
                      Next
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 