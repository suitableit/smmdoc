'use client';

import React from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import {
  FaCheckCircle,
  FaClock,
  FaEye,
  FaTimesCircle,
} from 'react-icons/fa';
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);
interface PendingTransaction {
  id: number;
  invoice_id: number;
  userId: number;
  username?: string;
  amount: number;
  transaction_id?: string;
  sender_number?: string;
  status: string;
  admin_status: string;
  method?: string;
  payment_method?: string;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
}
interface PendingTransactionsProps {
  pendingTransactions: PendingTransaction[];
  transactionsLoading: boolean;
  onTransactionUpdate: (transactionId: number) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'pending') => void;
}

const PendingTransactions = React.memo(function PendingTransactions({
  pendingTransactions,
  transactionsLoading,
  onTransactionUpdate,
  showToast,
}: PendingTransactionsProps) {

  const handleApprove = React.useCallback(async (transactionId: string | number) => {
    try {
      const response = await axiosInstance.patch(
        `/api/transactions/${transactionId}`,
        {
          status: 'approved',
        }
      );

      if (response.status === 200) {
        onTransactionUpdate(Number(transactionId));
        showToast('Transaction approved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      showToast('Failed to approve transaction', 'error');
    }
  }, [onTransactionUpdate, showToast]);

  const handleCancel = React.useCallback(async (transactionId: string | number) => {
    if (
      !confirm(
        'Are you sure you want to cancel this transaction? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/api/transactions/${transactionId}`,
        {
          status: 'cancelled',
        }
      );

      if (response.status === 200) {
        onTransactionUpdate(Number(transactionId));
        showToast('Transaction cancelled successfully!', 'success');
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      showToast('Failed to cancel transaction', 'error');
    }
  }, [onTransactionUpdate, showToast]);

  return (
    <div className="mb-6">
      <div className="card">
        <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1">
              <div className="card-icon">
                <FaClock />
              </div>
              <h3 className="card-title">Pending Transactions</h3>
            </div>
            <Link
              href="/admin/transactions"
              className={`btn btn-secondary flex items-center gap-2`}
            >
              <FaEye className="w-4 h-4" />
              View More
            </Link>
          </div>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          {pendingTransactions.length === 0 ? (
            <div className="text-center py-12">
              <FaCheckCircle
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: 'var(--text-muted)', opacity: 0.5 }}
              />
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                No pending transactions
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                All transactions are up to date
              </p>
            </div>
          ) : (
            <>
              {}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white border-b z-10">
                    <tr>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        ID
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Username
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Date and Time
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Transaction ID
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Amount
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Phone Number
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Method
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Status
                      </th>
                      <th
                        className="text-center p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-t hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="p-3">
                          <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            #{String(transaction.id).length > 8 ? String(transaction.id).slice(-8) : transaction.id}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className="font-medium text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.user?.name ||
                              transaction.username ||
                              'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div>
                            <div
                              className="text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {new Date(
                                transaction.createdAt
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className="font-mono text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.transaction_id || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div
                            className="font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.currency === 'USD' ||
                            transaction.currency === 'USDT'
                              ? `$${transaction.amount.toFixed(2)}`
                              : `৳${transaction.amount.toFixed(2)}`}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.sender_number || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.payment_method ||
                              transaction.method ||
                              'uddoktapay'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full w-fit">
                            <FaClock className="h-3 w-3 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-800">
                              Pending
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApprove(transaction.id)}
                              className="btn btn-primary flex items-center gap-1 px-3 py-1.5 text-xs bg-green-500 text-white border border-green-500 hover:bg-green-600"
                              title="Approve"
                            >
                              <FaCheckCircle className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleCancel(transaction.id)}
                              className="btn btn-secondary flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500 text-white border border-red-500 hover:bg-red-600"
                              title="Cancel"
                            >
                              <FaTimesCircle className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {}
              <div className="lg:hidden">
                <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
                  {pendingTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="card card-padding border-l-4 border-yellow-500 mb-4"
                    >
                      {}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {String(transaction.id).length > 8 ? String(transaction.id).slice(-8) : transaction.id}
                          </div>
                          <div
                            className="font-medium text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.user?.name ||
                              transaction.username ||
                              'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                          <FaClock className="h-3 w-3 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-800">
                            Pending
                          </span>
                        </div>
                      </div>

                      {}
                      <div className="mb-4 pb-4 border-b">
                        <div
                          className="text-xs font-medium mb-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Transaction ID
                        </div>
                        <div
                          className="font-mono text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {transaction.transaction_id || 'N/A'}
                        </div>
                      </div>

                      {}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Amount
                          </div>
                          <div
                            className="font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.currency === 'USD' ||
                            transaction.currency === 'USDT'
                              ? `$${transaction.amount.toFixed(2)}`
                              : `৳${transaction.amount.toFixed(2)}`}
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Phone
                          </div>
                          <div
                            className="font-medium text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {transaction.sender_number || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="mb-4">
                        <div
                          className="text-xs font-medium mb-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Method
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {transaction.payment_method ||
                            transaction.method ||
                            'uddoktapay'}
                        </div>
                      </div>

                      {}
                      <div className="mb-4">
                        <div
                          className="text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Date:{' '}
                          {new Date(
                            transaction.createdAt
                          ).toLocaleDateString()}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Time:{' '}
                          {new Date(
                            transaction.createdAt
                          ).toLocaleTimeString()}
                        </div>
                      </div>

                      {}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(transaction.id)}
                          className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                          <FaCheckCircle className="h-3 w-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleCancel(transaction.id)}
                          className="btn btn-secondary flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
                        >
                          <FaTimesCircle className="h-3 w-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default PendingTransactions;