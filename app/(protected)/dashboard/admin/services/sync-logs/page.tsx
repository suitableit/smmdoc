'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import BreadCrumb from '@/components/shared/BreadCrumb';
import { toast } from 'sonner';
import {
  RotateCw,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Server,
  Activity,
  AlertTriangle,
  Eye,
  Calendar,
  Database,
  Zap
} from 'lucide-react';

interface SyncLog {
  id: string;
  provider: string;
  action: string;
  status: 'success' | 'failed' | 'pending' | 'in_progress';
  message: string;
  servicesAffected: number;
  timestamp: string;
  duration?: number;
  errorDetails?: string;
}

interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  pendingSyncs: number;
  lastSyncTime: string;
}

export default function SynchronizeLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState<SyncStats>({
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    pendingSyncs: 0,
    lastSyncTime: ''
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  const breadcrumbItems = [
    { title: 'Services', link: '/dashboard/admin/services' },
    { title: 'Synchronize Logs', link: '/dashboard/admin/services/sync-logs' },
  ];

  useEffect(() => {
    fetchSyncLogs();
    fetchSyncStats();
  }, []);

  const fetchSyncLogs = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual endpoint
      const mockLogs: SyncLog[] = [
        {
          id: '1',
          provider: 'SMM Provider A',
          action: 'Service Update',
          status: 'success',
          message: 'Successfully synchronized 45 services',
          servicesAffected: 45,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          duration: 2.5
        },
        {
          id: '2',
          provider: 'SMM Provider B',
          action: 'Price Sync',
          status: 'failed',
          message: 'Failed to sync pricing data',
          servicesAffected: 0,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          duration: 1.2,
          errorDetails: 'Connection timeout after 30 seconds'
        },
        {
          id: '3',
          provider: 'SMM Provider C',
          action: 'Full Sync',
          status: 'in_progress',
          message: 'Synchronizing all services...',
          servicesAffected: 120,
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: '4',
          provider: 'SMM Provider A',
          action: 'Status Check',
          status: 'success',
          message: 'All services status verified',
          servicesAffected: 45,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          duration: 0.8
        },
        {
          id: '5',
          provider: 'SMM Provider D',
          action: 'New Services',
          status: 'pending',
          message: 'Waiting for provider response',
          servicesAffected: 0,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
        }
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      toast.error('Error fetching sync logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStats = async () => {
    try {
      // Simulate API call - replace with actual endpoint
      const mockStats: SyncStats = {
        totalSyncs: 156,
        successfulSyncs: 142,
        failedSyncs: 8,
        pendingSyncs: 6,
        lastSyncTime: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching sync stats:', error);
    }
  };

  const handleManualSync = async (provider?: string) => {
    try {
      setSyncing(true);
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(provider ? `Sync initiated for ${provider}` : 'Full sync initiated');
      fetchSyncLogs();
      fetchSyncStats();
    } catch (error) {
      console.error('Error initiating sync:', error);
      toast.error('Error initiating sync');
    } finally {
      setSyncing(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || log.provider === providerFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    return `${duration}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const providers = [...new Set(logs.map(log => log.provider))];

  if (loading) {
    return (
      <div className="h-full space-y-6">
        <div className="flex items-center justify-between py-1">
          <BreadCrumb items={breadcrumbItems} />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-lg font-medium">Loading synchronization logs...</span>
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
            Monitor and manage service synchronization with external providers
          </p>
        </div>
        <Button 
          asChild 
          variant="outline" 
          size="sm" 
          className="shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <a href="/dashboard/admin/services" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View All Services
          </a>
        </Button>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">{stats.totalSyncs}</p>
                <Database className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total Syncs</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Database className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">{stats.successfulSyncs}</p>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Successful</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-red-50 to-rose-100">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">{stats.failedSyncs}</p>
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
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
                <p className="text-3xl font-bold text-gray-800">{stats.pendingSyncs}</p>
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Controls */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Zap className="h-5 w-5 text-green-500" />
            Synchronization Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Logs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Filter by Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Filter by Provider</Label>
              <select
                id="provider"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <option value="all">All Providers</option>
                {providers.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleManualSync()}
                  disabled={syncing}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                  size="sm"
                >
                  {syncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={fetchSyncLogs}
                  variant="outline"
                  size="sm"
                  className="hover:bg-green-50 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Last sync: {stats.lastSyncTime ? getTimeAgo(stats.lastSyncTime) : 'Never'}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleManualSync()}
                disabled={syncing}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Full Sync
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="hover:bg-gray-50 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Logs Display */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-blue-500" />
            Synchronization Logs ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:border-blue-300 bg-gradient-to-r from-gray-50 to-blue-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{log.action}</h3>
                        <p className="text-sm text-gray-600">{log.provider}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">{log.message}</p>

                    {log.errorDetails && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{log.errorDetails}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Server className="h-3 w-3" />
                        {log.servicesAffected} services
                      </div>
                      {log.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(log.duration)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(log.status)} transition-all duration-200`}
                      >
                        {log.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(log.timestamp)}
                      </p>
                    </div>

                    {log.status === 'failed' && (
                      <Button
                        onClick={() => handleManualSync(log.provider)}
                        disabled={syncing}
                        size="sm"
                        variant="outline"
                        className="hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No sync logs found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => {
          const providerLogs = logs.filter(log => log.provider === provider);
          const lastLog = providerLogs[0];
          const successRate = providerLogs.length > 0
            ? Math.round((providerLogs.filter(log => log.status === 'success').length / providerLogs.length) * 100)
            : 0;

          return (
            <Card key={provider} className="relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900">{provider}</CardTitle>
                  {lastLog && (
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(lastLog.status)} transition-all duration-200`}
                    >
                      {lastLog.status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className={`font-semibold ${successRate >= 90 ? 'text-green-600' : successRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {successRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Syncs</span>
                  <span className="font-semibold text-gray-900">{providerLogs.length}</span>
                </div>

                {lastLog && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Sync</span>
                    <span className="font-semibold text-gray-900">{getTimeAgo(lastLog.timestamp)}</span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <Button
                    onClick={() => handleManualSync(provider)}
                    disabled={syncing}
                    size="sm"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                  >
                    {syncing ? (
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                      <RotateCw className="h-3 w-3 mr-2" />
                    )}
                    Sync {provider}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {providers.length === 0 && (
          <Card className="relative overflow-hidden border-0 bg-white shadow-lg col-span-full">
            <CardContent className="p-12">
              <div className="text-center">
                <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No providers configured</p>
                <p className="text-gray-400 text-sm">Add external service providers to start synchronization</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
