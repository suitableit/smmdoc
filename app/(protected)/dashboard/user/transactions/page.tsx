'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock, 
  FaReceipt, 
  FaSearch, 
  FaEye, 
  FaCalendarAlt, 
  FaCreditCard, 
  FaTimes,
  FaFilter 
} from 'react-icons/fa';

// Mock components matching profile page style
const ButtonLoader = () => <div className="loading-spinner"></div>;

// Toast Component matching the profile page style
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    {type === 'error' && <FaExclamationTriangle className="toast-icon" />}
    {type === 'info' && <FaClock className="toast-icon" />}
    {type === 'pending' && <FaClock className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

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

const TransactionsList = ({ transactions, onViewDetails }: { transactions: Transaction[]; onViewDetails: (invoiceId: string) => void }) => {
  if (transactions.length === 0) {
    return (
      <div className="card card-padding">
        <div className="text-center py-8 flex flex-col items-center">
          <FaSearch className="text-4xl text-gray-400 mb-4" />
          <div className="text-lg font-medium">No transactions found</div>
          <div className="text-sm text-gray-500">You haven't made any transactions yet.</div>
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
              <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-900">
                    {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-mono text-gray-700">
                    {transaction.transaction_id || transaction.invoice_id}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-900">
                    {formatAmount(transaction.amount)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-700">
                    {transaction.payment_method || transaction.method || 'UddoktaPay'}
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

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);

  // Mock data for demonstration
  const mockTransactions = [
    {
      id: 'tx-1',
      invoice_id: 'INV-123456789',
      amount: 500,
      status: 'Success' as const,
      method: 'uddoktapay',
      payment_method: 'bKash',
      transaction_id: 'TRX-123456',
      createdAt: new Date().toISOString(),
      transaction_type: 'deposit' as const
    },
    {
      id: 'tx-2',
      invoice_id: 'INV-987654321',
      amount: 1000,
      status: 'Success' as const,
      method: 'uddoktapay',
      payment_method: 'Nagad',
      transaction_id: 'TRX-987654',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      transaction_type: 'deposit' as const
    },
    {
      id: 'tx-3',
      invoice_id: 'INV-456789123',
      amount: 750,
      status: 'Processing' as const,
      method: 'uddoktapay',
      payment_method: 'Rocket',
      transaction_id: 'TRX-456789',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      transaction_type: 'deposit' as const
    },
    {
      id: 'tx-4',
      invoice_id: 'INV-111222333',
      amount: 300,
      status: 'Failed' as const,
      method: 'uddoktapay',
      payment_method: 'bKash',
      transaction_id: 'TRX-111222',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      transaction_type: 'deposit' as const
    },
    {
      id: 'tx-5',
      invoice_id: 'INV-444555666',
      amount: 1200,
      status: 'Cancelled' as const,
      method: 'uddoktapay',
      payment_method: 'Nagad',
      transaction_id: 'TRX-444555',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      transaction_type: 'deposit' as const
    }
  ];

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'pending' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTransactions(mockTransactions);
        showToast('Transactions loaded successfully!', 'success');
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
        setTransactions(mockTransactions);
        showToast('Failed to load transactions from server, showing demo data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleViewDetails = (invoiceId: string) => {
    showToast(`Viewing details for ${invoiceId}`, 'info');
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'success') return tx.status === 'Success' && matchesSearch;
    if (activeTab === 'pending') return tx.status === 'Processing' && matchesSearch;
    if (activeTab === 'failed') return (tx.status === 'Failed' || tx.status === 'Cancelled') && matchesSearch;
    
    return matchesSearch;
  });

  const successTransactions = transactions.filter(tx => tx.status === 'Success');
  const pendingTransactions = transactions.filter(tx => tx.status === 'Processing');
  const failedTransactions = transactions.filter(tx => tx.status === 'Failed' || tx.status === 'Cancelled');

  return (
    <div className="page-container">
      {/* Toast Container */}
      <div className="toast-container">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>

      <div className="page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Transaction History</h1>
          <p className="page-description">View and manage your payment transactions</p>
        </div>

        <div className="card card-padding">
          <div className="card-header">
            <div className="card-icon">
              <FaReceipt />
            </div>
            <h3 className="card-title">All Transactions</h3>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="search"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input w-full"
                  autoComplete="off"
                  style={{ width: '100%', minWidth: '0' }}
                />
              </div>
              <button 
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2 font-medium transition-all duration-200"
              >
                <FaSearch className="w-4 h-4" />
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-dashed border-blue-500 animate-spin"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-blue-600 animate-pulse"></div>
              </div>
              <p className="text-blue-600 font-medium animate-pulse">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <p className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </p>
            </div>
          ) : (
            <>
          {/* Status Filter Buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${
                  activeTab === 'all' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <FaReceipt className="w-4 h-4" />
                All ({transactions.length})
              </button>
              
              <button
                onClick={() => setActiveTab('success')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${
                  activeTab === 'success' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <FaCheckCircle className="w-4 h-4" />
                Success ({successTransactions.length})
              </button>
              
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${
                  activeTab === 'pending' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <FaClock className="w-4 h-4" />
                Pending ({pendingTransactions.length})
              </button>
              
              <button
                onClick={() => setActiveTab('failed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${
                  activeTab === 'failed' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <FaExclamationTriangle className="w-4 h-4" />
                Failed ({failedTransactions.length})
              </button>
            </div>
          </div>

              {/* Transactions List */}
              <TransactionsList 
                transactions={filteredTransactions} 
                onViewDetails={handleViewDetails} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}