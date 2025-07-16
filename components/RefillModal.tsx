'use client';

import { formatID } from '@/lib/utils';
import { FaTimes } from 'react-icons/fa';

interface RefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderId: number | null;
  reason: string;
  setReason: (reason: string) => void;
}

export default function RefillModal({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  reason,
  setReason,
}: RefillModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Request Refill
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            You are requesting a refill for Order {orderId ? formatID(orderId) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Refill requests are reviewed within 24 hours. You will be notified once processed.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the issue (e.g., followers dropped, likes decreased, etc.)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Providing details helps us process your request faster
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Request
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-blue-500 text-sm">ℹ️</span>
            </div>
            <div className="ml-2">
              <p className="text-xs text-blue-700">
                <strong>Refill Policy:</strong> Refills are available for completed orders within the guarantee period. 
                The refill will restore the original count if there has been a significant drop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
