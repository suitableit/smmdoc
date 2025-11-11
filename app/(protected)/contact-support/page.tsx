'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    FaCheckCircle,
    FaClock,
    FaEnvelope,
    FaHeadset,
    FaPaperPlane,
    FaPhone,
    FaQuestionCircle,
    FaTicketAlt,
    FaTimes
} from 'react-icons/fa';
import ReCAPTCHA from '@/components/ReCAPTCHA';
import useReCAPTCHA from '@/hooks/useReCAPTCHA';
import ContactSystemGuard from '@/components/ContactSystemGuard';

const ShimmerStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    .gradient-shimmer {
      background: linear-gradient(90deg, #f0f0f0 0%, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%, #f0f0f0 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .dark .gradient-shimmer {
      background: linear-gradient(90deg, #2d2d2d 0%, #353535 25%, #2f2f2f 50%, #353535 75%, #2d2d2d 100%);
      background-size: 200% 100%;
    }
  `}} />
);

const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
      type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : type === 'info'
        ? 'bg-blue-50 border-blue-200 text-blue-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

function ContactSupportPage() {
  const { appName } = useAppNameWithFallback();

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    attachments: null as FileList | null,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);
  const [contactFormData, setContactFormData] = useState<{
    userPendingCount: number;
    maxPendingContacts: number;
    canSubmit: boolean;
  } | null>(null);
  const user = useCurrentUser();

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { recaptchaSettings, isEnabledForForm } = useReCAPTCHA();

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setPageTitle('Contact Support', appName);
  }, [appName]);

  useEffect(() => {
    const loadContactFormData = async () => {
      try {

        setCategories([
          { id: 1, name: 'General Inquiry' },
          { id: 2, name: 'Business Partnership' },
          { id: 3, name: 'Media & Press' }
        ]);

        setContactFormData({
          userPendingCount: 0,
          maxPendingContacts: 3,
          canSubmit: true
        });

        const response = await fetch('/api/contact-support');
        const data = await response.json();

        if (response.ok && data.success) {
          setCategories(data.data.categories);
          setContactFormData({
            userPendingCount: data.data.userPendingCount,
            maxPendingContacts: data.data.maxPendingContacts,
            canSubmit: data.data.canSubmit
          });
        } else {
          console.log('API error:', data.error);

        }
      } catch (error) {
        console.error('Error loading contact form data:', error);

      } finally {
        setIsLoading(false);
      }
    };

    loadContactFormData();
  }, []);

  const handleNavigateToTicket = () => {
    router.push('/support-tickets');
  };

  const handleNavigateToFAQs = () => {
    router.push('/faqs');
  };

  const handleSubmit = async () => {

    if (contactFormData && !contactFormData.canSubmit) {
      showToast(
        `You have reached the maximum limit of ${contactFormData.maxPendingContacts} pending contacts. Please wait for a response to your previous messages.`,
        'error'
      );
      return;
    }

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

    if (isEnabledForForm('contactSupport') && !recaptchaToken) {
      showToast('Please complete the ReCAPTCHA verification.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {

      const submitData = new FormData();
      submitData.append('subject', formData.subject);
      submitData.append('category', formData.category);
      submitData.append('message', formData.message);

      if (formData.attachments) {
        Array.from(formData.attachments).forEach((file) => {
          submitData.append('attachments', file);
        });
      }

      if (recaptchaToken) {
        submitData.append('recaptchaToken', recaptchaToken);
      }

      const response = await fetch('/api/contact-support', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (response.ok && data.success) {

        showToast(data.message || 'Your message has been sent successfully!', 'success');

        setFormData({
          subject: '',
          category: '',
          message: '',
          attachments: null,
        });
        setSelectedFiles([]);
        setRecaptchaToken(null);

        const fileInput = document.getElementById('attachments') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {

        showToast(data.error || 'Failed to send message. Please try again later.', 'error');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showToast('Failed to send message. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | FileList | null
  ) => {
    if (field === 'attachments' && value instanceof FileList) {
      handleFileSelection(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
  };

  const handleFileSelection = (fileList: FileList) => {
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    const maxFileSize = 3 * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
      'application/pdf'
    ];

    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 4) {
      showToast(`You can only select up to 4 files. You currently have ${selectedFiles.length} files selected.`, 'error');
      return;
    }

    for (const file of files) {

      if (!allowedTypes.includes(file.type)) {
        showToast(`File "${file.name}" has an unsupported format. Only images (JPEG, PNG, GIF, WebP, BMP) and PDFs are allowed.`, 'error');
        continue;
      }

      if (file.size > maxFileSize) {
        showToast(`File "${file.name}" is too large. Maximum file size is 3MB.`, 'error');
        continue;
      }

      if (selectedFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
        showToast(`File "${file.name}" is already selected.`, 'error');
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const newSelectedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newSelectedFiles);

      const dataTransfer = new DataTransfer();
      newSelectedFiles.forEach(file => dataTransfer.items.add(file));

      setFormData((prev) => ({
        ...prev,
        attachments: dataTransfer.files,
      }));

      showToast(`${validFiles.length} file(s) selected successfully!`, 'success');
    }
  };

  const removeSelectedFile = (index: number) => {
    const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newSelectedFiles);

    if (newSelectedFiles.length === 0) {
      setFormData((prev) => ({
        ...prev,
        attachments: null,
      }));
    } else {

      const dataTransfer = new DataTransfer();
      newSelectedFiles.forEach(file => dataTransfer.items.add(file));

      setFormData((prev) => ({
        ...prev,
        attachments: dataTransfer.files,
      }));
    }
  };

  if (isLoading) {
    return (
      <>
        <ShimmerStyles />
        <div className="page-container">
          <div className="page-content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="card card-padding">
                  <div className="card-header">
                    <div className="card-icon">
                      <FaHeadset />
                    </div>
                    <h3 className="card-title">Send Message</h3>
                  </div>

                  <div className="space-y-6 mt-6">
                    <div className="form-group">
                      <div className="h-4 w-20 gradient-shimmer rounded mb-2" />
                      <div className="h-10 w-full gradient-shimmer rounded-lg" />
                    </div>

                    <div className="form-group">
                      <div className="h-4 w-16 gradient-shimmer rounded mb-2" />
                      <div className="h-10 w-full gradient-shimmer rounded-lg" />
                    </div>

                    <div className="form-group">
                      <div className="h-4 w-20 gradient-shimmer rounded mb-2" />
                      <div className="h-10 w-full gradient-shimmer rounded-lg" />
                    </div>

                    <div className="form-group">
                      <div className="h-4 w-16 gradient-shimmer rounded mb-2" />
                      <div className="h-24 w-full gradient-shimmer rounded-lg" />
                      <div className="h-3 w-64 gradient-shimmer rounded mt-1" />
                    </div>

                    <div className="form-group">
                      <div className="h-4 w-32 gradient-shimmer rounded mb-2" />
                      <div className="h-10 w-full gradient-shimmer rounded-lg" />
                    </div>

                    <button
                      type="button"
                      disabled
                      className="btn btn-primary w-full"
                    >
                      <FaPaperPlane className="mr-2 w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
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
                        <p className="text-gray-600 text-sm">support@smmdoc.com</p>
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

                <div className="card card-padding">
                  <div className="card-header">
                    <div className="card-icon">
                      <FaTicketAlt />
                    </div>
                    <h3 className="card-title">Support Tickets</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      For ongoing issues, you can also create a Support Tickets
                      and track its progress.
                    </p>
                    <Link
                      href="/support-tickets/history"
                      className={`btn btn-secondary w-full inline-flex items-center justify-center`}
                    >
                      <FaTicketAlt className="mr-2 w-4 h-4" />
                      View My Ticket
                    </Link>
                  </div>
                </div>

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
                    <Link
                      href="/faqs"
                      className={`btn btn-secondary w-full inline-flex items-center justify-center`}
                    >
                      <FaQuestionCircle className="mr-2 w-4 h-4" />
                      View FAQs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="page-container">
      {}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="page-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2">
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaHeadset />
                </div>
                <h3 className="card-title">Send Message</h3>
              </div>

              <div className="space-y-6">
                {}
                <div className="form-group">
                  <label className="form-label" htmlFor="username">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    value={user?.username || 'Guest User'}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
                  />
                </div>

                {}
                <div className="form-group">
                  <label className="form-label" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter the subject of your inquiry"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange('subject', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange('category', e.target.value)
                    }
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder="Please describe your issue in detail"
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange('message', e.target.value)
                    }
                    required
                  />
                  <small className="text-xs text-gray-500 mt-1">
                    Include any relevant details that might help us resolve your
                    issue faster.
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="attachments">
                    Attachments (Optional)
                  </label>
                  <input
                    type="file"
                    id="attachments"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[var(--primary)] file:to-[var(--secondary)] file:text-white hover:file:from-[#4F0FD8] hover:file:to-[#A121E8] transition-all duration-200"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Selected Files ({selectedFiles.length}/4):
                      </p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex-shrink-0">
                            {file.type.startsWith('image/') ? (
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">IMG</span>
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-red-600 dark:text-red-400 text-xs font-bold">PDF</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              {file.name}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="flex-shrink-0 p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Remove file"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {}
                {isEnabledForForm('contactSupport') && recaptchaSettings && (
                  <ReCAPTCHA
                    siteKey={recaptchaSettings.siteKey}
                    version={recaptchaSettings.version}
                    action="contactSupport"
                    threshold={recaptchaSettings.threshold}
                    onVerify={(token) => {
                      setRecaptchaToken(token);
                    }}
                    onError={() => {
                      setRecaptchaToken(null);


                    }}
                    onExpired={() => {
                      setRecaptchaToken(null);

                    }}
                  />
                )}

                {}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <>
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

          {}
          <div className="space-y-6">
            {}
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
                    <p className="text-gray-600 text-sm">support@smmdoc.com</p>
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

            {}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaTicketAlt />
                </div>
                <h3 className="card-title">Support Tickets</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  For ongoing issues, you can also create a Support Tickets and
                  track its progress.
                </p>
                <Link
                  href="/support-tickets/history"
                  className={`btn btn-secondary w-full inline-flex items-center justify-center`}
                  >
                  <FaTicketAlt className="mr-2 w-4 h-4" />
                  View My Ticket
                </Link>
              </div>
            </div>

            {}
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
                <Link
                  href="/faqs"
                  className={`btn btn-secondary w-full inline-flex items-center justify-center`}
                  >
                  <FaQuestionCircle className="mr-2 w-4 h-4" />
                    View FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProtectedContactSupportPage = () => (
  <ContactSystemGuard>
    <ContactSupportPage />
  </ContactSystemGuard>
);

export default ProtectedContactSupportPage;
