'use client';

import BreadCrumb from '@/components/shared/BreadCrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  CheckSquare,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Save,
  Search,
  Settings,
  Square,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  rate: number;
  min_order: number;
  max_order: number;
  status: string;
  category: {
    id: string;
    category_name: string;
  };
  description: string;
  avg_time: string;
}

interface BulkUpdateData {
  rate?: number;
  min_order?: number;
  max_order?: number;
  status?: string;
}

export default function BulkModifyServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bulkData, setBulkData] = useState<BulkUpdateData>({});
  const [showBulkForm, setShowBulkForm] = useState(false);

  const breadcrumbItems = [
    { title: 'Services', link: '/admin/services' },
    { title: 'Modify Bulk Services', link: '/admin/services/bulk-modify' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/services/get-services');
      const result = await response.json();

      if (result.success) {
        setServices(result.data);
      } else {
        toast.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.category_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map((service) => service.id));
    }
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    if (Object.keys(bulkData).length === 0) {
      toast.error('Please specify at least one field to update');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/admin/services/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceIds: selectedServices,
          updateData: bulkData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Successfully updated ${selectedServices.length} services`
        );
        setSelectedServices([]);
        setBulkData({});
        setShowBulkForm(false);
        fetchServices();
      } else {
        toast.error(result.error || 'Failed to update services');
      }
    } catch (error) {
      console.error('Error updating services:', error);
      toast.error('Error updating services');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full space-y-6">
        <div className="flex items-center justify-between py-1">
          <BreadCrumb items={breadcrumbItems} />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-lg font-medium">Loading services...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">

      {/* Search and Filter Section */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Search className="h-5 w-5 text-blue-500" />
            Search & Filter Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Services</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Filter by Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                className="flex-1 hover:bg-blue-50 transition-all duration-200"
              >
                {selectedServices.length === filteredServices.length ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowBulkForm(!showBulkForm)}
                disabled={selectedServices.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Bulk Edit ({selectedServices.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Edit Form */}
      {showBulkForm && (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg animate-in slide-in-from-top-5 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-700">
              <Settings className="h-5 w-5" />
              Bulk Update Settings
            </CardTitle>
            <p className="text-sm text-blue-600">
              Update {selectedServices.length} selected services
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-rate" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Rate (per 1000)
                </Label>
                <Input
                  id="bulk-rate"
                  type="number"
                  step="0.01"
                  placeholder="Enter new rate"
                  value={bulkData.rate || ''}
                  onChange={(e) =>
                    setBulkData((prev) => ({
                      ...prev,
                      rate: parseFloat(e.target.value) || undefined,
                    }))
                  }
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-min">Minimum Order</Label>
                <Input
                  id="bulk-min"
                  type="number"
                  placeholder="Min order"
                  value={bulkData.min_order || ''}
                  onChange={(e) =>
                    setBulkData((prev) => ({
                      ...prev,
                      min_order: parseInt(e.target.value) || undefined,
                    }))
                  }
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-max">Maximum Order</Label>
                <Input
                  id="bulk-max"
                  type="number"
                  placeholder="Max order"
                  value={bulkData.max_order || ''}
                  onChange={(e) =>
                    setBulkData((prev) => ({
                      ...prev,
                      max_order: parseInt(e.target.value) || undefined,
                    }))
                  }
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-status">Status</Label>
                <select
                  id="bulk-status"
                  value={bulkData.status || ''}
                  onChange={(e) =>
                    setBulkData((prev) => ({
                      ...prev,
                      status: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="">Keep current</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                onClick={handleBulkUpdate}
                disabled={updating || Object.keys(bulkData).length === 0}
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
                    Update {selectedServices.length} Services
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setShowBulkForm(false);
                  setBulkData({});
                }}
                variant="outline"
                className="hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-green-500" />
            Services List ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  selectedServices.includes(service.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleSelectService(service.id)}
                      className="transition-all duration-200"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {service.category.category_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${service.rate}
                      </p>
                      <p className="text-xs text-gray-500">per 1000</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {service.min_order} - {service.max_order}
                      </p>
                      <p className="text-xs text-gray-500">Min - Max</p>
                    </div>

                    <Badge
                      variant={
                        service.status === 'active' ? 'default' : 'secondary'
                      }
                      className={`${
                        service.status === 'active'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } transition-all duration-200`}
                    >
                      {service.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No services found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
