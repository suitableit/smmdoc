import React from 'react';

interface MarkPartialModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  notGoingAmount: string;
  setNotGoingAmount: (amount: string) => void;
  onUpdate: (orderId: string, amount: string) => void;
}

const MarkPartialModal: React.FC<MarkPartialModalProps> = ({
  isOpen,
  onClose,
  orderId,
  notGoingAmount,
  setNotGoingAmount,
  onUpdate,
}) => {
  if (!isOpen) return null;

  const handleUpdate = () => {
    onUpdate(orderId, notGoingAmount);
  };

  const handleClose = () => {
    onClose();
    setNotGoingAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Mark as Partial
        </h3>
        <div className="mb-4">
          <label className="form-label mb-2">
            Not going amount
          </label>
          <input
            type="number"
            value={notGoingAmount}
            onChange={(e) => setNotGoingAmount(e.target.value)}
            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Enter not going amount"
          />
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

export default MarkPartialModal;