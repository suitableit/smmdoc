'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  FaChartLine,
  FaDollarSign,
  FaShoppingCart,
  FaCalendar,
  FaCog,
} from 'react-icons/fa';

// Simple trending icons as components since they might not be available
const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Generate SMM Panel dummy data
const generateSMMData = (year: number) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const baseOrderCounts = [850, 920, 1150, 1320, 1280, 1450, 1680, 1520, 1380, 1600, 1750, 1920];
  const baseProfits = [12500, 13800, 17250, 19800, 19200, 21750, 25200, 22800, 20700, 24000, 26250, 28800];
  const basePayments = [85000, 92000, 115000, 132000, 128000, 145000, 168000, 152000, 138000, 160000, 175000, 192000];

  return months.map((month, index) => {
    // Add some year-based variation
    const yearMultiplier = year === 2024 ? 1 : year === 2023 ? 0.8 : 0.6;
    const randomVariation = 0.9 + Math.random() * 0.2; // ±10% variation

    return {
      month,
      orders: Math.round(baseOrderCounts[index] * yearMultiplier * randomVariation),
      profit: Math.round(baseProfits[index] * yearMultiplier * randomVariation),
      payments: Math.round(basePayments[index] * yearMultiplier * randomVariation),
      // Additional metrics for detailed view
      instagramOrders: Math.round(baseOrderCounts[index] * 0.35 * yearMultiplier * randomVariation),
      facebookOrders: Math.round(baseOrderCounts[index] * 0.25 * yearMultiplier * randomVariation),
      youtubeOrders: Math.round(baseOrderCounts[index] * 0.20 * yearMultiplier * randomVariation),
      tiktokOrders: Math.round(baseOrderCounts[index] * 0.15 * yearMultiplier * randomVariation),
      twitterOrders: Math.round(baseOrderCounts[index] * 0.05 * yearMultiplier * randomVariation),
    };
  });
};

type AnalyticsData = {
  month: string;
  orders: number;
  profit: number;
  payments: number;
  instagramOrders: number;
  facebookOrders: number;
  youtubeOrders: number;
  tiktokOrders: number;
  twitterOrders: number;
};

// Custom Chart Component
const CustomChart = ({ data, activeTab, maxValue }: {
  data: AnalyticsData[];
  activeTab: string;
  maxValue: number;
}) => {
  const formatValue = (value: number) => {
    if (activeTab === 'orders') {
      return value.toLocaleString();
    }
    return `৳${value.toFixed(0)}`;
  };

  const getBarColor = () => {
    switch (activeTab) {
      case 'profit': return 'bg-gradient-to-t from-green-400 to-green-500';
      case 'payments': return 'bg-gradient-to-t from-blue-400 to-blue-500';
      case 'orders': return 'bg-gradient-to-t from-purple-400 to-purple-500';
      default: return 'bg-gradient-to-t from-blue-400 to-blue-500';
    }
  };

  return (
    <div className="relative h-80 bg-gray-50 rounded-lg p-4">
      {/* Chart Grid */}
      <div className="absolute inset-4 flex flex-col justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="border-t border-gray-200 border-dashed w-full"></div>
        ))}
      </div>

      {/* Y-Axis Labels */}
      <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-600">
        {[0, 1, 2, 3, 4].map((i) => {
          const value = maxValue - (i * maxValue / 4);
          return (
            <div key={i} className="text-right pr-2">
              {formatValue(value)}
            </div>
          );
        })}
      </div>

      {/* Chart Bars */}
      <div className="absolute left-12 right-4 bottom-8 top-4 flex items-end justify-between gap-1">
        {data.map((item, index) => {
          const value = activeTab === 'profit' ? item.profit :
                      activeTab === 'payments' ? item.payments :
                      item.orders;
          const height = (value / maxValue) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                {item.month}: {activeTab === 'orders' ? value.toLocaleString() : formatValue(value)}
              </div>
              
              {/* Bar */}
              <div 
                className={`w-full ${getBarColor()} rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer`}
                style={{ height: `${height}%` }}
              ></div>
            </div>
          );
        })}
      </div>

      {/* X-Axis Labels */}
      <div className="absolute left-12 right-4 bottom-0 flex justify-between text-xs text-gray-600">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            {item.month}
          </div>
        ))}
      </div>
    </div>
  );
};

