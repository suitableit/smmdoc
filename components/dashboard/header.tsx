/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { PriceDisplay } from '@/components/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getUserDetails } from '@/lib/actions/getUser';
import { useGetUserStatsQuery } from '@/lib/services/dashboardApi';
import { setUserDetails } from '@/lib/slice/userDetails';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    FaBell,
    FaChevronDown,
    FaCog,
    FaDesktop,
    FaEllipsisV,
    FaFileContract,
    FaHeadset,
    FaMoneyBillWave,
    FaMoon,
    FaPlus,
    FaSearch,
    FaShoppingCart,
    FaSignOutAlt,
    FaSun,
    FaTicketAlt,
    FaUserCog,
    FaUsers,
    FaWallet,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
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

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);
  
  if (!src || hasError) {
    return null;
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => {
        setHasError(true);
      }}
    />
  );
};

const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-semibold text-sm">
    {children}
  </div>
);

// Enhanced Theme Toggle Component
const ThemeToggle = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`${isMobile ? 'w-full' : 'h-10 w-10 sm:h-10 sm:w-10'} rounded-lg header-theme-transition flex items-center justify-center animate-pulse`}
        style={{
          backgroundColor: 'var(--dropdown-bg)',
          border: `1px solid var(--header-border)`,
        }}
      >
        <div
          className="h-4 w-4 sm:h-5 sm:w-5 rounded"
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

  if (isMobile) {
    // Mobile version - inline theme options
    return (
      <div
        className="p-2.5 rounded-lg"
        style={{
          backgroundColor: 'var(--dropdown-hover)',
          border: `1px solid var(--header-border)`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="font-semibold"
            style={{ color: 'var(--header-text)', fontSize: '11px' }}
          >
            Theme
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            const isActive = theme === option.key;

            return (
              <button
                key={option.key}
                onClick={() => setTheme(option.key)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-md text-center transition-all duration-200 ${
                  isActive ? 'text-white shadow-sm' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--header-text)',
                }}
              >
                <IconComponent
                  className={`h-2.5 w-2.5 transition-colors duration-200 ${
                    isActive ? 'text-white' : ''
                  }`}
                />
                <span className="font-medium" style={{ fontSize: '10px' }}>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop version - dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-10 w-10 sm:h-10 sm:w-10 rounded-lg header-theme-transition flex items-center justify-center hover:opacity-80 group"
          style={{
            backgroundColor: 'var(--dropdown-bg)',
            border: `1px solid var(--header-border)`,
          }}
        >
          <CurrentIcon
            className="h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200"
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

// Mobile Currency Toggle Component
const MobileCurrencyToggle = () => {
  const { currency, setCurrency, rate, isLoading, availableCurrencies, currentCurrencyData } = useCurrency();

  const handleCurrencyChange = async (newCurrency: string) => {
    await setCurrency(newCurrency);
    // Live update - no page reload needed
  };

  return (
    <div
      className="p-2.5 rounded-lg"
      style={{
        backgroundColor: 'var(--dropdown-hover)',
        border: `1px solid var(--header-border)`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-semibold"
          style={{ color: 'var(--header-text)', fontSize: '11px' }}
        >
          Currency
        </span>
        {currentCurrencyData && !isLoading && (
          <span
            className="text-xs font-medium opacity-70"
            style={{ color: 'var(--header-text)', fontSize: '10px' }}
          >
            1USD = {currentCurrencyData.code === 'USD' ? '1.00USD' : `${currentCurrencyData.rate.toFixed(2)}${currentCurrencyData.code}`}
          </span>
        )}
      </div>
      <div className={`grid gap-2 ${availableCurrencies.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {availableCurrencies.map((curr) => (
          <button
            key={curr.code}
            onClick={() => handleCurrencyChange(curr.code)}
            disabled={isLoading}
            className={`flex items-center gap-1.5 p-1.5 rounded-md transition-all duration-200 ${
              currency === curr.code
                ? 'text-white shadow-sm'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor:
                currency === curr.code ? 'var(--primary)' : 'transparent',
              color: currency === curr.code ? 'white' : 'var(--header-text)',
            }}
          >
            <span
              className={`text-xs font-bold ${
                currency === curr.code ? 'text-white' : ''
              }`}
              style={{
                color:
                  currency === curr.code ? 'white' : 'var(--header-text)',
              }}
            >
              {curr.symbol}
            </span>
            <span className="font-medium" style={{ fontSize: '10px' }}>{curr.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Enhanced Mobile Menu Toggle Button (3-dot menu)
const MobileMenuToggle = ({
  isMenuOpen,
  toggleMenu,
}: {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        className="lg:hidden h-10 w-10 sm:h-10 sm:w-10 rounded-lg header-theme-transition flex items-center justify-center hover:opacity-80 transition-all duration-200 group"
        style={{
          backgroundColor: 'var(--dropdown-bg)',
          border: `1px solid var(--header-border)`,
        }}
        type="button"
        aria-label="Open navigation menu"
      >
        <FaEllipsisV
          className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200"
          style={{ color: 'var(--header-text-hover)' }}
        />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="w-64 sm:w-72 header-theme-transition shadow-lg max-w-[calc(100vw-1rem)]"
      style={{
        backgroundColor: 'var(--dropdown-bg)',
        border: `1px solid var(--header-border)`,
      }}
    >
      <MobileSidebar />
    </DropdownMenuContent>
  </DropdownMenu>
);

// Enhanced Menu Component with updated styling
const Menu = ({ user }: { user: any }) => {
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { currency, rate, currentCurrencyData, availableCurrencies } = useCurrency();
  const userData = useSelector((state: any) => state.userDetails);

  const closeMenu = () => setIsOpen(false);
  const enableAuth = true;

  // Check if user is admin
  const isAdmin =
    user?.role?.toLowerCase() === 'admin' ||
    user?.userType?.toLowerCase() === 'admin' ||
    user?.isAdmin === true;

  // Load user data into Redux store if not already loaded
  useEffect(() => {
    const loadUserData = async () => {
      if ((currentUser?.id || user?.id) && !userData?.id) {
        try {
          const userDetailsData = await getUserDetails();
          if (userDetailsData) {
            dispatch(setUserDetails(userDetailsData));
          }
        } catch (error) {
          console.error('Failed to load user details in header:', error);
        }
      }
    };
    
    loadUserData();
  }, [currentUser?.id, user?.id, userData?.id, dispatch]);

  // Get balance from API for real-time data
  const { data: userStatsResponse } = useGetUserStatsQuery(undefined);
  const balance = userStatsResponse?.data?.balance || userData?.balance || 0;
  const userStoredCurrency = userStatsResponse?.data?.currency || userData?.currency || 'USD';



  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    {
      href: '/account-settings',
      icon: FaUserCog,
      label: 'Account Settings',
    },
    ...(isAdmin
      ? []
      : [
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
        ]),
    ...(isAdmin
      ? []
      : [
          {
            href: '/terms',
            icon: FaFileContract,
            label: 'Terms & Conditions',
          },
        ]),
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      closeMenu();

      if (enableAuth) {
        const { signOut } = await import('next-auth/react');
        await signOut({ callbackUrl: '/', redirect: true });
      } else {
        // Custom logout logic
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
      window.location.href = '/';
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <button
        className="relative focus:outline-none flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        disabled={isLoggingOut}
      >
        <Avatar className="h-10 w-10 sm:h-10 sm:w-10">
          <AvatarImage
            src={user?.photo || user?.image}
            alt={user?.name || 'User'}
          />
          {!(user?.photo || user?.image) && (
            <AvatarFallback>
              {(user?.username || user?.name || user?.email)?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1rem)] z-50 header-theme-transition rounded-lg shadow-lg transition-colors duration-200"
            style={{
              backgroundColor: 'var(--dropdown-bg)',
              border: `1px solid var(--header-border)`,
              left: 'auto',
              right: '0',
            }}
          >
            <div
              className="p-3 sm:p-6"
              style={{ backgroundColor: 'rgb(243 243 243)' }}
            >
              <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
                <Avatar className="h-10 w-10 sm:h-14 sm:w-14 ring-2 sm:ring-3 ring-[var(--primary)]/20">
                  <AvatarImage
                    src={user?.photo || user?.image}
                    alt={user?.name || 'User'}
                  />
                  {!(user?.photo || user?.image) && (
                    <AvatarFallback>
                      {(user?.username || user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm sm:text-xl font-bold truncate"
                    style={{ color: 'var(--header-text)' }}
                  >
                    {user?.username || user?.name || 'User Name'}
                  </h3>
                  <p
                    className="truncate text-xs sm:text-sm"
                    style={{ color: 'var(--header-text)', opacity: 0.7 }}
                  >
                    {user?.email || 'user@example.com'}
                  </p>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium mt-1 ${
                      isAdmin
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    }`}
                  >
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>

              {!isAdmin && (
                <div
                  className="rounded-lg p-2.5 sm:p-4 text-white"
                  style={{
                    background: `linear-gradient(to right, var(--primary), var(--secondary))`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <FaWallet className="h-3 w-3 sm:h-5 sm:w-5" />
                      <span className="font-semibold text-xs sm:text-base">
                        Account Balance
                      </span>
                    </div>
                    <FaChevronDown className="h-2.5 w-2.5 sm:h-4 sm:w-4 opacity-70" />
                  </div>
                  <div className="mt-1.5 sm:mt-2">
                    {loading ? (
                      <div className="h-4 sm:h-6 w-16 sm:w-24 bg-white/20 rounded animate-pulse"></div>
                    ) : (
                      <div className="text-lg sm:text-2xl font-bold">
                        <PriceDisplay
                          amount={balance}
                          originalCurrency="BDT"
                          className="text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Controls Section - Currency and Theme */}
            <div className="sm:hidden p-2 space-y-2">
              <MobileCurrencyToggle />
              <ThemeToggle isMobile={true} />
            </div>

            <div className="py-1 sm:py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="w-full px-3 sm:px-6 py-2 sm:py-3 text-left hover:opacity-80 transition-colors duration-200 flex items-center space-x-2 sm:space-x-3 group block"
                >
                  <div
                    className="p-1.5 sm:p-2 rounded-lg group-hover:opacity-80 transition-colors duration-200"
                    style={{
                      background: `linear-gradient(to right, var(--primary), var(--secondary))`,
                    }}
                  >
                    <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span
                    className="font-semibold transition-colors duration-200 text-xs sm:text-base"
                    style={{ color: 'var(--header-text)' }}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            <div style={{ borderTop: `1px solid var(--header-border)` }}></div>

            <div className="p-1 sm:p-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full px-3 sm:px-6 py-2 sm:py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-2 sm:space-x-3 group rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors duration-200">
                  <FaSignOutAlt className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400 text-xs sm:text-base">
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
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
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const { currency, setCurrency, rate, isLoading, availableCurrencies, currentCurrencyData } = useCurrency();
  const userData = useSelector((state: any) => state.userDetails);
  
  // Use Redux store data primarily, fallback to currentUser
  const user = userData?.id ? userData : currentUser;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin =
    user?.role?.toLowerCase() === 'admin' ||
    user?.userType?.toLowerCase() === 'admin' ||
    user?.isAdmin === true;

  const { data: userStatsResponse } = useGetUserStatsQuery(undefined);
  const balance = userStatsResponse?.data?.balance || userData?.balance || 0;
  const userStoredCurrency = userStatsResponse?.data?.currency || userData?.currency || 'USD';

  const formatCurrency = (amount: number) => {
    if (!currentCurrencyData || !availableCurrencies || availableCurrencies.length === 0) {
      return `$${amount.toFixed(2)}`;
    }

    // Database balance is stored in user's preferred currency (from user.currency field)
    // We need to get user's stored currency and convert to display currency
    let convertedAmount = amount;

    if (currentCurrencyData.code === userStoredCurrency) {
      // If display currency matches stored currency, use amount as is
      convertedAmount = amount;
    } else {
      // Convert between currencies using rates
      const storedCurrencyData = availableCurrencies.find(c => c.code === userStoredCurrency);

      if (storedCurrencyData && currentCurrencyData) {
        if (userStoredCurrency === 'USD') {
          // Convert from USD to target currency
          convertedAmount = amount * currentCurrencyData.rate;
        } else if (currentCurrencyData.code === 'USD') {
          // Convert from stored currency to USD
          convertedAmount = amount / storedCurrencyData.rate;
        } else {
          // Convert between two non-USD currencies (via USD)
          const usdAmount = amount / storedCurrencyData.rate;
          convertedAmount = usdAmount * currentCurrencyData.rate;
        }
      }
    }

    return `${currentCurrencyData.symbol}${convertedAmount.toFixed(2)}`;
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

    const intervalId = setInterval(() => {
      fetchUser();
    }, 30000);

    // Listen for currency updates
    const handleCurrencyUpdate = () => {
      // Force refresh currency data when currencies are updated
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    // Listen for avatar updates
    const handleAvatarUpdate = () => {
      fetchUser();
    };

    window.addEventListener('currencyUpdated', handleCurrencyUpdate);
    window.addEventListener('avatarUpdated', handleAvatarUpdate);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('currencyUpdated', handleCurrencyUpdate);
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

  const handleCurrencyChange = async (newCurrency: string) => {
    await setCurrency(newCurrency);
    // Live update - no page reload needed
  };

  return (
    <nav
      className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 header-theme-transition"
      style={{
        height: '4.5rem', // 72px for mobile
        backgroundColor: 'var(--header-bg)',
        borderBottom: `1px solid var(--header-border)`,
        color: 'var(--header-text)',
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (min-width: 640px) {
            nav {
              height: 5rem !important;
            }
          }
        `
      }} />
      {/* Mobile Logo - Visible only on mobile */}
      <Link href="/" className="flex lg:hidden items-center">
        <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
      </Link>

      {/* Desktop Search - Hidden on mobile */}
      <div className="hidden lg:flex items-center gap-3 flex-grow max-w-md">
        <div className="relative w-full h-10 flex items-center">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <FaSearch className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search..."
            className="form-field w-full h-full pl-10 pr-4 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            style={{
              backgroundColor: 'var(--dropdown-bg)',
            }}
          />
        </div>

        {/* Admin Settings Icon OR User Plus Icon */}
        {isAdmin ? (
          <Link
            href="/admin/settings"
            className="h-10 w-10 rounded-lg text-white shadow-sm hover:shadow-lg gradient-button-hover transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(to right, var(--primary), var(--secondary))`,
            }}
            title="General Settings"
          >
            <FaCog className="h-4 w-4 text-white" />
          </Link>
        ) : (
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
              className="w-56 header-theme-transition shadow-sm"
              style={{
                backgroundColor: 'var(--dropdown-bg)',
                border: `1px solid var(--header-border)`,
              }}
            >
              <div className="p-1">
                <Link
                  href="/new-order"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 hover:opacity-80 block"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--header-text)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    }}
                  >
                    <FaShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">New Order</span>
                    <span
                      className="text-xs"
                      style={{
                        color: 'var(--header-text)',
                        opacity: 0.7,
                      }}
                    >
                      Create new order
                    </span>
                  </div>
                </Link>
                <Link
                  href="/add-funds"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 hover:opacity-80 block"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--header-text)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    }}
                  >
                    <FaMoneyBillWave className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Add Funds</span>
                    <span
                      className="text-xs"
                      style={{
                        color: 'var(--header-text)',
                        opacity: 0.7,
                      }}
                    >
                      Top up your balance
                    </span>
                  </div>
                </Link>
                <Link
                  href="/support-tickets/new"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 hover:opacity-80 block"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--header-text)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    }}
                  >
                    <FaTicketAlt className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Create Support Ticket</span>
                    <span
                      className="text-xs"
                      style={{
                        color: 'var(--header-text)',
                        opacity: 0.7,
                      }}
                    >
                      Submit technical issue
                    </span>
                  </div>
                </Link>
                <Link
                  href="/contact-support"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 hover:opacity-80 block"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--header-text)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    }}
                  >
                    <FaHeadset className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Contact Support</span>
                    <span
                      className="text-xs"
                      style={{
                        color: 'var(--header-text)',
                        opacity: 0.7,
                      }}
                    >
                      Live chat & help
                    </span>
                  </div>
                </Link>
                <Link
                  href="/child-panel"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 hover:opacity-80 block"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--header-text)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    }}
                  >
                    <FaUsers className="h-4 w-4 text-pink-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Create Child Panel</span>
                    <span
                      className="text-xs"
                      style={{
                        color: 'var(--header-text)',
                        opacity: 0.7,
                      }}
                    >
                      Manage sub-accounts
                    </span>
                  </div>
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* Currency Selector - Hidden on mobile, visible on desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-10 sm:h-10 px-3 sm:px-4 rounded-lg header-theme-transition flex items-center gap-2 sm:gap-2 hover:opacity-80 transition-all duration-200 group min-w-[80px] sm:min-w-[80px] flex-shrink-0"
                style={{
                  backgroundColor: 'var(--dropdown-bg)',
                  border: `1px solid var(--header-border)`,
                }}
                disabled={isLoading}
              >
                <span
                  className="text-base sm:text-lg font-bold transition-colors duration-200"
                  style={{ color: 'var(--header-text)' }}
                >
                  {currentCurrencyData?.symbol || '$'}
                </span>
                <span
                  className="hidden sm:block font-medium transition-colors duration-200 text-xs sm:text-sm"
                  style={{ color: 'var(--header-text)' }}
                >
                  {currency}
                </span>
                <FaChevronDown
                  className="hidden sm:block w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-200"
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
                {availableCurrencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                      currency === curr.code
                        ? 'text-white shadow-sm'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor:
                        currency === curr.code ? 'var(--primary)' : 'transparent',
                      color: currency === curr.code ? 'white' : 'var(--header-text)',
                    }}
                  >
                    <span
                      className={`text-lg font-bold min-w-[24px] ${
                        currency === curr.code ? 'text-white' : ''
                      }`}
                      style={{
                        color:
                          currency === curr.code ? 'white' : 'var(--header-text)',
                      }}
                    >
                      {curr.symbol}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{curr.code}</span>
                      <span
                        className={`text-xs ${
                          currency === curr.code ? 'text-white/80' : ''
                        }`}
                        style={{
                          color:
                            currency === curr.code
                              ? 'rgba(255,255,255,0.8)'
                              : 'var(--header-text)',
                          opacity: currency === curr.code ? 1 : 0.7,
                        }}
                      >
                        {curr.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Balance Button - Hidden for admin users and on mobile */}
        {!isAdmin && (
          <Link
            href="/add-funds"
            className={`hidden sm:flex items-center gap-2 h-10 ${
              isRefreshing ? 'animate-pulse' : ''
            } text-white rounded-lg px-4 shadow-lg gradient-button-hover transition-all duration-300 group flex-shrink-0`}
            style={{
              background: `linear-gradient(to right, var(--primary), var(--secondary))`,
            }}
          >
            <FaWallet className="text-white h-4 w-4" />
            <span className="font-bold text-sm">
              <PriceDisplay
                amount={balance}
                originalCurrency="BDT"
                className="text-white"
              />
            </span>
          </Link>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-10 w-10 sm:h-10 sm:w-10 rounded-lg header-theme-transition flex items-center justify-center hover:opacity-80 transition-all duration-200 flex-shrink-0"
              style={{
                backgroundColor: 'var(--dropdown-bg)',
                border: `1px solid var(--header-border)`,
              }}
            >
              <FaBell
                className="h-4 w-4 sm:h-4 sm:w-4"
                style={{ color: 'var(--header-text)' }}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 sm:w-80 header-theme-transition shadow-sm max-w-[calc(100vw-2rem)]"
            style={{
              backgroundColor: 'var(--dropdown-bg)',
              border: `1px solid var(--header-border)`,
            }}
          >
            <div
              className="flex justify-between items-center p-3 sm:p-4"
              style={{ borderBottom: `1px solid var(--header-border)` }}
            >
              <h3
                className="text-lg sm:text-xl font-bold"
                style={{ color: 'var(--header-text)' }}
              >
                Notifications
              </h3>
              <button className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Mark all as read
              </button>
            </div>
            <div className="flex flex-col p-4 sm:p-6 items-center justify-center text-center">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--dropdown-hover)' }}
              >
                <FaBell
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  style={{ color: 'var(--header-text)', opacity: 0.5 }}
                />
              </div>
              <p
                className="font-medium text-sm"
                style={{ color: 'var(--header-text)', opacity: 0.7 }}
              >
                No notifications found
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle - Hidden on mobile, visible on desktop */}
        <div className="hidden sm:flex items-center">
          <ThemeToggle />
        </div>

        {/* User Menu */}
        <div className="flex items-center justify-center">
          {user && <Menu user={user} />}
        </div>

        {/* Mobile Menu Toggle (3-dot menu) - Hidden on desktop */}
        <div className="flex items-center lg:hidden">
          <MobileSidebar />
        </div>
      </div>
    </nav>
  );
};

export default Header;