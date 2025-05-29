"use client";

import ModernOrderForm from '@/components/modern-order-form';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import useCurrency from '@/hooks/useCurrency';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FaBuffer,
  FaDiscord,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaMoneyBillWave,
  FaPlus,
  FaSearch,
  FaShoppingBag,
  FaSpotify,
  FaStar,
  FaTelegram,
  FaTiktok,
  FaTwitter,
  FaUser,
  FaWallet,
  FaYoutube
} from "react-icons/fa";

export default function DashboardPage() {
  const user = useCurrentUser();
  const { currency } = useCurrency();
  const [activeForm, setActiveForm] = useState<'newOrder' | 'massOrder' | 'customOrder' | 'subscriptionOrder' | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle form display with animation
  const toggleForm = (form: 'newOrder' | 'massOrder' | 'customOrder' | 'subscriptionOrder') => {
    setActiveForm(activeForm === form ? null : form);
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

  // Mock data for demonstration
  const balance = 0;
  const totalSpend = 0;
  const totalOrders = 0;

  // Social media platforms with updated icons
  const platforms = [
    { name: 'Everything', icon: <FaBuffer size={24} />, color: 'bg-gradient-to-r from-purple-700 to-purple-500' },
    { name: 'Instagram', icon: <FaInstagram size={24} />, color: 'bg-gradient-to-r from-pink-600 to-pink-400' },
    { name: 'Facebook', icon: <FaFacebook size={24} />, color: 'bg-gradient-to-r from-blue-600 to-blue-400' },
    { name: 'YouTube', icon: <FaYoutube size={24} />, color: 'bg-gradient-to-r from-red-600 to-red-400' },
    { name: 'Twitter', icon: <FaTwitter size={24} />, color: 'bg-gradient-to-r from-blue-400 to-blue-300' },
    { name: 'Spotify', icon: <FaSpotify size={24} />, color: 'bg-gradient-to-r from-green-600 to-green-400' },
    { name: 'TikTok', icon: <FaTiktok size={24} />, color: 'bg-gradient-to-r from-gray-800 to-gray-600' },
    { name: 'Telegram', icon: <FaTelegram size={24} />, color: 'bg-gradient-to-r from-blue-500 to-blue-300' },
    { name: 'LinkedIn', icon: <FaLinkedin size={24} />, color: 'bg-gradient-to-r from-blue-800 to-blue-600' },
    { name: 'Discord', icon: <FaDiscord size={24} />, color: 'bg-gradient-to-r from-indigo-600 to-indigo-400' },
    { name: 'Website Traffic', icon: <FaGlobe size={24} />, color: 'bg-gradient-to-r from-purple-500 to-purple-300' },
    { name: 'Others', icon: <FaPlus size={24} />, color: 'bg-gradient-to-r from-gray-700 to-gray-500' }
  ];

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

      {/* Services Categories */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
        {platforms.map((platform, index) => (
          <motion.button 
            key={platform.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`${platform.color} text-white p-3 rounded-lg flex flex-col items-center justify-center h-20 shadow-md`}
          >
            <div className="mb-1">{platform.icon}</div>
            <div className="text-xs font-medium">{platform.name}</div>
          </motion.button>
        ))}
      </motion.div>

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

      {/* Featured Service - Only show if no form is active */}
      {!activeForm && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-5"
        >
          <div className="bg-gradient-to-r from-purple-600 to-purple-400 text-white p-4 rounded-t-lg shadow-md">
            <div className="flex justify-between items-center">
              <span className="font-medium flex items-center">
                <FaStar className="text-yellow-300 mr-2" /> 
                {featuredService.id}
              </span>
              <span>{featuredService.name} - {featuredService.price}</span>
            </div>
          </div>

          <div className={`p-6 rounded-b-lg shadow-md space-y-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div>
              <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Example Link</h3>
              <div className="flex items-center bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
                <div className="bg-gradient-to-r from-red-500 to-red-400 rounded-full h-10 w-10 flex items-center justify-center text-white mr-3 shadow-md">
                  🔗
                </div>
                <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>-</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Time</h3>
                <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-full h-10 w-10 flex items-center justify-center text-white mr-3 shadow-md">
                    ⏱️
                  </div>
                  <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>-</span>
                </div>
              </div>
              <div>
                <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Speed</h3>
                <div className="flex items-center bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-full h-10 w-10 flex items-center justify-center text-white mr-3 shadow-md">
                    ⚡
                  </div>
                  <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>-</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Guarantee</h3>
                <div className="flex items-center bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-full h-10 w-10 flex items-center justify-center text-white mr-3 shadow-md">
                    ✓
                  </div>
                  <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>-</span>
                </div>
              </div>
              <div>
                <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Average Time</h3>
                <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-full h-10 w-10 flex items-center justify-center text-white mr-3 shadow-md">
                    ⏰
                  </div>
                  <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>Not enough data</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>More Details</h3>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200`}>
                <p className="mb-1">Viewing Time: 15 minutes</p>
                <p className="mb-1">Instant / 0-5 Mins</p>
                <p className="mb-1">Non Drop</p>
                <p className="mb-1">Max Speed</p>
                <p className="mb-1">Example Link: Facebook Live Video Link (All Live Video Link Acceptable)</p>
                <p className={`mt-3 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  NOTE:<br />
                  * The system will increase by 90%-120% of the amount ordered.<br />
                  * If you don't run live video link, our system will automatically canceled your order.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search Bar - Moved below */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="relative mt-8 mb-5">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaSearch className="text-gray-500" />
        </div>
        <input 
          type="search" 
          className={`block w-full pl-12 pr-4 py-3 border ${darkMode 
            ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400' 
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} 
            rounded-lg leading-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm`} 
          placeholder="Search" 
        />
      </motion.div>

      {/* Footer - Moved below */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-4 text-center text-sm text-gray-500"
      >
        <a href="#" className="hover:underline">Contact us</a> | <a href="#" className="hover:underline">FAQ</a>
      </motion.div>
    </div>
  );
}
