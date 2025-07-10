//
'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { Fragment, useEffect, useState } from 'react';
import {
  FaArrowDown,
  FaArrowRight,
  FaArrowUp,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaDollarSign,
  FaEye,
  FaLink,
  FaRedo,
  FaRegStar,
  FaSearch,
  FaStar,
  FaTachometerAlt,
  FaTimes,
} from 'react-icons/fa';

import { PriceDisplay } from '@/components/PriceDisplay';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { formatNumber } from '@/lib/utils';

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
  refill?: string;
  start_time?: string;
  guarantee?: string;
  speed?: string;
  link_type?: string;
}

const OurServices: React.FC = () => {
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

  // State for the new modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const limit = 50;

  // Modal logic
  useEffect(() => {
    if (isModalOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleModalClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsModalOpen(false), 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleModalClose();
    }
  };

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
        const response = await fetch(
          `/api/user/services?page=${page}&limit=${limit}&search=${debouncedSearch}`,
          {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          }
        );
        if (!response.ok)
          throw new Error(`Failed to fetch services: ${response.statusText}`);

        const data = await response.json();
        let servicesData: Service[] =
          data?.data?.map((service: any) => ({
            ...service,
            isFavorite: false,
          })) || [];

        if (user?.id) {
          try {
            const favResponse = await fetch(
              `/api/user/services/favorite-status?userId=${user.id}`,
              {
                method: 'GET',
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' },
              }
            );
            if (favResponse.ok) {
              const favData = await favResponse.json();
              const favoriteServiceIds = new Set(
                favData.favoriteServiceIds || []
              );
              servicesData = servicesData.map((service) => ({
                ...service,
                isFavorite: favoriteServiceIds.has(service.id),
              }));
            }
          } catch (favError) {
            console.error('Error fetching favorites:', favError);
          }
        }

        setServices(servicesData);
        const grouped = servicesData.reduce(
          (acc: Record<string, Service[]>, service: Service) => {
            const categoryName =
              service.category?.category_name || 'Uncategorized';
            if (!acc[categoryName]) acc[categoryName] = [];
            acc[categoryName].push(service);
            return acc;
          },
          {}
        );
        setGroupedServices(grouped);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching services:', error);
        showToast('Error fetching services. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [page, debouncedSearch, user?.id, limit]);

  const handlePrevious = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < totalPages && setPage(page + 1);

  const toggleFavorite = async (serviceId: number) => {
    if (!user?.id) {
      showToast('You need to be logged in to favorite services', 'error');
      return;
    }

    const currentService = services.find((s) => s.id === serviceId);
    if (!currentService) return;

    try {
      const response = await fetch('/api/user/services/servicefav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          serviceId,
          userId: user.id,
          action: currentService.isFavorite ? 'remove' : 'add',
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to update favorite status');

      const updatedServices = services.map((s) =>
        s.id === serviceId ? { ...s, isFavorite: !s.isFavorite } : s
      );
      setServices(updatedServices);
      const newGrouped = { ...groupedServices };
      Object.keys(newGrouped).forEach((cat) => {
        newGrouped[cat] = newGrouped[cat].map((s) =>
          s.id === serviceId ? { ...s, isFavorite: !s.isFavorite } : s
        );
      });
      setGroupedServices(newGrouped);
      showToast(data.message, 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'An error occurred',
        'error'
      );
    }
  };

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0712] transition-colors duration-200">
      <section className="pt-[60px] lg:pt-[120px] pb-[30px] lg:pb-[60px] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors duration-200">
                Services & Pricing
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-justify text-lg mb-6 leading-relaxed transition-colors duration-200">
                Discover your ideal social media strategy with SMMDOC Service &
                Pricing List. This page offers a clear, concise table of our
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
          <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
            {toastMessage && (
              <Toast
                message={toastMessage.message}
                type={toastMessage.type}
                onClose={() => setToastMessage(null)}
              />
            )}
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

            {loading ? (
              <div className="text-center py-8 flex flex-col items-center">
                <GradientSpinner size="w-14 h-14" className="mb-4" />
                <div className="text-lg font-medium">Loading services...</div>
              </div>
            ) : Object.keys(groupedServices).length > 0 ? (
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
                          <tr>
                            <td colSpan={8} className="py-0">
                              <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium py-3 px-6 shadow-lg">
                                <h3 className="text-lg font-semibold">
                                  {categoryName}
                                </h3>
                              </div>
                            </td>
                          </tr>
                          {categoryServices.map((service, index) => {
                            const isLastRow =
                              index === categoryServices.length - 1 &&
                              Object.keys(groupedServices).indexOf(
                                categoryName
                              ) ===
                                Object.keys(groupedServices).length - 1;
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
                                  >
                                    {service.isFavorite ? (
                                      <FaStar className="w-4 h-4 text-yellow-500" />
                                    ) : (
                                      <FaRegStar className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                                    )}
                                  </button>
                                </td>
                                <td className="py-3 px-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                                  {service.id}
                                </td>
                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                  {service.name}
                                </td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                  <PriceDisplay
                                    amount={service.rate}
                                    originalCurrency={'USD'}
                                  />
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                  {formatNumber(service.min_order || 0)}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                  {formatNumber(service.max_order || 0)}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                  {service.avg_time || 'N/A'}
                                </td>
                                <td
                                  className={`py-3 px-4 ${
                                    isLastRow ? 'last:rounded-br-lg' : ''
                                  }`}
                                >
                                  <button
                                    onClick={() => handleViewDetails(service)}
                                    className="flex items-center gap-2 px-3 py-1 text-sm text-[var(--primary)] dark:text-[var(--secondary)] hover:text-[#4F0FD8] dark:hover:text-[#A121E8] border border-[var(--primary)] dark:border-[var(--secondary)] rounded hover:bg-[var(--primary)]/10 dark:hover:bg-[var(--secondary)]/10 transition-colors duration-200"
                                  >
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
        </div>
      </section>

      {/* Service Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ${
              isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
            }`}
            onClick={handleBackdropClick}
          />
          <div
            className={`relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-xl transition-all duration-300 transform ${
              isAnimating
                ? 'scale-100 opacity-100 translate-y-0'
                : 'scale-95 opacity-0 translate-y-4'
            }`}
          >
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="flex justify-end p-4 pb-0 sticky top-0 bg-white z-10">
                <button
                  onClick={handleModalClose}
                  className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                >
                  <FaTimes className="w-4 h-4 text-red-600" />
                </button>
              </div>
              <div className="bg-[#f3f3f3] mx-6 mb-6 px-6 py-4 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600 font-medium mb-2">
                    #ID: {selectedService?.id}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 leading-tight">
                    {selectedService?.name}
                  </h2>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="text-black w-4 h-4" />
                      <span className="text-gray-700 font-medium">
                        Price Per 1000
                      </span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      <PriceDisplay
                        amount={selectedService?.rate || 0}
                        originalCurrency={'USD'}
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaArrowDown className="text-black w-4 h-4" />
                      <span className="text-gray-700 font-medium">
                        Min Order
                      </span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {formatNumber(selectedService?.min_order || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaArrowUp className="text-black w-4 h-4" />
                      <span className="text-gray-700 font-medium">
                        Max order
                      </span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {formatNumber(selectedService?.max_order || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-black w-4 h-4" />
                      <span className="text-gray-700 font-medium">
                        Average Time
                      </span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {selectedService?.avg_time || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaRedo className="text-black w-4 h-4" />
                      <span className="text-gray-700 font-medium">Refill</span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {selectedService?.refill || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-black w-4 h-4" />
                      <span className="text-gray-700 font-medium">
                        Start Time
                      </span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {selectedService?.start_time || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-black w-4 h-4" />
                      <span className="text-gray-700 font-medium">
                        Guarantee
                      </span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {selectedService?.guarantee || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaTachometerAlt className="text-black w-4 h-4" />
                      <span className="text-gray-700 font-medium">Speed</span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {selectedService?.speed || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaLink className="text-black w-4 h-4" />
                      <span className="text-gray-700 font-medium">
                        Link Type
                      </span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {selectedService?.link_type || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">
                      Service Description:
                    </p>
                    <div
                      className="space-y-2 text-sm"
                      dangerouslySetInnerHTML={{
                        __html: selectedService?.description || '',
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <Link href={`/new-order?sId=${selectedService?.id}`}>
                  <Button
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                    onClick={handleModalClose}
                  >
                    Buy Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OurServices;
