'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaInfoCircle,
  FaPaperclip,
  FaTicketAlt,
  FaTimes,
} from 'react-icons/fa';

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
}

interface Ticket {
  id: string;
  subject: string;
  status: 'New' | 'Answered' | 'Closed' | 'Pending';
  lastUpdate: string;
}

const TicketPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>({
    category: '1',
    subcategory: '2',
    orderIds: '',
    message: '',
  });
  const [showMessageField, setShowMessageField] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Sample Ticket data
  const [Ticket] = useState<Ticket[]>([
    {
      id: '227663',
      subject: 'Welcome',
      status: 'New',
      lastUpdate: '2025-05-02 02:47:56',
    },
  ]);

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast('Ticket submitted successfully!', 'success');
      setFormData({
        category: '1',
        subcategory: '2',
        orderIds: '',
        message: '',
      });
    } catch (error) {
      showToast('Failed to submit ticket. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'New':
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            {status}
          </span>
        );
      case 'Answered':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            {status}
          </span>
        );
      case 'Closed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            {status}
          </span>
        );
      case 'Pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            {status}
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
    router.push('/support-ticket/history');
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
            {/* Tab Navigation */}
            <div className="card" style={{ padding: '8px' }}>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'new'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
                  }`}
                >
                  <FaTicketAlt className="mr-2 w-4 h-4" />
                  New Ticket
                </button>
                <button
                  onClick={handleticketsHistoryClick}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'history'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-600'
                  }`}
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
                      className="form-select"
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
                      className="form-select"
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
                      className="form-input"
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
                        className="form-input"
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

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="btn btn-primary w-full"
                  >
                    {isSubmitting ? <ButtonLoader /> : 'Submit ticket'}
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