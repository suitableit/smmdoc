'use client';

import React, { useEffect, useState } from 'react';
import {
    FaBox,
    FaCheckCircle,
    FaEdit,
    FaEnvelope,
    FaEye,
    FaReply,
    FaSearch,
    FaSync,
    FaTimes,
    FaTrash
} from 'react-icons/fa';

// Import APP_NAME constant
import { APP_NAME } from '@/lib/constants';

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

// Define interface for ContactMessage
interface ContactMessage {
  id: string;
  userId: string;
  username: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'Unread' | 'Read' | 'Replied';
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ContactMessagesPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Contact Messages — ${APP_NAME}`;
  }, []);

  // Dummy data for contact messages
  const dummyContactMessages: ContactMessage[] = [
    {
      id: '001',
      userId: 'user_001',
      username: 'socialmarketer_john',
      email: 'john.doe@agency.com',
      category: 'Instagram Services',
      subject: 'Instagram followers delivery time inquiry',
      message: 'Hi, I placed an order for 10K Instagram followers. How long does delivery usually take?',
      createdAt: '2024-06-28T10:30:00Z',
      status: 'Unread' as const,
    },
    {
      id: '002',
      userId: 'user_002',
      username: 'sarah_influencer',
      email: 'sarah.smith@gmail.com',
      category: 'YouTube Services',
      subject: 'YouTube subscribers quality question',
      message: 'I want to buy YouTube subscribers but need high-quality, active accounts. Do you provide this?',
      createdAt: '2024-06-27T15:45:00Z',
      status: 'Read' as const,
    },
    {
      id: '003',
      userId: 'user_003',
      username: 'mike_business',
      email: 'mike.johnson@company.com',
      category: 'Bulk Orders',
      subject: 'Enterprise package for multiple accounts',
      message: 'We need SMM services for 50+ business accounts. Do you offer enterprise packages with discounts?',
      createdAt: '2024-06-26T08:20:00Z',
      status: 'Replied' as const,
    },
    {
      id: '004',
      userId: 'user_004',
      username: 'emily_creator',
      email: 'emily.wilson@outlook.com',
      category: 'TikTok Services',
      subject: 'TikTok views and likes package',
      message: 'I need a combination package for TikTok views and likes. What are your best rates?',
      createdAt: '2024-06-25T13:10:00Z',
      status: 'Read' as const,
    },
    {
      id: '005',
      userId: 'user_005',
      username: 'alex_developer',
      email: 'alex.brown@techstartup.com',
      category: 'API Integration',
      subject: 'API access for automated orders',
      message: 'We want to integrate your SMM services into our platform. Can you provide API documentation?',
      createdAt: '2024-06-24T16:55:00Z',
      status: 'Replied' as const,
    },
    {
      id: '006',
      userId: 'user_006',
      username: 'lisa_blogger',
      email: 'lisa.davis@blog.com',
      category: 'Facebook Services',
      subject: 'Facebook page likes and engagement',
      message: 'I need to boost my Facebook business page. What services do you recommend for engagement?',
      createdAt: '2024-06-23T11:30:00Z',
      status: 'Unread' as const,
    },
    {
      id: '007',
      userId: 'user_007',
      username: 'robert_marketer',
      email: 'robert.clark@agency.com',
      category: 'Twitter Services',
      subject: 'Twitter followers and retweets service',
      message: 'Looking for high-quality Twitter followers and retweet services for client campaigns.',
      createdAt: '2024-06-22T09:15:00Z',
      status: 'Read' as const,
    },
    {
      id: '008',
      userId: 'user_008',
      username: 'jennifer_ecommerce',
      email: 'jen.taylor@shop.com',
      category: 'Instagram Services',
      subject: 'Instagram story views for product promotion',
      message: 'We sell products online and need Instagram story views to increase our product visibility.',
      createdAt: '2024-06-21T14:40:00Z',
      status: 'Replied' as const,
    },
    {
      id: '009',
      userId: 'user_009',
      username: 'david_startup',
      email: 'david.martinez@startup.io',
      category: 'Pricing Inquiry',
      subject: 'Startup discount and payment plans',
      message: 'As a new startup, do you offer any discounts or flexible payment plans for SMM services?',
      createdAt: '2024-06-20T12:25:00Z',
      status: 'Unread' as const,
    },
    {
      id: '010',
      userId: 'user_010',
      username: 'amanda_agency',
      email: 'amanda.lee@digitalagency.com',
      category: 'Partnership',
      subject: 'White label SMM panel partnership',
      message: 'We are a digital agency interested in white label partnership. Can we discuss terms?',
      createdAt: '2024-06-19T17:10:00Z',
      status: 'Read' as const,
    },
  ];

  // State management
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(dummyContactMessages);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: dummyContactMessages.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Bulk operations state
  const [selectedBulkOperation, setSelectedBulkOperation] = useState('');

  // Utility functions
  const formatMessageID = (id: string) => {
    return `${id.padStart(4, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Unread':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Read':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Replied':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Unread':
        return <FaEnvelope className="h-3 w-3" />;
      case 'Read':
        return <FaEye className="h-3 w-3" />;
      case 'Replied':
        return <FaReply className="h-3 w-3" />;
      default:
        return <FaEnvelope className="h-3 w-3" />;
    }
  };

