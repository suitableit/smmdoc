'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { Fragment, useEffect, useState } from 'react';
import {
    FaArrowRight,
    FaCheckCircle,
    FaClipboardList,
    FaEye,
    FaRegStar,
    FaSearch,
    FaStar,
    FaTimes,
} from 'react-icons/fa';

import { PriceDisplay } from '@/components/PriceDisplay';
import { useCurrentUser } from '@/hooks/use-current-user';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Toast Component
const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
      type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : type === 'info'
        ? 'bg-blue-50 border-blue-200 text-blue-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

interface Service {
  id: number;
  name: string;
  rate: number;
  min_order: number;
  max_order: number;
  avg_time: string;
  description: string;
  category: {
    category_name: string;
    id: number;
  };
  isFavorite?: boolean;
}

// Services Table Component
const ServicesTable: React.FC = () => {
  const user = useCurrentUser();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [groupedServices, setGroupedServices] = useState<
    Record<string, Service[]>
  >({});
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [limit, setLimit] = useState('50');
  const [isShowAll, setIsShowAll] = useState(false);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

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
              'Cache-Control': 'no-cache',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.statusText}`);
        }

        const data = await response.json();

        if (!user?.id) {
          const servicesData =
            data?.data?.map((service: Service) => ({
              ...service,
              isFavorite: false,
            })) || [];

          setServices(servicesData);
          // Group services by category
          const grouped = servicesData.reduce(
            (acc: Record<string, Service[]>, service: Service) => {
              const categoryName =
                service.category?.category_name || 'Uncategorized';
              if (!acc[categoryName]) {
                acc[categoryName] = [];
              }
              acc[categoryName].push(service);
              return acc;
            },
            {}
          );
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
                'Cache-Control': 'no-cache',
              },
            }
          );

          if (!favResponse.ok) {
            throw new Error(
              `Failed to fetch favorites: ${favResponse.statusText}`
            );
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
          const grouped = servicesWithFavorites.reduce(
            (acc: Record<string, Service[]>, service: Service) => {
              const categoryName =
                service.category?.category_name || 'Uncategorized';
              if (!acc[categoryName]) {
                acc[categoryName] = [];
              }
              acc[categoryName].push(service);
              return acc;
            },
            {}
          );
          setGroupedServices(grouped);
        } catch (favError) {
          console.error('Error fetching favorites:', favError);
          // If favorite fetch fails, still show services without favorites
          const servicesData =
            data?.data?.map((service: Service) => ({
              ...service,
              isFavorite: false,
            })) || [];

          setServices(servicesData);

          // Group services by category
          const grouped = servicesData.reduce(
            (acc: Record<string, Service[]>, service: Service) => {
              const categoryName =
                service.category?.category_name || 'Uncategorized';
              if (!acc[categoryName]) {
                acc[categoryName] = [];
              }
              acc[categoryName].push(service);
              return acc;
            },
            {}
          );
          setGroupedServices(grouped);
        }

        setTotalPages(data.totalPages || 1);
        setIsShowAll(data.isShowAll || false);

        // Update grouped services to include empty categories
        if (data.allCategories && data.allCategories.length > 0) {
          const servicesData = data?.data || [];

          // Group services by category
          const grouped = servicesData.reduce(
            (acc: Record<string, Service[]>, service: Service) => {
              const categoryName =
                service.category?.category_name || 'Uncategorized';
              if (!acc[categoryName]) {
                acc[categoryName] = [];
              }
              acc[categoryName].push(service);
              return acc;
            },
            {}
          );

          // Add empty categories
          data.allCategories.forEach((category: any) => {
            if (!grouped[category.category_name]) {
              grouped[category.category_name] = [];
            }
          });

          setGroupedServices(grouped);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        showToast('Error fetching services. Please try again later.', 'error');
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
      showToast('You need to be logged in to favorite services', 'error');
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
          'Cache-Control': 'no-cache',
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

        showToast(data.message, 'success');
      } else {
        throw new Error(data.error || 'Failed to update favorite status');
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'An error occurred',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
        <div className="text-center py-8 flex flex-col items-center">
          <GradientSpinner size="w-14 h-14" className="mb-4" />
          <div className="text-lg font-medium">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
      {/* Toast Container */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            id="service-search"
            type="search"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Services by Category */}
      {Object.keys(groupedServices).length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white first:rounded-tl-lg">
                  Fav
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Service
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Rate per 1000
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Min order
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Max order
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Average time
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white last:rounded-tr-lg">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedServices).map(
                ([categoryName, categoryServices]) => (
                  <Fragment key={categoryName}>
                    {/* Category Row */}
                    <tr>
                      <td colSpan={8} className="py-0">
                        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium py-3 px-6 shadow-lg">
                          <h3 className="text-lg font-semibold">
                            {categoryName}
                          </h3>
                        </div>
                      </td>
                    </tr>

                    {/* Category Services */}
                    {categoryServices.map((service, index) => {
                      const isLastInCategory =
                        index === categoryServices.length - 1;
                      const isLastCategory =
                        Object.keys(groupedServices).indexOf(categoryName) ===
                        Object.keys(groupedServices).length - 1;
                      const isLastRow = isLastInCategory && isLastCategory;

                      return (
                        <tr
                          key={service.id}
                          className={`border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                            isLastRow ? 'last:border-b-0' : ''
                          }`}
                        >
                          <td
                            className={`py-3 px-4 ${
                              isLastRow ? 'first:rounded-bl-lg' : ''
                            }`}
                          >
                            <button
                              onClick={() => toggleFavorite(service.id)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                              title={
                                service.isFavorite
                                  ? 'Remove from favorites'
                                  : 'Add to favorites'
                              }
                            >
                              {service.isFavorite ? (
                                <FaStar className="w-4 h-4 text-yellow-500" />
                              ) : (
                                <FaRegStar className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                              {service.id}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {service.name}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              <PriceDisplay
                                amount={service.rate}
                                originalCurrency={'USD'}
                              />
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {service.min_order?.toString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {service.max_order?.toString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {service.avg_time || 'N/A'}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              isLastRow ? 'last:rounded-br-lg' : ''
                            }`}
                          >
                            <button className="flex items-center gap-2 px-3 py-1 text-sm text-[var(--primary)] dark:text-[var(--secondary)] hover:text-[#4F0FD8] dark:hover:text-[#A121E8] border border-[var(--primary)] dark:border-[var(--secondary)] rounded hover:bg-[var(--primary)]/10 dark:hover:bg-[var(--secondary)]/10 transition-colors duration-200">
                              <FaEye className="w-3 h-3" />
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 flex flex-col items-center">
          <FaClipboardList className="text-4xl text-gray-400 dark:text-gray-500 mb-4" />
          <div className="text-lg font-medium text-gray-900 dark:text-white">
            No services found
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page <span className="font-medium">{page}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const OurServices: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0712] transition-colors duration-200">
      {/* Hero Section */}
      <section className="pt-[60px] lg:pt-[120px] pb-[30px] lg:pb-[60px] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors duration-200">
                Services & Pricing
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-justify text-lg mb-6 leading-relaxed transition-colors duration-200">
                Discover your ideal social media strategy with SMMDOC's Service
                & Pricing List. This page offers a clear, concise table of our
                services across various platforms, along with transparent
                pricing to fit your budget. From boosting your Facebook presence
                to enhancing your YouTube channel, our services are tailored to
                meet your needs. For more about our mission and approach, visit
                our About Us page. Make an informed choice with SMMDOC, where
                quality meets affordability in social media marketing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <span>Get Started</span>
                  <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[var(--primary)] dark:border-[var(--secondary)] text-[var(--primary)] dark:text-[var(--secondary)] font-semibold px-8 py-4 rounded-lg hover:bg-[var(--primary)] hover:text-white dark:hover:bg-[var(--secondary)] transition-all duration-300 hover:-translate-y-1"
                >
                  <span>Learn More</span>
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="text-center lg:text-right">
              <div className="relative">
                <Image
                  src="/smmpanel-service-banner.webp"
                  alt="SMM Panel Provider in Bangladesh"
                  width={600}
                  height={500}
                  className="w-full max-w-lg mx-auto lg:mx-0 rounded-2xl"
                  priority
                />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] rounded-full opacity-30 animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Table Section */}
      <section className="pt-[30px] lg:pt-[60px] pb-[120px] lg:pb-[120px] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              Our Services & Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto transition-colors duration-200">
              Browse our comprehensive list of social media services with
              transparent pricing.
            </p>
          </div>
          <ServicesTable />
        </div>
      </section>
    </div>
  );
};

export default OurServices;
