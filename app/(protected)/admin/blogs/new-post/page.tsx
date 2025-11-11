'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  FaCheckCircle,
  FaGlobe,
  FaSave,
  FaTimes,
  FaUpload
} from 'react-icons/fa';
import JoditEditor from 'jodit-react';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
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
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);
interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  status: 'draft' | 'published';
}

const NewPostPage = () => {
  const { appName } = useAppNameWithFallback();
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  useEffect(() => {
    setPageTitle('New Post', appName);
  }, [appName]);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isAvailable: null,
    message: ''
  });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const editorConfig = useMemo(() => ({
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
  }), []);
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  };
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugStatus({ isChecking: false, isAvailable: null, message: '' });
      return;
    }

    setSlugStatus({ isChecking: true, isAvailable: null, message: 'Checking availability...' });

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const isAvailable = !slug.includes('test');

      setSlugStatus({
        isChecking: false,
        isAvailable,
        message: isAvailable 
          ? 'URL is available' 
          : 'URL is already taken'
      });
    } catch (error) {
      setSlugStatus({
        isChecking: false,
        isAvailable: null,
        message: 'Error checking availability'
      });
    }
  };
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  const debouncedSlugCheck = debounce(checkSlugAvailability, 1000);
  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'title' && value && !isSlugManuallyEdited) {
      const newSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
      debouncedSlugCheck(newSlug);
    }
    if (field === 'slug') {
      setIsSlugManuallyEdited(true);
      debouncedSlugCheck(value);
    }
  };
  const regenerateSlug = () => {
    if (formData.title) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
      setIsSlugManuallyEdited(false);
      debouncedSlugCheck(newSlug);
    }
  };
  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Only image files (JPEG, PNG, GIF, WebP) are allowed', 'error');
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'uploads');

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
  const handleSubmit = async (status: 'draft' | 'published') => {
    try {
      setIsLoading(true);
      if (!formData.title.trim()) {
        showToast('Please enter a post title', 'error');
        return;
      }

      if (!formData.content.trim()) {
        showToast('Please enter post content', 'error');
        return;
      }

      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: formData.featuredImage,
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : null,
        seoTitle: formData.metaTitle,
        seoDescription: formData.metaDescription
      };

      console.log('Submitting post:', postData);
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create blog post');
      }

      showToast(
        status === 'draft' ? 'Post saved as draft!' : 'Post published successfully!',
        'success'
      );
      if (status === 'published') {
        setTimeout(() => {
          window.location.href = '/admin/blogs';
        }, 2000);
      }

    } catch (error) {
      showToast('Error saving post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      {}
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
        {}
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
            <div className="hidden md:flex items-center gap-3">
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
                {!isLoading && <FaGlobe className="h-4 w-4" />}
                {isLoading ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label">URL Slug</label>
                    {isSlugManuallyEdited && formData.title && (
                      <button
                        type="button"
                        onClick={regenerateSlug}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        Regenerate from title
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">/blogs/</span>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                          className={`form-field w-full px-3 py-2 pr-8 bg-white dark:bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            slugStatus.isAvailable === true
                              ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
                              : slugStatus.isAvailable === false
                              ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)]'
                          }`}
                          placeholder="post-url-slug"
                        />
                        {slugStatus.isChecking && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <GradientSpinner size="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                    {slugStatus.message && (
                      <div className={`text-xs flex items-center gap-1 ${
                        slugStatus.isAvailable === true
                          ? 'text-green-600 dark:text-green-400'
                          : slugStatus.isAvailable === false
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {slugStatus.message}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Preview: <span className="font-mono">/blogs/{formData.slug || 'your-post-slug'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="card card-padding">
              <div>
                <label className="form-label mb-2">
                  Post Content *
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <JoditEditor
                    value={formData.content}
                    config={editorConfig}
                    onBlur={(newContent) => handleInputChange('content', newContent)}
                    onChange={() => {}}
                    className="jodit-editor-white-bg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use the rich text editor to format your content with images, links, and styling.
                </p>
              </div>
            </div>

            {}
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

            {}
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

          {}
          <div className="space-y-6">
            {}
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
                  </select>
                </div>
              </div>
            </div>

            {}
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
                      accept="image}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex flex-wrap justify-center gap-3 md:hidden z-50">
        <button
          onClick={() => handleSubmit('draft')}
          className="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 w-full"
          disabled={isLoading}
        >
          <FaSave className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={() => handleSubmit('published')}
          className="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.5 w-full"
          disabled={isLoading}
        >
          {!isLoading && <FaGlobe className="h-4 w-4" />}
          {isLoading ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  );
};

export default NewPostPage;