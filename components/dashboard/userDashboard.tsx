'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUserStatsQuery } from '@/lib/services/dashboardApi';
import moment from 'moment';
import Link from 'next/link';
import { FaClock, FaDollarSign, FaShoppingCart, FaWallet } from 'react-icons/fa';

export default function UserDashboard() {
  const { data, isLoading, error } = useGetUserStatsQuery();
  const stats = data?.data;

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading dashboard!</div>;
  }

  return (
    <div className="space-y-4">
      {/* Cards at top of dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <FaWallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.currency === 'USD' ? (
                `$${stats?.balance.toFixed(2)}`
              ) : (
                `৳${stats?.balance.toFixed(2)}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Payment Method: UddoktaPay
            </p>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FaShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/user/my-orders" className="text-blue-500">
                View All Orders
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Total Spent Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <FaDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.currency === 'USD' ? (
                `$${stats?.totalSpent.toFixed(2)}`
              ) : (
                `৳${stats?.totalSpent.toFixed(2)}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Amount spent on orders
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <FaClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ordersByStatus?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.ordersByStatus?.processing || 0} processing, {stats?.ordersByStatus?.completed || 0} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{order.service.name}</p>
                      <p className="text-xs text-muted-foreground">{order.category.category_name}</p>
                      <p className="text-xs">{moment(order.createdAt).format('DD/MM/YYYY')}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge
                        className={
                          order.status === 'pending'
                            ? 'bg-yellow-500'
                            : order.status === 'processing'
                            ? 'bg-blue-500'
                            : order.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }
                      >
                        {order.status}
                      </Badge>
                      <span className="text-sm mt-1">
                        {stats?.currency === 'USD'
                          ? `$${order.usdPrice.toFixed(2)}`
                          : `৳${order.bdtPrice.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No orders found</p>
              )}
            </div>
            {stats?.recentOrders && stats.recentOrders.length > 0 && (
              <div className="mt-4 text-center">
                <Link
                  href="/dashboard/user/my-orders"
                  className="text-sm text-blue-500 hover:underline"
                >
                  View All Orders
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorite Categories */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Favorite Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.favoriteCategories && stats.favoriteCategories.length > 0 ? (
                stats.favoriteCategories.map((category: any) => (
                  <div key={category.id} className="border-b pb-2">
                    <p className="font-medium">{category.name}</p>
                    <div className="mt-1 grid grid-cols-1 gap-1">
                      {category.services.map((service: any) => (
                        <Link
                          href={`/dashboard/user/new-order?sId=${service.id}`}
                          key={service.id}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          {service.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No favorite categories found</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/dashboard/user/services"
                className="text-sm text-blue-500 hover:underline"
              >
                View All Services
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 