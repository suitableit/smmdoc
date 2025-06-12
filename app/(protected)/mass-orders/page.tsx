'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import { APP_NAME } from '@/lib/constants';
import {
  dashboardApi,
  useGetUserStatsQuery,
} from '@/lib/services/dashboardApi';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaLayerGroup,
  FaShoppingCart,
  FaSpinner,
  FaTimes,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = "w-16 h-16", className = "" }) => (
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
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
        : type === 'error'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        : type === 'info'
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorTheme?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  colorTheme = 'blue',
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`text-3xl ${
            colorTheme === 'blue'
              ? 'text-blue-500'
              : colorTheme === 'green'
              ? 'text-green-500'
              : colorTheme === 'orange'
              ? 'text-orange-500'
              : colorTheme === 'purple'
              ? 'text-purple-500'
              : 'text-gray-500'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// Instructions Panel Component
const InstructionsPanel: React.FC = () => {
  return (
    <div className="card card-padding">
      <div className="card-header">
        <div className="card-icon">
          <FaInfoCircle />
        </div>
        <h3 className="card-title">How Mass Orders works?</h3>
      </div>

      <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          You put the service ID followed by | followed by the link followed by
          | followed by quantity on each line to get the service ID of a service
          please check here:
        </p>

        <a
          href="https://smmdoc.com/services"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          https://smmdoc.com/services
          <FaExternalLinkAlt className="ml-2 text-xs" />
        </a>

        <p>
          Let's say you want to use the Mass Orders to add Instagram Followers
          to your 3 accounts: abcd, asdf, qwer
        </p>

        <p>
          From the Services List, the service ID for this service "Instagram
          Followers [100% Real - 30 Days Guarantee- NEW SERVICE" is 3740
        </p>

        <p>
          Let's say you want to add 1000 followers for each account, the output
          will be like this: ID|Link|Quantity or in this example:
        </p>

        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm border shadow-sm">
          <div className="text-green-400 space-y-1">
            <div>3740|abcd|1000</div>
            <div>3740|asdf|1000</div>
            <div>3740|qwer|1000</div>
            <div>3740|eoir|1000</div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Main Mass Orders Component
export default function MassOrder() {
  const user = useCurrentUser();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currency, rate: currencyRate } = useCurrency();
  const { data: userStatsResponse, refetch: refetchUserStats } =
    useGetUserStatsQuery({});
  const userStats = userStatsResponse?.data;

  const [activeTab, setActiveTab] = useState<'newOrder' | 'massOrder'>(
    'massOrder'
  );
  const [orders, setOrders] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Mass Orders — ${APP_NAME}`;
  }, []);

  // Simulate form initialization loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormLoading(false);
    }, 1500); // 1.5 seconds loading simulation

    return () => clearTimeout(timer);
  }, []);

  // User data from API or fallback with proper currency formatting
  const balance = userStats?.balance || 0;
  const totalSpend = userStats?.totalSpent || 0;
  const totalOrdersCount = userStats?.totalOrders || 0;

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount =
      currency === 'BDT' ? amount : amount / (currencyRate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };

  // Handle New Order navigation
  const handleNewOrderClick = () => {
    router.push('/new-order');
  };

  // Parse and validate the orders text
  const parseOrders = async (text: string) => {
    if (!text.trim()) {
      setTotalOrders(0);
      setTotalPrice(0);
      return;
    }

    const lines = text.trim().split('\n');
    let validLines = 0;
    let totalAmount = 0;

    // Process each line to validate format
    for (const line of lines) {
      const parts = line.trim().split('|');
      if (parts.length >= 3) {
        const serviceId = parts[0].trim();
        const link = parts[1].trim();
        const quantity = parseInt(parts[2].trim(), 10);

        if (!isNaN(quantity) && serviceId && link && link.startsWith('http')) {
          validLines++;
          // Use placeholder price for now - real validation will happen on submit
          const placeholderPrice = 0.5; // Placeholder price per 1000 units
          totalAmount += (placeholderPrice * quantity) / 1000;
        }
      }
    }

    setTotalOrders(validLines);
    setTotalPrice(totalAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalOrders === 0) {
      showToast(
        'No valid orders found. Please check your input format.',
        'error'
      );
      return;
    }

    // Check user balance
    const userBalance = userStats?.balance || 0;
    if (userBalance < totalPrice) {
      showToast(
        `Insufficient balance. Available: ${userBalance.toFixed(
          2
        )}, Required: ${totalPrice.toFixed(2)}`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse orders into API format
      const lines = orders.trim().split('\n');
      const orderArray = [];

      for (const line of lines) {
        const parts = line.trim().split('|');
        if (parts.length >= 3) {
          const serviceId = parts[0].trim();
          const link = parts[1].trim();
          const quantity = parseInt(parts[2].trim(), 10);

          if (
            !isNaN(quantity) &&
            serviceId &&
            link &&
            link.startsWith('http')
          ) {
            // Fetch service details to get categoryId
            try {
              const serviceResponse = await axiosInstance.get(
                `/api/user/services/serviceById?svId=${serviceId}`
              );
              const service = serviceResponse.data.data;

              if (service && service.categoryId) {
                orderArray.push({
                  serviceId: serviceId,
                  link: link,
                  qty: quantity,
                  categoryId: service.categoryId,
                });
              } else {
                showToast(`Service ${serviceId} not found or invalid`, 'error');
                continue;
              }
            } catch (error) {
              showToast(`Failed to validate service ${serviceId}`, 'error');
              continue;
            }
          }
        }
      }

      if (orderArray.length === 0) {
        showToast('No valid orders to submit.', 'error');
        return;
      }

      // Generate a unique batch ID for this Mass Orders
      const batchId = `MO-${Date.now()}-${user?.id?.slice(-4)}`;

      // Submit to Mass Orders API
      const response = await axiosInstance.post('/api/user/mass-orderss', {
        orders: orderArray,
        batchId: batchId,
      });

      if (response.data.success) {
        showToast(
          `Successfully created ${response.data.summary.ordersCreated} orders!`,
          'success'
        );

        // Invalidate user stats to refresh balance
        dispatch(dashboardApi.util.invalidateTags(['UserStats']));

        // Also manually refetch user stats for immediate update
        refetchUserStats();

        // Reset form
        setOrders('');
        setTotalOrders(0);
        setTotalPrice(0);
      } else {
        showToast(response.data.message || 'Failed to create orders', 'error');
      }
    } catch (error: any) {
      console.error('Error creating Mass Orderss:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create orders';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="card" style={{ padding: '8px' }}>
              <div className="flex space-x-2">
                <button
                  onClick={handleNewOrderClick}
                  className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-600"
                >
                  <FaShoppingCart className="mr-2 w-4 h-4" />
                  New Order
                </button>
                <button
                  onClick={() => setActiveTab('massOrder')}
                  className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                >
                  <FaLayerGroup className="mr-2 w-4 h-4" />
                  Mass Orders
                </button>
              </div>
            </div>

            {/* Order Form with Loading State */}
            {activeTab === 'massOrder' && (
              <div className="card card-padding">
                {isFormLoading ? (
                  <div className="text-center py-12 flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-4" />
                    <div className="text-lg font-medium text-gray-700">Loading mass order form...</div>
                  </div>
                ) : (
                  <>
                    <div className="card-header">
                      <div className="card-icon">
                        <FaLayerGroup />
                      </div>
                      <h3 className="card-title">Bulk Order Entry</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="form-group">
                        <label className="form-label">
                          Order Format: service_id | link | quantity
                        </label>
                        <textarea
                          placeholder="3740|https://instagram.com/username|1000"
                          value={orders}
                          onChange={(e) => {
                            setOrders(e.target.value);
                            parseOrders(e.target.value);
                          }}
                          className="form-input font-mono text-sm resize-none"
                          style={{ height: '256px' }}
                        />
                      </div>

                      {/* Order Summary */}
                      {totalOrders > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700">Valid Orders:</span>
                              <span className="font-semibold text-blue-900">
                                {totalOrders}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Estimated Cost:</span>
                              <span className="font-semibold text-blue-900">
                                {formatCurrency(totalPrice)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 mt-2">
                            * Final price will be calculated based on actual service
                            rates
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={totalOrders === 0 || isSubmitting}
                        className="btn btn-primary w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin mr-2 w-4 h-4" />
                            Processing...
                          </>
                        ) : (
                          `Submit ${totalOrders} Orders`
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <InstructionsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}