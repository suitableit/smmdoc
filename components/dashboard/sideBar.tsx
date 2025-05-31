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
    balance?: number;
    role?: string;
  };
  error?: string;
}

const adminMenu = [
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: <i className="ri-dashboard-line text-lg"></i>,
  },
  {
    title: 'Categories',
    href: '/dashboard/admin/categories',
    icon: <i className="ri-bookmark-line text-lg"></i>,
  },
  {
    title: 'Services',
    href: '/dashboard/admin/services',
    icon: <i className="ri-service-line text-lg"></i>,
  },
  {
    title: 'Orders',
    href: '/dashboard/admin/orders',
    icon: <i className="ri-shopping-cart-2-line text-lg"></i>,
  },
  {
    title: 'Funds',
    href: '/dashboard/admin/funds',
    icon: <i className="ri-money-dollar-circle-line text-lg"></i>,
  },
];

export default function SideBar({ collapsed: externalCollapsed, setCollapsed: setExternalCollapsed }: SideBarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currency, rate } = useCurrency();
  
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
    const fetchUser = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };
    
    fetchUser();
    
    // Refresh user data every 10 seconds to sync balance
    const intervalId = setInterval(() => {
      fetchUser();
    }, 10000);
    
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
      
      {/* User Info Section */}
      {!loading && user && (
        <div className={`user-info py-3 px-3 ${collapsed ? 'justify-center' : 'hover:bg-white/10 transition-all duration-300 cursor-pointer rounded-md mx-2 my-2'} border-b border-slate-700/30`}>
          {collapsed ? (
            <div className="flex flex-col items-center">
              <div className="avatar bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full p-1 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 animate-gradient glow-effect">
                <div className="bg-slate-900 rounded-full hover:scale-105 transition-all duration-300 p-0.5">
                  <FaUserCircle className="text-4xl text-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 shine-effect" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <div className="avatar flex-shrink-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full p-[2px] shadow-lg hover:shadow-purple-500/50 transition-all duration-500 hover:rotate-6 animate-gradient group glow-effect">
                <div className="bg-[#1B1E2F] rounded-full group-hover:scale-105 transition-all duration-300">
                  <FaUserCircle className="text-[36px] text-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 shine-effect" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="username font-medium text-white flex items-center text-sm">
                  <span className="hover:text-cyan-300 transition-colors duration-300 truncate max-w-[130px]">{user?.data?.name || 'User'}</span>
                  {user?.data?.role === 'admin' && (
                    <FaCrown className="ml-1 text-yellow-400 text-xs animate-bounce-slow flex-shrink-0" />
                  )}
                </div>
                <div className="balance flex items-center text-gradient-to-r from-emerald-300 via-emerald-400 to-teal-500 text-xs font-semibold mt-0.5 balance-animation">
                  <FaWallet className="mr-1 text-xs wallet-icon flex-shrink-0" />
                  <span className="truncate">
                    {formatCurrency(user?.data?.balance || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Sidebar Navigation */}
      <div className="sidebar-nav mt-0 overflow-y-auto overflow-x-hidden h-[calc(100%-10rem)]">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <SideBarNav collapsed={collapsed} user={user} setOpen={() => {}} />
        )}
      </div>
      
      {/* Add animations */}
      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }
        
        .text-gradient-to-r {
          background: linear-gradient(to right, #fde047, #ec4899, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: textShine 3s ease-in-out infinite alternate;
        }
        
        @keyframes textShine {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        
        .from-emerald-300 {
          background: linear-gradient(to right, #6ee7b7, #10b981, #0d9488);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: .9;
            transform: scale(1.05);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-10%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        .glow-effect {
          box-shadow: 0 0 15px rgba(124, 58, 237, 0.5);
          animation: glow 3s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
          0% {
            box-shadow: 0 0 5px rgba(124, 58, 237, 0.5);
          }
          100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.8);
          }
        }
        
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shine-effect::after {
          content: '';
          position: absolute;
          top: -110%;
          left: -210%;
          width: 200%;
          height: 200%;
          opacity: 0;
          transform: rotate(30deg);
          background: rgba(255, 255, 255, 0.13);
          background: linear-gradient(
            to right, 
            rgba(255, 255, 255, 0.13) 0%,
            rgba(255, 255, 255, 0.13) 77%,
            rgba(255, 255, 255, 0.5) 92%,
            rgba(255, 255, 255, 0.0) 100%
          );
          animation: shine 5s ease-in-out infinite;
        }
        
        @keyframes shine {
          10% {
            opacity: 1;
            top: -30%;
            left: -30%;
            transition-property: left, top, opacity;
            transition-duration: 0.7s, 0.7s, 0.15s;
            transition-timing-function: ease;
          }
          100% {
            opacity: 0;
            top: 0%;
            left: 0%;
          }
        }
        
        .balance-animation {
          transition: all 0.3s ease;
        }
        
        .balance-animation:hover {
          transform: translateY(-2px);
        }
        
        .wallet-icon {
          transition: all 0.3s ease;
        }
        
        .balance-animation:hover .wallet-icon {
          transform: rotate(-15deg);
        }
      `}</style>
    </div>
  );
}
