import React from 'react';

interface UpdateOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentStatus: string;
  newStatus: string;
  setNewStatus: (status: string) => void;
  onUpdate: (orderId: string, status: string) => void;
}

const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
  isOpen,
  onClose,
  orderId,
  currentStatus,
  newStatus,
  setNewStatus,
  onUpdate,
}) => {
  if (!isOpen) return null;

  const handleUpdate = () => {
    onUpdate(orderId, newStatus);
    onClose();
    setNewStatus('');
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
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="btn btn-primary"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderStatusModal;