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
import TicketSystemGuard from '@/components/TicketSystemGuard';

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
  ticketType: 'Human' | 'AI';
  aiSubcategory: string;
  humanTicketSubject: string; // New field for Human ticket subjects
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
    ticketType: 'AI',
    aiSubcategory: 'Refill',
    humanTicketSubject: '', // Will be set when subjects are loaded
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
  const [orderIdsError, setOrderIdsError] = useState<string>('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string}[]>([]);

  // ReCAPTCHA state
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { recaptchaSettings, isEnabledForForm } = useReCAPTCHA();

  // Tickets data from API
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  
  // Ticket subjects from admin settings
  const [ticketSubjects, setTicketSubjects] = useState<{ id: number; name: string }[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

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

  // Fetch ticket subjects from admin settings
  const fetchTicketSubjects = async () => {
    setSubjectsLoading(true);
    try {
      const response = await fetch('/api/ticket-subjects');
      if (response.ok) {
        const data = await response.json();
        setTicketSubjects(data.subjects || []);
      } else {
        console.error('Failed to fetch ticket subjects');
      }
    } catch (error) {
      console.error('Error fetching ticket subjects:', error);
    } finally {
      setSubjectsLoading(false);
    }
  };

  // Fetch tickets and subjects on component mount
  useEffect(() => {
    fetchTickets();
    fetchTicketSubjects();
  }, []);

  // Set default humanTicketSubject when subjects are loaded
  useEffect(() => {
    if (ticketSubjects.length > 0 && !formData.humanTicketSubject) {
      setFormData(prev => ({
        ...prev,
        humanTicketSubject: ticketSubjects[0].id.toString()
      }));
    }
  }, [ticketSubjects, formData.humanTicketSubject]);

  const ticketTypes = [
    { value: 'Human', label: 'Human Ticket' },
    { value: 'AI', label: 'AI Ticket' },
  ];

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

  const aiSubcategories = [
    { value: 'Refill', label: 'Refill' },
    { value: 'Cancel', label: 'Cancel' },
    { value: 'Speed Up', label: 'Speed Up' },
    { value: 'Restart', label: 'Restart' },
    { value: 'Fake Complete', label: 'Fake Complete' },
  ];

  // Simulate initial loading for ticket form only
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

  // Handle ticket type changes and AI-specific updates
  useEffect(() => {
    if (formData.ticketType === 'AI') {
      // AI Ticket - hide message and file upload, set category to AI Support
      setShowMessageField(false);
      setShowFileUpload(false);
      setFormData((prev) => ({
        ...prev,
        category: '1', // AI Support
        message: `${formData.orderIds || 'Order ID Not Found'} ${formData.aiSubcategory}`,
      }));
    }
  }, [formData.ticketType, formData.aiSubcategory, formData.orderIds]);

  // Handle Human ticket type setup (only when ticket type changes)
  useEffect(() => {
    if (formData.ticketType === 'Human') {
      // Human Ticket - show message and file upload, set category to Human Support
      setShowMessageField(true);
      setShowFileUpload(true);
      setFormData((prev) => ({
        ...prev,
        category: '13', // Human Support
        // Preserve existing message content
      }));
    }
  }, [formData.ticketType]);

  // Handle ticket type change
  const handleTicketTypeChange = (ticketType: 'Human' | 'AI') => {
    setFormData((prev) => ({
      ...prev,
      ticketType,
      // Reset relevant fields when switching types
      aiSubcategory: ticketType === 'AI' ? 'Refill' : prev.aiSubcategory,
      subcategory: ticketType === 'Human' ? '2' : prev.subcategory,
      humanTicketSubject: ticketType === 'Human' ? (ticketSubjects.length > 0 ? ticketSubjects[0].id.toString() : '1') : prev.humanTicketSubject,
      orderIds: '',
      message: '',
    }));
  };

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrderIdsChange = (value: string) => {
    // Only allow numbers and commas
    const sanitized = value.replace(/[^0-9,]/g, '');
    
    // Validate order ID format
    if (sanitized) {
      const orderIds = sanitized.split(',').map(id => id.trim()).filter(id => id);
      const invalidIds = orderIds.filter(id => {
        // Order ID should be numeric
        return !/^\d+$/.test(id);
      });
      
      if (invalidIds.length > 0) {
        setOrderIdsError(`Invalid order ID format: ${invalidIds.join(', ')}. Order IDs should be numeric.`);
      } else if (orderIds.length > 10) {
        setOrderIdsError('Maximum 10 order IDs allowed per ticket.');
      } else {
        setOrderIdsError('');
      }
    } else {
      setOrderIdsError('');
    }
    
    handleInputChange('orderIds', sanitized);
  };

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const newUploadedFiles: {name: string, url: string}[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file size (3MB max)
        const maxSize = 3 * 1024 * 1024; // 3MB
        if (file.size > maxSize) {
          showToast(`File "${file.name}" is too large. Maximum 3MB allowed.`, 'error');
          continue;
        }

        // Validate file type (only images and PDFs)
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf'
        ];
        if (!allowedTypes.includes(file.type)) {
          showToast(`File "${file.name}" has an unsupported format. Only images and PDFs are allowed.`, 'error');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'uploads'); // Store in public/uploads folder

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          newUploadedFiles.push({
            name: file.name,
            url: result.fileUrl
          });
        } else {
          const error = await response.json();
          showToast(`Failed to upload "${file.name}": ${error.error}`, 'error');
        }
      }

      if (newUploadedFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
        const newAttachments = newUploadedFiles.map(file => file.url);
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...newAttachments]
        }));
        showToast(`${newUploadedFiles.length} file(s) uploaded successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast('Error uploading files. Please try again.', 'error');
    } finally {
      setUploadingFiles(false);
      // Reset the input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  // Remove uploaded file
  const removeUploadedFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(url => url !== fileToRemove.url)
    }));
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

      // Check if both order ID and message fields are empty
      if (!formData.orderIds.trim() && !formData.message.trim()) {
        showToast('Please fill order ID and message field', 'error');
        setIsSubmitting(false);
        return;
      }

      // Validate message field for Human Support tickets
      if (formData.ticketType === 'Human' && !formData.message.trim()) {
        showToast('Message is required for Human Support ticket', 'error');
        setIsSubmitting(false);
        return;
      }

      // Validate order IDs for both Human and AI tickets
      if (!formData.orderIds.trim()) {
        showToast('Order ID is required for all tickets', 'error');
        setIsSubmitting(false);
        return;
      }
      
      if (orderIdsError) {
        showToast('Please fix order ID format errors before submitting', 'error');
        setIsSubmitting(false);
        return;
      }

      // Generate subject based on ticket type
      let subject = '';
      if (formData.ticketType === 'Human') {
        // For Human tickets, use the selected subject from admin settings
        const selectedSubject = ticketSubjects.find(s => s.id === parseInt(formData.humanTicketSubject));
        subject = selectedSubject ? selectedSubject.name : 'General Support';
      } else {
        // For AI tickets, use category and subcategory as before
        const categoryLabel = categories.find(c => c.value === formData.category)?.label || 'Support';
        const subcategoryLabel = subcategories.find(s => s.value === formData.subcategory)?.label || '';
        subject = `${categoryLabel} - ${subcategoryLabel}`;
      }

      // Prepare order IDs array
      const orderIds = formData.orderIds ? formData.orderIds.split(',').map(id => id.trim()).filter(id => id) : [];

      const ticketData = {
        subject,
        message: formData.message,
        category: formData.category,
        subcategory: formData.subcategory,
        ticketType: formData.ticketType,
        aiSubcategory: formData.aiSubcategory,
        humanTicketSubject: formData.humanTicketSubject,
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
        showToast('Ticket submitted successfully! Redirecting to ticket details...', 'success');
        
        // Redirect to the created ticket details page
        if (result.ticket && result.ticket.id) {
          router.push(`/support-tickets/${result.ticket.id}`);
        } else {
          // Fallback: reset form and refresh tickets list if no ticket ID
          setFormData({
            category: '1',
            subcategory: '2',
            ticketType: 'AI',
            aiSubcategory: 'Refill',
            humanTicketSubject: '1',
            orderIds: '',
            message: '',
            subject: '',
            priority: 'medium',
            attachments: [],
          });
          // Clear uploaded files
          setUploadedFiles([]);
          // Refresh tickets list
          fetchTickets();
        }
      } else {
        const error = await response.json();
        showToast(error.error || error.message || 'Failed to submit ticket', 'error');
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
              {isLoading ? (
                // Loading state for ticket form only
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-14 h-14" className="mb-4" />
                    <div className="text-lg font-medium">
                      Loading...
                    </div>
                  </div>
                </div>
              ) : (
                // Main ticket form content
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Ticket Type</label>
                      <select
                        value={formData.ticketType}
                        onChange={(e) =>
                          handleTicketTypeChange(e.target.value as 'Human' | 'AI')
                        }
                        className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      >
                        {ticketTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                  {formData.ticketType === 'AI' ? (
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        value={formData.aiSubcategory}
                        onChange={(e) =>
                          handleInputChange('aiSubcategory', e.target.value)
                        }
                        className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      >
                        {aiSubcategories.map((subcat) => (
                          <option key={subcat.value} value={subcat.value}>
                            {subcat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <select
                        value={formData.humanTicketSubject}
                        onChange={(e) =>
                          handleInputChange('humanTicketSubject', e.target.value)
                        }
                        className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                        disabled={subjectsLoading}
                      >
                        {subjectsLoading ? (
                          <option value="">Loading subjects...</option>
                        ) : (
                          ticketSubjects.map((subject) => (
                            <option key={subject.id} value={subject.id.toString()}>
                              {subject.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  )}
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
                      className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                        orderIdsError 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)]'
                      }`}
                    />
                    {orderIdsError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {orderIdsError}
                      </p>
                    )}
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
                      <label className="form-label">Attachments</label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label
                            htmlFor="file-upload"
                            className="btn btn-secondary flex items-center gap-2 cursor-pointer"
                          >
                            <FaPaperclip className="w-4 h-4" />
                            {uploadingFiles ? 'Uploading...' : 'Attach Files'}
                          </label>
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            disabled={uploadingFiles}
                            className="hidden"
                            accept="image/*,.pdf,.txt,.doc,.docx"
                          />
                          <span className="text-sm text-gray-500">
                            Max 3MB per file. Supported file: images and PDF
                          </span>
                        </div>
                        
                        {/* Display uploaded files */}
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Uploaded Files:
                            </p>
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <FaPaperclip className="w-3 h-3 text-gray-500" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {file.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeUploadedFile(index)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <FaTimes className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
              )}
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

const ProtectedTicketPage = () => (
  <TicketSystemGuard>
    <TicketPage />
  </TicketSystemGuard>
);

export default ProtectedTicketPage;
