'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaGlobe,
  FaHistory,
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
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  status: 'draft' | 'published';
  publishDate: string;
  publishTime: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

const EditBlogPostPage = () => {
  const { appName } = useAppNameWithFallback();
  const params = useParams();
  const postId = params.id as string;
  const [formData, setFormData] = useState<PostFormData>({
    id: '',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
    publishDate: '',
    publishTime: '',
    createdAt: '',
    updatedAt: '',
    author: ''
  });
  const [originalFormData, setOriginalFormData] = useState<PostFormData>({
    id: '',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
    publishDate: '',
    publishTime: '',
    createdAt: '',
    updatedAt: '',
    author: ''
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<{
    excerpt: boolean;
    metaTitle: boolean;
    metaDescription: boolean;
  }>({
    excerpt: false,
    metaTitle: false,
    metaDescription: false
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  useEffect(() => {
    setPageTitle('Edit Post', appName);
  }, [appName]);
  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoadingPost(true);
        const response = await fetch(`/api/blogs/id/${postId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch post data');
        }

        const responseData = await response.json();

        if (!responseData.success) {
          throw new Error(responseData.error || 'Failed to fetch post data');
        }

        const postData = responseData.data;
        const autoFilled = {
          excerpt: false,
          metaTitle: false,
          metaDescription: false
        };
        let excerpt = postData.excerpt || '';
        if (!excerpt && postData.content) {
          const textContent = postData.content.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '');
          excerpt = textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
          autoFilled.excerpt = true;
        }
        let metaTitle = postData.metaTitle || '';
        if (!metaTitle && postData.title) {
          metaTitle = postData.title;
          autoFilled.metaTitle = true;
        }
        let metaDescription = postData.metaDescription || '';
        if (!metaDescription) {
          if (excerpt) {
            metaDescription = excerpt;
          } else if (postData.content) {
            const textContent = postData.content.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '');
            metaDescription = textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
          }
          autoFilled.metaDescription = true;
        }
        const formDataToSet = {
          id: postData.id || '',
          title: postData.title || '',
          slug: postData.slug || '',
          content: postData.content || '',
          excerpt: postData.excerpt || excerpt,
          featuredImage: postData.featuredImage || '',
          metaTitle: postData.metaTitle || postData.seoTitle || metaTitle,
          metaDescription: postData.metaDescription || postData.seoDescription || metaDescription,
          status: postData.status || 'draft',
          publishDate: postData.publishedAt ? new Date(postData.publishedAt).toISOString().split('T')[0] : '',
          publishTime: postData.publishedAt ? new Date(postData.publishedAt).toTimeString().slice(0, 5) : '',
          createdAt: postData.createdAt || '',
          updatedAt: postData.updatedAt || '',
          author: postData.author?.username || postData.author?.name || postData.author || ''
        };

        setFormData(formDataToSet);
        setOriginalFormData(formDataToSet);
        setAutoFilledFields(autoFilled);

      } catch (error) {
        showToast('Error loading post data', 'error');
        console.error('Error loading post:', error);
      } finally {
        setIsLoadingPost(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId]);
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalFormData]);
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };
  const handleInputChange = (field: keyof PostFormData, value: any) => {
    console.log(`Updating field ${field} with value:`, value);

    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      console.log('Updated formData:', updated);
      return updated;
    });
    if (field === 'excerpt' || field === 'metaTitle' || field === 'metaDescription') {
      setAutoFilledFields(prev => ({
        ...prev,
        [field]: false
      }));
    }
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
    editorCssClass: 'jodit-editor-white-bg',
    events: {
      afterInit: function (editor) {
        editor.focus();
      }
    }
  }), []);
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

      console.log('Updating post:', postData);
      const response = await fetch(`/api/blogs/id/${formData.id}`, {
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
      setOriginalFormData(formData);
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
  const handleDiscardChanges = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('Are you sure you want to discard all unsaved changes?');
      if (confirmed) {
        setFormData(originalFormData);
        showToast('Changes discarded', 'info');
      }
    }
  };
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
                {isLoading ? 'Updating...' : 'Update & Publish'}
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
                  <label className="form-label mb-2">URL Slug</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">/blogs/</span>
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
                    onChange={(newContent) => handleInputChange('content', newContent)}
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
                <label className="form-label mb-2">
                  Post Excerpt
                  {autoFilledFields.excerpt && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      (Auto-generated)
                    </span>
                  )}
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                  placeholder={autoFilledFields.excerpt ? "Auto-generated from content (leave empty to use auto-generated)" : "Write a brief excerpt or summary of your post..."}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {autoFilledFields.excerpt 
                    ? "This field will be auto-generated from your content if left empty"
                    : "This will be used in post previews and search results (optional)"
                  }
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
                  <label className="form-label mb-2">
                    Meta Title
                    {autoFilledFields.metaTitle && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        (Auto-generated)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder={autoFilledFields.metaTitle ? "Auto-generated from title (leave empty to use auto-generated)" : "SEO title for search engines..."}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaTitle.length}/60 characters (recommended)
                    {autoFilledFields.metaTitle && " - Auto-generated from post title if left empty"}
                  </p>
                </div>
                <div>
                  <label className="form-label mb-2">
                    Meta Description
                    {autoFilledFields.metaDescription && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        (Auto-generated)
                      </span>
                    )}
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    rows={3}
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
                    placeholder={autoFilledFields.metaDescription ? "Auto-generated from content (leave empty to use auto-generated)" : "SEO description for search engines..."}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaDescription.length}/160 characters (recommended)
                    {autoFilledFields.metaDescription && " - Auto-generated from content if left empty"}
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
          {!isLoading && <FaGlobe className="h-4 w-4" />}
          {isLoading ? 'Publishing...' : 'Update & Publish'}
        </button>
      </div>
    </div>
  );
};

export default EditBlogPostPage;