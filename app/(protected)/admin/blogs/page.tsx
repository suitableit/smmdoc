'use client';

import { useRouter } from 'next/navigation'; // Add router import
import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import {
    FaBan,
    FaCheckCircle,
    FaClock,
    FaComments,
    FaEdit,
    FaEllipsisH,
    FaEye,
    FaHeart,
    FaNewspaper,
    FaPlus,
    FaSearch,
    FaSync,
    FaTimes,
    FaTrash
} from 'react-icons/fa';

// Import APP_NAME constant
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatID, formatNumber } from '@/lib/utils';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

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

// Define interfaces for type safety
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
  tags: string[];
  status: 'published' | 'draft';
  featuredImage?: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readTime: number; // in minutes
  seoTitle?: string;
  seoDescription?: string;
}

interface BlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageReadTime: number;
  topCategories: number;
  todayViews: number;
  thisMonthPosts: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Dummy data for blog posts




const BlogsPage = () => {
  const { appName } = useAppNameWithFallback();

  const router = useRouter(); // Add router hook

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Blogs', appName);
  }, [appName]);

  // State management
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    averageReadTime: 0,
    topCategories: 0,
    todayViews: 0,
    thisMonthPosts: 0,
  });

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 8,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(false);
  const [blogsLoading, setBlogsLoading] = useState(false);

  // New state for action modals
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    blogId: number;
    blogTitle: string;
  }>({
    open: false,
    blogId: 0,
    blogTitle: '',
  });

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    blogId: number;
    currentStatus: string;
  }>({
    open: false,
    blogId: 0,
    currentStatus: '',
  });
  const [newStatus, setNewStatus] = useState('');




  const [selectedBulkAction, setSelectedBulkAction] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Calculate status counts from current blogs data
  const calculateStatusCounts = (blogsData: BlogPost[] | undefined | null) => {
    const counts = {
      published: 0,
      draft: 0,
    };

    if (!Array.isArray(blogsData)) {
      return counts;
    }

    blogsData.forEach((blog) => {
      if (blog.status && counts.hasOwnProperty(blog.status)) {
        counts[blog.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  // Fetch all blogs to calculate real status counts
  const fetchAllBlogsForCounts = async () => {
    try {
      console.log('Fetching all blogs for status counts from API...');
      
      const response = await fetch('/api/blogs?limit=1000'); // Get all blogs for counting
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch blogs for counts');
      }

      const allBlogs = result.data?.posts || [];
      const statusCounts = calculateStatusCounts(allBlogs);

      console.log('Calculated status counts from API:', statusCounts);

      setStats((prev) => ({
        ...prev,
        publishedBlogs: statusCounts.published,
        draftBlogs: statusCounts.draft,
        totalBlogs: allBlogs.length,
      }));
    } catch (error) {
      console.error('Error fetching blogs for counts:', error);
      
      // Set empty state on error
      setStats((prev) => ({
        ...prev,
        publishedBlogs: 0,
        draftBlogs: 0,
        totalBlogs: 0,
      }));
    }
  };

  const fetchBlogs = async () => {
    try {
      setBlogsLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/blogs?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch blogs');
      }

      console.log('Blogs fetched successfully from API');

      setBlogs(result.data?.posts || []);
      setPagination(prev => ({
        ...prev,
        total: result.data?.pagination?.totalCount || 0,
        totalPages: result.data?.pagination?.totalPages || 0,
        hasNext: result.data?.pagination?.hasNext || false,
        hasPrev: result.data?.pagination?.hasPrev || false,
      }));
    } catch (error) {
      console.error('Error fetching blogs:', error);
      showToast('Error fetching blogs. Please try again.', 'error');
      
      // Set empty state on error
      setBlogs([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      }));
    } finally {
      setBlogsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Loading stats from API...');

      const response = await fetch('/api/blogs/stats');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch stats');
      }

      console.log('Stats loaded successfully:', result.data);

      setStats(result.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      
      // Set empty stats on error
      setStats({
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        averageReadTime: 0,
        topCategories: 0,
        todayViews: 0,
        thisMonthPosts: 0,
      });
      showToast('Error fetching statistics. Please try again.', 'error');
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchBlogs();
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    setStatsLoading(true);

    const loadData = async () => {
      await Promise.all([fetchStats(), fetchAllBlogsForCounts()]);
      setStatsLoading(false);
    };

    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen !== null) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setDropdownOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Update stats when pagination data changes
  useEffect(() => {
    if (pagination.total > 0) {
      setStats((prev) => ({
        ...prev,
        totalBlogs: pagination.total,
      }));
    }
  }, [pagination.total]);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Navigation handler for new blog post
  const handleNewBlogPost = () => {
    router.push('blogs/new-post');
  };

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <FaCheckCircle className="h-3 w-3 text-green-500" />;
      case 'draft':
        return <FaEdit className="h-3 w-3 text-gray-500" />;
      default:
        return <FaClock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectAll = () => {
    const selectableBlogs = Array.isArray(blogs) ? blogs : [];

    const selectableIds = selectableBlogs.map((blog) => 
      blog.id.toString()
    );

    if (
      selectedBlogs.length === selectableIds.length &&
      selectableIds.length > 0
    ) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(selectableIds);
    }
  };

  const handleSelectBlog = (blogId: string) => {
    setSelectedBlogs((prev) =>
      prev.includes(blogId)
        ? prev.filter((id) => id !== blogId)
        : [...prev, blogId]
    );
  };

  const handleRefresh = async () => {
    setBlogsLoading(true);
    setStatsLoading(true);

    try {
      await Promise.all([
        fetchBlogs(),
        fetchStats(),
        fetchAllBlogsForCounts(),
      ]);
      showToast('Blog data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showToast('Error refreshing data. Please try again.', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle blog deletion
  const handleDeleteBlog = async (blogId: number) => {
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete blog');
      }

      showToast('Blog deleted successfully', 'success');
      await Promise.all([
        fetchBlogs(),
        fetchStats(),
        fetchAllBlogsForCounts(),
      ]);
      setDeleteDialog({ open: false, blogId: 0, blogTitle: '' });
    } catch (error) {
      console.error('Error deleting blog:', error);
      showToast(
        error instanceof Error ? error.message : 'Error deleting blog',
        'error'
      );
    }
  };

  // Handle status change
  const handleStatusChange = async (
    blogId: number,
    status: string
  ) => {
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      showToast('Blog status updated successfully', 'success');
      await Promise.all([
        fetchBlogs(),
        fetchStats(),
        fetchAllBlogsForCounts(),
      ]);
      setStatusDialog({ open: false, blogId: 0, currentStatus: '' });
      setNewStatus('');

    } catch (error) {
      console.error('Error updating status:', error);
      showToast(
        error instanceof Error ? error.message : 'Error updating status',
        'error'
      );
    }
  };

  // Open delete dialog
  const openDeleteDialog = (blogId: number, blogTitle: string) => {
    setDeleteDialog({ open: true, blogId, blogTitle });
  };

  // Open status dialog
  const openStatusDialog = (blogId: number, currentStatus: string) => {
    setStatusDialog({ open: true, blogId, currentStatus });
    setNewStatus(currentStatus);
    setStatusReason('');
  };

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
        {/* Controls Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Left: Action Buttons */}
            <div className="flex flex-wrap w-full md:w-auto items-center gap-2">
              <select
                value={pagination.limit}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    limit:
                      e.target.value === 'all'
                        ? 1000
                        : parseInt(e.target.value),
                    page: 1,
                  }))
                }
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={blogsLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync
                  className={
                    blogsLoading || statsLoading ? 'animate-spin' : ''
                  }
                />
                Refresh
              </button>

              <button
                onClick={handleNewBlogPost}
                className="btn btn-primary flex items-center gap-2 w-full md:w-auto px-3 py-2.5"
              >
                <FaPlus />
                New Blog Post
              </button>
            </div>

            {/* Right: Search Controls */}
            <div className="flex flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${
                    statusFilter === 'all' ? 'all' : statusFilter
                  } blogs...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="tags">Tags</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {/* Filter Buttons */}
            <div className="mb-4">
              <div className="block space-y-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
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
                    {stats.totalBlogs}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'published'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Published
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'published'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {stats.publishedBlogs}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'draft'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Draft
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'draft'
                        ? 'bg-white/20'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {stats.draftBlogs}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {/* Bulk Action Section */}
            {selectedBlogs.length > 0 && (
              <div className="flex flex-wrap md:flex-nowrap items-start gap-2">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {selectedBlogs.length} selected
                  </span>
                  <select
                    className="w-full md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
                    value={selectedBulkAction}
                    onChange={(e) => {
                      setSelectedBulkAction(e.target.value);
                    }}
                  >
                    <option value="" disabled>
                      Bulk Actions
                    </option>
                    <option value="publish">Publish Selected</option>
                    <option value="draft">Move to Draft</option>
                    <option value="archive">Archive Selected</option>
                    <option value="delete">Delete Selected</option>
                  </select>
                </div>

                {selectedBulkAction && (
                  <button
                    onClick={() => {
                      if (selectedBulkAction === 'publish') {
                        console.log('Bulk publish selected:', selectedBlogs);
                        showToast(
                          `Publishing ${selectedBlogs.length} selected blogs...`,
                          'info'
                        );
                      } else if (selectedBulkAction === 'draft') {
                        console.log('Bulk draft selected:', selectedBlogs);
                        showToast(
                          `Moving ${selectedBlogs.length} selected blogs to draft...`,
                          'info'
                        );
                      } else if (selectedBulkAction === 'archive') {
                        console.log('Bulk archive selected:', selectedBlogs);
                        showToast(
                          `Archiving ${selectedBlogs.length} selected blogs...`,
                          'info'
                        );
                      } else if (selectedBulkAction === 'delete') {
                        console.log('Bulk delete selected:', selectedBlogs);
                        showToast(
                          `Deleting ${selectedBlogs.length} selected blogs...`,
                          'info'
                        );
                      }
                      // Reset after action
                      setSelectedBulkAction('');
                      setSelectedBlogs([]);
                    }}
                    className="btn btn-primary px-3 py-2.5 w-full md:w-auto"
                  >
                    Apply Action
                  </button>
                )}
              </div>
            )}

            {blogsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading blogs...
                  </div>
                </div>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <FaNewspaper
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No blogs found.
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No blogs match your current filters or no blogs exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[1400px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedBlogs.length === blogs.length &&
                              blogs.length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          ID
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Title
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Author
                        </th>


                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Published
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Status
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(blogs) ? blogs.map((blog) => (
                        <tr
                          key={blog.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedBlogs.includes(
                                blog.id.toString()
                              )}
                              onChange={() =>
                                handleSelectBlog(blog.id.toString())
                              }
                              className="rounded border-gray-300 w-4 h-4"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                              {formatID(blog.id.toString())}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="max-w-xs">
                              <div
                                className="font-medium text-sm truncate"
                                style={{ color: 'var(--text-primary)' }}
                                title={blog.title}
                              >
                                {blog.title}
                              </div>
                              <div
                                className="text-xs truncate mt-1"
                                style={{ color: 'var(--text-muted)' }}
                                title={blog.excerpt}
                              >
                                {blog.excerpt}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {blog.author?.username || 'unknown'}
                              </div>
                            </div>
                          </td>


                          <td className="p-3">
                            <div>
                              {blog.status === 'published' && blog.publishedAt && (
                                <>
                                  <div
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {formatDate(blog.publishedAt)}
                                  </div>
                                  <div
                                    className="text-xs"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    {formatTime(blog.publishedAt)}
                                  </div>
                                </>
                              )}
                              {blog.status === 'draft' && (
                                <div
                                  className="text-sm"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  Not published
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div 
                              className={`flex items-center gap-1 px-2 py-1 rounded-full w-fit text-xs font-medium ${getStatusColor(blog.status)}`}
                            >
                              <span className="capitalize">
                                {blog.status}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                className="btn btn-secondary p-2"
                                title="View Details"
                                onClick={() => {
                                  window.open(`/blogs/${blog.slug}`, '_blank');
                                }}
                              >
                                <FaEye className="h-3 w-3" />
                              </button>

                              <div className="relative">
                                <button
                                  className="btn btn-secondary p-2"
                                  title="More Actions"
                                  onClick={() => {
                                    setDropdownOpen(
                                      dropdownOpen === blog.id 
                                        ? null 
                                        : blog.id
                                    );
                                  }}
                                >
                                  <FaEllipsisH className="h-3 w-3" />
                                </button>

                                {dropdownOpen === blog.id && (
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                      onClick={() => {
                                        setDropdownOpen(null);
                                        router.push(`/admin/blogs/${blog.id}`);
                                      }}
                                    >
                                      <FaEdit className="h-3 w-3 text-blue-600" />
                                      Edit Blog
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                      onClick={() => {
                                        setDropdownOpen(null);
                                        openStatusDialog(blog.id, blog.status);
                                      }}
                                    >
                                      <FaCheckCircle className="h-3 w-3 text-green-600" />
                                      Change Status
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                      onClick={() => {
                                        setDropdownOpen(null);
                                        openDeleteDialog(blog.id, blog.title);
                                      }}
                                    >
                                      <FaTrash className="h-3 w-3" />
                                      Delete Blog
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            No blogs available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {blogsLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading pagination...</span>
                      </div>
                    ) : (
                      `Showing ${formatNumber(
                        (pagination.page - 1) * pagination.limit + 1
                      )} to ${formatNumber(
                        Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )
                      )} of ${formatNumber(pagination.total)} blogs`
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={!pagination.hasPrev || blogsLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {blogsLoading ? (
                        <GradientSpinner size="w-4 h-4" />
                      ) : (
                        `Page ${formatNumber(
                          pagination.page
                        )} of ${formatNumber(pagination.totalPages)}`
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={!pagination.hasNext || blogsLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Delete Dialog */}
                {deleteDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4 text-red-600">
                        Delete Blog
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to delete "{deleteDialog.blogTitle}"? 
                        This action cannot be undone.
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setDeleteDialog({
                              open: false,
                              blogId: 0,
                              blogTitle: '',
                            });
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(deleteDialog.blogId)}
                          className="btn bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete Blog
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Dialog */}
                {statusDialog.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Change Blog Status
                      </h3>
                      <div className="mb-4">
                        <label className="form-label mb-2">New Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setStatusDialog({ 
                              open: false, 
                              blogId: 0, 
                              currentStatus: '' 
                            });
                            setNewStatus('');

                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              statusDialog.blogId,
                              newStatus
                            )
                          }
                          className="btn btn-primary"
                          disabled={newStatus === statusDialog.currentStatus}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                )}


              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;