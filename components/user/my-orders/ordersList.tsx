'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useCurrency from '@/hooks/useCurrency';
import { useGetUserOrdersQuery } from '@/lib/services/userOrderApi';
import moment from 'moment';
import { useMemo, useState } from 'react';

export default function OrdersList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { currency } = useCurrency();

  const { data, isLoading, error } = useGetUserOrdersQuery({ page, limit, status, search });

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

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  if (error) {
    return <div className="text-red-500">Error loading orders!</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="w-full md:w-80">
          <div className="relative">
            <Input
              placeholder="Search orders..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
            <Button 
              type="submit" 
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </Button>
          </div>
        </form>

        {/* Status filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Label htmlFor="status" className="whitespace-nowrap">Status</Label>
          <select
            id="status"
            className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Link</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order: any) => (
                <tr 
                  key={order.id} 
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="p-3">
                    <span className="text-xs">{order.id.substring(0, 10)}...</span>
                  </td>
                  <td className="p-3 max-w-[200px]">
                    <div className="truncate text-sm">{order.service.name}</div>
                    <div className="text-xs text-gray-500">{order.category.category_name}</div>
                  </td>
                  <td className="p-3">
                    <div className="max-w-[120px] truncate text-xs">
                      <a 
                        href={order.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {order.link}
                      </a>
                    </div>
                  </td>
                  <td className="p-3">{order.qty}</td>
                  <td className="p-3">
                    {currency === 'USD' ? (
                      <span>${order.usdPrice.toFixed(2)}</span>
                    ) : (
                      <span>৳{order.bdtPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge className={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {moment(order.createdAt).format('DD/MM/YYYY')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 0 && (         <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Total: {pagination.total} orders | Page {pagination.page} / {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}