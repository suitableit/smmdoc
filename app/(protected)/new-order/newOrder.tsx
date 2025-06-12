/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useGetCategories } from '@/hooks/categories-fetch';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import {
  dashboardApi,
  useGetUserStatsQuery,
} from '@/lib/services/dashboardApi';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  FaCheckCircle,
  FaClock,
  FaHashtag,
  FaInfoCircle,
  FaLayerGroup,
  FaLink,
  FaSearch,
  FaShieldAlt,
  FaShoppingCart,
  FaSpinner,
  FaTachometerAlt,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

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

// Service Details Card Component
const ServiceDetailsCard = ({
  selectedService,
  services,
}: {
  selectedService: string;
  services: any[];
}) => {
  const selected = services?.find((s) => s.id === selectedService);

  if (!selected) {
    return (
      <div className="card card-padding">
        <div className="text-center py-8">
          <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500">Select a service to view details</p>
        </div>
      </div>
    );
  }

  function decodeHTML(html: string) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  return (
    <div className="space-y-6">
      {/* Service Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
          color: 'white',
          padding: '24px',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
            <FaHashtag className="inline mr-1" />
            {selected.id}
          </div>
        </div>
        <h3 className="text-lg font-bold leading-tight">{selected.name}</h3>
        <div className="text-sm opacity-90 mt-2">
          Max {selected.max_order || 'N/A'} ~ NO REFILL ~{' '}
          {selected.avg_time || 'N/A'} ~ INSTANT - ${selected.rate || '0.00'}{' '}
          per 1000
        </div>
      </div>

      {/* Service Details */}
      <div className="card card-padding">
        <div className="grid grid-cols-2 gap-4">
          {/* Example Link */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Example Link</h4>
            <div className="flex items-center text-gray-600">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FaLink className="text-red-600 text-sm" />
              </div>
              <span className="text-sm">-</span>
            </div>
          </div>

          {/* Speed */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Speed</h4>
            <div className="flex items-center text-gray-600">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <FaTachometerAlt className="text-purple-600 text-sm" />
              </div>
              <span className="text-sm">-</span>
            </div>
          </div>

          {/* Start Time */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Start Time</h4>
            <div className="flex items-center text-gray-600">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <FaClock className="text-blue-600 text-sm" />
              </div>
              <span className="text-sm">-</span>
            </div>
          </div>

          {/* Average Time */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Average Time</h4>
            <div className="flex items-center text-gray-600">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <FaClock className="text-blue-600 text-sm" />
              </div>
              <span className="text-sm">
                {selected.avg_time || 'Not enough data'}
              </span>
            </div>
          </div>

          {/* Guarantee */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Guarantee</h4>
            <div className="flex items-center text-gray-600">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <FaShieldAlt className="text-green-600 text-sm" />
              </div>
              <span className="text-sm text-red-600">✕</span>
            </div>
          </div>
        </div>

        {/* More Details */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-2">More Details</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: decodeHTML(
                  selected.description || 'No additional details available.'
                ),
              }}
            />
          </div>
        </div>

        {/* Service Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {selected.min_order || 0}
            </div>
            <div className="text-xs text-gray-500">Min Order</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {selected.max_order || 0}
            </div>
            <div className="text-xs text-gray-500">Max Order</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              ${selected.rate || '0.00'}
            </div>
            <div className="text-xs text-gray-500">Per 1000</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NewOrder() {
  const user = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { data: userStatsResponse, refetch: refetchUserStats } =
    useGetUserStatsQuery();
  const serviceIdFromUrl =
    searchParams.get('sId') || searchParams.get('serviceId');
  const categoryIdFromUrl = searchParams.get('categoryId');
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  const {
    data: category,
    error: categoryError,
    isLoading: categoryLoading,
  } = useGetCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [qty, setQty] = useState(0);
  const [link, setLink] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [favoriteCategories, setFavoriteCategories] = useState<any[]>([]);
  const [combinedCategories, setCombinedCategories] = useState<any[]>([]);
  const [categoriesWithServices, setCategoriesWithServices] = useState<any[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch price and per quantity values for the selected service
  const selected = services?.find((s) => s.id === selectedService);
  const perQty = Number(selected?.perqty) || 1;
  const price = Number(selected?.rate) || 0;
  // Get currency rate
  const { rate: currencyRate, currency } = useCurrency();

  // Calculate total price (matching API calculation: (rate * qty) / 1000)
  let totalPrice = 0;
  if (user?.currency === 'USD') {
    totalPrice = (price * qty) / 1000;
  } else {
    totalPrice = ((price * qty) / 1000) * (currencyRate || 121.52);
  }

  // Fetch favorite categories
  useEffect(() => {
    if (user?.id) {
      axiosInstance
        .get(`/api/user/services/favorites?userId=${user.id}`)
        .then((res) => {
          setFavoriteCategories(res?.data?.data || []);
        })
        .catch((error) => {
          console.error('Error fetching favorite categories:', error);
          showToast('Error fetching favorite categories', 'error');
        });
    }
  }, [user?.id]);

  // Check which favorite categories have services
  useEffect(() => {
    const checkFavoriteCategories = async () => {
      const checkedFavorites = await Promise.all(
        favoriteCategories.map(async (favCat) => {
          try {
            const res = await axios.post('/api/user/services/favserviceById', {
              favrouteCatId: favCat.id,
            });
            return {
              ...favCat,
              hasServices: res?.data?.data?.length > 0,
            };
          } catch (error) {
            return {
              ...favCat,
              hasServices: false,
            };
          }
        })
      );
      return checkedFavorites.filter((fav) => fav.hasServices);
    };

    if (favoriteCategories.length > 0) {
      checkFavoriteCategories().then((validFavorites) => {
        if (category?.data) {
          const combined = [
            // Only include favorite categories that have services
            ...validFavorites.map((favCat) => ({
              ...favCat,
              isFavorite: true,
              category_name: `⭐ ${favCat.name}`,
            })),
            // Regular categories
            ...category.data.map((regCat: any) => ({
              ...regCat,
              isFavorite: false,
            })),
          ];
          setCombinedCategories(combined);
          setCategoriesWithServices(combined);
        }
      });
    } else if (category?.data) {
      // No favorite categories, just use regular ones
      const regularCategories = category.data.map((regCat: any) => ({
        ...regCat,
        isFavorite: false,
      }));
      setCombinedCategories(regularCategories);
      setCategoriesWithServices(regularCategories);
    }
  }, [category, favoriteCategories]);

  // Fetch services based on selected category (both favorite and regular)
  useEffect(() => {
    if (selectedCategory) {
      const selectedCat = combinedCategories?.find(
        (cat) => cat?.id === selectedCategory
      );
      if (!selectedCat) return;

      if (selectedCat?.isFavorite) {
        // Fetch services from favorite category
        axios
          .post('/api/user/services/favserviceById', {
            favrouteCatId: selectedCategory,
          })
          .then((res) => {
            const fetchedServices = res?.data?.data || [];

            setServices(fetchedServices);
            setSelectedService(selectedCategory);
            handleServiceSelection(fetchedServices);
          })
          .catch(() => {
            showToast('Error fetching favorite category services', 'error');
          });
      } else {
        // Fetch services from regular category
        axios
          .post('/api/admin/services/catId-by-services', {
            categoryId: selectedCategory,
          })
          .then((res) => {
            const fetchedServices = res?.data?.data || [];
            setServices(fetchedServices);
            handleServiceSelection(fetchedServices);
          })
          .catch(() => {
            showToast('Error fetching services', 'error');
          });
      }
    }
  }, [selectedCategory, combinedCategories]);

  const handleServiceSelection = (fetchedServices: any[]) => {
    if (serviceIdFromUrl && isInitializing) {
      const serviceFromUrl = fetchedServices.find(
        (s: any) => s.id === serviceIdFromUrl
      );
      if (serviceFromUrl) {
        setSelectedService(serviceIdFromUrl);
        setSearch(serviceFromUrl.name);
      }
    } else if (fetchedServices?.length > 0) {
      setSelectedService(fetchedServices[0]?.id);
    } else {
      setSelectedService('');
    }
    setIsInitializing(false);
  };

  // Initialize with category from URL if provided
  useEffect(() => {
    if (
      categoryIdFromUrl &&
      combinedCategories.length > 0 &&
      !selectedCategory
    ) {
      const categoryExists = combinedCategories.find(
        (cat: any) => cat.id === categoryIdFromUrl
      );
      if (categoryExists) {
        setSelectedCategory(categoryIdFromUrl);
      }
    }
  }, [categoryIdFromUrl, combinedCategories, selectedCategory]);

  // Initialize with service from URL if provided
  useEffect(() => {
    if (serviceIdFromUrl && !selectedService && category?.data) {
      // First try to find the service in our existing data
      const allServices = category?.data?.flatMap(
        (cat: any) => cat.services || []
      );
      const serviceFromUrl = allServices.find(
        (s: any) => s.id === serviceIdFromUrl
      );

      if (serviceFromUrl) {
        setSelectedCategory(serviceFromUrl.categoryId);
        setSelectedService(serviceIdFromUrl);
        setSearch(serviceFromUrl.name);
      } else {
        // If not found, fetch the specific service
        fetchServiceById(serviceIdFromUrl);
      }
    }
  }, [serviceIdFromUrl, category]);

  // Fetch service details by ID
  const fetchServiceById = async (serviceId: string) => {
    try {
      const res = await axiosInstance.get(
        `/api/user/services/serviceById?svId=${serviceId}`
      );
      const service = res?.data?.data;
      if (service) {
        setSelectedCategory(service.categoryId);
        setSelectedService(service.id);
        setSearch(service.name);
      }
    } catch (error) {
      showToast('Error fetching service details', 'error');
    }
  };

  // Fetch services based on search input
  async function getServices() {
    try {
      const res = await axiosInstance.get(
        `/api/user/services/neworderservice?search=${search}`
      );
      const fetchedServices = res?.data?.data || [];
      setServicesData(fetchedServices);
    } catch (error) {
      showToast('Error fetching services', 'error');
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        getServices();
      } else {
        setServicesData([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function decodeHTML(html: string) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  const userData = useSelector((state: any) => state.userDetails);

  // Handle form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation checks
    if (!selectedService) {
      showToast('Please select a service', 'error');
      return;
    }

    if (!link || !link.startsWith('http')) {
      showToast(
        'Please enter a valid link starting with http or https',
        'error'
      );
      return;
    }

    if (qty < 1) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    const minOrder = selected?.min_order || 0;
    const maxOrder = selected?.max_order || 0;

    if (qty < minOrder) {
      showToast(`Minimum order quantity is ${minOrder}`, 'error');
      return;
    }

    if (qty > maxOrder) {
      showToast(`Maximum order quantity is ${maxOrder}`, 'error');
      return;
    }

    // Check if user has enough balance
    // Use real-time balance from API, fallback to Redux store, then user object
    const userBalanceAmount =
      userStatsResponse?.data?.balance ||
      userData?.balance ||
      user?.balance ||
      0;
    const finalTotalPrice = parseFloat(totalPrice.toFixed(4));

    if (userBalanceAmount < finalTotalPrice) {
      showToast(
        `Insufficient balance to create this order. Available: ${userBalanceAmount.toFixed(
          2
        )}, Required: ${finalTotalPrice.toFixed(2)}`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data for API (expects array format)
      // Calculate USD and BDT prices to match API calculation
      const usdPrice = (price * qty) / 1000;
      const bdtPrice = usdPrice * (currencyRate || 121.52);

      // Debug log to verify price calculation
      console.log('Price Calculation Debug:', {
        serviceRate: price,
        quantity: qty,
        usdPrice: usdPrice,
        bdtPrice: bdtPrice,
        finalTotalPrice: finalTotalPrice,
        userCurrency: user?.currency,
      });

      const orderPayload = [
        {
          link,
          qty,
          price: finalTotalPrice,
          usdPrice: usdPrice,
          bdtPrice: bdtPrice,
          currency: user?.currency,
          serviceId: selectedService,
          categoryId: selectedCategory,
          userId: user?.id,
          avg_time: selected?.avg_time || '',
        },
      ];

      // Submit order to API
      const response = await axiosInstance.post(
        '/api/user/create-orders',
        orderPayload
      );

      if (response.data.success) {
        showToast('Order created successfully!', 'success');

        // Invalidate user stats to refresh balance
        dispatch(dashboardApi.util.invalidateTags(['UserStats']));

        // Also manually refetch user stats for immediate update
        refetchUserStats();

        // Reset form
        setLink('');
        setQty(0);
        setSelectedService('');
        setSelectedCategory('');
        setSearch('');

        // Optionally redirect to orders page
        // router.push('/my-orders');
      } else {
        showToast(response.data.message || 'Failed to create order', 'error');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create order';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle search select
  const handleSearchSelect = (serviceId: string, categoryId: string) => {
    const selected = servicesData.find((s) => s.id === serviceId);

    if (selected) {
      setServicesData([]);
      setSelectedCategory(categoryId);
      setSelectedService(serviceId);
      setQty(0);
      setSearch(selected.name);
      setShowDropdown(false);
    }
  };

  if (categoryError) {
    return (
      <div className="page-container">
        <div className="page-content">Error loading</div>
      </div>
    );
  }

  if (categoryLoading) {
    return (
      <div className="page-container">
        <div className="page-content">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="page-container">
        <div className="page-content">No data available</div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Left Column - Order Form */}
          <div className="w-full space-y-4 lg:space-y-6">
            {/* Tab Navigation */}
            <div className="card" style={{ padding: '8px' }}>
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
                  <FaShoppingCart className="mr-2 w-4 h-4" />
                  New Order
                </button>
                <button
                  onClick={() => router.push('/mass-orders')}
                  className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-600"
                >
                  <FaLayerGroup className="mr-2 w-4 h-4" />
                  Mass Orders
                </button>
              </div>
            </div>

            <div className="card card-padding w-full max-w-full">
              <form onSubmit={onSubmit} className="space-y-4 w-full max-w-full">
                {/* Search Input with Dropdown */}
                <div className="form-group w-full">
                  <label className="form-label">Search Services</label>
                  <div className="relative w-full" ref={searchRef}>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                      <FaSearch className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    </div>
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="form-input pl-12"
                      placeholder="Search services..."
                      autoComplete="off"
                      style={{ width: '100%', minWidth: '0' }}
                    />

                    {/* Search Dropdown */}
                    {showDropdown && servicesData.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto left-0 right-0">
                        {servicesData.map((service) => (
                          <div
                            key={service.id}
                            className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              handleSearchSelect(service.id, service.categoryId)
                            }
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-sm text-gray-900 truncate pr-2 flex-1">
                                {service.name}
                              </span>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                ${service.rate || '0.00'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Combined Category Dropdown */}
                <div className="form-group">
                  <label className="form-label" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedService('');
                      setQty(0);
                    }}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {/* Only show favorites group if there are favorite categories with services */}
                    {categoriesWithServices.some((cat) => cat.isFavorite) && (
                      <optgroup label="Favorites">
                        {categoriesWithServices
                          .filter((cat) => cat.isFavorite)
                          .map((favCat) => (
                            <option key={`fav-${favCat.id}`} value={favCat.id}>
                              {favCat.category_name}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    {/* Regular categories */}
                    <optgroup label="All Categories">
                      {categoriesWithServices
                        .filter((cat) => !cat.isFavorite)
                        .map((cat: any) => (
                          <option key={`reg-${cat.id}`} value={cat.id}>
                            {cat.category_name}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                {/* Service Dropdown */}
                <div className="form-group">
                  <label className="form-label" htmlFor="services">
                    Services
                  </label>
                  <select
                    id="services"
                    className="form-select"
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setQty(0);
                    }}
                    disabled={!selectedCategory || services.length === 0}
                    required
                  >
                    {services?.map((service: any) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.rate || '0.00'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Link */}
                <div className="form-group">
                  <label className="form-label" htmlFor="link">
                    Link
                  </label>
                  <input
                    type="url"
                    id="link"
                    className="form-input"
                    placeholder="https://example.com"
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    pattern="https?://.+"
                  />
                </div>

                {/* Quantity */}
                <div className="form-group">
                  <label className="form-label" htmlFor="qty">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="qty"
                    className="form-input"
                    placeholder="Enter Quantity"
                    onChange={(e) =>
                      e.target.value
                        ? setQty(parseInt(e.target.value))
                        : setQty(0)
                    }
                    min={
                      services?.find((s) => s.id === selectedService)
                        ?.min_order || 0
                    }
                    max={
                      services?.find((s) => s.id === selectedService)
                        ?.max_order || 0
                    }
                    value={qty || ''}
                  />
                  <small className="text-xs text-gray-500 mt-1">
                    Min:{' '}
                    {services?.find((s) => s.id === selectedService)
                      ?.min_order || 0}{' '}
                    - Max:{' '}
                    {services?.find((s) => s.id === selectedService)
                      ?.max_order || 0}
                  </small>
                </div>

                {/* Price */}
                <div className="form-group">
                  <label className="form-label" htmlFor="price">
                    Charge (per 1000 = {user?.currency === 'USD' ? '$' : '৳'}
                    {price.toFixed(2)})
                  </label>
                  <input
                    type="text"
                    id="price"
                    readOnly
                    disabled
                    className="form-input disabled:opacity-70 font-semibold"
                    value={
                      user?.currency === 'USD'
                        ? `$ ${totalPrice.toFixed(4)}`
                        : `৳ ${totalPrice.toFixed(4)}`
                    }
                    placeholder="Charge"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting || !selectedService || !link || qty < 1
                  }
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 w-4 h-4" />
                      Creating Order...
                    </>
                  ) : (
                    'Create Order'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Service Details */}
          <div className="space-y-6">
            <ServiceDetailsCard
              selectedService={selectedService}
              services={services}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
