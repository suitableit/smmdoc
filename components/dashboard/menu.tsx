/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { 
  FaFileContract, 
  FaMoneyBillWave, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaUserCog, 
  FaWallet,
  FaChevronDown,
  FaCreditCard
} from 'react-icons/fa';

// Mock components matching your original structure
const Avatar = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <div className={`rounded-full overflow-hidden ${className}`}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="w-full h-full object-cover" />
);

const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full h-full bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] flex items-center justify-center text-white font-medium">
    {children}
  </div>
);

const Button = ({ 
  variant, 
  className, 
  children, 
  ...props 
}: { 
  variant?: string; 
  className?: string; 
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <button 
    className={`inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

interface UserData {
  id: string;
  name?: string | null;
  email?: string | null;
  balance?: number;
  role?: string;
  addFunds?: any[];
  image?: string | null;
  photo?: string | null;
  emailVerified?: Date | null;
  currency?: string | null;
  dollarRate?: number | null;
  isTwoFactorEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export function Menu({ user }: { user: UserData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Mock currency context
  const currency = 'USD';
  const rate = 121.52;
  
  // Mock balance from user data
  const balance = user?.balance || 1250.75;
  
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
      label: 'Profile Settings',
      color: 'text-blue-500'
    },
    {
      href: '/dashboard/user/add-funds',
      icon: FaMoneyBillWave,
      label: 'Add Funds',
      color: 'text-emerald-500'
    },
    {
      href: '/dashboard/user/transactions',
      icon: FaWallet,
      label: 'Transactions',
      color: 'text-amber-500'
    },
    {
      href: '/terms',
      icon: FaFileContract,
      label: 'Terms & Conditions',
      color: 'text-purple-500'
    }
  ];

  const handleLogout = async () => {
    // Mock logout function
    console.log('Logging out...');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="ghost"
        className="relative h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-[#5F1DE8] transition-all duration-200">
          <AvatarImage
            src={user?.photo || user?.image || '/user-placeholder.jpg'}
            alt={user?.name || 'User'}
          />
          <AvatarFallback>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute right-0 mt-2 w-80 z-50 bg-white dark:bg-[#2a2b40] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
            
            {/* User Info Section */}
            <div className="p-6 bg-gradient-to-br from-[#5F1DE8]/5 to-[#B131F8]/5 dark:from-[#5F1DE8]/10 dark:to-[#B131F8]/10">
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {user?.name || 'User Name'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mt-1">
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>
              
              {/* Balance Card */}
              <div className="bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaWallet className="h-5 w-5" />
                    <span className="font-medium">Account Balance</span>
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
                <button
                  key={index}
                  onClick={() => {
                    console.log(`Navigating to ${item.href}`);
                    setIsOpen(false);
                  }}
                  className="w-full px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 flex items-center space-x-3 group"
                >
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors duration-200`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200">
                    {item.label}
                  </span>
                </button>
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
                <span className="font-medium text-red-600 dark:text-red-400">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Demo component with mock data
export default function MenuDemo() {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    balance: 1250.75,
    role: 'Premium User',
    photo: null
  };

  return (
    <div className="min-h-screen bg-[#f1f2f6] dark:bg-[#232333] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Redesigned Menu Component
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Click on the avatar in the top-right corner to see the redesigned dropdown menu.
          </p>
          
          {/* Menu positioned in top-right */}
          <div className="flex justify-end">
            <Menu user={mockUser} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#2a2b40] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Design Features
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• Modern purple gradient theme matching your profile page</li>
            <li>• Enhanced user info section with role badge</li>
            <li>• Beautiful balance card with gradient background</li>
            <li>• Improved hover effects and transitions</li>
            <li>• Better spacing and typography</li>
            <li>• Dark mode support</li>
            <li>• Loading states for balance display</li>
            <li>• Responsive design with proper backdrop</li>
          </ul>
        </div>
      </div>
    </div>
  );
}