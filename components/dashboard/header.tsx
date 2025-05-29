/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getUserDetails } from '@/lib/actions/getUser';
import { setUserDetails } from '@/lib/slice/userDetails';
import { Bell, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
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
  
  async function fetchUser() {
    const userDetails = await getUserDetails();
    if (userDetails) {
      dispatch(setUserDetails(userDetails));
      return userDetails;
    }
  }
  
  useEffect(() => {
    fetchUser();
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
    <nav className="h-16 flex items-center justify-between px-4">
      {/* Search Bar with + icon beside it */}
      <div className="hidden md:flex items-center gap-2 flex-grow max-w-md">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search..."
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent"
          />
        </div>
        
        {/* Quick Create Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <Plus className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/user/new-order" className="flex items-center gap-2">
                <i className="ri-shopping-cart-2-line text-lg"></i>
                <span>New Order</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/user/trickets" className="flex items-center gap-2">
                <i className="ri-ticket-2-line text-lg"></i>
                <span>Support Ticket</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-3 ml-auto">
        {/* Enhanced currency switcher */}
        <div className="flex items-center gap-1">
          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="bg-transparent border rounded-md px-2 py-1 text-sm focus:outline-none"
            disabled={isLoading}
          >
            <option value="BDT">
              BDT ( ৳{userData?.addFunds[0]?.amount * (rate || 1) || 0} )
            </option>
            <option value="USD">
              USD ( ${userData?.addFunds[0]?.amount || 0} )
            </option>
          </select>
          {rate && !isLoading && (
            <span className="text-xs text-gray-500 hidden sm:inline">
              1USD ≈ {rate.toFixed(2)}BDT
            </span>
          )}
        </div>

        {/* Notification dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-medium">Notifications</h3>
              <button className="text-sm text-blue-500 hover:underline">Mark all as read</button>
            </div>
            <div className="flex flex-col p-4 items-center justify-center text-center py-6">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No notifications found</p>
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