// Platform Chart Component
const PlatformChart = ({ data, totalOrders }: { data: AnalyticsData[]; totalOrders: number }) => {
  const platforms = [
    { name: 'Instagram', key: 'instagramOrders', color: 'bg-pink-500' },
    { name: 'Facebook', key: 'facebookOrders', color: 'bg-blue-600' },
    { name: 'YouTube', key: 'youtubeOrders', color: 'bg-red-500' },
    { name: 'TikTok', key: 'tiktokOrders', color: 'bg-gray-900' },
    { name: 'Twitter', key: 'twitterOrders', color: 'bg-cyan-500' },
  ];

  const maxValue = Math.max(...data.map(item => 
    platforms.reduce((sum, platform) => sum + (item[platform.key as keyof AnalyticsData] as number), 0)
  ));

  return (
    <div className="relative h-64 bg-gray-50 rounded-lg p-4">
      {/* Chart Grid */}
      <div className="absolute inset-4 flex flex-col justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="border-t border-gray-200 border-dashed w-full"></div>
        ))}
      </div>

      {/* Y-Axis Labels */}
      <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-600">
        {[0, 1, 2, 3, 4].map((i) => {
          const value = maxValue - (i * maxValue / 4);
          return (
            <div key={i} className="text-right pr-2">
              {Math.round(value).toLocaleString()}
            </div>
          );
        })}
      </div>

      {/* Stacked Bars */}
      <div className="absolute left-12 right-4 bottom-8 top-4 flex items-end justify-between gap-1">
        {data.map((item, index) => {
          
          return (
            <div key={index} className="flex flex-col justify-end items-center flex-1 group relative">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                {item.month}: {platforms.reduce((sum, platform) => sum + (item[platform.key as keyof AnalyticsData] as number), 0).toLocaleString()}
              </div>
              
              {/* Platform Bars */}
              <div className="w-full flex flex-col-reverse">
                {platforms.map((platform) => {
                  const value = item[platform.key as keyof AnalyticsData] as number;
                  const height = (value / maxValue) * 100;
                  
                  return (
                    <div 
                      key={platform.name}
                      className={`w-full ${platform.color} transition-all duration-300 hover:opacity-80`}
                      style={{ height: `${height}%` }}
                      title={`${platform.name}: ${value.toLocaleString()}`}
                    ></div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* X-Axis Labels */}
      <div className="absolute left-12 right-4 bottom-0 flex justify-between text-xs text-gray-600">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            {item.month}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  // Set document title
  useEffect(() => {
    document.title = `Analytics — SMM Panel`;
  }, []);

  const [activeTab, setActiveTab] = useState<'profit' | 'payments' | 'orders'>('profit');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  const availableYears = [2024, 2023, 2022];

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return `৳${amount.toFixed(2)}`;
  }, []);

  // Load analytics data
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setAnalyticsData(generateSMMData(selectedYear));
      setLoading(false);
    }, 1000);
  }, [selectedYear]);

  // Calculate totals and trends
  const calculateMetrics = () => {
    if (!analyticsData.length) return { total: 0, trend: 0, isPositive: true, maxValue: 0 };

    const currentData = analyticsData;
    const values = currentData.map(item => {
      switch (activeTab) {
        case 'profit': return item.profit;
        case 'payments': return item.payments;
        case 'orders': return item.orders;
        default: return 0;
      }
    });

    const total = values.reduce((sum, value) => sum + value, 0);
    const maxValue = Math.max(...values);

    // Calculate trend (comparing last 6 months vs first 6 months)
    const firstHalf = values.slice(0, 6).reduce((sum, value) => sum + value, 0);
    const secondHalf = values.slice(6, 12).reduce((sum, value) => sum + value, 0);

    const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
    
    return { total, trend, isPositive: trend >= 0, maxValue };
  };

  const metrics = calculateMetrics();

  // Tab component
  const TabButton = ({ 
    id, 
    label, 
    icon, 
    isActive, 
    onClick 
  }: { 
    id: string; 
    label: string; 
    icon: React.ReactNode; 
    isActive: boolean; 
    onClick: () => void; 
  }) => {
    const getGradientColors = () => {
      switch (id) {
        case 'profit': return isActive 
          ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
        case 'payments': return isActive 
          ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
        case 'orders': return isActive 
          ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
        default: return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
      }
    };

    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${getGradientColors()}`}
      >
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="mb-6">
        <div className="card card-padding">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="card-icon">
                <FaChartLine />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Track your SMM panel performance and growth</p>
              </div>
            </div>
            
            {/* Year Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className="form-field w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent shadow-sm text-gray-900 transition-all duration-200 appearance-none cursor-pointer flex items-center gap-2"
              >
                <FaCalendar className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{selectedYear}</span>
              </button>
              
              {isYearDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                        year === selectedYear ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      } ${year === availableYears[0] ? 'rounded-t-lg' : ''} ${
                        year === availableYears[availableYears.length - 1] ? 'rounded-b-lg' : ''
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Summary Stats */}
      <div className="mb-6">
        <div className="card card-padding">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            <TabButton
              id="profit"
              label="Profit from Orders"
              icon={<FaDollarSign />}
              isActive={activeTab === 'profit'}
              onClick={() => setActiveTab('profit')}
            />
            <TabButton
              id="payments"
              label="Earning from Payments"
              icon={<FaChartLine />}
              isActive={activeTab === 'payments'}
              onClick={() => setActiveTab('payments')}
            />
            <TabButton
              id="orders"
              label="Number of Orders"
              icon={<FaShoppingCart />}
              isActive={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 font-semibold">Total {selectedYear}</p>
                  {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-blue-700">
                      {activeTab === 'orders' 
                        ? metrics.total.toLocaleString()
                        : formatCurrency(metrics.total)
                      }
                    </p>
                  )}
                </div>
                <div className="text-blue-500 w-6 h-6">
                  {activeTab === 'profit' && <FaDollarSign className="w-6 h-6" />}
                  {activeTab === 'payments' && <FaChartLine className="w-6 h-6" />}
                  {activeTab === 'orders' && <FaShoppingCart className="w-6 h-6" />}
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-semibold">Growth Rate</p>
                  {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <p className={`text-2xl font-bold ${metrics.isPositive ? 'text-green-700' : 'text-red-700'}`}>
                      {Math.abs(metrics.trend).toFixed(1)}%
                    </p>
                  )}
                </div>
                <div className="text-green-500 w-6 h-6">
                  {metrics.isPositive ? (
                    <TrendingUpIcon className="w-6 h-6" />
                  ) : (
                    <TrendingDownIcon className="w-6 h-6" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 font-semibold">Monthly Average</p>
                  {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <GradientSpinner size="w-5 h-5" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-purple-700">
                      {activeTab === 'orders'
                        ? Math.round(metrics.total / 12).toLocaleString()
                        : formatCurrency(metrics.total / 12)
                      }
                    </p>
                  )}
                </div>
                <FaCog className="text-purple-500 w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="mb-4">
            <h3 className="card-title mb-4">
              {activeTab === 'profit' ? 'Monthly Profit Analysis' :
               activeTab === 'payments' ? 'Monthly Payment Revenue' :
               'Monthly Order Volume'}
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-4" />
                  <p className="text-gray-600">Loading analytics data...</p>
                </div>
              </div>
            ) : (
              <CustomChart
                data={analyticsData}
                activeTab={activeTab}
                maxValue={metrics.maxValue}
              />
            )}
          </div>
        </div>
      </div>

      {/* Additional Insights - Platform Breakdown (for Orders tab) */}
      {activeTab === 'orders' && !loading && (
        <div className="mb-6">
          <div className="card card-padding">
            <div className="card-header mb-4">
              <h3 className="card-title">Platform Breakdown</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Order distribution across platforms</p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[
                { name: 'Instagram', key: 'instagramOrders', color: 'bg-pink-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', textColor: 'text-pink-600', hoverColor: 'hover:bg-pink-100' },
                { name: 'Facebook', key: 'facebookOrders', color: 'bg-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-600', hoverColor: 'hover:bg-blue-100' },
                { name: 'YouTube', key: 'youtubeOrders', color: 'bg-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-600', hoverColor: 'hover:bg-red-100' },
                { name: 'TikTok', key: 'tiktokOrders', color: 'bg-gray-900', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', textColor: 'text-gray-600', hoverColor: 'hover:bg-gray-100' },
                { name: 'Twitter', key: 'twitterOrders', color: 'bg-cyan-500', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', textColor: 'text-cyan-600', hoverColor: 'hover:bg-cyan-100' },
              ].map((platform) => {
                const total = analyticsData.reduce((sum, item) => sum + (item[platform.key as keyof AnalyticsData] as number), 0);
                const percentage = metrics.total > 0 ? ((total / metrics.total) * 100).toFixed(1) : '0.0';
                
                return (
                  <div key={platform.name} className={`${platform.bgColor} border ${platform.borderColor} rounded-lg p-4 ${platform.hoverColor} transition-colors duration-200`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
                    <p className={`text-sm ${platform.textColor}`}>{percentage}% of total</p>
                  </div>
                );
              })}
            </div>

            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Monthly Platform Distribution</h4>
              <PlatformChart data={analyticsData} totalOrders={metrics.total} />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {[
                { name: 'Instagram', color: 'bg-pink-500' },
                { name: 'Facebook', color: 'bg-blue-600' },
                { name: 'YouTube', color: 'bg-red-500' },
                { name: 'TikTok', color: 'bg-gray-900' },
                { name: 'Twitter', color: 'bg-cyan-500' },
              ].map((platform) => (
                <div key={platform.name} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                  <span className="text-sm text-gray-600">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}