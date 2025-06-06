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
  Activity,
  AlertCircle,
  ArrowLeft,
  Ban,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  Package,
  RefreshCw,
  RotateCw,
  Save,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
    total_spent: number;
  };
  service: {
    id: string;
    name: string;
    description: string;
    rate: number;
    min_order: number;
    max_order: number;
    avg_time: string;
    status: string;
  };
  category: {
    id: string;
    category_name: string;
    status: string;
  };
  qty: number;
  price: number;
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
    | 'refunded';
  createdAt: string;
  updatedAt: string;
  link: string;
  startCount: number;
  remains: number;
  avg_time: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // State management
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    status: '',
    startCount: '',
    remains: '',
    link: '',
  });

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Orders', link: '/admin/orders' },
    { title: `Order #${orderId?.slice(-8)}`, link: `/admin/orders/${orderId}` },
  ];

  // Data fetching
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
        setEditForm({
          status: result.data.status,
          startCount: result.data.startCount.toString(),
          remains: result.data.remains.toString(),
          link: result.data.link,
        });
      } else {
        toast.error(result.error || 'Failed to fetch order details');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error fetching order details');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Handle order update
  const handleUpdateOrder = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editForm.status,
          startCount: parseInt(editForm.startCount) || 0,
          remains: parseInt(editForm.remains) || 0,
          link: editForm.link,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Order updated successfully');
        setOrder(result.data);
        setEditMode(false);
        fetchOrder(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: string, reason?: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reason: reason || `Status changed to ${newStatus}`,
          startCount: parseInt(editForm.startCount) || 0,
          remains: parseInt(editForm.remains) || 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrder(result.data);
        setStatusUpdateDialogOpen(false);
        fetchOrder(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Order deleted successfully');
        router.push('/admin/orders');
      } else {
        toast.error(result.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error deleting order');
    } finally {
      setUpdating(false);
      setDeleteDialogOpen(false);
    }
  };

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
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
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'partial':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="flex items-center justify-between py-1">
          <BreadCrumb items={breadcrumbItems} />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-lg font-medium">
              Loading order details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="flex items-center justify-between py-1">
          <BreadCrumb items={breadcrumbItems} />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No information was found for you.
            </h3>
            <p className="text-gray-500 text-sm">
              The requested order could not be found.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between py-1">
        <div>
          <BreadCrumb items={breadcrumbItems} />
          <p className="text-sm text-muted-foreground mt-1">
            Detailed view and management of order #{orderId?.slice(-8)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchOrder}
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

      {/* Order Status and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 relative overflow-hidden border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5 text-blue-500" />
                Order Information
              </CardTitle>
              <div className="flex items-center gap-2">
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
                <Button
                  onClick={() => setEditMode(!editMode)}
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50 transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {editMode ? 'Cancel Edit' : 'Edit Order'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Order ID
                  </Label>
                  <div className="font-mono text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-md mt-1">
                    #{order.id}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Service
                  </Label>
                  <div className="mt-1">
                    <div className="font-medium text-gray-900">
                      {order.service.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.category.category_name}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Target Link
                  </Label>
                  {editMode ? (
                    <Input
                      value={editForm.link}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          link: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1">
                      <a
                        href={order.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {order.link}
                        <ExternalLink className="h-3 w-3 inline ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Quantity
                  </Label>
                  <div className="mt-1">
                    <div className="font-semibold text-gray-900">
                      {order.qty.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">
                      {(order.qty - order.remains).toLocaleString()} delivered
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Start Count
                  </Label>
                  {editMode ? (
                    <Input
                      type="number"
                      value={editForm.startCount}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          startCount: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="font-semibold text-gray-900 mt-1">
                      {order.startCount.toLocaleString()}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Remaining
                  </Label>
                  {editMode ? (
                    <Input
                      type="number"
                      value={editForm.remains}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          remains: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="font-semibold text-gray-900 mt-1">
                      {order.remains.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Progress
                </Label>
                <span className="text-sm font-medium text-gray-700">
                  {calculateProgress(order.qty, order.remains)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${calculateProgress(order.qty, order.remains)}%`,
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {editMode && (
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  onClick={handleUpdateOrder}
                  disabled={updating}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  className="hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5 text-green-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setStatusUpdateDialogOpen(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update Status
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full hover:bg-green-50 border-green-200 text-green-700 transition-all duration-200"
            >
              <Link href={`/admin/orders/${orderId}/refill`}>
                <RotateCw className="h-4 w-4 mr-2" />
                Create Refill
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full hover:bg-orange-50 border-orange-200 text-orange-700 transition-all duration-200"
            >
              <Link href={`/admin/orders/${orderId}/cancel`}>
                <Ban className="h-4 w-4 mr-2" />
                Cancel Order
              </Link>
            </Button>

            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="outline"
              className="w-full hover:bg-red-50 border-red-200 text-red-700 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Order
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* User and Pricing Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-purple-500" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {order.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {order.user.name}
                </div>
                <div className="text-sm text-gray-500">{order.user.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Current Balance
                </Label>
                <div className="font-semibold text-green-600 mt-1">
                  ${order.user.balance.toFixed(2)} {order.user.currency}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Total Spent
                </Label>
                <div className="font-semibold text-gray-900 mt-1">
                  ${order.user.total_spent.toFixed(2)} {order.user.currency}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Preferred Currency
              </Label>
              <div className="font-semibold text-gray-900 mt-1">
                {order.user.currency}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="h-5 w-5 text-green-500" />
              Pricing Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Service Rate
                </Label>
                <div className="font-semibold text-gray-900 mt-1">
                  ${order.service.rate.toFixed(2)} per 1000
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Order Total
                </Label>
                <div className="font-semibold text-green-600 mt-1">
                  ${order.price.toFixed(2)} {order.currency}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  USD Price
                </Label>
                <div className="font-semibold text-gray-900 mt-1">
                  ${order.usdPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  BDT Price
                </Label>
                <div className="font-semibold text-gray-900 mt-1">
                  ৳{order.bdtPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Created
                </Label>
                <div className="text-sm text-gray-600 mt-1">
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Last Updated
                </Label>
                <div className="text-sm text-gray-600 mt-1">
                  {formatDate(order.updatedAt)}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Estimated Time
              </Label>
              <div className="text-sm text-gray-600 mt-1">{order.avg_time}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateDialogOpen}
        onOpenChange={setStatusUpdateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{orderId?.slice(-8)}. This may affect
              the user's balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-status">New Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleStatusUpdate(editForm.status)}
              disabled={updating}
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order #{orderId?.slice(-8)}? This
              action cannot be undone and will refund the user if the order was
              paid.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={updating}
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
