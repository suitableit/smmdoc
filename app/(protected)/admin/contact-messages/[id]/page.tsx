'use client';

import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCheckCircle,
    FaChevronDown,
    FaChevronUp,
    FaComments,
    FaEdit,
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
    FaSave,
    FaStickyNote,
    FaTimes,
    FaUser,
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
  // Get message ID from URL
  const messageId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '1';

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Contact Message #${messageId} — ${APP_NAME}`;
  }, [messageId]);

  // Dummy data for contact message details
  const dummyContactDetails: ContactMessageDetails = {
    id: '001',
    userId: 'user_001',
    username: 'socialmarketer_john',
    userEmail: 'john.doe@agency.com',
    category: 'Instagram Services',
    subject: 'Instagram followers delivery time inquiry',
    createdAt: '2024-06-28T10:30:00Z',
    lastUpdated: '2024-06-29T14:20:00Z',
    status: 'Unread',
    timeSpent: 25,
    messages: [
      {
        id: 'msg_001',
        type: 'customer',
        author: 'socialmarketer_john',
        content: `Hi there,

I'm interested in your Instagram follower services and have a few questions before placing an order:

1. What's the typical delivery timeframe for 10K Instagram followers?
2. Are these real, active accounts or bot accounts?
3. What's the retention rate and do you offer refill guarantees?
4. Can you provide followers that match my target demographic (US-based, aged 25-35)?
5. Do you offer any bulk discounts for agencies like ours?

We're planning to launch a major campaign for our client @techstartup_innovations next week and want to boost their social proof beforehand.

We've worked with other SMM providers before, but we're looking for higher quality services with better retention rates.

Please let me know your recommendations and pricing.

Best regards,
John Doe
Digital Marketing Manager
TechFlow Agency`,
        createdAt: '2024-06-28T10:30:00Z',
        attachments: [
          {
            id: 'att_001',
            filename: 'client_instagram_profile.png',
            filesize: '445 KB',
            mimetype: 'image/png',
            uploadedAt: '2024-06-28T10:30:00Z',
            uploadedBy: 'socialmarketer_john'
          },
          {
            id: 'att_002',
            filename: 'campaign_brief.pdf',
            filesize: '1.2 MB',
            mimetype: 'application/pdf',
            uploadedAt: '2024-06-28T10:31:00Z',
            uploadedBy: 'socialmarketer_john'
          }
        ]
      },
      {
        id: 'msg_002',
        type: 'staff',
        author: 'sarah_support',
        authorRole: 'Support Manager',
        content: `Hi John,

Thank you for your interest in our Instagram services! I'm happy to answer all your questions:

**Service Details:**
1. **Delivery Time:** 10K followers typically delivered within 24-48 hours with gradual delivery
2. **Account Quality:** Mix of real users and high-quality aged accounts with profile pictures, posts, and engagement history
3. **Retention:** 95%+ retention rate with 30-day automatic refill guarantee
4. **Targeting:** Yes, we can provide US-based followers in your specified age range
5. **Agency Discounts:** 15% bulk discount for orders over $500, 20% for orders over $1000

**Recommended Package for Your Client:**
- 10K Premium Instagram Followers (US-targeted, 25-35 age range)
- Regular Price: $89
- Agency Price: $75.65 (15% discount)
- Delivery: 24-48 hours
- Includes: 30-day refill guarantee

**Additional Services:**
- Instagram likes, views, comments
- Story views and saves
- Custom engagement packages

I've reviewed your client's profile and campaign brief. For maximum impact, I'd also recommend adding some engagement (likes/comments) to recent posts to maintain authenticity.

Would you like me to prepare a custom quote for the full package?

Best regards,
Sarah Johnson
Support Manager`,
        createdAt: '2024-06-28T15:20:00Z'
      }
    ],
    notes: [
      {
        id: 'note_001',
        content: 'High-value agency client. Provide best pricing and priority support.',
        author: 'Sarah Johnson',
        createdAt: '2024-06-28T15:25:00Z',
        isPrivate: true
      },
      {
        id: 'note_002',
        content: 'Client has experience with SMM panels. Focus on quality and retention in response.',
        author: 'Sarah Johnson',
        createdAt: '2024-06-28T15:26:00Z',
        isPrivate: true
      }
    ],
    userInfo: {
      fullName: 'John Doe',
      email: 'john.doe@agency.com',
      phone: '+1 (555) 123-4567',
      company: 'TechFlow Digital Agency',
      address: '123 Business St, San Francisco, CA 94105',
      registeredAt: '2024-03-15T00:00:00Z',
      totalMessages: 3,
      openMessages: 1
    }
  };

  // State management
  const [contactDetails, setContactDetails] = useState<ContactMessageDetails>(dummyContactDetails);
  const [loading, setLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  
  // Edit state management
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Utility functions
  const formatMessageID = (id: string) => {
    return `#${id.padStart(4, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Unread':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Read':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Replied':
        return 'bg-green-50 text-green-700 border-green-200';
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

  // Fetch contact details from API
  const fetchContactDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`);
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
        
        // Add admin reply if exists
        if (data.message.adminReply) {
          messages.push({
            id: `admin_${data.message.id}`,
            type: 'staff',
            author: data.message.repliedByUser?.username || 'Admin',
            content: data.message.adminReply,
            createdAt: data.message.repliedAt || data.message.updatedAt
          });
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
          status: data.message.status,
          messages: messages, // Now populated with actual conversation
          notes: [], // Default empty notes
          timeSpent: 0, // Default value
          userInfo: {
            fullName: data.message.user?.username || 'Unknown User',
            email: data.message.user?.email || 'No Email',
            phone: '',
            company: '',
            address: '',
            registeredAt: '2024-01-01T00:00:00Z',
            totalMessages: 1,
            openMessages: 0
          }
        };

        setContactDetails(transformedData);
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

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setContactDetails(prev => ({
      ...prev,
      status: newStatus as any,
      lastUpdated: new Date().toISOString()
    }));
    
    // Add system message
    const systemMessage: ContactMessage = {
      id: `msg_${Date.now()}`,
      type: 'system',
      author: 'System',
      content: `Message status changed to "${newStatus}"`,
      createdAt: new Date().toISOString()
    };
    
    setContactDetails(prev => ({
      ...prev,
      messages: [...prev.messages, systemMessage]
    }));
    
    showToast(`Message status changed to ${newStatus}`, 'success');
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
        setContactDetails(prev => ({
          ...prev,
          adminReply: replyContent.trim(),
          status: 'Replied',
          lastUpdated: new Date().toISOString(),
          repliedAt: new Date().toISOString()
        }));

        setReplyContent('');
        setSelectedFiles([]);
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const note: ContactNote = {
        id: `note_${Date.now()}`,
        content: newNote,
        author: 'admin_user (Admin)',
        createdAt: new Date().toISOString(),
        isPrivate: true
      };
      
      setContactDetails(prev => ({
        ...prev,
        notes: [...prev.notes, note]
      }));
      
      setNewNote('');
      showToast('Note added successfully', 'success');
    } catch (error) {
      showToast('Error adding note', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle edit mode
  const handleEditClick = () => {
    setEditSubject(contactDetails.subject);
    setEditCategory(contactDetails.category);
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditSubject('');
    setEditCategory('');
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editSubject.trim() || !editCategory.trim()) {
      showToast('Subject and category are required', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          subject: editSubject.trim(),
          category: editCategory.trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setContactDetails(prev => ({
          ...prev,
          subject: editSubject.trim(),
          category: editCategory.trim(),
          lastUpdated: new Date().toISOString()
        }));
        
        setIsEditing(false);
        showToast('Message updated successfully', 'success');
      } else {
        showToast(data.error || 'Error updating message', 'error');
      }
    } catch (error) {
      showToast('Error updating message', 'error');
    } finally {
      setIsSaving(false);
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

              {/* Status Controls */}
              <select 
                value={contactDetails.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="form-field pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
                <option value="Replied">Replied</option>
              </select>
            </div>
            
            <div className="flex flex-row items-center gap-1 md:gap-2">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Message {formatMessageID(contactDetails.id)}
              </h1>
              {contactDetails.status === 'Unread' && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  Unread
                </span>
              )}
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
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="btn btn-secondary flex items-center gap-2 ml-auto"
                  >
                    <FaEdit className="h-4 w-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-secondary flex items-center gap-2"
                      disabled={isSaving}
                    >
                      <FaTimes className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="btn btn-primary flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ButtonLoader />
                      ) : (
                        <FaSave className="h-4 w-4" />
                      )}
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="form-label">Subject</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="form-field mt-1"
                      placeholder="Enter subject"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{contactDetails.subject}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Category</label>
                  {isEditing ? (
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="form-field mt-1"
                      disabled={isSaving}
                    >
                      <option value="">Select Category</option>
                      <option value="Instagram Services">Instagram Services</option>
                      <option value="Facebook Services">Facebook Services</option>
                      <option value="Twitter Services">Twitter Services</option>
                      <option value="YouTube Services">YouTube Services</option>
                      <option value="TikTok Services">TikTok Services</option>
                      <option value="General Support">General Support</option>
                      <option value="Billing Question">Billing Question</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {contactDetails.category}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <span className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(contactDetails.status)}`}>
                    {contactDetails.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="form-label">Created</label>
                  <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                    {new Date(contactDetails.createdAt).toLocaleDateString()} at{' '}
                    {new Date(contactDetails.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <label className="form-label">Last Updated</label>
                  <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                    {new Date(contactDetails.lastUpdated).toLocaleDateString()} at{' '}
                    {new Date(contactDetails.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <label className="form-label">Time Spent</label>
                  <p className="mt-1" style={{ color: 'var(--text-primary)' }}>{Math.floor(contactDetails.timeSpent / 60)}h {contactDetails.timeSpent % 60}m</p>
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
                {contactDetails.messages
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
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {getFileIcon(attachment.mimetype)}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {attachment.filename}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {attachment.filesize} • Uploaded by {attachment.uploadedBy}
                              </div>
                            </div>
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => window.open(`/attachments/${attachment.id}/${attachment.filename}`, '_blank')}
                              title="View attachment"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
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
                {contactDetails.messages.filter(message => message.type === 'staff').length > 0 ? (
                  contactDetails.messages
                    .filter(message => message.type === 'staff')
                    .map((message) => (
                    <div key={message.id}>
                      <div className="mb-2">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Time: {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{message.content}</div>
                      </div>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Attachments:</h4>
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              {getFileIcon(attachment.mimetype)}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                  {attachment.filename}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {attachment.filesize} • Uploaded by {attachment.uploadedBy}
                                </div>
                              </div>
                              <button 
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => window.open(`/attachments/${attachment.id}/${attachment.filename}`, '_blank')}
                                title="View attachment"
                              >
                                <FaEye className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
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

            {/* Reply Section */}
            <div className="card card-padding">
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
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                  />
                  <small className="text-xs text-gray-500 mt-1 block">
                    This reply will be sent to the customer and will update the message status to "Replied".
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
                    You can upload screenshots or other relevant files (max 5MB each).
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
                    {isReplying && (
                      <ButtonLoader />
                    )}
                    <FaPaperPlane className="h-3 w-3" />
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
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
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{contactDetails.username || 'No Username'}</div>
                  </div>
                  <div>
                    <div className="form-label">Full Name</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{contactDetails.userInfo?.fullName || 'No Name'}</div>
                  </div>
                  <div>
                    <div className="form-label">Email</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{contactDetails.userInfo?.email || contactDetails.userEmail}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <div className="form-label">Total Messages</div>
                      <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{contactDetails.userInfo?.totalMessages || 0}</div>
                    </div>
                    <div>
                      <div className="form-label">Open Messages</div>
                      <div className="text-lg font-semibold text-orange-600">{contactDetails.userInfo?.openMessages || 0}</div>
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
                  <h3 className="card-title">Internal Notes ({contactDetails.notes.length})</h3>
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
                        <ButtonLoader />
                      ) : (
                        <FaPlus className="h-3 w-3" />
                      )}
                      Add Note
                    </button>
                  </div>
                  
                  {/* Notes List */}
                  <div className="space-y-3">
                    {contactDetails.notes.map((note) => (
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