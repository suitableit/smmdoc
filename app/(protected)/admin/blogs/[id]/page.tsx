'use client';

import React, { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaImage,
  FaSave,
  FaSync,
  FaTags,
  FaTimes,
  FaUpload,
  FaCalendarAlt,
  FaClock,
  FaGlobe,
  FaLock,
  FaFileAlt,
  FaHistory,
  FaArrowLeft,
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

// Define interfaces
interface PostCategory {
  id: string;
  name: string;
}

interface PostTag {
  id: string;
  name: string;
}

interface PostFormData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categoryId: string;
  tags: string[];
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
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Edit Post — ${APP_NAME}`;
  }, []);

  // Dummy data for categories
  const dummyCategories: PostCategory[] = [
    { id: 'pc_000', name: 'Uncategorized' },
    { id: 'pc_001', name: 'Technology' },
    { id: 'pc_002', name: 'Business' },
    { id: 'pc_003', name: 'Lifestyle' },
    { id: 'pc_004', name: 'Health & Wellness' },
    { id: 'pc_005', name: 'Travel' },
    { id: 'pc_006', name: 'Food & Recipes' },
  ];

  // Dummy data for available tags
  const dummyTags: PostTag[] = [
    { id: 'pt_001', name: 'JavaScript' },
    { id: 'pt_002', name: 'React' },
    { id: 'pt_003', name: 'Tutorial' },
    { id: 'pt_004', name: 'Beginner' },
    { id: 'pt_005', name: 'Web Development' },
    { id: 'pt_006', name: 'CSS' },
    { id: 'pt_007', name: 'Node.js' },
    { id: 'pt_008', name: 'Frontend' },
    { id: 'pt_009', name: 'Backend' },
    { id: 'pt_010', name: 'API' },
  ];

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
    categoryId: 'pc_001',
    tags: ['React', 'JavaScript', 'Tutorial', 'Frontend'],
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

  // Tag input state
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

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

  // Handle tag addition
  const addTag = (tagName: string) => {
    const cleanTag = tagName.trim();
    if (cleanTag && !formData.tags.includes(cleanTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, cleanTag]
      }));
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // Filter tag suggestions
  const tagSuggestions = dummyTags.filter(tag =>
    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !formData.tags.includes(tag.name)
  );

  // Handle image upload simulation
  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful upload
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        featuredImage: imageUrl
      }));
      
      showToast('Image uploaded successfully!', 'success');
    } catch (error) {
      showToast('Error uploading image', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (status: 'draft' | 'published') => {
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const postData = {
        ...formData,
        status,
        updatedAt: new Date().toISOString(),
        publishDate: status === 'scheduled' ? `${formData.publishDate}T${formData.publishTime}` : formData.publishDate,
      };
      
      console.log('Updating post:', postData);
      
      // Update the original form data to reflect saved state
      setOriginalFormData(postData);
      
      showToast(
        status === 'draft' ? 'Post updated and saved as draft!' : 'Post updated and published!',
        'success'
      );
      
      // Redirect to posts list after successful publication
      if (status === 'published') {
        setTimeout(() => {
          window.location.href = '/admin/posts';
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
    if (window.confirm('Are you sure you want to discard all unsaved changes?')) {
      setFormData(originalFormData);
      showToast('Changes discarded', 'info');
    }
  };

  // Show loading spinner while post data is being fetched
  if (isLoadingPost) {
    return (
      <div className="page-container">
        <div className="page-content flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <GradientSpinner size="w-12 h-12" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading post data...</p>
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Edit Post
                </h1>
                {hasUnsavedChanges && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Unsaved changes
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Last updated {new Date(formData.updatedAt).toLocaleDateString()} by {formData.author}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="btn btn-secondary flex items-center gap-2 px-4 py-2.5"
                disabled={isLoading}
              >
                <FaEye className="h-4 w-4" />
                Preview
              </button>
              {hasUnsavedChanges && (
                <button
                  onClick={handleDiscardChanges}
                  className="btn btn-outline flex items-center gap-2 px-4 py-2.5"
                  disabled={isLoading}
                >
                  <FaTimes className="h-4 w-4" />
                  Discard
                </button>
              )}
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">/blog/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="form-field flex-1 px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="post-url-slug"
                    />
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
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={15}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                  placeholder="Write your post content here..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: You can use Markdown syntax for formatting (bold, italic, links, etc.)
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
                  <p className="text-xs text-gray-5000 mt-1">
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
                  <span className="text-gray-600">Post ID:</span>
                  <span className="font-mono text-gray-900">{formData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">
                    {new Date(formData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Author:</span>
                  <span className="text-gray-900">{formData.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    formData.status === 'published' ? 'bg-green-100 text-green-800' :
                    formData.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
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

            {/* Category */}
            <div className="card card-padding">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Category
              </h3>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
              >
                {dummyCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="card card-padding">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Tags
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onKeyDown={handleTagInput}
                    onFocus={() => setShowTagSuggestions(true)}
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder="Type tag name and press Enter..."
                  />
                  
                  {/* Tag suggestions dropdown */}
                  {showTagSuggestions && tagInput && tagSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                      {tagSuggestions.slice(0, 5).map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => addTag(tag.name)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
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

            {/* Revision History */}
            <div className="card card-padding">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Revision History
              </h3>
              <button
                onClick={() => showToast('Revision history coming soon!', 'info')}
                className="btn btn-outline w-full flex items-center justify-center gap-2 px-4 py-2.5"
              >
                <FaHistory className="h-4 w-4" />
                View History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex flex-wrap justify-center gap-3 md:hidden z-50">
        <div className="flex flex-1 gap-3">
          <button
            onClick={handlePreview}
            className="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 w-full"
            disabled={isLoading}
          >
            <FaEye className="h-4 w-4" />
            Preview
          </button>
          {hasUnsavedChanges && (
            <button
              onClick={handleDiscardChanges}
              className="btn btn-outline flex items-center justify-center gap-2 px-4 py-2.5 w-full"
              disabled={isLoading}
            >
              <FaTimes className="h-4 w-4" />
              Discard
            </button>
          )}
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
          className="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.2 w-full"
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