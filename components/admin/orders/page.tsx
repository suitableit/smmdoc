'use client';

import React from 'react';
import {
  FaBox,
  FaEllipsisH,
  FaEye,
  FaExclamationCircle,
  FaSync,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import GradientSpinner from '@/components/ui/gradient-spinner';
import ChangeAllStatusModal from './modals/change-all-status';
import MarkPartialModal from './modals/mark-partial';
import StartCountModal from './modals/start-count';
import UpdateOrderStatusModal from './modals/update-order-status';

interface Order {
  id: string;
  user?: {
    username?: string;
    email?: string;
    name?: string;
  };
  charge?: number;
  profit?: number;
  usdPrice?: number;
  link?: string;
  seller?: string;
  startCount?: number;
  qty?: number;
  service?: {
    id?: string;
    name?: string;
    rate?: number;
  };
  category?: {
    category_name?: string;
  };
  status?: string;
  remains?: number;
  createdAt?: string;
  mode?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface OrdersTableProps {
  orders: Order[];
  ordersLoading: boolean;
  selectedOrders: string[];
  pagination: PaginationInfo;
  bulkStatusDialog: { open: boolean };
  markPartialDialog: { open: boolean; orderId: string };
  editStartCountDialog: { open: boolean; orderId: string; currentCount: number };
  updateStatusDialog: { open: boolean; orderId: string; currentStatus: string };
  bulkStatus: string;
  handleSelectOrder: (orderId: string) => void;
  handleSelectAll: () => void;
  setPagination: React.Dispatch<React.SetStateAction<PaginationInfo>>;
  setBulkStatusDialog: React.Dispatch<React.SetStateAction<{ open: boolean }>>;
  setMarkPartialDialog: React.Dispatch<React.SetStateAction<{ open: boolean; orderId: string }>>;
  setEditStartCountDialog: React.Dispatch<React.SetStateAction<{ open: boolean; orderId: string; currentCount: number }>>;
  setUpdateStatusDialog: React.Dispatch<React.SetStateAction<{ open: boolean; orderId: string; currentStatus: string }>>;
  setBulkStatus: React.Dispatch<React.SetStateAction<string>>;
  openEditStartCountDialog: (orderId: string, currentCount: number) => void;
  openMarkPartialDialog: (orderId: string) => void;
  openUpdateStatusDialog: (orderId: string, currentStatus: string) => void;
  handleBulkStatusUpdate: () => void;
  fetchOrders: () => void;
  fetchStats: () => void;
  fetchAllOrdersForCounts: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  formatPrice: (price: number, decimals: number) => string;
  formatNumber: (num: number) => string;
  formatID: (id: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  calculateProgress: (qty: number, remains: number) => number;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  ordersLoading,
  selectedOrders,
  pagination,
  bulkStatusDialog,
  markPartialDialog,
  editStartCountDialog,
  updateStatusDialog,
  bulkStatus,
  handleSelectOrder,
  handleSelectAll,
  setPagination,
  setBulkStatusDialog,
  setMarkPartialDialog,
  setEditStartCountDialog,
  setUpdateStatusDialog,
  setBulkStatus,
  openEditStartCountDialog,
  openMarkPartialDialog,
  openUpdateStatusDialog,
  handleBulkStatusUpdate,
  fetchOrders,
  fetchStats,
  fetchAllOrdersForCounts,
  showToast,
  formatPrice,
  formatNumber,
  formatID,
  getStatusIcon,
  calculateProgress,
}) => {
  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center flex flex-col items-center">
          <GradientSpinner size="w-12 h-12" className="mb-3" />
          <div className="text-base font-medium">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <FaBox
          className="h-16 w-16 mx-auto mb-4"
          style={{ color: 'var(--text-muted)' }}
        />
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          No information was found for you.
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No orders match your current filters or no orders exist yet.
        </p>
      </div>
    );
  }

  return (
    <React.Fragment>
      {/* Table View - Visible on all screen sizes */}
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
                  onChange={handleSelectAll}
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
                Profit
              </th>
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Price (Unit/Total)
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
                Seller
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
                    onChange={() => handleSelectOrder(order.id)}
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
                  <div className="text-right">
                    <div
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      $
                      {order.charge
                        ? formatPrice(order.charge, 2)
                        : '0.00'}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-right">
                    <div className="font-semibold text-sm text-green-600">
                      $
                      {order.profit
                        ? formatPrice(order.profit, 2)
                        : '0.00'}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-right">
                    <div className="font-semibold text-sm text-600">
                      ${formatPrice(order.usdPrice || 0, 2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Rate: ${order.service?.rate || 0}/1000 × {order.qty || 1}
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
                    {order.seller || 'null'}
                  </div>
                </td>
                <td className="p-3">
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {order.startCount
                      ? formatNumber(order.startCount)
                      : 'null'}
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-right">
                    <div
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {order.qty ? formatNumber(order.qty) : 'null'}
                    </div>
                    <div className="text-xs text-green-600">
                      {order.qty && order.remains
                        ? formatNumber(order.qty - order.remains)
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
                        ? formatID(order.service.id)
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
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit">
                    {getStatusIcon(order.status || '')}
                    <span className="text-xs font-medium capitalize">
                      {order.status
                        ? order.status.replace('_', ' ')
                        : 'null'}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-right">
                    <div
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {order.remains ? formatNumber(order.remains) : 'null'}
                    </div>
                    <div className="text-xs text-blue-600">
                      {order.qty && order.remains
                        ? calculateProgress(order.qty, order.remains)
                        : 0}
                      % complete
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : 'null'}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString()
                        : 'null'}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded w-fit ${
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
                  <div className="relative">
                    <button
                      className="btn btn-secondary p-2"
                      title="More Actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        const dropdown = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        dropdown?.classList.toggle('hidden');
                      }}
                    >
                      <FaEllipsisH className="h-3 w-3" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            openEditStartCountDialog(
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
                            openMarkPartialDialog(order.id);
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
                            openUpdateStatusDialog(
                              order.id,
                              order.status || ''
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Hidden (using table view instead) */}
      <div className="hidden">
        {/* This section is hidden as we're using table view on all screen sizes */}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
        <div
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {ordersLoading ? (
            <div className="flex items-center gap-2">
              <GradientSpinner size="w-4 h-4" />
              <span>Loading pagination...</span>
            </div>
          ) : (
            `Showing ${formatNumber(
              (pagination.page - 1) * pagination.limit + 1
            )} to ${formatNumber(
              Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )
            )} of ${formatNumber(pagination.total)} orders`
          )}
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={!pagination.hasPrev || ordersLoading}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {ordersLoading ? (
              <GradientSpinner size="w-4 h-4" />
            ) : (
              `Page ${formatNumber(
                pagination.page
              )} of ${formatNumber(pagination.totalPages)}`
            )}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.totalPages, prev.page + 1),
              }))
            }
            disabled={!pagination.hasNext || ordersLoading}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      </div>

      {/* Bulk Status Change Dialog */}
      <ChangeAllStatusModal
        isOpen={bulkStatusDialog.open}
        onClose={() => setBulkStatusDialog({ open: false })}
        selectedOrdersCount={selectedOrders.length}
        bulkStatus={bulkStatus}
        setBulkStatus={setBulkStatus}
        onUpdate={handleBulkStatusUpdate}
      />

      {/* Mark Partial Dialog */}
      <MarkPartialModal
        isOpen={markPartialDialog.open}
        onClose={() => setMarkPartialDialog({ open: false, orderId: '' })}
        orderId={markPartialDialog.orderId}
        onSuccess={() => {
          fetchOrders();
          fetchStats();
          fetchAllOrdersForCounts();
        }}
        showToast={showToast}
      />

      {/* Edit Start Count Dialog */}
      <StartCountModal
        isOpen={editStartCountDialog.open}
        onClose={() => setEditStartCountDialog({ open: false, orderId: '', currentCount: 0 })}
        orderId={editStartCountDialog.orderId}
        currentCount={editStartCountDialog.currentCount}
        onSuccess={() => {
          fetchOrders();
          fetchStats();
          fetchAllOrdersForCounts();
        }}
        showToast={showToast}
      />

      {/* Update Status Dialog */}
      <UpdateOrderStatusModal
        isOpen={updateStatusDialog.open}
        onClose={() => setUpdateStatusDialog({ open: false, orderId: '', currentStatus: '' })}
        orderId={updateStatusDialog.orderId}
        currentStatus={updateStatusDialog.currentStatus}
        onSuccess={() => {
          fetchOrders();
          fetchStats();
          fetchAllOrdersForCounts();
        }}
        showToast={showToast}
      />
    </React.Fragment>
  );
};

export default OrdersTable;