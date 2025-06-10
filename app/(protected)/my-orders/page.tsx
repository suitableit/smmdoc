'use client';

import useCurrency from '@/hooks/useCurrency';
import { useGetUserOrdersQuery } from '@/lib/services/userOrderApi';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { 
  FaSearch, 
  FaExternalLinkAlt, 
  FaCheckCircle, 
  FaTimes, 
  FaList,
  FaClock,
  FaSpinner,
  FaCheck,
  FaCircleNotch,
  FaRss,
  FaBan,
  FaUndo,
  FaClipboardList,
  FaExclamationTriangle
} from 'react-icons/fa';

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
    type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' :
    type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' :
    type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200' :
    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
  }`}>
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default function OrdersList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);
  const { currency } = useCurrency();

  const { data, isLoading, error } = useGetUserOrdersQuery({ page, limit, status, search });

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'pending' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const orders = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const pagination = useMemo(() => {
    return data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  }, [data]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Status filter buttons configuration
  const statusFilters = [
    { key: 'all', label: 'All', icon: FaList, color: 'bg-gray-600 hover:bg-gray-700' },
    { key: 'pending', label: 'Pending', icon: FaClock, color: 'bg-gray-600 hover:bg-gray-700' },
    { key: 'in_progress', label: 'In progress', icon: FaSpinner, color: 'bg-gray-600 hover:bg-gray-700' },
    { key: 'completed', label: 'Completed', icon: FaCheck, color: 'bg-gray-600 hover:bg-gray-700' },
    { key: 'partial', label: 'Partial', icon: FaCircleNotch, color: 'bg-gray-600 hover:bg-gray-700' },
    { key: 'processing', label: 'Processing', icon: FaRss, color: 'bg-gray-600 hover:bg-gray-700' },
    { key: 'cancelled', label: 'Canceled', icon: FaBan, color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
      case 'in_progress':
        return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
      case 'partial':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800';
    }
  };

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card card-padding">
            <div className="card card-padding">
            <div className="text-red-500 text-center flex flex-col items-center py-8">
              <FaExclamationTriangle className="text-4xl mb-4" />
              <div className="text-lg font-medium">Error loading orders!</div>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card card-padding">
            <div className="text-center py-8 flex flex-col items-center">
              <FaSpinner className="text-4xl text-blue-500 mb-4 animate-spin" />
              <div className="text-lg font-medium">Loading orders...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Toast Container */}
      {toastMessage && (
        <Toast 
          message={toastMessage.message} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
        />
      )}
      
      <div className="page-content">  
        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="search"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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

        {/* Status Filter Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {statusFilters.map((filter) => {
              const IconComponent = filter.icon;
              const isActive = status === filter.key;
              
              return (
                <button
                  key={filter.key}
                  onClick={() => {
                    setStatus(filter.key);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40' 
                      : filter.color
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="card card-padding">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Link</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Charge</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Start count</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Remains</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order: any) => (
                    <tr 
                      key={order.id} 
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-gray-700">
                          #{order.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {moment(order.createdAt).format('DD/MM/YYYY')}
                        </span>
                        <div className="text-xs text-gray-500">
                          {moment(order.createdAt).format('HH:mm')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-[120px]">
                          <a 
                            href={order.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center hover:underline"
                            title={order.link}
                          >
                            <span className="truncate mr-1">
                              {order.link?.replace(/^https?:\/\//, '') || 'N/A'}
                            </span>
                            <FaExternalLinkAlt className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {currency === 'USD' ? (
                            `$${order.usdPrice?.toFixed(2) || '0.00'}`
                          ) : (
                            `৳${order.bdtPrice?.toFixed(2) || '0.00'}`
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {order.startCount || '0'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {order.qty?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {order.service?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.category?.category_name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {order.remains || order.qty || '0'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            View
                          </button>
                          {order.status === 'pending' && (
                            <button 
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                              title="Cancel Order"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaClipboardList className="text-4xl text-gray-400 mb-4" />
                        <div className="text-lg font-medium">No orders found</div>
                        <div className="text-sm">Try adjusting your search or filter criteria</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 text-sm rounded-lg ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}