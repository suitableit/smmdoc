/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getUserDetails } from '@/lib/actions/getUser';
import { useGetUserStatsQuery } from '@/lib/services/dashboardApi';
import { setUserDetails } from '@/lib/slice/userDetails';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FaBars,
  FaBell,
  FaChevronDown,
  FaDesktop,
  FaFileContract,
  FaMoneyBillWave,
  FaMoon,
  FaPlus,
  FaSearch,
  FaShoppingCart,
  FaSignOutAlt,
  FaSun,
  FaTicketAlt,
  FaTimes,
  FaUserCog,
  FaWallet,
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
const Avatar = ({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) => (
  <div
    className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
  >
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
      <div
        className="h-10 w-10 rounded-lg header-theme-transition flex items-center justify-center animate-pulse"
        style={{
          backgroundColor: 'var(--dropdown-bg)',
          border: `1px solid var(--header-border)`,
        }}
      >
        <div
          className="h-5 w-5 rounded"
          style={{ backgroundColor: 'var(--header-border)' }}
        ></div>
      </div>
    );
  }

  const themeOptions = [
    { key: 'light', label: 'Light', icon: FaSun },
    { key: 'dark', label: 'Dark', icon: FaMoon },
    { key: 'system', label: 'System', icon: FaDesktop },
  ];

  const currentTheme =
    themeOptions.find((option) => option.key === theme) || themeOptions[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-10 w-10 rounded-lg header-theme-transition flex items-center justify-center hover:opacity-80 group"
          style={{
            backgroundColor: 'var(--dropdown-bg)',
            border: `1px solid var(--header-border)`,
          }}
        >
          <CurrentIcon
            className="h-5 w-5 transition-colors duration-200"
            style={{ color: 'var(--header-text-hover)' }}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 theme-dropdown header-theme-transition shadow-sm"
        style={{
          backgroundColor: 'var(--dropdown-bg)',
          border: `1px solid var(--header-border)`,
        }}
      >
        <div className="p-1">
          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            const isActive = theme === option.key;

            return (
              <button
                key={option.key}
                onClick={() => setTheme(option.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                  isActive ? 'text-white shadow-sm' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--header-text)',
                }}
              >
                <IconComponent
                  className={`h-4 w-4 transition-colors duration-200 ${
                    isActive ? 'text-white' : ''
                  }`}
                />
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
const MobileMenuToggle = ({
  isMenuOpen,
  toggleMenu,
}: {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}) => (
  <button
    className="lg:hidden h-10 w-10 rounded-lg header-theme-transition flex items-center justify-center hover:opacity-80 transition-all duration-200 group"
    style={{
      backgroundColor: 'var(--dropdown-bg)',
      border: `1px solid var(--header-border)`,
    }}
    type="button"
    onClick={toggleMenu}
    aria-controls="mobile-menu"
    aria-expanded={isMenuOpen}
    aria-label="Toggle navigation menu"
  >
    {isMenuOpen ? (
      <FaTimes
        className="w-5 h-5 transition-colors duration-200"
        style={{ color: 'var(--header-text-hover)' }}
      />
    ) : (
      <FaBars
        className="w-5 h-5 transition-colors duration-200"
        style={{ color: 'var(--header-text-hover)' }}
      />
    )}
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
    const convertedAmount =
      currency === 'BDT' ? amount : amount / (rate || 121.52);
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
      label: 'Profile Settings',
    },
    {
      href: '/add-funds',
      icon: FaMoneyBillWave,
      label: 'Add Funds',
    },
    {
      href: '/transactions',
      icon: FaWallet,
      label: 'Transactions',
    },
    {
      href: '/terms',
      icon: FaFileContract,
      label: 'Terms & Conditions',
    },
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
          <div
            className="absolute right-0 mt-2 w-80 z-50 header-theme-transition rounded-lg shadow-sm transition-colors duration-200"
            style={{
              backgroundColor: 'var(--dropdown-bg)',
              border: `1px solid var(--header-border)`,
            }}
          >
            {/* User Info Section */}
            <div
              className="p-6"
              style={{ backgroundColor: 'var(--dropdown-hover)' }}
            >
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
                  <h3
                    className="text-xl font-bold truncate"
                    style={{ color: 'var(--header-text)' }}
                  >
                    {user?.username || user?.name || 'User Name'}
                  </h3>
                  <p
                    className="truncate"
                    style={{ color: 'var(--header-text)', opacity: 0.7 }}
                  >
                    {user?.email || 'user@example.com'}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mt-1">
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>

              {/* Balance Card */}
              <div
                className="rounded-lg p-4 text-white"
                style={{
                  background: `linear-gradient(to right, var(--primary), var(--secondary))`,
                }}
              >
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
                  className="w-full px-6 py-3 text-left hover:opacity-80 transition-colors duration-200 flex items-center space-x-3 group block"
                >
                  <div
                    className="p-2 rounded-lg group-hover:opacity-80 transition-colors duration-200"
                    style={{
                      background: `linear-gradient(to right, var(--primary), var(--secondary))`,
                    }}
                  >
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <span
                    className="font-semibold transition-colors duration-200"
                    style={{ color: 'var(--header-text)' }}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Separator */}
            <div style={{ borderTop: `1px solid var(--header-border)` }}></div>

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
    const convertedAmount =
      currency === 'BDT' ? amount : amount / (rate || 121.52);
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
      console.error('Error fetching user details:', error);
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
    <nav
      className="h-20 flex items-center justify-between px-8 header-theme-transition"
      style={{
        backgroundColor: 'var(--header-bg)',
        borderBottom: `1px solid var(--header-border)`,
        color: 'var(--header-text)',
      }}
    >
      {/* Search Bar with + icon beside it */}
      <div className="hidden md:flex items-center gap-3 flex-grow max-w-md">
        <div className="relative w-full h-10 flex items-center">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <FaSearch className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search..."
            className="w-full h-full pl-10 pr-4 header-theme-transition rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors duration-200"
            style={{
              backgroundColor: 'var(--dropdown-bg)',
              color: 'var(--header-text)',
              border: `1px solid var(--header-border)`,
            }}
          />
        </div>

        {/* Quick Create Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-10 w-10 rounded-lg text-white shadow-sm hover:shadow-lg gradient-button-hover transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(to right, var(--primary), var(--secondary))`,
              }}
            >
              <FaPlus className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 header-theme-transition shadow-sm"
            style={{
              backgroundColor: 'var(--dropdown-bg)',
              border: `1px solid var(--header-border)`,
            }}
          >
            <DropdownMenuItem asChild>
              <Link
                href="/new-order"
                className="flex items-center gap-3 hover:opacity-80 px-4 py-3"
                style={{ color: 'var(--header-text)' }}
              >
                <FaShoppingCart className="text-lg text-blue-500" />
                <span className="font-medium">New Order</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/support-ticket"
                className="flex items-center gap-3 hover:opacity-80 px-4 py-3"
                style={{ color: 'var(--header-text)' }}
              >
                <FaTicketAlt className="text-lg text-purple-500" />
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
                className="h-10 px-4 rounded-lg header-theme-transition flex items-center gap-2 hover:opacity-80 transition-all duration-200 group min-w-[80px] flex-shrink-0"
                style={{
                  backgroundColor: 'var(--dropdown-bg)',
                  border: `1px solid var(--header-border)`,
                }}
                disabled={isLoading}
              >
                <span
                  className="text-lg font-bold transition-colors duration-200"
                  style={{ color: 'var(--header-text)' }}
                >
                  {currency === 'USD' ? '$' : '৳'}
                </span>
                <span
                  className="font-medium transition-colors duration-200"
                  style={{ color: 'var(--header-text)' }}
                >
                  {currency}
                </span>
                <FaChevronDown
                  className="w-4 h-4 transition-colors duration-200"
                  style={{ color: 'var(--header-text)', opacity: 0.7 }}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 header-theme-transition shadow-sm"
              style={{
                backgroundColor: 'var(--dropdown-bg)',
                border: `1px solid var(--header-border)`,
              }}
            >
              <div className="p-1">
                <button
                  onClick={() => handleCurrencyChange('BDT')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                    currency === 'BDT'
                      ? 'text-white shadow-sm'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor:
                      currency === 'BDT' ? 'var(--primary)' : 'transparent',
                    color: currency === 'BDT' ? 'white' : 'var(--header-text)',
                  }}
                >
                  <span
                    className={`text-lg font-bold min-w-[24px] ${
                      currency === 'BDT' ? 'text-white' : ''
                    }`}
                    style={{
                      color:
                        currency === 'BDT' ? 'white' : 'var(--header-text)',
                    }}
                  >
                    ৳
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">BDT</span>
                    <span
                      className={`text-xs ${
                        currency === 'BDT' ? 'text-white/80' : ''
                      }`}
                      style={{
                        color:
                          currency === 'BDT'
                            ? 'rgba(255,255,255,0.8)'
                            : 'var(--header-text)',
                        opacity: currency === 'BDT' ? 1 : 0.7,
                      }}
                    >
                      Bangladeshi Taka
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handleCurrencyChange('USD')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                    currency === 'USD'
                      ? 'text-white shadow-sm'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor:
                      currency === 'USD' ? 'var(--primary)' : 'transparent',
                    color: currency === 'USD' ? 'white' : 'var(--header-text)',
                  }}
                >
                  <span
                    className={`text-lg font-bold min-w-[24px] ${
                      currency === 'USD' ? 'text-white' : ''
                    }`}
                    style={{
                      color:
                        currency === 'USD' ? 'white' : 'var(--header-text)',
                    }}
                  >
                    $
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">USD</span>
                    <span
                      className={`text-xs ${
                        currency === 'USD' ? 'text-white/80' : ''
                      }`}
                      style={{
                        color:
                          currency === 'USD'
                            ? 'rgba(255,255,255,0.8)'
                            : 'var(--header-text)',
                        opacity: currency === 'USD' ? 1 : 0.7,
                      }}
                    >
                      US Dollar
                    </span>
                  </div>
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {rate && !isLoading && (
            <div className="flex items-center h-10">
              <span
                className="text-sm font-medium hidden sm:inline"
                style={{ color: 'var(--header-text)' }}
              >
                1USD ≈ {rate.toFixed(2)}BDT
              </span>
            </div>
          )}
        </div>

        {/* Balance display with wallet icon */}
        <Link
          href="/add-funds"
          className={`flex items-center gap-2 h-10 ${
            isRefreshing ? 'animate-pulse' : ''
          } text-white rounded-lg px-4 shadow-lg gradient-button-hover transition-all duration-300 hover:-translate-y-0.5 group flex-shrink-0`}
          style={{
            background: `linear-gradient(to right, var(--primary), var(--secondary))`,
          }}
        >
          <FaWallet className="text-white group-hover:animate-bounce" />
          <span className="font-bold">{formatCurrency(balance)}</span>
        </Link>

        {/* Notification dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-10 w-10 rounded-lg header-theme-transition flex items-center justify-center hover:opacity-80 transition-all duration-200 flex-shrink-0"
              style={{
                backgroundColor: 'var(--dropdown-bg)',
                border: `1px solid var(--header-border)`,
              }}
            >
              <FaBell
                className="h-4 w-4"
                style={{ color: 'var(--header-text)' }}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 header-theme-transition shadow-sm"
            style={{
              backgroundColor: 'var(--dropdown-bg)',
              border: `1px solid var(--header-border)`,
            }}
          >
            <div
              className="flex justify-between items-center p-4"
              style={{ borderBottom: `1px solid var(--header-border)` }}
            >
              <h3
                className="text-xl font-bold"
                style={{ color: 'var(--header-text)' }}
              >
                Notifications
              </h3>
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Mark all as read
              </button>
            </div>
            <div className="flex flex-col p-6 items-center justify-center text-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--dropdown-hover)' }}
              >
                <FaBell
                  className="h-6 w-6"
                  style={{ color: 'var(--header-text)', opacity: 0.5 }}
                />
              </div>
              <p
                className="font-medium"
                style={{ color: 'var(--header-text)', opacity: 0.7 }}
              >
                No notifications found
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Enhanced Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        {/* User Menu */}
        <div className="flex items-center">{user && <Menu user={user} />}</div>

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
