'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  originalName?: string;
  encryptedName?: string;
  filesize: string;
  mimetype: string;
  mimeType?: string;
  fileSize?: number;
  url?: string;
  fileUrl?: string;
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
  const router = useRouter();
  const { appName } = useAppNameWithFallback();
  const currentUser = useCurrentUser();

  // Get message ID from URL
  const messageId: string = typeof window !== 'undefined'
    ? (window.location.pathname.split('/').pop() ?? '1')
    : '1';

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle(`Message Details ${formatMessageID(messageId)}`, appName);
  }, [messageId]);



  // State management
  const [contactDetails, setContactDetails] = useState<ContactMessageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(true);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // File input ref for resetting
  const fileInputRef = useRef<HTMLInputElement>(null);
  


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
          // Parse attachments from the new format
          let parsedAttachments: ContactAttachment[] = [];
          if (data.message.attachments) {
            try {
              const attachmentData = JSON.parse(data.message.attachments);
              if (Array.isArray(attachmentData)) {
                parsedAttachments = attachmentData.map((att, index) => {
                  return {
                    id: `${data.message.id}_${index}`,
                    filename: att.encryptedName || att.originalName || att.filename || 'Unknown file',
                    filesize: att.fileSize ? `${Math.round(att.fileSize / 1024)} KB` : 'Unknown size',
                    mimetype: att.mimeType || att.mimetype || 'application/octet-stream',
                    url: att.fileUrl || att.url,
                    uploadedAt: data.message.createdAt,
                    uploadedBy: data.message.user?.username || 'User'
                  };
                });
              }
            } catch (error) {
              console.error('Error parsing attachments:', error);
            }
          }
          
          messages.push({
            id: `customer_${data.message.id}`,
            type: 'customer',
            author: data.message.user?.username || 'Unknown User',
            content: data.message.message,
            createdAt: data.message.createdAt,
            attachments: parsedAttachments
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
                // Parse reply attachments if they exist
                let replyAttachments: ContactAttachment[] = [];
                if (reply.attachments && Array.isArray(reply.attachments)) {
                  replyAttachments = reply.attachments.map((attachment: any, attachIndex: number) => {
                    // Handle both old format (string paths) and new format (objects)
                    let filename, fileUrl, filesize = '0 KB', mimetype = 'application/octet-stream';
                    
                    if (typeof attachment === 'string') {
                      // Old format - encrypted path only
                      filename = attachment.split('/').pop() || 'attachment';
                      fileUrl = attachment;
                      const extension = filename.split('.').pop()?.toLowerCase() || '';
                      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                        mimetype = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
                      } else if (extension === 'pdf') {
                        mimetype = 'application/pdf';
                      } else if (['doc', 'docx'].includes(extension)) {
                        mimetype = 'application/msword';
                      } else if (['xls', 'xlsx'].includes(extension)) {
                        mimetype = 'application/vnd.ms-excel';
                      }
                    } else {
                      // New format - has original name
                      filename = attachment.encryptedName || attachment.filename || 'attachment';
                      fileUrl = attachment.encryptedPath || attachment.fileUrl;
                      filesize = attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} KB` : 'Unknown size';
                      mimetype = attachment.mimeType || 'application/octet-stream';
                    }
                    
                    return {
                      id: `admin_reply_${data.message.id}_${index}_${attachIndex}`,
                      filename: filename,
                      filesize: filesize,
                      mimetype: mimetype,
                      url: fileUrl,
                      uploadedAt: reply.repliedAt,
                      uploadedBy: reply.author || 'Admin'
                    };
                  });
                }
                
                messages.push({
                  id: `admin_${data.message.id}_${index}`,
                  type: 'staff',
                  author: reply.author || 'Admin',
                  content: reply.content,
                  createdAt: reply.repliedAt,
                  attachments: replyAttachments
                });
              });
            } else {
              // Fallback: single reply
              let singleReplyAttachments: ContactAttachment[] = [];
              if (data.message.attachments) {
                try {
                  const attachmentData = JSON.parse(data.message.attachments);
                  singleReplyAttachments = attachmentData.map((attachment: { encryptedName?: string; encryptedPath?: string; filename?: string; fileUrl?: string; fileSize?: number; mimeType?: string; } | string, index: number) => {
                    let filename, fileUrl, fileSize = 0, mimeType = 'application/octet-stream';
                    
                    if (typeof attachment === 'string') {
                      filename = attachment.split('/').pop() || 'attachment';
                      fileUrl = attachment;
                      const extension = filename.split('.').pop()?.toLowerCase() || '';
                      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                        mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
                      } else if (extension === 'pdf') {
                        mimeType = 'application/pdf';
                      }
                    } else {
                      // Handle both encryptedName and encryptedPath properties
                      const encryptedName = attachment.encryptedName || (attachment.encryptedPath ? attachment.encryptedPath.split('/').pop() : null);
                      filename = encryptedName || attachment.filename || 'attachment';
                      fileUrl = attachment.encryptedPath || attachment.fileUrl;
                      fileSize = attachment.fileSize || 0;
                      mimeType = attachment.mimeType || 'application/octet-stream';
                    }
                    
                    return {
                      id: `single-admin-reply-${index}`,
                      filename: filename,
                      filesize: fileSize ? `${Math.round(fileSize / 1024)} KB` : '0 KB',
                      mimetype: mimeType,
                      uploadedAt: data.message.repliedAt || data.message.updatedAt,
                      uploadedBy: 'Admin'
                    };
                  });
                } catch (e) {
                  console.error('Error parsing single reply attachments:', e);
                }
              }
              
              messages.push({
                id: `admin_${data.message.id}`,
                type: 'staff',
                author: data.message.repliedByUser?.username || 'Admin',
                content: data.message.adminReply,
                createdAt: data.message.repliedAt || data.message.updatedAt,
                attachments: singleReplyAttachments
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
          notes: (data.message.notes || []).map((note: { id: string; content: string; admin_username?: string; author?: string; created_at: string; is_private?: boolean; }) => ({
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

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newSelectedFiles);
    
    if (newSelectedFiles.length === 0) {
      // Clear the file input when no files are selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };



  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };



  // Handle reply submission
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    setIsReplying(true);
    
    try {
      // Upload files if any are selected
      let attachmentData: Array<{
        originalName: string;
        encryptedPath: string;
        fileSize?: number;
        mimeType?: string;
      }> = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        formData.append('uploadType', 'admin_uploads');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadResponse.json();
        
        if (!uploadData.success) {
          throw new Error(uploadData.error || 'Failed to upload files');
        }
        
        // Handle both single and multiple file responses
        if (uploadData.files) {
          // Multiple files
          attachmentData = uploadData.files.map((file: { originalName: string; fileUrl: string; fileSize?: number; mimeType?: string; }) => ({
            originalName: file.originalName,
            encryptedPath: file.fileUrl,
            fileSize: file.fileSize,
            mimeType: file.mimeType
          }));
        } else if (uploadData.originalName) {
          // Single file
          attachmentData = [{
            originalName: uploadData.originalName,
            encryptedPath: uploadData.fileUrl,
            fileSize: uploadData.fileSize,
            mimeType: uploadData.mimeType
          }];
        }
      }
      
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reply',
          adminReply: replyContent.trim(),
          attachments: attachmentData.length > 0 ? JSON.stringify(attachmentData) : undefined
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
        setSelectedFiles([]);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        showToast(data.message || 'Reply sent successfully', 'success');

        // Refresh the data to get updated information
        fetchContactDetails();
      } else {
        showToast(data.error || 'Error sending reply', 'error');
      }
    } catch (error) {
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
        notes: updatedMessage.notes.map((note: { id: string; content: string; author: string; createdAt: string; isPrivate: boolean; }) => ({
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
                onClick={() => router.push('/admin/contact-messages')}
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
                          // Handle the new attachment format
                          const attachmentUrl = attachment.url || attachment.fileUrl;
                          const filename = attachment.encryptedName || attachment.filename || 'Unknown file';
                          const mimetype = attachment.mimetype || attachment.mimeType || 'application/octet-stream';
                          const filesize = attachment.filesize || (attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} KB` : '');
                          
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                              {getFileIcon(mimetype)}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                  {filename}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {filesize ? `${filesize} • ` : ''}Attachment
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
                            // Handle the new attachment format
                            const attachmentUrl = attachment.url || attachment.fileUrl;
                            const filename = attachment.encryptedName || attachment.filename || 'Unknown file';
                            const mimetype = attachment.mimetype || attachment.mimeType || 'application/octet-stream';
                            const filesize = attachment.filesize || (attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} KB` : '');
                            
                            return (
                              <div key={index} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                {getFileIcon(mimetype)}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                    {filename}
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {filesize ? `${filesize} • ` : ''}Attachment
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
                      This reply will be sent to the customer and will update the message status to &quot;Replied&quot;. You can only reply once.
                    </small>
                  </div>
                  
                  {/* File Upload */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="attachments">
                      Attachments (Optional)
                    </label>
                    <input
                      type="file"
                      id="attachments"
                      ref={fileInputRef}
                      multiple
                      onChange={handleFileSelect}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[var(--primary)] file:to-[var(--secondary)] file:text-white hover:file:from-[#4F0FD8] hover:file:to-[#A121E8] transition-all duration-200"
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    <small className="text-xs text-gray-500 mt-1">
                      You can upload screenshots or other relevant files (max 5MB each).
                    </small>
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Selected Files ({selectedFiles.length}):
                      </p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.type)}
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
                            <FaTimes className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
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
import ContactSystemGuard from '@/components/ContactSystemGuard';

const ProtectedContactDetailsPage = () => (
  <ContactSystemGuard>
    <ContactDetailsPage />
  </ContactSystemGuard>
);

export default ProtectedContactDetailsPage;
