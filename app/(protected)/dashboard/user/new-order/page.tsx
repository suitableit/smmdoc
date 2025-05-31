"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FaBuffer,
  FaDiscord,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaPlus,
  FaSpotify,
  FaTelegram,
  FaTiktok,
  FaTwitter,
  FaYoutube
} from "react-icons/fa";
import NewOrderClient from './client';

export default function NewOrderPage() {
  const router = useRouter();

  // Social media platforms with updated icons
  const platforms = [
    { name: 'Everything', icon: <FaBuffer size={24} />, color: 'bg-gradient-to-r from-purple-700 to-purple-500', categoryId: null },
    { name: 'Instagram', icon: <FaInstagram size={24} />, color: 'bg-gradient-to-r from-pink-600 to-pink-400', categoryId: '2' },
    { name: 'Facebook', icon: <FaFacebook size={24} />, color: 'bg-gradient-to-r from-blue-600 to-blue-400', categoryId: '1' },
    { name: 'YouTube', icon: <FaYoutube size={24} />, color: 'bg-gradient-to-r from-red-600 to-red-400', categoryId: '3' },
    { name: 'Twitter', icon: <FaTwitter size={24} />, color: 'bg-gradient-to-r from-blue-400 to-blue-300', categoryId: '4' },
    { name: 'Spotify', icon: <FaSpotify size={24} />, color: 'bg-gradient-to-r from-green-600 to-green-400', categoryId: '9' },
    { name: 'TikTok', icon: <FaTiktok size={24} />, color: 'bg-gradient-to-r from-gray-800 to-gray-600', categoryId: '5' },
    { name: 'Telegram', icon: <FaTelegram size={24} />, color: 'bg-gradient-to-r from-blue-500 to-blue-300', categoryId: '10' },
    { name: 'LinkedIn', icon: <FaLinkedin size={24} />, color: 'bg-gradient-to-r from-blue-800 to-blue-600', categoryId: '6' },
    { name: 'Discord', icon: <FaDiscord size={24} />, color: 'bg-gradient-to-r from-indigo-600 to-indigo-400', categoryId: '11' },
    { name: 'Website Traffic', icon: <FaGlobe size={24} />, color: 'bg-gradient-to-r from-purple-500 to-purple-300', categoryId: '7' },
    { name: 'Others', icon: <FaPlus size={24} />, color: 'bg-gradient-to-r from-gray-700 to-gray-500', categoryId: '8' }
  ];

  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId) {
      router.push(`/dashboard/user/new-order?categoryId=${categoryId}`);
    } else {
      router.push('/dashboard/user/new-order');
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-col py-6">
        <h1 className="text-2xl font-bold mb-6">New Order</h1>
        
        {/* Social Media Platforms Grid */}
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
              onClick={() => handleCategoryClick(platform.categoryId)}
              className={`${platform.color} text-white p-3 rounded-lg flex flex-col items-center justify-center h-20 shadow-md hover:shadow-lg transition-all duration-300`}
            >
              <div className="mb-1">{platform.icon}</div>
              <div className="text-xs font-medium">{platform.name}</div>
            </motion.button>
          ))}
        </motion.div>
        
        <NewOrderClient />
      </div>
    </div>
  );
}
    