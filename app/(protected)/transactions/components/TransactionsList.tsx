'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaSearch,
} from 'react-icons/fa';

type Transaction = {
  id: number;
  invoice_id: number;
  amount: number;
  status: 'Success' | 'Processing' | 'Cancelled' | 'Failed';
  method: string;
  payment_method?: string;
  transaction_id?: string;
  createdAt: string;
  transaction_type?: 'deposit' | 'withdrawal' | 'purchase' | 'refund';
  reference_id?: string;
  sender_number?: string;
  phone?: string;
};

interface TransactionsListProps {
  transactions: Transaction[];
  onViewDetails: (transactionId: string) => void;
}

export function TransactionsList({
  transactions,
  onViewDetails,
}: TransactionsListProps) {
  const { currency, rate } = useCurrency();

  // Function to format currency based on selected currency
  const formatTransactionCurrency = (amount: number) => {
    // Transactions are stored in BDT, so we need to convert if USD is selected
    if (currency === 'USD' && rate) {
      const amountInUSD = amount / rate;
      return `$${amountInUSD.toFixed(2)}`;
    } else {
      return `৳${amount.toFixed(2)}`;
    }
  };

  if (!transactions.length) {
    return (
      <div className="card card-padding">
        <div className="text-center py-8 flex flex-col items-center">
          <FaSearch className="text-4xl text-gray-400 mb-4" />
          <div className="text-lg font-medium">No transactions found</div>
          <div className="text-sm text-gray-500">
            You haven't made any transactions yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                ID
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Date and Time
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Transaction ID
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Amount
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Phone Number
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Method
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Status
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-900">
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-700">
                    {new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      hour12: false,
                      timeZone: 'Asia/Dhaka',
                    }).format(new Date(transaction.createdAt))}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-mono text-gray-700">
                    {transaction.transaction_id || 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-900">
                    {formatTransactionCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-700">
                    {transaction.sender_number || transaction.phone || 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-700">
                    {transaction.payment_method ||
                      transaction.method ||
                      'UddoktaPay'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onViewDetails(transaction.invoice_id)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50 transition-colors duration-200 ml-auto"
                  >
                    <FaEye className="w-3 h-3" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  switch (status) {
    case 'Success':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <FaCheckCircle className="w-3 h-3 mr-1" />
          Success
        </span>
      );
    case 'Processing':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <FaClock className="w-3 h-3 mr-1" />
          Processing
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <FaExclamationTriangle className="w-3 h-3 mr-1" />
          Cancelled
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <FaExclamationTriangle className="w-3 h-3 mr-1" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          {status}
        </span>
      );
  }
}
