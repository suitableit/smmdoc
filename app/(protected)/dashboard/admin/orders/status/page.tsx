'use client';

import { BreadCrumb } from '@/components/shared/BreadCrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Activity,
  Timer,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function OrderStatusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    failed: 0
  });

  const breadcrumbItems = [
    { title: 'Orders', link: '/dashboard/admin/orders' },
    { title: 'Order Status', link: '/dashboard/admin/orders/status' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      pending: { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      in_progress: { variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      completed: { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-200' },
      failed: { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-200' }
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge {...config}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  return (
    <div className="h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>
      <Separator />

      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Timer className="h-3 w-3 mr-1" />
              <span>Avg wait: 2.5 min</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Zap className="h-3 w-3 mr-1" />
              <span>Processing now</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Today</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed Orders</CardTitle>
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>Needs attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Order Tracking */}
      <Card className="">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Live Order Tracking
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Order ID
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Service</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Progress</TableHead>
                  <TableHead className="font-semibold">Started</TableHead>
                  <TableHead className="font-semibold">ETA</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Sample data - replace with real data */}
                <TableRow className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">#12345</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell>Instagram Followers</TableCell>
                  <TableCell>{getStatusBadge('in_progress')}</TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">65% complete</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">2 min ago</TableCell>
                  <TableCell className="text-sm text-gray-500">~5 min</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                <TableRow className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">#12344</TableCell>
                  <TableCell>sarah@example.com</TableCell>
                  <TableCell>YouTube Subscribers</TableCell>
                  <TableCell>{getStatusBadge('pending')}</TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Waiting...</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">5 min ago</TableCell>
                  <TableCell className="text-sm text-gray-500">~3 min</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">#12343</TableCell>
                  <TableCell>mike@example.com</TableCell>
                  <TableCell>TikTok Likes</TableCell>
                  <TableCell>{getStatusBadge('completed')}</TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-xs text-green-600 mt-1">Completed</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">10 min ago</TableCell>
                  <TableCell className="text-sm text-gray-500">Completed</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* No orders message */}
          {orders.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">No orders match your current filters.</p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}