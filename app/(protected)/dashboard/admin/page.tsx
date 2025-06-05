'use client';

import PendingTransactionNotifications from '@/components/admin/notifications/PendingTransactionNotifications';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  Award,
  BarChart3,
  Calendar,
  CheckIcon,
  Clock,
  ClockIcon,
  Crown,
  DollarSign,
  Edit,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  PieChart,
  RefreshCcw,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Users,
  XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Order = {
  id: string;
  usdPrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  service: {
    name: string;
  };
};

type DashboardStats = {
  totalOrders: number;
  totalUsers: number;
  totalServices: number;
  totalCategories: number;
  totalRevenue: number;
  recentOrders: Order[];
  ordersByStatus: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  dailyOrders: {
    date: string;
    orders: number;
  }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalUsers: 0,
    totalServices: 0,
    totalCategories: 0,
    totalRevenue: 0,
    recentOrders: [],
    ordersByStatus: {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    },
    dailyOrders: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Statistics Boxes - Section 1 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Statistics Overview
          </h2>
        </div>

        {/* First Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.totalUsers || 1}
                  </p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-xs text-green-600 font-medium">
                  +12% from last month
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-emerald-50 to-green-100">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-800">
                    {formatCurrency(stats.totalRevenue || 0)}
                  </p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Total Balance
                </p>
                <p className="text-xs text-green-600 font-medium">
                  +8% from last month
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-violet-100">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.totalOrders || 0}
                  </p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-xs text-green-600 font-medium">
                  +15% from last month
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-7 w-7 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-orange-50 to-amber-100">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-800">
                    {formatCurrency(stats.totalRevenue || 0)}
                  </p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Total Payments
                </p>
                <p className="text-xs text-green-600 font-medium">
                  +22% from last month
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="h-7 w-7 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-cyan-50 to-blue-100">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-800">
                    {formatCurrency(stats.totalPayment || 0)}
                  </p>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Last 30 Days
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  Monthly Revenue
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-7 w-7 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-rose-50 to-pink-100">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-800">
                    {formatCurrency(stats.totalRevenue || 0)}
                  </p>
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Today Profit
                </p>
                <p className="text-xs text-rose-600 font-medium">
                  Daily Earnings
                </p>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-7 w-7 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-teal-50 to-emerald-100">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-800">0</p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Today's Orders
                </p>
                <p className="text-xs text-teal-600 font-medium">
                  Fresh Orders
                </p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-7 w-7 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-indigo-50 to-purple-100">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-800">0</p>
                  <UserPlus className="h-4 w-4 text-indigo-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  New Users Today
                </p>
                <p className="text-xs text-indigo-600 font-medium">
                  Fresh Registrations
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="h-7 w-7 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions - Section 2 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Quick Actions
          </h2>
        </div>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a
                href="/dashboard/admin/funds"
                className="group relative overflow-hidden p-6 border-0 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center relative z-10">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto w-fit mb-4">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-800 text-lg mb-2">
                    Manage Funds
                  </p>
                  <p className="text-sm text-gray-600">View all transactions</p>
                </div>
              </a>
              <a
                href="/dashboard/admin/users"
                className="group relative overflow-hidden p-6 border-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto w-fit mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-800 text-lg mb-2">
                    Manage Users
                  </p>
                  <p className="text-sm text-gray-600">User management</p>
                </div>
              </a>
              <a
                href="/dashboard/admin/orders"
                className="group relative overflow-hidden p-6 border-0 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center relative z-10">
                  <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto w-fit mb-4">
                    <ShoppingCart className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-800 text-lg mb-2">
                    Manage Orders
                  </p>
                  <p className="text-sm text-gray-600">View all orders</p>
                </div>
              </a>
              <a
                href="/dashboard/admin/services"
                className="group relative overflow-hidden p-6 border-0 rounded-xl bg-gradient-to-br from-rose-50 to-pink-100 hover:from-rose-100 hover:to-pink-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center relative z-10">
                  <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto w-fit mb-4">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-800 text-lg mb-2">
                    Manage Services
                  </p>
                  <p className="text-sm text-gray-600">Service management</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Transactions - Section 3 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Pending Transactions
          </h2>
        </div>

        <PendingTransactionNotifications />
      </div>

      {/* Recent Orders & Statistics Charts - Section 3 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
            <PieChart className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Recent Orders & Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Processing
                  </Badge>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <Activity className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                  <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <Target className="h-3 w-3 mr-1" />
                    Partial
                  </Badge>
                  <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <XIcon className="h-3 w-3 mr-1" />
                    Canceled
                  </Badge>
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Refunded
                  </Badge>
                </div>

                <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
                  {stats.recentOrders && stats.recentOrders.length > 0 ? (
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Interactive Chart will be displayed here
                      </p>
                      <p className="text-sm text-gray-500">
                        Real-time order analytics
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        No recent orders to display
                      </p>
                      <p className="text-sm text-gray-500">
                        Charts will appear when data is available
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Processing
                  </Badge>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <Activity className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                  <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <Target className="h-3 w-3 mr-1" />
                    Partial
                  </Badge>
                  <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <XIcon className="h-3 w-3 mr-1" />
                    Canceled
                  </Badge>
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Refunded
                  </Badge>
                </div>

                <div className="h-[200px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium text-sm">
                      Statistics chart
                    </p>
                    <p className="text-xs text-gray-500">
                      Real-time data visualization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Last 30 Days Orders - Section 3 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Last 30 Days Orders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-blue-100 p-1 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-800 transition-colors duration-300">
                  Total Orders
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  All time orders
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-emerald-100 p-1 rounded-full group-hover:bg-emerald-200 transition-colors duration-300">
                    <CheckIcon className="h-3 w-3 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-emerald-800 transition-colors duration-300">
                  Completed
                </p>
                <p className="text-xs text-emerald-600 font-medium">
                  Successfully finished
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <CheckIcon className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-amber-100 p-1 rounded-full group-hover:bg-amber-200 transition-colors duration-300">
                    <RefreshCcw className="h-3 w-3 text-amber-600 animate-spin" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-amber-800 transition-colors duration-300">
                  Processing
                </p>
                <p className="text-xs text-amber-600 font-medium">
                  Currently in progress
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <RefreshCcw className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-cyan-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-cyan-100 p-1 rounded-full group-hover:bg-cyan-200 transition-colors duration-300">
                    <ClockIcon className="h-3 w-3 text-cyan-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-cyan-800 transition-colors duration-300">
                  Pending
                </p>
                <p className="text-xs text-cyan-600 font-medium">
                  Awaiting processing
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-violet-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-violet-100 p-1 rounded-full group-hover:bg-violet-200 transition-colors duration-300">
                    <Activity className="h-3 w-3 text-violet-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-violet-800 transition-colors duration-300">
                  In Progress
                </p>
                <p className="text-xs text-violet-600 font-medium">
                  Active processing
                </p>
              </div>
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-indigo-100 p-1 rounded-full group-hover:bg-indigo-200 transition-colors duration-300">
                    <Target className="h-3 w-3 text-indigo-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-800 transition-colors duration-300">
                  Partial
                </p>
                <p className="text-xs text-indigo-600 font-medium">
                  Partially completed
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Target className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-red-50 via-rose-50 to-pink-100">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-red-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-red-100 p-1 rounded-full group-hover:bg-red-200 transition-colors duration-300">
                    <XIcon className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-red-800 transition-colors duration-300">
                  Canceled
                </p>
                <p className="text-xs text-red-600 font-medium">
                  Order canceled
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <XIcon className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-pink-50 via-rose-50 to-red-100">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-600"></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-pink-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-pink-100 p-1 rounded-full group-hover:bg-pink-200 transition-colors duration-300">
                    <RefreshCcw className="h-3 w-3 text-pink-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-pink-800 transition-colors duration-300">
                  Refunded
                </p>
                <p className="text-xs text-pink-600 font-medium">
                  Money returned
                </p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <RefreshCcw className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support Ticket - Section 4 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Support Ticket
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
              ACTIVE
            </div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-blue-100 p-1 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                    <RefreshCcw className="h-3 w-3 text-blue-600 animate-spin" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-800 transition-colors duration-300">
                  Processing
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  Being handled
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <RefreshCcw className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-600"></div>
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-bounce">
              WAIT
            </div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-amber-100 p-1 rounded-full group-hover:bg-amber-200 transition-colors duration-300">
                    <ClockIcon className="h-3 w-3 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-amber-800 transition-colors duration-300">
                  Pending
                </p>
                <p className="text-xs text-amber-600 font-medium">
                  Awaiting response
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
              REPLY
            </div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-emerald-100 p-1 rounded-full group-hover:bg-emerald-200 transition-colors duration-300">
                    <MessageSquare className="h-3 w-3 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-emerald-800 transition-colors duration-300">
                  Replied
                </p>
                <p className="text-xs text-emerald-600 font-medium">
                  Response sent
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-600"></div>
            <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              SOLVE
            </div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-teal-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-teal-100 p-1 rounded-full group-hover:bg-teal-200 transition-colors duration-300">
                    <CheckIcon className="h-3 w-3 text-teal-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-teal-800 transition-colors duration-300">
                  Answered
                </p>
                <p className="text-xs text-teal-600 font-medium">
                  Solution provided
                </p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <CheckIcon className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-red-50 via-rose-50 to-pink-100">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              STOP
            </div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-red-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-red-100 p-1 rounded-full group-hover:bg-red-200 transition-colors duration-300">
                    <XIcon className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-red-800 transition-colors duration-300">
                  Canceled
                </p>
                <p className="text-xs text-red-600 font-medium">
                  Request canceled
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <XIcon className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-pink-50 via-rose-50 to-red-100">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-600"></div>
            <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              BACK
            </div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-pink-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-pink-100 p-1 rounded-full group-hover:bg-pink-200 transition-colors duration-300">
                    <RefreshCcw className="h-3 w-3 text-pink-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-pink-800 transition-colors duration-300">
                  Refunded
                </p>
                <p className="text-xs text-pink-600 font-medium">
                  Money returned
                </p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <RefreshCcw className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-slate-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-slate-600"></div>
            <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              DONE
            </div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-gray-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-gray-100 p-1 rounded-full group-hover:bg-gray-200 transition-colors duration-300">
                    <CheckIcon className="h-3 w-3 text-gray-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                  Closed
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Issue resolved
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-500 to-slate-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <CheckIcon className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-600"></div>
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-bounce">
              WAIT
            </div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors duration-300">
                    0
                  </p>
                  <div className="bg-orange-100 p-1 rounded-full group-hover:bg-orange-200 transition-colors duration-300">
                    <ClockIcon className="h-3 w-3 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-orange-800 transition-colors duration-300">
                  Pending
                </p>
                <p className="text-xs text-orange-600 font-medium">
                  Needs attention
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Bestsellers */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
            <Star className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Top Bestsellers
          </h2>
        </div>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white via-gray-50 to-purple-50 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600"></div>
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <CardTitle className="text-white font-bold text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Bestsellers Dashboard
            </CardTitle>
            <p className="text-indigo-100 text-sm">
              Most popular services and products
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-purple-50 border-b-2 border-purple-200">
                  <TableHead className="font-bold text-gray-800 py-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-indigo-600" />
                      ID
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-600" />
                      Name
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      Total Order
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      Total Quantity
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      Provider
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      Action
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="group hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300">
                  <TableCell className="text-center py-8" colSpan={6}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <Star className="h-8 w-8 text-purple-500" />
                      </div>
                      <p className="text-purple-600 font-semibold text-lg">
                        No data available
                      </p>
                      <p className="text-gray-500 text-sm">
                        Bestseller data will appear here once orders are placed
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Latest Users - Section 5 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Latest Users
          </h2>
        </div>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600"></div>
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
            <CardTitle className="text-white font-bold text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management Dashboard
            </CardTitle>
            <p className="text-green-100 text-sm">
              Monitor and manage user registrations
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-green-200">
                  <TableHead className="font-bold text-gray-800 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      Username
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      Email
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-600" />
                      Phone
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      Balance
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-600" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      Action
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="group hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 border-b border-gray-100">
                  <TableCell className="font-semibold py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        M
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
                          munna
                        </p>
                        <p className="text-xs text-gray-500">Premium User</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="group-hover:text-blue-700 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">alsoadmunna@gmail.com</span>
                    </div>
                  </TableCell>
                  <TableCell className="group-hover:text-purple-700 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">1770001527</span>
                    </div>
                  </TableCell>
                  <TableCell className="group-hover:text-yellow-700 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        0 USD
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        Active
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                      <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Showing 1 of 1 users
                </p>
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  View All Users
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users - Section 6 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Top Users
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
              <Crown className="h-3 w-3" />
              #1
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-all duration-500">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                    munna
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-pink-600 transition-colors duration-300">
                    VIP Customer
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Total Spent
                    </span>
                  </div>
                  <span className="font-bold text-green-600">$0</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Orders
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">0</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Rank
                    </span>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
                    Premium
                  </Badge>
                </div>
              </div>

              <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                View Profile
              </button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="absolute top-2 right-2 bg-gradient-to-r from-gray-400 to-gray-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
              <Award className="h-3 w-3" />
              #2
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-all duration-500">
                  U
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                    User 2
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors duration-300">
                    Gold Member
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Total Spent
                    </span>
                  </div>
                  <span className="font-bold text-green-600">$0</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Orders
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">0</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Rank
                    </span>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                    Gold
                  </Badge>
                </div>
              </div>

              <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                View Profile
              </button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
              <Target className="h-3 w-3" />
              #3
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-all duration-500">
                  U
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">
                    User 3
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-300">
                    Silver Member
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-gray-300" />
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Total Spent
                    </span>
                  </div>
                  <span className="font-bold text-green-600">$0</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Orders
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">0</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Rank
                    </span>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0">
                    Silver
                  </Badge>
                </div>
              </div>

              <button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                View Profile
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
            <Crown className="h-5 w-5" />
            View All Top Users
          </button>
        </div>
      </div>
    </div>
  );
}
