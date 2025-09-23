'use client';

import React, { useEffect, useState } from 'react';
import {
    FaBox,
    FaCheckCircle,
    FaEdit,
    FaEllipsisH,
    FaPlus,
    FaSearch,
    FaSync,
    FaTimes,
    FaTrash,
} from 'react-icons/fa';

// Import APP_NAME constant
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatNumber } from '@/lib/utils';

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

// Define interface for PostCategory with Post Count
interface PostCategory {
  id: number;
  name: string;
  postCount: number;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const PostCategoriesPage = () => {
  const { appName } = useAppNameWithFallback();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('Post Categories', appName);
  }, [appName]);

  // State for categories data
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/blogs/categories?includePostCount=true');
      const data = await response.json();
      
      if (data.success) {
        const formattedCategories = data.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          postCount: cat._count?.posts || 0,
          createdAt: cat.createdAt
        }));
        setCategories(formattedCategories);
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Dummy fallback data (will be replaced by API data)
  const dummyPostCategories: PostCategory[] = [
    {
      id: 2,
      name: 'Technology',
      postCount: 42,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 3,
      name: 'Business',
      postCount: 35,
      createdAt: '2024-01-14T14:45:00Z',
    },
    {
      id: 4,
      name: 'Lifestyle',
      postCount: 28,
      createdAt: '2024-01-13T09:15:00Z',
    },
    {
      id: 5,
      name: 'Health & Wellness',
      postCount: 19,
      createdAt: '2024-01-12T16:20:00Z',
    },
    {
      id: 6,
      name: 'Travel',
      postCount: 15,
      createdAt: '2024-01-11T11:35:00Z',
    },
    {
      id: 7,
      name: 'Food & Recipes',
      postCount: 31,
      createdAt: '2024-01-10T13:50:00Z',
    },
    {
      id: 8,
      name: 'Fashion',
      postCount: 0,
      createdAt: '2024-01-09T08:25:00Z',
    },
    {
      id: 9,
      name: 'Education',
      postCount: 23,
      createdAt: '2024-01-08T15:40:00Z',
    },
    {
      id: 10,
      name: 'Sports',
      postCount: 17,
      createdAt: '2024-01-07T12:10:00Z',
    },
    {
      id: 11,
      name: 'Entertainment',
      postCount: 25,
      createdAt: '2024-01-06T17:30:00Z',
    },
    {
      id: 12,
      name: 'Finance',
      postCount: 0,
      createdAt: '2024-01-05T14:15:00Z',
    },
    {
      id: 13,
      name: 'Art & Design',
      postCount: 12,
      createdAt: '2024-01-04T16:45:00Z',
    },
    {
      id: 14,
      name: 'Science',
      postCount: 0,
      createdAt: '2024-01-03T11:20:00Z',
    },
    {
      id: 15,
      name: 'Politics',
      postCount: 8,
      createdAt: '2024-01-02T09:30:00Z',
    },
    {
      id: 1,
      name: 'Photography',
      postCount: 0,
      createdAt: '2024-01-01T13:10:00Z',
    },
  ];

  // State management
  const [postCategories, setPostCategories] = useState<PostCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Update postCategories when categories data changes
  useEffect(() => {
    if (categories.length > 0) {
      setPostCategories(categories);
      setPagination(prev => ({
        ...prev,
        total: categories.length,
        totalPages: Math.ceil(categories.length / prev.limit),
        hasNext: prev.page < Math.ceil(categories.length / prev.limit),
        hasPrev: prev.page > 1
      }));
    }
  }, [categories]);

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postCategoryToDelete, setPostCategoryToDelete] = useState<number | null>(
    null
  );
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states (using the loading state from API fetch)
  const postCategoriesLoading = loading;
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPostCategory, setEditingPostCategory] =
    useState<PostCategory | null>(null);
  const [editName, setEditName] = useState('');

  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPostCategoryName, setNewPostCategoryName] = useState('');

  // Utility functions
  const formatID = (id: number) => {
    return id.toString();
  };

  // Filter post categories based on search term
  const filteredPostCategories = postCategories.filter(
    (postCategory) =>
      postCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      postCategory.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = filteredPostCategories.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages,
      hasNext: prev.page < totalPages,
      hasPrev: prev.page > 1,
    }));
  }, [filteredPostCategories.length, pagination.limit]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredPostCategories.slice(startIndex, endIndex);
  };

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRefresh = () => {
    fetchCategories();
    showToast('Post categories refreshed successfully!', 'success');
  };

  // Handle post category deletion
  const handleDeletePostCategory = async (postCategoryId: number) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/blogs/categories/${postCategoryId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        showToast('Post category deleted successfully', 'success');
        fetchCategories(); // Refresh the list
      } else {
        showToast(data.error || 'Error deleting post category', 'error');
      }
    } catch (error) {
      console.error('Error deleting post category:', error);
      showToast('Error deleting post category', 'error');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setPostCategoryToDelete(null);
    }
  };

  // Handle post category editing
  const handleEditPostCategory = async () => {
    if (!editingPostCategory || !editName.trim()) return;

    try {
      const response = await fetch(`/api/blogs/categories/${editingPostCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
        }),
      });
      const data = await response.json();

      if (data.success) {
        showToast('Post category updated successfully', 'success');
        fetchCategories(); // Refresh the list
      } else {
        showToast(data.error || 'Error updating post category', 'error');
      }
    } catch (error) {
      console.error('Error updating post category:', error);
      showToast('Error updating post category', 'error');
    } finally {
      setEditDialogOpen(false);
      setEditingPostCategory(null);
      setEditName('');
    }
  };

  // Handle adding new post category
  const handleAddPostCategory = async () => {
    if (!newPostCategoryName.trim()) return;

    try {
      const response = await fetch('/api/blogs/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPostCategoryName.trim(),
        }),
      });
      const data = await response.json();

      if (data.success) {
        showToast('Post category added successfully', 'success');
        fetchCategories(); // Refresh the list
      } else {
        showToast(data.error || 'Error adding post category', 'error');
      }
    } catch (error) {
      console.error('Error adding post category:', error);
      showToast('Error adding post category', 'error');
    } finally {
      setAddDialogOpen(false);
      setNewPostCategoryName('');
    }
  };

  // Open edit dialog
  const openEditDialog = (postCategory: PostCategory) => {
    setEditingPostCategory(postCategory);
    setEditName(postCategory.name);
    setEditDialogOpen(true);
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
        {/* Controls Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* First line: Page View Dropdown and Refresh Button */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={pagination.limit}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    limit:
                      e.target.value === 'all'
                        ? 1000
                        : parseInt(e.target.value),
                    page: 1,
                  }))
                }
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={postCategoriesLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={postCategoriesLoading ? 'animate-spin' : ''} />
                Refresh
              </button>

              {/* Add Post Category Button */}
              <button
                onClick={() => setAddDialogOpen(true)}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5 w-full sm:w-auto"
              >
                <FaPlus />
                Add New Category
              </button>
            </div>

            {/* Right: Search Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search post categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Post Categories Table */}
        <div className="card">
          <div style={{ padding: '24px 24px 0px 24px' }}>
            {postCategoriesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading post categories...
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchCategories}
                  className="btn btn-primary"
                >
                  Retry
                </button>
              </div>
            ) : getPaginatedData().length === 0 ? (
              <div className="text-center py-12">
                <FaBox
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No information was found for you.
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No post categories match your search criteria or no post
                  categories exist yet.
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          ID
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Name
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Post Count
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData().map((postCategory) => (
                        <tr
                          key={postCategory.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {formatID(postCategory.id)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="font-medium text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {postCategory.name}
                              </div>
                              {postCategory.id === 1 && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {postCategory.postCount}
                            </div>
                          </td>
                          <td className="p-3">
                            {/* 3 Dot Menu */}
                            <div className="relative">
                              <button
                                className="btn btn-secondary p-2"
                                title="More Actions"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const dropdown = e.currentTarget
                                    .nextElementSibling as HTMLElement;
                                  // Close other dropdowns
                                  document
                                    .querySelectorAll('.dropdown-menu')
                                    .forEach((menu) => {
                                      if (menu !== dropdown)
                                        menu.classList.add('hidden');
                                    });
                                  dropdown.classList.toggle('hidden');
                                }}
                              >
                                <FaEllipsisH className="h-3 w-3" />
                              </button>

                              {/* Dropdown Menu */}
                              <div className="dropdown-menu hidden absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      openEditDialog(postCategory);
                                      document
                                        .querySelector(
                                          '.dropdown-menu:not(.hidden)'
                                        )
                                        ?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <FaEdit className="h-3 w-3" />
                                    Edit Post Category
                                  </button>
                                  {postCategory.id !== 1 && (
                                    <button
                                      onClick={() => {
                                        setPostCategoryToDelete(postCategory.id);
                                        setDeleteDialogOpen(true);
                                        document
                                          .querySelector(
                                            '.dropdown-menu:not(.hidden)'
                                          )
                                          ?.classList.add('hidden');
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaTrash className="h-3 w-3" />
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-6 border-t">
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {postCategoriesLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading pagination...</span>
                      </div>
                    ) : (
                      `Showing ${formatNumber(
                        (pagination.page - 1) * pagination.limit + 1
                      )} to ${formatNumber(
                        Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )
                      )} of ${formatNumber(pagination.total)} post categories`
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={!pagination.hasPrev || postCategoriesLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {postCategoriesLoading ? (
                        <GradientSpinner size="w-4 h-4" />
                      ) : (
                        `Page ${formatNumber(
                          pagination.page
                        )} of ${formatNumber(pagination.totalPages)}`
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={!pagination.hasNext || postCategoriesLoading}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Delete Post Category
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post category? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setPostCategoryToDelete(null);
                  }}
                  disabled={deleteLoading}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    postCategoryToDelete &&
                    handleDeletePostCategory(postCategoryToDelete)
                  }
                  disabled={deleteLoading}
                  className={`px-4 py-2 text-sm ${
                    deleteLoading 
                      ? 'bg-red-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white rounded-lg font-medium transition-all duration-200 shadow-sm flex items-center gap-2`}
                >
                  {deleteLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Post Category Dialog */}
        {editDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Post Category</h3>
              <div className="mb-4">
                <label className="form-label mb-2">Post Category Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter post category name"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingPostCategory(null);
                    setEditName('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditPostCategory}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Post Category Dialog */}
        {addDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Add New Post Category
              </h3>
              <div className="mb-4">
                <label className="form-label mb-2">Post Category Name</label>
                <input
                  type="text"
                  value={newPostCategoryName}
                  onChange={(e) => setNewPostCategoryName(e.target.value)}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter post category name"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setAddDialogOpen(false);
                    setNewPostCategoryName('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPostCategory}
                  className="btn btn-primary"
                >
                  Add Post Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCategoriesPage;