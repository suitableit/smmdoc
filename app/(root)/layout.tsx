'use client';
import Footer from '@/components/frontend/footer';
import Header from '@/components/frontend/header';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  FaArrowUp,
  FaComment,
  FaFacebookMessenger,
  FaTimes,
  FaWhatsapp,
} from 'react-icons/fa';
import { RiTelegramFill } from 'react-icons/ri';

interface LiveChatSettings {
  enabled: boolean;
  hoverTitle: string;
  socialMediaEnabled: boolean;
  messengerEnabled: boolean;
  messengerUrl: string;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  telegramEnabled: boolean;
  telegramUsername: string;
  tawkToEnabled: boolean;
  tawkToWidgetCode: string;
  visibility: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [liveChatSettings, setLiveChatSettings] = useState<LiveChatSettings>({
    enabled: false,
    hoverTitle: 'Contact Support',
    socialMediaEnabled: false,
    messengerEnabled: false,
    messengerUrl: '',
    whatsappEnabled: false,
    whatsappNumber: '',
    telegramEnabled: false,
    telegramUsername: '',
    tawkToEnabled: false,
    tawkToWidgetCode: '',
    visibility: 'all',
  });
  
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // Fetch live chat settings
  useEffect(() => {
    const fetchLiveChatSettings = async () => {
      try {
        const response = await fetch('/api/public/integration-settings/live-chat');
        if (response.ok) {
          const settings = await response.json();
          console.log('Live chat settings fetched:', settings);
          console.log('Tawk.to enabled:', settings.tawkToEnabled);
          console.log('Tawk.to widget code length:', settings.tawkToWidgetCode?.length || 0);
          console.log('Widget code preview:', settings.tawkToWidgetCode?.substring(0, 100) + '...');
          setLiveChatSettings(settings);
          setIsSettingsLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching live chat settings:', error);
        setIsSettingsLoaded(true);
      }
    };

    fetchLiveChatSettings();
  }, []);

  // Load Tawk.to script dynamically
  useEffect(() => {
    if (isSettingsLoaded && liveChatSettings.tawkToEnabled && liveChatSettings.tawkToWidgetCode) {
      console.log('✅ Loading Tawk.to widget dynamically');
      
      // Check user authentication status
      const isAuthenticated = !!(status === 'authenticated' && session?.user);
      const isLoading = status === 'loading';
      
      // Check visibility setting based on authentication status
      let shouldShow = false;
      
      if (liveChatSettings.visibility === 'all') {
        shouldShow = true;
      } else if (liveChatSettings.visibility === 'signed-in') {
        shouldShow = isAuthenticated;
      } else if (liveChatSettings.visibility === 'not-logged-in') {
        shouldShow = !isAuthenticated && !isLoading;
      } else if (liveChatSettings.visibility === 'homepage' && window.location.pathname === '/') {
        shouldShow = true;
      } else if (liveChatSettings.visibility === 'specific' && window.location.pathname.includes('/specific')) {
        shouldShow = true;
      }
      
      console.log('🔍 Visibility check:', {
        visibility: liveChatSettings.visibility,
        isAuthenticated,
        isLoading,
        shouldShow,
        status
      });
      
      if (!shouldShow) {
        console.log('❌ Tawk.to widget hidden due to visibility setting:', liveChatSettings.visibility);
        // Remove existing script if visibility conditions are not met
        const existingScript = document.querySelector('script[src*="embed.tawk.to"]');
        if (existingScript) {
          existingScript.remove();
          console.log('🗑️ Removed existing Tawk.to script due to visibility change');
        }
        return;
      }
      
      // Remove existing Tawk.to script if any
      const existingScript = document.querySelector('script[src*="embed.tawk.to"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://embed.tawk.to/66e0962dea492f34bc10c2e9/1i7ekl9at';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      // Initialize Tawk_API
      if (!(window as any).Tawk_API) {
        (window as any).Tawk_API = {};
        (window as any).Tawk_LoadStart = new Date();
      }
      
      // Append script to head
      document.head.appendChild(script);
      
      console.log('✅ Tawk.to script loaded successfully');
      
      return () => {
        // Cleanup function to remove script when component unmounts
        const existingScript = document.querySelector('script[src*="embed.tawk.to"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    } else {
      console.log('❌ Tawk.to not loaded:', {
        isSettingsLoaded,
        tawkToEnabled: liveChatSettings.tawkToEnabled,
        hasWidgetCode: !!liveChatSettings.tawkToWidgetCode
      });
    }
  }, [isSettingsLoaded, liveChatSettings.tawkToEnabled, liveChatSettings.tawkToWidgetCode, liveChatSettings.visibility, session, status]);

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
      behavior: 'smooth',
    });
  };

  // Toggle chat menu
  const toggleChat = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  // Handle contact actions
  const handleWhatsApp = () => {
    const whatsappUrl = liveChatSettings.whatsappNumber 
      ? `https://wa.me/${liveChatSettings.whatsappNumber.replace(/[^0-9]/g, '')}`
      : 'https://wa.me/+8801723139610';
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegram = () => {
    const telegramUrl = liveChatSettings.telegramUsername
      ? `https://t.me/${liveChatSettings.telegramUsername.replace('@', '')}`
      : 'https://t.me/Smmdoc';
    window.open(telegramUrl, '_blank');
  };

  const handleMessenger = () => {
    const messengerUrl = liveChatSettings.messengerUrl || 'https://m.me/smmdocbd';
    window.open(messengerUrl, '_blank');
  };

  const renderChatMenu = (): React.ReactNode => {
    if (!isSettingsLoaded || (!liveChatSettings.enabled && !liveChatSettings.socialMediaEnabled)) {
      return null;
    }

    const isAuthenticated = !!(status === 'authenticated' && session?.user);
    const isLoading = status === 'loading';
    
    let shouldShowChatMenu = false;
    
    if (liveChatSettings.visibility === 'all') {
      shouldShowChatMenu = true;
    } else if (liveChatSettings.visibility === 'signed-in') {
      shouldShowChatMenu = isAuthenticated;
    } else if (liveChatSettings.visibility === 'not-logged-in') {
      shouldShowChatMenu = !isAuthenticated && !isLoading;
    } else if (liveChatSettings.visibility === 'homepage' && window.location.pathname === '/') {
      shouldShowChatMenu = true;
    } else if (liveChatSettings.visibility === 'specific' && window.location.pathname.includes('/specific')) {
      shouldShowChatMenu = true;
    }
    
    if (!shouldShowChatMenu) {
      return null;
    }
    
    return (
      <div className="fixed bottom-6 left-6 z-50">
        {/* WhatsApp Button */}
        {liveChatSettings.whatsappEnabled && (
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
        )}

        {/* Telegram Button */}
        {liveChatSettings.telegramEnabled && (
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
        )}

        {/* Messenger Button */}
        {liveChatSettings.messengerEnabled && (
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
        )}

        {/* Main Chat Toggle Button */}
        <div className="relative group">
          <button
            onClick={toggleChat}
            className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full shadow-lg hover:shadow-xl hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 ${
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
              {isChatExpanded ? 'Close' : liveChatSettings.hoverTitle}
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Chat Support Menu */}
      {renderChatMenu()}

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
          className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full shadow-lg hover:shadow-xl hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
          aria-label="Back to top"
        >
          <FaArrowUp className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}
