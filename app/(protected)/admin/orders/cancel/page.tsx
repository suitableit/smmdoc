'use client';

import BreadCrumb from '@/components/shared/BreadCrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { formatNumber, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

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
  status: 'pending' | 'processing' | 'in_progress';
  createdAt: string;
  updatedAt: string;
  link: string;
  startCount: number;
  remains: number;
  avg_time: string;
}

interface CancelInfo {
  eligible: boolean;
  reason?: string;
  order: {
    id: string;
    status: string;
    totalQuantity: number;
    deliveredQuantity: number;
    remainingQuantity: number;
    totalCost: number;
  };
  refund: {
    eligible: boolean;
    amount: number;
    currency: string;
    reason?: string;
  };
  user: {
    balance: number;
    currency: string;
  };
}

export default function CancelOrdersPage() {
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelInfo, setCancelInfo] = useState<CancelInfo | null>(null);
  const [cancelForm, setCancelForm] = useState({
    reason: '',
    refundType: 'full',
    customRefundAmount: '',
  });
  const [processing, setProcessing] = useState(false);

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Orders', link: '/admin/orders' },
    { title: 'Cancel Orders', link: '/admin/orders/cancel' },
  ];

  // Data fetching
  const fetchCancellableOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(
        `/api/admin/orders/cancel-orders?${queryParams}`
      );
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancellableOrders();
  }, [searchTerm, statusFilter]);

  // Handle cancel dialog
  const handleOpenCancelDialog = async (order: Order) => {
    try {
      setSelectedOrder(order);
      setCancelDialogOpen(true);

      // Fetch cancel information
      const response = await fetch(`/api/admin/orders/${order.id}/cancel`);
      const result = await response.json();

      if (result.success) {
        setCancelInfo(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch cancel information');
        setCancelDialogOpen(false);
      }
    } catch (error) {
      console.error('Error fetching cancel info:', error);
      toast.error('Error fetching cancel information');
      setCancelDialogOpen(false);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelInfo) return;

    try {
      setProcessing(true);
      const response = await fetch(
        `/api/admin/orders/${selectedOrder.id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: cancelForm.reason || 'Admin cancelled order',
            refundType: cancelForm.refundType,
            customRefundAmount:
              cancelForm.refundType === 'custom'
                ? parseFloat(cancelForm.customRefundAmount)
                : undefined,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Order cancelled successfully');
        setCancelDialogOpen(false);
        setSelectedOrder(null);
        setCancelInfo(null);
        setCancelForm({
          reason: '',
          refundType: 'full',
          customRefundAmount: '',
        });
        fetchCancellableOrders(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error cancelling order');
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
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'processing':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateProgress = (qty: number, remains: number) => {
    return qty > 0 ? Math.round(((qty - remains) / qty) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-red-50 min-h-screen">
        <div className="flex items-center justify-between py-1">
          <BreadCrumb items={breadcrumbItems} />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-red-500" />
            <span className="text-lg font-medium">
              Loading cancellable orders...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-red-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between py-1">
        <div>
          <BreadCrumb items={breadcrumbItems} />
          <p className="text-sm text-muted-foreground mt-1">
            Cancel pending, processing, or in-progress orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchCancellableOrders}
            variant="outline"
            size="sm"
            className="shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-red-50 to-rose-100">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">
                  {filteredOrders.length}
                </p>
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Cancellable Orders
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-full">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-yellow-50 to-amber-100">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">
                  {filteredOrders.filter((o) => o.status === 'pending').length}
                </p>
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Pending Orders
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">
                  {
                    filteredOrders.filter((o) =>
                      ['processing', 'in_progress'].includes(o.status)
                    ).length
                  }
                </p>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-violet-100">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">
                  $
                  {formatPrice(filteredOrders
                    .reduce((sum, order) => sum + order.price, 0), 2)}
                </p>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Search className="h-5 w-5 text-red-500" />
            Search Cancellable Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="search"
                className="text-sm font-medium text-gray-700"
              >
                Search Orders
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by ID, user, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium text-gray-700"
              >
                Filter by Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                variant="outline"
                className="flex-1 hover:bg-gray-50 transition-all duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellable Orders Table */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-red-500" />
            Cancellable Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No cancellable orders found
              </h3>
              <p className="text-gray-500 text-sm">
                No orders are currently available for cancellation or no orders
                match your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell>
                        <div className="font-mono text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                          #{order.id.slice(-8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {order.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.service.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.category.category_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <a
                            href={order.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-800 text-sm truncate block"
                          >
                            {order.link}
                            <ExternalLink className="h-3 w-3 inline ml-1" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatNumber(order.qty)}
                          </div>
                          <div className="text-sm text-blue-600">
                            {formatNumber(order.qty - order.remains)}{' '}
                            delivered
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold text-gray-900">
                            ${formatPrice(order.price, 2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.currency}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${getStatusColor(
                            order.status
                          )} transition-all duration-200`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">
                            {order.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">
                            {calculateProgress(order.qty, order.remains)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${calculateProgress(
                                  order.qty,
                                  order.remains
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.remains} remaining
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleOpenCancelDialog(order)}
                            size="sm"
                            variant="destructive"
                            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all duration-200"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Order
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hover:bg-red-50 transition-all duration-200"
                          >
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Cancel order #{selectedOrder?.id.slice(-8)}. This action will stop
              the order processing and may issue a refund.
            </DialogDescription>
          </DialogHeader>

          {cancelInfo && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Order Status
                  </Label>
                  <div className="font-semibold text-red-600 capitalize">
                    {cancelInfo.order.status}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Total Quantity
                  </Label>
                  <div className="font-semibold text-gray-900">
                    {formatNumber(cancelInfo.order.totalQuantity)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Delivered
                  </Label>
                  <div className="font-semibold text-green-600">
                    {formatNumber(cancelInfo.order.deliveredQuantity)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Remaining
                  </Label>
                  <div className="font-semibold text-orange-600">
                    {formatNumber(cancelInfo.order.remainingQuantity)}
                  </div>
                </div>
              </div>

              {/* Refund Information */}
              {cancelInfo.refund.eligible && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">
                      Refund Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Refund Amount
                      </Label>
                      <div className="font-semibold text-green-600">
                        ${formatPrice(cancelInfo.refund.amount, 2)}{' '}
                        {cancelInfo.refund.currency}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        User Balance After
                      </Label>
                      <div className="font-semibold text-green-600">
                        $
                        {formatPrice(
                            cancelInfo.user.balance + cancelInfo.refund.amount, 2)}{' '}
                        {cancelInfo.user.currency}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Refund Type Selection */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Refund Type
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      id="full-refund"
                      name="refundType"
                      value="full"
                      checked={cancelForm.refundType === 'full'}
                      onChange={(e) =>
                        setCancelForm((prev) => ({
                          ...prev,
                          refundType: e.target.value,
                        }))
                      }
                      className="text-red-600"
                    />
                    <label
                      htmlFor="full-refund"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">Full Refund</div>
                      <div className="text-sm text-gray-500">
                        Refund the entire order amount: $
                        {formatPrice(cancelInfo.order.totalCost, 2)}
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      id="partial-refund"
                      name="refundType"
                      value="partial"
                      checked={cancelForm.refundType === 'partial'}
                      onChange={(e) =>
                        setCancelForm((prev) => ({
                          ...prev,
                          refundType: e.target.value,
                        }))
                      }
                      className="text-red-600"
                    />
                    <label
                      htmlFor="partial-refund"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">
                        Partial Refund (Remaining Only)
                      </div>
                      <div className="text-sm text-gray-500">
                        Refund only for undelivered quantity: $
                        {formatPrice(cancelInfo.refund.amount, 2)}
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      id="no-refund"
                      name="refundType"
                      value="none"
                      checked={cancelForm.refundType === 'none'}
                      onChange={(e) =>
                        setCancelForm((prev) => ({
                          ...prev,
                          refundType: e.target.value,
                        }))
                      }
                      className="text-red-600"
                    />
                    <label
                      htmlFor="no-refund"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">No Refund</div>
                      <div className="text-sm text-gray-500">
                        Cancel without issuing any refund
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      id="custom-refund"
                      name="refundType"
                      value="custom"
                      checked={cancelForm.refundType === 'custom'}
                      onChange={(e) =>
                        setCancelForm((prev) => ({
                          ...prev,
                          refundType: e.target.value,
                        }))
                      }
                      className="text-red-600"
                    />
                    <label
                      htmlFor="custom-refund"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">Custom Refund Amount</div>
                      <div className="text-sm text-gray-500">
                        Specify a custom refund amount
                      </div>
                    </label>
                  </div>
                </div>

                {cancelForm.refundType === 'custom' && (
                  <div className="mt-3">
                    <Label htmlFor="customAmount">Custom Refund Amount</Label>
                    <Input
                      id="customAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={cancelInfo.order.totalCost}
                      placeholder="Enter custom refund amount..."
                      value={cancelForm.customRefundAmount}
                      onChange={(e) =>
                        setCancelForm((prev) => ({
                          ...prev,
                          customRefundAmount: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Cancellation Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Cancellation Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for cancellation..."
                  value={cancelForm.reason}
                  onChange={(e) =>
                    setCancelForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">
                      Warning
                    </h4>
                    <p className="text-sm text-yellow-700">
                      This action cannot be undone. The order will be
                      permanently cancelled and any refund will be processed
                      immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancelOrder}
              disabled={processing || !cancelInfo?.eligible}
              variant="destructive"
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
