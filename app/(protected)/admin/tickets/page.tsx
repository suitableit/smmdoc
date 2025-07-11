'use client';

import React, { useEffect, useState } from 'react';
import {
  FaBox,
  FaCheckCircle,
  FaEdit,
  FaEllipsisH,
  FaPlus,
  FaSearch,
  FaSync,
  FaTimes,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaPause,
  FaCheck,
  FaExclamationTriangle,
  FaClock,
  FaReply,
  FaEnvelope,
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

// Define interface for SupportTicket
interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  subject: string;
  createdAt: string;
  lastUpdated: string;
  status: 'Open' | 'Answered' | 'Customer Reply' | 'On Hold' | 'In Progress' | 'Closed';
  isRead: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const SupportTicketsPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Support Tickets — ${APP_NAME}`;
  }, []);

  // Dummy data for support tickets
  const dummySupportTickets: SupportTicket[] = [
    {
      id: '001',
      userId: 'user_001',
      username: 'john_doe',
      subject: 'Instagram followers not delivered - Order #12345',
      createdAt: '2024-06-28T10:30:00Z',
      lastUpdated: '2024-06-29T14:20:00Z',
      status: 'Open',
      isRead: false,
    },
    {
      id: '002',
      userId: 'user_002',
      username: 'sarah_smith',
      subject: 'YouTube views delivery too slow',
      createdAt: '2024-06-27T15:45:00Z',
      lastUpdated: '2024-06-28T09:15:00Z',
      status: 'In Progress',
      isRead: true,
    },
    {
      id: '003',
      userId: 'user_003',
      username: 'mike_johnson',
      subject: 'Facebook likes dropped after completion',
      createdAt: '2024-06-26T08:20:00Z',
      lastUpdated: '2024-06-27T16:30:00Z',
      status: 'Customer Reply',
      isRead: false,
    },
    {
      id: '004',
      userId: 'user_004',
      username: 'emily_wilson',
      subject: 'TikTok followers order cancelled - need refund',
      createdAt: '2024-06-25T13:10:00Z',
      lastUpdated: '2024-06-26T11:45:00Z',
      status: 'Answered',
      isRead: true,
    },
    {
      id: '005',
      userId: 'user_005',
      username: 'alex_brown',
      subject: 'API integration not working properly',
      createdAt: '2024-06-24T16:55:00Z',
      lastUpdated: '2024-06-25T12:20:00Z',
      status: 'On Hold',
      isRead: true,
    },
    {
      id: '006',
      userId: 'user_006',
      username: 'lisa_davis',
      subject: 'Payment failed but money deducted',
      createdAt: '2024-06-23T11:30:00Z',
      lastUpdated: '2024-06-24T14:10:00Z',
      status: 'Closed',
      isRead: true,
    },
    {
      id: '007',
      userId: 'user_007',
      username: 'robert_clark',
      subject: 'Twitter retweets quality is very poor',
      createdAt: '2024-06-22T09:15:00Z',
      lastUpdated: '2024-06-23T17:25:00Z',
      status: 'Open',
      isRead: false,
    },
    {
      id: '008',
      userId: 'user_008',
      username: 'jennifer_taylor',
      subject: 'Instagram story views not starting',
      createdAt: '2024-06-21T14:40:00Z',
      lastUpdated: '2024-06-22T10:50:00Z',
      status: 'In Progress',
      isRead: true,
    },
    {
      id: '009',
      userId: 'user_009',
      username: 'david_martinez',
      subject: 'Bulk discount not applied to my order',
      createdAt: '2024-06-20T12:25:00Z',
      lastUpdated: '2024-06-21T15:30:00Z',
      status: 'Customer Reply',
      isRead: false,
    },
    {
      id: '010',
      userId: 'user_010',
      username: 'amanda_lee',
      subject: 'YouTube subscribers dropping continuously',
      createdAt: '2024-06-19T17:10:00Z',
      lastUpdated: '2024-06-20T13:45:00Z',
      status: 'Answered',
      isRead: true,
    },
  ];

  // State management
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(dummySupportTickets);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: dummySupportTickets.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [ticketsLoading, setTicketsLoading] = useState(false);

  // Bulk operations state
  const [selectedBulkOperation, setSelectedBulkOperation] = useState('');

  // Utility functions
  const formatTicketID = (id: string) => {
    return `${id.padStart(4, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Answered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Customer Reply':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'On Hold':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'In Progress':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Closed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <FaEnvelope className="h-3 w-3" />;
      case 'Answered':
        return <FaCheck className="h-3 w-3" />;
      case 'Customer Reply':
        return <FaReply className="h-3 w-3" />;
      case 'On Hold':
        return <FaPause className="h-3 w-3" />;
      case 'In Progress':
        return <FaClock className="h-3 w-3" />;
      case 'Closed':
        return <FaCheckCircle className="h-3 w-3" />;
      default:
        return <FaEnvelope className="h-3 w-3" />;
    }
  };

  // Filter tickets based on search term and status
  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = filteredTickets.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages,
      hasNext: prev.page < totalPages,
      hasPrev: prev.page > 1,
    }));
    // Clear selections when filter changes
    setSelectedTickets([]);
    setSelectedBulkOperation('');
  }, [filteredTickets.length, pagination.limit, statusFilter]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredTickets.slice(startIndex, endIndex);
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
    setTicketsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setTicketsLoading(false);
      showToast('Support tickets refreshed successfully!', 'success');
    }, 1000);
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === getPaginatedData().length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(getPaginatedData().map((ticket) => ticket.id));
    }
  };

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  // Handle view ticket
  const handleViewTicket = (ticketId: string) => {
    // Open ticket details in new tab
    window.open(`/${ticketId}`, '_blank');
  };

  // Handle ticket deletion
  const handleDeleteTicket = async (ticketId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSupportTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
      showToast('Ticket deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      showToast('Error deleting ticket', 'error');
    }
  };

  // Handle mark as read/unread
  const handleToggleReadStatus = (ticketId: string) => {
    setSupportTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, isRead: !ticket.isRead }
          : ticket
      )
    );
    const ticket = supportTickets.find(t => t.id === ticketId);
    showToast(
      `Ticket marked as ${ticket?.isRead ? 'unread' : 'read'}`,
      'success'
    );
  };

  // Handle hold ticket
  const handleHoldTicket = (ticketId: string) => {
    setSupportTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: 'On Hold', lastUpdated: new Date().toISOString() }
          : ticket
      )
    );
    showToast('Ticket put on hold', 'success');
  };

  // Handle close ticket
  const handleCloseTicket = (ticketId: string) => {
    setSupportTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: 'Closed', lastUpdated: new Date().toISOString() }
          : ticket
      )
    );
    showToast('Ticket closed successfully', 'success');
  };

  // Handle bulk operations
  const handleBulkOperation = (operation: string) => {
    switch (operation) {
      case 'mark_read':
        setSupportTickets((prev) =>
          prev.map((ticket) =>
            selectedTickets.includes(ticket.id)
              ? { ...ticket, isRead: true }
              : ticket
          )
        );
        showToast(`${selectedTickets.length} tickets marked as read`, 'success');
        break;
      case 'mark_unread':
        setSupportTickets((prev) =>
          prev.map((ticket) =>
            selectedTickets.includes(ticket.id)
              ? { ...ticket, isRead: false }
              : ticket
          )
        );
        showToast(`${selectedTickets.length} tickets marked as unread`, 'success');
        break;
      case 'open_all':
        setSupportTickets((prev) =>
          prev.map((ticket) =>
            selectedTickets.includes(ticket.id)
              ? { ...ticket, status: 'Open', lastUpdated: new Date().toISOString() }
              : ticket
          )
        );
        showToast(`${selectedTickets.length} tickets reopened`, 'success');
        break;
      case 'hold_all':
        setSupportTickets((prev) =>
          prev.map((ticket) =>
            selectedTickets.includes(ticket.id)
              ? { ...ticket, status: 'On Hold', lastUpdated: new Date().toISOString() }
              : ticket
          )
        );
        showToast(`${selectedTickets.length} tickets put on hold`, 'success');
        break;
      case 'delete_selected':
        setSupportTickets((prev) =>
          prev.filter((ticket) => !selectedTickets.includes(ticket.id))
        );
        showToast(`${selectedTickets.length} tickets deleted`, 'success');
        break;
    }
    setSelectedTickets([]);
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
                disabled={ticketsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={ticketsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Right: Search Controls */}
            <div className="flex flex-row items-center gap-3">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <select className="w-[30%] md:w-auto pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm">
                <option value="id">Ticket ID</option>
                <option value="username">Username</option>
                <option value="subject">Subject</option>
              </select>
            </div>
          </div>
        </div>

        {/* Support Tickets Table */}
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
                    {filteredTickets.length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Open')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Open'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Open
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Open'
                        ? 'bg-white/20'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {supportTickets.filter(t => t.status === 'Open').length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Answered')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Answered'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Answered
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Answered'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {supportTickets.filter(t => t.status === 'Answered').length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Customer Reply')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Customer Reply'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Customer Reply
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Customer Reply'
                        ? 'bg-white/20'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {supportTickets.filter(t => t.status === 'Customer Reply').length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('On Hold')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'On Hold'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  On Hold
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'On Hold'
                        ? 'bg-white/20'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {supportTickets.filter(t => t.status === 'On Hold').length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('In Progress')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'In Progress'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  In Progress
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'In Progress'
                        ? 'bg-white/20'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {supportTickets.filter(t => t.status === 'In Progress').length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('Closed')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'Closed'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Closed
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'Closed'
                        ? 'bg-white/20'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {supportTickets.filter(t => t.status === 'Closed').length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {/* Selected Tickets Actions - Top of table */}
            {selectedTickets.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center gap-2 py-4 border-b mb-4">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {selectedTickets.length} selected
                  </span>
                  
                  {/* Bulk Operations Dropdown */}
                  <select 
                    value={selectedBulkOperation}
                    onChange={(e) => setSelectedBulkOperation(e.target.value)}
                    disabled={ticketsLoading}
                    className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm disabled:opacity-50"
                  >
                    <option value="" disabled>Bulk Operations</option>
                    <option value="mark_read">Mark all as read</option>
                    <option value="mark_unread">Mark all as unread</option>
                    <option value="open_all">Open all</option>
                    <option value="hold_all">Hold all</option>
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
                    disabled={ticketsLoading}
                    className="btn btn-primary flex items-center gap-2 px-4 py-2.5 disabled:opacity-50 w-full md:w-auto"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            )}
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading support tickets...
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
                  No tickets found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No support tickets match your search criteria or no tickets exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View - Hidden on mobile */}
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
                              selectedTickets.length === getPaginatedData().length &&
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
                          Subject
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
                          Last Updated
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
                      {getPaginatedData().map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedTickets.includes(ticket.id)}
                              onChange={() => handleSelectTicket(ticket.id)}
                              className="rounded border-gray-300 w-4 h-4"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {formatTicketID(ticket.id)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {ticket.username}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className={`text-sm ${!ticket.isRead ? 'font-bold' : 'font-normal'}`}
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {ticket.subject}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                {new Date(ticket.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {new Date(ticket.lastUpdated).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                {new Date(ticket.lastUpdated).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium border w-26 ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {getStatusIcon(ticket.status)}
                              {ticket.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {/* View Button */}
                              <button
                                className="btn btn-secondary p-2"
                                title="View Ticket"
                                onClick={() => handleViewTicket(ticket.id)}
                              >
                                <FaEye className="h-3 w-3" />
                              </button>

                              {/* 3 Dot Menu */}
                              <div className="relative">
                                <button
                                  className="btn btn-secondary p-2"
                                  title="More Actions"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.currentTarget
                                      .nextElementSibling as HTMLElement;
                                    // Close other dropdowns
                                    document
                                      .querySelectorAll('.dropdown-menu')
                                      .forEach((menu) => {
                                        if (menu !== dropdown)
                                          menu.classList.add('hidden');
                                      });
                                    dropdown.classList.toggle('hidden');
                                  }}
                                >
                                  <FaEllipsisH className="h-3 w-3" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="dropdown-menu hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        handleToggleReadStatus(ticket.id);
                                        document
                                          .querySelector('.dropdown-menu:not(.hidden)')
                                          ?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      {ticket.isRead ? (
                                        <FaEyeSlash className="h-3 w-3" />
                                      ) : (
                                        <FaEye className="h-3 w-3" />
                                      )}
                                      Mark as {ticket.isRead ? 'Unread' : 'Read'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleHoldTicket(ticket.id);
                                        document
                                          .querySelector('.dropdown-menu:not(.hidden)')
                                          ?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      disabled={ticket.status === 'On Hold'}
                                    >
                                      <FaPause className="h-3 w-3" />
                                      Hold Ticket
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleCloseTicket(ticket.id);
                                        document
                                          .querySelector('.dropdown-menu:not(.hidden)')
                                          ?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      disabled={ticket.status === 'Closed'}
                                    >
                                      <FaCheck className="h-3 w-3" />
                                      Close Ticket
                                    </button>
                                    <button
                                      onClick={() => {
                                        setTicketToDelete(ticket.id);
                                        setDeleteDialogOpen(true);
                                        document
                                          .querySelector('.dropdown-menu:not(.hidden)')
                                          ?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaTrash className="h-3 w-3" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
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
                    {ticketsLoading ? (
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
                      )} of ${pagination.total} tickets`
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
                      disabled={!pagination.hasPrev || ticketsLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {ticketsLoading ? (
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
                      disabled={!pagination.hasNext || ticketsLoading}
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
              <h3 className="text-lg font-semibold mb-4">Delete Ticket</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this support ticket? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setTicketToDelete(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    ticketToDelete && handleDeleteTicket(ticketToDelete)
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

export default SupportTicketsPage;