// hi from jasmin
'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useGetCategories } from '@/hooks/categories-fetch';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import { APP_NAME } from '@/lib/constants';
import {
  dashboardApi,
  useGetUserStatsQuery,
} from '@/lib/services/dashboardApi';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  FaBuffer,
  FaCheckCircle,
  FaClock,
  FaDiscord,
  FaFacebook,
  FaFilter,
  FaGlobe,
  FaInfoCircle,
  FaInstagram,
  FaLayerGroup,
  FaLink,
  FaLinkedin,
  FaRedo,
  FaSearch,
  FaShieldAlt,
  FaShoppingCart,
  FaSpotify,
  FaTachometerAlt,
  FaTelegram,
  FaTiktok,
  FaTimes,
  FaTwitter,
  FaYoutube
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

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

const ServiceDetailsCard = ({
  selectedService,
  services,
  isLoading = false,
}: {
  selectedService: string;
  services: any[];
  isLoading?: boolean;
}) => {
  const selected = services?.find((s) => s.id === parseInt(selectedService) || s.id === selectedService);

  if (isLoading) {
    return (
      <div className="card card-padding">
        <div className="text-center py-12 flex flex-col items-center">
          <GradientSpinner size="w-12 h-12" className="mb-4" />
          <div className="text-lg font-medium text-gray-700">
            Loading service details...
          </div>
        </div>
      </div>
    );
  }

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

          {/* Refill Status */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Refill</h4>
            <div className="flex items-center text-gray-600">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                selected.refill ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <FaRedo className={`text-sm ${
                  selected.refill ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <span className={`text-sm font-medium ${
                selected.refill ? 'text-green-600' : 'text-red-600'
              }`}>
                {selected.refill ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>

          {/* Cancel Status */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Cancel</h4>
            <div className="flex items-center text-gray-600">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                selected.cancel ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <FaTimes className={`text-sm ${
                  selected.cancel ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <span className={`text-sm font-medium ${
                selected.cancel ? 'text-green-600' : 'text-red-600'
              }`}>
                {selected.cancel ? 'Available' : 'Not Available'}
              </span>
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

function NewOrder() {
  const user = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { data: userStatsResponse, refetch: refetchUserStats } =
    useGetUserStatsQuery();
  const serviceIdFromUrl =
    searchParams.get('sId') || searchParams.get('serviceId');
  const categoryIdFromUrl = searchParams.get('categoryId');
  const platformFromUrl = searchParams.get('platform');
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

  const [favoriteCategories, setFavoriteCategories] = useState<any[]>([]);
  const [combinedCategories, setCombinedCategories] = useState<any[]>([]);
  const [categoriesWithServices, setCategoriesWithServices] = useState<any[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isServiceDetailsLoading, setIsServiceDetailsLoading] = useState(false);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selected = services?.find((s) => s.id === parseInt(selectedService) || s.id === selectedService);
  const perQty = Number(selected?.perqty) || 1;
  const price = Number(selected?.rate) || 0;
  // Get currency rate
  const { rate: currencyRate, currency } = useCurrency();

  let totalPrice = 0;
  if (user?.currency === 'USD') {
    totalPrice = (price * qty) / 1000;
  } else {
    totalPrice = ((price * qty) / 1000) * (currencyRate || 121.52);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
          let combined = [
            ...validFavorites.map((favCat) => ({
              ...favCat,
              isFavorite: true,
              category_name: `⭐ ${favCat.name}`,
            })),

            ...category.data.map((regCat: any) => ({
              ...regCat,
              isFavorite: false,
            })),
          ];

          if (platformFromUrl && platformFromUrl !== 'Everything') {
            combined = combined
              .filter((cat) =>
                platformFromUrl === 'Others'
                  ? ![
                      'Instagram',
                      'Facebook',
                      'YouTube',
                      'TikTok',
                      'Twitter',
                      'Telegram',
                      'Spotify',
                      'LinkedIn',
                      'Discord',
                      'Website',
                    ].some((keyword) =>
                      cat.category_name
                        .toLowerCase()
                        .includes(keyword.toLowerCase())
                    )
                  : cat.category_name
                      .toLowerCase()
                      .includes(platformFromUrl.toLowerCase())
              )
              .sort((a, b) => {
                const aMatch = a.category_name
                  .toLowerCase()
                  .includes(platformFromUrl.toLowerCase())
                  ? -1
                  : 1;
                const bMatch = b.category_name
                  .toLowerCase()
                  .includes(platformFromUrl.toLowerCase())
                  ? -1
                  : 1;
                return aMatch - bMatch;
              });
          }

          setCombinedCategories(combined);
          setCategoriesWithServices(combined);

          if (!selectedCategory && combined.length > 0) {
            setSelectedCategory(combined[0].id);
          }
        }
      });
    } else if (category?.data) {
      let regularCategories = category.data.map((regCat: any) => ({
        ...regCat,
        isFavorite: false,
      }));

      if (platformFromUrl && platformFromUrl !== 'Everything') {
        regularCategories = regularCategories
          .filter((cat) =>
            platformFromUrl === 'Others'
              ? ![
                  'Instagram',
                  'Facebook',
                  'YouTube',
                  'TikTok',
                  'Twitter',
                  'Telegram',
                  'Spotify',
                  'LinkedIn',
                  'Discord',
                  'Website',
                ].some((keyword) =>
                  cat.category_name
                    .toLowerCase()
                    .includes(keyword.toLowerCase())
                )
              : cat.category_name
                  .toLowerCase()
                  .includes(platformFromUrl.toLowerCase())
          )
          .sort((a, b) => {
            const aMatch = a.category_name
              .toLowerCase()
              .includes(platformFromUrl.toLowerCase())
              ? -1
              : 1;
            const bMatch = b.category_name
              .toLowerCase()
              .includes(platformFromUrl.toLowerCase())
              ? -1
              : 1;
            return aMatch - bMatch;
          });
      }

      setCombinedCategories(regularCategories);
      setCategoriesWithServices(regularCategories);

      if (!selectedCategory && regularCategories.length > 0) {
        setSelectedCategory(regularCategories[0].id);
      }
    }
  }, [category, favoriteCategories, platformFromUrl, selectedCategory]);

  useEffect(() => {
    if (!selectedCategory) return;

    console.log('Selected category changed:', selectedCategory);
    setIsServiceDetailsLoading(true);
    setServices([]);
    setSelectedService('');

    // Always fetch services by categoryId (not favorite logic)
    axios
      .post('/api/admin/services/catId-by-services', {
        categoryId: parseInt(selectedCategory),
      })
      .then((res) => {
        const fetchedServices = res?.data?.data || [];
        console.log('Fetched services for category', selectedCategory, ':', fetchedServices);
        setServices(fetchedServices);
        if (fetchedServices?.length > 0) {
          setSelectedService(fetchedServices[0]?.id);
          console.log('Auto-selected service:', fetchedServices[0]?.id);
        } else {
          setSelectedService('');
          console.log('No services found for category:', selectedCategory);
        }
      })
      .catch((error) => {
        console.error('Error fetching services:', error);
        showToast('Error fetching services', 'error');
        setServices([]);
        setSelectedService('');
      })
      .finally(() => {
        setIsServiceDetailsLoading(false);
      });
  }, [selectedCategory]);



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

  useEffect(() => {
    if (serviceIdFromUrl && !selectedService && category?.data) {
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
        fetchServiceById(serviceIdFromUrl);
      }
    }
  }, [serviceIdFromUrl, category]);

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

  async function getServices() {
    try {
      const res = await axiosInstance.get(
        `/api/user/services/neworderservice?search=${search}`
      );
      let fetchedServices = res?.data?.data || [];

      if (platformFromUrl && platformFromUrl !== 'Everything') {
        fetchedServices = fetchedServices.filter((service) => {
          const serviceCategory = combinedCategories.find(
            (cat) => cat.id === service.categoryId
          );
          if (!serviceCategory) return false;
          if (platformFromUrl === 'Others') {
            return ![
              'Instagram',
              'Facebook',
              'YouTube',
              'TikTok',
              'Twitter',
              'Telegram',
              'Spotify',
              'LinkedIn',
              'Discord',
              'Website',
            ].some((keyword) =>
              serviceCategory.category_name
                .toLowerCase()
                .includes(keyword.toLowerCase())
            );
          }
          return serviceCategory.category_name
            .toLowerCase()
            .includes(platformFromUrl.toLowerCase());
        });
      }

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
  }, [search, platformFromUrl]);

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      const currentUserResponse = await axiosInstance.get('/api/user/current');
      const currentUser = currentUserResponse.data;

      const usdPrice = (price * qty) / 1000;
      const bdtPrice = usdPrice * (currencyRate || 121.52);

      // Debug log to verify price calculation
      console.log('Price Calculation Debug:', {
        serviceRate: price,
        quantity: qty,
        usdPrice: usdPrice,
        bdtPrice: bdtPrice,
        finalTotalPrice: finalTotalPrice,
        userCurrency: currentUser?.currency,
        sessionUserCurrency: user?.currency,
      });

      const orderPayload = [
        {
          link,
          qty,
          price: finalTotalPrice,
          usdPrice: usdPrice,
          bdtPrice: bdtPrice,
          currency: currentUser?.currency,
          serviceId: parseInt(selectedService),
          categoryId: parseInt(selectedCategory),
          userId: user?.id,
          avg_time: selected?.avg_time || '',
        },
      ];

      const response = await axiosInstance.post(
        '/api/user/create-orders',
        orderPayload
      );

      if (response.data.success) {
        showToast('Order created successfully!', 'success');

        dispatch(dashboardApi.util.invalidateTags(['UserStats']));

        refetchUserStats();

        // Reset form
        setLink('');
        setQty(0);
        setSelectedService('');
        setSelectedCategory('');
        setSearch('');
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

  return (
    <div className="page-container">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="page-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="w-full space-y-4 lg:space-y-6">
            <div className="card" style={{ padding: '8px' }}>
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg">
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

            {platformFromUrl && platformFromUrl !== 'Everything' && (
              <div className="flex items-center space-x-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                <FaFilter className="h-4 w-4 flex-shrink-0 text-purple-600" />
                <div>
                  <span>
                    Showing{' '}
                    <strong>
                      {platformFromUrl.replace('Traffic', ' Traffic')} services
                    </strong>{' '}
                    only
                  </span>
                  <span className="ml-2 text-purple-500">
                    ({categoriesWithServices.length} categor
                    {categoriesWithServices.length === 1 ? 'y' : 'ies'}{' '}
                    available)
                  </span>
                </div>
              </div>
            )}

            <div className="card card-padding w-full max-w-full">
              {isFormLoading ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <GradientSpinner size="w-16 h-16" className="mb-6" />
                  <div className="text-xl font-semibold text-gray-700 mb-2">
                    Loading Order Form...
                  </div>
                  <div className="text-sm text-gray-500">
                    Please wait while we prepare everything for you
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="space-y-4 w-full max-w-full"
                >
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
                        className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
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
                                handleSearchSelect(
                                  service.id,
                                  service.categoryId
                                )
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
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
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

                      {categoriesWithServices.some((cat) => cat.isFavorite) && (
                        <optgroup label="Favorites">
                          {categoriesWithServices
                            .filter((cat) => cat.isFavorite)
                            .map((favCat) => (
                              <option
                                key={`fav-${favCat.id}`}
                                value={String(favCat.id)}
                              >
                                {favCat.category_name}
                              </option>
                            ))}
                        </optgroup>
                      )}

                      <optgroup label="All Categories">
                        {categoriesWithServices
                          .filter((cat) => !cat.isFavorite)
                          .map((cat: any) => (
                            <option key={`reg-${cat.id}`} value={String(cat.id)}>
                              {cat.category_name}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="services">
                      Services
                    </label>
                    <select
                      id="services"
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      value={selectedService}
                      onChange={(e) => {
                        setSelectedService(e.target.value);
                        setQty(0);
                      }}
                      disabled={!selectedCategory || services.length === 0}
                      required
                    >
                      <option value="" disabled>
                        {services.length === 0 ? 'No services available' : 'Select a service'}
                      </option>
                      {services?.map((service: any) => (
                        <option key={service.id} value={String(service.id)}>
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
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
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
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Enter Quantity"
                      onChange={(e) =>
                        e.target.value
                          ? setQty(parseInt(e.target.value))
                          : setQty(0)
                      }
                      min={
                        services?.find((s) => s.id === parseInt(selectedService) || s.id === selectedService)
                          ?.min_order || 0
                      }
                      max={
                        services?.find((s) => s.id === parseInt(selectedService) || s.id === selectedService)
                          ?.max_order || 0
                      }
                      value={qty || ''}
                    />
                    <small className="text-xs text-gray-500 mt-1">
                      Min:{' '}
                      {services?.find((s) => s.id === parseInt(selectedService) || s.id === selectedService)
                        ?.min_order || 0}{' '}
                      - Max:{' '}
                      {services?.find((s) => s.id === parseInt(selectedService) || s.id === selectedService)
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
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={
                        user?.currency === 'USD'
                          ? `$ ${totalPrice.toFixed(4)}`
                          : `৳ ${totalPrice.toFixed(4)}`
                      }
                      placeholder="Charge"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting || !selectedService || !link || qty < 1
                    }
                    className="btn btn-primary w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <GradientSpinner size="w-4 h-4" className="mr-2" />
                        Creating Order...
                      </>
                    ) : (
                      'Create Order'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <ServiceDetailsCard
              selectedService={selectedService}
              services={services}
              isLoading={isServiceDetailsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = `New Order — ${APP_NAME}`;
  }, []);

  const platforms = [
    {
      name: 'Everything',
      icon: <FaBuffer size={24} />,
      color: 'bg-gradient-to-r from-purple-700 to-purple-500',
      categoryKeyword: null,
    },
    {
      name: 'Instagram',
      icon: <FaInstagram size={24} />,
      color: 'bg-gradient-to-r from-pink-600 to-pink-400',
      categoryKeyword: 'Instagram',
    },
    {
      name: 'Facebook',
      icon: <FaFacebook size={24} />,
      color: 'bg-gradient-to-r from-blue-600 to-blue-400',
      categoryKeyword: 'Facebook',
    },
    {
      name: 'YouTube',
      icon: <FaYoutube size={24} />,
      color: 'bg-gradient-to-r from-red-600 to-red-400',
      categoryKeyword: 'YouTube',
    },
    {
      name: 'TikTok',
      icon: <FaTiktok size={24} />,
      color: 'bg-gradient-to-r from-gray-800 to-gray-600',
      categoryKeyword: 'TikTok',
    },
    {
      name: 'Twitter',
      icon: <FaTwitter size={24} />,
      color: 'bg-gradient-to-r from-blue-400 to-blue-300',
      categoryKeyword: 'Twitter',
    },
    {
      name: 'Telegram',
      icon: <FaTelegram size={24} />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-300',
      categoryKeyword: 'Telegram',
    },
    {
      name: 'Spotify',
      icon: <FaSpotify size={24} />,
      color: 'bg-gradient-to-r from-green-600 to-green-400',
      categoryKeyword: 'Spotify',
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin size={24} />,
      color: 'bg-gradient-to-r from-blue-800 to-blue-600',
      categoryKeyword: 'LinkedIn',
    },
    {
      name: 'Discord',
      icon: <FaDiscord size={24} />,
      color: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
      categoryKeyword: 'Discord',
    },
    {
      name: 'Website Traffic',
      icon: <FaGlobe size={24} />,
      color: 'bg-gradient-to-r from-purple-500 to-purple-300',
      categoryKeyword: 'Website',
    },
    {
      name: 'Others',
      icon: <FaBuffer size={24} />,
      color: 'bg-gradient-to-r from-gray-700 to-gray-500',
      categoryKeyword: 'Others',
    },
  ];

  const handleCategoryClick = (categoryKeyword: string | null) => {
    if (categoryKeyword) {
      router.push(`/new-order?platform=${categoryKeyword}`);
    } else {
      router.push('/new-order');
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-col">
        <div className="card card-padding mb-6">
          <div className="card-header mb-4">
            <div className="card-icon">
              <FaBuffer className="w-5 h-5" />
            </div>
            <h3 className="card-title">Select Platform</h3>
            <span className="ml-auto bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium hidden sm:inline-block">
              Choose Your Service
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {platforms.map((platform, index) => (
              <button
                key={platform.name}
                onClick={() => handleCategoryClick(platform.categoryKeyword)}
                className={`${platform.color} text-white p-4 rounded-xl flex flex-col items-center justify-center h-24 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-white/20`}
              >
                <div className="mb-2 p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  {platform.icon}
                </div>
                <div className="text-xs font-semibold text-center leading-tight">
                  {platform.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <NewOrder />
      </div>
    </div>
  );
}
