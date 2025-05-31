/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getUserDetails } from '@/lib/actions/getUser';
import { logout } from '@/lib/actions/logout';
import { setUserDetails } from '@/lib/slice/userDetails';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaFileContract, FaMoneyBillWave, FaSignOutAlt, FaUserCircle, FaUserCog, FaWallet } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

interface UserData {
  id: string;
  name?: string | null;
  email?: string | null;
  balance?: number;
  role?: string;
  addFunds?: any[];
  // Add any other properties that might be in the user data
  image?: string | null;
  emailVerified?: Date | null;
  currency?: string | null;
  dollarRate?: number | null;
  isTwoFactorEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export function Menu({ user }: any) {
  const [loading, setLoading] = useState(true);
  const { currency, rate } = useCurrency();
  const dispatch = useDispatch();
  const userData = useSelector((state: any) => state.userDetails);
  
  // Get balance directly from Redux store
  const balance = userData?.balance || 0;
  
  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount = currency === 'BDT' ? amount : amount / (rate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };
  
  useEffect(() => {
    // Fetch user data on client side
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Use our enhanced getUserDetails function
        const userDetails = await getUserDetails();
        
        if (userDetails) {
          // Update Redux store with user details
          dispatch(setUserDetails(userDetails));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
    
    // Refresh user data every 30 seconds
    const intervalId = setInterval(() => {
      fetchUser();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [dispatch]);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                user?.photo ||
                '/user-placeholder.jpg'
              }
              alt={user?.name || 'User'}
            />
            <AvatarFallback>{'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* User Box */}
        <div className="p-2">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex-shrink-0">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage
                  src={user?.photo || '/user-placeholder.jpg'}
                  alt={user?.name || 'User'}
                />
                <AvatarFallback>
                  <FaUserCircle className="h-8 w-8 text-primary" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded p-2 flex items-center justify-between">
            <div className="flex items-center">
              <FaWallet className="mr-1.5 text-emerald-500 text-xs" />
              <span className="text-xs font-medium">Balance</span>
            </div>
            <span className="text-xs font-bold text-emerald-500">
              {loading ? (
                <span className="inline-block w-10 h-2 bg-emerald-100 animate-pulse rounded"></span>
              ) : (
                formatCurrency(balance)
              )}
            </span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Menu Items */}
        <DropdownMenuGroup>
          <Link href="/dashboard/profile">
            <DropdownMenuItem className="cursor-pointer">
              <FaUserCog className="mr-2 h-4 w-4 text-blue-500" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/dashboard/user/add-funds">
            <DropdownMenuItem className="cursor-pointer">
              <FaMoneyBillWave className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Add Funds</span>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/dashboard/user/transactions">
            <DropdownMenuItem className="cursor-pointer">
              <FaWallet className="mr-2 h-4 w-4 text-amber-500" />
              <span>Transactions</span>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/terms">
            <DropdownMenuItem className="cursor-pointer">
              <FaFileContract className="mr-2 h-4 w-4 text-purple-500" />
              <span>Terms</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
          onClick={async () => await logout()}
        >
          <FaSignOutAlt className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
