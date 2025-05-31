/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import ServiceViewModal from '@/components/admin/services/serviceViewModal';
import { PriceDisplay } from '@/components/PriceDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SearchIcon, Star } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  rate: number;
  min_order: number;
  max_order: number;
  avg_time: string;
  description: string;
  category: {
    category_name: string;
    id: string;
  };
  isFavorite?: boolean;
}

export default function UserServiceTable() {
  const user = useCurrentUser();
  const [services, setServices] = useState<Service[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [groupedServices, setGroupedServices] = useState<Record<string, Service[]>>({});

  const limit = 50;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // First fetch the services
        const response = await fetch(
          `/api/user/services?page=${page}&limit=${limit}&search=${debouncedSearch}`,
          {
            method: 'GET',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.statusText}`);
        }

        const data = await response.json();

        if (!user?.id) {
          const servicesData = data?.data?.map((service: Service) => ({
            ...service,
            isFavorite: false,
          })) || [];
          
          setServices(servicesData);
          // Group services by category
          const grouped = servicesData.reduce((acc: Record<string, Service[]>, service: Service) => {
            const categoryName = service.category?.category_name || 'Uncategorized';
            if (!acc[categoryName]) {
              acc[categoryName] = [];
            }
            acc[categoryName].push(service);
            return acc;
          }, {});
          setGroupedServices(grouped);
          setTotalPages(data.totalPages || 1);
          return;
        }

        try {
          // Then fetch favorite status
          const favResponse = await fetch(
            `/api/user/services/favorite-status?userId=${user.id}`,
            {
              method: 'GET',
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache'
              }
            }
          );
          
          if (!favResponse.ok) {
            throw new Error(`Failed to fetch favorites: ${favResponse.statusText}`);
          }
          
          const favData = await favResponse.json();
          const favoriteServiceIds = favData.favoriteServiceIds || [];

          // Merge favorite status with services
          const servicesWithFavorites =
            data?.data?.map((service: Service) => ({
              ...service,
              isFavorite: favoriteServiceIds.includes(service.id),
            })) || [];

          setServices(servicesWithFavorites);
          
          // Group services by category
          const grouped = servicesWithFavorites.reduce((acc: Record<string, Service[]>, service: Service) => {
            const categoryName = service.category?.category_name || 'Uncategorized';
            if (!acc[categoryName]) {
              acc[categoryName] = [];
            }
            acc[categoryName].push(service);
            return acc;
          }, {});
          setGroupedServices(grouped);
          
        } catch (favError) {
          console.error('Error fetching favorites:', favError);
          // If favorite fetch fails, still show services without favorites
          const servicesData = data?.data?.map((service: Service) => ({
            ...service,
            isFavorite: false,
          })) || [];
          
          setServices(servicesData);
          
          // Group services by category
          const grouped = servicesData.reduce((acc: Record<string, Service[]>, service: Service) => {
            const categoryName = service.category?.category_name || 'Uncategorized';
            if (!acc[categoryName]) {
              acc[categoryName] = [];
            }
            acc[categoryName].push(service);
            return acc;
          }, {});
          setGroupedServices(grouped);
        }
        
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Error fetching services. Please try again later.');
        setServices([]);
        setGroupedServices({});
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [page, debouncedSearch, user?.id, limit]);

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const toggleFavorite = async (serviceId: string) => {
    if (!user?.id) {
      toast.error('You need to be logged in to favorite services');
      return;
    }

    try {
      // Find the current service to get the current favorite status
      const currentService = services.find(
        (service) => service.id === serviceId
      );
      if (!currentService) return;

      const response = await fetch('/api/user/services/servicefav', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store',
        body: JSON.stringify({
          serviceId,
          userId: user.id,
          action: currentService.isFavorite ? 'remove' : 'add', // Explicit action
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === serviceId
              ? { ...service, isFavorite: !service.isFavorite }
              : service
          )
        );
        
        // Update grouped services as well
        setGroupedServices((prevGrouped) => {
          const newGrouped = { ...prevGrouped };
          Object.keys(newGrouped).forEach((categoryName) => {
            newGrouped[categoryName] = newGrouped[categoryName].map((service) =>
              service.id === serviceId
                ? { ...service, isFavorite: !service.isFavorite }
                : service
            );
          });
          return newGrouped;
        });
        
        toast.success(data.message);
      } else {
        throw new Error(data.error || 'Failed to update favorite status');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleViewDetails = (service: Service) => {
    setSelected(service);
    setIsOpen(true);
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-4 w-4" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[200px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Fragment>
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Search services..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fav</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Rate per 1000</TableHead>
                <TableHead>Min order</TableHead>
                <TableHead>Max order</TableHead>
                <TableHead>Average time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderSkeletonRows()}
            </TableBody>
          </Table>
        </div>
      ) : (
        Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
          <div key={categoryName} className="mb-6">
            <div className="bg-purple-600 text-white font-medium py-2 px-4 rounded-t-md">
              {categoryName}
            </div>
            <div className="rounded-b-md border border-t-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fav</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Rate per 1000</TableHead>
                    <TableHead>Min order</TableHead>
                    <TableHead>Max order</TableHead>
                    <TableHead>Average time</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(service.id)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              service.isFavorite
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell>{service.id}</TableCell>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell>
                        <PriceDisplay amount={service.rate} originalCurrency={'USD'} />
                      </TableCell>
                      <TableCell>{service.min_order}</TableCell>
                      <TableCell>{service.max_order}</TableCell>
                      <TableCell>{service.avg_time}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(service)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  className={
                    page === totalPages ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {isOpen && selected && (
        <ServiceViewModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          service={selected}
        />
      )}
    </Fragment>
  );
}
