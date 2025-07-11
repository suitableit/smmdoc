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
import { APP_NAME } from '@/lib/constants';
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

// Define interface for PostTag with Post Count
interface PostTag {
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

const PostTagsPage = () => {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Post Tags — ${APP_NAME}`;
  }, []);

  // Dummy data for post tags with post counts (including some with 0 counts)
  const dummyPostTags: PostTag[] = [
    {
      id: 'pt_001',
      name: 'JavaScript',
      postCount: 25,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'pt_002',
      name: 'React',
      postCount: 18,
      createdAt: '2024-01-14T14:45:00Z',
    },
    {
      id: 'pt_003',
      name: 'Tutorial',
      postCount: 32,
      createdAt: '2024-01-13T09:15:00Z',
    },
    {
      id: 'pt_004',
      name: 'Beginner',
      postCount: 15,
      createdAt: '2024-01-12T16:20:00Z',
    },
    {
      id: 'pt_005',
      name: 'Web Development',
      postCount: 22,
      createdAt: '2024-01-11T11:35:00Z',
    },
    {
      id: 'pt_006',
      name: 'CSS',
      postCount: 14,
      createdAt: '2024-01-10T13:50:00Z',
    },
    {
      id: 'pt_007',
      name: 'Node.js',
      postCount: 0,
      createdAt: '2024-01-09T08:25:00Z',
    },
    {
      id: 'pt_008',
      name: 'Frontend',
      postCount: 19,
      createdAt: '2024-01-08T15:40:00Z',
    },
    {
      id: 'pt_009',
      name: 'Backend',
      postCount: 11,
      createdAt: '2024-01-07T12:10:00Z',
    },
    {
      id: 'pt_010',
      name: 'API',
      postCount: 8,
      createdAt: '2024-01-06T17:30:00Z',
    },
    {
      id: 'pt_011',
      name: 'TypeScript',
      postCount: 0,
      createdAt: '2024-01-05T14:15:00Z',
    },
    {
      id: 'pt_012',
      name: 'Database',
      postCount: 6,
      createdAt: '2024-01-04T16:45:00Z',
    },
    {
      id: 'pt_013',
      name: 'DevOps',
      postCount: 0,
      createdAt: '2024-01-03T11:20:00Z',
    },
    {
      id: 'pt_014',
      name: 'Mobile',
      postCount: 4,
      createdAt: '2024-01-02T09:30:00Z',
    },
    {
      id: 'pt_015',
      name: 'Performance',
      postCount: 0,
      createdAt: '2024-01-01T13:10:00Z',
    },
    {
      id: 'pt_016',
      name: 'Security',
      postCount: 7,
      createdAt: '2023-12-31T10:45:00Z',
    },
    {
      id: 'pt_017',
      name: 'Testing',
      postCount: 9,
      createdAt: '2023-12-30T16:20:00Z',
    },
    {
      id: 'pt_018',
      name: 'AWS',
      postCount: 0,
      createdAt: '2023-12-29T14:15:00Z',
    },
    {
      id: 'pt_019',
      name: 'Docker',
      postCount: 3,
      createdAt: '2023-12-28T11:30:00Z',
    },
    {
      id: 'pt_020',
      name: 'Git',
      postCount: 12,
      createdAt: '2023-12-27T09:45:00Z',
    },
  ];

  // State management
  const [postTags, setPostTags] =
    useState<PostTag[]>(dummyPostTags);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: dummyPostTags.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postTagToDelete, setPostTagToDelete] = useState<string | null>(
    null
  );
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // Loading states
  const [postTagsLoading, setPostTagsLoading] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPostTag, setEditingPostTag] =
    useState<PostTag | null>(null);
  const [editName, setEditName] = useState('');

  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPostTagName, setNewPostTagName] = useState('');

  // Utility functions
  const formatID = (id: string) => {
    return id.toUpperCase();
  };

  // Filter post tags based on search term
  const filteredPostTags = postTags.filter(
    (postTag) =>
      postTag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      postTag.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = filteredPostTags.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages,
      hasNext: prev.page < totalPages,
      hasPrev: prev.page > 1,
    }));
  }, [filteredPostTags.length, pagination.limit]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredPostTags.slice(startIndex, endIndex);
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
    setPostTagsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setPostTagsLoading(false);
      showToast('Post tags refreshed successfully!', 'success');
    }, 1000);
  };

  // Handle post tag deletion
  const handleDeletePostTag = async (postTagId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPostTags((prev) => prev.filter((pt) => pt.id !== postTagId));
      showToast('Post tag deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setPostTagToDelete(null);
    } catch (error) {
      console.error('Error deleting post tag:', error);
      showToast('Error deleting post tag', 'error');
    }
  };

  // Handle post tag editing
  const handleEditPostTag = async () => {
    if (!editingPostTag || !editName.trim()) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPostTags((prev) =>
        prev.map((pt) =>
          pt.id === editingPostTag.id
            ? { ...pt, name: editName.trim() }
            : pt
        )
      );

      showToast('Post tag updated successfully', 'success');
      setEditDialogOpen(false);
      setEditingPostTag(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating post tag:', error);
      showToast('Error updating post tag', 'error');
    }
  };

  // Handle adding new post tag
  const handleAddPostTag = async () => {
    if (!newPostTagName.trim()) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newPostTag: PostTag = {
        id: `pt_${String(postTags.length + 1).padStart(3, '0')}`,
        name: newPostTagName.trim(),
        postCount: 0, // New post tags start with 0 posts
        createdAt: new Date().toISOString(),
      };

      setPostTags((prev) => [newPostTag, ...prev]);
      showToast('Post tag added successfully', 'success');
      setAddDialogOpen(false);
      setNewPostTagName('');
    } catch (error) {
      console.error('Error adding post tag:', error);
      showToast('Error adding post tag', 'error');
    }
  };

  // Open edit dialog
  const openEditDialog = (postTag: PostTag) => {
    setEditingPostTag(postTag);
    setEditName(postTag.name);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Page View Dropdown */}
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
                disabled={postTagsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync className={postTagsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>

              {/* Add Post Tag Button */}
              <button
                onClick={() => setAddDialogOpen(true)}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5 w-full sm:w-auto"
              >
                <FaPlus />
                Add New Tag
              </button>
            </div>

            {/* Third line: Search Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search post tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Post Tags Table */}
        <div className="card">
          <div style={{ padding: '24px 24px 0px 24px' }}>
            {postTagsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading post tags...
                  </div>
                </div>
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
                  No post tags match your search criteria or no post
                  tags exist yet.
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
                          Created
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
                      {getPaginatedData().map((postTag) => (
                        <tr
                          key={postTag.id}
                          className="border-t hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {formatID(postTag.id)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {postTag.name}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {postTag.postCount}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-xs">
                                {new Date(
                                  postTag.createdAt
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                {new Date(
                                  postTag.createdAt
                                ).toLocaleTimeString()}
                              </div>
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
                                      openEditDialog(postTag);
                                      document
                                        .querySelector(
                                          '.dropdown-menu:not(.hidden)'
                                        )
                                        ?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <FaEdit className="h-3 w-3" />
                                    Edit Post Tag
                                  </button>
                                  <button
                                    onClick={() => {
                                      setPostTagToDelete(postTag.id);
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
                    {postTagsLoading ? (
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
                      )} of ${formatNumber(pagination.total)} post tags`
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
                      disabled={!pagination.hasPrev || postTagsLoading}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {postTagsLoading ? (
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
                      disabled={!pagination.hasNext || postTagsLoading}
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
                Delete Post Tag
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post tag? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setPostTagToDelete(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    postTagToDelete &&
                    handleDeletePostTag(postTagToDelete)
                  }
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Post Tag Dialog */}
        {editDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Post Tag</h3>
              <div className="mb-4">
                <label className="form-label mb-2">Post Tag Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter post tag name"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingPostTag(null);
                    setEditName('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditPostTag}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Post Tag Dialog */}
        {addDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Add New Post Tag
              </h3>
              <div className="mb-4">
                <label className="form-label mb-2">Post Tag Name</label>
                <input
                  type="text"
                  value={newPostTagName}
                  onChange={(e) => setNewPostTagName(e.target.value)}
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter post tag name"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setAddDialogOpen(false);
                    setNewPostTagName('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPostTag}
                  className="btn btn-primary"
                >
                  Add Post Tag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostTagsPage;