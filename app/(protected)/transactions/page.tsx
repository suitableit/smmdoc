'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { useEffect, useState } from 'react';
import {
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaReceipt,
    FaSearch,
    FaTimes,
} from 'react-icons/fa';
import { TransactionsList } from './components/TransactionsList';

const ButtonLoader = () => <div className="loading-spinner"></div>;

const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div className={`toast toast-${type} toast-enter`}>
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

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
  currency?: string;
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  switch (status) {
    case 'Success':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          Success
        </span>
      );
    case 'Processing':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          Processing
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          Cancelled
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
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
  const { appName } = useAppNameWithFallback();

  const { currency, rate } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setPageTitle('Transactions', appName);
  }, [appName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setSearchLoading(false);
    }, 500);

    if (searchTerm !== debouncedSearchTerm) {
      setSearchLoading(true);
    }

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    const hasSearchTerm = searchTerm.trim() !== '';
    const hasDateFilter = dateFilter.startDate !== '' || dateFilter.endDate !== '';
    setIsSearching(hasSearchTerm || hasDateFilter);
  }, [searchTerm, dateFilter]);

  const mockTransactions = [
    {
      id: 1,
      invoice_id: 123456789,
      amount: 500,
      status: 'Success' as const,
      method: 'uddoktapay',
      payment_method: 'bKash',
      transaction_id: 'TRX-123456',
      createdAt: new Date().toISOString(),
      transaction_type: 'deposit' as const,
      sender_number: '01712345678',
      phone: '01712345678',
    },
    {
      id: 2,
      invoice_id: 987654321,
      amount: 1000,
      status: 'Success' as const,
      method: 'uddoktapay',
      payment_method: 'Nagad',
      transaction_id: 'TRX-987654',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      transaction_type: 'deposit' as const,
      sender_number: '01823456789',
      phone: '01823456789',
    },
    {
      id: 3,
      invoice_id: 456789123,
      amount: 750,
      status: 'Processing' as const,
      method: 'uddoktapay',
      payment_method: 'Rocket',
      transaction_id: 'TRX-456789',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      transaction_type: 'deposit' as const,
      sender_number: '01934567890',
      phone: '01934567890',
    },
    {
      id: 4,
      invoice_id: 111222333,
      amount: 300,
      status: 'Failed' as const,
      method: 'uddoktapay',
      payment_method: 'bKash',
      transaction_id: 'TRX-111222',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      transaction_type: 'deposit' as const,
      sender_number: '01645678901',
      phone: '01645678901',
    },
    {
      id: 5,
      invoice_id: 444555666,
      amount: 1200,
      status: 'Cancelled' as const,
      method: 'uddoktapay',
      payment_method: 'Nagad',
      transaction_id: 'TRX-444555',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      transaction_type: 'deposit' as const,
      sender_number: '01756789012',
      phone: '01756789012',
    },
  ];

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          limit: '50',
        });

        if (activeTab !== 'all') {
          params.append('status', activeTab);
        }

        const response = await fetch(`/api/user/transactions?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        console.log('API Response:', data);
        const transactionsToShow = data.transactions || [];

        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('invoice_id');
        const amount = urlParams.get('amount');
        const transactionId = urlParams.get('transaction_id');
        const status = urlParams.get('status');
        const phone = urlParams.get('phone');

        if (invoiceId && amount && transactionId) {
          const existingTransaction = transactionsToShow.find(
            (tx: Transaction) =>
              tx.invoice_id === Number(invoiceId) || tx.transaction_id === transactionId
          );

          if (!existingTransaction) {
            const newTransaction = {
              id: `url-${Date.now()}`,
              invoice_id: invoiceId,
              amount: parseFloat(amount),
              status:
                status === 'success'
                  ? ('Success' as const)
                  : ('Processing' as const),
              method: 'uddoktapay',
              payment_method:
                status === 'success' ? 'Payment Gateway' : 'Manual Payment',
              transaction_id: transactionId,
              createdAt: new Date().toISOString(),
              transaction_type: 'deposit' as const,
              sender_number: phone || 'N/A',
              phone: phone || 'N/A',
            };

            transactionsToShow.unshift(newTransaction);

            if (status === 'success') {
              showToast(
                `Successful transaction ${invoiceId} loaded`,
                'success'
              );
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

        const fallbackTransactions = [...mockTransactions];

        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('invoice_id');
        const amount = urlParams.get('amount');
        const transactionId = urlParams.get('transaction_id');
        const status = urlParams.get('status');
        const phone = urlParams.get('phone');

        if (invoiceId && amount && transactionId) {
          const newTransaction = {
            id: Date.now(),
            invoice_id: Number(invoiceId),
            amount: parseFloat(amount),
            status:
              status === 'success'
                ? ('Success' as const)
                : ('Processing' as const),
            method: 'uddoktapay',
            payment_method:
              status === 'success' ? 'Payment Gateway' : 'Manual Payment',
            transaction_id: transactionId,
            createdAt: new Date().toISOString(),
            transaction_type: 'deposit' as const,
            sender_number: phone || 'N/A',
            phone: phone || 'N/A',
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
  }, [activeTab]);

  const handleViewDetails = (invoiceId: string) => {
    showToast(`Viewing details for ${invoiceId}`, 'info');
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.transaction_id && String(tx.transaction_id).toLowerCase().includes(searchTerm.toLowerCase()));

    const txDate = new Date(tx.createdAt);
    const matchesDate =
      (!dateFilter.startDate || txDate >= new Date(dateFilter.startDate)) &&
      (!dateFilter.endDate || txDate <= new Date(dateFilter.endDate + 'T23:59:59'));

    const matchesAll = matchesSearch && matchesDate;

    if (activeTab === 'all') return matchesAll;
    if (activeTab === 'success')
      return tx.status === 'Success' && matchesAll;
    if (activeTab === 'pending')
      return tx.status === 'Processing' && matchesAll;
    if (activeTab === 'failed')
      return (
        (tx.status === 'Failed' || tx.status === 'Cancelled') && matchesAll
      );

    return matchesAll;
  });

  const successTransactions = transactions.filter(
    (tx) => tx.status === 'Success'
  );
  const pendingTransactions = transactions.filter(
    (tx) => tx.status === 'Processing'
  );
  const failedTransactions = transactions.filter(
    (tx) => tx.status === 'Failed' || tx.status === 'Cancelled'
  );

  return (
    <div className="page-container">
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
          {loading ? (
            <>
              <div className="mb-6">
                <div className="relative">
                  <div className="h-10 w-full gradient-shimmer rounded-lg" />
                </div>
              </div>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="h-4 w-20 gradient-shimmer rounded mb-2" />
                    <div className="h-10 w-full gradient-shimmer rounded-lg" />
                  </div>
                  <div>
                    <div className="h-4 w-20 gradient-shimmer rounded mb-2" />
                    <div className="h-10 w-full gradient-shimmer rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-9 w-28 gradient-shimmer rounded-full" />
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {Array.from({ length: 7 }).map((_, idx) => (
                          <th key={idx} className="text-left py-3 px-4 font-medium text-gray-900">
                            <div className="h-4 w-24 gradient-shimmer rounded" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="h-4 w-8 gradient-shimmer rounded" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-32 gradient-shimmer rounded" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-20 gradient-shimmer rounded" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-24 gradient-shimmer rounded" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-20 gradient-shimmer rounded" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-32 gradient-shimmer rounded" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-6 w-20 gradient-shimmer rounded-full" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <p className="flex items-center">
                <FaExclamationTriangle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="search"
                    placeholder="Search by ID or Transaction ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                      className="form-field w-full px-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                      className="form-field w-full px-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                    />
                  </div>
                </div>
                {(dateFilter.startDate || dateFilter.endDate) && (
                  <button
                    onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                    className="mt-3 text-sm text-[var(--primary)] hover:text-[var(--secondary)] font-medium"
                  >
                    Clear Date Filter
                  </button>
                )}
              </div>
              <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${
                      activeTab === 'all'
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-lg'
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
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-lg'
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
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-lg'
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
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-lg'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <FaExclamationTriangle className="w-4 h-4" />
                    Failed ({failedTransactions.length})
                  </button>
                </div>
              </div>
              {searchLoading ? (
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          {Array.from({ length: 7 }).map((_, idx) => (
                            <th key={idx} className="text-left py-3 px-4 font-medium text-gray-900">
                              <div className="h-4 w-24 gradient-shimmer rounded" />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 10 }).map((_, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="h-4 w-8 gradient-shimmer rounded" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-32 gradient-shimmer rounded" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-20 gradient-shimmer rounded" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-24 gradient-shimmer rounded" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-20 gradient-shimmer rounded" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-32 gradient-shimmer rounded" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-6 w-20 gradient-shimmer rounded-full" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <TransactionsList
                  transactions={filteredTransactions}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
