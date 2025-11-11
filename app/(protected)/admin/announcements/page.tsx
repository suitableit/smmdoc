'use client';

import React, { useEffect, useState } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaFilter,
  FaBullhorn,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaTimes,
  FaSave,
  FaChevronDown,
  FaChevronUp,
  FaSortAmountDown,
  FaSortAmountUp,
} from 'react-icons/fa';

import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';

const AnnouncementsSkeleton = () => {
  const cards = Array.from({ length: 5 });

  return (
    <div className="space-y-4">
      {cards.map((_, idx) => (
        <div key={idx} className="card card-padding">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 gradient-shimmer rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-64 gradient-shimmer rounded" />
                    <div className="h-5 w-16 gradient-shimmer rounded-full" />
                  </div>
                  <div className="h-4 w-full gradient-shimmer rounded mb-1" />
                  <div className="h-4 w-3/4 gradient-shimmer rounded mb-3" />
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="h-6 w-20 gradient-shimmer rounded-full" />
                    <div className="h-6 w-24 gradient-shimmer rounded-full" />
                    <div className="h-6 w-20 gradient-shimmer rounded-full" />
                  </div>
                  <div className="h-10 w-32 gradient-shimmer rounded mb-3" />
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-32 gradient-shimmer rounded" />
                    <div className="h-4 w-24 gradient-shimmer rounded" />
                    <div className="h-4 w-32 gradient-shimmer rounded" />
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 ml-4">
              <div className="h-8 w-8 gradient-shimmer rounded-lg" />
              <div className="h-8 w-8 gradient-shimmer rounded-lg" />
              <div className="h-8 w-8 gradient-shimmer rounded-lg" />
            </div>
          </div>
          <div className="flex md:hidden items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <div className="h-10 w-full gradient-shimmer rounded-lg" />
            <div className="h-10 w-full gradient-shimmer rounded-lg" />
            <div className="h-10 w-full gradient-shimmer rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

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

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  status: 'active' | 'scheduled' | 'expired' | 'draft';
  targetedAudience: 'all' | 'admins' | 'moderators';
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  views: number;
  isSticky: boolean;
  buttonEnabled: boolean;
  buttonText: string;
  buttonLink: string;
}

interface AnnouncementFormData {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  targetedAudience: 'all' | 'admins' | 'moderators';
  startDate: string;
  endDate: string;
  isSticky: boolean;
  buttonEnabled: boolean;
  buttonText: string;
  buttonLink: string;
}

const AnnouncementsPage = () => {
  const { appName } = useAppNameWithFallback();

  useEffect(() => {
    setPageTitle('Announcements', appName);
  }, [appName]);

  const dummyAnnouncements: Announcement[] = [
    {
      id: 'ann_001',
      title: 'System Maintenance Scheduled',
      content: 'We will be performing scheduled maintenance on Sunday, January 28th from 2:00 AM to 6:00 AM EST. During this time, the platform may be temporarily unavailable. We apologize for any inconvenience.',
      type: 'warning',
      status: 'active',
      targetedAudience: 'all',
      startDate: '2024-01-26T10:00:00Z',
      endDate: '2024-01-29T06:00:00Z',
      createdAt: '2024-01-25T14:30:00Z',
      updatedAt: '2024-01-25T14:30:00Z',
      createdBy: 'Admin Team',
      views: 1247,
      isSticky: true,
      buttonEnabled: true,
      buttonText: 'View Maintenance Details',
      buttonLink: '/maintenance-schedule',
    },
    {
      id: 'ann_002',
      title: 'New Feature Release: Advanced Analytics',
      content: 'We\'re excited to announce the release of our new Advanced Analytics dashboard! Get deeper insights into your data with enhanced reporting, custom metrics, and real-time visualizations.',
      type: 'success',
      status: 'active',
      targetedAudience: 'all',
      startDate: '2024-01-20T09:00:00Z',
      endDate: null,
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-22T11:15:00Z',
      createdBy: 'Product Team',
      views: 856,
      isSticky: false,
      buttonEnabled: true,
      buttonText: 'Try New Features',
      buttonLink: '/analytics',
    },
    {
      id: 'ann_003',
      title: 'Security Update Required',
      content: 'All users are required to update their passwords by February 1st, 2024. This is part of our ongoing security enhancement initiative to protect your account.',
      type: 'critical',
      status: 'active',
      targetedAudience: 'all',
      startDate: '2024-01-15T08:00:00Z',
      endDate: '2024-02-01T23:59:59Z',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      createdBy: 'Security Team',
      views: 2103,
      isSticky: true,
      buttonEnabled: true,
      buttonText: 'Update Password',
      buttonLink: '/account/password',
    },
    {
      id: 'ann_004',
      title: 'Holiday Office Hours',
      content: 'Our support team will have modified hours during the holiday season. From December 23rd to January 2nd, support will be available Monday-Friday, 9 AM to 5 PM EST.',
      type: 'info',
      status: 'expired',
      targetedAudience: 'all',
      startDate: '2023-12-20T10:00:00Z',
      endDate: '2024-01-03T17:00:00Z',
      createdAt: '2023-12-18T16:00:00Z',
      updatedAt: '2023-12-18T16:00:00Z',
      createdBy: 'HR Team',
      views: 432,
      isSticky: false,
      buttonEnabled: false,
      buttonText: '',
      buttonLink: '',
    },
    {
      id: 'ann_005',
      title: 'Upcoming Webinar: Best Practices',
      content: 'Join us for an exclusive webinar on February 15th at 2 PM EST where we\'ll discuss best practices for platform optimization and advanced usage tips.',
      type: 'info',
      status: 'scheduled',
      targetedAudience: 'all',
      startDate: '2024-02-10T10:00:00Z',
      endDate: '2024-02-16T17:00:00Z',
      createdAt: '2024-01-28T12:00:00Z',
      updatedAt: '2024-01-28T12:00:00Z',
      createdBy: 'Marketing Team',
      views: 0,
      isSticky: false,
      buttonEnabled: true,
      buttonText: 'Register Now',
      buttonLink: '/webinar-registration',
    },
  ];

  const [announcements, setAnnouncements] = useState<Announcement[]>(dummyAnnouncements);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>(dummyAnnouncements);
  const [isLoading, setIsLoading] = useState(false);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    type: 'info',
    targetedAudience: 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isSticky: false,
    buttonEnabled: false,
    buttonText: '',
    buttonLink: '',
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncementsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = announcements.filter(announcement => {
      const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
      const matchesType = typeFilter === 'all' || announcement.type === typeFilter;
      const matchesAudience = audienceFilter === 'all' || announcement.targetedAudience === audienceFilter;

      return matchesSearch && matchesStatus && matchesType && matchesAudience;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const stickyFiltered = filtered.filter(ann => ann.isSticky);
    const nonStickyFiltered = filtered.filter(ann => !ann.isSticky);

    setFilteredAnnouncements([...stickyFiltered, ...nonStickyFiltered]);
  }, [announcements, searchTerm, statusFilter, typeFilter, audienceFilter, sortBy, sortOrder]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      targetedAudience: 'all',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isSticky: false,
      buttonEnabled: false,
      buttonText: '',
      buttonLink: '',
    });
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAnnouncement: Announcement = {
        id: `ann_${Date.now()}`,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        status: new Date(formData.startDate) <= new Date() ? 'active' : 'scheduled',
        targetedAudience: formData.targetedAudience,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        views: 0,
        isSticky: formData.isSticky,
        buttonEnabled: formData.buttonEnabled,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
      };

      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setShowCreateModal(false);
      resetForm();
      showToast('Announcement created successfully!', 'success');
    } catch (error) {
      showToast('Error creating announcement', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAnnouncement = async () => {
    if (!editingAnnouncement || !formData.title.trim() || !formData.content.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnnouncements(prev => prev.map(ann => 
        ann.id === editingAnnouncement.id 
          ? {
              ...ann,
              title: formData.title,
              content: formData.content,
              type: formData.type,
              targetedAudience: formData.targetedAudience,
              startDate: formData.startDate,
              endDate: formData.endDate || null,
              updatedAt: new Date().toISOString(),
              isSticky: formData.isSticky,
              buttonEnabled: formData.buttonEnabled,
              buttonText: formData.buttonText,
              buttonLink: formData.buttonLink,
            }
          : ann
      ));

      setEditingAnnouncement(null);
      resetForm();
      showToast('Announcement updated successfully!', 'success');
    } catch (error) {
      showToast('Error updating announcement', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
      setShowDeleteConfirm(null);
      showToast('Announcement deleted successfully!', 'success');
    } catch (error) {
      showToast('Error deleting announcement', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';

    try {
      setAnnouncements(prev => prev.map(ann => 
        ann.id === id 
          ? { ...ann, status: newStatus as any, updatedAt: new Date().toISOString() }
          : ann
      ));

      showToast(`Announcement ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
    } catch (error) {
      showToast('Error updating announcement status', 'error');
    }
  };

  const startEditing = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      targetedAudience: announcement.targetedAudience,
      startDate: announcement.startDate.split('T')[0],
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
      isSticky: announcement.isSticky,
      buttonEnabled: announcement.buttonEnabled,
      buttonText: announcement.buttonText,
      buttonLink: announcement.buttonLink,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <FaExclamationTriangle className="h-4 w-4" />;
      case 'success': return <FaCheckCircle className="h-4 w-4" />;
      case 'critical': return <FaExclamationTriangle className="h-4 w-4" />;
      default: return <FaInfoCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'success': return 'text-green-600 bg-green-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'scheduled': return 'text-blue-700 bg-blue-100';
      case 'expired': return 'text-gray-700 bg-gray-100';
      default: return 'text-yellow-700 bg-yellow-100';
    }
  };

  return (
    <div className="page-container">
      {}
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
        {}
        <div className="mb-6">
          <div className="flex items-center justify-start">
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="btn btn-primary flex items-center gap-2 px-4 py-2.5"
            >
              <FaPlus className="h-4 w-4" />
              Create Announcement
            </button>
          </div>
        </div>

        {}
        <div className="card card-padding mb-6">
          {}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {}
            <div className="min-w-0">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search announcements..."
                  className="form-field w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            {}
            <div className="min-w-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {}
            <div className="min-w-0">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {}
            <div className="min-w-0">
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all">All Audiences</option>
                <option value="admins">Admins</option>
                <option value="moderators">Moderators</option>
              </select>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-4">
          {announcementsLoading ? (
            <div className="min-h-[600px]">
              <AnnouncementsSkeleton />
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="card card-padding text-center py-12">
              <FaBullhorn className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-600 mb-4">
                {announcements.length === 0 
                  ? "You haven't created any announcements yet."
                  : "No announcements match your current filters."
                }
              </p>
              {announcements.length === 0 && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="btn btn-primary"
                >
                  Create Your First Announcement
                </button>
              )}
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className={`card card-padding ${announcement.isSticky ? 'ring-2 ring-blue-200' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(announcement.type)}`}>
                        {getTypeIcon(announcement.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {announcement.title}
                          </h3>
                          {announcement.isSticky && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Pinned
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {announcement.content}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(announcement.status)}`}>
                            {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1">
                            <FaUsers className="h-3 w-3" />
                            {announcement.targetedAudience === 'all' ? 'All Users' : 
                             announcement.targetedAudience.charAt(0).toUpperCase() + announcement.targetedAudience.slice(1)}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1">
                            <FaEye className="h-3 w-3" />
                            {announcement.views} views
                          </span>
                        </div>

                        {announcement.buttonEnabled && announcement.buttonText && (
                          <div className="mb-3">
                            <a
                              href={announcement.buttonLink}
                              className="btn btn-primary text-sm px-4 py-2 inline-flex items-center gap-2"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {announcement.buttonText}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="h-3 w-3" />
                            Created {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                          <span>by {announcement.createdBy}</span>
                          {announcement.endDate && (
                            <span className="flex items-center gap-1">
                              <FaClock className="h-3 w-3" />
                              Expires {new Date(announcement.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(announcement.id, announcement.status)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.status === 'active' 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={announcement.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.status === 'active' ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => startEditing(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {}
                <div className="flex md:hidden items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleStatus(announcement.id, announcement.status)}
                    className={`p-2 rounded-lg transition-colors w-full justify-center flex items-center gap-2 text-sm ${
                      announcement.status === 'active' 
                        ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                        : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {announcement.status === 'active' ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                    <span>{announcement.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  <button
                    onClick={() => startEditing(announcement)}
                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors w-full justify-center flex items-center gap-2 text-sm"
                  >
                    <FaEdit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(announcement.id)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors w-full justify-center flex items-center gap-2 text-sm"
                  >
                    <FaTrash className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {}
      {(showCreateModal || editingAnnouncement) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAnnouncement(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter announcement title..."
                  />
                </div>

                <div>
                  <label className="form-label mb-2">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                    placeholder="Enter announcement content..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label mb-2">Targeted Audience</label>
                    <select
                      value={formData.targetedAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetedAudience: e.target.value as any }))}
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="all">All Users</option>
                      <option value="admins">Admins</option>
                      <option value="moderators">Moderators</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="form-label mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.buttonEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonEnabled: e.target.checked }))}
                      className="form-checkbox"
                    />
                    <span className="form-label">Enable Action Button</span>
                  </label>

                  {formData.buttonEnabled && (
                    <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                      <div>
                        <label className="form-label mb-2">Button Text *</label>
                        <input
                          type="text"
                          value={formData.buttonText}
                          onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="e.g., Learn More, Get Started, Download"
                        />
                      </div>

                      <div>
                        <label className="form-label mb-2">Button Link *</label>
                        <input
                          type="url"
                          value={formData.buttonLink}
                          onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="https://example.com or /internal-page"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isSticky}
                      onChange={(e) => setFormData(prev => ({ ...prev, isSticky: e.target.checked }))}
                      className="form-checkbox"
                    />
                    <span className="form-label">Pin this announcement</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Pinned announcements will appear at the top of the list
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAnnouncement(null);
                    resetForm();
                  }}
                  className="btn btn-secondary px-4 py-2"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={editingAnnouncement ? handleEditAnnouncement : handleCreateAnnouncement}
                  className="btn btn-primary flex items-center gap-2 px-4 py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaSave className="h-4 w-4" />
                  )}
                  {isLoading ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FaTrash className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Delete Announcement</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this announcement? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn btn-secondary px-4 py-2"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAnnouncement(showDeleteConfirm)}
                  className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaTrash className="h-4 w-4" />
                  )}
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;