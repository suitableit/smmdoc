'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';

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

interface TransactionsListProps {
  transactions: Transaction[];
  onViewDetails: (transactionId: string) => void;
}

export function TransactionsList({ transactions, onViewDetails }: TransactionsListProps) {
  if (!transactions.length) {
    return (
      <div className="text-center py-10">
        <div className="flex justify-center">
          <Search className="h-12 w-12 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No transactions found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You haven't made any transactions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>{transaction.transaction_id || 'N/A'}</TableCell>
              <TableCell>{transaction.amount} BDT</TableCell>
              <TableCell>
                {transaction.payment_method || transaction.method || 'UddoktaPay'}
              </TableCell>
              <TableCell>
                <StatusBadge status={transaction.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(transaction.invoice_id)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  switch (status) {
    case 'Success':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Success
        </Badge>
      );
    case 'Processing':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
          <Clock className="h-3.5 w-3.5 mr-1" />
          Processing
        </Badge>
      );
    case 'Cancelled':
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Cancelled
        </Badge>
      );
    case 'Failed':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
} 