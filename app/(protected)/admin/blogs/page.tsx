'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Add router import
import {
  FaBan,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaSearch,
  FaSync,
  FaTimes,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaPlus,
  FaNewspaper,
  FaCalendarAlt,
  FaUser,
  FaComments,
  FaHeart,
  FaTags,
  FaEllipsisH,
} from 'react-icons/fa';

// Import APP_NAME constant
import { APP_NAME } from '@/lib/constants';
import { formatID, formatNumber, formatPrice } from '@/lib/utils';

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
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: string[];
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  featuredImage?: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt?: string;
  scheduledAt?: string;
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
  scheduledBlogs: number;
  archivedBlogs: number;
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
const dummyBlogs: BlogPost[] = [
  {
    id: 1001,
    title: "The Ultimate Guide to Social Media Marketing in 2024",
    slug: "ultimate-guide-social-media-marketing-2024",
    excerpt: "Discover the latest strategies and trends that will help you dominate social media marketing this year.",
    content: "Full blog content here...",
    author: {
      id: 101,
      name: "Sarah Johnson",
      username: "sarah_writes",
      avatar: "/avatars/sarah.jpg"
    },
    category: {
      id: 1,
      name: "Social Media",
      slug: "social-media"
    },
    tags: ["social media", "marketing", "2024", "strategy"],
    status: "published",
    featuredImage: "/blog/social-media-guide.jpg",
    views: 15420,
    likes: 892,
    comments: 156,
    publishedAt: "2024-06-15T10:30:00Z",
    createdAt: "2024-06-10T14:20:00Z",
    updatedAt: "2024-06-15T10:30:00Z",
    readTime: 8,
    seoTitle: "Ultimate Social Media Marketing Guide 2024 | Tips & Strategies",
    seoDescription: "Learn the best social media marketing strategies for 2024. Complete guide with tips, trends, and actionable insights."
  },
  {
    id: 1002,
    title: "Instagram Growth Hacks That Actually Work",
    slug: "instagram-growth-hacks-that-work",
    excerpt: "Proven techniques to grow your Instagram following organically and boost engagement rates.",
    content: "Full blog content here...",
    author: {
      id: 102,
      name: "Mike Chen",
      username: "mike_insta",
      avatar: "/avatars/mike.jpg"
    },
    category: {
      id: 2,
      name: "Instagram",
      slug: "instagram"
    },
    tags: ["instagram", "growth", "engagement", "followers"],
    status: "published",
    featuredImage: "/blog/instagram-growth.jpg",
    views: 12350,
    likes: 654,
    comments: 89,
    publishedAt: "2024-06-20T09:15:00Z",
    createdAt: "2024-06-18T11:45:00Z",
    updatedAt: "2024-06-20T09:15:00Z",
    readTime: 6,
    seoTitle: "Instagram Growth Hacks 2024 - Proven Strategies",
    seoDescription: "Discover effective Instagram growth hacks that actually work. Boost your followers and engagement organically."
  },
  {
    id: 1003,
    title: "TikTok Algorithm Secrets: How to Go Viral",
    slug: "tiktok-algorithm-secrets-go-viral",
    excerpt: "Uncover the mysteries of TikTok's algorithm and learn how to create content that goes viral.",
    content: "Full blog content here...",
    author: {
      id: 103,
      name: "Emma Rodriguez",
      username: "emma_tiktok",
      avatar: "/avatars/emma.jpg"
    },
    category: {
      id: 3,
      name: "TikTok",
      slug: "tiktok"
    },
    tags: ["tiktok", "algorithm", "viral", "content creation"],
    status: "draft",
    featuredImage: "/blog/tiktok-algorithm.jpg",
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: "2024-06-25T16:30:00Z",
    updatedAt: "2024-06-28T10:15:00Z",
    readTime: 7,
    seoTitle: "TikTok Algorithm Secrets - How to Go Viral in 2024",
    seoDescription: "Learn TikTok algorithm secrets and discover how to create viral content that reaches millions."
  },
  {
    id: 1004,
    title: "YouTube SEO: Optimize Your Videos for Maximum Reach",
    slug: "youtube-seo-optimize-videos-maximum-reach",
    excerpt: "Master YouTube SEO techniques to increase your video visibility and grow your channel faster.",
    content: "Full blog content here...",
    author: {
      id: 104,
      name: "David Kim",
      username: "david_youtube",
      avatar: "/avatars/david.jpg"
    },
    category: {
      id: 4,
      name: "YouTube",
      slug: "youtube"
    },
    tags: ["youtube", "seo", "optimization", "video marketing"],
    status: "scheduled",
    featuredImage: "/blog/youtube-seo.jpg",
    views: 0,
    likes: 0,
    comments: 0,
    scheduledAt: "2024-07-05T12:00:00Z",
    createdAt: "2024-06-22T13:20:00Z",
    updatedAt: "2024-06-30T09:45:00Z",
    readTime: 10,
    seoTitle: "YouTube SEO Guide 2024 - Optimize Videos for Growth",
    seoDescription: "Complete YouTube SEO guide to optimize your videos for maximum reach and channel growth."
  },
  {
    id: 1005,
    title: "Content Calendar Planning: A Step-by-Step Guide",
    slug: "content-calendar-planning-step-by-step-guide",
    excerpt: "Learn how to create and maintain an effective content calendar that keeps your audience engaged.",
    content: "Full blog content here...",
    author: {
      id: 105,
      name: "Lisa Anderson",
      username: "lisa_content",
      avatar: "/avatars/lisa.jpg"
    },
    category: {
      id: 5,
      name: "Content Strategy",
      slug: "content-strategy"
    },
    tags: ["content calendar", "planning", "strategy", "organization"],
    status: "published",
    featuredImage: "/blog/content-calendar.jpg",
    views: 8750,
    likes: 423,
    comments: 67,
    publishedAt: "2024-06-18T14:00:00Z",
    createdAt: "2024-06-15T10:30:00Z",
    updatedAt: "2024-06-18T14:00:00Z",
    readTime: 5,
    seoTitle: "Content Calendar Planning Guide - Step by Step Tutorial",
    seoDescription: "Learn how to create an effective content calendar. Step-by-step guide with templates and best practices."
  },
  {
    id: 1006,
    title: "Facebook Ads vs. Organic Reach: What Works Best?",
    slug: "facebook-ads-vs-organic-reach-what-works-best",
    excerpt: "Compare Facebook advertising strategies and discover when to use paid vs organic approaches.",
    content: "Full blog content here...",
    author: {
      id: 106,
      name: "James Wilson",
      username: "james_fb",
      avatar: "/avatars/james.jpg"
    },
    category: {
      id: 6,
      name: "Facebook",
      slug: "facebook"
    },
    tags: ["facebook", "advertising", "organic reach", "marketing"],
    status: "archived",
    featuredImage: "/blog/facebook-ads.jpg",
    views: 5430,
    likes: 187,
    comments: 34,
    publishedAt: "2024-05-10T11:20:00Z",
    createdAt: "2024-05-08T15:45:00Z",
    updatedAt: "2024-05-10T11:20:00Z",
    readTime: 9,
    seoTitle: "Facebook Ads vs Organic Reach - Complete Comparison",
    seoDescription: "Detailed comparison of Facebook ads vs organic reach. Learn which strategy works best for your business."
  },
  {
    id: 1007,
    title: "Building a Personal Brand on LinkedIn",
    slug: "building-personal-brand-linkedin",
    excerpt: "Transform your LinkedIn profile into a powerful personal branding tool that attracts opportunities.",
    content: "Full blog content here...",
    author: {
      id: 107,
      name: "Rachel Green",
      username: "rachel_linkedin",
      avatar: "/avatars/rachel.jpg"
    },
    category: {
      id: 7,
      name: "LinkedIn",
      slug: "linkedin"
    },
    tags: ["linkedin", "personal branding", "networking", "professional"],
    status: "published",
    featuredImage: "/blog/linkedin-branding.jpg",
    views: 9840,
    likes: 567,
    comments: 78,
    publishedAt: "2024-06-12T08:30:00Z",
    createdAt: "2024-06-09T12:15:00Z",
    updatedAt: "2024-06-12T08:30:00Z",
    readTime: 7,
    seoTitle: "Building a Personal Brand on LinkedIn - Complete Guide",
    seoDescription: "Learn how to build a powerful personal brand on LinkedIn. Tips for profile optimization and content strategy."
  },
  {
    id: 1008,
    title: "The Psychology of Social Media Engagement",
    slug: "psychology-social-media-engagement",
    excerpt: "Understand the psychological triggers that drive social media engagement and how to use them ethically.",
    content: "Full blog content here...",
    author: {
      id: 108,
      name: "Dr. Alex Thompson",
      username: "dr_alex",
      avatar: "/avatars/alex.jpg"
    },
    category: {
      id: 8,
      name: "Psychology",
      slug: "psychology"
    },
    tags: ["psychology", "engagement", "behavior", "social media"],
    status: "draft",
    featuredImage: "/blog/psychology-engagement.jpg",
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: "2024-06-28T17:20:00Z",
    updatedAt: "2024-07-01T14:30:00Z",
    readTime: 12,
    seoTitle: "Psychology of Social Media Engagement - Understanding User Behavior",
    seoDescription: "Discover the psychology behind social media engagement. Learn how to create content that resonates with your audience."
  }
];

