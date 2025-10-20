'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  FaBox,
  FaBriefcase,
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaChevronUp,
  FaEdit,
  FaEllipsisH,
  FaExclamationTriangle,
  FaFileImport,
  FaGlobe,
  FaGripVertical,
  FaPlus,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaSync,
  FaTags,
  FaTimes,
  FaTimesCircle,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaUndo,
} from 'react-icons/fa';
import useSWR from 'swr';

// Import APP_NAME constant
import { PriceDisplay } from '@/components/PriceDisplay';
import { useGetCategories } from '@/hooks/categories-fetch';
import { useGetServicesId } from '@/hooks/service-fetch-id';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { formatID } from '@/lib/utils';
import {
  createCategoryDefaultValues,
  createCategorySchema,
  CreateCategorySchema,
} from '@/lib/validators/admin/categories/categories.validator';
import {
  createServiceDefaultValues,
  CreateServiceSchema,
} from '@/lib/validators/admin/services/services.validator';
import { mutate } from 'swr';

// Fetcher function for useSWR
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

// Custom Form Components
const FormField = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-2">{children}</div>
);

const FormItem = ({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={`space-y-2 ${className}`}>{children}</div>;

const FormLabel = ({
  className = '',
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => (
  <label className={`block text-sm font-medium ${className}`} style={style}>
    {children}
  </label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const FormMessage = ({
  className = '',
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) =>
  children ? (
    <div className={`text-xs text-red-500 mt-1 ${className}`}>{children}</div>
  ) : null;

// Optimized memoized components for better performance

// ServiceActionsDropdown component
const ServiceActionsDropdown = memo(({
  service,
  statusFilter,
  categoryName,
  activeCategoryToggles,
  onEdit,
  onToggleStatus,
  onRestore,
  onDelete,
}: {
  service: any;
  statusFilter: string;
  categoryName: string;
  activeCategoryToggles: Record<string, boolean>;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="btn btn-secondary p-2 hover:bg-gray-100"
        title="Actions"
      >
        <FaEllipsisH className="h-3 w-3" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              {statusFilter === 'trash' ? (
                <button
                  onClick={() => handleAction(onDelete)}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FaTrash className="h-3 w-3" />
                  Delete Permanently
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAction(onEdit)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FaEdit className="h-3 w-3" />
                    Edit Service
                  </button>
                  
                  {service.status === 'inactive' && service.provider && service.provider.trim() !== '' && (
                    <button
                      onClick={() => handleAction(onRestore)}
                      className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                    >
                      <FaUndo className="h-3 w-3" />
                      Restore Service
                    </button>
                  )}
                  
                  {activeCategoryToggles[categoryName] && (
                    <button
                      onClick={() => handleAction(onToggleStatus)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FaSync className="h-3 w-3" />
                      {service.status === 'active' ? 'Deactivate' : 'Activate'} Service
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleAction(onDelete)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <FaTrash className="h-3 w-3" />
                    Delete Service
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

const MemoizedServiceRow = memo(
  ({
    service,
    isSelected,
    onToggleSelect,
    onEdit,
    onToggleStatus,
    onToggleRefill,
    onToggleCancel,
    onToggleSecret,
    isUpdating,
  }: {
    service: any;
    isSelected: boolean;
    onToggleSelect: (serviceId: number) => void;
    onEdit: (serviceId: number) => void;
    onToggleStatus: (serviceId: number) => void;
    onToggleRefill: (serviceId: number) => void;
    onToggleCancel: (serviceId: number) => void;
    onToggleSecret: (serviceId: number) => void;
    isUpdating: boolean;
  }) => {
    return (
      <tr className="border-b hover:bg-gray-50 transition-colors duration-150">
        <td className="p-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(service.id)}
            className="rounded border-gray-300 w-4 h-4"
          />
        </td>
        <td
          className="p-3 font-mono text-sm"
          style={{ color: 'var(--text-primary)' }}
        >
          {formatID(service.id)}
        </td>
        <td className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div
                className="font-medium text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {service.name}
              </div>
              {service.description && (
                <div
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {service.description.length > 50
                    ? `${service.description.substring(0, 50)}...`
                    : service.description}
                </div>
              )}
            </div>
            {service.is_secret && (
              <FaShieldAlt
                className="h-4 w-4 text-yellow-500"
                title="Secret Service"
              />
            )}
          </div>
        </td>
        <td className="p-3">
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            {service.type || 'Default'}
          </span>
        </td>
        <td className="p-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          {(() => {
            const providerName = getProviderNameById(service.providerId, service.provider);
            console.log('Rendering provider name for service:', service.id, 'providerId:', service.providerId, 'result:', providerName);
            return providerName;
          })()}
        </td>
        <td className="p-3">
          <PriceDisplay
            amount={service.price_per_k}
            originalCurrency="USD"
            className="text-sm font-medium"
          />
        </td>
        <td className="p-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          {service.min_order?.toLocaleString()} /{' '}
          {service.max_order?.toLocaleString()}
        </td>
        <td className="p-3">
          <button
            onClick={() => onToggleRefill(service.id)}
            disabled={isUpdating}
            className={`p-1 rounded transition-colors duration-200 ${
              service.refill_enabled
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={
              service.refill_enabled ? 'Refill Enabled' : 'Refill Disabled'
            }
          >
            {service.refill_enabled ? (
              <FaToggleOn className="h-5 w-5" />
            ) : (
              <FaToggleOff className="h-5 w-5" />
            )}
          </button>
        </td>
        <td className="p-3">
          <button
            onClick={() => onToggleCancel(service.id)}
            disabled={isUpdating}
            className={`p-1 rounded transition-colors duration-200 ${
              service.cancel_enabled
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={
              service.cancel_enabled ? 'Cancel Enabled' : 'Cancel Disabled'
            }
          >
            {service.cancel_enabled ? (
              <FaToggleOn className="h-5 w-5" />
            ) : (
              <FaToggleOff className="h-5 w-5" />
            )}
          </button>
        </td>
        <td className="p-3">
          <button
            onClick={() => onToggleStatus(service.id)}
            disabled={isUpdating}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              service.status === 'active'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {service.status === 'active' ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(service.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
              title="Edit Service"
            >
              <FaEdit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleSecret(service.id)}
              disabled={isUpdating}
              className={`p-2 rounded transition-colors duration-200 ${
                service.is_secret
                  ? 'text-yellow-600 hover:bg-yellow-50'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={service.is_secret ? 'Remove from Secret' : 'Make Secret'}
            >
              <FaShieldAlt className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

MemoizedServiceRow.displayName = 'MemoizedServiceRow';

const MemoizedCategoryHeader = memo(
  ({
    categoryName,
    services,
    isCollapsed,
    onToggleCollapse,
    onSelectCategory,
    isAllSelected,
    onEditCategory,
    onDeleteCategory,
  }: {
    categoryName: string;
    services: any[];
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onSelectCategory: () => void;
    isAllSelected: boolean;
    onEditCategory: () => void;
    onDeleteCategory: () => void;
  }) => {
    return (
      <tr className="bg-gray-50 border-b-2 border-gray-200">
        <td colSpan={11} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                title={isCollapsed ? 'Expand category' : 'Collapse category'}
              >
                {isCollapsed ? (
                  <FaChevronRight className="h-4 w-4 text-gray-600" />
                ) : (
                  <FaChevronDown className="h-4 w-4 text-gray-600" />
                )}
              </button>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectCategory}
                className="rounded border-gray-300 w-4 h-4"
              />
              <h3
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {categoryName}
              </h3>
              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {services.length} services
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEditCategory}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200"
                title="Edit Category"
              >
                <FaEdit className="h-4 w-4" />
              </button>
              <button
                onClick={onDeleteCategory}
                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors duration-200"
                title="Delete Category"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }
);

MemoizedCategoryHeader.displayName = 'MemoizedCategoryHeader';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Toast Component with animation
const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div
    className={`toast toast-${type} animate-in slide-in-from-top-2 fade-in duration-300`}
  >
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button
      onClick={onClose}
      className="toast-close hover:bg-gray-100 rounded transition-colors duration-200"
      title="Close notification"
    >
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  onClose,
  onConfirm,
  selectedCount,
}: {
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
}) => {
  return (
    <div className="w-full max-w-md">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Confirm Deletion
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-4">
          {/* Warning Icon and Message */}
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <FaExclamationTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                Delete {selectedCount} Service{selectedCount !== 1 ? 's' : ''}?
              </p>
              <p className="text-sm text-red-600 mt-1">
                This action cannot be undone. All selected services will be
                permanently removed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="btn btn-secondary px-6 py-2">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-2"
            >
              <FaTrash className="h-4 w-4" />
              Delete {selectedCount > 1 ? 'All' : 'Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteServicesAndCategoriesModal = ({
  onClose,
  onConfirm,
  selectedServiceCount,
  selectedCategoryCount,
}: {
  onClose: () => void;
  onConfirm: () => void;
  selectedServiceCount: number;
  selectedCategoryCount: number;
}) => {
  return (
    <div className="w-full max-w-md">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Confirm Deletion
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-4">
          {/* Warning Icon and Message */}
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <FaExclamationTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                Delete {selectedServiceCount} Service{selectedServiceCount !== 1 ? 's' : ''} and {selectedCategoryCount} Categor{selectedCategoryCount !== 1 ? 'ies' : 'y'}?
              </p>
              <p className="text-sm text-red-600 mt-1">
                This action cannot be undone. All selected services and categories will be
                permanently removed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="btn btn-secondary px-6 py-2">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-2"
            >
              <FaTrash className="h-4 w-4" />
              Delete All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Category Confirmation Modal Component
const DeleteCategoryModal = ({
  onClose,
  onConfirm,
  categoryName,
  categoryId,
  isUpdating,
  servicesCount,
  categoriesData,
}: {
  onClose: () => void;
  onConfirm: (action: 'delete' | 'move', targetCategoryId?: string) => void;
  categoryName: string;
  categoryId: number;
  isUpdating: boolean;
  servicesCount: number;
  categoriesData: any;
}) => {
  const [deleteAction, setDeleteAction] = useState<'delete' | 'move'>('delete');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');

  // Filter out the current category from available options
  const availableCategories =
    categoriesData?.data?.filter((cat: any) => cat.id !== categoryId) || [];

  const handleConfirm = () => {
    if (deleteAction === 'move' && !targetCategoryId) {
      return; // Don't proceed if no target category selected
    }
    onConfirm(deleteAction, targetCategoryId || undefined);
  };

  return (
    <div className="w-full max-w-lg">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Delete "{categoryName}" Category
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-4">
          {/* Warning Icon and Message */}
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <FaExclamationTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                This category contains {servicesCount} service
                {servicesCount !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Choose how to handle the services before deleting the category.
              </p>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-3">
            <p className="font-medium text-gray-800">
              What would you like to do with the services?
            </p>

            {/* Option 1: Delete with services */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="deleteAction"
                value="delete"
                checked={deleteAction === 'delete'}
                onChange={(e) => setDeleteAction(e.target.value as 'delete')}
                className="mt-0.5"
              />
              <div>
                <div className="font-medium text-gray-800">
                  Delete category with all services
                </div>
                <div className="text-sm text-gray-600">
                  Permanently remove the category and all {servicesCount}{' '}
                  service{servicesCount !== 1 ? 's' : ''}
                </div>
              </div>
            </label>

            {/* Option 2: Move services */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="deleteAction"
                value="move"
                checked={deleteAction === 'move'}
                onChange={(e) => setDeleteAction(e.target.value as 'move')}
                className="mt-0.5"
                disabled={availableCategories.length === 0}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  Move services to another category
                  {availableCategories.length === 0 && (
                    <span className="text-red-500 text-sm ml-2">
                      (No other categories available)
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Transfer all services to a different category before deleting
                  this one
                </div>

                {/* Category Selection Dropdown */}
                {deleteAction === 'move' && availableCategories.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select target category:
                    </label>
                    <select
                      value={targetCategoryId}
                      onChange={(e) => setTargetCategoryId(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-900 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">Choose a category...</option>
                      {availableCategories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Additional Warning for Delete Action */}
          {deleteAction === 'delete' && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete both the
                category and all {servicesCount} service
                {servicesCount !== 1 ? 's' : ''} inside it. This action cannot
                be undone.
              </p>
            </div>
          )}

          {/* Success info for Move Action */}
          {deleteAction === 'move' && targetCategoryId && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Ready:</strong> All services will be moved to "
                {
                  availableCategories.find(
                    (cat: any) => cat.id === targetCategoryId
                  )?.category_name
                }
                " before deleting this category.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="btn btn-secondary px-6 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                isUpdating || (deleteAction === 'move' && !targetCategoryId)
              }
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  {deleteAction === 'delete'
                    ? 'Deleting...'
                    : 'Moving & Deleting...'}
                </>
              ) : (
                <>
                  <FaTrash className="h-4 w-4" />
                  {deleteAction === 'delete'
                    ? 'Delete All'
                    : 'Move & Delete Category'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Service Form Component (integrated)
const CreateServiceForm: React.FC<{
  onClose: () => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info' | 'pending'
  ) => void;
  onRefresh?: () => void;
  refreshAllDataWithServices?: () => Promise<void>;
}> = ({ onClose, showToast, onRefresh, refreshAllDataWithServices }) => {
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetCategories();
  const {
    data: serviceTypesData,
    error: serviceTypesError,
    isLoading: serviceTypesLoading,
  } = useSWR('/api/admin/service-types', fetcher);

  // Debug service types data
  useEffect(() => {
    console.log('🔍 Service Types Debug in Admin Services:');
    console.log('📊 serviceTypesData:', serviceTypesData);
    console.log('📊 serviceTypesError:', serviceTypesError);
    console.log('📊 serviceTypesLoading:', serviceTypesLoading);
    if (serviceTypesData?.data) {
      console.log('📋 Service types count:', serviceTypesData.data.length);
      serviceTypesData.data.forEach((type: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${type.id}, Name: ${type.name}`);
      });
    }
  }, [serviceTypesData, serviceTypesError, serviceTypesLoading]);
  const {
    data: providersData,
    error: providersError,
    isLoading: providersLoading,
  } = useSWR('/api/admin/providers?filter=active', fetcher);



  const [isPending, startTransition] = useTransition();
  const [orderLinkType, setOrderLinkType] = useState<'link' | 'username'>('link');

  // Helper function to detect if service requires username based on name/type patterns
  const detectOrderLinkType = useCallback((serviceName: string, serviceType?: string): 'link' | 'username' => {
    const name = serviceName.toLowerCase();
    const type = serviceType?.toLowerCase() || '';
    
    // Keywords that typically require username
    const usernameKeywords = ['comment', 'mention', 'reply', 'custom', 'dm', 'message', 'tag'];
    
    // Keywords that typically require link
    const linkKeywords = ['follower', 'like', 'view', 'subscriber', 'share', 'watch', 'impression'];
    
    // Check for username patterns first (more specific)
    if (usernameKeywords.some(keyword => name.includes(keyword) || type.includes(keyword))) {
      return 'username';
    }
    
    // Check for link patterns
    if (linkKeywords.some(keyword => name.includes(keyword) || type.includes(keyword))) {
      return 'link';
    }
    
    // Default to link if uncertain
    return 'link';
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateServiceSchema>({
    mode: 'onChange',
    // No resolver to allow empty fields
    defaultValues: {
      ...createServiceDefaultValues,
      mode: 'manual', // Set default mode to manual
      orderLink: 'link', // Set default order link to 'link'
    },
  });

  // Auto-select Default service type when service types are loaded
  useEffect(() => {
    if (serviceTypesData?.data && !watch('serviceTypeId')) {
      const defaultServiceType = serviceTypesData.data.find(
        (serviceType: any) => serviceType.name === 'Default'
      );
      if (defaultServiceType) {
        setValue('serviceTypeId', defaultServiceType.id.toString());
      }
    }
  }, [serviceTypesData, setValue, watch]);

  // Watch refill field to control readonly state of refill days and display
  const refillValue = watch('refill');
  
  // Watch mode field to control API provider field visibility
  const modeValue = watch('mode');
  
  // Watch provider field for API services
  const providerIdValue = watch('providerId');

  // Fetch API services when provider is selected
  const {
    data: apiServicesData,
    error: apiServicesError,
    isLoading: apiServicesLoading,
  } = useSWR(
    modeValue === 'auto' && providerIdValue ? `/api/admin/providers/${providerIdValue}/services` : null,
    fetcher
  );

  // Watch API service selection for auto-fill
  const apiServiceIdValue = watch('apiServiceId');

  // Function to map API service type to internal service type ID
  const mapApiServiceTypeToInternalType = (apiServiceType: string): string | null => {
    if (!apiServiceType || !serviceTypesData?.data) return null;
    
    // Normalize the API service type for comparison
    const normalizedApiType = apiServiceType.toLowerCase().trim();
    
    // Define mapping rules (case-insensitive)
    const typeMapping: { [key: string]: string[] } = {
      '1': ['default', 'standard', 'normal', 'regular', 'basic'], // Default
      '2': ['package', 'pack', 'bundle', 'fixed'], // Package
      '3': ['special comments', 'custom comments', 'comments', 'special comment'], // Special Comments
      '4': ['package comments', 'pack comments', 'bundle comments', 'package comment'], // Package Comments
      '11': ['auto likes', 'auto like', 'subscription likes', 'auto-likes'], // Auto Likes
      '12': ['auto views', 'auto view', 'subscription views', 'auto-views'], // Auto Views
      '13': ['auto comments', 'auto comment', 'subscription comments', 'auto-comments'], // Auto Comments
      '14': ['limited auto likes', 'limited likes', 'limited auto like'], // Limited Auto Likes
      '15': ['limited auto views', 'limited views', 'limited auto view'], // Limited Auto Views
    };
    
    // Find matching service type
    for (const [internalTypeId, apiTypeVariants] of Object.entries(typeMapping)) {
      if (apiTypeVariants.some(variant => normalizedApiType.includes(variant))) {
        // Verify this service type exists in our system
        const serviceTypeExists = serviceTypesData.data.find(
          (type: any) => type.id.toString() === internalTypeId
        );
        if (serviceTypeExists) {
          return internalTypeId;
        }
      }
    }
    
    // If no exact match found, try partial matching
    for (const serviceType of serviceTypesData.data) {
      const normalizedInternalName = serviceType.name.toLowerCase();
      if (normalizedApiType.includes(normalizedInternalName) || 
          normalizedInternalName.includes(normalizedApiType)) {
        return serviceType.id.toString();
      }
    }
    
    return null; // No match found
  };

  // Auto-fill form fields when API service is selected
  useEffect(() => {
    if (apiServiceIdValue && apiServicesData?.data?.services) {
      const selectedService = apiServicesData.data.services.find(
        (service: any) => service.id.toString() === apiServiceIdValue
      );
      
      if (selectedService) {
        setValue('name', selectedService.name || '');
        setValue('description', selectedService.description || '');
        setValue('rate', selectedService.rate?.toString() || '');
        setValue('min_order', selectedService.min?.toString() || '');
        setValue('max_order', selectedService.max?.toString() || '');
        setValue('perqty', '1000'); // Keep default per quantity
        setValue('avg_time', '0-1 hours'); // Default average time
        
        // Auto-fill service type based on API service type
        if (selectedService.type && serviceTypesData?.data) {
          const mappedServiceTypeId = mapApiServiceTypeToInternalType(selectedService.type);
          if (mappedServiceTypeId) {
            setValue('serviceTypeId', mappedServiceTypeId);
            console.log(`🎯 Auto-filled service type: ${selectedService.type} → ID ${mappedServiceTypeId}`);
          } else {
            console.log(`⚠️ No mapping found for service type: ${selectedService.type}`);
          }
        }
        
        // Auto-fill refill and cancel settings from provider service
        // Handle refill field - convert to boolean for form
        let refillBoolValue = false; // default
        if (selectedService.refill !== undefined && selectedService.refill !== null) {
          if (typeof selectedService.refill === 'boolean') {
            refillBoolValue = selectedService.refill;
          } else if (typeof selectedService.refill === 'string') {
            const refillStr = selectedService.refill.toLowerCase();
            refillBoolValue = (refillStr === 'true' || refillStr === '1' || refillStr === 'on' || refillStr === 'yes');
          } else if (typeof selectedService.refill === 'number') {
            refillBoolValue = selectedService.refill > 0;
          }
        }
        
        // Handle cancel field - convert to boolean for form
        let cancelBoolValue = false; // default
        if (selectedService.cancel !== undefined && selectedService.cancel !== null) {
          if (typeof selectedService.cancel === 'boolean') {
            cancelBoolValue = selectedService.cancel;
          } else if (typeof selectedService.cancel === 'string') {
            const cancelStr = selectedService.cancel.toLowerCase();
            cancelBoolValue = (cancelStr === 'true' || cancelStr === '1' || cancelStr === 'on' || cancelStr === 'yes');
          } else if (typeof selectedService.cancel === 'number') {
            cancelBoolValue = selectedService.cancel > 0;
          }
        }
        
        setValue('refill', refillBoolValue);
        setValue('cancel', cancelBoolValue);
        
        // Set refill days and refill display if refill is enabled
        if (refillBoolValue) {
          // Set default values for refill days and display if not provided
          const refillDays = selectedService.refillDays || selectedService.refill_days || 30;
          const refillDisplay = selectedService.refillDisplay || selectedService.refill_display || 24;
          
          setValue('refillDays', refillDays.toString());
          setValue('refillDisplay', refillDisplay.toString());
        } else {
          // Clear refill days and display when refill is disabled
          setValue('refillDays', '');
          setValue('refillDisplay', '');
        }
        
        // Detect and set order link type based on service name and type
        const detectedType = detectOrderLinkType(selectedService.name, selectedService.type);
        setValue('orderLink', detectedType);
        setOrderLinkType(detectedType);
      }
    } else {
      // Reset to default when no API service is selected
      setValue('orderLink', 'link');
      setOrderLinkType('link');
      setValue('refill', false);
      setValue('cancel', false);
      setValue('refillDays', '');
      setValue('refillDisplay', '');
    }
  }, [apiServiceIdValue, apiServicesData, serviceTypesData, detectOrderLinkType]);

  const onSubmit: SubmitHandler<CreateServiceSchema> = async (values) => {
    console.log('Form submitted with values:', values);

    // Validate required fields
    if (!values.categoryId || values.categoryId === '') {
      showToast('Please select a service category', 'error');
      return;
    }

    if (!values.serviceTypeId || values.serviceTypeId === '') {
      showToast('Please select a service type', 'error');
      return;
    }

    // Validate API provider when mode is auto
    if (values.mode === 'auto' && (!values.providerId || values.providerId === '')) {
      showToast('Please select an API provider when mode is Auto (API)', 'error');
      return;
    }

    // Filter out empty values for create service
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => {
        if (value === '' || value === null || value === undefined) return false;
        return true;
      })
    );

    console.log('Filtered values to send:', filteredValues);

    startTransition(async () => {
      try {
        console.log('Sending request to API...');
        const response = await axiosInstance.post(
          '/api/admin/services',
          filteredValues
        );
        console.log('API response:', response.data);
        if (response.data.success) {
          reset();
          showToast(response.data.message, 'success');
          // Live refresh all data
          if (refreshAllDataWithServices) {
            await refreshAllDataWithServices();
          }
          if (onRefresh) onRefresh();
          onClose(); // Close modal on success
        } else {
          showToast(response.data.error, 'error');
        }
      } catch (error: any) {
        console.error('API Error:', error);
        showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
      }
    });
  };

  if (categoriesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center flex flex-col items-center">
            <GradientSpinner size="w-12 h-12" className="mb-3" />
            <div className="text-base font-medium">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading categories</p>
          <p className="text-gray-500 text-sm mt-1">{categoriesError}</p>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!categoriesData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaExclamationTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No categories available</p>
          <p className="text-gray-500 text-sm mt-1">
            Please add categories first
          </p>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Create New Service
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Name - 100% width - REQUIRED */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Name
              </FormLabel>
              <FormControl>
                <input
                  type="text"
                  placeholder="Enter service name"
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  {...register('name')}
                  disabled={isPending}
                  required
                />
              </FormControl>
              <FormMessage>{errors.name?.message}</FormMessage>
            </FormItem>

            {/* Service Category - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Category <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('categoryId')}
                  disabled={isPending}
                  required
                >
                  <option value={''} hidden>
                    Select Service Category
                  </option>
                  {categoriesData?.data?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category?.category_name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage>{errors.categoryId?.message}</FormMessage>
            </FormItem>

            {/* Service Type - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Type <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('serviceTypeId')}
                  disabled={isPending || serviceTypesLoading}
                  required
                >
                  <option value="">Select Service Type</option>
                  {serviceTypesData?.data?.map((serviceType: any) => (
                    <option key={serviceType.id} value={serviceType.id}>
                      {serviceType.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage>{errors.serviceTypeId?.message}</FormMessage>
            </FormItem>

            {/* Mode - 100% width - REQUIRED with default manual */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Mode <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('mode')}
                  disabled={isPending}
                  required
                >
                  <option value="manual">Manual</option>
                  <option value="auto">Auto (API)</option>
                </select>
              </FormControl>
              <FormMessage>{errors.mode?.message}</FormMessage>
            </FormItem>

            {/* API Provider - 100% width - CONDITIONAL - Only show when mode is auto */}
            {modeValue === 'auto' && (
              <FormItem className="md:col-span-2">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  API Provider <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    {...register('providerId')}
                    disabled={isPending || providersLoading}
                    required={modeValue === 'auto'}
                  >
                    <option value="">Select API Provider</option>
                    {providersData?.data?.providers?.map((provider: any) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage>{errors.providerId?.message}</FormMessage>
              </FormItem>
            )}



            {/* API Service - Only show when mode is auto and provider is selected */}
            {modeValue === 'auto' && providerIdValue && (
              <FormItem className="md:col-span-2">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  API Service <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    {...register('apiServiceId')}
                    disabled={isPending || apiServicesLoading}
                    required={modeValue === 'auto' && providerIdValue}
                  >
                    <option value="">
                      {apiServicesLoading ? 'Loading services...' : 'Select API Service'}
                    </option>
                    {apiServicesData?.data?.services?.map((service: any) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage>{errors.apiServiceId?.message}</FormMessage>
                {apiServicesError && (
                  <p className="text-sm text-red-500 mt-1">
                    Failed to load services. Please try again.
                  </p>
                )}
              </FormItem>
            )}

            {/* Service Price - 33% width - special grid - REQUIRED */}
            <div className="md:col-span-2 grid grid-cols-3 gap-6">
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Service Price{' '}
                  <span className="text-red-500">* (Always USD Price)</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter service price"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('rate')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.rate?.message}</FormMessage>
              </FormItem>

              {/* Minimum Order - 33% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Minimum Order <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter minimum order"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('min_order')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.min_order?.message}</FormMessage>
              </FormItem>

              {/* Maximum Order - 33% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Maximum Order <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter maximum order"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('max_order')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.max_order?.message}</FormMessage>
              </FormItem>
            </div>

            {/* Per Quantity and Average Time - 50% width each - REQUIRED */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Per Quantity - 50% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Per Quantity (Default: 1000)
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={1}
                    placeholder="Enter per quantity (default: 1000)"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('perqty')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.perqty?.message}</FormMessage>
              </FormItem>

              {/* Average Time - 50% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Average Time <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    placeholder="e.g., 1-2 hours, 24 hours"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    {...register('avg_time')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.avg_time?.message}</FormMessage>
              </FormItem>
            </div>

            {/* Refill - 100% width - REQUIRED */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Refill <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('refill', {
                    setValueAs: (value) => value === 'true',
                  })}
                  disabled={isPending}
                  required
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </FormControl>
              <FormMessage>{errors.refill?.message}</FormMessage>
            </FormItem>

            {/* Refill Days - 50% width (show only when refill is on) - REQUIRED */}
            {refillValue === true && (
              <FormItem className="md:col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Refill Days <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter refill days"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('refillDays')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.refillDays?.message}</FormMessage>
              </FormItem>
            )}

            {/* Refill Display - 50% width (show only when refill is on) - REQUIRED */}
            {refillValue === true && (
              <FormItem className="md:col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Refill Display (in hours){' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter refill display hours"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('refillDisplay')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.refillDisplay?.message}</FormMessage>
              </FormItem>
            )}

            {/* Cancel - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Cancel <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('cancel', {
                    setValueAs: (value) => value === 'true',
                  })}
                  disabled={isPending}
                  required
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </FormControl>
              <FormMessage>{errors.cancel?.message}</FormMessage>
            </FormItem>

            {/* Personalized Service - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Personalized Service <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('personalizedService')}
                  disabled={isPending}
                  required
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </FormControl>
              <FormMessage>{errors.personalizedService?.message}</FormMessage>
            </FormItem>

            {/* Order Link - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {orderLinkType === 'username' ? 'Username' : 'Order Link'} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('orderLink')}
                  disabled={isPending}
                  required
                >
                  <option value="link">Link</option>
                  <option value="username">Username</option>
                </select>
              </FormControl>
              <FormMessage>{errors.orderLink?.message}</FormMessage>
            </FormItem>

            {/* Service Speed - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Speed <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('serviceSpeed')}
                  disabled={isPending}
                  required
                >
                  <option value="">Select Service Speed</option>
                  <option value="slow">Slow</option>
                  <option value="sometimes_slow">Sometimes Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </FormControl>
              <FormMessage>{errors.serviceSpeed?.message}</FormMessage>
            </FormItem>
          </div>

          {/* Refill and Cancel Options - Hidden from UI */}
          {/*
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="md:col-span-1">
              <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Refill Enabled
              </FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300 rounded"
                    {...register('refill')}
                    disabled={isPending}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Enable refill for this service
                  </span>
                </div>
              </FormControl>
              <FormMessage>{errors.refill?.message}</FormMessage>
            </FormItem>

            <FormItem className="md:col-span-1">
              <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Cancel Enabled
              </FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300 rounded"
                    {...register('cancel')}
                    disabled={isPending}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Enable cancel for this service
                  </span>
                </div>
              </FormControl>
              <FormMessage>{errors.cancel?.message}</FormMessage>
            </FormItem>
          </div>
          */}

          {/* Duplicate Refill Days field removed - using the one in grid layout above */}

          {/* Processing Mode - 100% width - COMMENTED OUT */}
          {/*
          <div className="grid grid-cols-1 gap-6">
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Processing Mode
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('mode')}
                  disabled={isPending}
                >
                  <option value="manual">Manual</option>
                  <option value="auto">Auto</option>
                </select>
              </FormControl>
              <FormMessage>{errors.mode?.message}</FormMessage>
            </FormItem>
          </div>
          */}

          {/* Service Description - 100% width - REQUIRED */}
          <FormItem>
            <FormLabel
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Service Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <textarea
                placeholder="Enter service description"
                className="form-field w-full min-h-[120px] resize-y px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                {...register('description')}
                disabled={isPending}
                required
              />
            </FormControl>
            <FormMessage>{errors.description?.message}</FormMessage>
          </FormItem>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex items-center gap-2 px-8 py-3"
            >
              {isPending ? (
                <>
                  Creating Service...
                </>
              ) : (
                <>
                  <FaPlus className="h-4 w-4" />
                  Create Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Category Form Component (integrated)
const CreateCategoryForm = ({
  onClose,
  showToast,
  onRefresh,
}: {
  onClose: () => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info' | 'pending'
  ) => void;
  onRefresh?: () => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    mode: 'all',
    defaultValues: {
      ...createCategoryDefaultValues,
      hideCategory: 'no',
      position: 'top',
    },
  });

  const onSubmit: SubmitHandler<CreateCategorySchema> = async (values) => {
    startTransition(() => {
      // handle form submission
      axiosInstance
        .post('/api/admin/categories', values)
        .then((res) => {
          if (res.data.success) {
            reset();
            showToast(
              res.data.message || 'Category created successfully',
              'success'
            );
            // Refresh all category-related data for live updates
            mutate('/api/admin/categories');
            mutate('/api/admin/categories/get-categories');
            mutate('/api/admin/services'); // Refresh services to show updated category names
            // Live refresh parent data
            if (onRefresh) onRefresh();
            onClose();
          } else {
            showToast(res.data.error || 'Failed to create category', 'error');
          }
        })
        .catch((error) => {
          showToast(
            `Error: ${
              error.response?.data?.error ||
              error.message ||
              'Something went wrong'
            }`,
            'error'
          );
        });
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3 className="text-lg font-semibold">Create New Category</h3>
      </div>

      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Name */}
          <FormItem>
            <FormLabel className="form-label">Category Name</FormLabel>
            <FormControl>
              <input
                type="text"
                placeholder="Enter category name"
                className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                {...register('category_name')}
                disabled={isPending}
                autoFocus
              />
            </FormControl>
            <FormMessage>{errors.category_name?.message}</FormMessage>
          </FormItem>

          {/* Hide Category */}
          <FormItem>
            <FormLabel className="form-label">Hide Category</FormLabel>
            <FormControl>
              <select
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                {...register('hideCategory')}
                disabled={isPending}
              >
                <option value="no">No (Category will be visible/active)</option>
                <option value="yes">
                  Yes (Category will be hidden/deactivated)
                </option>
              </select>
            </FormControl>
            <FormMessage>{errors.hideCategory?.message}</FormMessage>
          </FormItem>

          {/* Position */}
          <FormItem>
            <FormLabel className="form-label">Position</FormLabel>
            <FormControl>
              <select
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                {...register('position')}
                disabled={isPending}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </FormControl>
            <FormMessage>{errors.position?.message}</FormMessage>
          </FormItem>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex items-center gap-2 px-8 py-3"
            >
              {isPending ? (
                <>
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Category Form Component (integrated)
const EditCategoryForm = ({
  categoryId,
  categoryName,
  onClose,
  showToast,
  refreshAllData,
}: {
  categoryId: string;
  categoryName: string;
  onClose: () => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info' | 'pending'
  ) => void;
  refreshAllData?: () => Promise<void>;
}) => {
  const { data: categoriesData } = useGetCategories();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    mode: 'all',
    defaultValues: {
      ...createCategoryDefaultValues,
      hideCategory: 'no',
      position: 'top',
    },
  });

  // Pre-populate form with existing category data
  useEffect(() => {
    if (categoriesData?.data && categoryId) {
      const category = categoriesData.data.find(
        (cat: any) => cat.id === parseInt(categoryId)
      );
      if (category) {
        reset({
          category_name: category.category_name || '',
          hideCategory: category.hideCategory || 'no',
          position: category.position || 'top',
        });
      }
    }
  }, [categoriesData, categoryId, reset]);

  const onSubmit: SubmitHandler<CreateCategorySchema> = async (values) => {
    startTransition(async () => {
      try {
        // handle form submission for updating
        const res = await axiosInstance.put(
          `/api/admin/categories/${categoryId}`,
          values
        );
        if (res.data.success) {
          showToast(
            res.data.message || 'Category updated successfully',
            'success'
          );

          // Refresh all category-related data for live updates
          mutate('/api/admin/categories');
          mutate('/api/admin/categories/get-categories');
          mutate('/api/admin/services'); // Refresh services to show updated category names

          // Call refreshAllData for live action updates
          if (refreshAllData) {
            await refreshAllData();
          }

          onClose();
        } else {
          showToast(res.data.error || 'Failed to update category', 'error');
        }
      } catch (error: any) {
        showToast(
          `Error: ${
            error.response?.data?.error ||
            error.message ||
            'Something went wrong'
          }`,
          'error'
        );
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3 className="text-lg font-semibold">Edit Category</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Name */}
          <FormItem>
            <FormLabel className="form-label">Category Name</FormLabel>
            <FormControl>
              <input
                type="text"
                placeholder="Enter category name"
                className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                {...register('category_name')}
                disabled={isPending}
                autoFocus
              />
            </FormControl>
            <FormMessage>{errors.category_name?.message}</FormMessage>
          </FormItem>

          {/* Hide Category */}
          <FormItem>
            <FormLabel className="form-label">Hide Category</FormLabel>
            <FormControl>
              <select
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                {...register('hideCategory')}
                disabled={isPending}
              >
                <option value="no">No (Category will be visible/active)</option>
                <option value="yes">
                  Yes (Category will be hidden/deactivated)
                </option>
              </select>
            </FormControl>
            <FormMessage>{errors.hideCategory?.message}</FormMessage>
          </FormItem>

          {/* Position */}
          <FormItem>
            <FormLabel className="form-label">Position</FormLabel>
            <FormControl>
              <select
                className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                {...register('position')}
                disabled={isPending}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </FormControl>
            <FormMessage>{errors.position?.message}</FormMessage>
          </FormItem>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex items-center gap-2 px-8 py-3"
            >
              {isPending ? (
                <>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  Update Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Service Form Component (integrated)
const EditServiceForm = ({
  serviceId,
  onClose,
  showToast,
  refreshAllData,
}: {
  serviceId: number;
  onClose: () => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info' | 'pending'
  ) => void;
  refreshAllData?: () => Promise<void>;
}) => {
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetCategories();
  const {
    data: serviceTypesData,
    error: serviceTypesError,
    isLoading: serviceTypesLoading,
  } = useSWR('/api/admin/service-types', fetcher);
  const {
    data: serviceData,
    error: serviceError,
    isLoading: serviceLoading,
  } = useGetServicesId(serviceId);
  const {
    data: providersData,
    error: providersError,
    isLoading: providersLoading,
  } = useSWR('/api/admin/providers?filter=active', fetcher);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateServiceSchema>({
    mode: 'onChange',
    // No resolver for edit form to allow empty fields
    defaultValues: {
      ...createServiceDefaultValues,
      mode: 'manual',
    },
  });

  // Watch refill field to control readonly state of refill days and display
  const refillValue = watch('refill');
  
  // Watch mode field to control API provider field visibility
  const modeValue = watch('mode');

  useEffect(() => {
    if (serviceData?.data && categoriesData?.data) {
      reset({
        categoryId: serviceData.data.categoryId || '',
        name: serviceData.data.name || '',
        description: serviceData.data.description || '',
        rate: String(serviceData.data.rate) || '',
        min_order: String(serviceData.data.min_order) || createServiceDefaultValues.min_order,
        max_order: String(serviceData.data.max_order) || createServiceDefaultValues.max_order,
        perqty: String(serviceData.data.perqty) || createServiceDefaultValues.perqty,
        avg_time: serviceData.data.avg_time || '',
        updateText: serviceData.data.updateText || '',
        serviceTypeId: serviceData.data.serviceTypeId || '',
        mode: serviceData.data.mode || createServiceDefaultValues.mode,
        refill: Boolean(serviceData.data.refill),
        refillDays: serviceData.data.refillDays || createServiceDefaultValues.refillDays,
        refillDisplay: serviceData.data.refillDisplay || createServiceDefaultValues.refillDisplay,
        cancel: serviceData.data.cancel || createServiceDefaultValues.cancel,
        personalizedService: serviceData.data.personalizedService || createServiceDefaultValues.personalizedService,
        serviceSpeed: serviceData.data.serviceSpeed || createServiceDefaultValues.serviceSpeed,
        orderLink: serviceData.data.orderLink || createServiceDefaultValues.orderLink,
        providerId: serviceData.data.providerId || createServiceDefaultValues.providerId,
        apiServiceId: serviceData.data.apiServiceId || createServiceDefaultValues.apiServiceId,
      });
    }
  }, [categoriesData, reset, serviceData]);

  const onSubmit: SubmitHandler<CreateServiceSchema> = async (values) => {
    console.log('Edit form submitted with values:', values);
    console.log('Service ID:', serviceId);

    // Validate required fields
    if (!values.categoryId || values.categoryId === '') {
      showToast('Please select a service category', 'error');
      return;
    }

    if (!values.serviceTypeId || values.serviceTypeId === '') {
      showToast('Please select a service type', 'error');
      return;
    }

    // Validate API provider when mode is auto
    if (values.mode === 'auto' && (!values.providerId || values.providerId === '')) {
      showToast('Please select an API provider when mode is Auto (API)', 'error');
      return;
    }

    // Filter out empty values and only send changed fields
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => {
        if (value === '' || value === null || value === undefined) return false;
        return true;
      })
    );

    console.log('Filtered values to send:', filteredValues);

    startTransition(async () => {
      try {
        console.log('Sending edit request to API...');
        const response = await axiosInstance.put(
          `/api/admin/services/update-services?id=${serviceId}`,
          filteredValues
        );
        console.log('Edit API response:', response.data);
        if (response.data.success) {
          showToast(
            response.data.message || 'Service updated successfully',
            'success'
          );
          // Live refresh all data
          if (refreshAllData) {
            await refreshAllData();
          }
          onClose(); // Close modal on success
        } else {
          showToast(response.data.error || 'Failed to update service', 'error');
        }
      } catch (error: any) {
        console.error('Edit API Error:', error);
        showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
      }
    });
  };

  if (categoriesLoading || serviceLoading || !serviceData?.data) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center flex flex-col items-center">
            <GradientSpinner size="w-12 h-12" className="mb-3" />
            <div className="text-base font-medium">Loading service data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesError || serviceError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading service data</p>
          <p className="text-gray-500 text-sm mt-1">
            {categoriesError || serviceError}
          </p>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!categoriesData || !serviceData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaExclamationTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No service data available</p>
          <p className="text-gray-500 text-sm mt-1">
            Service not found or data unavailable
          </p>
          <div className="flex justify-center mt-4">
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6">
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Edit Service
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Name - 100% width - REQUIRED */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Name
              </FormLabel>
              <FormControl>
                <input
                  type="text"
                  placeholder="Enter service name"
                  className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  {...register('name')}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage>{errors.name?.message}</FormMessage>
            </FormItem>

            {/* Service Category - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Category
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('categoryId')}
                  disabled={isPending}
                  required
                >
                  <option value={''} hidden>
                    Select Service Category
                  </option>
                  {categoriesData?.data?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category?.category_name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage>{errors.categoryId?.message}</FormMessage>
            </FormItem>

            {/* Service Type - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Type
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('serviceTypeId')}
                  disabled={isPending || serviceTypesLoading}
                  required
                >
                  <option value="">Select Service Type</option>
                  {serviceTypesData?.data?.map((serviceType: any) => (
                    <option key={serviceType.id} value={serviceType.id}>
                      {serviceType.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage>{errors.serviceTypeId?.message}</FormMessage>
            </FormItem>

            {/* Mode - 100% width - REQUIRED with default manual */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Mode
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('mode')}
                  disabled={isPending}
                >
                  <option value="manual">Manual</option>
                  <option value="auto">Auto (API)</option>
                </select>
              </FormControl>
              <FormMessage>{errors.mode?.message}</FormMessage>
            </FormItem>

            {/* API Provider - 100% width - CONDITIONAL - Only show when mode is auto */}
            {modeValue === 'auto' && (
              <FormItem className="md:col-span-2">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  API Provider <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                    {...register('providerId')}
                    disabled={isPending || providersLoading}
                    required={modeValue === 'auto'}
                  >
                    <option value="">Select API Provider</option>
                    {providersData?.data?.providers?.map((provider: any) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage>{errors.providerId?.message}</FormMessage>
              </FormItem>
            )}

            {/* Service Price - 33% width - special grid - REQUIRED */}
            <div className="md:col-span-2 grid grid-cols-3 gap-6">
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Service Price (Always USD Price)
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter service price"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('rate')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.rate?.message}</FormMessage>
              </FormItem>

              {/* Minimum Order - 33% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Minimum Order
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter minimum order"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('min_order')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.min_order?.message}</FormMessage>
              </FormItem>

              {/* Maximum Order - 33% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Maximum Order <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter maximum order"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('max_order')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.max_order?.message}</FormMessage>
              </FormItem>
            </div>

            {/* Per Quantity and Average Time - 50% width each - REQUIRED */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Per Quantity - 50% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Per Quantity (Default: 1000){' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={1}
                    placeholder="Enter per quantity (default: 1000)"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('perqty')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.perqty?.message}</FormMessage>
              </FormItem>

              {/* Average Time - 50% width - REQUIRED */}
              <FormItem className="col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Average Time <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    placeholder="e.g., 1-2 hours, 24 hours"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    {...register('avg_time')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.avg_time?.message}</FormMessage>
              </FormItem>
            </div>

            {/* Refill - 100% width - REQUIRED */}
            <FormItem className="md:col-span-2">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Refill <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('refill', {
                    setValueAs: (value) => value === 'true',
                  })}
                  disabled={isPending}
                  required
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </FormControl>
              <FormMessage>{errors.refill?.message}</FormMessage>
            </FormItem>

            {/* Refill Days - 50% width (show only when refill is on) - REQUIRED */}
            {refillValue === true && (
              <FormItem className="md:col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Refill Days <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter refill days"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('refillDays')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.refillDays?.message}</FormMessage>
              </FormItem>
            )}

            {/* Refill Display - 50% width (show only when refill is on) - REQUIRED */}
            {refillValue === true && (
              <FormItem className="md:col-span-1">
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Refill Display (in hours){' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter refill display hours"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('refillDisplay')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{errors.refillDisplay?.message}</FormMessage>
              </FormItem>
            )}

            {/* Cancel - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Cancel <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('cancel', {
                    setValueAs: (value) => value === 'true',
                  })}
                  disabled={isPending}
                  required
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </FormControl>
              <FormMessage>{errors.cancel?.message}</FormMessage>
            </FormItem>

            {/* Personalized Service - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Personalized Service <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('personalizedService')}
                  disabled={isPending}
                  required
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </FormControl>
              <FormMessage>{errors.personalizedService?.message}</FormMessage>
            </FormItem>

            {/* Order Link - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Order Link <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('orderLink')}
                  disabled={isPending}
                  required
                >
                  <option value="link">Link</option>
                  <option value="username">Username</option>
                </select>
              </FormControl>
              <FormMessage>{errors.orderLink?.message}</FormMessage>
            </FormItem>

            {/* Service Speed - 50% width - REQUIRED */}
            <FormItem className="md:col-span-1">
              <FormLabel
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service Speed <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                  {...register('serviceSpeed')}
                  disabled={isPending}
                  required
                >
                  <option value="">Select Service Speed</option>
                  <option value="slow">Slow</option>
                  <option value="sometimes_slow">Sometimes Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </FormControl>
              <FormMessage>{errors.serviceSpeed?.message}</FormMessage>
            </FormItem>
          </div>

          {/* Service Description - 100% width - REQUIRED */}
          <FormItem>
            <FormLabel
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Service Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <textarea
                placeholder="Enter service description"
                className="form-field w-full min-h-[120px] resize-y px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                {...register('description')}
                disabled={isPending}
                required
              />
            </FormControl>
            <FormMessage>{errors.description?.message}</FormMessage>
          </FormItem>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex items-center gap-2 px-8 py-3"
            >
              {isPending ? (
                <>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  Update Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function AdminServicesPage() {
  // Hooks
  const user = useCurrentUser();
  const { appName } = useAppNameWithFallback();

  // Set document title using useEffect for client-side
  useEffect(() => {
    setPageTitle('All Services', appName);
  }, [appName]);
  const { data: categoriesData, mutate: refreshCategories } =
    useGetCategories();

  // Fetch active providers from API with error handling - all active providers
  const { data: providersData, mutate: refreshProviders, error: providersError } = useSWR(
    '/api/admin/providers?filter=active',
    async (url) => {
      try {
        console.log('Fetching providers data...');
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add a longer timeout for this specific request
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Providers data fetched successfully:', data);
        return data;
      } catch (error) {
        console.error('Error fetching providers:', error);
        throw error;
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000, // Allow refetch after 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onError: (error) => {
        console.error('SWR providers fetch error:', error);
      }
    }
  );

  // Placeholder for refreshAllData - will be defined after refreshServices

  // State declarations
  const [stats, setStats] = useState({
    totalServices: 0,
    totalCategories: 0,
    activeServices: 0,
    inactiveServices: 0,
    trashServices: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('All');
  const [pageSize, setPageSize] = useState('25'); // Default to 25 categories per page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);

  // ServiceTable related state
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<any>({});
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [allCategoriesCollapsed, setAllCategoriesCollapsed] = useState(false);
  const [activeCategoryToggles, setActiveCategoryToggles] = useState<{
    [key: string]: boolean;
  }>({});

  // Drag and drop state for categories
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [dropTargetCategory, setDropTargetCategory] = useState<string | null>(
    null
  );
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(
    null
  );

  // Drag and drop state for services
  const [draggedService, setDraggedService] = useState<string | null>(null);
  const [serviceOrder, setServiceOrder] = useState<{
    [categoryName: string]: string[];
  }>({});
  const [dropTargetService, setDropTargetService] = useState<string | null>(
    null
  );
  const [dropPositionService, setDropPositionService] = useState<
    'before' | 'after' | null
  >(null);

  // Create Service Modal state
  const [createServiceModal, setCreateServiceModal] = useState(false);
  const [createServiceModalClosing, setCreateServiceModalClosing] =
    useState(false);

  // Create Category Modal state
  const [createCategoryModal, setCreateCategoryModal] = useState(false);
  const [createCategoryModalClosing, setCreateCategoryModalClosing] =
    useState(false);

  // Edit Category Modal state
  const [editCategoryModal, setEditCategoryModal] = useState<{
    open: boolean;
    categoryId: string;
    categoryName: string;
    closing: boolean;
  }>({
    open: false,
    categoryId: '',
    categoryName: '',
    closing: false,
  });

  // Edit Service Modal state with animation
  const [editServiceModal, setEditServiceModal] = useState<{
    open: boolean;
    serviceId: number;
    closing: boolean;
  }>({
    open: false,
    serviceId: 0,
    closing: false,
  });

  // Delete confirmation modal state
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteConfirmationModalClosing, setDeleteConfirmationModalClosing] =
    useState(false);

  // Delete services and categories confirmation modal state
  const [deleteServicesAndCategoriesModal, setDeleteServicesAndCategoriesModal] = useState(false);
  const [deleteServicesAndCategoriesModalClosing, setDeleteServicesAndCategoriesModalClosing] =
    useState(false);

  // Delete category modal state
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<{
    open: boolean;
    categoryName: string;
    categoryId: string | number;
    servicesCount: number;
    closing: boolean;
  }>({
    open: false,
    categoryName: '',
    categoryId: '',
    servicesCount: 0,
    closing: false,
  });

  // NEW: Add state for selected bulk operation
  type BulkOperation = 'enable' | 'disable' | 'make-secret' | 'remove-secret' | 'delete-pricing' | 'refill-enable' | 'refill-disable' | 'cancel-enable' | 'cancel-disable' | 'delete' | 'delete-services-categories' | '';
  const [selectedBulkOperation, setSelectedBulkOperation] = useState<BulkOperation>('');

  // Show toast notification - defined early
  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' | 'pending' = 'success'
    ) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  // Pagination functions
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Separate API call to get all services for counting purposes
  const { data: allServicesData } = useSWR(
    `/api/admin/services?page=1&limit=999999&search=&filter=all_with_trash`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // Services data fetching with pagination and optimized caching
  const {
    data,
    error,
    isLoading,
    mutate: refreshServices,
  } = useSWR(
    `/api/admin/services?page=${currentPage}&limit=${
      pageSize === 'all' ? '999999' : pageSize
    }&search=${searchTerm}&filter=${statusFilter}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true, // Keep previous data while loading new data
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // Debug logging
  console.log('=== DEBUG INFO ===');
  console.log('pageSize:', pageSize);
  console.log('statusFilter:', statusFilter);
  console.log('API URL:', `/api/admin/services?page=${currentPage}&limit=${pageSize === 'all' ? '999999' : pageSize}&search=${searchTerm}&filter=${statusFilter}`);
  console.log('API Response data:', data);
  console.log('allCategories:', data?.allCategories);
  console.log('services data:', data?.data);

  // Update pagination info when data changes
  useEffect(() => {
    if (data) {
      setTotalPages(data.totalPages || 1);
      setTotalServices(data.total || 0);
    }
  }, [data]);

  // Helper function to get provider name by ID
  const getProviderNameById = useCallback((providerId: number | string | null, providerName?: string) => {
    // Debug logging
    console.log('getProviderNameById called with:', { providerId, providerName });
    console.log('providersData:', providersData);
    console.log('providersError:', providersError);
    
    // If service is self-created (no provider ID), return "Self"
    if (!providerId) {
      console.log('No providerId, returning Self');
      return 'Self';
    }

    // If we have providers data, find the provider by ID
    if (providersData?.data?.providers) {
      console.log('Available providers:', providersData.data.providers);
      const provider = providersData.data.providers.find((p: any) => {
        console.log('Comparing provider:', p.id, 'with providerId:', parseInt(providerId.toString()));
        return p.id === parseInt(providerId.toString());
      });
      console.log('Found provider:', provider);
      if (provider) {
        const resolvedName = provider.label || provider.name || 'Unknown Provider';
        console.log('Resolved provider name:', resolvedName);
        return resolvedName;
      }
    }

    // If there's an error fetching providers, show error state
    if (providersError) {
      console.log('Providers fetch error, using fallback');
      return providerName || 'Provider (Error)';
    }

    // Fallback to static provider name if dynamic resolution fails
    if (providerName && providerName.trim() !== '') {
      console.log('Using fallback provider name:', providerName);
      return providerName;
    }

    console.log('Returning N/A');
    return 'N/A';
  }, [providersData?.data?.providers, providersError]);

  // Update refreshAllData to include refreshServices
  const refreshAllData = useCallback(async () => {
    try {
      // Use Promise.allSettled to ensure all requests complete even if one fails
      const results = await Promise.allSettled([
        refreshServices(),
        refreshCategories(),
        refreshProviders(),
        // Refresh stats
        fetch('/api/admin/services/stats')
          .then((res) => res.json())
          .then((data) => {
            if (data.data) {
              setStats((prev) => ({
                ...prev,
                ...data.data,
                totalCategories:
                  categoriesData?.data?.length || prev.totalCategories,
              }));
            }
          }),
      ]);

      // Log any failed requests for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Refresh operation ${index} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [refreshServices, refreshCategories, refreshProviders, categoriesData?.data?.length]);

  // Enhanced refresh function that includes services data refresh
  const refreshAllDataWithServices = useCallback(async () => {
    try {
      // Use Promise.allSettled to ensure all requests complete even if one fails
      const results = await Promise.allSettled([
        refreshServices(),
        refreshCategories(),
        refreshProviders(),
        // Refresh stats
        fetch('/api/admin/services/stats')
          .then((res) => res.json())
          .then((data) => {
            if (data.data) {
              setStats((prev) => ({
                ...prev,
                ...data.data,
                totalCategories:
                  categoriesData?.data?.length || prev.totalCategories,
              }));
            }
          }),
      ]);

      // Log any failed requests for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Refresh operation ${index} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error refreshing data with services:', error);
    }
  }, [refreshServices, refreshCategories, refreshProviders, categoriesData?.data?.length]);

  // Listen for provider updates from other pages
  useEffect(() => {
    const handleProviderUpdate = (event: CustomEvent) => {
      console.log('Provider updated, refreshing providers data:', event.detail);
      refreshProviders();
    };

    window.addEventListener('providerUpdated', handleProviderUpdate as EventListener);
    
    return () => {
      window.removeEventListener('providerUpdated', handleProviderUpdate as EventListener);
    };
  }, [refreshProviders]);

  // Memoized filter function for better performance
  const filteredServices = useMemo(() => {
    if (!data?.data) return [];

    const searchLower = searchTerm.toLowerCase();

    return data.data.filter((service: any) => {
      // Pre-compute search fields to avoid repeated toLowerCase calls
      // Use direct parameters without mapping
      const serviceName = service.name?.toLowerCase() || '';
      const categoryName = service.category?.category_name?.toLowerCase() || '';
      const dynamicProvider = getProviderNameById(service.providerId, service.provider).toLowerCase();
      const serviceId = service.id?.toString() || '';

      const matchesSearch =
        serviceName.includes(searchLower) ||
        categoryName.includes(searchLower) ||
        dynamicProvider.includes(searchLower) ||
        serviceId.includes(searchLower);

      // Provider filter
      let matchesProvider = true;
      if (providerFilter === 'All') {
        matchesProvider = true;
      } else if (providerFilter === 'Self') {
        // Show services with no provider ID (self-created services)
        matchesProvider = !service.providerId;
      } else {
        // Get dynamic provider name and compare
        const dynamicProviderName = getProviderNameById(service.providerId, service.provider);
        matchesProvider = dynamicProviderName === providerFilter;
      }

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'active') {
        // Active filter: only active services that are not trashed (for display)
        matchesStatus = service.status === 'active' && 
                       (service.deletedAt === null || service.deletedAt === undefined);
      } else if (statusFilter === 'inactive') {
        // Inactive filter: only inactive services that are not trashed (for display)
        matchesStatus = service.status === 'inactive' && 
                       (service.deletedAt === null || service.deletedAt === undefined);
      } else if (statusFilter === 'trash') {
        // Show services that are soft-deleted (have deletedAt field)
        matchesStatus = service.deletedAt !== null && service.deletedAt !== undefined;
      } else if (statusFilter === 'all') {
        // All filter shows both active and inactive services
        // Only excludes services that are explicitly marked as trash (soft-deleted) for display
        matchesStatus = (service.status === 'active' || service.status === 'inactive') && 
                       (service.deletedAt === null || service.deletedAt === undefined);
      }

      // Category filter - exclude services from disabled categories
      // If category has hideCategory === 'yes', it's disabled and should be excluded from bulk operations
      const categoryEnabled = service.category?.hideCategory !== 'yes';

      return matchesSearch && matchesProvider && matchesStatus && categoryEnabled;
    });
  }, [data?.data, searchTerm, statusFilter, providerFilter]);

  // Calculate counts excluding trash services for All/Active/Inactive filters
  const countsWithoutTrash = useMemo(() => {
    if (!allServicesData?.data) return { all: 0, active: 0, inactive: 0 };
    
    const allServices = allServicesData.data;
    console.log('=== COUNTS DEBUG ===');
    console.log('Total services:', allServices.length);
    
    // Only count services that are NOT trashed (deletedAt is null or undefined)
    const nonTrashedServices = allServices.filter((service: any) => 
      service.deletedAt === null || service.deletedAt === undefined
    );
    console.log('Non-trashed services:', nonTrashedServices.length);
    
    const trashedServices = allServices.filter((service: any) => 
      service.deletedAt !== null && service.deletedAt !== undefined
    );
    console.log('Trashed services:', trashedServices.length);
    
    const activeCount = nonTrashedServices.filter((service: any) => service.status === 'active').length;
    const inactiveCount = nonTrashedServices.filter((service: any) => service.status === 'inactive').length;
    const allCount = activeCount + inactiveCount;
    
    console.log('Active (non-trashed):', activeCount);
    console.log('Inactive (non-trashed):', inactiveCount);
    console.log('All (non-trashed):', allCount);
    
    return {
      all: allCount,
      active: activeCount,
      inactive: inactiveCount
    };
  }, [allServicesData?.data]);

  // Calculate trashServices count using all services data
  const trashServicesCount = useMemo(() => {
    if (!allServicesData?.data) return 0;
    const count = allServicesData.data.filter((service: any) => 
      service.deletedAt !== null && service.deletedAt !== undefined
    ).length;
    return count;
  }, [allServicesData?.data]);

  // Update stats when trashServicesCount changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      trashServices: trashServicesCount
    }));
  }, [trashServicesCount]);

  // Get unique providers for filter dropdown - now using API data
  const uniqueProviders = useMemo(() => {
    if (!providersData?.data?.providers) return ['All', 'Self'];
    
    // Get active providers from API, excluding reserved names
    const reservedNames = ['All', 'Self'];
    const activeProviders = providersData.data.providers
      .filter((provider: any) => provider.status === 'active')
      .map((provider: any) => provider.label || provider.value)
      .filter((providerName: string) => !reservedNames.includes(providerName))
      .sort();
    
    return ['All', 'Self', ...activeProviders];
  }, [providersData?.data?.providers]);

  // Optimized grouping with better performance for large datasets
  const groupedServices = useMemo(() => {
    console.log('=== GROUPED SERVICES DEBUG ===');
    console.log('statusFilter in groupedServices:', statusFilter);
    console.log('pageSize in groupedServices:', pageSize);
    console.log('data?.allCategories:', data?.allCategories);
    console.log('filteredServices.length:', filteredServices.length);
    console.log('data:', data);
    console.log('error:', error);
    console.log('isLoading:', isLoading);
    
    // Use Map for better performance with large datasets
    const groupedById = new Map<string, { category: any; services: any[] }>();

    // Always initialize with all categories when statusFilter is 'all', regardless of other conditions
    // This ensures empty categories are shown only when "All" filter is selected
    if (statusFilter === 'all' && data?.allCategories) {
      console.log('Initializing all categories for statusFilter=all');
      data.allCategories.forEach((category: any) => {
        const categoryKey = `${category.category_name}_${category.id}`;
        console.log('Adding category:', categoryKey, category);
        groupedById.set(categoryKey, {
          category: category,
          services: [],
        });
      });
    }

    // If no data available, return empty for error handling
    if (!data) {
      console.log('No data available - API might have failed');
      return {} as Record<string, any[]>;
    }

    // For non-'all' statusFilter, only show categories if there are services
    if (statusFilter !== 'all' && !filteredServices.length) {
      console.log('No services for non-all statusFilter, returning empty');
      return {} as Record<string, any[]>;
    }

    // Group filtered services by category
    filteredServices.forEach((service: any) => {
      const categoryId = service.category?.id;
      const categoryName = service.category?.category_name || 'Uncategorized';
      const categoryKey = categoryId
        ? `${categoryName}_${categoryId}`
        : 'Uncategorized_0';

      if (!groupedById.has(categoryKey)) {
        groupedById.set(categoryKey, {
          category: service.category || {
            id: 0,
            category_name: 'Uncategorized',
          },
          services: [],
        });
      }
      groupedById.get(categoryKey)!.services.push(service);
    });

    // Convert to array and sort for better performance
    const sortedGroups = Array.from(groupedById.values()).sort((a, b) => {
      const idDiff = (a.category.id || 999) - (b.category.id || 999);
      if (idDiff !== 0) return idDiff;
      return (a.category.position || 999) - (b.category.position || 999);
    });

    // Build final grouped object
    const grouped: Record<string, any[]> = {};

    sortedGroups.forEach(({ category, services }) => {
      const displayName = `${category.category_name} (ID: ${category.id})`;

      // Apply custom service order or default sorting
      const customOrder = serviceOrder[displayName];

      if (customOrder && customOrder.length > 0) {
        // Use Map for O(1) lookup instead of find()
        const serviceMap = new Map(services.map((s) => [s.id, s]));
        const orderedServices: any[] = [];

        customOrder.forEach((serviceId) => {
          const service = serviceMap.get(serviceId);
          if (service) orderedServices.push(service);
        });

        services.forEach((service) => {
          if (!customOrder.includes(service.id)) {
            orderedServices.push(service);
          }
        });

        grouped[displayName] = orderedServices;
      } else {
        // Optimized sorting
        grouped[displayName] = services.sort((a: any, b: any) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];

          if (sortBy === 'rate' || sortBy === 'provider_price') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
          }

          return sortOrder === 'asc'
            ? aValue > bValue
              ? 1
              : -1
            : aValue < bValue
            ? 1
            : -1;
        });
      }
    });

    // Apply custom category order if available
    if (categoryOrder.length > 0) {
      const orderedGrouped: Record<string, any[]> = {};

      categoryOrder.forEach((categoryName) => {
        if (grouped[categoryName]) {
          orderedGrouped[categoryName] = grouped[categoryName];
        }
      });

      Object.keys(grouped).forEach((categoryName) => {
        if (!categoryOrder.includes(categoryName)) {
          orderedGrouped[categoryName] = grouped[categoryName];
        }
      });

      return orderedGrouped;
    }

    return grouped;
  }, [
    filteredServices,
    data?.allCategories,
    sortBy,
    sortOrder,
    categoryOrder,
    serviceOrder,
    statusFilter,
    pageSize,
  ]);

  const getStatusIcon = (status: string, deletedAt?: string | null) => {
    if (deletedAt) {
      return <FaTrash className="h-3 w-3 text-red-500" />;
    }
    if (status === 'inactive') {
      return <FaTimesCircle className="h-3 w-3 text-red-500" />;
    }
    return <FaCheckCircle className="h-3 w-3 text-green-500" />;
  };

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleAllCategories = () => {
    const allCategoryNames = Object.keys(groupedServices);

    if (allCategoriesCollapsed) {
      // Expand all - clear collapsed categories
      setCollapsedCategories([]);
      setAllCategoriesCollapsed(false);
    } else {
      // Collapse all - add all categories to collapsed
      setCollapsedCategories(allCategoryNames);
      setAllCategoriesCollapsed(true);
    }
  };

  const handleSelectAll = () => {
    const allServices = Object.values(groupedServices).flat();
    const allCategories = Object.keys(groupedServices);
    
    if (selectedServices.length === allServices.length && selectedCategories.length === allCategories.length) {
      setSelectedServices([]);
      setSelectedCategories([]);
    } else {
      setSelectedServices(allServices.map((service: any) => service.id));
      setSelectedCategories(allCategories);
    }
  };

  const handleSelectCategory = (categoryName: string, categoryServices: any[]) => {
    const categoryIds = categoryServices.map((service) => service.id);
    const allSelected = categoryIds.every((id) =>
      selectedServices.includes(id)
    );
    const categorySelected = selectedCategories.includes(categoryName);

    if (allSelected && categorySelected) {
      // Deselect category and its services
      setSelectedServices((prev) =>
        prev.filter((id) => !categoryIds.includes(id))
      );
      setSelectedCategories((prev) =>
        prev.filter((cat) => cat !== categoryName)
      );
    } else {
      // Select category and its services
      setSelectedServices((prev) => [...new Set([...prev, ...categoryIds])]);
      setSelectedCategories((prev) => [...new Set([...prev, categoryName])]);
    }
  };

  const handleCategoryCheckboxChange = (categoryName: string) => {
    const categoryServices = groupedServices[categoryName] || [];
    handleSelectCategory(categoryName, categoryServices);
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const newSelectedServices = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      
      // Update category selection based on service selection
      updateCategorySelectionBasedOnServices(newSelectedServices);
      
      return newSelectedServices;
    });
  };

  // Helper function to update category selection based on service selection
  const updateCategorySelectionBasedOnServices = (currentSelectedServices: string[]) => {
    setSelectedCategories((prevSelectedCategories) => {
      const newSelectedCategories = [...prevSelectedCategories];
      
      // Check each category to see if it should be selected or deselected
      Object.keys(groupedServices).forEach((categoryName) => {
        const categoryServices = groupedServices[categoryName] || [];
        const categoryServiceIds = categoryServices.map((service: any) => service.id);
        
        // Check if all services in this category are selected
        const allServicesSelected = categoryServiceIds.length > 0 && 
          categoryServiceIds.every((id: string) => currentSelectedServices.includes(id));
        
        // Check if any services in this category are selected
        const anyServiceSelected = categoryServiceIds.some((id: string) => 
          currentSelectedServices.includes(id));
        
        const categoryCurrentlySelected = newSelectedCategories.includes(categoryName);
        
        if (allServicesSelected && !categoryCurrentlySelected) {
          // All services selected, add category to selection
          newSelectedCategories.push(categoryName);
        } else if (!allServicesSelected && categoryCurrentlySelected) {
          // Not all services selected, remove category from selection
          const index = newSelectedCategories.indexOf(categoryName);
          if (index > -1) {
            newSelectedCategories.splice(index, 1);
          }
        }
      });
      
      return newSelectedCategories;
    });
  };

  const handleEditService = (serviceId: number) => {
    setEditServiceModal({
      open: true,
      serviceId: serviceId,
      closing: false,
    });
  };

  const handleCreateService = () => {
    setCreateServiceModal(true);
    setCreateServiceModalClosing(false);
  };

  const handleCreateCategory = () => {
    setCreateCategoryModal(true);
    setCreateCategoryModalClosing(false);
  };

  const handleCloseEditModal = () => {
    setEditServiceModal((prev) => ({ ...prev, closing: true }));
    setTimeout(() => {
      setEditServiceModal({ open: false, serviceId: 0, closing: false });
    }, 300); // Match animation duration
  };

  const handleCloseCreateModal = () => {
    setCreateServiceModalClosing(true);
    setTimeout(() => {
      setCreateServiceModal(false);
      setCreateServiceModalClosing(false);
    }, 300); // Match animation duration
  };

  const handleCloseCategoryModal = () => {
    setCreateCategoryModalClosing(true);
    setTimeout(() => {
      setCreateCategoryModal(false);
      setCreateCategoryModalClosing(false);
    }, 300); // Match animation duration
  };

  const handleCloseEditCategoryModal = () => {
    setEditCategoryModal((prev) => ({ ...prev, closing: true }));
    setTimeout(() => {
      setEditCategoryModal({
        open: false,
        categoryId: '',
        categoryName: '',
        closing: false,
      });
    }, 300); // Match animation duration
  };

  const handleOpenDeleteConfirmation = () => {
    if (selectedServices.length === 0) {
      showToast('No services selected', 'error');
      return;
    }
    setDeleteConfirmationModal(true);
    setDeleteConfirmationModalClosing(false);
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmationModalClosing(true);
    setTimeout(() => {
      setDeleteConfirmationModal(false);
      setDeleteConfirmationModalClosing(false);
    }, 300); // Match animation duration
  };

  const handleOpenDeleteServicesAndCategoriesConfirmation = () => {
    if (selectedServices.length === 0 && selectedCategories.length === 0) {
      showToast('No services or categories selected', 'error');
      return;
    }
    setDeleteServicesAndCategoriesModal(true);
    setDeleteServicesAndCategoriesModalClosing(false);
  };

  const handleCloseDeleteServicesAndCategoriesConfirmation = () => {
    setDeleteServicesAndCategoriesModalClosing(true);
    setTimeout(() => {
      setDeleteServicesAndCategoriesModal(false);
      setDeleteServicesAndCategoriesModalClosing(false);
    }, 300); // Match animation duration
  };

  // Category drag and drop handlers
  const handleDragStart = (e: React.DragEvent, categoryName: string) => {
    console.log('Category drag start:', categoryName);
    setDraggedCategory(categoryName);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', categoryName);
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, targetCategoryName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!draggedCategory || draggedCategory === targetCategoryName) {
      return;
    }

    // Calculate drop position based on mouse position within the element
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';

    setDropTargetCategory(targetCategoryName);
    setDropPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropTargetCategory(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCategoryName: string) => {
    e.preventDefault();
    console.log('Category dropped:', draggedCategory, 'on', targetCategoryName);

    if (
      !draggedCategory ||
      draggedCategory === targetCategoryName ||
      !dropPosition
    ) {
      setDraggedCategory(null);
      setDropTargetCategory(null);
      setDropPosition(null);
      return;
    }

    const currentCategories = Object.keys(groupedServices);
    const newOrder = [...currentCategories];

    const draggedIndex = newOrder.indexOf(draggedCategory);
    const targetIndex = newOrder.indexOf(targetCategoryName);

    // Remove dragged category from its current position
    newOrder.splice(draggedIndex, 1);

    // Calculate final position based on drop position
    let finalIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      finalIndex = targetIndex - 1; // Adjust for removal
    }

    if (dropPosition === 'after') {
      finalIndex += 1;
    }

    // Insert dragged category at final position
    newOrder.splice(finalIndex, 0, draggedCategory);

    setCategoryOrder(newOrder);
    setDraggedCategory(null);
    setDropTargetCategory(null);
    setDropPosition(null);

    showToast(`Moved "${draggedCategory}" category`, 'success');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('Category drag end');
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging');
    setDraggedCategory(null);
    setDropTargetCategory(null);
    setDropPosition(null);
  };

  // Service drag and drop handlers
  const handleServiceDragStart = (e: React.DragEvent, serviceId: string) => {
    console.log('Service drag start:', serviceId);
    setDraggedService(serviceId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', serviceId);
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
  };

  const handleServiceDragOver = (
    e: React.DragEvent,
    targetServiceId: string
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!draggedService || draggedService === targetServiceId) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';

    setDropTargetService(targetServiceId);
    setDropPositionService(position);
  };

  const handleServiceDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropTargetService(null);
      setDropPositionService(null);
    }
  };

  const handleServiceDrop = (
    e: React.DragEvent,
    targetServiceId: string,
    categoryName: string
  ) => {
    e.preventDefault();
    console.log('Service dropped:', draggedService, 'on', targetServiceId);

    if (
      !draggedService ||
      draggedService === targetServiceId ||
      !dropPositionService
    ) {
      setDraggedService(null);
      setDropTargetService(null);
      setDropPositionService(null);
      return;
    }

    const categoryServices = groupedServices[categoryName] || [];
    const currentServiceIds = categoryServices.map((s: any) => s.id);
    const currentOrder = serviceOrder[categoryName] || currentServiceIds;
    const newOrder = [...currentOrder];

    const draggedIndex = newOrder.indexOf(draggedService);
    const targetIndex = newOrder.indexOf(targetServiceId);

    newOrder.splice(draggedIndex, 1);

    let finalIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      finalIndex = targetIndex - 1;
    }

    if (dropPositionService === 'after') {
      finalIndex += 1;
    }

    newOrder.splice(finalIndex, 0, draggedService);

    setServiceOrder((prev) => ({
      ...prev,
      [categoryName]: newOrder,
    }));

    setDraggedService(null);
    setDropTargetService(null);
    setDropPositionService(null);

    const draggedServiceObj = categoryServices.find(
      (s: any) => s.id === draggedService
    );
    showToast(
      `Moved "${draggedServiceObj?.name || 'Service'}" in ${categoryName}`,
      'success'
    );
  };

  const handleServiceDragEnd = (e: React.DragEvent) => {
    console.log('Service drag end');
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging');
    setDraggedService(null);
    setDropTargetService(null);
    setDropPositionService(null);
  };

  // API functions
  const toggleServiceStatus = async (service: any) => {
    try {
      // Find the category this service belongs to
      const serviceCategory = Object.entries(groupedServices).find(([categoryName, services]) => 
        (services as any[]).some(s => s.id === service.id)
      );
      
      if (serviceCategory) {
        const [categoryName] = serviceCategory;
        const isCategoryInactive = !activeCategoryToggles[categoryName];
        
        // Prevent activating service if category is inactive
        if (service.status === 'inactive' && isCategoryInactive) {
          showToast('Cannot activate service while category is inactive. Please activate the category first.', 'error');
          return;
        }
      }

      setIsUpdating(true);
      const response = await axiosInstance.post(
        '/api/admin/services/toggle-status',
        {
          id: service.id,
          status: service.status,
        }
      );

      if (response.data.success) {
        showToast(response.data.message, 'success');
        await refreshAllData();
      } else {
        showToast('Failed to update service status', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const restoreService = async (service: any) => {
    try {
      setIsUpdating(true);
      const response = await axiosInstance.post(
        '/api/admin/services/restore',
        {
          id: service.id,
        }
      );

      if (response.data.success) {
        showToast(response.data.message, 'success');
        await refreshAllData();
      } else {
        showToast('Failed to restore service', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleRefill = async (service: any) => {
    try {
      const response = await axiosInstance.post(
        '/api/admin/services/toggle-refill',
        {
          id: service.id,
          refill: !service.refill,
        }
      );

      if (response.data.success) {
        showToast('Refill setting updated', 'success');
        await refreshAllData();
      } else {
        showToast('Failed to update refill setting', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    }
  };

  const toggleCancel = async (service: any) => {
    try {
      const response = await axiosInstance.post(
        '/api/admin/services/toggle-cancel',
        {
          id: service.id,
          cancel: !service.cancel,
        }
      );

      if (response.data.success) {
        showToast('Cancel setting updated', 'success');
        await refreshAllData();
      } else {
        showToast('Failed to update cancel setting', 'error');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Something went wrong'}`, 'error');
    }
  };

  // Helper function to extract actual category name from display name (remove ID part)
  const getActualCategoryName = (displayCategoryName: string) => {
    return displayCategoryName.includes(' (ID: ')
      ? displayCategoryName.split(' (ID: ')[0]
      : displayCategoryName;
  };

  const toggleCategoryAndServices = async (
    categoryName: string,
    services: any[]
  ) => {
    try {
      setIsUpdating(true);
      const newToggleState = !activeCategoryToggles[categoryName];

      // Extract category ID from the display name (e.g., "asdsdf (ID: 25)" -> "25")
      const categoryIdMatch = categoryName.match(/\(ID:\s*(\d+)\)/);
      if (!categoryIdMatch) {
        showToast('Invalid category format', 'error');
        return;
      }

      const categoryId = parseInt(categoryIdMatch[1]);
      const categoryData = categoriesData?.data?.find(
        (cat: any) => cat.id === categoryId
      );
      if (!categoryData) {
        showToast('Category not found', 'error');
        return;
      }

      showToast(
        `${newToggleState ? 'Activating' : 'Deactivating'} ${
          services.length
        } services in ${categoryName}...`,
        'pending'
      );

      setActiveCategoryToggles((prev) => ({
        ...prev,
        [categoryName]: newToggleState,
      }));

      // Main feature: Toggle all services in category
      // When deactivating category, force all services to inactive
      // When activating category, toggle services to their opposite state
      const promises = services.map((service) => {
        let targetStatus = service.status;
        
        if (!newToggleState) {
          // Category being deactivated - force all services to inactive
          targetStatus = 'active'; // This will be toggled to inactive by the API
        } else {
          // Category being activated - toggle services normally
          targetStatus = service.status;
        }
        
        return axiosInstance.post('/api/admin/services/toggle-status', {
          id: service.id,
          status: targetStatus,
        });
      });

      await Promise.all(promises);

      // Extra feature: Update category hideCategory field based on toggle state
      const hideCategory = newToggleState ? 'no' : 'yes';
      await axiosInstance.put(`/api/admin/categories/${categoryData.id}`, {
        category_name: categoryData.category_name,
        position: categoryData.position,
        hideCategory: hideCategory,
      });

      showToast(
        `Successfully ${
          newToggleState ? 'activated' : 'deactivated'
        } ${categoryName} category`,
        'success'
      );
      await refreshAllData();
    } catch (error: any) {
      setActiveCategoryToggles((prev) => ({
        ...prev,
        [categoryName]: !activeCategoryToggles[categoryName],
      }));
      showToast(
        `Error updating ${categoryName}: ${
          error.message || 'Something went wrong'
        }`,
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteService = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this service?'
    );
    if (!confirmDelete) return;

    try {
      console.log('Deleting service with ID:', id);

      // Optimistic update: Remove service from UI immediately
      const currentData = data?.data || [];
      const updatedServices = currentData.filter(
        (service: any) => service.id.toString() !== id.toString()
      );

      // Update the cache optimistically
      refreshServices(
        { ...data, data: updatedServices },
        { revalidate: false }
      );

      const response = await axiosInstance.delete(
        `/api/admin/services/delete-services?id=${id}`
      );
      console.log('Delete response:', response.data);

      if (response.data.success) {
        showToast(
          response.data.message || 'Service deleted successfully',
          'success'
        );
        // Revalidate to ensure data consistency
        await refreshAllData();
      } else {
        // Revert optimistic update on failure
        await refreshAllData();
        showToast(response.data.error || 'Failed to delete service', 'error');
      }
    } catch (error: any) {
      console.error('Delete service error:', error);
      // Revert optimistic update on error
      await refreshAllData();
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to delete service';
      showToast(errorMessage, 'error');
    }
  };

  const deleteSelectedServices = async () => {
    if (selectedServices.length === 0) return;

    try {
      setIsUpdating(true);
      showToast(
        `Deleting ${selectedServices.length} service${
          selectedServices.length !== 1 ? 's' : ''
        }...`,
        'pending'
      );

      console.log('Deleting services:', selectedServices);

      // Optimistic update: Remove selected services from UI immediately
      const currentData = data?.data || [];
      const updatedServices = currentData.filter(
        (service: any) => !selectedServices.includes(service.id.toString())
      );

      // Update the cache optimistically
      refreshServices(
        { ...data, data: updatedServices },
        { revalidate: false }
      );

      // Clear selection immediately for better UX
      setSelectedServices([]);

      // Delete services in parallel
      const deletePromises = selectedServices.map((serviceId) =>
        axiosInstance.delete(
          `/api/admin/services/delete-services?id=${serviceId}`
        )
      );

      const results = await Promise.all(deletePromises);
      console.log('Delete results:', results);

      // Check if all deletions were successful
      const failedDeletions = results.filter((result) => !result.data.success);

      if (failedDeletions.length > 0) {
        showToast(
          `Failed to delete ${failedDeletions.length} service${
            failedDeletions.length !== 1 ? 's' : ''
          }`,
          'error'
        );
        // Revalidate to ensure data consistency
        await refreshAllData();
      } else {
        showToast(
          `Successfully deleted ${selectedServices.length} service${
            selectedServices.length !== 1 ? 's' : ''
          }`,
          'success'
        );
        // Revalidate to ensure data consistency
        await refreshAllData();
      }

      handleCloseDeleteConfirmation();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      // Revert optimistic update on error
      await refreshAllData();
      const errorMessage =
        error.response?.data?.error || error.message || 'Something went wrong';
      showToast(`Error deleting services: ${errorMessage}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteSelectedServicesAndCategories = async () => {
    if (selectedServices.length === 0 && selectedCategories.length === 0) return;

    try {
      setIsUpdating(true);
      const serviceCount = selectedServices.length;
      const categoryCount = selectedCategories.length;
      
      showToast(
        `Deleting ${serviceCount} service${serviceCount !== 1 ? 's' : ''} and ${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'}...`,
        'pending'
      );

      console.log('Deleting services:', selectedServices);
      console.log('Deleting categories:', selectedCategories);
      console.log('Selected categories raw data:', selectedCategories);

      // Extract category IDs from category names
      const categoryIds = selectedCategories.map((categoryName) => {
        console.log('Processing category name:', categoryName, 'Type:', typeof categoryName);
        
        // Check if the category name has the format "CategoryName (ID: 123)"
        const idMatch = categoryName.match(/\(ID:\s*(\d+)\)/);
        if (idMatch) {
          const categoryId = idMatch[1];
          console.log('Extracted category ID from (ID: X) format:', categoryId, 'from:', categoryName);
          return categoryId;
        }
        
        // Check if the category name has the format "CategoryName_ID"
        const lastUnderscoreIndex = categoryName.lastIndexOf('_');
        if (lastUnderscoreIndex === -1) {
          console.error('Invalid category name format (no underscore or ID format):', categoryName);
          return null;
        }
        
        const categoryId = categoryName.substring(lastUnderscoreIndex + 1);
        console.log('Extracting category ID from underscore format:', categoryName, '-> ID:', categoryId, 'Length:', categoryId.length);
        
        // Trim any whitespace and validate that the extracted ID is a number
        const trimmedCategoryId = categoryId.trim();
        console.log('Trimmed category ID:', trimmedCategoryId);
        
        if (!/^\d+$/.test(trimmedCategoryId)) {
          console.error('Extracted category ID is not a valid number:', trimmedCategoryId, 'from:', categoryName);
          console.error('Character codes:', Array.from(trimmedCategoryId).map(c => c.charCodeAt(0)));
          return null;
        }
        
        return trimmedCategoryId;
      }).filter(id => id !== null); // Remove any null values

      console.log('Category IDs to delete:', categoryIds);

      // Check if we have valid category IDs to delete
      if (selectedCategories.length > 0 && categoryIds.length === 0) {
        showToast('Error: No valid category IDs found for deletion', 'error');
        return;
      }

      // Delete services and categories in parallel
      const deletePromises = [
        ...selectedServices.map((serviceId) =>
          axiosInstance.delete(`/api/admin/services/delete-services?id=${serviceId}`)
        ),
        ...categoryIds.map((categoryId) =>
          axiosInstance.delete(`/api/admin/categories/delete-categories?id=${categoryId}`)
        )
      ];

      const results = await Promise.all(deletePromises);
      console.log('Delete results:', results);

      // Check if all deletions were successful
      const failedDeletions = results.filter((result) => !result.data.success);

      if (failedDeletions.length > 0) {
        showToast(
          `Failed to delete ${failedDeletions.length} item${failedDeletions.length !== 1 ? 's' : ''}`,
          'error'
        );
      } else {
        showToast(
          `Successfully deleted ${serviceCount} service${serviceCount !== 1 ? 's' : ''} and ${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'}`,
          'success'
        );
      }

      // Clear selections and refresh data
      setSelectedServices([]);
      setSelectedCategories([]);
      await refreshAllData();

      handleCloseDeleteServicesAndCategoriesConfirmation();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      await refreshAllData();
      const errorMessage =
        error.response?.data?.error || error.message || 'Something went wrong';
      showToast(`Error deleting services and categories: ${errorMessage}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // NEW: Modified Batch Operations Handler - only sets the operation, doesn't execute
  const handleBatchOperationSelect = (operation: BulkOperation) => {
    if (selectedServices.length === 0) {
      showToast('No services selected', 'error');
      return;
    }

    setSelectedBulkOperation(operation);
  };

  // NEW: Execute the selected batch operation
  const executeBatchOperation = async () => {
    if (selectedServices.length === 0) {
      showToast('No services selected', 'error');
      return;
    }

    if (!selectedBulkOperation) {
      showToast('No operation selected', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      const count = selectedServices.length;
      const serviceText = count !== 1 ? 'services' : 'service';

      switch (selectedBulkOperation) {
        case 'enable':
          showToast(`Enabling ${count} ${serviceText}...`, 'pending');
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-status', {
                id: serviceId,
                status: 'inactive',
              })
            )
          );
          showToast(`Successfully enabled ${count} ${serviceText}`, 'success');
          break;

        case 'disable':
          showToast(`Disabling ${count} ${serviceText}...`, 'pending');
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-status', {
                id: serviceId,
                status: 'active',
              })
            )
          );
          showToast(`Successfully disabled ${count} ${serviceText}`, 'success');
          break;

        case 'make-secret':
          showToast(`Making ${count} ${serviceText} secret...`, 'pending');
          // TODO: Implement secret functionality
          showToast(
            `Successfully made ${count} ${serviceText} secret`,
            'success'
          );
          break;

        case 'remove-secret':
          showToast(
            `Removing secret from ${count} ${serviceText}...`,
            'pending'
          );
          // TODO: Implement remove secret functionality
          showToast(
            `Successfully removed secret from ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'delete-pricing':
          showToast(
            `Deleting custom pricing for ${count} ${serviceText}...`,
            'pending'
          );
          // TODO: Implement delete custom pricing functionality
          showToast(
            `Successfully deleted custom pricing for ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'delete':
          handleOpenDeleteConfirmation();
          return; // Exit early, don't clear selection or refresh data yet

        case 'delete-services-categories':
          handleOpenDeleteServicesAndCategoriesConfirmation();
          return; // Exit early, don't clear selection or refresh data yet

        case 'refill-enable':
          showToast(
            `Enabling refill for ${count} ${serviceText}...`,
            'pending'
          );
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-refill', {
                id: serviceId,
                refill: true,
              })
            )
          );
          showToast(
            `Successfully enabled refill for ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'refill-disable':
          showToast(
            `Disabling refill for ${count} ${serviceText}...`,
            'pending'
          );
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-refill', {
                id: serviceId,
                refill: false,
              })
            )
          );
          showToast(
            `Successfully disabled refill for ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'cancel-enable':
          showToast(
            `Enabling cancel for ${count} ${serviceText}...`,
            'pending'
          );
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-cancel', {
                id: serviceId,
                cancel: true,
              })
            )
          );
          showToast(
            `Successfully enabled cancel for ${count} ${serviceText}`,
            'success'
          );
          break;

        case 'cancel-disable':
          showToast(
            `Disabling cancel for ${count} ${serviceText}...`,
            'pending'
          );
          await Promise.all(
            selectedServices.map((serviceId) =>
              axiosInstance.post('/api/admin/services/toggle-cancel', {
                id: serviceId,
                cancel: false,
              })
            )
          );
          showToast(
            `Successfully disabled cancel for ${count} ${serviceText}`,
            'success'
          );
          break;

        default:
          showToast('Unknown operation', 'error');
          return;
      }

      // Clear selection and refresh data for all operations except delete
      if (selectedBulkOperation && !['delete', ''].includes(selectedBulkOperation)) {
        setSelectedServices([]);
        setSelectedBulkOperation(''); // Clear the selected operation
        await refreshAllData();
      }
    } catch (error: any) {
      showToast(
        `Error performing batch operation: ${
          error.message || 'Something went wrong'
        }`,
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDeleteCategoryModal = (
    categoryName: string,
    categoryId: string,
    servicesCount: number
  ) => {
    setDeleteCategoryModal({
      open: true,
      categoryName,
      categoryId,
      servicesCount,
      closing: false,
    });
  };

  const handleCloseDeleteCategoryModal = () => {
    setDeleteCategoryModal((prev) => ({ ...prev, closing: true }));
    setTimeout(() => {
      setDeleteCategoryModal({
        open: false,
        categoryName: '',
        categoryId: '',
        servicesCount: 0,
        closing: false,
      });
    }, 300); // Match animation duration
  };

  const editCategory = (categoryName: string, categoryId: string) => {
    setEditCategoryModal({
      open: true,
      categoryId: categoryId,
      categoryName: categoryName,
      closing: false,
    });
  };

  const deleteCategory = async (
    action: 'delete' | 'move',
    targetCategoryId?: string
  ) => {
    const { categoryName, categoryId, servicesCount } = deleteCategoryModal;

    try {
      setIsUpdating(true);
      console.log('Deleting category:', {
        action,
        categoryId,
        categoryName,
        servicesCount,
        targetCategoryId,
      });

      if (action === 'move' && targetCategoryId) {
        // First move all services to the target category
        showToast(
          `Moving ${servicesCount} service${
            servicesCount !== 1 ? 's' : ''
          } to new category...`,
          'pending'
        );

        const moveResponse = await axiosInstance.put(
          `/api/admin/services/move-category`,
          {
            fromCategoryId: categoryId,
            toCategoryId: targetCategoryId,
          }
        );

        console.log('Move response:', moveResponse.data);

        if (!moveResponse.data.success) {
          showToast(
            moveResponse.data.error || 'Failed to move services',
            'error'
          );
          return;
        }
      }

      // Then delete the category
      showToast(`Deleting "${categoryName}" category...`, 'pending');

      const response = await axiosInstance.delete(
        `/api/admin/categories/${categoryId}`
      );
      console.log('Delete category response:', response.data);

      if (response.data.success) {
        // Optimistic update: Remove category and its services from UI immediately
        const currentCategories = categoriesData?.data || [];
        const currentServices = data?.data || [];

        // Remove category from categories list
        const updatedCategories = currentCategories.filter(
          (cat: any) => cat.id.toString() !== categoryId.toString()
        );

        // Remove services from this category if action is 'delete'
        let updatedServices = currentServices;
        if (action === 'delete') {
          updatedServices = currentServices.filter(
            (service: any) =>
              service.categoryId.toString() !== categoryId.toString()
          );
        }

        // Update both caches optimistically
        refreshCategories(
          { ...categoriesData, data: updatedCategories },
          { revalidate: false }
        );

        if (action === 'delete') {
          refreshServices(
            { ...data, data: updatedServices },
            { revalidate: false }
          );
        }

        // Show success message
        if (action === 'move') {
          showToast(
            `Successfully moved ${servicesCount} service${
              servicesCount !== 1 ? 's' : ''
            } and deleted "${categoryName}" category`,
            'success'
          );
        } else {
          showToast(
            response.data.message ||
              `Successfully deleted "${categoryName}" category and all services`,
            'success'
          );
        }

        // Close modal immediately
        handleCloseDeleteCategoryModal();

        // Revalidate to ensure data consistency
        await refreshAllData();
      } else {
        showToast(response.data.error || 'Failed to delete category', 'error');
      }
    } catch (error: any) {
      console.error('Delete category error:', error);
      // Revert optimistic updates on error
      await refreshAllData();
      const errorMessage =
        error.response?.data?.error || error.message || 'Something went wrong';
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = () => {
    setStatsLoading(true);
    setServicesLoading(true);
    showToast('Services refreshed successfully!', 'success');
    setTimeout(() => {
      setStatsLoading(false);
      setServicesLoading(false);
    }, 1500);
  };

  // Effects - all defined after groupedServices and functions
  useEffect(() => {
    const fetchServiceStats = async () => {
      try {
        const response = await fetch('/api/admin/services/stats');
        if (response.ok) {
          const data = await response.json();
          const baseStats = data.data || {
            totalServices: 0,
            activeServices: 0,
            inactiveServices: 0,
          };

          // Calculate total categories from categoriesData
          const totalCategories = categoriesData?.data?.length || 0;

          setStats({
            ...baseStats,
            totalCategories,
          });
        }
      } catch (error) {
        console.error('Failed to fetch service stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchServiceStats();
    const timer = setTimeout(() => setStatsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [categoriesData?.data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setServicesLoading(true);
      setTimeout(() => setServicesLoading(false), 1000);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setServicesLoading(true);
    setTimeout(() => setServicesLoading(false), 800);
  }, [statusFilter]);

  useEffect(() => {
    if (data?.data && Object.keys(groupedServices).length > 0) {
      const initialToggles: { [key: string]: boolean } = {};
      const allCategoryNames = Object.keys(groupedServices);

      Object.keys(groupedServices).forEach((categoryName) => {
        // Extract category ID from the display name (e.g., "asdsdf (ID: 25)" -> "25")
        const categoryIdMatch = categoryName.match(/\(ID:\s*(\d+)\)/);
        if (categoryIdMatch) {
          const categoryId = parseInt(categoryIdMatch[1]);
          const categoryData = categoriesData?.data?.find(
            (cat: any) => cat.id === categoryId
          );
          // If hideCategory is "no" then category is active (toggle ON), if "yes" then inactive (toggle OFF)
          initialToggles[categoryName] = categoryData?.hideCategory === 'no';
        } else {
          // Fallback for categories without ID format
          const actualCategoryName = getActualCategoryName(categoryName);
          const categoryData = categoriesData?.data?.find(
            (cat: any) => cat.category_name === actualCategoryName
          );
          initialToggles[categoryName] = categoryData?.hideCategory === 'no';
        }
      });
      setActiveCategoryToggles(initialToggles);

      // Initialize category order if not set
      if (categoryOrder.length === 0) {
        setCategoryOrder(Object.keys(groupedServices));
      }

      // Update allCategoriesCollapsed state based on current collapsed categories
      const allCollapsed =
        allCategoryNames.length > 0 &&
        allCategoryNames.every((cat) => collapsedCategories.includes(cat));
      setAllCategoriesCollapsed(allCollapsed);
    }
  }, [
    data?.data,
    groupedServices,
    categoryOrder.length,
    collapsedCategories,
    categoriesData?.data,
  ]);

  // Handle keyboard events for modal close and body scroll lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editServiceModal.open) {
          handleCloseEditModal();
        } else if (createServiceModal) {
          handleCloseCreateModal();
        } else if (createCategoryModal) {
          handleCloseCategoryModal();
        } else if (editCategoryModal.open) {
          handleCloseEditCategoryModal();
        } else if (deleteConfirmationModal) {
          handleCloseDeleteConfirmation();
        } else if (deleteCategoryModal.open) {
          handleCloseDeleteCategoryModal();
        }
      }
    };

    // Lock body scroll when any modal is open
    if (
      editServiceModal.open ||
      createServiceModal ||
      createCategoryModal ||
      editCategoryModal.open ||
      deleteConfirmationModal ||
      deleteCategoryModal.open
    ) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [
    editServiceModal.open,
    createServiceModal,
    createCategoryModal,
    editCategoryModal.open,
    deleteConfirmationModal,
    deleteCategoryModal.open,
  ]);

  const serviceStats = [
    {
      title: 'Total Services',
      value: countsWithoutTrash.all,
      icon: <FaBriefcase className="h-6 w-6" />,
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: <FaTags className="h-6 w-6" />,
      textColor: 'text-purple-600',
    },
    {
      title: 'Active Services',
      value: countsWithoutTrash.active,
      icon: <FaCheckCircle className="h-6 w-6" />,
      textColor: 'text-green-600',
    },
    {
      title: 'Inactive Services',
      value: countsWithoutTrash.inactive,
      icon: <FaShieldAlt className="h-6 w-6" />,
      textColor: 'text-red-600',
    },
  ];

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {serviceStats.map((stat, index) => (
            <div
              key={stat.title}
              className="card card-padding animate-in fade-in duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="card-content">
                <div className="card-icon">{stat.icon}</div>
                <div>
                  <h3 className="card-title">{stat.title}</h3>
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <GradientSpinner size="w-6 h-6" />
                      <span className="text-lg text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <p className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value.toString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Section - After stats cards */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Left: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
              {/* Page View Dropdown */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>

              {/* Provider Filter Dropdown - Moved after page view dropdown */}
              <select 
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm"
              >
                {uniqueProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>

              <button
                onClick={handleRefresh}
                disabled={servicesLoading || statsLoading}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaSync
                  className={
                    servicesLoading || statsLoading ? 'animate-spin' : ''
                  }
                />
                Refresh
              </button>

              <button
                onClick={handleCreateService}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaPlus />
                Create Service
              </button>

              <button
                onClick={handleCreateCategory}
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5"
              >
                <FaPlus />
                Create Category
              </button>

              <Link
                href="/admin/services/import"
                className="btn btn-primary flex items-center gap-2 px-3 py-2.5 w-full md:w-auto"
                title="Import Services"
              >
                <FaFileImport />
                Import Services
              </Link>
            </div>

            {/* Right: Search Controls Only */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={`Search ${
                    statusFilter === 'all' ? 'all' : statusFilter
                  } services...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services Table with new card style */}
        <div className="card animate-in fade-in duration-500">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            {/* Filter Buttons - Inside table header */}
            <div className="mb-4">
              <div className="block space-y-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'all'
                      ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'all'
                        ? 'bg-white/20'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {countsWithoutTrash.all.toString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'active'
                      ? 'bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Active
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'active'
                        ? 'bg-white/20'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {countsWithoutTrash.active.toString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'inactive'
                      ? 'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Inactive
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'inactive'
                        ? 'bg-white/20'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {countsWithoutTrash.inactive.toString()}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('trash')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 mr-2 mb-2 ${
                    statusFilter === 'trash'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Trash
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      statusFilter === 'trash'
                        ? 'bg-white/20'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {trashServicesCount.toString()}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {servicesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center flex flex-col items-center">
                  <GradientSpinner size="w-12 h-12" className="mb-3" />
                  <div className="text-base font-medium">
                    Loading services...
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center py-20">
                  <div className="text-center flex flex-col items-center">
                    <GradientSpinner size="w-12 h-12" className="mb-3" />
                    <div className="text-base font-medium">
                      Loading services...
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <FaExclamationTriangle
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Error Loading Services
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {error}
                </p>
              </div>
            ) : !data || (statusFilter !== 'all' && Object.keys(groupedServices).length === 0) || (statusFilter !== 'all' && Object.values(groupedServices).every(services => services.length === 0)) || (statusFilter === 'all' && Object.keys(groupedServices).length === 0) ? (
              <div className="p-12 text-center">
                <FaGlobe
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No services found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {searchTerm && providerFilter !== 'all'
                    ? `No ${providerFilter} services match your search "${searchTerm}".`
                    : searchTerm
                    ? `No services match your search "${searchTerm}".`
                    : providerFilter !== 'all'
                    ? `No ${providerFilter} services found.`
                    : 'No services exist yet.'}
                </p>
              </div>
            ) : (
              <>
                {selectedServices.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {selectedServices.length} selected
                    </span>

                    {/* Modified Batch Operations Dropdown */}
                    <select
                      value={selectedBulkOperation}
                      onChange={(e) => {
                        handleBatchOperationSelect(e.target.value as BulkOperation);
                      }}
                      disabled={isUpdating}
                      className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer text-sm disabled:opacity-50"
                    >
                      <option value="">Batch Operations</option>
                      <option value="enable">Enable Selected Services</option>
                      <option value="disable">Disable Selected Services</option>
                      <option value="make-secret">
                        Make Selected Services Secret
                      </option>
                      <option value="remove-secret">
                        Remove Selected from Service Secret
                      </option>
                      <option value="delete-pricing">
                        Delete Selected Services Custom Pricing
                      </option>
                      <option value="refill-enable">
                        Refill Enable Selected Services
                      </option>
                      <option value="refill-disable">
                        Refill Disable Selected Services
                      </option>
                      <option value="cancel-enable">
                        Cancel Enable Selected Services
                      </option>
                      <option value="cancel-disable">
                        Cancel Disable Selected Services
                      </option>
                      <option value="delete">Delete Selected Services</option>
                      <option value="delete-services-categories">Delete Selected Services & Categories</option>
                    </select>

                    {/* NEW: Save Changes Button */}
                    {selectedBulkOperation && (
                      <button
                        onClick={executeBatchOperation}
                        disabled={isUpdating}
                        className="btn btn-primary flex items-center gap-2 px-4 py-2.5 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <>
                            Saving...
                          </>
                        ) : (
                          <>Save Changes</>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Servicees Table View */}
                <div className="lg:block">
                  <table className="w-full text-sm min-w-[1200px]">
                    <thead className="sticky top-0 bg-white border-b z-10">
                      <tr>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={
                              Object.values(groupedServices).flat().length > 0 &&
                              selectedServices.length === Object.values(groupedServices).flat().length &&
                              selectedCategories.length === Object.keys(groupedServices).length
                            }
                            className="rounded border-gray-300 w-4 h-4"
                          />
                        </th>
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
                          Service
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Type
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Provider
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Price
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Min/Max
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Refill
                        </th>
                        <th
                          className="text-left p-3 font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Cancel
                        </th>
                        {/* Only show Status column when not in Trash filter */}
                        {statusFilter !== 'trash' && (
                          <th
                            className="text-left p-3 font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            Status
                          </th>
                        )}
                        <th
                          className="text-left p-3 font-semibold relative"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Actions
                          {/* Collapse/Expand All Toggle */}
                          <button
                            onClick={toggleAllCategories}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                            title={
                              allCategoriesCollapsed
                                ? 'Expand all categories'
                                : 'Collapse all categories'
                            }
                          >
                            {allCategoriesCollapsed ? (
                              <FaChevronDown className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                            ) : (
                              <FaChevronUp className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                            )}
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Object.entries(groupedServices) as [string, any[]][])
                        .filter(([categoryName, services]) => {
                          // If inactive filter is active, only show categories that:
                          // 1. Are inactive themselves, OR
                          // 2. Have at least one inactive service
                          if (statusFilter === 'inactive') {
                            const actualCategoryName = getActualCategoryName(categoryName);
                            const categoryData = categoriesData?.data?.find(
                              (cat: any) => cat.category_name === actualCategoryName
                            );
                            
                            // Check if category is inactive
                            const isCategoryInactive = !activeCategoryToggles[categoryName];
                            
                            // Check if category has any inactive services
                            const hasInactiveServices = services.some((service: any) => service.status === 'inactive');
                            
                            return isCategoryInactive || hasInactiveServices;
                          }
                          
                          // For other filters, show all categories
                          return true;
                        })
                        .sort(([categoryNameA], [categoryNameB]) => {
                          // Extract actual category names and find category data
                          const actualCategoryNameA =
                            getActualCategoryName(categoryNameA);
                          const actualCategoryNameB =
                            getActualCategoryName(categoryNameB);

                          // Sort categories by position: top categories first, then bottom
                          const categoryA = categoriesData?.data?.find(
                            (cat: any) =>
                              cat.category_name === actualCategoryNameA
                          );
                          const categoryB = categoriesData?.data?.find(
                            (cat: any) =>
                              cat.category_name === actualCategoryNameB
                          );

                          const positionA = categoryA?.position || 'bottom';
                          const positionB = categoryB?.position || 'bottom';

                          if (positionA === 'top' && positionB === 'bottom')
                            return -1;
                          if (positionA === 'bottom' && positionB === 'top')
                            return 1;
                          return categoryNameA.localeCompare(categoryNameB);
                        })
                        .map(([categoryName, services], categoryIndex) => (
                          <Fragment key={categoryName}>
                            {/* Drop zone before category */}
                            {draggedCategory &&
                              draggedCategory !== categoryName && (
                                <tr
                                  className={`transition-all duration-200 ${
                                    dropTargetCategory === categoryName &&
                                    dropPosition === 'before'
                                      ? 'h-8 bg-blue-100 border-2 border-dashed border-blue-400'
                                      : 'h-1'
                                  }`}
                                  onDragOver={(e) =>
                                    handleDragOver(e, categoryName)
                                  }
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, categoryName)}
                                >
                                  <td colSpan={11}>
                                    {dropTargetCategory === categoryName &&
                                      dropPosition === 'before' && (
                                        <div className="flex items-center justify-center h-6 text-blue-600 text-sm font-medium">
                                          Drop here
                                        </div>
                                      )}
                                  </td>
                                </tr>
                              )}

                            {/* Category Header Row */}
                            <tr
                              className={`bg-gray-50 border-t-2 border-gray-200 ${
                                draggedCategory === categoryName
                                  ? 'opacity-50'
                                  : ''
                              } ${
                                !activeCategoryToggles[categoryName]
                                  ? 'bg-gray-300/90 border-l-4 border-l-gray-600'
                                  : ''
                              }`}
                              onDragOver={(e) =>
                                handleDragOver(e, categoryName)
                              }
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, categoryName)}
                            >
                              <td colSpan={11} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {/* Category Checkbox */}
                                    <input
                                      type="checkbox"
                                      checked={selectedCategories.includes(categoryName)}
                                      onChange={() => handleCategoryCheckboxChange(categoryName)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      title={`Select ${categoryName} category`}
                                    />
                                    <div
                                      className="cursor-grab hover:text-gray-600 transition-colors active:cursor-grabbing select-none"
                                      title="Drag to reorder category"
                                      draggable={true}
                                      onDragStart={(e) =>
                                        handleDragStart(e, categoryName)
                                      }
                                      onDragEnd={handleDragEnd}
                                      style={{
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                      }}
                                    >
                                      <FaGripVertical className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <button
                                      onClick={() =>
                                        toggleCategory(categoryName)
                                      }
                                      className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
                                    >
                                      {collapsedCategories.includes(
                                        categoryName
                                      ) ? (
                                        <FaChevronRight className="h-3 w-3" />
                                      ) : (
                                        <FaChevronDown className="h-3 w-3" />
                                      )}
                                    </button>

                                    {/* Category Toggle Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCategoryAndServices(
                                          categoryName,
                                          services
                                        );
                                      }}
                                      disabled={isUpdating}
                                      className={`p-1 rounded transition-colors ${
                                        activeCategoryToggles[categoryName]
                                          ? 'text-green-600 hover:bg-green-50'
                                          : 'text-red-600 hover:bg-red-50'
                                      } ${
                                        isUpdating
                                          ? 'opacity-50 cursor-not-allowed'
                                          : ''
                                      }`}
                                      title={`${
                                        activeCategoryToggles[categoryName]
                                          ? 'Deactivate'
                                          : 'Activate'
                                      } ${categoryName} category`}
                                    >
                                      {isUpdating ? (
                                        <GradientSpinner size="w-4 h-4" />
                                      ) : activeCategoryToggles[
                                          categoryName
                                        ] ? (
                                        <FaToggleOn className="h-4 w-4" />
                                      ) : (
                                        <FaToggleOff className="h-4 w-4" />
                                      )}
                                    </button>

                                    <span className="font-semibold text-md text-gray-800">
                                      {categoryName}
                                    </span>
                                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                      {services.length} service
                                      {services.length !== 1 ? 's' : ''}
                                    </span>

                                    {/* Category Edit Icon */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const actualCategoryName =
                                          getActualCategoryName(categoryName);
                                        const category =
                                          categoriesData?.data?.find(
                                            (cat: any) =>
                                              cat.category_name ===
                                              actualCategoryName
                                          );
                                        if (category) {
                                          editCategory(
                                            actualCategoryName,
                                            category.id.toString()
                                          );
                                        }
                                      }}
                                      disabled={isUpdating}
                                      className="p-1 hover:bg-blue-50 hover:text-blue-600 text-gray-400 rounded transition-colors disabled:opacity-50"
                                      title={`Edit ${categoryName} category`}
                                    >
                                      <FaEdit className="h-3 w-3" />
                                    </button>

                                    {/* Category Delete Icon */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const actualCategoryName =
                                          getActualCategoryName(categoryName);
                                        const category =
                                          categoriesData?.data?.find(
                                            (cat: any) =>
                                              cat.category_name ===
                                              actualCategoryName
                                          );
                                        if (category) {
                                          handleOpenDeleteCategoryModal(
                                            actualCategoryName,
                                            category.id,
                                            services.length
                                          );
                                        }
                                      }}
                                      disabled={isUpdating}
                                      className="p-1 hover:bg-red-50 hover:text-red-600 text-red-600 rounded transition-colors disabled:opacity-50"
                                      title={`Delete ${categoryName} category`}
                                    >
                                      <FaTrash className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={services.every((service) =>
                                        selectedServices.includes(service.id)
                                      )}
                                      onChange={() =>
                                        handleSelectCategory(categoryName, services)
                                      }
                                      className="rounded border-gray-300 w-4 h-4"
                                      title="Select all services in this category"
                                    />
                                    <span className="text-xs text-gray-500">
                                      Select All
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Services Rows */}
                            {!collapsedCategories.includes(categoryName) &&
                              (services.length > 0 ? (
                                services.map((service: any, i: number) => (
                                  <Fragment key={service.id}>
                                    {/* Drop zone before service */}
                                    {draggedService &&
                                      draggedService !== service.id && (
                                        <tr
                                          className={`transition-all duration-200 ${
                                            dropTargetService === service.id &&
                                            dropPositionService === 'before'
                                              ? 'h-2 bg-blue-100'
                                              : 'h-0'
                                          }`}
                                          onDragOver={(e) =>
                                            handleServiceDragOver(e, service.id)
                                          }
                                          onDragLeave={handleServiceDragLeave}
                                          onDrop={(e) =>
                                            handleServiceDrop(
                                              e,
                                              service.id,
                                              categoryName
                                            )
                                          }
                                        >
                                          <td colSpan={11}>
                                            {dropTargetService === service.id &&
                                              dropPositionService ===
                                                'before' && (
                                                <div className="h-1 bg-blue-400 rounded"></div>
                                              )}
                                          </td>
                                        </tr>
                                      )}

                                    <tr
                                      className={`border-t hover:bg-gray-50 transition-all duration-200 animate-in fade-in slide-in-from-left-1 ${
                                        draggedService === service.id
                                          ? 'opacity-50'
                                          : ''
                                      } ${
                                        service.status === 'inactive' && statusFilter !== 'trash'
                                          ? 'bg-gray-200/70 border-l-4 border-l-gray-500'
                                          : ''
                                      }`}
                                      style={{ animationDelay: `${i * 50}ms` }}
                                      onDragOver={(e) =>
                                        handleServiceDragOver(e, service.id)
                                      }
                                      onDragLeave={handleServiceDragLeave}
                                      onDrop={(e) =>
                                        handleServiceDrop(
                                          e,
                                          service.id,
                                          categoryName
                                        )
                                      }
                                    >
                                      <td className="p-3 pl-8">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="cursor-grab hover:text-gray-600 transition-colors active:cursor-grabbing select-none"
                                            title="Drag to reorder service"
                                            draggable={true}
                                            onDragStart={(e) =>
                                              handleServiceDragStart(
                                                e,
                                                service.id
                                              )
                                            }
                                            onDragEnd={handleServiceDragEnd}
                                            style={{
                                              userSelect: 'none',
                                              WebkitUserSelect: 'none',
                                            }}
                                          >
                                            <FaGripVertical className="h-3 w-3 text-gray-400" />
                                          </div>
                                          <input
                                            type="checkbox"
                                            checked={selectedServices.includes(
                                              service.id
                                            )}
                                            onChange={() =>
                                              handleSelectService(service.id)
                                            }
                                            className="rounded border-gray-300 w-4 h-4"
                                          />
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                          {service.id
                                            ? formatID(service.id)
                                            : 'null'}
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div>
                                          <div
                                            className="font-medium text-sm max-w-44"
                                            style={{
                                              color: 'var(--text-primary)',
                                            }}
                                          >
                                            {service?.name || 'null'}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800 w-fit">
                                          {service?.serviceType?.name ||
                                            'Standard'}
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div
                                          className="text-sm font-medium"
                                          style={{
                                            color: 'var(--text-primary)',
                                          }}
                                        >
                                          {(() => {
                                            try {
                                              const updateData =
                                                service?.updateText
                                                  ? JSON.parse(
                                                      service.updateText
                                                    )
                                                  : null;
                                              return (
                                                updateData?.provider || 'Self'
                                              );
                                            } catch {
                                              return 'Self';
                                            }
                                          })()}
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div className="text-left">
                                          <div
                                            className="font-semibold text-sm"
                                            style={{
                                              color: 'var(--text-primary)',
                                            }}
                                          >
                                            <PriceDisplay
                                              amount={service?.rate}
                                              originalCurrency="USD"
                                            />
                                          </div>
                                          <div
                                            className="text-xs"
                                            style={{
                                              color: 'var(--text-muted)',
                                            }}
                                          >
                                            Cost:{' '}
                                            <PriceDisplay
                                              amount={
                                                service?.providerPrice ||
                                                service?.provider_price ||
                                                service?.self_price ||
                                                service?.cost_price ||
                                                service?.rate
                                              }
                                              originalCurrency="USD"
                                            />
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div>
                                          <div
                                            className="text-sm font-medium"
                                            style={{
                                              color: 'var(--text-primary)',
                                            }}
                                          >
                                            {(
                                              service?.min_order || 0
                                            ).toString()}{' '}
                                            -{' '}
                                            {(
                                              service?.max_order || 0
                                            ).toString()}
                                          </div>
                                          <div
                                            className="text-xs"
                                            style={{
                                              color: 'var(--text-muted)',
                                            }}
                                          >
                                            Min / Max
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div className="space-y-2">
                                          <button
                                            onClick={() =>
                                              toggleRefill(service)
                                            }
                                            className={`p-1 rounded transition-colors ${
                                              service.refill
                                                ? 'text-green-600 hover:bg-green-50'
                                                : 'text-red-600 hover:bg-red-50'
                                            }`}
                                            title={
                                              service.refill
                                                ? 'Disable Refill'
                                                : 'Enable Refill'
                                            }
                                          >
                                            {service.refill ? (
                                              <FaToggleOn className="h-5 w-5" />
                                            ) : (
                                              <FaToggleOff className="h-5 w-5" />
                                            )}
                                          </button>

                                          {/* Show Refill Details when refill is enabled */}
                                          {service.refill && (
                                            <div className="text-xs text-gray-600 space-y-1">
                                              {service.refillDays && (
                                                <div>
                                                  {service.refillDays}D {service.refillDisplay}H
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <button
                                          onClick={() => toggleCancel(service)}
                                          className={`p-1 rounded transition-colors ${
                                            service.cancel
                                              ? 'text-green-600 hover:bg-green-50'
                                              : 'text-red-600 hover:bg-red-50'
                                          }`}
                                          title={
                                            service.cancel
                                              ? 'Disable Cancel'
                                              : 'Enable Cancel'
                                          }
                                        >
                                          {service.cancel ? (
                                            <FaToggleOn className="h-5 w-5" />
                                          ) : (
                                            <FaToggleOff className="h-5 w-5" />
                                          )}
                                        </button>
                                      </td>
                                      {/* Only show Status column when not in Trash filter */}
                                      {statusFilter !== 'trash' && (
                                        <td className="p-3">
                                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit">
                                            {getStatusIcon(service.status, service.deletedAt)}
                                            <span className="text-xs font-medium capitalize">
                                              {service.deletedAt ? 'trash' : (service.status || 'null')}
                                            </span>
                                          </div>
                                        </td>
                                      )}
                                      <td className="p-3">
                                        <div className="relative">
                                          <ServiceActionsDropdown
                                            service={service}
                                            statusFilter={statusFilter}
                                            categoryName={categoryName}
                                            activeCategoryToggles={activeCategoryToggles}
                                            onEdit={() => handleEditService(service.id)}
                                            onToggleStatus={() => toggleServiceStatus(service)}
                                            onRestore={() => restoreService(service)}
                                            onDelete={() => deleteService(service?.id)}
                                          />
                                        </div>
                                      </td>
                                    </tr>

                                    {/* Drop zone after service */}
                                    {draggedService &&
                                      draggedService !== service.id && (
                                        <tr
                                          className={`transition-all duration-200 ${
                                            dropTargetService === service.id &&
                                            dropPositionService === 'after'
                                              ? 'h-2 bg-blue-100'
                                              : 'h-0'
                                          }`}
                                          onDragOver={(e) =>
                                            handleServiceDragOver(e, service.id)
                                          }
                                          onDragLeave={handleServiceDragLeave}
                                          onDrop={(e) =>
                                            handleServiceDrop(
                                              e,
                                              service.id,
                                              categoryName
                                            )
                                          }
                                        >
                                          <td colSpan={11}>
                                            {dropTargetService === service.id &&
                                              dropPositionService ===
                                                'after' && (
                                                <div className="h-1 bg-blue-400 rounded"></div>
                                              )}
                                          </td>
                                        </tr>
                                      )}
                                  </Fragment>
                                ))
                              ) : (
                                <tr className="border-t">
                                  <td colSpan={11} className="p-8 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                      <FaBriefcase className="h-8 w-8 mb-2 text-gray-400" />
                                      <p className="text-sm font-medium">
                                        No services in this category
                                      </p>
                                      <p className="text-xs">
                                        Add services to populate this category
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ))}

                            {/* Drop zone after category */}
                            {draggedCategory &&
                              draggedCategory !== categoryName && (
                                <tr
                                  className={`transition-all duration-200 ${
                                    dropTargetCategory === categoryName &&
                                    dropPosition === 'after'
                                      ? 'h-8 bg-blue-100 border-2 border-dashed border-blue-400'
                                      : 'h-1'
                                  }`}
                                  onDragOver={(e) =>
                                    handleDragOver(e, categoryName)
                                  }
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, categoryName)}
                                >
                                  <td colSpan={11}>
                                    {dropTargetCategory === categoryName &&
                                      dropPosition === 'after' && (
                                        <div className="flex items-center justify-center h-6 text-blue-600 text-sm font-medium">
                                          Drop here
                                        </div>
                                      )}
                                  </td>
                                </tr>
                              )}
                          </Fragment>
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
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <GradientSpinner size="w-4 h-4" />
                        <span>Loading services...</span>
                      </div>
                    ) : pageSize === 'all' ? (
                      `Showing all ${data?.totalCategories || 0} categories`
                    ) : (
                      `Showing page ${currentPage} of ${totalPages} (${
                        data?.totalCategories || 0
                      } total categories)`
                    )}
                  </div>

                  {/* Pagination Controls - Hide when showing all */}
                  {pageSize !== 'all' && (
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <button
                        onClick={handlePreviousPage}
                        disabled={isLoading || currentPage === 1}
                        className="btn btn-secondary disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {isLoading ? (
                          <GradientSpinner size="w-4 h-4" />
                        ) : (
                          `Page ${currentPage} of ${totalPages}`
                        )}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={isLoading || currentPage === totalPages}
                        className="btn btn-secondary disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit Service Modal */}
        {editServiceModal.open && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              editServiceModal.closing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseEditModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 ${
                editServiceModal.closing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <EditServiceForm
                serviceId={editServiceModal.serviceId}
                onClose={handleCloseEditModal}
                showToast={showToast}
                refreshAllData={refreshAllData}
              />
            </div>
          </div>
        )}

        {/* Create Service Modal */}
        {createServiceModal && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              createServiceModalClosing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseCreateModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 ${
                createServiceModalClosing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <CreateServiceForm
                onClose={handleCloseCreateModal}
                showToast={showToast}
                onRefresh={refreshAllData}
                refreshAllDataWithServices={refreshAllDataWithServices}
              />
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        {createCategoryModal && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              createCategoryModalClosing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseCategoryModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                createCategoryModalClosing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <CreateCategoryForm
                onClose={handleCloseCategoryModal}
                showToast={showToast}
                onRefresh={refreshAllData}
              />
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editCategoryModal.open && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              editCategoryModal.closing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseEditCategoryModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                editCategoryModal.closing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <EditCategoryForm
                categoryId={editCategoryModal.categoryId}
                categoryName={editCategoryModal.categoryName}
                onClose={handleCloseEditCategoryModal}
                showToast={showToast}
                refreshAllData={refreshAllData}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmationModal && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              deleteConfirmationModalClosing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseDeleteConfirmation}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                deleteConfirmationModalClosing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteConfirmationModal
                onClose={handleCloseDeleteConfirmation}
                onConfirm={deleteSelectedServices}
                selectedCount={selectedServices.length}
              />
            </div>
          </div>
        )}

        {/* Delete Services and Categories Confirmation Modal */}
        {deleteServicesAndCategoriesModal && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              deleteServicesAndCategoriesModalClosing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseDeleteServicesAndCategoriesConfirmation}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                deleteServicesAndCategoriesModalClosing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteServicesAndCategoriesModal
                onClose={handleCloseDeleteServicesAndCategoriesConfirmation}
                onConfirm={deleteSelectedServicesAndCategories}
                selectedServiceCount={selectedServices.length}
                selectedCategoryCount={selectedCategories.length}
              />
            </div>
          </div>
        )}

        {/* Delete Category Modal */}
        {deleteCategoryModal.open && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              deleteCategoryModal.closing
                ? 'modal-backdrop-exit'
                : 'modal-backdrop-enter'
            }`}
            onClick={handleCloseDeleteCategoryModal}
          >
            <div
              className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 ${
                deleteCategoryModal.closing
                  ? 'modal-content-exit'
                  : 'modal-content-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteCategoryModal
                onClose={handleCloseDeleteCategoryModal}
                onConfirm={deleteCategory}
                categoryName={deleteCategoryModal.categoryName}
                categoryId={typeof deleteCategoryModal.categoryId === 'string' ? parseInt(deleteCategoryModal.categoryId) : deleteCategoryModal.categoryId}
                isUpdating={isUpdating}
                servicesCount={deleteCategoryModal.servicesCount}
                categoriesData={categoriesData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminServicesPage;
