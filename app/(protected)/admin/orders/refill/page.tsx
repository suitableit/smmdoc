'use client';

import React, { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaDownload,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaEye,
  FaRedo,
  FaSearch,
  FaSync,
  FaTimes,
} from 'react-icons/fa';

// Toast Component
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
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

// Define interfaces for type safety
interface Order {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    currency: string;
    balance: number;
  };
  service: {
    id: string;
    name: string;
    rate: number;
    min_order: number;
    max_order: number;
    status: string;
  };
  category: {
    id: string;
    category_name: string;
  };
  qty: number;
  price: number;
  usdPrice: number;
  bdtPrice: number;
  currency: string;
  status: 'completed' | 'partial';
  createdAt: string;
  updatedAt: string;
  link: string;
  startCount: number;
  remains: number;
  avg_time: string;
}

interface RefillInfo {
  eligible: boolean;
  reason?: string;
  order: {
    id: string;
    status: string;
    totalQuantity: number;
    remainingQuantity: number;
    deliveredQuantity: number;
  };
  service: {
    id: string;
    name: string;
    rate: number;
    status: string;
    minOrder: number;
    maxOrder: number;
  };
  user: {
    balance: number;
    currency: string;
  };
  refillOptions: {
    full: {
      quantity: number;
      costUsd: number;
      costBdt: number;
      cost: number;
      affordable: boolean;
    };
    remaining: {
      quantity: number;
      costUsd: number;
      costBdt: number;
      cost: number;
      affordable: boolean;
    };
  };
}

