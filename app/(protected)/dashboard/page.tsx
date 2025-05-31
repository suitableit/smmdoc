"use client";

import ModernOrderForm from '@/components/modern-order-form';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import useCurrency from '@/hooks/useCurrency';
import { useGetUserStatsQuery } from '@/lib/services/dashboardApi';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FaBuffer,
  FaMoneyBillWave,
  FaShoppingBag,
  FaUser,
  FaWallet
} from "react-icons/fa";

export default function DashboardPage() {
  const user = useCurrentUser();
  const { currency } = useCurrency();
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<'newOrder' | 'massOrder' | 'customOrder' | 'subscriptionOrder' | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch user stats from API
  const { data: userStatsResponse, error, isLoading } = useGetUserStatsQuery();
  const userStats = userStatsResponse?.data;

  // User data from API or fallback to 0
  const balance = userStats?.balance || 0;
  const totalSpend = userStats?.totalSpent || 0;
  const totalOrders = userStats?.totalOrders || 0;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* User Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="relative p-5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-bl-full opacity-20"></div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-full h-14 w-14 flex items-center justify-center text-white shadow-lg">
                <FaUser size={24} />
              </div>
              <div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Username</div>
                <div className="font-medium text-xl">{user?.name || "User"}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="relative p-5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600 rounded-bl-full opacity-20"></div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-full h-14 w-14 flex items-center justify-center text-white shadow-lg">
                <FaWallet size={24} />
              </div>
              <div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Balance</div>
                <div className="font-medium text-xl">{currency === 'USD' ? '$' : '৳'}{balance}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total Spend Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="relative p-5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500 rounded-bl-full opacity-20"></div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-full h-14 w-14 flex items-center justify-center text-white shadow-lg">
                <FaMoneyBillWave size={24} />
              </div>
              <div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Spend</div>
                <div className="font-medium text-xl">{currency === 'USD' ? '$' : '৳'}{totalSpend}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className={`overflow-hidden rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="relative p-5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500 rounded-bl-full opacity-20"></div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-teal-500 to-teal-400 rounded-full h-14 w-14 flex items-center justify-center text-white shadow-lg">
                <FaShoppingBag size={24} />
              </div>
              <div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your Orders</div>
                <div className="font-medium text-xl">{totalOrders}</div>
              </div>
            </div>
          </div>
        </motion.div>
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
    </div>
  );
}
