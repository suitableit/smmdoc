'use client';

import React from 'react';
import {
  FaCheckCircle,
  FaClock,
  FaEllipsisH,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaEye,
  FaSync,
  FaTimesCircle,
} from 'react-icons/fa';
import { formatID, formatNumber, formatPrice, formatCount } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Order {
  id: number;
  user: {
    id: number;
    email: string;
    name: string;
    username?: string;
    currency: string;
  };
  service: {
    id: number;
    name: string;
    rate: number;
    min_order: number;
    max_order: number;
    providerId?: number;
    providerName?: string;
    providerServiceId?: string;
  };
  category: {
    id: number;
    category_name: string;
  };
  qty: number;
  price: number;
  charge: number;
  profit: number;
  usdPrice: number;
  bdtPrice: number;
  currency: string;
  status:
    | 'pending'
    | 'processing'
    | 'in_progress'
    | 'completed'
    | 'partial'
    | 'cancelled'
    | 'refunded'
    | 'failed';
  createdAt: string;
  updatedAt: string;
  link: string;
  startCount: number;
  remains: number;
  avg_time: string;
  seller: string;
  mode: string;
  isProviderService?: boolean;
  providerId?: string;
  providerServiceId?: string;
  providerOrderId?: string;
  providerStatus?: string;
  lastSyncAt?: string;
  apiProvider?: {
    id: string;
    name: string;
    apiUrl: string;
    status: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface OrderTableProps {
  orders: Order[];
  selectedOrders: number[];
  onSelectOrder: (orderId: number) => void;
  onSelectAll: () => void;
  onResendOrder: (orderId: number) => void;
  onEditStartCount: (orderId: number, startCount: number) => void;
  onMarkPartial: (orderId: number) => void;
  onUpdateStatus: (orderId: number, status: string) => void;
  pagination: PaginationInfo;
  onPageChange: (newPage: number) => void;
  isLoading: boolean;
  formatID: (id: number) => string;
  formatNumber: (num: number) => string;
  formatPrice: (price: number, decimals?: number) => string;
  getStatusIcon: (status: string) => React.ReactElement;
  calculateProgress: (qty: number, remains: number) => number;
}


const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onResendOrder,
  onEditStartCount,
  onMarkPartial,
  onUpdateStatus,
  pagination,
  onPageChange,
  isLoading,
  formatID: formatIDProp,
  formatNumber: formatNumberProp,
  formatPrice: formatPriceProp,
  getStatusIcon: getStatusIconProp,
  calculateProgress: calculateProgressProp,
}) => {
  const { availableCurrencies } = useCurrency();

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `$${formatPriceProp(amount, 2)}`;
    } else if (currency === 'BDT') {
      return `৳${formatPriceProp(amount, 2)}`;
    } else if (currency === 'XCD') {
      return `$${formatPriceProp(amount, 2)}`;
    } else {

      const currencyData = availableCurrencies?.find(c => c.code === currency);
      const symbol = currencyData?.symbol || '$';
      return `${symbol}${formatPriceProp(amount, 2)}`;
    }
  };

  return (
    <React.Fragment>
      {}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="sticky top-0 bg-white border-b z-10">
            <tr>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedOrders.length === orders.length &&
                    orders.length > 0
                  }
                  onChange={onSelectAll}
                  className="rounded border-gray-300 w-4 h-4"
                />
              </th>
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
                User
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Charge
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Link
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Provider
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Start
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Quantity
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Service
              </th>

              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Status
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Remains
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Date
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Mode
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => onSelectOrder(order.id)}
                    className="rounded border-gray-300 w-4 h-4"
                  />
                </td>
                <td className="p-3">
                  <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {order.id || 'null'}
                  </div>
                </td>
                <td className="p-3">
                  <div
                    className="font-medium text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {order.user?.username ||
                      order.user?.email?.split('@')[0] ||
                      order.user?.name ||
                      'null'}
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-left">
                    <div
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      $
                      {order.charge
                        ? formatPriceProp(order.charge, 2)
                        : '0.00'}
                    </div>
                    <div className="text-xs text-green-600">
                      Profit: $
                      {order.profit
                        ? formatPriceProp(order.profit, 2)
                        : '0.00'}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="max-w-28">
                    {order.link ? (
                      <div className="flex items-center gap-1">
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs truncate flex-1"
                        >
                          {order.link.length > 18
                            ? order.link.substring(0, 18) + '...'
                            : order.link}
                        </a>
                        <button
                          onClick={() =>
                            window.open(order.link, '_blank')
                          }
                          className="text-blue-500 hover:text-blue-700 p-1 flex-shrink-0"
                          title="Open link in new tab"
                        >
                          <FaExternalLinkAlt className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        null
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {order.service?.providerName || order.seller || 'null'}
                  </div>
                </td>
                <td className="p-3">
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {typeof order.startCount === 'number'
                      ? formatCount(order.startCount)
                      : '0'}
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-left">
                    <div
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {order.qty ? formatCount(order.qty) : 'null'}
                    </div>
                    <div className="text-xs text-green-600">
                      {order.qty && order.remains
                        ? formatCount(order.qty - order.remains)
                        : '0'}{' '}
                      delivered
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div
                      className="font-mono text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {}
                      {order.service?.id
                        ? formatIDProp(order.service.id)
                        : 'null'}
                    </div>
                    <div
                      className="font-medium text-sm truncate max-w-44"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {}
                      {order.service?.name || 'null'}
                    </div>
                    <div
                      className="text-xs truncate max-w-44"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {}
                      {order.category?.category_name || 'null'}
                    </div>
                  </div>
                </td>

                {}
                <td className="p-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                    {getStatusIconProp(order.status)}
                    <span className="text-xs font-medium capitalize">
                      {order.status ? order.status.replace('_', ' ') : 'null'}
                    </span>
                  </div>
                </td>

                <td className="p-3">
                  <div className="space-y-1">
                    <div
                      className="text-xs font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {order.qty && order.remains
                        ? calculateProgressProp(order.qty, order.remains)
                        : 0}
                      %
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            order.qty && order.remains
                              ? calculateProgressProp(
                                  order.qty,
                                  order.remains
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {order.remains
                        ? formatCount(order.remains)
                        : 'null'}{' '}
                      left
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div className="text-xs">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : 'null'}
                    </div>
                    <div className="text-xs">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleTimeString()
                        : 'null'}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      order.mode === 'Auto'
                        ? 'bg-green-100 text-green-800'
                        : order.mode === 'Manual'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.mode || 'null'}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center">
                    {}
                    <div className="relative">
                      <button
                        className="btn btn-secondary p-2"
                        title="More Actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          const dropdown = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          dropdown.classList.toggle('hidden');
                        }}
                      >
                        <FaEllipsisH className="h-3 w-3" />
                      </button>

                      {}
                      <div className="hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          {(order.status === 'failed' || order.status === 'pending') && (
                            <button
                              onClick={() => {
                                onResendOrder(order.id);
                                const dropdown = document.querySelector(
                                  '.absolute.right-0'
                                ) as HTMLElement;
                                dropdown?.classList.add('hidden');
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <FaSync className="h-3 w-3" />
                              Resend Order
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onEditStartCount(
                                order.id,
                                order.startCount || 0
                              );
                              const dropdown = document.querySelector(
                                '.absolute.right-0'
                              ) as HTMLElement;
                              dropdown?.classList.add('hidden');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FaEye className="h-3 w-3" />
                            Edit Start Count
                          </button>
                          <button
                            onClick={() => {
                              onMarkPartial(order.id);
                              const dropdown = document.querySelector(
                                '.absolute.right-0'
                              ) as HTMLElement;
                              dropdown?.classList.add('hidden');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FaExclamationCircle className="h-3 w-3" />
                            Mark Partial
                          </button>
                          <button
                            onClick={() => {
                              onUpdateStatus(
                                order.id,
                                order.status
                              );
                              const dropdown = document.querySelector(
                                '.absolute.right-0'
                              ) as HTMLElement;
                              dropdown?.classList.add('hidden');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FaSync className="h-3 w-3" />
                            Update Order Status
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {}
      <div className="hidden">
        <div className="space-y-4" style={{ padding: '24px 0 0 0' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              className="card card-padding border-l-4 border-blue-500 mb-4"
            >
              {}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => onSelectOrder(order.id)}
                    className="rounded border-gray-300 w-4 h-4"
                  />
                  <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {order.id || 'null'}
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                    {getStatusIconProp(order.status)}
                    <span className="text-xs font-medium capitalize">
                      {order.status
                        ? order.status.replace('_', ' ')
                        : 'null'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  {}
                  <div className="relative">
                    <button
                      className="btn btn-secondary p-2"
                      title="More Actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        const dropdown = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        dropdown.classList.toggle('hidden');
                      }}
                    >
                      <FaEllipsisH className="h-3 w-3" />
                    </button>

                    {}
                    <div className="hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {(order.status === 'failed' || order.status === 'pending') && (
                          <button
                            onClick={() => {
                              onResendOrder(order.id);
                              const dropdown = document.querySelector(
                                '.absolute.right-0'
                              ) as HTMLElement;
                              dropdown?.classList.add('hidden');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FaSync className="h-3 w-3" />
                            Resend Order
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onEditStartCount(
                              order.id,
                              order.startCount || 0
                            );
                            const dropdown = document.querySelector(
                              '.absolute.right-0'
                            ) as HTMLElement;
                            dropdown?.classList.add('hidden');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FaEye className="h-3 w-3" />
                          Edit Start Count
                        </button>
                        <button
                          onClick={() => {
                            onMarkPartial(order.id);
                            const dropdown = document.querySelector(
                              '.absolute.right-0'
                            ) as HTMLElement;
                            dropdown?.classList.add('hidden');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FaExclamationCircle className="h-3 w-3" />
                          Mark Partial
                        </button>
                        <button
                          onClick={() => {
                            onUpdateStatus(
                              order.id,
                              order.status
                            );
                            const dropdown = document.querySelector(
                              '.absolute.right-0'
                            ) as HTMLElement;
                            dropdown?.classList.add('hidden');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FaSync className="h-3 w-3" />
                          Update Order Status
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    User
                  </div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {order.user?.username ||
                      order.user?.email?.split('@')[0] ||
                      order.user?.name ||
                      'null'}
                  </div>
                </div>
                <div
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    order.mode === 'Auto'
                      ? 'bg-green-100 text-green-800'
                      : order.mode === 'Manual'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.mode || 'null'}
                </div>
              </div>

              {}
              <div className="mb-4">
                <div
                  className="font-mono text-xs mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {}
                  {order.service?.id
                    ? formatIDProp(order.service.id)
                    : 'null'}
                </div>
                <div
                  className="font-medium text-sm mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {}
                  {order.service?.name || 'null'}
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {}
                  {order.category?.category_name || 'null'} •
                  Provider: {order.seller || 'null'}
                </div>
                {}
                {order.isProviderService && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Provider Order Status
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        ID: {order.providerOrderId || 'N/A'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.providerStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                        order.providerStatus === 'In progress' ? 'bg-yellow-100 text-yellow-700' :
                        order.providerStatus === 'Pending' ? 'bg-orange-100 text-orange-700' :
                        order.providerStatus === 'Canceled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.providerStatus || 'Unknown'}
                      </span>
                    </div>
                    {order.lastSyncAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last sync: {new Date(order.lastSyncAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
                {order.link ? (
                  <div className="flex items-center gap-1 mt-1">
                    <a
                      href={order.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs flex-1 truncate"
                    >
                      {order.link.length > 38
                        ? order.link.substring(0, 38) + '...'
                        : order.link}
                    </a>
                    <button
                      onClick={() =>
                        window.open(order.link, '_blank')
                      }
                      className="text-blue-500 hover:text-blue-700 p-1 flex-shrink-0"
                      title="Open link in new tab"
                    >
                      <FaExternalLinkAlt className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span
                    className="text-xs mt-1 block"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    null
                  </span>
                )}
              </div>

              {}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Unit Price
                  </div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    ${formatPriceProp(order.usdPrice || 0, 2)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Total Price
                  </div>
                  <div className="font-semibold text-sm text-blue-600">
                    ${formatPriceProp(order.usdPrice || 0, 2)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Profit
                  </div>
                  <div className="font-semibold text-sm text-green-600">
                    $
                    {order.profit
                      ? formatPriceProp(order.profit, 2)
                      : '0.00'}
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Quantity
                  </div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {order.qty ? formatCount(order.qty) : 'null'}
                  </div>
                  <div className="text-xs text-green-600">
                    {order.qty && order.remains
                      ? formatCount(order.qty - order.remains)
                      : '0'}{' '}
                    delivered
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Start Count
                  </div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {order.startCount
                      ? formatCount(order.startCount)
                      : 'null'}
                  </div>
                </div>
              </div>

              {}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Progress
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {order.qty && order.remains
                      ? calculateProgressProp(order.qty, order.remains)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        order.qty && order.remains
                          ? calculateProgressProp(
                              order.qty,
                              order.remains
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {order.remains ? formatCount(order.remains) : 'null'} remaining
                </div>
              </div>

              {}
              <div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Date:{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : 'null'}
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Time:{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleTimeString()
                    : 'null'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
        <div
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span>Loading pagination...</span>
            </div>
          ) : (
            `Showing ${formatNumberProp(
              (pagination.page - 1) * pagination.limit + 1
            )} to ${formatNumberProp(
              Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )
            )} of ${formatNumberProp(pagination.total)} orders`
          )}
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={() =>
              onPageChange(Math.max(1, pagination.page - 1))
            }
            disabled={!pagination.hasPrev || isLoading}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              `Page ${formatNumberProp(
                pagination.page
              )} of ${formatNumberProp(pagination.totalPages)}`
            )}
          </span>
          <button
            onClick={() =>
              onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
            }
            disabled={!pagination.hasNext || isLoading}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default OrderTable;