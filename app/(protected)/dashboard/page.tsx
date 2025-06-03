"use client";

import ModernOrderForm from '@/components/modern-order-form';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGetUserStatsQuery } from '@/lib/services/dashboardApi';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FaBuffer,
  FaMoneyBillWave,
  FaShoppingBag,
  FaUserCircle,
  FaWallet,
  FaTicketAlt,
  FaHistory,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaEye,
  FaCalendarAlt
} from "react-icons/fa";

export default function DashboardPage() {
  const user = useCurrentUser();
  const { currency, rate: currencyRate } = useCurrency();
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<'newOrder' | 'massOrder' | 'customOrder' | 'subscriptionOrder' | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch user stats from API
  const { data: userStatsResponse, error, isLoading } = useGetUserStatsQuery();
  const userStats = userStatsResponse?.data;

  // Get recent orders from user stats
  const userOrders = userStats?.recentOrders || [];

  // User data from API or fallback to 0
  const balance = userStats?.balance || 0;
  const totalSpend = userStats?.totalSpent || 0;
  const totalOrders = userStats?.totalOrders || 0;
  const pendingOrders = userStats?.ordersByStatus?.pending || 0;
  const completedOrders = userStats?.ordersByStatus?.completed || 0;
  const processingOrders = userStats?.ordersByStatus?.processing || 0;
  const cancelledOrders = userStats?.ordersByStatus?.cancelled || 0;

  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount = currency === 'BDT' ? amount : amount / (currencyRate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };

  // Toggle form display with animation
  const toggleForm = (form: 'newOrder' | 'massOrder' | 'customOrder' | 'subscriptionOrder') => {
    setActiveForm(activeForm === form ? null : form);
  };

  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId) {
      router.push(`/dashboard/user/new-order?categoryId=${categoryId}`);
    } else {
      router.push('/dashboard/user/new-order');
    }
  };

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode on component mount if needed
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Note: Social media platforms section has been moved to new-order page

  // Featured service
  const featuredService = {
    id: "14678",
    name: "Facebook Live Stream Viewers | 15 Minutes",
    price: "$0.5498 per 1000"
  };

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400'}`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* User Info and Stats Cards */}
      <div className="space-y-4 mb-6 mt-6">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User ID Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="relative p-5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full h-12 w-12 flex items-center justify-center text-white shadow-lg">
                  <FaUserCircle size={20} className="drop-shadow-md" />
                </div>
                <div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>User ID</div>
                  <div className="font-medium text-lg">#{user?.id || "N/A"}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Username Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="relative p-5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-full h-12 w-12 flex items-center justify-center text-white shadow-lg">
                  <FaUserCircle size={20} className="drop-shadow-md" />
                </div>
                <div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Username</div>
                  <div className="font-medium text-lg">{user?.username || user?.email?.split('@')[0] || "User"}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Name Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="relative p-5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full h-12 w-12 flex items-center justify-center text-white shadow-lg">
                  <FaUserCircle size={20} className="drop-shadow-md" />
                </div>
                <div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</div>
                  <div className="font-medium text-lg">{user?.name || "User"}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="relative p-5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-full h-14 w-14 flex items-center justify-center text-white shadow-lg">
                  <FaWallet size={24} />
                </div>
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Balance</div>
                  <div className="font-medium text-xl">{formatCurrency(balance)}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Total Orders Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="relative p-5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-teal-500 to-teal-400 rounded-full h-14 w-14 flex items-center justify-center text-white shadow-lg">
                  <FaShoppingBag size={24} />
                </div>
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Orders</div>
                  <div className="font-medium text-xl">{totalOrders}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Total Spend Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="relative p-5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-full h-14 w-14 flex items-center justify-center text-white shadow-lg">
                  <FaMoneyBillWave size={24} />
                </div>
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Spend</div>
                  <div className="font-medium text-xl">{formatCurrency(totalSpend)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Social media platforms section moved to new-order page */}

      {/* Order Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap gap-3 mb-5">
        <Button 
          onClick={() => toggleForm('newOrder')} 
          className={`px-5 py-2.5 rounded-lg ${activeForm === 'newOrder' 
            ? 'bg-gradient-to-r from-purple-700 to-purple-500' 
            : 'bg-gradient-to-r from-purple-600 to-purple-400'} 
            text-white flex items-center shadow-md hover:shadow-lg transition-all duration-300`}
        >
          <FaShoppingBag className="mr-2" /> New Order
        </Button>
        <Button 
          onClick={() => toggleForm('massOrder')} 
          className={`px-5 py-2.5 rounded-lg ${activeForm === 'massOrder' 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
            : 'bg-gradient-to-r from-gray-700 to-gray-600'} 
            text-white flex items-center shadow-md hover:shadow-lg transition-all duration-300`}
        >
          <FaBuffer className="mr-2" /> Mass Order
        </Button>
        <Button 
          onClick={() => toggleForm('customOrder')} 
          className={`px-5 py-2.5 rounded-lg ${activeForm === 'customOrder' 
            ? 'bg-gradient-to-r from-blue-700 to-blue-500' 
            : 'bg-gradient-to-r from-blue-600 to-blue-400'} 
            text-white flex items-center shadow-md hover:shadow-lg transition-all duration-300`}
        >
          <FaWallet className="mr-2" /> Custom Order
        </Button>
        <Button 
          onClick={() => toggleForm('subscriptionOrder')} 
          className={`px-5 py-2.5 rounded-lg ${activeForm === 'subscriptionOrder' 
            ? 'bg-gradient-to-r from-green-700 to-green-500' 
            : 'bg-gradient-to-r from-green-600 to-green-400'} 
            text-white flex items-center shadow-md hover:shadow-lg transition-all duration-300`}
        >
          <FaMoneyBillWave className="mr-2" /> Subscription
        </Button>
      </motion.div>

      {/* Active Form Display */}
      <AnimatePresence>
        {activeForm === 'newOrder' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-2 overflow-hidden"
          >
            <ModernOrderForm type="new" darkMode={darkMode} />
          </motion.div>
        )}

        {activeForm === 'massOrder' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-2 overflow-hidden"
          >
            <ModernOrderForm type="mass" darkMode={darkMode} />
          </motion.div>
        )}
        
        {activeForm === 'customOrder' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-2 overflow-hidden"
          >
            <ModernOrderForm type="custom" darkMode={darkMode} />
          </motion.div>
        )}
        
        {activeForm === 'subscriptionOrder' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-2 overflow-hidden"
          >
            <ModernOrderForm type="subscription" darkMode={darkMode} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Statistics Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 mb-6"
      >
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full h-10 w-10 flex items-center justify-center text-white shadow-lg mr-3">
            <FaChartLine size={20} />
          </div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Statistics Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Success Rate */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`overflow-hidden rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
          >
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</div>
                  <div className="font-bold text-2xl text-green-500">98.5%</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last 30 days</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-full h-12 w-12 flex items-center justify-center text-white shadow-lg">
                  <FaCheckCircle size={20} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pending Orders */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`overflow-hidden rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
          >
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending Orders</div>
                  <div className="font-bold text-2xl text-yellow-500">3</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>In progress</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full h-12 w-12 flex items-center justify-center text-white shadow-lg">
                  <FaClock size={20} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Failed Orders */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`overflow-hidden rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
          >
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Failed Orders</div>
                  <div className="font-bold text-2xl text-red-500">1</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>This month</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-400 rounded-full h-12 w-12 flex items-center justify-center text-white shadow-lg">
                  <FaTimesCircle size={20} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Average Response Time */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`overflow-hidden rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
          >
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 rounded-bl-full opacity-20"></div>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Response</div>
                  <div className="font-bold text-2xl text-blue-500">2.3h</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Support tickets</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-full h-12 w-12 flex items-center justify-center text-white shadow-lg">
                  <FaExclamationTriangle size={20} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Ticket History Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-full h-10 w-10 flex items-center justify-center text-white shadow-lg mr-3">
              <FaTicketAlt size={20} />
            </div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Support Tickets</h2>
          </div>
          <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}>
            <FaEye className="inline mr-2" /> View All
          </button>
        </div>
        
        <div className={`rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border overflow-hidden`}>
          <div className="p-6">
            {/* No Ticket System Available */}
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FaTicketAlt className="mx-auto mb-4" size={48} />
              <div className="text-lg font-medium mb-2">No information was found for you.</div>
              <div className="text-sm">Ticket system is not implemented yet.</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Order History Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full h-10 w-10 flex items-center justify-center text-white shadow-lg mr-3">
              <FaHistory size={20} />
            </div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Order History</h2>
          </div>
          <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}>
            <FaEye className="inline mr-2" /> View All Orders
          </button>
        </div>
        
        <div className={`rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border overflow-hidden`}>
          <div className="p-6">
            {/* Order Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border-l-4 border-green-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-600 font-semibold">Completed</div>
                    <div className="text-2xl font-bold text-green-700">{completedOrders}</div>
                  </div>
                  <FaCheckCircle className="text-green-500" size={20} />
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-600 font-semibold">Processing</div>
                    <div className="text-2xl font-bold text-blue-700">{processingOrders}</div>
                  </div>
                  <FaClock className="text-blue-500" size={20} />
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'} border-l-4 border-yellow-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-yellow-600 font-semibold">Pending</div>
                    <div className="text-2xl font-bold text-yellow-700">{pendingOrders}</div>
                  </div>
                  <FaExclamationTriangle className="text-yellow-500" size={20} />
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-red-50'} border-l-4 border-red-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-red-600 font-semibold">Cancelled</div>
                    <div className="text-2xl font-bold text-red-700">{cancelledOrders}</div>
                  </div>
                  <FaTimesCircle className="text-red-500" size={20} />
                </div>
              </div>
            </div>
            
            {/* Recent Orders */}
            <div className="space-y-3">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Recent Orders</h3>
              
              {userOrders.length > 0 ? (
                userOrders.map((order: any) => {
                  const getStatusColor = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'completed': return 'bg-green-500';
                      case 'processing': return 'bg-blue-500';
                      case 'pending': return 'bg-yellow-500';
                      case 'cancelled': return 'bg-red-500';
                      default: return 'bg-gray-500';
                    }
                  };
                  
                  const getStatusBadge = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'completed': return 'bg-green-100 text-green-800';
                      case 'processing': return 'bg-blue-100 text-blue-800';
                      case 'pending': return 'bg-yellow-100 text-yellow-800';
                      case 'cancelled': return 'bg-red-100 text-red-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };
                  
                  return (
                    <div key={order.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors duration-200 cursor-pointer`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`${getStatusColor(order.status)} rounded-full h-3 w-3`}></div>
                          <div>
                             <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                               {order.service?.name || 'Service'}
                             </div>
                             <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                               Order #{order.id.slice(-8)} • {formatCurrency(order.bdtPrice || 0)}
                             </div>
                           </div>
                        </div>
                        <div className="text-right">
                          <span className={`${getStatusBadge(order.status)} px-2 py-1 rounded-full text-xs font-medium capitalize`}>
                            {order.status}
                          </span>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            <FaCalendarAlt className="inline mr-1" /> 
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FaShoppingBag className="mx-auto mb-4" size={48} />
                  <div className="text-lg font-medium mb-2">No information was found for you.</div>
                  <div className="text-sm">You haven't placed any orders yet.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
