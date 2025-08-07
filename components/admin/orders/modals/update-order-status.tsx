import React, { useState, useEffect } from 'react';

interface UpdateOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | number;
  currentStatus: string;
  onSuccess?: () => void; // Callback for successful update
  showToast?: (message: string, type: 'success' | 'error') => void; // Toast function
}

const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
  isOpen,
  onClose,
  orderId,
  currentStatus,
  onSuccess,
  showToast,
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set initial status when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewStatus(currentStatus);
    }
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  // Handle order status update API call
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setIsLoading(true);
      console.log('Updating order status:', { orderId, newStatus, orderIdType: typeof orderId });
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        showToast?.(`Order status updated to ${newStatus}`, 'success');
        onSuccess?.(); // Refresh orders data
        handleClose();
      } else {
        console.error('Update failed:', result);
        showToast?.(result.error || 'Failed to update order status', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast?.('Error updating order status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    if (!newStatus.trim()) {
      showToast?.('Please select a valid status', 'error');
      return;
    }
    handleStatusUpdate(orderId.toString(), newStatus);
  };

  const handleClose = () => {
    onClose();
    setNewStatus('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Update Order Status
        </h3>
        <div className="mb-4">
          <label className="form-label mb-2">
            Select New Status
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderStatusModal;