'use client';

import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEye,
  FaGlobe,
  FaHistory,
  FaSave,
  FaTimes,
  FaUpload
} from 'react-icons/fa';
import JoditEditor from 'jodit-react';

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

// Define interfaces
interface PostFormData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate: string;
  publishTime: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

const EditBlogPostPage = () => {
  const { appName } = useAppNameWithFallback();

  // Dummy existing post data (in real app, this would come from API/URL params)
  const dummyExistingPost: PostFormData = {
    id: 'post_001',
    title: 'Getting Started with React Components',
    slug: 'getting-started-react-components',
    content: `# Getting Started with React Components

React components are the building blocks of any React application. In this comprehensive guide, we'll explore how to create, manage, and optimize React components for better performance and maintainability.

## What are React Components?

React components are JavaScript functions or classes that return JSX (JavaScript XML) to describe what should appear on the screen. They allow you to split the UI into independent, reusable pieces.

## Functional Components

The most common way to define a component is with a JavaScript function:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

## Props and State

Components can receive data through props and manage their own state using hooks like useState and useEffect.

This is a sample blog post content that demonstrates how the edit functionality works.`,
    excerpt: 'Learn the fundamentals of React components, from basic functional components to advanced patterns with hooks and state management.',
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    metaTitle: 'Getting Started with React Components - Complete Guide',
    metaDescription: 'Master React components with this comprehensive guide covering functional components, props, state management, and best practices for modern React development.',
    status: 'published',
    publishDate: '2024-01-15',
    publishTime: '10:00',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    author: 'John Doe'
  };

  // State management
  const [formData, setFormData] = useState<PostFormData>(dummyExistingPost);
  const [originalFormData, setOriginalFormData] = useState<PostFormData>(dummyExistingPost);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Edit Post', appName);
  }, [appName]);

  // Load existing post data on component mount
  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoadingPost(true);
        // Simulate API call to fetch post data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In real app, you would fetch based on post ID from URL params
        // const postId = router.query.id;
        // const postData = await fetchPost(postId);
        
        setFormData(dummyExistingPost);
        setOriginalFormData(dummyExistingPost);
        
      } catch (error) {
        showToast('Error loading post data', 'error');
      } finally {
        setIsLoadingPost(false);
      }
    };

    loadPost();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalFormData]);

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle form field changes
  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug when title changes (only if slug hasn't been manually modified)
    if (field === 'title' && value) {
      const generatedSlug = generateSlug(value);
      if (formData.slug === generateSlug(originalFormData.title)) {
        setFormData(prev => ({
          ...prev,
          slug: generatedSlug
        }));
      }
    }
  };

  // Jodit editor configuration
  const editorConfig = {
    readonly: false,
    placeholder: 'Write your post content here...',
    height: 400,
    toolbar: true,
    spellcheck: true,
    language: 'en',
    toolbarButtonSize: 'middle',
    theme: 'default',
    enableDragAndDropFileToEditor: true,
    uploader: {
      insertImageAsBase64URI: true
    },
    removeButtons: ['source', 'fullsize', 'about'],
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_clear_html',
    style: {
      background: '#ffffff',
      color: '#000000'
    },
    editorCssClass: 'jodit-editor-white-bg'
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Only image files (JPEG, PNG, GIF, WebP) are allowed', 'error');
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'uploads'); // Store in public/uploads folder
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          featuredImage: data.fileUrl
        }));
        showToast('Image uploaded successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Error uploading image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Error uploading image', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (status: 'draft' | 'published' | 'scheduled') => {
    try {
      setIsLoading(true);
      
      // Basic validation
      if (!formData.title.trim()) {
        showToast('Please enter a post title', 'error');
        return;
      }
      
      if (!formData.content.trim()) {
        showToast('Please enter post content', 'error');
        return;
      }

      const postData = {
        id: formData.id,
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: formData.featuredImage,
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : null,
        scheduledAt: status === 'scheduled' ? `${formData.publishDate}T${formData.publishTime}` : null,
        seoTitle: formData.metaTitle,
        seoDescription: formData.metaDescription
      };
      
      console.log('Updating post:', postData);
      
      // Call API to update blog post
      const response = await fetch(`/api/blogs/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update blog post');
      }
      
      showToast(
        status === 'draft' ? 'Post saved as draft!' : 'Post updated successfully!',
        'success'
      );
      
      // Update original form data to reflect saved state
      setOriginalFormData(formData);
      
      // Redirect to blog list after successful update
      if (status === 'published') {
        setTimeout(() => {
          window.location.href = '/admin/blogs';
        }, 2000);
      }
      
    } catch (error) {
      showToast('Error updating post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (!formData.title.trim()) {
      showToast('Please enter a title to preview', 'error');
      return;
    }
    showToast('Preview functionality coming soon!', 'info');
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('Are you sure you want to discard all unsaved changes?');
      if (confirmed) {
        setFormData(originalFormData);
        showToast('Changes discarded', 'info');
      }
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (confirmed) {
        window.location.href = '/admin/blogs';
      }
    } else {
      window.location.href = '/admin/blogs';
    }
  };

  if (isLoadingPost) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <GradientSpinner size="w-12 h-12" className="mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
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
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Edit Post
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {hasUnsavedChanges && (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      • Unsaved changes
                    </span>
                  )}
                  {!hasUnsavedChanges && (
                    <span>Last updated: {new Date(formData.updatedAt).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {hasUnsavedChanges && (
                <button
                  onClick={handleDiscardChanges}
                  className="btn btn-ghost flex items-center gap-2 px-4 py-2.5"
                  disabled={isLoading}
                >
                  <FaHistory className="h-4 w-4" />
                  Discard Changes
                </button>
              )}
              <button
                onClick={handlePreview}
                className="btn btn-secondary flex items-center gap-2 px-4 py-2.5"
                disabled={isLoading}
              >
                <FaEye className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                className="btn btn-secondary flex items-center gap-2 px-4 py-2.5"
                disabled={isLoading}
              >
                <FaSave className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSubmit('published')}
                className="btn btn-primary flex items-center gap-2 px-4 py-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <GradientSpinner size="w-4 h-4" />
                ) : (
                  <FaGlobe className="h-4 w-4" />
                )}
                {isLoading ? 'Updating...' : 'Update & Publish'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Title & Slug */}
            <div className="card card-padding">
              <div className="space-y-4">
                <div>
                  <label className="form-label mb-2">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="form-field w-full px-4 py-3 text-lg font-medium bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter your post title..."
                  />
                </div>
                <div>
                  <label className="form-label mb-2">URL Slug</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">/blog/</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                          className="form-field w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          placeholder="post-url-slug"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Preview: <span className="font-mono">/blog/{formData.slug || 'your-post-slug'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="card card-padding">
              <div>
                <label className="form-label mb-2">
                  Post Content *
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <style jsx>{`
                    :global(.jodit-editor-white-bg .jodit-wysiwyg) {
                      background-color: #ffffff !important;
                      color: #000000 !important;
                    }
                    :global(.jodit-editor-white-bg .jodit-wysiwyg *) {
                      color: #000000 !important;
                    }
                    :global(.jodit-editor-white-bg .jodit-workplace) {
                      background-color: #ffffff !important;
                    }
                  `}</style>
                  <JoditEditor
                    value={formData.content}
                    config={editorConfig}
                    onBlur={(newContent) => handleInputChange('content', newContent)}
                    onChange={() => {}}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use the rich text editor to format your content with images, links, and styling.
                </p>
              </div>
            </div>

            {/* Post Excerpt */}
            <div className="card card-padding">
              <div>
                <label className="form-label mb-2">Post Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                  placeholder="Write a brief excerpt or summary of your post..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be used in post previews and search results (optional)
                </p>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="card card-padding">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder="SEO title for search engines..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaTitle.length}/60 characters (recommended)
                  </p>
                </div>
                <div>
                  <label className="form-label mb-2">Meta Description</label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    rows={3}
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                    placeholder="SEO description for search engines..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaDescription.length}/160 characters (recommended)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Post Info */}
            <div className="card card-padding">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Post Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium capitalize ${
                    formData.status === 'published' 
                      ? 'text-green-600 dark:text-green-400' 
                      : formData.status === 'draft'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {formData.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Author:</span>
                  <span className="font-medium">{formData.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="font-medium">
                    {new Date(formData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                  <span className="font-medium">
                    {new Date(formData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Publish Settings */}
            <div className="card card-padding">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Publish Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {formData.status === 'scheduled' && (
                  <>
                    <div>
                      <label className="form-label mb-2">
                        Publish Date
                      </label>
                      <input
                        type="date"
                        value={formData.publishDate}
                        onChange={(e) => handleInputChange('publishDate', e.target.value)}
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="form-label mb-2">
                        Publish Time
                      </label>
                      <input
                        type="time"
                        value={formData.publishTime}
                        onChange={(e) => handleInputChange('publishTime', e.target.value)}
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div className="card card-padding">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Featured Image
              </h3>
              <div className="space-y-3">
                {formData.featuredImage ? (
                  <div className="relative">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleInputChange('featuredImage', '')}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="featured-image"
                    />
                    <label
                      htmlFor="featured-image"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {imageUploading ? (
                        <GradientSpinner size="w-8 h-8" />
                      ) : (
                        <FaUpload className="h-8 w-8 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {imageUploading ? 'Uploading...' : 'Click to upload image'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex flex-wrap justify-center gap-3 md:hidden z-50">
        <div className="flex flex-1 gap-3">
          {hasUnsavedChanges && (
            <button
              onClick={handleDiscardChanges}
              className="btn btn-ghost flex items-center justify-center gap-2 px-4 py-2.5 w-full"
              disabled={isLoading}
            >
              <FaHistory className="h-4 w-4" />
              Discard
            </button>
          )}
          <button
            onClick={handlePreview}
            className="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 w-full"
            disabled={isLoading}
          >
            <FaEye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            className="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 w-full"
            disabled={isLoading}
          >
            <FaSave className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
        <button
          onClick={() => handleSubmit('published')}
          className="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.5 w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <GradientSpinner size="w-4 h-4" />
          ) : (
            <FaGlobe className="h-4 w-4" />
          )}
          {isLoading ? 'Updating...' : 'Update & Publish'}
        </button>
      </div>
    </div>
  );
};

export default EditBlogPostPage;