const dummyStats: BlogStats = {
  totalBlogs: 8,
  publishedBlogs: 4,
  draftBlogs: 2,
  scheduledBlogs: 1,
  archivedBlogs: 1,
  totalViews: 51780,
  totalLikes: 2723,
  totalComments: 424,
  averageReadTime: 8,
  topCategories: 8,
  todayViews: 1250,
  thisMonthPosts: 5,
};

const BlogsPage = () => {
  const router = useRouter(); // Add router hook

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Blogs — ${APP_NAME}`;
  }, []);

  // State management
  const [blogs, setBlogs] = useState<BlogPost[]>(dummyBlogs);
  const [stats, setStats] = useState<BlogStats>(dummyStats);

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
  const [statusReason, setStatusReason] = useState('');

  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    blog: BlogPost | null;
  }>({
    open: false,
    blog: null,
  });

  const [selectedBulkAction, setSelectedBulkAction] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Calculate status counts from current blogs data
  const calculateStatusCounts = (blogsData: BlogPost[]) => {
    const counts = {
      published: 0,
      draft: 0,
      scheduled: 0,
      archived: 0,
    };

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
      console.log('Calculating status counts from dummy data...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const statusCounts = calculateStatusCounts(dummyBlogs);

      console.log('Calculated status counts:', statusCounts);

      setStats((prev) => ({
        ...prev,
        publishedBlogs: statusCounts.published,
        draftBlogs: statusCounts.draft,
        scheduledBlogs: statusCounts.scheduled,
        archivedBlogs: statusCounts.archived,
        totalBlogs: dummyBlogs.length,
      }));
    } catch (error) {
      console.error('Error calculating blog counts:', error);
    }
  };

  const fetchBlogs = async () => {
    try {
      setBlogsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter dummy data based on current filters
      let filteredBlogs = [...dummyBlogs];

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredBlogs = filteredBlogs.filter(
          blog => blog.status === statusFilter
        );
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredBlogs = filteredBlogs.filter(
          blog =>
            blog.title?.toLowerCase().includes(searchLower) ||
            blog.author.name?.toLowerCase().includes(searchLower) ||
            blog.category.name?.toLowerCase().includes(searchLower) ||
            blog.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

      console.log('Blogs fetched successfully with filters applied');

      setBlogs(paginatedBlogs);
      setPagination(prev => ({
        ...prev,
        total: filteredBlogs.length,
        totalPages: Math.ceil(filteredBlogs.length / pagination.limit),
        hasNext: endIndex < filteredBlogs.length,
        hasPrev: pagination.page > 1,
      }));
    } catch (error) {
      console.error('Error fetching blogs:', error);
      showToast('Error fetching blogs. Please try again.', 'error');
      setBlogs([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setBlogsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Loading stats from dummy data...');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('Stats loaded successfully:', dummyStats);

      setStats(dummyStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        scheduledBlogs: 0,
        archivedBlogs: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        averageReadTime: 0,
        topCategories: 0,
        todayViews: 0,
        thisMonthPosts: 0,
      });
      showToast('Error fetching statistics. Please refresh the page.', 'error');
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
      case 'scheduled':
        return <FaClock className="h-3 w-3 text-blue-500" />;
      case 'archived':
        return <FaBan className="h-3 w-3 text-red-500" />;
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
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'archived':
        return 'bg-red-100 text-red-700';
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
    const selectableBlogs = blogs.filter(
      (blog) => blog.status !== 'archived'
    );

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
    status: string,
    reason: string
  ) => {
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reason,
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
      setStatusReason('');
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

              <select className="w-full md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="category">Category</option>
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
                <button
                  onClick={() => setStatusFilter('scheduled')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'scheduled'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Scheduled
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'scheduled'
                        ? 'bg-white/20'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {stats.scheduledBlogs}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('archived')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'archived'
                      ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Archived
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'archived'
                        ? 'bg-white/20'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stats.archivedBlogs}
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
                          Category
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Views
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Engagement
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
                      {blogs.map((blog) => (
                        <tr
                          key={blog.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            {blog.status !== 'archived' && (
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
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                              #{formatID(blog.id.toString())}
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
                                {blog.author?.name || 'Unknown'}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                @{blog.author?.username || 'unknown'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium w-fit">
                              {blog.category?.name || 'Uncategorized'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {formatNumber(blog.views)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <FaHeart className="h-3 w-3 text-red-500" />
                                <span>{formatNumber(blog.likes)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaComments className="h-3 w-3 text-blue-500" />
                                <span>{formatNumber(blog.comments)}</span>
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
                              {blog.status === 'scheduled' && blog.scheduledAt && (
                                <>
                                  <div
                                    className="text-sm font-medium text-blue-600"
                                  >
                                    {formatDate(blog.scheduledAt)}
                                  </div>
                                  <div
                                    className="text-xs text-blue-500"
                                  >
                                    {formatTime(blog.scheduledAt)}
                                  </div>
                                </>
                              )}
                              {(blog.status === 'draft' || blog.status === 'archived') && (
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
                              {getStatusIcon(blog.status)}
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
                                  setViewDialog({
                                    open: true,
                                    blog: blog,
                                  });
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
                                        showToast('Edit functionality coming soon!', 'info');
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
                                    {blog.status !== 'archived' && (
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
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                          className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="form-label mb-2">
                          Reason for Change
                        </label>
                        <textarea
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                          className="form-field w-full min-h-[120px] resize-y px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="Explain the reason for status change..."
                          rows={4}
                          required
                        />
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
                            setStatusReason('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              statusDialog.blogId,
                              newStatus,
                              statusReason
                            )
                          }
                          className="btn btn-primary"
                          disabled={!statusReason.trim() || newStatus === statusDialog.currentStatus}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Details Dialog */}
                {viewDialog.open && viewDialog.blog && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">
                          Blog Details
                        </h3>
                        <button
                          onClick={() =>
                            setViewDialog({ open: false, blog: null })
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaTimes className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Blog Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            Basic Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Blog ID
                              </label>
                              <div className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded w-fit mt-1">
                                #{formatID(viewDialog.blog.id.toString())}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Title
                              </label>
                              <div className="text-sm text-gray-900 mt-1 font-medium">
                                {viewDialog.blog.title}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Slug
                              </label>
                              <div className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded w-fit mt-1">
                                /{viewDialog.blog.slug}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Author
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {viewDialog.blog.author?.name} (@{viewDialog.blog.author?.username})
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Category
                              </label>
                              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-medium w-fit mt-1">
                                {viewDialog.blog.category?.name}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Status
                              </label>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full w-fit text-xs font-medium mt-1 ${getStatusColor(viewDialog.blog.status)}`}>
                                {getStatusIcon(viewDialog.blog.status)}
                                <span className="capitalize">
                                  {viewDialog.blog.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            Performance Metrics
                          </h4>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Views
                              </label>
                              <div className="text-lg font-semibold text-gray-900 mt-1">
                                {formatNumber(viewDialog.blog.views)}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Read Time
                              </label>
                              <div className="text-lg font-semibold text-gray-900 mt-1">
                                {viewDialog.blog.readTime} min
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Likes
                              </label>
                              <div className="text-lg font-semibold text-red-600 mt-1">
                                {formatNumber(viewDialog.blog.likes)}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Comments
                              </label>
                              <div className="text-lg font-semibold text-blue-600 mt-1">
                                {formatNumber(viewDialog.blog.comments)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold mb-4 text-gray-800">
                          Excerpt
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700">
                            {viewDialog.blog.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      {viewDialog.blog.tags && viewDialog.blog.tags.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            Tags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {viewDialog.blog.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SEO Information */}
                      {(viewDialog.blog.seoTitle || viewDialog.blog.seoDescription) && (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold mb-4 text-gray-800">
                            SEO Information
                          </h4>
                          <div className="space-y-3">
                            {viewDialog.blog.seoTitle && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  SEO Title
                                </label>
                                <div className="text-sm text-gray-900 mt-1">
                                  {viewDialog.blog.seoTitle}
                                </div>
                              </div>
                            )}
                            {viewDialog.blog.seoDescription && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  SEO Description
                                </label>
                                <div className="text-sm text-gray-900 mt-1">
                                  {viewDialog.blog.seoDescription}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold mb-4 text-gray-800">
                          Dates
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Created
                            </label>
                            <div className="text-sm text-gray-900 mt-1">
                              {formatDate(viewDialog.blog.createdAt)}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Updated
                            </label>
                            <div className="text-sm text-gray-900 mt-1">
                              {formatDate(viewDialog.blog.updatedAt)}
                            </div>
                          </div>
                          {viewDialog.blog.publishedAt && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Published
                              </label>
                              <div className="text-sm text-gray-900 mt-1">
                                {formatDate(viewDialog.blog.publishedAt)}
                              </div>
                            </div>
                          )}
                          {viewDialog.blog.scheduledAt && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Scheduled
                              </label>
                              <div className="text-sm text-blue-600 mt-1">
                                {formatDate(viewDialog.blog.scheduledAt)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                          onClick={() => {
                            setViewDialog({ open: false, blog: null });
                            showToast('Edit functionality coming soon!', 'info');
                          }}
                          className="btn btn-primary flex items-center gap-2"
                        >
                          <FaEdit />
                          Edit Blog
                        </button>
                        <button
                          onClick={() => {
                            setViewDialog({ open: false, blog: null });
                            openStatusDialog(viewDialog.blog!.id, viewDialog.blog!.status);
                          }}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <FaCheckCircle />
                          Change Status
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