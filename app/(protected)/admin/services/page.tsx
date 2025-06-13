'use client';
import ServiceTable from '@/components/admin/services/serviceTable';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FaArrowUp,
  FaCheckCircle,
  FaCog,
  FaDownload,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaSpinner,
  FaSync,
  FaTimes,
} from 'react-icons/fa';

// Toast Component
const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

export default function page() {
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0,
    recentlyAdded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  useEffect(() => {
    const fetchServiceStats = async () => {
      try {
        const response = await fetch('/api/admin/services/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(
            data.data || {
              totalServices: 0,
              activeServices: 0,
              inactiveServices: 0,
              recentlyAdded: 0,
            }
          );
        }
      } catch (error) {
        console.error('Failed to fetch service stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceStats();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger search in ServiceTable component
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Refresh logic here
    showToast('Services refreshed successfully!', 'success');
    setLoading(false);
  };

  const handleExport = () => {
    showToast('Export started! Download will begin shortly.', 'info');
  };

  const serviceStats = [
    {
      title: 'Total Services',
      value: stats.totalServices,
      icon: <FaCog className="h-6 w-6" />,
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: <FaCheckCircle className="h-6 w-6" />,
      textColor: 'text-green-600',
    },
    {
      title: 'Inactive Services',
      value: stats.inactiveServices,
      icon: <FaShieldAlt className="h-6 w-6" />,
      textColor: 'text-red-600',
    },
    {
      title: 'Recently Added',
      value: stats.recentlyAdded,
      icon: <FaArrowUp className="h-6 w-6" />,
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="page-container">
      {/* Toast Container */}
      <div className="toast-container">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <div className="page-content">
        {/* Page Header */}
        <div className="page-header mb-6">
          <div>
            <h1 className="page-title">Services Management</h1>
            <p className="page-description mb-4">
              Monitor, manage, and configure all your platform services from one
              centralized location
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center gap-2"
              disabled={loading}
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaDownload />
              Export
            </button>
            <Link
              href="/admin/services/create-service"
              className="btn btn-primary flex items-center gap-2"
            >
              <FaPlus />
              Create Service
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {serviceStats.map((stat) => (
            <div key={stat.title} className="card card-padding">
              <div className="card-content">
                <div className="card-icon">{stat.icon}</div>
                <div>
                  <h3 className="card-title">{stat.title}</h3>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {loading ? (
                      <FaSpinner className="h-5 w-5 animate-spin" />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Buttons and Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Left: Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
              <span
                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  statusFilter === 'all'
                    ? 'bg-white/20'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {stats.totalServices}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'active'
                  ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Active
              <span
                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  statusFilter === 'active'
                    ? 'bg-white/20'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {stats.activeServices}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'inactive'
                  ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Inactive
              <span
                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  statusFilter === 'inactive'
                    ? 'bg-white/20'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {stats.inactiveServices}
              </span>
            </button>
          </div>

          {/* Right: Search Bar with Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:min-w-[300px]">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-field pl-10 pr-4"
              />
            </div>
            <select className="form-select min-w-[120px]">
              <option value="id">Service ID</option>
              <option value="name">Service Name</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Services Table with new card style */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            <div className="flex items-center gap-2 flex-1">
              <div className="card-icon">
                <FaCog />
              </div>
              <h3 className="card-title">
                Services List ({stats.totalServices})
              </h3>
              <span className="ml-auto bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium">
                Manage Services
              </span>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            <ServiceTable searchTerm={searchTerm} statusFilter={statusFilter} />
          </div>
        </div>
      </div>
    </div>
  );
}