  // Filter messages based on search term and status
  const filteredMessages = contactMessages.filter((message) => {
    const matchesSearch =
      message.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = filteredMessages.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages,
      hasNext: prev.page < totalPages,
      hasPrev: prev.page > 1,
    }));
    // Clear selections when filter changes
    setSelectedMessages([]);
    setSelectedBulkOperation('');
  }, [filteredMessages.length, pagination.limit, statusFilter]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredMessages.slice(startIndex, endIndex);
  };

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRefresh = () => {
    setMessagesLoading(true);
    // Simulate loading
    setTimeout(() => {
      setMessagesLoading(false);
      showToast('Contact messages refreshed successfully!', 'success');
    }, 1000);
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === getPaginatedData().length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(getPaginatedData().map((message) => message.id));
    }
  };

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Handle view/edit message
  const handleViewEditMessage = (messageId: string) => {
    // Open message details in new tab
    window.open(`/contact-messages/${messageId}`, '_blank');
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setContactMessages((prev) => prev.filter((message) => message.id !== messageId));
      showToast('Message deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast('Error deleting message', 'error');
    }
  };

  // Handle mark as read
  const handleMarkAsRead = (messageId: string) => {
    setContactMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, status: 'Read' }
          : message
      )
    );
    showToast('Message marked as read', 'success');
  };

  // Handle bulk operations
  const handleBulkOperation = (operation: string) => {
    switch (operation) {
      case 'mark_read':
        setContactMessages((prev) =>
          prev.map((message) =>
            selectedMessages.includes(message.id)
              ? { ...message, status: 'Read' }
              : message
          )
        );
        showToast(`${selectedMessages.length} messages marked as read`, 'success');
        break;
      case 'mark_unread':
        setContactMessages((prev) =>
          prev.map((message) =>
            selectedMessages.includes(message.id)
              ? { ...message, status: 'Unread' }
              : message
          )
        );
        showToast(`${selectedMessages.length} messages marked as unread`, 'success');
        break;
      case 'delete_selected':
        setContactMessages((prev) =>
          prev.filter((message) => !selectedMessages.includes(message.id))
        );
        showToast(`${selectedMessages.length} messages deleted`, 'success');
        break;
    }
    setSelectedMessages([]);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Page View Dropdown */}
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
                disabled={messagesLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={messagesLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Right: Search Controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${statusFilter === 'all' ? 'all' : statusFilter} messages...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="id">Message ID</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Messages Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {/* Filter Buttons - Inside table header */}
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
                    {filteredMessages.length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Unread')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Unread'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Unread
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Unread'
                        ? 'bg-white/20'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {contactMessages.filter(m => m.status === 'Unread').length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Read')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Read'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Read
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Read'
                        ? 'bg-white/20'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {contactMessages.filter(m => m.status === 'Read').length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Replied')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Replied'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Replied
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Replied'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {contactMessages.filter(m => m.status === 'Replied').length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {/* Selected Messages Actions - Top of table */}
            {selectedMessages.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center gap-2 py-4 border-b mb-4">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {selectedMessages.length} selected
                  </span>
                  
                  {/* Bulk Operations Dropdown */}
                  <select 
                    value={selectedBulkOperation}
                    onChange={(e) => setSelectedBulkOperation(e.target.value)}
                    disabled={messagesLoading}
                    className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm disabled:opacity-50"
                  >
                    <option value="" disabled>Bulk Operations</option>
                    <option value="mark_read">Mark all as read</option>
                    <option value="mark_unread">Mark all as unread</option>
                    <option value="delete_selected">Delete Selected</option>
                  </select>
                </div>

                {/* Save Changes Button - appears when operation is selected */}
                {selectedBulkOperation && (
                  <button
                    onClick={() => {
                      handleBulkOperation(selectedBulkOperation);
                      setSelectedBulkOperation(''); // Reset after execution
                    }}
                    disabled={messagesLoading}
                    className="btn btn-primary flex items-center gap-2 px-4 py-2.5 disabled:opacity-50 w-full md:w-auto"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            )}
            {messagesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading contact messages...
                  </div>
                </div>
              </div>
            ) : getPaginatedData().length === 0 ? (
              <div className="text-center py-12">
                <FaBox
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No messages found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No contact messages match your search criteria or no messages exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedMessages.length === getPaginatedData().length &&
                              getPaginatedData().length > 0
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
                          User
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Email
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
                          Created
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
                      {getPaginatedData().map((message) => (
                        <tr
                          key={message.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedMessages.includes(message.id)}
                              onChange={() => handleSelectMessage(message.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {formatMessageID(message.id)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {message.username}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {message.email}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              {message.category}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium border w-26 ${getStatusColor(
                                message.status
                              )}`}
                            >
                              {getStatusIcon(message.status)}
                              {message.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {/* Conditional Action Button */}
                              {message.status === 'Replied' ? (
                                <button
                                  className="btn btn-secondary p-2"
                                  title="View Message"
                                  onClick={() => handleViewEditMessage(message.id)}
                                >
                                  <FaEye className="h-3 w-3" />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-primary p-2"
                                  title="Edit Message"
                                  onClick={() => handleViewEditMessage(message.id)}
                                >
                                  <FaEdit className="h-3 w-3" />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                className="btn btn-secondary p-2"
                                title="Delete Message"
                                onClick={() => {
                                  setMessageToDelete(message.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <FaTrash className="h-3 w-3 text-red-600" />
                              </button>
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
                    {messagesLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading pagination...</span>
                      </div>
                    ) : (
                      `Showing ${
                        (pagination.page - 1) * pagination.limit + 1
                      } to ${Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )} of ${pagination.total} messages`
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
                      disabled={!pagination.hasPrev || messagesLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {messagesLoading ? (
                        <GradientSpinner size="w-4 h-4" />
                      ) : (
                        `Page ${pagination.page} of ${pagination.totalPages}`
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={!pagination.hasNext || messagesLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Message</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this contact message? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setMessageToDelete(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    messageToDelete && handleDeleteMessage(messageToDelete)
                  }
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMessagesPage;