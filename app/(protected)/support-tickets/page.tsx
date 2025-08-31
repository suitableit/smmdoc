'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    FaCheckCircle,
    FaClock,
    FaCreditCard,
    FaInfoCircle,
    FaPaperclip,
    FaTicketAlt,
    FaTimes,
} from 'react-icons/fa';
import ReCAPTCHA from '@/components/ReCAPTCHA';
import useReCAPTCHA from '@/hooks/useReCAPTCHA';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Toast/Twist Message Component using CSS classes
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

const ButtonLoader = () => <div className="loading-spinner"></div>;

interface TicketFormData {
  category: string;
  subcategory: string;
  orderIds: string;
  message: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  attachments: string[];
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'answered' | 'closed' | 'pending' | 'in_progress';
  category: string;
  subcategory?: string;
  message: string;
  orderIds?: string[];
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
}

const TicketPage: React.FC = () => {
  const router = useRouter();
  const { appName } = useAppNameWithFallback();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Support Tickets', appName);
  }, [appName]);

  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<TicketFormData>({
    category: '1',
    subcategory: '2',
    orderIds: '',
    message: '',
    subject: '',
    priority: 'medium',
    attachments: [],
  });
  const [showMessageField, setShowMessageField] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // ReCAPTCHA state
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { recaptchaSettings, isEnabledForForm } = useReCAPTCHA();

  // Tickets data from API
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  // Fetch user tickets
  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const response = await fetch('/api/support-tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      } else {
        showToast('Failed to fetch tickets', 'error');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showToast('Error fetching tickets', 'error');
    } finally {
      setTicketsLoading(false);
    }
  };

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const categories = [
    { value: '1', label: 'AI Support' },
    { value: '13', label: 'Human Support' },
  ];

  const subcategories = [
    { value: '2', label: 'Refill' },
    { value: '4', label: 'Cancel' },
    { value: '6', label: 'Speed up' },
    { value: '14', label: 'Restart' },
    { value: '66', label: 'Fake complete' },
  ];

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
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (formData.category === '1') {
      // AI Support - hide message and file upload
      setShowMessageField(false);
      setShowFileUpload(false);
      // Auto-generate message
      const subcategoryLabel =
        subcategories.find((s) => s.value === formData.subcategory)?.label ||
        'Subcategory Not Found';
      const orderIdText = formData.orderIds || 'Order ID Not Found';
      setFormData((prev) => ({
        ...prev,
        message: `${orderIdText} ${subcategoryLabel}`,
      }));
    } else {
      // Human Support - show message and file upload
      setShowMessageField(true);
      setShowFileUpload(true);
      setFormData((prev) => ({ ...prev, message: '' }));
    }
  }, [formData.category, formData.subcategory, formData.orderIds]);

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrderIdsChange = (value: string) => {
    // Only allow numbers and commas
    const sanitized = value.replace(/[^0-9,]/g, '');
    handleInputChange('orderIds', sanitized);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Check ReCAPTCHA if enabled
      if (isEnabledForForm('supportTicket') && !recaptchaToken) {
        showToast('Please complete the ReCAPTCHA verification', 'error');
        setIsSubmitting(false);
        return;
      }

      // Generate subject based on category and subcategory
      const categoryLabel = categories.find(c => c.value === formData.category)?.label || 'Support';
      const subcategoryLabel = subcategories.find(s => s.value === formData.subcategory)?.label || '';
      const subject = `${categoryLabel} - ${subcategoryLabel}`;

      // Prepare order IDs array
      const orderIds = formData.orderIds ? formData.orderIds.split(',').map(id => id.trim()).filter(id => id) : [];

      const ticketData = {
        subject,
        message: formData.message,
        category: formData.category,
        subcategory: formData.subcategory,
        orderIds,
        priority: formData.priority,
        attachments: formData.attachments,
        ...(recaptchaToken && { recaptchaToken }),
      };

      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        const result = await response.json();
        showToast('Ticket submitted successfully!', 'success');
        setFormData({
          category: '1',
          subcategory: '2',
          orderIds: '',
          message: '',
          subject: '',
          priority: 'medium',
          attachments: [],
        });
        // Refresh tickets list
        fetchTickets();
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to submit ticket', 'error');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      showToast('Failed to submit ticket. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'open':
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            Open
          </span>
        );
      case 'answered':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Answered
          </span>
        );
      case 'in_progress':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            In Progress
          </span>
        );
      case 'closed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Closed
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Pending
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const handleticketsHistoryClick = () => {
    // Navigate to Tickets History page
    router.push('/support-tickets/history');
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Loading State */}
            <div className="space-y-6">
              {/* Tab Navigation - Static */}
              <div className="card" style={{ padding: '8px' }}>
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
                    <FaTicketAlt className="mr-2 w-4 h-4" />
                    New Ticket
                  </button>
                  <button className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-600">
                    <FaClock className="mr-2 w-4 h-4" />
                    Tickets History
                  </button>
                </div>
              </div>

              {/* Form Card - Loading State */}
              <div className="card card-padding">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-14 h-14" className="mb-4" />
                    <div className="text-lg font-medium">
                      Loading ticket form...
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Information (Static) */}
            <div className="space-y-6">
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaInfoCircle />
                  </div>
                  <h3 className="card-title">Read before create Ticket</h3>
                </div>

                <div className="space-y-3 mt-4">
                  {/* Static accordion items while loading */}
                  <div className="card">
                    <div className="w-full p-4 text-left flex justify-between items-center">
                      <span className="flex items-center gap-2 font-medium text-gray-900 pr-4">
                        <FaCreditCard className="w-4 h-4" />
                        How to Create Ticket ?
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="w-full p-4 text-left flex justify-between items-center">
                      <span className="flex items-center gap-2 font-medium text-gray-900 pr-4">
                        <FaClock className="w-4 h-4" />
                        How long does it take to get a reply from support
                        regarding my complaint?
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="w-full p-4 text-left flex justify-between items-center">
                      <span className="flex items-center gap-2 font-medium text-gray-900 pr-4">
                        <FaInfoCircle className="w-4 h-4" />
                        Important Guidelines
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Ticket Form */}
          <div className="space-y-6">
            {/* Tab Navigation - Updated with cloned style */}
            <div className="card" style={{ padding: '8px' }}>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm ${
                    activeTab === 'new'
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-600'
                  }`}
                >
                  <FaTicketAlt className="mr-2 w-4 h-4" />
                  New Ticket
                </button>
                <button
                  onClick={handleticketsHistoryClick}
                  className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-600"
                >
                  <FaClock className="mr-2 w-4 h-4" />
                  Tickets History
                </button>
              </div>
            </div>

            <div className="card card-padding">
              {/* Tab Content */}
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange('category', e.target.value)
                      }
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) =>
                        handleInputChange('subcategory', e.target.value)
                      }
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {subcategories.map((subcat) => (
                        <option key={subcat.value} value={subcat.value}>
                          {subcat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Order ID (example: 10867110,10867210,10867500)
                    </label>
                    <input
                      type="text"
                      value={formData.orderIds}
                      onChange={(e) => handleOrderIdsChange(e.target.value)}
                      placeholder="Enter order IDs separated by commas"
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    />
                  </div>

                  {showMessageField && (
                    <div className="form-group">
                      <label className="form-label">Message</label>
                      <textarea
                        rows={7}
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange('message', e.target.value)
                        }
                        required={showMessageField}
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        style={{ minHeight: '120px', resize: 'vertical' }}
                      />
                    </div>
                  )}

                  {showFileUpload && (
                    <div className="form-group">
                      <button
                        type="button"
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <FaPaperclip className="w-4 h-4" />
                        Attach files
                      </button>
                    </div>
                  )}

                  {/* ReCAPTCHA Component */}
                  {isEnabledForForm('supportTicket') && recaptchaSettings && (
                    <ReCAPTCHA
                      siteKey={recaptchaSettings.siteKey}
                      version={recaptchaSettings.version}
                      action="supportTicket"
                      threshold={recaptchaSettings.threshold}
                      onVerify={(token) => {
                        setRecaptchaToken(token);
                      }}
                      onError={() => {
                        setRecaptchaToken(null);
                        // Let Google's native error messages display instead of custom ones
                        // This allows 'Invalid domain for site key' and other specific errors to show
                      }}
                      onExpired={() => {
                        setRecaptchaToken(null);
                        // Let Google's native expired message display
                      }}
                    />
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="btn btn-primary w-full"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Information */}
          <div className="space-y-6">
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaInfoCircle />
                </div>
                <h3 className="card-title">Read before create Ticket</h3>
              </div>

              <div className="space-y-3 mt-4">
                {/* Accordion Item 1 */}
                <div className="card">
                  <button
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={() => toggleAccordion('item-1')}
                  >
                    <span className="flex items-center gap-2 font-medium text-gray-900 pr-4">
                      <FaCreditCard className="w-4 h-4" />
                      How to Create Ticket ?
                    </span>
                    <div
                      className={`transform transition-transform duration-200 ${
                        openAccordion === 'item-1' ? 'rotate-180' : 'rotate-0'
                      }`}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openAccordion === 'item-1'
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
                      <p className="text-gray-600 leading-relaxed mt-3">
                        To Create a Ticket you need to choose a Subject above (
                        <strong>AI Support</strong> or{' '}
                        <strong>Human Support</strong>). Then you can write your
                        problem and click Submit button.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accordion Item 2 */}
                <div className="card">
                  <button
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={() => toggleAccordion('item-2')}
                  >
                    <span className="flex items-center gap-2 font-medium text-gray-900 pr-4">
                      <FaClock className="w-4 h-4" />
                      How long does it take to get a reply from support
                      regarding my complaint?
                    </span>
                    <div
                      className={`transform transition-transform duration-200 ${
                        openAccordion === 'item-2' ? 'rotate-180' : 'rotate-0'
                      }`}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openAccordion === 'item-2'
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
                      <div className="text-gray-600 leading-relaxed mt-3">
                        <strong>Reply Time:</strong> Our support team usually
                        responds within 5 to 45 minutes.
                        <br />
                        <strong>Resolution Time:</strong> Solving your issue may
                        take anywhere between 5 minutes to 48 hours, depending
                        on the complexity of the problem.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion Item 3 */}
                <div className="card">
                  <button
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={() => toggleAccordion('item-3')}
                  >
                    <span className="flex items-center gap-2 font-medium text-gray-900 pr-4">
                      <FaInfoCircle className="w-4 h-4" />
                      Important Guidelines
                    </span>
                    <div
                      className={`transform transition-transform duration-200 ${
                        openAccordion === 'item-3' ? 'rotate-180' : 'rotate-0'
                      }`}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openAccordion === 'item-3'
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
                      <div className="space-y-3 text-gray-600 leading-relaxed mt-3">
                        <p>
                          Please open only one ticket for the same or similar
                          issue. Avoid creating multiple Ticket for the same
                          issue, as it may delay the resolution process.
                        </p>
                        <p>
                          <strong>
                            Important Notice: Use of Inappropriate Language
                          </strong>
                        </p>
                        <p>
                          We maintain a strict policy regarding communication
                          through Ticket. Please read the following carefully:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 ml-4">
                          <li>
                            <strong>No Use of Bad Language:</strong> Any form of
                            offensive, abusive, or inappropriate language will
                            not be tolerated.
                          </li>
                          <li>
                            <strong>Respect Our Support Team:</strong> Our team
                            is here to assist you. Treat them with respect to
                            ensure smooth communication and faster resolution.
                          </li>
                          <li>
                            <strong>Consequences of Violations:</strong> First
                            Offense: A warning will be issued. Repeated
                            Offenses: Your account may face temporary or
                            permanent suspension without prior notice
                          </li>
                          <li>
                            <strong>How to Communicate:</strong> Be clear and
                            respectful in your messages. Provide all necessary
                            details about your issue to help us assist you
                            effectively. We value all our users, and maintaining
                            a positive environment is essential for everyone's
                            benefit. Thank you for your understanding and
                            cooperation.
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
