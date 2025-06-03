/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { PriceDisplay } from '@/components/PriceDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useGetServices } from '@/hooks/service-fetch';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import { 
  Loader2, 
  Pencil, 
  Trash, 
  Search, 
  Filter, 
  Eye,
  Star,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  XCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import Link from 'next/link';
import { Fragment, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import ServiceViewModal from './serviceViewModal';

export default function ServiceTable() {
  const user = useCurrentUser();
  const { data, error, isLoading } = useGetServices();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter and search services
  const filteredServices = useMemo(() => {
    if (!data?.data) return [];
    
    let filtered = data.data.filter((service: any) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.category?.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'active') return matchesSearch && service.status === 'active';
      if (filterStatus === 'inactive') return matchesSearch && service.status === 'inactive';
      if (filterStatus === 'updated') return matchesSearch && service.updateText;
      
      return matchesSearch;
    });

    // Sort services
    filtered.sort((a: any, b: any) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'rate') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [data?.data, searchTerm, filterStatus, sortBy, sortOrder]);

  const getServiceStatusIcon = (service: any) => {
    if (service.status === 'inactive') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (service.updateText) {
      return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getServiceStatusBadge = (service: any) => {
    if (service.status === 'inactive') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    }
    if (service.updateText) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          Updated
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  // Toggle service status
  const toggleServiceStatus = async (service: any) => {
    try {
      setIsUpdating(true);
      const response = await axiosInstance.post('/api/admin/services/toggle-status', {
        id: service.id,
        status: service.status
      });

      if (response.data.success) {
        toast.success(response.data.message);
        mutate('/api/admin/services/get-services');
        mutate('/api/admin/services/stats');
      } else {
        toast.error('Failed to update service status');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Something went wrong'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // delete category
  const deleteService = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col items-center justify-center p-5 text-center z-50 bg-white dark:bg-black rounded-lg shadow-lg">
        <p className="text-sm font-semibold">
          Are you sure you want to delete this Service?
        </p>
        <div className="flex items-center justify-center space-x-2 pt-5">
          <button
            onClick={() => {
              toast.dismiss(t);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await axiosInstance.delete(
                  `/api/admin/services/delete-services?id=${id}`
                );
                toast.success('Services deleted successfully');
                mutate('/api/admin/services/get-services');
                mutate('/api/admin/services/stats');
              } catch (error) {
                toast.error('Failed to delete services' + error);
              }
              toast.dismiss(t);
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20 animate-pulse" />
      </div>
      <p className="text-lg font-medium text-foreground mb-2">Loading Services</p>
      <p className="text-sm text-muted-foreground">Please wait while we fetch your services...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl shadow-lg">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-lg font-medium text-foreground mb-2">Error Loading Services</p>
      <p className="text-sm text-muted-foreground">{error}</p>
    </div>
  );
  
  if (!data) return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-900 rounded-xl shadow-lg">
      <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-lg font-medium text-foreground mb-2">No Data Available</p>
      <p className="text-sm text-muted-foreground">No services found in the system.</p>
    </div>
  );
  
  return (
    <Fragment>
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-10 border-border focus:border-primary/50 transition-colors"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:border-primary/50 transition-colors"
            >
              <option value="all">All Services</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="updated">Recently Updated</option>
            </select>
            
            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:border-primary/50 transition-colors"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="rate-asc">Price (Low-High)</option>
              <option value="rate-desc">Price (High-Low)</option>
            </select>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredServices.length} of {data?.data?.length || 0} services
            {searchTerm && (
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded-md">
                Filtered by: "{searchTerm}"
              </span>
            )}
          </span>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear search
            </Button>
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-lg border border-border overflow-hidden shadow-sm">
        <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/70 transition-colors">
            <TableHead className="font-semibold text-foreground">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                ID
              </div>
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Service
              </div>
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Rate per 1000
              </div>
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Min/Max
              </div>
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg time
              </div>
            </TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredServices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No services found</p>
                  <p className="text-sm">
                    {searchTerm ? `No services match "${searchTerm}"` : 'No services available'}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredServices.map((service: any, i: number) => (
              <TableRow key={i} className={`hover:bg-muted/30 transition-colors group ${service.status === 'inactive' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                      #{i + 1}
                    </span>
                    {getServiceStatusIcon(service)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors text-ellipsis whitespace-nowrap text-wrap max-w-[400px] overflow-hidden">
                      {service?.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {service.category?.category_name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <PriceDisplay
                      amount={service?.rate}
                      originalCurrency={user?.currency || ('USD' as any)}
                      className=" font-bold"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {service?.min_order} - {service?.max_order}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Min / Max orders
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{service?.avg_time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getServiceStatusBadge(service)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelected(service);
                        setIsOpen(true);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
                      title="Edit Service"
                    >
                      <Link href={`/dashboard/admin/services/${service?.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleServiceStatus(service)}
                      disabled={isUpdating}
                      className={`h-8 w-8 p-0 ${
                        service.status === 'active' 
                          ? 'hover:bg-red-100 hover:text-red-600' 
                          : 'hover:bg-green-100 hover:text-green-600'
                      } transition-colors`}
                      title={service.status === 'active' ? 'Deactivate Service' : 'Activate Service'}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : service.status === 'active' ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteService(service?.id)}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                      title="Delete Service"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
      
      {/* Pagination and Summary Footer */}
      {filteredServices.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/20 rounded-lg border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{filteredServices.filter((s: any) => s.status === 'active').length} Active</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>{filteredServices.filter((s: any) => s.status === 'inactive').length} Inactive</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>{filteredServices.filter((s: any) => s.updateText).length} Updated</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{filteredServices.length} Total</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              Export Data
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Bulk Actions
            </Button>
          </div>
        </div>
      )}
      
      {/* Service View Modal */}
      <ServiceViewModal
        service={selected}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelected({});
        }}
      />
    </Fragment>
  );
}
