/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import { revalidate } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  FaBell,
  FaCheckCircle,
  FaClipboardList,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';

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
  updatedAt: string;
  updateText: string;
}

export default function UpdateServiceTable() {
  const user = useCurrentUser();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  const limit = 50;

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Service Updates — ${APP_NAME}`;
  }, []);

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
          `/api/user/services/getUpdateServices?page=${page}&limit=${limit}&search=${debouncedSearch}`,
          revalidate
        );
        const data = await response.json();

        if (response.ok) {
          setServices(data.data);
          setTotalPages(data.totalPages);
        } else {
          showToast(data.message || 'Error fetching services', 'error');
        }
      } catch (error) {
        showToast('Error fetching services. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [page, debouncedSearch, user?.id]);

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-b border-gray-100">
        <td className="py-3 px-4">
          <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="py-3 px-4">
          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="py-3 px-4">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="py-3 px-4">
          <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
      </tr>
    ));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card card-padding">
            <div className="text-center py-8 flex flex-col items-center">
              <GradientSpinner size="w-14 h-14" className="mb-4" />
              <div className="text-lg font-medium">
                Loading service updates...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Toast Container */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="page-content">
        {/* Service Updates Content Card - Everything in one box */}
        <div className="card card-padding">
          {/* Header with Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="card-icon">
              <FaBell className="w-5 h-5 text-white" />
            </div>
            <h1 className="card-title">Service Updates</h1>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="search"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Services Updates Table */}
          {services?.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 first:rounded-tl-lg">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 max-w-[400px]">
                      Service
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 w-[300px] last:rounded-tr-lg">
                      Update
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services?.map((service, i) => {
                    const isLastRow = i === services.length - 1;
                    return (
                      <tr
                        key={i}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          isLastRow ? 'last:border-b-0' : ''
                        }`}
                      >
                        <td
                          className={`py-3 px-4 ${
                            isLastRow ? 'first:rounded-bl-lg' : ''
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-[400px]">
                          <div
                            className="font-medium text-gray-900 truncate"
                            title={service.name}
                          >
                            {service.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {new Intl.DateTimeFormat('en', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                              hour12: false,
                              timeZone: 'Asia/Dhaka',
                            }).format(new Date(service.updatedAt))}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 w-[300px] ${
                            isLastRow ? 'last:rounded-br-lg' : ''
                          }`}
                        >
                          <div
                            className="text-sm text-gray-700 truncate"
                            title={service.updateText}
                          >
                            {service.updateText}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center">
              <FaClipboardList className="text-4xl text-gray-400 mb-4" />
              <div className="text-lg font-medium">
                No service updates found
              </div>
              <div className="text-sm text-gray-500">
                Try adjusting your search criteria
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={page === 1 || loading}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={page === totalPages || loading}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
