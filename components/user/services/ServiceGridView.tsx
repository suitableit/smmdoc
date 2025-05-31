'use client';

import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SearchIcon } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ServiceGrid from './ServiceGrid';

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

export default function ServiceGridView() {
  const user = useCurrentUser();
  const [services, setServices] = useState<Service[]>([]);
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

  return (
    <Fragment>
      <div className="relative mb-6">
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

      <ServiceGrid 
        groupedServices={groupedServices} 
        loading={loading} 
        toggleFavorite={toggleFavorite} 
      />

      {totalPages > 1 && (
        <div className="mt-6">
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
    </Fragment>
  );
}