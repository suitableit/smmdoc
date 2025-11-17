'use client';

import React from 'react';
import {
  FaEllipsisH,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaEye,
  FaSync,
  FaEdit,
} from 'react-icons/fa';
import { formatID, formatNumber, formatPrice, formatCount } from '@/lib/utils';

const cleanLinkDisplay = (link: string): string => {
  if (!link) return link;
  let cleaned = link;
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^www\./i, '');
  return cleaned;
};

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
  apiResponse?: string;
  refillRequests?: Array<{
    id: number;
    status: string;
  }>;
}

interface OrdersTableContentProps {
  orders: Order[];
  selectedOrders: number[];
  onSelectOrder: (orderId: number) => void;
  onSelectAll: () => void;
  onResendOrder: (orderId: number) => void;
  onEditStartCount: (orderId: number, startCount: number) => void;
  onMarkPartial: (orderId: number) => void;
  onUpdateStatus: (orderId: number, status: string) => void;
  onViewOrderErrors?: (orderId: number) => void;
  onEditOrderUrl?: (orderId: number) => void;
  formatID: (id: number) => string;
  formatNumber: (num: number) => string;
  formatPrice: (price: number, decimals?: number) => string;
  getStatusIcon: (status: string) => React.ReactElement;
  calculateProgress: (qty: number, remains: number) => number;
}

const OrdersTableContent: React.FC<OrdersTableContentProps> = ({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onResendOrder,
  onEditStartCount,
  onMarkPartial,
  onUpdateStatus,
  onViewOrderErrors,
  onEditOrderUrl,
  formatID: formatIDProp,
  formatNumber: formatNumberProp,
  formatPrice: formatPriceProp,
  getStatusIcon: getStatusIconProp,
  calculateProgress: calculateProgressProp,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[1200px]">
        <thead className="sticky top-0 bg-white dark:bg-gray-800 border-b z-10">
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
              className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
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
                        {(() => {
                          const cleanedLink = cleanLinkDisplay(order.link);
                          return cleanedLink.length > 18
                            ? cleanedLink.substring(0, 18) + '...'
                            : cleanedLink;
                        })()}
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
                  {order.service?.providerName || order.seller || 'Self'}
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
                    {order.qty && order.remains !== undefined && order.remains !== null
                      ? formatCount(Number(order.qty) - Number(order.remains))
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
                    {order.service?.id
                      ? formatIDProp(order.service.id)
                      : 'null'}
                  </div>
                  <div
                    className="font-medium text-sm truncate max-w-44"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {order.service?.name || 'null'}
                  </div>
                  <div
                    className="text-xs truncate max-w-44"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {order.category?.category_name || 'null'}
                  </div>
                </div>
              </td>
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
                    {order.qty && order.remains !== undefined && order.remains !== null
                      ? calculateProgressProp(
                          Number(order.qty),
                          Number(order.remains)
                        )
                      : 0}
                    %
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          order.qty && order.remains !== undefined && order.remains !== null
                            ? calculateProgressProp(
                                Number(order.qty),
                                Number(order.remains)
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
                    {order.remains !== undefined && order.remains !== null
                      ? formatCount(Number(order.remains))
                      : '0'}{' '}
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
                    <div className="hidden absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {(() => {
                          const status = order.status?.toLowerCase();
                          
                          const pendingOrInProgress = ['pending', 'in_progress', 'inprogress', 'processing'].includes(status);
                          const failed = status === 'failed';
                          const cancelledOrCompleted = ['cancelled', 'canceled', 'completed'].includes(status);
                          
                          const showResendOrder = failed;
                          
                          const isAutoMode = !!order.providerOrderId;
                          const showEditOrderUrl = (pendingOrInProgress || failed) && !isAutoMode;
                          
                          const showEditStartCount = (pendingOrInProgress || failed || cancelledOrCompleted) && !isAutoMode;
                          const showMarkPartial = (pendingOrInProgress || failed || cancelledOrCompleted) && !isAutoMode;
                          const showUpdateStatus = pendingOrInProgress || failed || cancelledOrCompleted;
                          
                          return (
                            <>
                              {showResendOrder && (
                                <button
                                  onClick={() => {
                                    onResendOrder(order.id);
                                    const dropdown = document.querySelector(
                                      '.absolute.right-0'
                                    ) as HTMLElement;
                                    dropdown?.classList.add('hidden');
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <FaSync className="h-3 w-3" />
                                  Resend Order
                                </button>
                              )}
                              {showEditOrderUrl && onEditOrderUrl && (
                                <button
                                  onClick={() => {
                                    onEditOrderUrl(order.id);
                                    const dropdown = document.querySelector(
                                      '.absolute.right-0'
                                    ) as HTMLElement;
                                    dropdown?.classList.add('hidden');
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <FaEdit className="h-3 w-3" />
                                  Edit Order URL
                                </button>
                              )}
                              {showEditStartCount && (
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
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <FaEye className="h-3 w-3" />
                                  Edit Start Count
                                </button>
                              )}
                              {showMarkPartial && order.status !== 'partial' && (
                                <button
                                  onClick={() => {
                                    onMarkPartial(order.id);
                                    const dropdown = document.querySelector(
                                      '.absolute.right-0'
                                    ) as HTMLElement;
                                    dropdown?.classList.add('hidden');
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <FaExclamationCircle className="h-3 w-3" />
                                  Mark Partial
                                </button>
                              )}
                              {showUpdateStatus && (
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
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <FaSync className="h-3 w-3" />
                                  Update Order Status
                                </button>
                              )}
                            </>
                          );
                        })()}
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
  );
};

export default OrdersTableContent;
