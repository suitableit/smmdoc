'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Database, Server } from 'lucide-react';

interface MemoryStats {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  heapUsedPercentage: number;
  timestamp: string;
}

interface DatabaseStats {
  totalServices: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  activeConnections: number;
}

export default function MemoryMonitor() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [memoryResponse, dbResponse] = await Promise.all([
        fetch('/api/admin/memory-stats'),
        fetch('/api/admin/database-stats')
      ]);

      if (memoryResponse.ok) {
        const memoryData = await memoryResponse.json();
        setMemoryStats(memoryData);
      }

      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        setDbStats(dbData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getMemoryStatus = (percentage: number) => {
    if (percentage < 50) return { color: 'bg-green-500', status: 'Good' };
    if (percentage < 75) return { color: 'bg-yellow-500', status: 'Warning' };
    return { color: 'bg-red-500', status: 'Critical' };
  };

  const formatBytes = (bytes: number) => {
    return `${bytes} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Performance Monitor</h2>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Usage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {memoryStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {formatBytes(memoryStats.heapUsed)}
                  </span>
                  <Badge 
                    variant={memoryStats.heapUsedPercentage > 75 ? "destructive" : "default"}
                  >
                    {getMemoryStatus(memoryStats.heapUsedPercentage).status}
                  </Badge>
                </div>
                
                <Progress 
                  value={memoryStats.heapUsedPercentage} 
                  className="w-full"
                />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Heap Used:</span>
                    <span>{formatBytes(memoryStats.heapUsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heap Total:</span>
                    <span>{formatBytes(memoryStats.heapTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RSS:</span>
                    <span>{formatBytes(memoryStats.rss)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>External:</span>
                    <span>{formatBytes(memoryStats.external)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(memoryStats.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Stats Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Statistics</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dbStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dbStats.totalServices.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Services</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {dbStats.totalCategories.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {dbStats.totalOrders.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {dbStats.totalUsers.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Users</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Connections:</span>
                    <Badge variant="outline">
                      {dbStats.activeConnections}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Memory Optimization:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Current heap limit: 6144 MB</li>
                <li>• Use pagination for large lists</li>
                <li>• Implement lazy loading</li>
                <li>• Clear unused data regularly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Database Optimization:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Add indexes on frequently queried fields</li>
                <li>• Use connection pooling</li>
                <li>• Batch operations when possible</li>
                <li>• Monitor slow queries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
