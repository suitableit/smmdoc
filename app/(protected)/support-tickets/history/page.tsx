'use client';

import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    FaBan,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaRobot,
    FaSearch,
    FaSpinner,
    FaTicketAlt,
    FaTimes,
    FaUser,
} from 'react-icons/fa';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

type Ticket = {
  id: number;
  subject: string;
  status:
    | 'open'
    | 'answered'
    | 'customer_reply'
    | 'on_hold'
    | 'in_progress'
    | 'closed';
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
  lastUpdated?: string;
  type: 'ai' | 'human';
};

// Toast Component
const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}) => (
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
      type === 'success'
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
        : type === 'error'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const dummyTickets: Ticket[] = [
  {
    id: 1,
    subject: 'Order #123 - Issue',
    status: 'open',
    createdAt: '2024-03-20T10:30:00',
    priority: 'high',
    lastUpdated: '2024-03-20T14:45:00',
    type: 'human',
  },
  {
    id: 2,
    subject: 'Payment Issue',
    status: 'closed',
    createdAt: '2024-03-19T09:15:00',
    priority: undefined, // AI tickets don't have priority
    lastUpdated: '2024-03-19T16:30:00',
    type: 'ai',
  },
  {
    id: 3,
    subject: 'Account Access Problem',
    status: 'customer_reply',
    createdAt: '2024-03-18T14:20:00',
    priority: 'low',
    lastUpdated: '2024-03-19T11:00:00',
    type: 'human',
  },
  {
    id: 4,
    subject: 'Refund Request',
    status: 'closed',
    createdAt: '2024-03-17T11:45:00',
    priority: undefined, // AI tickets don't have priority
    lastUpdated: '2024-03-18T09:30:00',
    type: 'ai',
  },
  {
    id: 5,
    subject: 'Technical Support',
    status: 'on_hold',
    createdAt: '2024-03-16T16:00:00',
    priority: 'low',
    lastUpdated: '2024-03-17T10:15:00',
    type: 'human',
  },
  {
    id: 6,
    subject: 'Billing Inquiry',
    status: 'closed',
    createdAt: '2024-03-15T13:20:00',
    priority: undefined, // AI tickets don't have priority
    lastUpdated: '2024-03-16T15:45:00',
    type: 'ai',
  },
];

export default function TicketsHistory() {
  const { appName } = useAppNameWithFallback();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'human' | 'ai'>('all');
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Tickets History', appName);
  }, [appName]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Live search functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim()) {
        // Filter tickets based on search input
        const results = dummyTickets.filter(
          (ticket) =>
            ticket.subject.toLowerCase().includes(searchInput.toLowerCase()) ||
            ticket.id.toString().includes(searchInput) ||
            ticket.status.toLowerCase().includes(searchInput.toLowerCase())
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        event.target && !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter tickets based on status, search, and tab
  const filteredTickets = useMemo(() => {
    let tickets = [...dummyTickets];

    // Filter by tab type
    if (activeTab !== 'all') {
      tickets = tickets.filter((ticket) => ticket.type === activeTab);
    }

    if (status !== 'all') {
      tickets = tickets.filter((ticket) => ticket.status === status);
    }

    if (search) {
      tickets = tickets.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
          ticket.id.toString().includes(search)
      );
    }

    return tickets;
  }, [status, search, activeTab]);

  const pagination = {
    total: filteredTickets.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(filteredTickets.length / limit),
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Calculate counts for each status filter
  const getStatusCount = (statusKey: string) => {
    let tickets = [...dummyTickets];

    // Filter by current tab first
    if (activeTab !== 'all') {
      tickets = tickets.filter((ticket) => ticket.type === activeTab);
    }

    if (statusKey === 'all') return tickets.length;
    return tickets.filter((ticket) => ticket.status === statusKey).length;
  };

  // Status filter buttons configuration
  const statusFilters = [
    {
      key: 'all',
      label: 'All',
      icon: FaTicketAlt,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'open',
      label: 'Open',
      icon: FaClock,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'answered',
      label: 'Answered',
      icon: FaCheckCircle,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'customer_reply',
      label: 'Customer Reply',
      icon: FaTicketAlt,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'on_hold',
      label: 'On Hold',
      icon: FaSpinner,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      icon: FaSpinner,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      key: 'closed',
      label: 'Closed',
      icon: FaBan,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
      case 'answered':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
      case 'customer_reply':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800';
      case 'on_hold':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
      case 'in_progress':
        return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800';
      case 'closed':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800';
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    const baseClasses =
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';

    switch (priority) {
      case 'high':
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200`}
          >
            High
          </span>
        );
      case 'medium':
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200`}
          >
            Medium
          </span>
        );
      case 'low':
        return (
          <span
            className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200`}
          >
            Low
          </span>
        );
      default:
        return null;
    }
  };

  // Handle search selection from dropdown
  const handleSearchSelect = (ticket: Ticket) => {
    setSearch(ticket.subject);
    setSearchInput(ticket.subject);
    setShowDropdown(false);
    setSearchResults([]);
    // Optionally filter to show only this ticket
    setPage(1);
  };

  const handleViewTicket = (ticketId: string) => {
    console.log(`Navigate to ticket ${ticketId}`);
    showToast(`Opening ticket ${ticketId}`, 'info');
  };

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card card-padding">
            <div className="text-red-500 text-center flex flex-col items-center py-8">
              <FaExclamationTriangle className="text-4xl mb-4" />
              <div className="text-lg font-medium">Error loading tickets!</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card card-padding">
            <div className="text-center py-8 flex flex-col items-center">
              <GradientSpinner size="w-14 h-14" className="mb-4" />
              <div className="text-lg font-medium">Loading tickets...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Toast Container */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="page-content">
        {/* Tab Navigation */}
        <div className="card mb-6" style={{ padding: '8px' }}>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => {
                setActiveTab('all');
                setPage(1);
                setStatus('all');
              }}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm w-full ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
              }`}
            >
              <FaTicketAlt className="mr-2 w-4 h-4" />
              All Tickets
            </button>
            <button
              onClick={() => {
                setActiveTab('human');
                setPage(1);
                setStatus('all');
              }}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm w-full ${
                activeTab === 'human'
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-600'
              }`}
            >
              <FaUser className="mr-2 w-4 h-4" />
              Human Support
            </button>
            <button
              onClick={() => {
                setActiveTab('ai');
                setPage(1);
                setStatus('all');
              }}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm w-full ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 hover:text-green-600'
              }`}
            >
              <FaRobot className="mr-2 w-4 h-4" />
              AI Ticket
            </button>
          </div>
        </div>

        {/* Tickets Content Card - Everything in one box */}
        <div className="card card-padding">
          {/* Search Bar with Live Search */}
          <div className="mb-6">
            <div className="relative w-full" ref={searchRef}>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                <FaSearch className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearch(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value.trim()) {
                    setPage(1);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Search by ticket ID, subject, or status..."
                autoComplete="off"
                style={{ width: '100%', minWidth: '0' }}
              />

              {/* Search Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto left-0 right-0">
                  {searchResults.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSearchSelect(ticket)}
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {ticket.id}
                            </span>
                            <span className="text-sm text-gray-700 truncate">
                              {ticket.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                                ticket.status
                              )}`}
                            >
                              {ticket.status}
                            </span>
                            {ticket.type === 'ai' ? (
                              <span className="text-xs text-purple-600 flex items-center gap-1">
                                <FaRobot className="w-3 h-3" /> AI
                              </span>
                            ) : (
                              <span className="text-xs text-blue-600 flex items-center gap-1">
                                <FaUser className="w-3 h-3" /> Human
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {moment(ticket.createdAt).format('DD/MM')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Filter Buttons - Updated with Services Page Gradient */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {statusFilters.map((filter) => {
                const IconComponent = filter.icon;
                const isActive = status === filter.key;
                const count = getStatusCount(filter.key);

                return (
                  <button
                    key={filter.key}
                    onClick={() => {
                      setStatus(filter.key);
                      setPage(1);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-lg'
                        : filter.color
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 first:rounded-tl-lg">
                    Ticket ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Last Updated
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 last:rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket, index) => {
                    const isLastRow = index === filteredTickets.length - 1;
                    return (
                      <tr
                        key={ticket.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          isLastRow ? 'last:border-b-0' : ''
                        }`}
                      >
                        <td
                          className={`py-3 px-4 ${
                            isLastRow ? 'first:rounded-bl-lg' : ''
                          }`}
                        >
                          <span className="text-sm font-mono text-gray-700">
                            #{ticket.id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {ticket.type === 'ai' ? (
                              <>
                                <FaRobot className="w-4 h-4 text-purple-600" />
                                <span className="text-xs font-medium text-purple-600">
                                  AI
                                </span>
                              </>
                            ) : (
                              <>
                                <FaUser className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-medium text-blue-600">
                                  Human
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-[300px]">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {ticket.subject}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {ticket.type === 'ai' ? (
                            <span className="text-sm text-gray-500">N/A</span>
                          ) : (
                            getPriorityBadge(ticket.priority)
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {moment(ticket.createdAt).format('DD/MM/YYYY')}
                          </span>
                          <div className="text-xs text-gray-500">
                            {moment(ticket.createdAt).format('HH:mm')}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {ticket.lastUpdated
                              ? moment(ticket.lastUpdated).format('DD/MM/YYYY')
                              : '-'}
                          </span>
                          <div className="text-xs text-gray-500">
                            {ticket.lastUpdated
                              ? moment(ticket.lastUpdated).format('HH:mm')
                              : ''}
                          </div>
                        </td>
                        <td
                          className={`py-3 px-4 ${
                            isLastRow ? 'last:rounded-br-lg' : ''
                          }`}
                        >
                          <button
                            onClick={() => handleViewTicket(ticket.id.toString())}
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                            title="View Ticket"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaTicketAlt className="text-4xl text-gray-400 mb-4" />
                        <div className="text-lg font-medium">
                          No{' '}
                          {activeTab === 'all'
                            ? ''
                            : activeTab === 'human'
                            ? 'human support'
                            : 'AI'}{' '}
                          tickets found
                        </div>
                        <div className="text-sm">
                          Try adjusting your search or filter criteria
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span>{' '}
                tickets
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, page + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
