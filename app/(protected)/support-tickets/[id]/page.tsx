'use client';

import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCheckCircle,
    FaComments,
    FaExclamationTriangle,
    FaFileAlt,
    FaFileArchive,
    FaFileExcel,
    FaFilePdf,
    FaFileWord,
    FaImage,
    FaPaperclip,
    FaReply,
    FaTicketAlt,
    FaTimes,
    FaUser,
    FaUserShield,
    FaVideo
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

// Mock ButtonLoader component
const ButtonLoader = () => <GradientSpinner size="w-5 h-5" />;

// Interfaces
interface TicketMessage {
  id: string;
  type: 'customer' | 'staff' | 'system';
  author: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  attachments?: TicketAttachment[];
}

interface TicketAttachment {
  id: string;
  filename: string;
  filesize: string;
  mimetype: string;
  url: string;
}

interface SupportTicketDetails {
  id: string;
  subject: string;
  createdAt: string;
  lastUpdated: string;
  status: 'Open' | 'Answered' | 'Customer Reply' | 'Closed';
  messages: TicketMessage[];
}

const UserSupportTicketPage = () => {
  // Set document title
  useEffect(() => {
    document.title = `Ticket #0001 — ${APP_NAME}`;
  }, []);

  // Dummy data for support ticket details
  const dummyTicketDetails: SupportTicketDetails = {
    id: '001',
    subject: 'Instagram followers not delivered - Order #12345',
    createdAt: '2024-06-28T10:30:00Z',
    lastUpdated: '2024-06-29T14:20:00Z',
    status: 'Customer Reply',
    messages: [
      {
        id: 'msg_001',
        type: 'customer',
        author: 'john_doe',
        content: 'Hi, I placed an order for 1000 Instagram followers 3 days ago (Order #12345) but I haven\'t received any followers yet. The delivery was supposed to start within 24 hours. Can you please check what\'s wrong?',
        createdAt: '2024-06-28T10:30:00Z',
        attachments: [
          {
            id: 'att_001',
            filename: 'order_screenshot.png',
            filesize: '234 KB',
            mimetype: 'image/png',
            url: '#'
          }
        ]
      },
      {
        id: 'msg_002',
        type: 'staff',
        author: 'Sarah (Support Team)',
        authorRole: 'Support Team',
        content: 'Hello John,\n\nThank you for contacting us. I\'ve checked your order #12345 and I can see that there was a technical issue with our delivery system that affected orders placed on June 25th.\n\nI\'ve manually triggered your order and the delivery should start within the next 2 hours. You should start seeing followers added to your account gradually over the next 24-48 hours.\n\nI\'ve also added a 10% bonus to your order as compensation for the delay.\n\nPlease let me know if you don\'t see any progress within 4 hours.\n\nBest regards,\nSarah',
        createdAt: '2024-06-28T14:15:00Z'
      },
      {
        id: 'msg_003',
        type: 'customer',
        author: 'john_doe',
        content: 'Thank you for the quick response! I can see that followers are starting to come in now. However, I noticed that some of the followers look like bot accounts. Is this normal? I was expecting real, active followers.',
        createdAt: '2024-06-29T09:20:00Z'
      },
      {
        id: 'msg_004',
        type: 'system',
        author: 'System',
        content: 'Ticket status changed from "Answered" to "Customer Reply"',
        createdAt: '2024-06-29T09:21:00Z'
      }
    ]
  };

  // State management
  const [ticketDetails, setTicketDetails] = useState<SupportTicketDetails>(dummyTicketDetails);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

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
      case 'Closed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <FaImage className="h-4 w-4" />;
    if (mimetype.startsWith('video/')) return <FaVideo className="h-4 w-4" />;
    if (mimetype.includes('pdf')) return <FaFilePdf className="h-4 w-4" />;
    if (mimetype.includes('word')) return <FaFileWord className="h-4 w-4" />;
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return <FaFileExcel className="h-4 w-4" />;
    if (mimetype.includes('zip') || mimetype.includes('rar')) return <FaFileArchive className="h-4 w-4" />;
    return <FaFileAlt className="h-4 w-4" />;
  };

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle reply submission
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    setIsReplying(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage: TicketMessage = {
        id: `msg_${Date.now()}`,
        type: 'customer',
        author: 'john_doe',
        content: replyContent,
        createdAt: new Date().toISOString(),
        attachments: selectedFiles.length > 0 ? selectedFiles.map((file, index) => ({
          id: `att_${Date.now()}_${index}`,
          filename: file.name,
          filesize: `${Math.round(file.size / 1024)} KB`,
          mimetype: file.type,
          url: URL.createObjectURL(file)
        })) : undefined
      };
      
      setTicketDetails(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        status: 'Customer Reply',
        lastUpdated: new Date().toISOString()
      }));
      
      setReplyContent('');
      setSelectedFiles([]);
      showToast('Reply sent successfully', 'success');
    } catch (error) {
      showToast('Error sending reply', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <button 
              onClick={() => window.history.back()}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaArrowLeft className="h-4 w-4" />
              Back to Tickets
            </button>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Ticket #{formatTicketID(ticketDetails.id)}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Messages Thread */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaComments />
                </div>
                <h3 className="card-title">Conversation</h3>
              </div>
              
              <div className="space-y-6">
                {ticketDetails.messages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-4 ${message.type === 'customer' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                      message.type === 'customer' ? 'bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)]' : 
                      message.type === 'staff' ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      {message.type === 'customer' ? <FaUser className="h-4 w-4" /> :
                       message.type === 'staff' ? <FaUserShield className="h-4 w-4" /> :
                       <FaExclamationTriangle className="h-4 w-4" />}
                    </div>
                    
                    <div className={`flex-1 min-w-0 p-4 rounded-lg ${
                      message.type === 'customer' ? 'bg-blue-50 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}>
                      <div className={`flex items-center gap-2 mb-2 ${message.type === 'customer' ? 'justify-end' : ''}`}>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{message.author}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(message.createdAt).toLocaleDateString()} at{' '}
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{message.content}</div>
                      </div>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {message.attachments.map((attachment) => (
                            <a 
                              key={attachment.id} 
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              {getFileIcon(attachment.mimetype)}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                  {attachment.filename}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {attachment.filesize}
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Section */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaReply />
                </div>
                <h3 className="card-title">Post a Reply</h3>
              </div>
              
              <div className="space-y-4">
                <div className="form-group">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    rows={6}
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                  />
                </div>
                
                {/* File Upload */}
                <div className="form-group">
                  <label className="form-label mb-2 flex items-center gap-2">
                    <FaPaperclip />
                    Attachments
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[var(--primary)] file:to-[var(--secondary)] file:text-white hover:file:from-[#4F0FD8] hover:file:to-[#A121E8] transition-all duration-200"
                  />
                  
                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                          {getFileIcon(file.type)}
                          <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{file.name}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round(file.size / 1024)} KB</span>
                          <button
                            onClick={() => removeSelectedFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTimes className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim() || isReplying}
                    className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {isReplying && (
                      <ButtonLoader />
                    )}
                    Submit Reply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Information */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaTicketAlt />
                </div>
                <h3 className="card-title">Ticket Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Subject</label>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ticketDetails.subject}</p>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <span className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticketDetails.status)}`}>
                    {ticketDetails.status}
                  </span>
                </div>
                <div>
                  <label className="form-label">Created</label>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {new Date(ticketDetails.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="form-label">Last Updated</label>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {new Date(ticketDetails.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSupportTicketPage;
