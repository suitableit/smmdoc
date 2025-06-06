'use client';
import ServiceTable from '@/components/admin/services/serviceTable';
import BreadCrumb from '@/components/shared/BreadCrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  BarChart3,
  Globe,
  Plus,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function page() {
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0,
    popularServices: 0,
    recentlyAdded: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceStats = async () => {
      try {
        const response = await fetch('/api/admin/services/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(
            data.data || {
              totalServices: 0,
              activeServices: 0,
              inactiveServices: 0,
              popularServices: 0,
              recentlyAdded: 0,
            }
          );
        }
      } catch (error) {
        console.error('Failed to fetch service stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceStats();
  }, []);

  const breadcrumbItems = [
    { title: 'Services Management', link: '/admin/services' },
  ];

  const serviceStats = [
    {
      title: 'Total Services',
      value: stats.totalServices,
      icon: <Settings className="h-6 w-6" />,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'from-blue-900/20 to-blue-800/20',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: <Activity className="h-6 w-6" />,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      darkBgGradient: 'from-green-900/20 to-green-800/20',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Inactive Services',
      value: stats.inactiveServices,
      icon: <Shield className="h-6 w-6" />,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      darkBgGradient: 'from-red-900/20 to-red-800/20',
      change: '-3%',
      changeType: 'negative',
    },
    {
      title: 'Popular Services',
      value: stats.popularServices,
      icon: <Star className="h-6 w-6" />,
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      darkBgGradient: 'from-yellow-900/20 to-yellow-800/20',
      change: '+15%',
      changeType: 'positive',
    },
    {
      title: 'Recently Added',
      value: stats.recentlyAdded,
      icon: <TrendingUp className="h-6 w-6" />,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      darkBgGradient: 'from-purple-900/20 to-purple-800/20',
      change: '+5%',
      changeType: 'positive',
    },
  ];

  const quickActions = [
    {
      title: 'Create Service',
      description: 'Add new service to the platform',
      icon: <Plus className="h-5 w-5" />,
      href: '/admin/services/create-services',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Service Analytics',
      description: 'View detailed service performance',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/admin/analytics/services',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Bulk Import',
      description: 'Import multiple services at once',
      icon: <Globe className="h-5 w-5" />,
      href: '/admin/services/bulk-import',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Service Settings',
      description: 'Configure global service settings',
      icon: <Shield className="h-5 w-5" />,
      href: '/admin/services/settings',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <div className="h-full space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between py-1">
        <div>
          <BreadCrumb items={breadcrumbItems} />
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all services on your platform
          </p>
        </div>
        <Button
          asChild
          variant="default"
          size="sm"
          className="shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Link
            href="/admin/services/create-services"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Service
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {serviceStats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} dark:bg-gradient-to-br dark:${stat.darkBgGradient} opacity-50`}
            />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <div className="text-3xl font-bold text-foreground">
                    {loading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </div>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-xs font-medium ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      from last month
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-full bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-md ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}
                    >
                      {action.icon}
                    </div>
                    <h3 className="font-medium text-sm">{action.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                All Services
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete list of all services with management options
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ServiceTable />
        </CardContent>
      </Card>
    </div>
  );
}
