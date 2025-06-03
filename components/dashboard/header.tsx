/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getUserDetails } from '@/lib/actions/getUser';
import { setUserDetails } from '@/lib/slice/userDetails';
import { useGetUserStatsQuery } from '@/lib/services/dashboardApi';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { 
  FaWallet,
  FaFileContract, 
  FaMoneyBillWave, 
  FaSignOutAlt, 
  FaUserCog,
  FaChevronDown,
  FaBell,
  FaPlus,
  FaSearch,
  FaSun,
  FaMoon,
  FaDesktop,
  FaChevronUp,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import MobileSidebar from './mobile-siderbar';

// Enhanced Avatar Components with proper responsiveness
const Avatar = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <div className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => (
  <img 
    src={src} 
    alt={alt} 
    className="w-full h-full object-cover"
    onError={(e) => {
      // Hide image if it fails to load, fallback will show
      e.currentTarget.style.display = 'none';
    }}
  />
);

const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] flex items-center justify-center text-white font-semibold text-sm">
    {children}
  </div>
);

// Enhanced Theme Toggle Component
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-lg bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-600 flex items-center justify-center animate-pulse">
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  const themeOptions = [
    { key: 'light', label: 'Light', icon: FaSun },
    { key: 'dark', label: 'Dark', icon: FaMoon },
    { key: 'system', label: 'System', icon: FaDesktop },
  ];

  const currentTheme = themeOptions.find(option => option.key === theme) || themeOptions[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-10 w-10 rounded-lg bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group">
          <CurrentIcon className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-1">
          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            const isActive = theme === option.key;
            
            return (
              <button
                key={option.key}
                onClick={() => setTheme(option.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#5F1DE8] text-white shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-[#5F1DE8] dark:hover:text-[#B131F8]'
                }`}
              >
                <IconComponent className={`h-4 w-4 transition-colors duration-200 ${
                  isActive ? 'text-white' : ''
                }`} />
                <span className="font-medium text-sm">{option.label}</span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Enhanced Mobile Menu Toggle Button
const MobileMenuToggle = ({ isMenuOpen, toggleMenu }: { isMenuOpen: boolean; toggleMenu: () => void }) => (
  <button
    className="lg:hidden h-10 w-10 rounded-lg bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
    type="button"
    onClick={toggleMenu}
    aria-controls="mobile-menu"
    aria-expanded={isMenuOpen}
    aria-label="Toggle navigation menu"
  >
    <svg
      className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {isMenuOpen ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      )}
    </svg>
  </button>
);

// Enhanced Menu Component with updated styling
const Menu = ({ user }: { user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currency, rate } = useCurrency();
  const userData = useSelector((state: any) => state.userDetails);
  
  // Get balance directly from Redux store
  // Get balance from API for real-time data
  const { data: userStatsResponse } = useGetUserStatsQuery();
  const balance = userStatsResponse?.data?.balance || userData?.balance || 0;
  
  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount = currency === 'BDT' ? amount : amount / (rate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    {
      href: '/dashboard/profile',
      icon: FaUserCog,
      label: 'Profile Settings'
    },
    {
      href: '/dashboard/user/add-funds',
      icon: FaMoneyBillWave,
      label: 'Add Funds'
    },
    {
      href: '/dashboard/user/transactions',
      icon: FaWallet,
      label: 'Transactions'
    },
    {
      href: '/terms',
      icon: FaFileContract,
      label: 'Terms & Conditions'
    }
  ];

  const handleLogout = async () => {
    // Add your logout logic here
    console.log('Logging out...');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        className="relative focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <Avatar className="h-10 w-10 -mb-2">
          <AvatarImage
            src={user?.photo || user?.image || '/user-placeholder.jpg'}
            alt={user?.name || 'User'}
          />
          <AvatarFallback>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content with updated styling */}
          <div className="absolute right-0 mt-2 w-80 z-50 bg-white dark:bg-[#2a2b40] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            
            {/* User Info Section */}
            <div className="p-6 bg-[#f1f2f6] dark:bg-[#2a2b40]">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-14 w-14 ring-3 ring-[#5F1DE8]/20">
                  <AvatarImage
                    src={user?.photo || user?.image || '/user-placeholder.jpg'}
                    alt={user?.name || 'User'}
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {user?.username || user?.name || 'User Name'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mt-1">
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>
              
              {/* Balance Card */}
              <div className="bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaWallet className="h-5 w-5" />
                    <span className="font-semibold">Account Balance</span>
                  </div>
                  <FaChevronDown className="h-4 w-4 opacity-70" />
                </div>
                <div className="mt-2">
                  {loading ? (
                    <div className="h-6 w-24 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold">
                      {formatCurrency(balance)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="w-full px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 flex items-center space-x-3 group block"
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] group-hover:from-[#4F0FD8] group-hover:to-[#A121E8] transition-colors duration-200">
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-[#5F1DE8] dark:text-[#B131F8] group-hover:text-[#4F0FD8] dark:group-hover:text-[#A121E8] transition-colors duration-200">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Logout Button */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-3 group rounded-lg"
              >
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors duration-200">
                  <FaSignOutAlt className="h-4 w-4 text-red-500" />
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Header = () => {
  const user = useCurrentUser();
  const dispatch = useDispatch();
  const { currency, setCurrency, rate, isLoading } = useCurrency();
  const userData = useSelector((state: any) => state.userDetails);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Get balance directly from Redux store
  // Get balance from API for real-time data
  const { data: userStatsResponse } = useGetUserStatsQuery();
  const balance = userStatsResponse?.data?.balance || userData?.balance || 0;
  
  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount = currency === 'BDT' ? amount : amount / (rate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  async function fetchUser() {
    try {
      setIsRefreshing(true);
      const userDetails = await getUserDetails();
      if (userDetails) {
        dispatch(setUserDetails(userDetails));
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsRefreshing(false);
    }
  }
  
  useEffect(() => {
    fetchUser();
    
    // Refresh user data every 30 seconds to sync with sidebar
    const intervalId = setInterval(() => {
      fetchUser();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleCurrencyChange = async (newCurrency: 'USD' | 'BDT') => {
    await setCurrency(newCurrency);
    // refresh the page to apply the new currency
    window.location.reload();
  };

  return (
    <nav className="h-20 flex items-center justify-between px-8 bg-white dark:bg-[#232333] border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      
      {/* Search Bar with + icon beside it */}
      <div className="hidden md:flex items-center gap-3 flex-grow max-w-md">
        <div className="relative w-full h-10 flex items-center">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <FaSearch className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search..."
            className="w-full h-full pl-10 pr-4 bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] transition-colors duration-200"
          />
        </div>
        
        {/* Quick Create Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] flex items-center justify-center text-white shadow-sm hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0">
              <FaPlus className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-700 shadow-sm">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/user/new-order" className="flex items-center gap-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 px-4 py-3">
                <i className="ri-shopping-cart-2-line text-lg text-blue-500"></i>
                <span className="font-medium">New Order</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/user/trickets" className="flex items-center gap-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 px-4 py-3">
                <i className="ri-ticket-2-line text-lg text-purple-500"></i>
                <span className="font-medium">Support Ticket</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        {/* Modern currency switcher */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="h-10 px-4 rounded-lg bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-600 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group min-w-[80px] flex-shrink-0"
                disabled={isLoading}
              >
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200">
                  {currency === 'USD' ? '$' : '৳'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200">
                  {currency}
                </span>
                <FaChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-1">
                <button
                  onClick={() => handleCurrencyChange('BDT')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                    currency === 'BDT' 
                      ? 'bg-[#5F1DE8] text-white shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-[#5F1DE8] dark:hover:text-[#B131F8]'
                  }`}
                >
                  <span className={`text-lg font-bold min-w-[24px] ${currency === 'BDT' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    ৳
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">BDT</span>
                    <span className={`text-xs ${currency === 'BDT' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      Bangladeshi Taka
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handleCurrencyChange('USD')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                    currency === 'USD' 
                      ? 'bg-[#5F1DE8] text-white shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-[#5F1DE8] dark:hover:text-[#B131F8]'
                  }`}
                >
                  <span className={`text-lg font-bold min-w-[24px] ${currency === 'USD' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    $
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">USD</span>
                    <span className={`text-xs ${currency === 'USD' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      US Dollar
                    </span>
                  </div>
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {rate && !isLoading && (
            <div className="flex items-center h-10">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">
                1USD ≈ {rate.toFixed(2)}BDT
              </span>
            </div>
          )}
        </div>
        
        {/* Balance display with wallet icon */}
        <Link 
          href="/dashboard/user/add-funds" 
          className={`flex items-center gap-2 h-10 ${isRefreshing ? 'animate-pulse' : ''} bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white rounded-lg px-4 hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 hover:-translate-y-0.5 group flex-shrink-0`}
        >
          <FaWallet className="text-white group-hover:animate-bounce" />
          <span className="font-bold">
            {formatCurrency(balance)}
          </span>
        </Link>

        {/* Notification dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-10 w-10 rounded-lg bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 flex-shrink-0">
              <FaBell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-[#2a2b40] border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h3>
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Mark all as read</button>
            </div>
            <div className="flex flex-col p-6 items-center justify-center text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                <FaBell className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications found</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Enhanced Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        {/* User Menu */}
        <div className="flex items-center">
          {user && <Menu user={user} />}
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="flex items-center">
          <MobileMenuToggle isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </div>
        
        {/* Legacy Mobile Sidebar - keeping for compatibility */}
        <div className="hidden lg:hidden">
          <MobileSidebar />
        </div>
      </div>
    </nav>
  );
};

export default Header;