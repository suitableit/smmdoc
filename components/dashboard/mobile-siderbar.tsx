 
'use client';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCurrency } from '@/contexts/CurrencyContext';
import { MenuIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaUserCircle, FaWallet } from 'react-icons/fa';
import SideBarNav from './sideBarNav';

interface UserData {
  success: boolean;
  data?: {
    name?: string;
    balance?: number;
    role?: string;
  };
  error?: string;
}

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currency, rate } = useCurrency();
  
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2">
          <span className="sr-only">Open menu</span>
          <MenuIcon className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <SheetHeader className="p-4 border-b border-slate-700/50">
          <SheetTitle className="text-white flex items-center">
            <div className="logo bg-gradient-to-br from-blue-600 to-teal-400 rounded-md w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg relative overflow-hidden">
              SIT
              <div className="absolute w-3 h-3 bg-white/30 rounded-full -bottom-1 -right-1"></div>
            </div>
            <span className="ml-3">SMM Panel</span>
          </SheetTitle>
        </SheetHeader>
        
        {/* User Info Section */}
        {!loading && user && (
          <div className="user-info py-3 px-3 hover:bg-white/10 transition-all duration-300 cursor-pointer rounded-md mx-2 my-2 border-b border-slate-700/30">
            <div className="flex items-center space-x-2.5">
              <div className="avatar flex-shrink-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full p-[2px] shadow-lg hover:shadow-purple-500/50 transition-all duration-500 hover:rotate-6 animate-gradient group glow-effect">
                <div className="bg-slate-900 rounded-full group-hover:scale-105 transition-all duration-300">
                  <FaUserCircle className="text-[36px] text-gradient-to-r" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="username font-medium text-white flex items-center text-sm">
                  <span className="hover:text-cyan-300 transition-colors duration-300 truncate max-w-[130px]">{user?.data?.name || 'User'}</span>
                </div>
                <div className="balance flex items-center text-emerald-400 text-xs font-semibold mt-0.5">
                  <FaWallet className="mr-1 text-xs" />
                  <span className="truncate">
                    {formatCurrency(user?.data?.balance || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="py-2">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
            </div>
          ) : (
            <SideBarNav user={user} setOpen={setOpen} />
          )}
        </div>
        
        {/* Add styles for text gradient */}
        <style jsx global>{`
          .text-gradient-to-r {
            background: linear-gradient(to right, #fde047, #ec4899, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
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
          
          .glow-effect {
            box-shadow: 0 0 15px rgba(124, 58, 237, 0.3);
          }
        `}</style>
      </SheetContent>
    </Sheet>
  );
}
