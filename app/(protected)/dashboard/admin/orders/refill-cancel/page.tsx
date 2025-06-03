'use client';

import BreadCrumb from '@/components/shared/BreadCrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Settings,
  BarChart3,
  Zap,
  RotateCcw,
  TrendingUp,
  DollarSign,
  XCircle,
  Ban,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define interfaces for type safety
interface RefillCancelTask {
  id: string;
  originalOrderId: string;
  originalOrder: {
    id: string;
    link: string;
    qty: number;
    price: number;
    usdPrice: number;
    bdtPrice: number;
    currency: string;
    status: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      currency: string;
    };
    service: {
      id: string;
      name: string;
      rate: number;
    };
    category: {
      id: string;
      category_name: string;
    };
  };
  type: 'refill' | 'cancel';
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  reason?: string;
  refillType?: 'full' | 'remaining' | 'custom';
  refundType?: 'full' | 'partial' | 'custom' | 'none';
  customQuantity?: number;
  customRefundAmount?: number;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface RefillCancelStats {
  totalCancellations: number;
  pendingCancellations: number;
  completedCancellations: number;
  refundProcessed: number;
  totalRefillRequests: number;
  pendingRefills: number;
  completedRefills: number;
  totalRefundAmount: number;
}

export default function RefillCancelPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tasks, setTasks] = useState<RefillCancelTask[]>([]);
  const [stats, setStats] = useState<RefillCancelStats>({
    totalCancellations: 0,
    pendingCancellations: 0,
    completedCancellations: 0,
    refundProcessed: 0,
    totalRefillRequests: 0,
    pendingRefills: 0,
    completedRefills: 0,
    totalRefundAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const breadcrumbItems = [
    { title: 'Orders', link: '/dashboard/admin/orders' },
    { title: 'Refill & Cancel Tasks', link: '/dashboard/admin/orders/refill-cancel' },
  ];

  // Fetch refill and cancel tasks data
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders/refill-cancel');
      const data = await response.json();

      if (data.success) {
        setTasks(data.data.tasks || []);
        setStats(data.data.stats || stats);
      } else {
        toast.error(data.error || 'Failed to fetch tasks');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch refill and cancel tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Process a task (approve/reject)
  const processTask = async (taskId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setProcessing(taskId);
      const response = await fetch(`/api/admin/orders/refill-cancel/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Task ${action}d successfully`);
        await fetchTasks(); // Refresh data
      } else {
        toast.error(data.error || `Failed to ${action} task`);
      }
    } catch (error) {
      console.error(`Error ${action}ing task:`, error);
      toast.error(`Failed to ${action} task`);
    } finally {
      setProcessing(null);
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.originalOrder.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.originalOrder.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.originalOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Load data on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const getCancelStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCancelStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      pending: { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      processing: { variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      completed: { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-200' },
      cancelled: { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-200' },
      refunded: { variant: 'outline', className: 'bg-purple-50 text-purple-700 border-purple-200' }
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge {...config}>
        {getCancelStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6">
        <BreadCrumb items={breadcrumbItems} />

        {/* Optimized Header Section for Desktop */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-purple-50 to-blue-50 rounded-xl p-4 lg:p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="p-2 lg:p-3 bg-gradient-to-br from-red-500 to-purple-600 rounded-xl shadow-md hover:scale-105 transition-transform duration-300">
                <Ban className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  Refill & Cancel Management
                </h1>
                <p className="text-gray-600 text-sm lg:text-base mt-1 font-medium">Process cancellations, refills, and manage refunds</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Button variant="outline" size="sm" className="flex-1 lg:flex-none hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                <Settings className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Set</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 lg:flex-none hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-300">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </Button>
              <Button size="sm" className="flex-1 lg:flex-none bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                <Ban className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Process Queue</span>
                <span className="sm:hidden">Process</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Optimized Statistics Cards */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-r from-red-500 to-purple-600 p-2 rounded-lg shadow-md">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              Cancellation Statistics
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-red-50 to-rose-100 hover:from-red-100 hover:to-rose-200">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-3 flex items-center justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xl lg:text-2xl font-bold text-gray-800 leading-none">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalCancellations}
                    </p>
                    <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-red-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600 leading-tight">Total Cancellations</p>
                  <p className="text-xs text-red-600 font-medium mt-0.5">This month</p>
                </div>
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2">
                  <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-3 flex items-center justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xl lg:text-2xl font-bold text-gray-800 leading-none">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendingCancellations}
                    </p>
                    <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-amber-500 animate-pulse flex-shrink-0" />
                  </div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600 leading-tight">Pending Cancellations</p>
                  <p className="text-xs text-amber-600 font-medium mt-0.5">In queue</p>
                </div>
                <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-3 flex items-center justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xl lg:text-2xl font-bold text-gray-800 leading-none">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.completedCancellations}
                    </p>
                    <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600 leading-tight">Completed Today</p>
                  <p className="text-xs text-green-600 font-medium mt-0.5">Orders cancelled</p>
                </div>
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2">
                  <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-3 flex items-center justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xl lg:text-2xl font-bold text-gray-800 leading-none">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.refundProcessed}
                    </p>
                    <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-purple-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600 leading-tight">Refunds Processed</p>
                  <p className="text-xs text-purple-600 font-medium mt-0.5">
                    ${loading ? '...' : stats.totalRefundAmount.toFixed(2)} refunded
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2">
                  <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                </div>
              </CardContent>
            </Card>
        </div>
      </div>

        {/* Optimized Quick Actions */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-md">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Card className="group cursor-pointer border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-50 to-rose-100 hover:from-red-100 hover:to-rose-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              <CardContent className="flex items-center p-3 relative z-10">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg mr-3">
                  <Ban className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm lg:text-base text-gray-800 mb-0.5 group-hover:text-red-600 transition-colors duration-300 leading-tight">Process Cancel Queue</h3>
                  <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mb-1 leading-relaxed">Execute pending cancellation requests</p>
                  <div className="inline-flex px-2 py-0.5 bg-red-100 rounded-full text-xs font-medium text-red-700 group-hover:bg-red-200 transition-colors duration-300">
                    {loading ? '...' : stats.pendingCancellations} pending
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              <CardContent className="flex items-center p-3 relative z-10">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg mr-3">
                  <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm lg:text-base text-gray-800 mb-0.5 group-hover:text-purple-600 transition-colors duration-300 leading-tight">Process Refunds</h3>
                  <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mb-1 leading-relaxed">Handle refund requests</p>
                  <div className="inline-flex px-2 py-0.5 bg-purple-100 rounded-full text-xs font-medium text-purple-700 group-hover:bg-purple-200 transition-colors duration-300">
                    ${loading ? '...' : stats.totalRefundAmount.toFixed(2)} pending
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              <CardContent className="flex items-center p-3 relative z-10">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg mr-3">
                  <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm lg:text-base text-gray-800 mb-0.5 group-hover:text-blue-600 transition-colors duration-300 leading-tight">Cancel Analytics</h3>
                  <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mb-1 leading-relaxed">View cancellation performance data</p>
                  <div className="inline-flex px-2 py-0.5 bg-blue-100 rounded-full text-xs font-medium text-blue-700 group-hover:bg-blue-200 transition-colors duration-300">
                    View reports
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Optimized Cancel Tasks Table */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-slate-50 to-gray-100">
          <CardHeader className="pb-3 p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-purple-600 rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
                <Ban className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800 leading-tight">Cancellation & Refill Request Queue</h2>
                <p className="text-xs lg:text-sm text-gray-600 mt-0.5">Manage and process all cancellation and refill requests</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cancel tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-64 h-9 border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="refill">Refill</option>
                  <option value="cancel">Cancel</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-300 h-9 px-3 text-sm">
                  <Filter className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">More Filters</span>
                  <span className="sm:hidden">Filters</span>
                </Button>
                <Button
                  size="sm"
                  onClick={fetchTasks}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 transition-all duration-300 h-9 px-3 text-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
                  <span className="sm:hidden">{loading ? '...' : 'Sync'}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-4 lg:p-6">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
              {/* Mobile Card View - Hidden on larger screens */}
              <div className="block lg:hidden space-y-3 p-3 sm:p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-gray-600">Loading tasks...</span>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Ban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No information was found for you.</p>
                    <p className="text-gray-500 text-sm mt-1">No refill or cancel tasks match your criteria.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div key={task.id} className={`bg-gradient-to-r ${task.type === 'cancel' ? 'from-red-50 to-rose-50 border-red-100' : 'from-blue-50 to-indigo-50 border-blue-100'} rounded-lg p-3 border hover:shadow-md transition-all duration-200`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${task.type === 'cancel' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'} px-2 py-0.5 rounded-md text-xs font-mono font-bold`}>
                          #{task.id.slice(-6).toUpperCase()}
                        </span>
                        {getCancelStatusBadge(task.status)}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order:</span>
                          <span className="text-blue-600 font-medium">#{task.originalOrderId.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">User:</span>
                          <span className="font-medium">{task.originalOrder.user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">{task.originalOrder.service.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <Badge variant="outline" className={task.type === 'cancel' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                            {task.type === 'cancel' ? <XCircle className="h-3 w-3 mr-1" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                            {task.type === 'cancel' ? 'Cancel' : 'Refill'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-1">
                          {task.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => processTask(task.id, 'approve')}
                                disabled={processing === task.id}
                                className="text-xs px-2 py-0.5 h-6"
                              >
                                {processing === task.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Process'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/dashboard/admin/orders/${task.originalOrderId}`, '_blank')}
                                className="text-xs px-2 py-0.5 h-6"
                              >
                                View
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-700 text-xs p-2">
                        <div className="flex items-center">
                          <Ban className="h-3 w-3 mr-1 text-red-500" />
                          Task ID
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs p-2">Original Order</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs p-2">User</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs p-2">Service</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs p-2">Task Type</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs p-2">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs p-2">Requested</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs p-2">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-2 text-gray-600">Loading tasks...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Ban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">No information was found for you.</p>
                          <p className="text-gray-500 text-sm mt-1">No refill or cancel tasks match your criteria.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task) => (
                        <TableRow key={task.id} className="hover:bg-gradient-to-r hover:from-red-50/30 hover:to-purple-50/30 transition-all duration-200">
                          <TableCell className="font-medium p-2">
                            <span className={`${task.type === 'cancel' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'} px-1.5 py-0.5 rounded-md text-xs font-mono`}>
                              #{task.id.slice(-6).toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="p-2">
                            <span
                              className="text-blue-600 hover:underline cursor-pointer font-medium bg-blue-50 px-1.5 py-0.5 rounded-md text-xs"
                              onClick={() => window.open(`/dashboard/admin/orders/${task.originalOrderId}`, '_blank')}
                            >
                              #{task.originalOrderId.slice(-6).toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {task.originalOrder.user.name?.charAt(0).toUpperCase() || task.originalOrder.user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800 text-xs">{task.originalOrder.user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-5 h-5 bg-gradient-to-br from-pink-400 to-red-500 rounded flex items-center justify-center">
                                <span className="text-white text-xs">📱</span>
                              </div>
                              <span className="font-medium text-xs">{task.originalOrder.service.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <Badge variant="outline" className={task.type === 'cancel' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}>
                              {task.type === 'cancel' ? <XCircle className="h-3 w-3 mr-1" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                              {task.type === 'cancel' ? 'Cancel' : 'Refill'}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-2">{getCancelStatusBadge(task.status)}</TableCell>
                          <TableCell className="text-xs text-gray-500 p-2">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex items-center space-x-1">
                              {task.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => processTask(task.id, 'approve')}
                                  disabled={processing === task.id}
                                  className="h-7 px-2 py-0 text-xs hover:bg-green-50 hover:border-green-200 transition-all duration-200"
                                >
                                  {processing === task.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3 mr-1" />}
                                  {processing === task.id ? '' : 'Process'}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/dashboard/admin/orders/${task.originalOrderId}`, '_blank')}
                                className="h-7 px-2 py-0 text-xs hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}