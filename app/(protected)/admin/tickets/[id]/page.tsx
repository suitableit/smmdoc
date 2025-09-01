'use client';

import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCheckCircle,
    FaChevronDown,
    FaChevronUp,
    FaComments,
    FaExclamationTriangle,
    FaEye,
    FaFileAlt,
    FaFileArchive,
    FaFileExcel,
    FaFilePdf,
    FaFileWord,
    FaImage,
    FaPlus,
    FaReply,
    FaStickyNote,
    FaTicketAlt,
    FaTimes,
    FaUser,
    FaUserShield,
    FaVideo
} from 'react-icons/fa';

// Import APP_NAME constant
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import useTicketPolling from '@/hooks/useTicketPolling';

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
  isEdited?: boolean;
  editedAt?: string;
  userImage?: string;
}

interface TicketAttachment {
  id: string;
  filename: string;
  filesize: string;
  mimetype: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface TicketNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isPrivate: boolean;
}

interface SupportTicketDetails {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  subject: string;
  createdAt: string;
  lastUpdated: string;
  status: 'Open' | 'Answered' | 'Customer Reply' | 'On Hold' | 'In Progress' | 'closed';
  isRead: boolean;
  messages: TicketMessage[];
  notes: TicketNote[];
  assignedTo?: string;
  timeSpent: number; // in minutes
  ticketType?: 'Human' | 'AI';
  aiSubcategory?: 'Refill' | 'Cancel' | 'Speed Up' | 'Restart' | 'Fake Complete';
  systemMessage?: string;
  ticketStatus?: 'Pending' | 'Processed' | 'Failed';
  orderIds?: string[];
  userInfo: {
    fullName: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    registeredAt: string;
    totalTickets: number;
    openTickets: number;
  };
}

const SupportTicketDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { appName } = useAppNameWithFallback();
  const [ticketId, setTicketId] = useState<string | null>(null);

  // Safely resolve params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setTicketId(resolvedParams.id);
      } catch (error) {
        console.error('Error resolving params:', error);
      }
    };
    resolveParams();
  }, [params]);

  // Set document title using useEffect for client-side
  useEffect(() => {
    if (ticketId) {
      setPageTitle(`Ticket #${ticketId}`, appName);
    }
  }, [appName, ticketId]);



  // State management
  const [ticketDetails, setTicketDetails] = useState<SupportTicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isClosingTicket, setIsClosingTicket] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Real-time polling for message updates
  const { hasNewMessages, markMessagesAsRead, isPolling } = useTicketPolling(
    ticketId,
    ticketDetails,
    setTicketDetails,
    3000 // Poll every 3 seconds
  );

  // Fetch ticket details
  useEffect(() => {
    if (!ticketId) return;
    
    const fetchTicketDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/tickets/${ticketId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ticket details');
        }
        const result = await response.json();
        const data = result.ticket;
        
        // Use the userInfo data from the API response
        const enhancedData = {
          ...data,
          userInfo: {
            ...data.userInfo,
            fullName: data.userInfo?.name || 'N/A',
            phone: 'N/A', // Not available in current schema
            company: 'N/A', // Not available in current schema
            address: 'N/A', // Not available in current schema
            registeredAt: 'N/A', // Would need user creation date
          }
        };
        
        setTicketDetails(enhancedData);
        
        // Automatically mark ticket as read when admin opens it
        if (!data.isRead) {
          try {
            await fetch(`/api/admin/tickets/${ticketId}/read`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ isRead: true }),
            });
          } catch (readError) {
            console.error('Error marking ticket as read:', readError);
          }
        }
      } catch (error) {
        console.error('Error fetching ticket details:', error);
        showToast('Error loading ticket details', 'error');
        setTicketDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  // Utility functions
  const formatTicketID = (id: string | number) => {
    return String(id || '0');
  };

  const calculateTimeSpent = (createdAt: string, status: string, lastUpdated?: string) => {
    const created = new Date(createdAt);
    let endTime: Date;
    
    // If ticket is closed, use lastUpdated as end time, otherwise use current time
    if (status === 'Closed' && lastUpdated) {
      endTime = new Date(lastUpdated);
    } else if (status === 'Closed') {
      // If no lastUpdated, assume it was closed at creation time
      endTime = created;
    } else {
      endTime = new Date();
    }
    
    const diffMs = endTime.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
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
      case 'closed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatStatusDisplay = (status: string) => {
    switch (status) {
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (!mimetype) return <FaFileAlt className="h-4 w-4" />;
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

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }

      const responseData = await response.json();
      setTicketDetails(responseData.ticket);
      
      showToast(`Ticket status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      showToast('Error updating ticket status', 'error');
    }
  };

  // Handle ticket closing
  const handleCloseTicket = async () => {
    const confirmed = window.confirm('Are you sure you want to close this ticket? This action cannot be undone.');
    if (!confirmed) return;

    setIsClosingTicket(true);
    try {
      const response = await fetch(`/api/support-tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'closed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to close ticket');
      }

      const updatedTicket = await response.json();
      setTicketDetails(updatedTicket);
      
      showToast('Ticket has been closed successfully', 'success');
    } catch (error) {
      console.error('Error closing ticket:', error);
      showToast('Error closing ticket', 'error');
    } finally {
      setIsClosingTicket(false);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    setIsReplying(true);
    
    try {
      let attachmentPaths: string[] = [];
      
      // Upload files first if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileFormData = new FormData();
          fileFormData.append('file', file);
          fileFormData.append('uploadType', 'admin_uploads');
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: fileFormData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${file.name}`);
          }
          
          const uploadResult = await uploadResponse.json();
          attachmentPaths.push(uploadResult.filePath);
        }
      }
      
      // Send reply with attachment paths
      const response = await fetch(`/api/support-tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyContent,
          attachments: attachmentPaths.length > 0 ? JSON.stringify(attachmentPaths) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      const responseData = await response.json();
      setTicketDetails(responseData.ticket);
      
      setReplyContent('');
      setSelectedFiles([]);
      showToast('Reply sent successfully', 'success');
    } catch (error) {
      console.error('Error sending reply:', error);
      showToast(error instanceof Error ? error.message : 'Error sending reply', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsAddingNote(true);
    
    try {
      const response = await fetch(`/api/support-tickets/${ticketId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const updatedTicket = await response.json();
      setTicketDetails(updatedTicket);
      
      setNewNote('');
      showToast('Note added successfully', 'success');
    } catch (error) {
      console.error('Error adding note:', error);
      showToast('Error adding note', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Validate file type (only images and PDFs)
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf'
      ];
      if (!allowedTypes.includes(file.type)) {
        showToast(`File "${file.name}" has an unsupported format. Only images and PDFs are allowed.`, 'error');
        continue;
      }
      
      // Validate file size (10MB max for admin)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showToast(`File "${file.name}" is too large. Maximum 10MB allowed for admin uploads.`, 'error');
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      showToast(`${validFiles.length} file(s) selected successfully!`, 'success');
    }
    
    // Reset the input value to allow uploading the same file again
    event.target.value = '';
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Show loading state
  if (loading || !ticketId) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <GradientSpinner size="w-12 h-12" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading ticket details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no ticket data
  if (!ticketDetails) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ticket Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The ticket you're looking for doesn't exist or has been deleted.</p>
            <button 
              onClick={() => window.history.back()}
              className="btn btn-primary"
            >
              Go Back
            </button>
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
            {/* 1st line: Back to Tickets button, Status dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="btn btn-primary flex items-center gap-2"
              >
                <FaArrowLeft className="h-4 w-4" />
                Back to Tickets
              </button>

              {/* Status Controls - Only show if ticket is not closed */}
              {ticketDetails.status !== 'closed' && (
                <select 
                  value={ticketDetails.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="form-field pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
                >
                  <option value="Open">Open</option>
                  <option value="Answered">Answered</option>
                  <option value="Customer Reply">Customer Reply</option>
                  <option value="On Hold">On Hold</option>
                  <option value="In Progress">In Progress</option>
                </select>
              )}
              {ticketDetails.status === 'closed' && (
                <button 
                  disabled
                  className="btn btn-primary opacity-75 cursor-not-allowed"
                >
                  Closed
                </button>
              )}
            </div>
            
            <div className="flex flex-row items-center gap-1 md:gap-2">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Ticket #{formatTicketID(ticketDetails.id)}
              </h1>
            </div>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Info Card */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaTicketAlt />
                </div>
                <h3 className="card-title">Ticket Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="form-label">Subject</label>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ticketDetails.subject}</p>
                </div>
                {ticketDetails.orderIds && Array.isArray(ticketDetails.orderIds) && ticketDetails.orderIds.length > 0 && (
                  <div>
                    <label className="form-label">
                      {ticketDetails.orderIds.length === 1 ? 'Order ID' : 'Order IDs'}
                    </label>
                    <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {ticketDetails.orderIds.join(', ')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="form-label">Status</label>
                  <span className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticketDetails.status)}`}>
                    {formatStatusDisplay(ticketDetails.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="form-label">Created</label>
                  <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                    {new Date(ticketDetails.createdAt).toLocaleDateString()} at{' '}
                    {new Date(ticketDetails.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <label className="form-label">Last Updated</label>
                  <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                    {new Date(ticketDetails.lastUpdated).toLocaleDateString()} at{' '}
                    {new Date(ticketDetails.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <label className="form-label">Time Spent</label>
                  <p className="mt-1" style={{ color: 'var(--text-primary)' }}>{calculateTimeSpent(ticketDetails.createdAt, ticketDetails.status, ticketDetails.lastUpdated)}</p>
                </div>
              </div>
            </div>

            {/* AI Ticket System Message */}
            {ticketDetails.ticketType === 'AI' && ticketDetails.systemMessage && (
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaExclamationTriangle />
                  </div>
                  <h3 className="card-title">System Processing Result</h3>
                </div>
                
                <div className={`p-4 rounded-lg border-l-4 ${
                  ticketDetails.ticketStatus === 'Processed' 
                    ? 'bg-green-50 border-green-400 text-green-800' 
                    : ticketDetails.ticketStatus === 'Failed'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      ticketDetails.ticketStatus === 'Processed' 
                        ? 'bg-green-500' 
                        : ticketDetails.ticketStatus === 'Failed'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}>
                      {ticketDetails.ticketStatus === 'Processed' ? '✓' : 
                       ticketDetails.ticketStatus === 'Failed' ? '✗' : '⏳'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">
                        AI {ticketDetails.aiSubcategory} Request - {ticketDetails.ticketStatus}
                      </h4>
                      <p className="text-sm whitespace-pre-wrap">{ticketDetails.systemMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Thread */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaComments />
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <h3 className="card-title">Conversation ({ticketDetails.messages?.length || 0})</h3>
                </div>
              </div>
              
              <div className="space-y-6" onClick={() => hasNewMessages && markMessagesAsRead()}>
                {ticketDetails.messages && ticketDetails.messages.length > 0 ? (
                  ticketDetails.messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                      {message.type === 'system' ? (
                         <div className="w-full h-full flex items-center justify-center text-white font-medium text-sm bg-gradient-to-r from-gray-600 to-gray-700">
                           <FaExclamationTriangle className="h-4 w-4" />
                         </div>
                      ) : message.userImage ? (
                        <img
                          src={message.userImage}
                          alt={message.author}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-white font-medium text-sm ${
                          message.authorRole === 'user' ? 'bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)]' : 
                          message.authorRole === 'admin' ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 
                          'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}>
                          {message.authorRole === 'user' ? <FaUser className="h-4 w-4" /> :
                           message.authorRole === 'admin' ? <FaUserShield className="h-4 w-4" /> :
                           <FaExclamationTriangle className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex-1 min-w-0 p-4 rounded-lg ${
                      (message.authorRole === 'admin' || message.type === 'system') ? 'bg-blue-50 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{message.author}</span>
                        {message.authorRole && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold" style={{ color: 'var(--text-muted)' }}>
                            {message.authorRole}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(message.createdAt).toLocaleDateString()} at{' '}
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                        {message.isEdited && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(edited)</span>
                        )}
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{message.content}</div>
                      </div>
                      
                      {/* Attachments */}
                      {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
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
                              <div key={index} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
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

                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaComments className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No messages found for this ticket.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reply Section - Only show if ticket is not closed */}
            {ticketDetails.status !== 'closed' && (
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaReply />
                  </div>
                  <h3 className="card-title">Reply to Ticket</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="form-group">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your reply to the customer..."
                      rows={6}
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                    />
                    <small className="text-xs text-gray-500 mt-1 block">
                      This reply will be visible to the customer and will update the ticket status.
                    </small>
                  </div>
                  
                  {/* File Upload */}
                  <div className="form-group">
                    <label className="form-label mb-2">
                      Attachments
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[var(--primary)] file:to-[var(--secondary)] file:text-white hover:file:from-[#4F0FD8] hover:file:to-[#A121E8] transition-all duration-200"
                    />
                    <small className="text-xs text-gray-500 mt-1">
                      You can upload screenshots or other relevant files (max 10MB each).
                    </small>
                    
                    {/* Selected Files */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
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
                      {isReplying ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
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
                  <h3 className="card-title">User Information</h3>
                </div>
                {showUserInfo ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {showUserInfo && (
                <div className="space-y-4">
                  <div>
                    <div className="form-label">Username</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{ticketDetails.userInfo?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="form-label">Full Name</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{ticketDetails.userInfo?.fullName || ticketDetails.userInfo?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="form-label">Email</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{ticketDetails.userInfo?.email || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <div className="form-label">Total Tickets</div>
                      <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{ticketDetails.userInfo?.totalTickets || 0}</div>
                    </div>
                    <div>
                      <div className="form-label">Open Tickets</div>
                      <div className="text-lg font-semibold text-orange-600">{ticketDetails.userInfo?.openTickets || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div className="card card-padding">
              <div 
                className="card-header cursor-pointer flex items-center justify-between"
                onClick={() => setShowNotes(!showNotes)}
              >
                <div className="flex items-center gap-2">
                  <div className="card-icon">
                    <FaStickyNote />
                  </div>
                  <h3 className="card-title">Internal Notes ({ticketDetails.notes?.length || 0})</h3>
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
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                    />
                    <small className="text-xs text-gray-500 mt-1 block">
                      Internal notes are only visible to support staff members.
                    </small>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || isAddingNote}
                      className="mt-2 btn btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {isAddingNote ? (
                        "Adding Note..."
                      ) : (
                        <>
                          <FaPlus className="h-3 w-3" />
                          Add Note
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Notes List */}
                  <div className="space-y-3">
                    {ticketDetails.notes?.map((note) => (
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

            {/* Close Ticket Button */}
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaTimes />
                </div>
                <h3 className="card-title">Close Ticket</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Closing this ticket will mark it as resolved and prevent further customer replies.
                </p>
                <button
                  onClick={handleCloseTicket}
                  disabled={isClosingTicket || ticketDetails.status === 'closed'}
                  className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {isClosingTicket ? 'Closing...' : (ticketDetails.status === 'closed' ? 'Ticket Closed' : 'Close Ticket')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetailsPage;