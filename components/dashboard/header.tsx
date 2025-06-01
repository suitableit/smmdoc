/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getUserDetails } from '@/lib/actions/getUser';
import { setUserDetails } from '@/lib/slice/userDetails';
import { Bell, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaWallet } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { ModeToggle } from '../shared/header/mode-Toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Menu } from './menu';
import MobileSidebar from './mobile-siderbar';

const Header = () => {
  const user = useCurrentUser();
  const dispatch = useDispatch();
  const { currency, setCurrency, rate, isLoading } = useCurrency();
  const userData = useSelector((state: any) => state.userDetails);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Get balance directly from Redux store
  const balance = userData?.balance || 0;
  
  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount = currency === 'BDT' ? amount : amount / (rate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
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
    
    // Refresh user data every 10 seconds to sync with sidebar
    const intervalId = setInterval(() => {
      fetchUser();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleCurrencyChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newCurrency = e.target.value as 'USD' | 'BDT';
    await setCurrency(newCurrency);
    // refresh the page to apply the new currency
    window.location.reload();
  };

  return (
    <nav className="h-20 flex items-center justify-between px-8 relative bg-white dark:backdrop-blur-xl dark:bg-gradient-to-r dark:from-slate-900/95 dark:via-purple-900/90 dark:to-slate-900/95 border-t-2 border-t-purple-500 dark:border-t-purple-400 shadow-sm dark:shadow-2xl dark:shadow-purple-500/20">
      {/* 3D Glow Effect - Only in Dark Mode */}
      <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-xl"></div>
      <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      
      {/* Search Bar with + icon beside it */}
      <div className="hidden md:flex items-center gap-2 flex-grow max-w-md relative z-10">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-500 dark:text-gray-300 dark:drop-shadow-lg" />
          </div>
          <input
            type="search"
            placeholder="Search..."
            className="w-full pl-10 pr-3 py-2 rounded-lg dark:rounded-xl border border-gray-300 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500/50 bg-gray-50 dark:bg-white/10 dark:backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 focus:bg-white dark:focus:bg-white/15"
          />
        </div>
        
        {/* Quick Create Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-9 w-9 rounded-lg dark:rounded-xl bg-blue-500 dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-600 flex items-center justify-center text-white shadow-md dark:shadow-lg dark:shadow-blue-500/30 hover:bg-blue-600 dark:hover:shadow-xl dark:hover:shadow-blue-500/40 dark:transform dark:hover:scale-105 transition-all duration-300 border border-blue-600 dark:border-white/20">
              <Plus className="h-5 w-5 dark:drop-shadow-lg" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg dark:shadow-2xl">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/user/new-order" className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                <i className="ri-shopping-cart-2-line text-lg"></i>
                <span>New Order</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/user/trickets" className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                <i className="ri-ticket-2-line text-lg"></i>
                <span>Support Ticket</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-3 ml-auto relative z-10">
        {/* Enhanced currency switcher */}
        <div className="flex items-center gap-1">
          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="bg-gray-100 dark:bg-white/10 dark:backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none text-gray-900 dark:text-white shadow-sm dark:shadow-lg hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300"
            disabled={isLoading}
          >
            <option value="BDT" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              BDT
            </option>
            <option value="USD" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              USD
            </option>
          </select>
          {rate && !isLoading && (
            <span className="text-xs text-gray-600 dark:text-gray-300 hidden sm:inline dark:drop-shadow-lg">
              1USD ≈ {rate.toFixed(2)}BDT
            </span>
          )}
        </div>
        
        {/* Balance display with wallet icon */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href="/dashboard/user/add-funds" 
                className={`flex items-center gap-1 ${isRefreshing ? 'animate-pulse' : ''} bg-emerald-100 dark:bg-gradient-to-r dark:from-emerald-500/30 dark:to-teal-500/30 dark:backdrop-blur-md rounded-lg dark:rounded-full py-2 px-4 hover:bg-emerald-200 dark:hover:from-emerald-500/40 dark:hover:to-teal-500/40 transition-all duration-300 group border border-emerald-300 dark:border-emerald-400/30 shadow-sm dark:shadow-lg dark:shadow-emerald-500/20 dark:hover:shadow-xl dark:hover:shadow-emerald-500/30 dark:transform dark:hover:scale-105`}
              >
                <FaWallet className="text-emerald-600 dark:text-emerald-200 mr-1 dark:group-hover:animate-bounce dark:drop-shadow-lg" />
                <span className="text-sm font-medium text-emerald-700 dark:text-white dark:drop-shadow-lg">
                  {formatCurrency(balance)}
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border border-gray-200 dark:border-white/20">
              <p className="text-gray-900 dark:text-white">Your current balance - click to add funds</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notification dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 dark:backdrop-blur-md transition-all duration-300 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg dark:hover:shadow-xl dark:transform dark:hover:scale-105">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 dark:drop-shadow-lg" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg dark:shadow-2xl">
            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-white/10">
              <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Mark all as read</button>
            </div>
            <div className="flex flex-col p-4 items-center justify-center text-center py-6">
              <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 dark:backdrop-blur-md rounded-full flex items-center justify-center mb-2 border border-gray-200 dark:border-white/20">
                <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications found</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && <Menu user={user} />}
        <ModeToggle />
        <div className="block lg:hidden">
          <MobileSidebar />
        </div>
      </div>
    </nav>
  );
};

export default Header;
