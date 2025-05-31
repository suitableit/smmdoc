'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useGetUserStatsQuery } from '@/lib/services/dashboardApi';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FaExternalLinkAlt,
  FaInfoCircle,
  FaMoneyBillWave,
  FaShoppingBag,
  FaSpinner,
  FaUser,
  FaWallet
} from 'react-icons/fa';
import { toast } from 'sonner';

// 3D Button Component
interface Button3DProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tab';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

const Button3D: React.FC<Button3DProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  active = false,
  type = 'button',
  className = ''
}) => {
  const baseClasses = `
    relative font-semibold rounded-lg transition-all duration-300 ease-out
    transform-gpu focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white
      shadow-lg shadow-purple-500/25 dark:shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 dark:hover:shadow-purple-500/50
      hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-400 dark:hover:to-blue-400
      active:scale-95 active:shadow-md dark:border dark:border-purple-400/30
    `,
    secondary: `
      bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 text-gray-800 dark:text-white
      shadow-lg shadow-gray-500/25 dark:shadow-slate-500/30 hover:shadow-xl hover:shadow-gray-500/40 dark:hover:shadow-slate-500/50
      hover:from-gray-200 hover:to-gray-300 dark:hover:from-slate-600 dark:hover:to-slate-700
      active:scale-95 active:shadow-md dark:border dark:border-slate-600/30
    `,
    tab: `
      ${active 
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/30' 
        : 'bg-white/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-slate-700/70'
      }
      border border-white/20 dark:border-slate-600/30 backdrop-blur-sm
      hover:shadow-lg dark:hover:shadow-slate-500/20 transition-all duration-300
    `
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <FaSpinner className="animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorTheme?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, colorTheme = 'blue' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        relative p-4 md:p-5 rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-slate-900/80
        border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl dark:shadow-2xl dark:shadow-purple-500/20
        transition-all duration-300 hover:-translate-y-1 dark:hover:shadow-purple-500/30 dark:hover:scale-105
        group overflow-hidden
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-purple-500/10 dark:to-transparent opacity-50" />
      <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-purple-500/5 dark:to-blue-500/5 opacity-0 dark:opacity-100" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white dark:drop-shadow-lg">{value}</p>
        </div>
        <div className={`text-3xl text-${colorTheme}-500 dark:text-${colorTheme}-400 group-hover:scale-110 transition-transform duration-300 dark:drop-shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Instructions Panel Component
const InstructionsPanel: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="
        p-4 md:p-6 rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-slate-900/80
        border border-white/20 dark:border-slate-700/50 shadow-xl dark:shadow-2xl dark:shadow-blue-500/20 h-fit
      "
    >
      <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-blue-500/5 dark:to-purple-500/5 opacity-0 dark:opacity-100 rounded-2xl" />
      <div className="relative z-10">
        <div className="flex items-center mb-4 md:mb-5">
          <FaInfoCircle className="text-blue-500 dark:text-blue-400 text-xl mr-3 dark:drop-shadow-lg" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:drop-shadow-lg">How Mass Order works?</h3>
        </div>
        
        <div className="space-y-3 md:space-y-4 text-gray-700 dark:text-gray-300">
        <p className="leading-relaxed">
          You put the service ID followed by | followed by the link 
          followed by | followed by quantity on each line to get 
          the service ID of a service please check here:
        </p>
        
        <a 
          href="https://smmgen.com/services" 
          target="_blank" 
          rel="noopener noreferrer"
          className="
            inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300
            font-medium transition-colors duration-200 dark:drop-shadow-lg
          "
        >
          https://smmgen.com/services
          <FaExternalLinkAlt className="ml-2 text-sm" />
        </a>
        
        <p className="leading-relaxed">
          Let's say you want to use the Mass Order to add 
          Instagram Followers to your 3 accounts: abcd, asdf, qwer
        </p>
        
        <p className="leading-relaxed">
          From the Services List, the service ID for this service 
          "Instagram Followers [100% Real - 30 Days Guarantee- 
          NEW SERVICE" is 3740
        </p>
        
        <p className="leading-relaxed">
          Let's say you want to add 1000 followers for each 
          account, the output will be like this: ID|Link|Quantity 
          or in this example:
        </p>
        
        <div className="bg-gray-900 dark:bg-gradient-to-br dark:from-slate-900 dark:to-black rounded-lg p-4 font-mono text-sm border dark:border-slate-700 shadow-lg dark:shadow-xl dark:shadow-green-500/10">
          <div className="text-green-400 dark:text-green-300 space-y-1">
            <div>3740|abcd|1000</div>
            <div>3740|asdf|1000</div>
            <div>3740|qwer|1000</div>
            <div>3740|eoir|1000</div>
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Mass Order Component
export default function MassOrder() {
  const user = useCurrentUser();
  const router = useRouter();
  const { currency, rate: currencyRate } = useCurrency();
  const { data: userStatsResponse } = useGetUserStatsQuery({});
  const userStats = userStatsResponse?.data;
  
  const [activeTab, setActiveTab] = useState<'newOrder' | 'massOrder'>('massOrder');
  const [orders, setOrders] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // User data from API or fallback with proper currency formatting
  const balance = userStats?.balance || 0;
  const totalSpend = userStats?.totalSpent || 0;
  const totalOrdersCount = userStats?.totalOrders || 0;
  
  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount = currency === 'BDT' ? amount : amount / (currencyRate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };
  
  // Handle New Order navigation
  const handleNewOrderClick = () => {
    router.push('/dashboard/user/new-order');
  };

  // Parse and validate the orders text
  const parseOrders = (text: string) => {
    if (!text.trim()) {
      setTotalOrders(0);
      setTotalPrice(0);
      return;
    }

    const lines = text.trim().split('\n');
    let validLines = 0;
    let totalAmount = 0;

    lines.forEach(line => {
      const parts = line.trim().split('|');
      if (parts.length >= 3) {
        const serviceId = parts[0].trim();
        const link = parts[1].trim();
        const quantity = parseInt(parts[2].trim(), 10);

        // Placeholder price calculation
        const price = 0.5; // Placeholder price per 1000 units
        
        if (!isNaN(quantity) && serviceId && link) {
          validLines++;
          totalAmount += (price * quantity / 1000);
        }
      }
    });

    setTotalOrders(validLines);
    setTotalPrice(totalAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totalOrders === 0) {
      toast.error("No valid orders found. Please check your input format.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Successfully submitted ${totalOrders} orders!`);
      setOrders('');
      setTotalOrders(0);
      setTotalPrice(0);
    } catch (error) {
      toast.error("Failed to submit orders. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          <StatsCard
            title="Username"
            value={user?.name || 'msrjihad'}
            icon={<FaUser />}
            colorTheme="blue"
          />
          <StatsCard
            title="Balance"
            value={formatCurrency(balance)}
            icon={<FaWallet />}
            colorTheme="green"
          />
          <StatsCard
            title="Total Spend"
            value={formatCurrency(totalSpend)}
            icon={<FaMoneyBillWave />}
            colorTheme="orange"
          />
          <StatsCard
            title="Your Orders"
            value={totalOrdersCount}
            icon={<FaShoppingBag />}
            colorTheme="purple"
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left Panel - Order Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Tab Navigation */}
            <div className="flex space-x-2">
              <Button3D
                variant="tab"
                active={activeTab === 'newOrder'}
                onClick={handleNewOrderClick}
                className="flex-1"
              >
                🛒 New Order
              </Button3D>
              <Button3D
                variant="tab"
                active={activeTab === 'massOrder'}
                onClick={() => setActiveTab('massOrder')}
                className="flex-1"
              >
                📦 Mass Order
              </Button3D>
            </div>

            {/* Order Form */}
            <AnimatePresence mode="wait">
              {activeTab === 'massOrder' && (
                <motion.div
                  key="massOrder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="
                    p-4 md:p-6 rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-slate-900/80
                    border border-white/20 dark:border-slate-700/50 shadow-xl dark:shadow-2xl dark:shadow-purple-500/20
                  "
                >
                  <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-purple-500/5 dark:to-blue-500/5 opacity-0 dark:opacity-100 rounded-2xl" />
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white dark:drop-shadow-lg mb-2">
                      One order per line in format
                    </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <motion.textarea
                        placeholder="service_id | link | quantity"
                        value={orders}
                        onChange={(e) => {
                          setOrders(e.target.value);
                          parseOrders(e.target.value);
                        }}
                        className="
                          w-full h-48 md:h-56 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-slate-600
                          bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm font-mono text-sm
                          text-gray-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
                          focus:border-transparent transition-all duration-300
                          resize-none placeholder-gray-400 dark:placeholder-gray-500
                          dark:shadow-lg dark:shadow-purple-500/10
                        "
                        whileFocus={{ 
                          boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                          scale: 1.01 
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    </div>
                    
                    <Button3D
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={totalOrders === 0}
                      loading={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Processing...' : 'Submit'}
                    </Button3D>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Panel - Instructions */}
          <InstructionsPanel />
        </div>
      </div>
    </div>
  );
}