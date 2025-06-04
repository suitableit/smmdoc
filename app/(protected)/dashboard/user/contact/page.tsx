'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useState } from 'react';
import { 
  FaEnvelope, 
  FaPhone, 
  FaClock, 
  FaTicketAlt, 
  FaQuestionCircle, 
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaTimes,
  FaHeadset,
  FaFileUpload
} from 'react-icons/fa';

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
    type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
    type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
    type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
    'bg-yellow-50 border-yellow-200 text-yellow-800'
  }`}>
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default function ContactSupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    attachments: null as FileList | null
  });
  const user = useCurrentUser();

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'pending' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!formData.subject || formData.subject.length < 5) {
      showToast('Subject must be at least 5 characters', 'error');
      return;
    }
    
    if (!formData.category) {
      showToast('Please select a category', 'error');
      return;
    }
    
    if (!formData.message || formData.message.length < 20) {
      showToast('Message must be at least 20 characters', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      showToast('Your message has been sent successfully! We will get back to you as soon as possible.', 'success');
      
      // Reset form
      setFormData({
        subject: '',
        category: '',
        message: '',
        attachments: null
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showToast('Failed to send message. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | FileList | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
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
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Contact Support</h1>
          <p className="page-description">Send us a message and we'll get back to you as soon as possible</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact Form */}
          <div className="lg:col-span-2">
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaHeadset />
                </div>
                <h3 className="card-title">Send Message</h3>
              </div>

              <div className="space-y-6">
                {/* Username */}
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    className="form-input"
                    value={user?.name || user?.username || 'Guest User'}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
                  />
                </div>

                {/* Subject */}
                <div className="form-group">
                  <label className="form-label" htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className="form-input"
                    placeholder="Enter the subject of your inquiry"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <select
                    id="category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="orders">Order Issues</option>
                    <option value="account">Account Management</option>
                    <option value="api">API & Integration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div className="form-group">
                  <label className="form-label" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    className="form-input"
                    placeholder="Please describe your issue in detail"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                  <small className="text-xs text-gray-500 mt-1">
                    Include any relevant details that might help us resolve your issue faster.
                  </small>
                </div>

                {/* Attachments */}
                <div className="form-group">
                  <label className="form-label" htmlFor="attachments">
                    <FaFileUpload className="inline mr-2" />
                    Attachments (Optional)
                  </label>
                  <input
                    type="file"
                    id="attachments"
                    className="form-input"
                    multiple
                    onChange={(e) => handleInputChange('attachments', e.target.files)}
                  />
                  <small className="text-xs text-gray-500 mt-1">
                    You can upload screenshots or other relevant files (max 5MB each).
                  </small>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 w-4 h-4" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2 w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info & Links */}
          <div className="space-y-6">
            
            {/* Contact Information Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaEnvelope />
                </div>
                <h3 className="card-title">Contact Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <FaEnvelope className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Email</h4>
                    <p className="text-gray-600 text-sm">support@smmcompany.com</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <FaPhone className="text-green-600 text-sm" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Phone</h4>
                    <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <FaClock className="text-purple-600 text-sm" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Hours</h4>
                    <p className="text-gray-600 text-sm">24/7 Support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Tickets Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaTicketAlt />
                </div>
                <h3 className="card-title">Support Tickets</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  For ongoing issues, you can also create a support ticket and track its progress.
                </p>
                <a href="/dashboard/user/tickets" className="btn btn-secondary w-full inline-flex items-center justify-center">
                  <FaTicketAlt className="mr-2 w-4 h-4" />
                  View My Tickets
                </a>
              </div>
            </div>

            {/* FAQ Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaQuestionCircle />
                </div>
                <h3 className="card-title">Frequently Asked Questions</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Check our FAQ section for quick answers to common questions.
                </p>
                <a href="/dashboard/user/faqs" className="btn btn-secondary w-full inline-flex items-center justify-center">
                  <FaQuestionCircle className="mr-2 w-4 h-4" />
                  View FAQs
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}