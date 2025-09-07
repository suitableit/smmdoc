'use client';

import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
    FaArrowLeft,
    FaCheckCircle,
    FaChevronDown,
    FaChevronUp,
    FaComments,
    FaEnvelope,
    FaEye,
    FaFileAlt,
    FaFileArchive,
    FaFileExcel,
    FaFilePdf,
    FaFileWord,
    FaImage,
    FaPaperPlane,
    FaPlus,
    FaReply,
    FaStickyNote,
    FaTimes,
    FaUser,
    FaVideo
} from 'react-icons/fa';

// Import APP_NAME constant
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';

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
interface ContactMessage {
  id: string;
  type: 'customer' | 'staff' | 'system';
  author: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  attachments?: ContactAttachment[];
  isEdited?: boolean;
  editedAt?: string;
}

interface ContactAttachment {
  id: string;
  filename: string;
  filesize: string;
  mimetype: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface ContactNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isPrivate: boolean;
}

interface ContactMessageDetails {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  category: string;
  subject: string;
  createdAt: string;
  lastUpdated: string;
  status: 'Unread' | 'Read' | 'Replied';
  messages: ContactMessage[];
  notes: ContactNote[];
  timeSpent: number; // in minutes
  userInfo: {
    fullName: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    registeredAt: string;
    totalMessages: number;
    openMessages: number;
  };
}

