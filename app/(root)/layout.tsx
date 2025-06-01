'use client';
import Footer from '@/components/footer';
import Header from '@/components/shared/header';
import { useState, useEffect } from 'react';
import { FaArrowUp, FaComment, FaTimes, FaWhatsapp, FaFacebookMessenger } from 'react-icons/fa';
import { RiTelegramFill } from 'react-icons/ri';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Show/hide button based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Toggle chat menu
  const toggleChat = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  // Handle contact actions
  const handleWhatsApp = () => {
    window.open('https://wa.me/+8801723139610', '_blank');
  };

  const handleTelegram = () => {
    window.open('https://t.me/Smmdoc', '_blank');
  };

  const handleMessenger = () => {
    window.open('https://m.me/smmdocbd', '_blank');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      
      {/* Chat Support Menu */}
      <div className="fixed bottom-6 left-6 z-50">
        {/* WhatsApp Button */}
        <div
          className={`transition-all duration-300 relative group ${
            isChatExpanded 
              ? 'opacity-100 transform translate-y-0 mb-3' 
              : 'opacity-0 transform translate-y-4 pointer-events-none mb-0'
          }`}
        >
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-green-600 transition-all duration-300 hover:-translate-y-1"
            aria-label="Contact via WhatsApp"
          >
            <FaWhatsapp className="w-7 h-7" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            <div className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
              WhatsApp
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
        </div>

        {/* Telegram Button */}
        <div
          className={`transition-all duration-300 relative group ${
            isChatExpanded 
              ? 'opacity-100 transform translate-y-0 mb-3' 
              : 'opacity-0 transform translate-y-4 pointer-events-none mb-0'
          }`}
        >
          <button
            onClick={handleTelegram}
            className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all duration-300 hover:-translate-y-1"
            aria-label="Contact via Telegram"
          >
            <RiTelegramFill className="w-7 h-7" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            <div className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
              Telegram
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
        </div>

        {/* Messenger Button */}
        <div
          className={`transition-all duration-300 relative group ${
            isChatExpanded 
              ? 'opacity-100 transform translate-y-0 mb-3' 
              : 'opacity-0 transform translate-y-4 pointer-events-none mb-0'
          }`}
        >
          <button
            onClick={handleMessenger}
            className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 hover:-translate-y-1"
            aria-label="Contact via Facebook Messenger"
          >
            <FaFacebookMessenger className="w-7 h-7" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            <div className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
              Messenger
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
        </div>

        {/* Main Chat Toggle Button */}
        <div className="relative group">
          <button
            onClick={toggleChat}
            className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white rounded-full shadow-lg hover:shadow-xl hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 ${
              isChatExpanded ? 'rotate-180' : 'rotate-0'
            }`}
            aria-label={isChatExpanded ? 'Close chat menu' : 'Open chat menu'}
          >
            {isChatExpanded ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaComment className="w-6 h-6" />
            )}
          </button>
          {/* Tooltip for main button */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            <div className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
              {isChatExpanded ? 'Close' : 'Contact Support'}
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to Top Button */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
          isVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-4 pointer-events-none'
        }`}
      >
        <button
          onClick={scrollToTop}
          className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white rounded-full shadow-lg hover:shadow-xl hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
          aria-label="Back to top"
        >
          <FaArrowUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}