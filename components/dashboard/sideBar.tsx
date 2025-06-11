'use client';
import { useCurrency } from '@/contexts/CurrencyContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaCrown, FaUserCircle, FaWallet } from 'react-icons/fa';
import SideBarNav from './sideBarNav';

interface SideBarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

interface UserData {
  success: boolean;
  data?: {
    name?: string;
    username?: string;
    balance?: number;
    role?: string;
  };
  error?: string;
}

const adminMenu = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: <i className="ri-dashboard-line text-lg"></i>,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: <i className="ri-bookmark-line text-lg"></i>,
  },
  {
    title: 'Services',
    href: '/admin/services',
    icon: <i className="ri-service-line text-lg"></i>,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: <i className="ri-shopping-cart-2-line text-lg"></i>,
  },
  {
    title: 'Funds',
    href: '/admin/funds',
    icon: <i className="ri-money-dollar-circle-line text-lg"></i>,
  },
];

export default function SideBar({ collapsed: externalCollapsed, setCollapsed: setExternalCollapsed }: SideBarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currency, rate } = useCurrency();
  
  // Check if user is admin
  const isAdmin = user?.data?.role === 'admin';
  
  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount = currency === 'BDT' ? amount : amount / (rate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };
  
  // Use external or internal collapsed state
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = (value: boolean) => {
    setInternalCollapsed(value);
    if (setExternalCollapsed) {
      setExternalCollapsed(value);
    }
  };
  
  useEffect(() => {
    // Fetch user data on client side
    const fetchUser = async (isInitialLoad = false) => {
      try {
        // Only show loading indicator on initial load
        if (isInitialLoad) {
          setLoading(true);
        }
        
        const response = await fetch('/api/user/current');
        const userData = await response.json();
        
        if (userData.success) {
          setUser(userData);
        } else {
          console.error('Failed to fetch user data:', userData.error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        // Always turn off loading after fetch completes
        setLoading(false);
      }
    };
    
    // Initial fetch with loading indicator
    fetchUser(true);
    
    // Refresh user data every 30 seconds to sync balance, but without showing loading indicator
    const intervalId = setInterval(() => {
      fetchUser(false);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className={`h-full bg-[#1B1E2F] text-white transition-all duration-300 ${collapsed ? 'w-[80px]' : 'w-[280px]'} overflow-hidden`}>
      {/* Sidebar Header with Logo */}
      <div className={`sidebar-header ${collapsed ? 'p-4 justify-between' : 'p-4'} flex items-center border-b border-slate-700/50`}>
        {!collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="logo-container w-full flex items-center justify-center">
              <Image 
                src="/sit_logo-landscape-dark.png" 
                alt="Suitable IT Logo" 
                width={220} 
                height={60} 
                className="object-contain max-h-[40px]"
                priority={true}
              />
            </div>
          </div>
        )}
        
        <button 
          className={`${collapsed ? 'mx-auto' : 'ml-auto'} text-white p-2 rounded-md transition-all ${collapsed ? 'bg-[#5F1DE8] shadow-md' : 'hover:bg-white/10'}`}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`${collapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'} text-[20px]`}></i>
        </button>
      </div>
      
      {/* User Info Section with Card Design - Only show for non-admin users */}
      {!loading && user && !isAdmin && (
        <div className={`p-3 ${collapsed ? '' : 'mx-2 my-3'}`}>
          <div className={`card card-padding border border-slate-700/50`} style={{ backgroundColor: '#1B1E2F', color: '#f8fafc' }}>
            {collapsed ? (
              <div className="flex flex-col items-center justify-center">
                <div className="card-icon bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 rounded-full">
                  <div className="bg-slate-900 rounded-full p-1">
                    <FaUserCircle className="text-2xl" style={{ color: '#f8fafc' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-3">
                {/* User Profile */}
                <div className="card-icon bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 rounded-full">
                  <div className="bg-slate-900 rounded-full p-2">
                    <FaUserCircle className="text-3xl" style={{ color: '#f8fafc' }} />
                  </div>
                </div>
                
                {/* Username */}
                <div className="flex items-center justify-center">
                  <h3 className="card-title text-sm" style={{ color: '#f8fafc' }}>
                    {user?.data?.username || user?.data?.name || 'User'}
                  </h3>
                  {user?.data?.role === 'admin' && (
                    <FaCrown className="ml-1 text-yellow-400 text-xs" />
                  )}
                </div>
                
                {/* Balance - Gradient Button Style */}
                <div className="btn btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
                  <FaWallet className="text-sm" />
                  <span className="font-semibold">
                    {formatCurrency(user?.data?.balance || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Sidebar Navigation */}
      <div className={`sidebar-nav mt-0 overflow-y-auto overflow-x-hidden ${isAdmin ? 'h-[calc(100%-6rem)]' : 'h-[calc(100%-10rem)]'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <SideBarNav collapsed={collapsed} user={user} setOpen={() => {}} />
        )}
      </div>
    </div>
  );
}