const ContactDetailsPage = () => {
  const { appName } = useAppNameWithFallback();
  const currentUser = useCurrentUser();

  // Get message ID from URL
  const messageId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '1';

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle(`Message Details ${formatMessageID(messageId)}`, appName);
  }, [messageId]);



  // State management
  const [contactDetails, setContactDetails] = useState<ContactMessageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(true);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  


  // Utility functions
  const formatMessageID = (id: string) => {
    return `#${parseInt(id.toString()).toString()}`;
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

  // Fetch contact details from API
  const fetchContactDetails = async () => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}?include_notes=true`);
      const data = await response.json();

      if (response.ok && data.success) {
        // Create messages array with customer message and admin reply if exists
        const messages: ContactMessage[] = [];
        
        // Add customer's original message
        if (data.message.message) {
          messages.push({
            id: `customer_${data.message.id}`,
            type: 'customer',
            author: data.message.user?.username || 'Unknown User',
            content: data.message.message,
            createdAt: data.message.createdAt,
            attachments: data.message.attachments || []
          });
        }
        
        // Add admin replies if they exist
        if (data.message.adminReply) {
          try {
            // Try to parse as JSON array (new format with multiple replies)
            const replies = JSON.parse(data.message.adminReply);
            if (Array.isArray(replies)) {
              // New format: multiple replies
              replies.forEach((reply, index) => {
                messages.push({
                  id: `admin_${data.message.id}_${index}`,
                  type: 'staff',
                  author: reply.author || 'Admin',
                  content: reply.content,
                  createdAt: reply.repliedAt
                });
              });
            } else {
              // Fallback: single reply
              messages.push({
                id: `admin_${data.message.id}`,
                type: 'staff',
                author: data.message.repliedByUser?.username || 'Admin',
                content: data.message.adminReply,
                createdAt: data.message.repliedAt || data.message.updatedAt
              });
            }
          } catch {
            // Old format: single reply string
            messages.push({
              id: `admin_${data.message.id}`,
              type: 'staff',
              author: data.message.repliedByUser?.username || 'Admin',
              content: data.message.adminReply,
              createdAt: data.message.repliedAt || data.message.updatedAt
            });
          }
        }

        // Transform API data to match the expected format
        const transformedData: ContactMessageDetails = {
          id: data.message.id.toString(),
          userId: data.message.userId.toString(),
          username: data.message.user?.username || 'Unknown User',
          userEmail: data.message.user?.email || 'No Email',
          category: data.message.category?.name || 'Unknown Category',
          subject: data.message.subject,
          createdAt: data.message.createdAt,
          lastUpdated: data.message.updatedAt,
          status: data.message.status || 'Read', // Use actual status from database
          messages: messages, // Now populated with actual conversation
          notes: (data.message.notes || []).map((note: any) => ({
            id: note.id,
            content: note.content,
            author: note.admin_username || note.author || 'Unknown',
            createdAt: note.created_at,
            isPrivate: note.is_private || true
          })),
          timeSpent: data.message.time_spent || 0,
          userInfo: {
            fullName: data.message.user?.name || data.message.user?.username || 'Unknown User',
            email: data.message.user?.email || 'No Email',
            phone: data.message.user?.phone || '',
            company: data.message.user?.company || '',
            address: data.message.user?.address || '',
            registeredAt: data.message.user?.created_at || data.message.user?.registeredAt || new Date().toISOString(),
            totalMessages: data.message.user?.total_messages || 1,
            openMessages: data.message.user?.open_messages || 0
          }
        };

        setContactDetails(transformedData);
        
        // Auto-mark message as read if it wasn't already
        if (data.message.status !== 'Read') {
          markAsRead();
        }
      } else {
        showToast(data.error || 'Failed to load contact details', 'error');
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      showToast('Error loading contact details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mark message as read
  const markAsRead = async () => {
    try {
      await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Read'
        }),
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Load contact details on component mount
  useEffect(() => {
    if (messageId) {
      fetchContactDetails();
    }
  }, [messageId]);

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
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reply',
          adminReply: replyContent.trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the contact details with the reply
        setContactDetails(prev => prev ? ({
          ...prev,
          adminReply: replyContent.trim(),
          status: 'Replied',
          lastUpdated: new Date().toISOString(),
          repliedAt: new Date().toISOString()
        }) : null);

        setReplyContent('');
        showToast(data.message || 'Reply sent successfully', 'success');

        // Refresh the data to get updated information
        fetchContactDetails();
      } else {
        showToast(data.error || 'Error sending reply', 'error');
      }
    } catch (error) {
      showToast('Error sending reply', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsAddingNote(true);
    
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const updatedMessage = await response.json();
      
      // Update contact details with the new notes
      setContactDetails(prev => prev ? ({
        ...prev,
        notes: updatedMessage.notes.map((note: any) => ({
          id: note.id,
          content: note.content,
          author: note.author,
          createdAt: note.createdAt,
          isPrivate: note.isPrivate
        }))
      }) : null);
      
      setNewNote('');
      showToast('Note added successfully', 'success');
    } catch (error) {
      console.error('Error adding note:', error);
      showToast('Error adding note', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };





  // Show loading state
  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <GradientSpinner size="w-16 h-16" className="mx-auto mb-4" />
              <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Loading contact details...</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Please wait while we fetch the message information.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no contact details
  if (!contactDetails) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Message Not Found</h2>
              <p className="text-lg mb-4" style={{ color: 'var(--text-muted)' }}>The requested contact message could not be found.</p>
              <button 
                onClick={() => window.history.back()}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                <FaArrowLeft className="h-4 w-4" />
                Back to Messages
              </button>
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
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            {/* 1st line: Back to Messages button, Status dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="btn btn-primary flex items-center gap-2"
              >
                <FaArrowLeft className="h-4 w-4" />
                Back to Messages
              </button>


            </div>
            
            <div className="flex flex-row items-center gap-1 md:gap-2">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Message {formatMessageID(contactDetails?.id || '1')}
              </h1>

            </div>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message Info Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaEnvelope />
                </div>
                <h3 className="card-title">Message Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="form-label">Subject</label>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{contactDetails?.subject || 'No Subject'}</p>
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{contactDetails?.category || 'Unknown'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="form-label">Created</label>
                  <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                    {contactDetails?.createdAt ? new Date(contactDetails.createdAt).toLocaleDateString() : 'Unknown'} at{' '}
                    {contactDetails?.createdAt ? new Date(contactDetails.createdAt).toLocaleTimeString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="form-label">Last Updated</label>
                  <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                    {contactDetails?.lastUpdated ? new Date(contactDetails.lastUpdated).toLocaleDateString() : 'Unknown'} at{' '}
                    {contactDetails?.lastUpdated ? new Date(contactDetails.lastUpdated).toLocaleTimeString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaComments />
                </div>
                <h3 className="card-title">Customer Message</h3>
              </div>
              
              <div className="space-y-6">
                {(contactDetails?.messages || [])
                  .filter(message => message.type === 'customer')
                  .map((message) => (
                  <div key={message.id}>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{message.content}</div>
                    </div>
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Attachments:</h4>
                        {message.attachments.map((attachment, index) => {
                          // Handle both string paths and object attachments
                          const attachmentUrl = typeof attachment === 'string' ? attachment : attachment.url;
                          const filename = typeof attachment === 'string' 
                            ? attachment.split('/').pop() || 'Unknown file'
                            : attachment.filename;
                          const mimetype = typeof attachment === 'string'
                            ? ''
                            : attachment.mimetype;
                          
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              {getFileIcon(mimetype)}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                  {filename}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {typeof attachment === 'object' && attachment.filesize ? `${attachment.filesize} • ` : ''}Attachment
                                </div>
                              </div>
                              <button 
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => window.open(attachmentUrl, '_blank')}
                                title="View attachment"
                              >
                                <FaEye className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Box */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaReply />
                </div>
                <h3 className="card-title">Reply</h3>
              </div>
              
              <div className="space-y-6">
                {(contactDetails?.messages || []).filter(message => message.type === 'staff').length > 0 ? (
                  (contactDetails?.messages || [])
                    .filter(message => message.type === 'staff')
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((message) => (
                    <div key={message.id}>
                      <div className="mb-2">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {message.author} • {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{message.content}</div>
                      </div>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Attachments:</h4>
                          {message.attachments.map((attachment, index) => {
                            // Handle both string paths and object attachments
                            const attachmentUrl = typeof attachment === 'string' ? attachment : attachment.url;
                            const filename = typeof attachment === 'string' 
                              ? attachment.split('/').pop() || 'Unknown file'
                              : attachment.filename;
                            const mimetype = typeof attachment === 'string'
                              ? ''
                              : attachment.mimetype;
                            
                            return (
                              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                {getFileIcon(mimetype)}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                    {filename}
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {typeof attachment === 'object' && attachment.filesize ? `${attachment.filesize} • ` : ''}Attachment
                                  </div>
                                </div>
                                <button 
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => window.open(attachmentUrl, '_blank')}
                                  title="View attachment"
                                >
                                  <FaEye className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    <FaReply className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No replied yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reply Section - Only show if no reply exists */}
            {(contactDetails?.messages || []).filter(message => message.type === 'staff').length === 0 && (
              <div className="card card-padding overflow-hidden">
                <div className="card-header">
                  <div className="card-icon">
                    <FaPaperPlane />
                  </div>
                  <h3 className="card-title">Send Reply</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="form-group">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your reply to the customer..."
                      rows={6}
                      className="form-field w-full min-w-0 px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none max-h-48 overflow-y-auto"
                    />
                    <small className="text-xs text-gray-500 mt-1 block">
                      This reply will be sent to the customer and will update the message status to "Replied". You can only reply once.
                    </small>
                  </div>
                  

                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReplySubmit}
                      disabled={!replyContent.trim() || isReplying}
                      className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      {!isReplying && <FaPaperPlane className="h-3 w-3" />}
                      {isReplying ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Replied button when reply already sent */}
            {(contactDetails?.messages || []).filter(message => message.type === 'staff').length > 0 && (
              <div className="flex justify-left mt-4">
                <button
                  disabled
                  className="btn btn-primary opacity-50 cursor-not-allowed"
                >
                  Replied
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="card card-padding">
              <div 
                className="card-header cursor-pointer flex items-center justify-between"
                onClick={() => setShowUserInfo(!showUserInfo)}
              >
                <div className="flex items-center gap-2">
                  <div className="card-icon">
                    <FaUser />
                  </div>
                  <h3 className="card-title">Customer Information</h3>
                </div>
                {showUserInfo ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {showUserInfo && (
                <div className="space-y-4">
                  <div>
                    <div className="form-label">Username</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{contactDetails?.username || 'No Username'}</div>
                  </div>
                  <div>
                    <div className="form-label">Full Name</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{contactDetails?.userInfo?.fullName || 'No Name'}</div>
                  </div>
                  <div>
                    <div className="form-label">Email</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{contactDetails?.userInfo?.email || contactDetails?.userEmail}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <div className="form-label">Total Messages</div>
                      <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{contactDetails?.userInfo?.totalMessages || 0}</div>
                    </div>
                    <div>
                      <div className="form-label">Open Messages</div>
                      <div className="text-lg font-semibold text-orange-600">{contactDetails?.userInfo?.openMessages || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div className="card card-padding overflow-hidden">
              <div 
                className="card-header cursor-pointer flex items-center justify-between"
                onClick={() => setShowNotes(!showNotes)}
              >
                <div className="flex items-center gap-2">
                  <div className="card-icon">
                    <FaStickyNote />
                  </div>
                  <h3 className="card-title">Internal Notes ({contactDetails?.notes?.length || 0})</h3>
                </div>
                {showNotes ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {showNotes && (
                <div>
                  {/* Add Note Form */}
                  <div className="mb-4">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add an internal note..."
                      rows={3}
                      className="form-field w-full min-w-0 px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none max-h-32 overflow-y-auto"
                    />
                    <small className="text-xs text-gray-500 mt-1 block">
                      Internal notes are only visible to support staff members.
                    </small>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || isAddingNote}
                      className="mt-2 btn btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {!isAddingNote && <FaPlus className="h-3 w-3" />}
                      {isAddingNote ? 'Adding...' : 'Add Note'}
                    </button>
                  </div>
                  
                  {/* Notes List */}
                  <div className="space-y-3">
                    {(contactDetails?.notes || []).map((note) => (
                       <div key={note.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                         <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                           {note.author} • {new Date(note.createdAt).toLocaleDateString()}
                         </div>
                         <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{note.content}</div>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContactDetailsPage;
