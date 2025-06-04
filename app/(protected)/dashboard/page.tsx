"use client";

import { useCurrentUser } from '@/hooks/use-current-user';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGetUserStatsQuery } from '@/lib/services/dashboardApi';
import { useRouter } from 'next/navigation';
import {
  FaUser,
  FaWallet,
  FaShoppingBag,
  FaDollarSign,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaTicketAlt,
  FaHistory,
  FaEye,
  FaCalendarAlt,
  FaPlus
} from "react-icons/fa";

export default function DashboardPage() {
  const user = useCurrentUser();
  const { currency, rate: currencyRate } = useCurrency();
  const router = useRouter();

  // Fetch user stats from API
  const { data: userStatsResponse, error, isLoading } = useGetUserStatsQuery();
  const userStats = userStatsResponse?.data;

  // Get recent orders from user stats
  const userOrders = userStats?.recentOrders || [];

  // User data from API or fallback to 0
  const balance = userStats?.balance || 0;
  const totalSpend = userStats?.totalSpent || 0;
  const totalOrders = userStats?.totalOrders || 0;
  const pendingOrders = userStats?.ordersByStatus?.pending || 0;
  const completedOrders = userStats?.ordersByStatus?.completed || 0;
  const processingOrders = userStats?.ordersByStatus?.processing || 0;
  const cancelledOrders = userStats?.ordersByStatus?.cancelled || 0;

  // Format currency values consistently
  const formatCurrency = (amount: number) => {
    const convertedAmount = currency === 'BDT' ? amount : amount / (currencyRate || 121.52);
    const symbol = currency === 'USD' ? '$' : '৳';
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };

  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId) {
      router.push(`/dashboard/user/new-order?categoryId=${categoryId}`);
    } else {
      router.push('/dashboard/user/new-order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <FaCheckCircle className="w-4 h-4" />;
      case 'processing': return <FaClock className="w-4 h-4" />;
      case 'pending': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'cancelled': return <FaTimesCircle className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  return (
    <div className="px-8 py-8 bg-[#f1f2f6] dark:bg-[#232333]">
      <div className="page-content">


        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* User ID Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaUser />
              </div>
              <div>
                <h3 className="card-title">User ID</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>#{user?.id || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Username Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaUser />
              </div>
              <div>
                <h3 className="card-title">Username</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.username || user?.email?.split('@')[0] || "User"}</p>
              </div>
            </div>
          </div>

          {/* Name Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaUser />
              </div>
              <div>
                <h3 className="card-title">Full Name</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.name || "User"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Balance Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaWallet />
              </div>
              <div className="flex-1">
                <h3 className="card-title">Balance</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(balance)}</p>
              </div>
              <div className="ml-4">
                <button 
                  onClick={() => router.push('/dashboard/user/add-funds')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaShoppingBag />
              </div>
              <div>
                <h3 className="card-title">Total Orders</h3>
                <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
              </div>
            </div>
          </div>

          {/* Total Spend Card */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaDollarSign />
              </div>
              <div>
                <h3 className="card-title">Total Spend</h3>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalSpend)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="card card-padding mb-6">
          <div className="card-header mb-4">
            <div className="card-icon">
              <FaChartLine />
            </div>
            <h3 className="card-title">Statistics Overview</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Completed Orders */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-600 font-semibold">Completed</div>
                  <div className="text-2xl font-bold text-green-700">{completedOrders}</div>
                </div>
                <FaCheckCircle className="text-green-500 w-8 h-8" />
              </div>
            </div>
            
            {/* Processing Orders */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-600 font-semibold">Processing</div>
                  <div className="text-2xl font-bold text-blue-700">{processingOrders}</div>
                </div>
                <FaClock className="text-blue-500 w-8 h-8" />
              </div>
            </div>
            
            {/* Pending Orders */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-yellow-600 font-semibold">Pending</div>
                  <div className="text-2xl font-bold text-yellow-700">{pendingOrders}</div>
                </div>
                <FaExclamationTriangle className="text-yellow-500 w-8 h-8" />
              </div>
            </div>
            
            {/* Cancelled Orders */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-red-600 font-semibold">Cancelled</div>
                  <div className="text-2xl font-bold text-red-700">{cancelledOrders}</div>
                </div>
                <FaTimesCircle className="text-red-500 w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Support Tickets Section */}
        <div className="card card-padding mb-6">
          <div className="card-header mb-4">
            <div className="card-icon">
              <FaTicketAlt />
            </div>
            <h3 className="card-title">Support Tickets</h3>
            <div className="ml-auto">
              <button className="btn btn-secondary flex items-center gap-2">
                <FaEye className="w-4 h-4" />
                View All
              </button>
            </div>
          </div>
          
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <FaTicketAlt className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            <div className="text-lg font-medium mb-2">No support tickets found</div>
            <div className="text-sm">You haven't created any support tickets yet.</div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="card card-padding">
          <div className="card-header mb-4">
            <div className="card-icon">
              <FaHistory />
            </div>
            <h3 className="card-title">Recent Orders</h3>
            <div className="ml-auto">
              <button 
                onClick={() => router.push('/dashboard/user/my-orders')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <FaEye className="w-4 h-4" />
                View All Orders
              </button>
            </div>
          </div>
          
          {userOrders.length > 0 ? (
            <div className="space-y-3">
              {userOrders.map((order: any) => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.service?.name || 'Service'}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          Order #{order.id.slice(-8)} • {formatCurrency(order.bdtPrice || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <div className="text-xs mt-1 flex items-center" style={{ color: 'var(--text-muted)' }}>
                        <FaCalendarAlt className="inline mr-1 w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <FaShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
              <div className="text-lg font-medium mb-2">No orders found</div>
              <div className="text-sm mb-4">You haven't placed any orders yet.</div>
              <button 
                onClick={() => router.push('/dashboard/user/new-order')}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                <FaPlus className="w-4 h-4" />
                Create Your First Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}