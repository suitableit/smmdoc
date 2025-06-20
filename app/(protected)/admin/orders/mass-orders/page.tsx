'use client';

import BreadCrumb from '@/components/shared/BreadCrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatNumber, formatID, formatPrice } from '@/lib/utils';

interface MassOrder {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  orders: Array<{
    id: string;
    serviceId: string;
    service: {
      name: string;
    };
    link: string;
    qty: number;
    price: number;
    status: string;
  }>;
  totalOrders: number;
  totalCost: number;
  currency: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface Stats {
  totalMassOrders: number;
  totalOrdersInMass: number;
  totalRevenue: number;
  pendingMassOrders: number;
}

export default function AdminMassOrdersPage() {
  const [massOrders, setMassOrders] = useState<MassOrder[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMassOrders: 0,
    totalOrdersInMass: 0,
    totalRevenue: 0,
    pendingMassOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/admin' },
    { title: 'Orders', link: '/admin/orders' },
    { title: 'Mass Orderss', link: '/admin/orders/mass-orderss' },
  ];

  // Fetch Mass Orderss data
  const fetchMassOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(
        `/api/admin/orders/mass-orderss?${queryParams}`
      );
      const result = await response.json();

      if (result.success) {
        setMassOrders(result.data);
        setPagination(result.pagination);
        setStats(result.stats);
      } else {
        toast.error(result.error || 'Failed to fetch Mass Orderss');
        setMassOrders([]);
      }
    } catch (error) {
      console.error('Error fetching Mass Orderss:', error);
      toast.error('Error fetching Mass Orderss');
      setMassOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMassOrders();
  }, [pagination.page, statusFilter]);

  // Handle search
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchMassOrders();
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
        <div className="flex items-center justify-between py-1">
          <BreadCrumb items={breadcrumbItems} />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-purple-500" />
            <span className="text-lg font-medium">Loading Mass Orderss...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between py-1">
        <div>
          <BreadCrumb items={breadcrumbItems} />
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor Mass Orderss from users
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button
            onClick={fetchMassOrders}
            variant="outline"
            size="sm"
            className="shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total Mass Orderss
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {formatNumber(stats.totalMassOrders)}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {formatNumber(stats.totalOrdersInMass)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    ${formatPrice(stats.totalRevenue, 2)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-orange-900">
                    {formatNumber(stats.pendingMassOrders)}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user email or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mass Orderss Table */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Package className="h-5 w-5 text-purple-500" />
              Mass Orderss List ({formatNumber(pagination.total)})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {massOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No information was found for you.
              </h3>
              <p className="text-gray-500 text-sm">
                No Mass Orderss match your current filters or no Mass Orderss
                exist yet.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mass Orders ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-center">
                        Orders Count
                      </TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Created At</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {massOrders.map((massOrder) => (
                      <TableRow
                        key={massOrder.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <TableCell>
                          <div className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded">
                            #MO-{formatID(massOrder.id.slice(-8))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {massOrder.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {massOrder.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {massOrder.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {formatNumber(massOrder.totalOrders)} orders
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold text-gray-900">
                            {massOrder.currency === 'USD' ? '$' : '৳'}
                            {formatPrice(massOrder.totalCost, 2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {massOrder.currency}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={massOrder.status} />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm text-gray-900">
                            {new Date(massOrder.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(massOrder.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {formatNumber((pagination.page - 1) * pagination.limit + 1)} to{' '}
                    {formatNumber(Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    ))}{' '}
                    of {formatNumber(pagination.total)} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {formatNumber(pagination.page)} of {formatNumber(pagination.totalPages)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
