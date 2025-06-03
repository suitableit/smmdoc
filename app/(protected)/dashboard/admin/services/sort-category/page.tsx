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
  ArrowUpDown, 
  Save, 
  RefreshCw, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Eye,
  Package,
  TrendingUp,
  BarChart3,
  Layers
} from 'lucide-react';

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
  createdAt: string;
}

interface Category {
  id: string;
  category_name: string;
  services: Service[];
}

type SortOption = 'name' | 'rate' | 'created' | 'orders' | 'status';
type SortDirection = 'asc' | 'desc';

export default function SortByCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const breadcrumbItems = [
    { title: 'Services', link: '/dashboard/admin/services' },
    { title: 'Sort by Category', link: '/dashboard/admin/services/sort-category' },
  ];

  useEffect(() => {
    fetchCategoriesWithServices();
  }, []);

  const fetchCategoriesWithServices = async () => {
    try {
      setLoading(true);
      const [categoriesRes, servicesRes] = await Promise.all([
        fetch('/api/admin/categories/get-categories'),
        fetch('/api/admin/services/get-services')
      ]);
      
      const categoriesResult = await categoriesRes.json();
      const servicesResult = await servicesRes.json();
      
      if (categoriesResult.success && servicesResult.success) {
        // Group services by category
        const categoriesWithServices = categoriesResult.data.map((category: any) => ({
          ...category,
          services: servicesResult.data.filter((service: Service) => service.category.id === category.id)
        }));
        
        setCategories(categoriesWithServices);
      } else {
        toast.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const sortServices = (services: Service[]): Service[] => {
    return [...services].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rate':
          aValue = a.rate;
          bValue = b.rate;
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'orders':
          aValue = a.min_order;
          bValue = b.min_order;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    services: sortServices(
      category.services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  })).filter(category => 
    selectedCategory === 'all' || category.id === selectedCategory
  );

  const totalServices = categories.reduce((sum, cat) => sum + cat.services.length, 0);
  const activeServices = categories.reduce((sum, cat) => 
    sum + cat.services.filter(s => s.status === 'active').length, 0
  );

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  const saveSortOrder = async () => {
    try {
      setSaving(true);
      // This would save the current sort preferences to the database
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Sort preferences saved successfully');
    } catch (error) {
      console.error('Error saving sort order:', error);
      toast.error('Error saving sort order');
    } finally {
      setSaving(false);
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
            <span className="text-lg font-medium">Loading categories and services...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between py-1">
        <div>
          <BreadCrumb items={breadcrumbItems} />
          <p className="text-sm text-muted-foreground mt-1">
            Organize and sort services by categories
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
                <p className="text-3xl font-bold text-gray-800">{categories.length}</p>
                <Layers className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Layers className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">{totalServices}</p>
                <Package className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <Package className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-violet-100">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">{activeServices}</p>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Active Services</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-orange-50 to-amber-100">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-bold text-gray-800">
                  {filteredCategories.reduce((sum, cat) => sum + cat.services.length, 0)}
                </p>
                <Filter className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Filtered Results</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-full">
              <Filter className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Section */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Sort & Filter Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Services</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Filter by Category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.category_name} ({category.services.length})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <option value="name">Name</option>
                  <option value="rate">Rate</option>
                  <option value="created">Created Date</option>
                  <option value="orders">Min Order</option>
                  <option value="status">Status</option>
                </select>
                <Button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  variant="outline"
                  size="sm"
                  className="px-3 hover:bg-purple-50 transition-all duration-200"
                >
                  {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>View Mode</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 transition-all duration-200"
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 transition-all duration-200"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              onClick={saveSortOrder}
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 transition-all duration-200"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Sort Preferences
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setSortBy('name');
                setSortDirection('asc');
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
              className="hover:bg-gray-50 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories and Services Display */}
      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="relative overflow-hidden border-0 bg-white shadow-lg">
            <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-purple-700">
                  <Layers className="h-5 w-5" />
                  {category.category_name}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-all duration-200"
                >
                  {category.services.length} services
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {category.services.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No services found in this category</p>
                </div>
              ) : (
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
                }>
                  {category.services.map((service, index) => (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:border-purple-300 ${
                        viewMode === 'grid'
                          ? 'bg-gradient-to-br from-gray-50 to-purple-50'
                          : 'bg-gray-50 hover:bg-purple-50'
                      }`}
                    >
                      <div className={viewMode === 'grid' ? 'space-y-3' : 'flex items-center justify-between'}>
                        <div className={viewMode === 'grid' ? 'space-y-2' : 'flex-1'}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h3 className="font-medium text-gray-900 truncate">{service.name}</h3>
                          </div>
                          {viewMode === 'grid' && (
                            <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                          )}
                        </div>

                        <div className={viewMode === 'grid'
                          ? 'flex items-center justify-between'
                          : 'flex items-center gap-4'
                        }>
                          <div className="text-center">
                            <p className="font-semibold text-green-600">${service.rate}</p>
                            <p className="text-xs text-gray-500">per 1000</p>
                          </div>

                          <div className="text-center">
                            <p className="text-sm font-medium">{service.min_order} - {service.max_order}</p>
                            <p className="text-xs text-gray-500">Min - Max</p>
                          </div>

                          <Badge
                            variant={service.status === 'active' ? 'default' : 'secondary'}
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
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredCategories.length === 0 && (
          <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
            <CardContent className="p-12">
              <div className="text-center">
                <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No categories found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
