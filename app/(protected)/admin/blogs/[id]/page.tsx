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
}

const NewPostPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Add New Post — ${APP_NAME}`;
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

  // State management
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    categoryId: 'pc_000', // Default to Uncategorized
    tags: [],
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
    publishDate: new Date().toISOString().split('T')[0],
    publishTime: new Date().toTimeString().slice(0, 5),
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Tag input state
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

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

    // Auto-generate slug when title changes
    if (field === 'title' && value) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Auto-generate meta title if not manually set
    if (field === 'title' && value && !formData.metaTitle) {
      setFormData(prev => ({
        ...prev,
        metaTitle: value
      }));
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
        publishDate: status === 'scheduled' ? `${formData.publishDate}T${formData.publishTime}` : new Date().toISOString(),
        // Author will be automatically set based on current authenticated user
      };
      
      console.log('Submitting post:', postData);
      
      showToast(
        status === 'draft' ? 'Post saved as draft!' : 'Post published successfully!',
        'success'
      );
      
      // Reset form after successful submission
      if (status === 'published') {
        setTimeout(() => {
          window.location.href = '/admin/posts';
        }, 2000);
      }
      
    } catch (error) {
      showToast('Error saving post', 'error');
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
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Add New Post
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Create a new blog post with rich content and SEO optimization
              </p>
            </div>
            <div className="flex items-center gap-3">
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
                {isLoading ? 'Publishing...' : 'Publish'}
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
                  placeholder="Write your post content here... You can use Markdown formatting."
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
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaDescription.length}/160 characters (recommended)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPostPage; 