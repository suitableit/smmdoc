"use client";

import { useRouter } from 'next/navigation';
import {
  FaBuffer,
  FaDiscord,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaSpotify,
  FaTelegram,
  FaTiktok,
  FaTwitter,
  FaYoutube
} from "react-icons/fa";
import NewOrderClient from './client';

export default function NewOrderPage() {
  const router = useRouter();

  // Social media platforms ordered by popularity (most popular first)
  const platforms = [
    { name: 'Everything', icon: <FaBuffer size={24} />, color: 'bg-gradient-to-r from-purple-700 to-purple-500', categoryKeyword: null },
    { name: 'Instagram', icon: <FaInstagram size={24} />, color: 'bg-gradient-to-r from-pink-600 to-pink-400', categoryKeyword: 'Instagram' },
    { name: 'Facebook', icon: <FaFacebook size={24} />, color: 'bg-gradient-to-r from-blue-600 to-blue-400', categoryKeyword: 'Facebook' },
    { name: 'YouTube', icon: <FaYoutube size={24} />, color: 'bg-gradient-to-r from-red-600 to-red-400', categoryKeyword: 'YouTube' },
    { name: 'TikTok', icon: <FaTiktok size={24} />, color: 'bg-gradient-to-r from-gray-800 to-gray-600', categoryKeyword: 'TikTok' },
    { name: 'Twitter', icon: <FaTwitter size={24} />, color: 'bg-gradient-to-r from-blue-400 to-blue-300', categoryKeyword: 'Twitter' },
    { name: 'Telegram', icon: <FaTelegram size={24} />, color: 'bg-gradient-to-r from-blue-500 to-blue-300', categoryKeyword: 'Telegram' },
    { name: 'Spotify', icon: <FaSpotify size={24} />, color: 'bg-gradient-to-r from-green-600 to-green-400', categoryKeyword: 'Spotify' },
    { name: 'LinkedIn', icon: <FaLinkedin size={24} />, color: 'bg-gradient-to-r from-blue-800 to-blue-600', categoryKeyword: 'LinkedIn' },
    { name: 'Discord', icon: <FaDiscord size={24} />, color: 'bg-gradient-to-r from-indigo-600 to-indigo-400', categoryKeyword: 'Discord' },
    { name: 'Website Traffic', icon: <FaGlobe size={24} />, color: 'bg-gradient-to-r from-purple-500 to-purple-300', categoryKeyword: 'Website' },
    { name: 'Others', icon: <FaBuffer size={24} />, color: 'bg-gradient-to-r from-gray-700 to-gray-500', categoryKeyword: 'Others' }
  ];

  const handleCategoryClick = (categoryKeyword: string | null) => {
    if (categoryKeyword) {
      router.push(`/dashboard/user/new-order?platform=${categoryKeyword}`);
    } else {
      router.push('/dashboard/user/new-order');
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-col py-6">{/* Social Media Platforms Grid */}
        
        {/* Social Media Platforms Grid */}
        <div className="card card-padding mb-6">
          <div className="card-header mb-4">
            <div className="card-icon">
              <FaBuffer className="w-5 h-5" />
            </div>
            <h3 className="card-title">Select Platform</h3>
            <span className="ml-auto bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium">
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
                <div className="mb-2 p-2 bg-white/20 rounded-lg backdrop-blur-sm">{platform.icon}</div>
                <div className="text-xs font-semibold text-center leading-tight">{platform.name}</div>
              </button>
            ))}
          </div>
        </div>
        
        <NewOrderClient />
      </div>
    </div>
  );
}