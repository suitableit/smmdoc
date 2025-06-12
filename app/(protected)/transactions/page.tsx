'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';
import { APP_NAME } from '@/lib/constants';
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
import { TransactionsList } from './components/TransactionsList';

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
  sender_number?: string;
  phone?: string;
};

// Helper function for formatting amount - will be replaced with dynamic currency
function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
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

export default function TransactionsPage() {
  const { currency, rate } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Transactions — ${APP_NAME}`;
  }, []);

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
      transaction_type: 'deposit' as const,
      sender_number: '01712345678',
      phone: '01712345678'
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
      transaction_type: 'deposit' as const,
      sender_number: '01823456789',
      phone: '01823456789'
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
      transaction_type: 'deposit' as const,
      sender_number: '01934567890',
      phone: '01934567890'
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
      transaction_type: 'deposit' as const,
      sender_number: '01645678901',
      phone: '01645678901'
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
      transaction_type: 'deposit' as const,
      sender_number: '01756789012',
      phone: '01756789012'
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

        // Fetch real transactions from API
        const response = await fetch('/api/user/transactions?limit=50');

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        let transactionsToShow = data.transactions || [];

        // Check if there's a transaction from URL parameters (for new transactions)
        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('invoice_id');
        const amount = urlParams.get('amount');
        const transactionId = urlParams.get('transaction_id');
        const status = urlParams.get('status');
        const phone = urlParams.get('phone');

        // Add URL transaction if it doesn't exist in database yet
        if (invoiceId && amount && transactionId) {
          const existingTransaction = transactionsToShow.find(
            (tx: Transaction) => tx.invoice_id === invoiceId || tx.transaction_id === transactionId
          );

          if (!existingTransaction) {
            const newTransaction = {
              id: `url-${Date.now()}`,
              invoice_id: invoiceId,
              amount: parseFloat(amount),
              status: status === 'success' ? 'Success' as const : 'Processing' as const,
              method: 'uddoktapay',
              payment_method: status === 'success' ? 'Payment Gateway' : 'Manual Payment',
              transaction_id: transactionId,
              createdAt: new Date().toISOString(),
              transaction_type: 'deposit' as const,
              sender_number: phone || 'N/A',
              phone: phone || 'N/A'
            };

            // Add to beginning of array to show as most recent
            transactionsToShow.unshift(newTransaction);

            if (status === 'success') {
              showToast(`Successful transaction ${invoiceId} loaded`, 'success');
            } else {
              showToast(`Pending transaction ${invoiceId} loaded`, 'info');
            }
          }
        }

        setTransactions(transactionsToShow);

        if (!invoiceId && transactionsToShow.length > 0) {
          showToast('Transactions loaded successfully!', 'success');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');

        // Fallback to mock data with URL transaction if available
        let fallbackTransactions = [...mockTransactions];

        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('invoice_id');
        const amount = urlParams.get('amount');
        const transactionId = urlParams.get('transaction_id');
        const status = urlParams.get('status');
        const phone = urlParams.get('phone');

        if (invoiceId && amount && transactionId) {
          const newTransaction = {
            id: `fallback-${Date.now()}`,
            invoice_id: invoiceId,
            amount: parseFloat(amount),
            status: status === 'success' ? 'Success' as const : 'Processing' as const,
            method: 'uddoktapay',
            payment_method: status === 'success' ? 'Payment Gateway' : 'Manual Payment',
            transaction_id: transactionId,
            createdAt: new Date().toISOString(),
            transaction_type: 'deposit' as const,
            sender_number: phone || 'N/A',
            phone: phone || 'N/A'
          };
          fallbackTransactions.unshift(newTransaction);
        }

        setTransactions(fallbackTransactions);
        showToast('Using demo data - check your connection', 'error');
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
        <div className="card card-padding">

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