const RefillOrdersPage = () => {
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refillDialogOpen, setRefillDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refillInfo, setRefillInfo] = useState<RefillInfo | null>(null);
  const [refillForm, setRefillForm] = useState({
    type: 'full',
    customQuantity: '',
    reason: '',
  });
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const [stats, setStats] = useState({
    totalRefills: 0,
    pendingRefills: 0,
    completedRefills: 0,
    autoRefillEnabled: 0,
  });

  // Data fetching
  const fetchEligibleOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(
        `/api/admin/orders/refill-orders?${queryParams}`
      );
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
        setStats({
          totalRefills: result.stats.totalEligible,
          pendingRefills: result.stats.partial,
          completedRefills: result.stats.completed,
          autoRefillEnabled: 0, // This would come from settings
        });
      } else {
        showToast(result.error || 'Failed to fetch orders', 'error');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error fetching orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleOrders();
  }, [searchTerm, statusFilter]);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle refill dialog
  const handleOpenRefillDialog = async (order: Order) => {
    try {
      setSelectedOrder(order);
      setRefillDialogOpen(true);

      // Fetch refill information
      const response = await fetch(`/api/admin/orders/${order.id}/refill`);
      const result = await response.json();

      if (result.success) {
        setRefillInfo(result.data);
      } else {
        showToast(
          result.error || 'Failed to fetch refill information',
          'error'
        );
        setRefillDialogOpen(false);
      }
    } catch (error) {
      console.error('Error fetching refill info:', error);
      showToast('Error fetching refill information', 'error');
      setRefillDialogOpen(false);
    }
  };

  // Handle refill creation
  const handleCreateRefill = async () => {
    if (!selectedOrder || !refillInfo) return;

    try {
      setProcessing(true);
      const response = await fetch(
        `/api/admin/orders/${selectedOrder.id}/refill`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refillType: refillForm.type,
            customQuantity:
              refillForm.type === 'custom'
                ? parseInt(refillForm.customQuantity)
                : undefined,
            reason: refillForm.reason || 'Admin initiated refill',
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showToast('Refill order created successfully', 'success');
        setRefillDialogOpen(false);
        setSelectedOrder(null);
        setRefillInfo(null);
        setRefillForm({ type: 'full', customQuantity: '', reason: '' });
        fetchEligibleOrders(); // Refresh the list
      } else {
        showToast(result.error || 'Failed to create refill order', 'error');
      }
    } catch (error) {
      console.error('Error creating refill:', error);
      showToast('Error creating refill order', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Filter orders based on search
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm) ||
      order.service.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'partial':
        return <FaExclamationCircle className="h-3 w-3 text-orange-500" />;
      default:
        return <FaClock className="h-3 w-3 text-gray-500" />;
    }
  };

  const calculateProgress = (qty: number, remains: number) => {
    return qty > 0 ? Math.round(((qty - remains) / qty) * 100) : 0;
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleRefresh = () => {
    fetchEligibleOrders();
    showToast('Orders refreshed successfully!', 'success');
  };

  const handleExport = () => {
    showToast('Export started! Download will begin shortly.', 'info');
  };

  if (loading && orders.length === 0) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <FaSync className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-lg font-medium">
              Loading refillable orders...
            </span>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="page-header mb-6">
          <div>
            <h1 className="page-title">Refill Orders Management</h1>
            <p className="page-description mb-4">
              Create refill orders for completed or partial orders
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center gap-2"
              disabled={loading}
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaDownload />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaRedo />
              </div>
              <div>
                <h3 className="card-title">Eligible Orders</h3>
                <p className="text-2xl font-bold text-green-600">
                  {filteredOrders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaCheckCircle />
              </div>
              <div>
                <h3 className="card-title">Completed Orders</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    filteredOrders.filter((o) => o.status === 'completed')
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaExclamationCircle />
              </div>
              <div>
                <h3 className="card-title">Partial Orders</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredOrders.filter((o) => o.status === 'partial').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="card-content">
              <div className="card-icon">
                <FaDollarSign />
              </div>
              <div>
                <h3 className="card-title">Total Value</h3>
                <p className="text-2xl font-bold text-purple-600">
                  $
                  {filteredOrders
                    .reduce((sum, order) => sum + order.price, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons and Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Left: Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
              <span
                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  statusFilter === 'all'
                    ? 'bg-white/20'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {filteredOrders.length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'completed'
                  ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Completed
              <span
                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  statusFilter === 'completed'
                    ? 'bg-white/20'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {orders.filter((o) => o.status === 'completed').length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('partial')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'partial'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Partial
              <span
                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  statusFilter === 'partial'
                    ? 'bg-white/20'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {orders.filter((o) => o.status === 'partial').length}
              </span>
            </button>
          </div>

          {/* Right: Search Bar with Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:min-w-[300px]">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search eligible orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 pr-4"
              />
            </div>
            <select className="form-select min-w-[120px]">
              <option value="id">Order ID</option>
              <option value="url">Order URL</option>
              <option value="username">Username</option>
            </select>
          </div>
        </div>

        {/* Eligible Orders Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            <div className="flex items-center gap-2 flex-1">
              <div className="card-icon">
                <FaRedo />
              </div>
              <h3 className="card-title">
                Eligible Orders for Refill ({filteredOrders.length})
              </h3>
              <span className="ml-auto bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium">
                Manage Refills
              </span>
            </div>
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {selectedOrders.length} selected
                </span>
                <button className="btn btn-primary flex items-center gap-2">
                  <FaRedo />
                  Bulk Refill
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '0 24px' }}>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FaRedo
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No eligible orders found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No orders are currently eligible for refill or no orders match
                  your filters.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
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
                              selectedOrders.length === filteredOrders.length &&
                              filteredOrders.length > 0
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
                          Service
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Link
                        </th>
                        <th
                          className="text-right p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Quantity
                        </th>
                        <th
                          className="text-right p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Amount
                        </th>
                        <th
                          className="text-center p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Status
                        </th>
                        <th
                          className="text-center p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Progress
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
                      {filteredOrders.map((order) => (
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
                            <div className="font-mono text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                              #{order.id.slice(-8)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {order.user.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {order.user.email}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {order.service.name}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {order.category.category_name}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="max-w-28">
                              <div className="flex items-center gap-1">
                                <a
                                  href={order.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-800 text-xs truncate flex-1"
                                >
                                  {order.link.length > 18
                                    ? order.link.substring(0, 18) + '...'
                                    : order.link}
                                </a>
                                <button
                                  onClick={() =>
                                    window.open(order.link, '_blank')
                                  }
                                  className="text-green-500 hover:text-green-700 p-1 flex-shrink-0"
                                  title="Open link in new tab"
                                >
                                  <FaExternalLinkAlt className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div>
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {order.qty.toLocaleString()}
                              </div>
                              <div className="text-xs text-green-600">
                                {(order.qty - order.remains).toLocaleString()}{' '}
                                delivered
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div>
                              <div
                                className="font-semibold text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                ${order.price.toFixed(2)}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {order.currency}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit mx-auto">
                              {getStatusIcon(order.status)}
                              <span className="text-xs font-medium capitalize">
                                {order.status}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="space-y-1">
                              <div
                                className="text-xs font-medium"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {calculateProgress(order.qty, order.remains)}%
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${calculateProgress(
                                      order.qty,
                                      order.remains
                                    )}%`,
                                  }}
                                />
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {order.remains} remaining
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenRefillDialog(order)}
                                className="btn btn-primary flex items-center gap-1 text-xs"
                              >
                                <FaRedo className="h-3 w-3" />
                                Create Refill
                              </button>
                              <button
                                onClick={() =>
                                  window.open(
                                    `/admin/orders/${order.id}`,
                                    '_blank'
                                  )
                                }
                                className="btn btn-secondary p-2"
                                title="View Order Details"
                              >
                                <FaEye className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Visible on tablet and mobile */}
                <div className="lg:hidden">
                  <div
                    className="space-y-4"
                    style={{ padding: '24px 0 24px 0' }}
                  >
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="card card-padding border-l-4 border-green-500 mb-4"
                      >
                        {/* Header with ID and Actions */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                            <div className="font-mono text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                              #{order.id.slice(-8)}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                              {getStatusIcon(order.status)}
                              <span className="text-xs font-medium capitalize">
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                window.open(
                                  `/admin/orders/${order.id}`,
                                  '_blank'
                                )
                              }
                              className="btn btn-secondary p-2"
                              title="View Order Details"
                            >
                              <FaEye className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* User Info */}
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
                              {order.user.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {order.user.email}
                            </div>
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="mb-4">
                          <div
                            className="font-mono text-xs mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            #{order.service.id}
                          </div>
                          <div
                            className="font-medium text-sm mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {order.service.name}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {order.category.category_name}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <a
                              href={order.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-xs flex-1 truncate"
                            >
                              {order.link.length > 38
                                ? order.link.substring(0, 38) + '...'
                                : order.link}
                            </a>
                            <button
                              onClick={() => window.open(order.link, '_blank')}
                              className="text-green-500 hover:text-green-700 p-1 flex-shrink-0"
                              title="Open link in new tab"
                            >
                              <FaExternalLinkAlt className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Financial Info */}
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
                              ${order.price.toFixed(2)} {order.currency}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              User Balance
                            </div>
                            <div className="font-semibold text-sm text-green-600">
                              ${order.user.balance.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Quantity and Progress Info */}
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
                              {order.qty.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600">
                              {(order.qty - order.remains).toLocaleString()}{' '}
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
                              {order.startCount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
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
                              {calculateProgress(order.qty, order.remains)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${calculateProgress(
                                  order.qty,
                                  order.remains
                                )}%`,
                              }}
                            />
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {order.remains} remaining
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleOpenRefillDialog(order)}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            <FaRedo className="h-4 w-4" />
                            Create Refill
                          </button>
                        </div>

                        {/* Date */}
                        <div className="mt-4 pt-4 border-t">
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Date:{' '}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Time:{' '}
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div
                  className="flex items-center justify-between pt-4 border-t"
                  style={{ padding: '16px 24px 24px 24px' }}
                >
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Showing 1 to {filteredOrders.length} of{' '}
                    {filteredOrders.length} orders
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={true}
                      className="btn btn-secondary opacity-50 cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Page 1 of 1
                    </span>
                    <button
                      disabled={true}
                      className="btn btn-secondary opacity-50 cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      {/* Refill Dialog */}
      {refillDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Create Refill Order</h3>
              <button
                onClick={() => setRefillDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Create a refill order for #{selectedOrder?.id.slice(-8)}. This
              will create a new order to replace any lost engagement.
            </p>

            {refillInfo && (
              <div className="space-y-6">
                {/* Order Information */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Original Quantity
                    </div>
                    <div
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {refillInfo.order.totalQuantity.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Remaining
                    </div>
                    <div className="font-semibold text-orange-600">
                      {refillInfo.order.remainingQuantity.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      User Balance
                    </div>
                    <div className="font-semibold text-green-600">
                      ${refillInfo.user.balance.toFixed(2)}{' '}
                      {refillInfo.user.currency}
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Service Status
                    </div>
                    <div className="font-semibold text-blue-600 capitalize">
                      {refillInfo.service.status}
                    </div>
                  </div>
                </div>

                {/* Refill Options */}
                <div className="space-y-4">
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Refill Type
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        id="full-refill"
                        name="refillType"
                        value="full"
                        checked={refillForm.type === 'full'}
                        onChange={(e) =>
                          setRefillForm((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        className="text-green-600"
                      />
                      <label
                        htmlFor="full-refill"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          Full Refill (
                          {refillInfo.refillOptions.full.quantity.toLocaleString()}
                          )
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Cost: ${refillInfo.refillOptions.full.cost.toFixed(2)}
                          {refillInfo.refillOptions.full.affordable ? (
                            <span className="text-green-600 ml-2">
                              ✓ Affordable
                            </span>
                          ) : (
                            <span className="text-red-600 ml-2">
                              ✗ Insufficient balance
                            </span>
                          )}
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        id="remaining-refill"
                        name="refillType"
                        value="remaining"
                        checked={refillForm.type === 'remaining'}
                        onChange={(e) =>
                          setRefillForm((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        className="text-green-600"
                      />
                      <label
                        htmlFor="remaining-refill"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          Remaining Only (
                          {refillInfo.refillOptions.remaining.quantity.toLocaleString()}
                          )
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Cost: $
                          {refillInfo.refillOptions.remaining.cost.toFixed(2)}
                          {refillInfo.refillOptions.remaining.affordable ? (
                            <span className="text-green-600 ml-2">
                              ✓ Affordable
                            </span>
                          ) : (
                            <span className="text-red-600 ml-2">
                              ✗ Insufficient balance
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Reason (Optional)
                  </div>
                  <input
                    type="text"
                    placeholder="Enter reason for refill..."
                    value={refillForm.reason}
                    onChange={(e) =>
                      setRefillForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="form-field w-full"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setRefillDialogOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRefill}
                disabled={processing || !refillInfo?.eligible}
                className="btn btn-primary flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <FaSync className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaRedo className="h-4 w-4" />
                    Create Refill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefillOrdersPage;
