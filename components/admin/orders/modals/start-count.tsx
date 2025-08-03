import React from 'react';

interface StartCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | number;
  currentCount: number;
  newStartCount: string;
  setNewStartCount: (count: string) => void;
  onUpdate: (orderId: string, count: number) => void;
}

const StartCountModal: React.FC<StartCountModalProps> = ({
  isOpen,
  onClose,
  orderId,
  currentCount,
  newStartCount,
  setNewStartCount,
  onUpdate,
}) => {
  if (!isOpen) return null;

  const handleUpdate = () => {
    onUpdate(orderId.toString(), parseInt(newStartCount) || 0);
  };

  const handleClose = () => {
    onClose();
    setNewStartCount('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Edit Start Count
        </h3>
        <div className="mb-4">
          <label className="form-label mb-2">
            New Start Count
          </label>
          <input
            type="number"
            value={newStartCount}
            onChange={(e) => setNewStartCount(e.target.value)}
            className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Enter new start count"
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

export default StartCountModal;