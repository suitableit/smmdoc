'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import BreadCrumb from '@/components/shared/BreadCrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  DollarSign,
  RotateCw,
  Eye,
  ExternalLink,
  User,
  ArrowLeft,
  Filter,
  Settings,
  BarChart3,
  Zap,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  TrendingUp,
  Users,
  Bot
} from 'lucide-react';
import Link from 'next/link';
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

export default function RefillOrdersPage() {
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
    reason: ''
  });
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalRefills: 0,
    pendingRefills: 0,
    completedRefills: 0,
    autoRefillEnabled: 0
  });

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Orders', link: '/dashboard/admin/orders' },
    { title: 'Refill Orders', link: '/dashboard/admin/orders/refill' },
  ];

  // Data fetching
  const fetchEligibleOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: 'completed,partial',
        limit: '50',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/orders?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        // Filter orders that are eligible for refill (completed or partial)
        const eligibleOrders = result.data.filter((order: Order) =>
          ['completed', 'partial'].includes(order.status) &&
          order.service.status === 'active'
        );
        setOrders(eligibleOrders);
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
    fetchEligibleOrders();
  }, [searchTerm]);

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
        toast.error(result.error || 'Failed to fetch refill information');
        setRefillDialogOpen(false);
      }
    } catch (error) {
      console.error('Error fetching refill info:', error);
      toast.error('Error fetching refill information');
      setRefillDialogOpen(false);
    }
  };

  // Handle refill creation
  const handleCreateRefill = async () => {
    if (!selectedOrder || !refillInfo) return;

    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/refill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refillType: refillForm.type,
          customQuantity: refillForm.type === 'custom' ? parseInt(refillForm.customQuantity) : undefined,
          reason: refillForm.reason || 'Admin initiated refill'
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Refill order created successfully');
        setRefillDialogOpen(false);
        setSelectedOrder(null);
        setRefillInfo(null);
        setRefillForm({ type: 'full', customQuantity: '', reason: '' });
        fetchEligibleOrders(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to create refill order');
      }
    } catch (error) {
      console.error('Error creating refill:', error);
      toast.error('Error creating refill order');
    } finally {
      setProcessing(false);
    }
  };

  // Filter orders based on search
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.includes(searchTerm) ||
                         order.service.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'partial':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
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
      minute: '2-digit'
    });
  };

  const calculateProgress = (qty: number, remains: number) => {
    return qty > 0 ? Math.round(((qty - remains) / qty) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
        <div className="flex items-center justify-between py-1">
          <BreadCrumb items={breadcrumbItems} />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-green-500" />
            <span className="text-lg font-medium">Loading refillable orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between py-1">
        <div>
          <BreadCrumb items={breadcrumbItems} />
          <p className="text-sm text-muted-foreground mt-1">
            Create refill orders for completed or partial orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchEligibleOrders}
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
            <Link href="/dashboard/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">{filteredOrders.length}</p>
                <RotateCw className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Eligible Orders</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <RotateCw className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">{filteredOrders.filter(o => o.status === 'completed').length}</p>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Completed Orders</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-orange-50 to-amber-100">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">{filteredOrders.filter(o => o.status === 'partial').length}</p>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Partial Orders</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-full">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-violet-100">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">
                  ${filteredOrders.reduce((sum, order) => sum + order.price, 0).toFixed(2)}
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
            <Search className="h-5 w-5 text-green-500" />
            Search Eligible Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium text-gray-700">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by ID, user, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
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

      {/* Eligible Orders Table */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-green-500" />
            Eligible Orders for Refill ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No eligible orders found</h3>
              <p className="text-gray-500 text-sm">No orders are currently eligible for refill or no orders match your filters.</p>
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
                    <TableRow key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <TableCell>
                        <div className="font-mono text-sm bg-green-50 text-green-700 px-2 py-1 rounded">
                          #{order.id.slice(-8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {order.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{order.user.name}</div>
                            <div className="text-sm text-gray-500">{order.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{order.service.name}</div>
                          <div className="text-sm text-gray-500">{order.category.category_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <a
                            href={order.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 text-sm truncate block"
                          >
                            {order.link}
                            <ExternalLink className="h-3 w-3 inline ml-1" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold text-gray-900">{order.qty.toLocaleString()}</div>
                          <div className="text-sm text-green-600">
                            {(order.qty - order.remains).toLocaleString()} delivered
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold text-gray-900">
                            ${order.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">{order.currency}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getStatusColor(order.status)} transition-all duration-200`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">
                            {calculateProgress(order.qty, order.remains)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${calculateProgress(order.qty, order.remains)}%` }}
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
                            onClick={() => handleOpenRefillDialog(order)}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                          >
                            <RotateCw className="h-4 w-4 mr-2" />
                            Create Refill
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hover:bg-green-50 transition-all duration-200"
                          >
                            <Link href={`/dashboard/admin/orders/${order.id}`}>
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

      {/* Refill Dialog */}
      <Dialog open={refillDialogOpen} onOpenChange={setRefillDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Refill Order</DialogTitle>
            <DialogDescription>
              Create a refill order for #{selectedOrder?.id.slice(-8)}. This will create a new order to replace any lost engagement.
            </DialogDescription>
          </DialogHeader>

          {refillInfo && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Original Quantity</Label>
                  <div className="font-semibold text-gray-900">{refillInfo.order.totalQuantity.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Remaining</Label>
                  <div className="font-semibold text-orange-600">{refillInfo.order.remainingQuantity.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">User Balance</Label>
                  <div className="font-semibold text-green-600">${refillInfo.user.balance.toFixed(2)} {refillInfo.user.currency}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Service Status</Label>
                  <div className="font-semibold text-blue-600 capitalize">{refillInfo.service.status}</div>
                </div>
              </div>

              {/* Refill Options */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Refill Type</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      id="full-refill"
                      name="refillType"
                      value="full"
                      checked={refillForm.type === 'full'}
                      onChange={(e) => setRefillForm(prev => ({ ...prev, type: e.target.value }))}
                      className="text-green-600"
                    />
                    <label htmlFor="full-refill" className="flex-1 cursor-pointer">
                      <div className="font-medium">Full Refill ({refillInfo.refillOptions.full.quantity.toLocaleString()})</div>
                      <div className="text-sm text-gray-500">
                        Cost: ${refillInfo.refillOptions.full.cost.toFixed(2)}
                        {refillInfo.refillOptions.full.affordable ?
                          <span className="text-green-600 ml-2">✓ Affordable</span> :
                          <span className="text-red-600 ml-2">✗ Insufficient balance</span>
                        }
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
                      onChange={(e) => setRefillForm(prev => ({ ...prev, type: e.target.value }))}
                      className="text-green-600"
                    />
                    <label htmlFor="remaining-refill" className="flex-1 cursor-pointer">
                      <div className="font-medium">Remaining Only ({refillInfo.refillOptions.remaining.quantity.toLocaleString()})</div>
                      <div className="text-sm text-gray-500">
                        Cost: ${refillInfo.refillOptions.remaining.cost.toFixed(2)}
                        {refillInfo.refillOptions.remaining.affordable ?
                          <span className="text-green-600 ml-2">✓ Affordable</span> :
                          <span className="text-red-600 ml-2">✗ Insufficient balance</span>
                        }
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  placeholder="Enter reason for refill..."
                  value={refillForm.reason}
                  onChange={(e) => setRefillForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRefillDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRefill}
              disabled={processing || !refillInfo?.eligible}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Create Refill
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}