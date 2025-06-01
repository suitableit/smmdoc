"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckIcon, ClockIcon, DollarSign, RefreshCcw, ShoppingCart, Users, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
        const response = await fetch("/api/admin/dashboard/stats");
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
        }
        
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
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
      {/* First Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">{stats.totalUsers || 1}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">{formatCurrency(stats.totalRevenue || 0)}</p>
              <p className="text-sm text-muted-foreground">Total Balance</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">{stats.totalOrders || 0}</p>
              <p className="text-sm text-muted-foreground">Total Order</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">{formatCurrency(stats.totalRevenue || 0)}</p>
              <p className="text-sm text-muted-foreground">Fund Collected</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">{formatCurrency(stats.totalRevenue || 0)}</p>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">{formatCurrency(stats.totalRevenue || 0)}</p>
              <p className="text-sm text-muted-foreground">Today Profit</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">0</p>
              <p className="text-sm text-muted-foreground">Todays Order</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">0</p>
              <p className="text-sm text-muted-foreground">Today Join User</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-500">Completed</Badge>
                <Badge className="bg-red-500">Processing</Badge>
                <Badge className="bg-yellow-400">Pending</Badge>
                <Badge className="bg-green-500">Progress</Badge>
                <Badge className="bg-purple-500">Partial</Badge>
                <Badge className="bg-gray-400">Canceled</Badge>
                <Badge className="bg-pink-500">Refunded</Badge>
              </div>
              
              <div className="h-[300px] flex items-center justify-center">
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  <div>Chart will be displayed here</div>
                ) : (
                  <p className="text-gray-500">No recent orders to display</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-500">complete</Badge>
                <Badge className="bg-red-500">processing</Badge>
                <Badge className="bg-yellow-400">pending</Badge>
                <Badge className="bg-green-500">inProgress</Badge>
                <Badge className="bg-purple-500">partial</Badge>
                <Badge className="bg-gray-400">canceled</Badge>
                <Badge className="bg-pink-500">refunded</Badge>
              </div>
              
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-gray-500">Statistics chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Last 30 Days Order */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Last 30 Days Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <RefreshCcw className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <RefreshCcw className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Partial</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <RefreshCcw className="h-6 w-6 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Canceled</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XIcon className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Refunded</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-full">
                <RefreshCcw className="h-6 w-6 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Bestsellers */}
      <div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top bestsellers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500 text-white">
                  <TableHead className="text-white">ID</TableHead>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Total Order</TableHead>
                  <TableHead className="text-white">Total Quantity</TableHead>
                  <TableHead className="text-white">Provider</TableHead>
                  <TableHead className="text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-center" colSpan={6}>
                    No data available
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Tickets */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tickets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Closed</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XIcon className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Replied</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <RefreshCcw className="h-6 w-6 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Answered</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Latest Users */}
      <div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Latest User</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500 text-white">
                  <TableHead className="text-white">Username</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Phone</TableHead>
                  <TableHead className="text-white">Balance</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>munna</TableCell>
                  <TableCell>alsoadmunna@gmail.com</TableCell>
                  <TableCell>1770001527</TableCell>
                  <TableCell>0 USD</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Active</Badge>
                  </TableCell>
                  <TableCell>...</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center text-gray-500 text-sm mt-10">
        Copyrights © 2025 All Rights Reserved By SMM Matrix
      </footer>
    </div>
  );
} 