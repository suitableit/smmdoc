'use client';

import { PriceDisplay } from '@/components/PriceDisplay';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FaCheckCircle,
  FaEye,
  FaRegStar,
  FaShoppingCart,
  FaStar,
  FaTimes,
} from 'react-icons/fa';

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
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
      type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : type === 'info'
        ? 'bg-blue-50 border-blue-200 text-blue-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

// Modal Component
const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    rate: number;
    min_order: number;
    max_order: number;
    avg_time: string;
    description: string;
    category: {
      category_name: string;
      id: string;
    };
    isFavorite?: boolean;
  };
  toggleFavorite: (serviceId: string) => void;
}

export default function ServiceCard({
  service,
  toggleFavorite,
}: ServiceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const router = useRouter();

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBuyNow = () => {
    router.push(`/new-order?sId=${service.id}`);
    setIsOpen(false);
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(service.id);
    showToast(
      service.isFavorite ? 'Removed from favorites' : 'Added to favorites',
      'success'
    );
  };

  // Decode HTML content
  const decodeHTML = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <>
      {/* Toast Container */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Service Card */}
      <div className="card h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        {/* Card Header */}
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1 mr-2">
              {service.name}
            </h3>
            <button
              onClick={handleFavoriteToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
              title={
                service.isFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
            >
              {service.isFavorite ? (
                <FaStar className="w-5 h-5 text-yellow-500" />
              ) : (
                <FaRegStar className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
              )}
            </button>
          </div>

          {/* Service Details */}
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rate per 1000:</span>
              <span className="font-medium text-gray-900">
                <PriceDisplay amount={service.rate} originalCurrency={'USD'} />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Min order:</span>
              <span className="font-medium text-gray-900">
                {service.min_order?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Max order:</span>
              <span className="font-medium text-gray-900">
                {service.max_order?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average time:</span>
              <span className="font-medium text-gray-900">
                {service.avg_time || 'N/A'}
              </span>
            </div>
          </div>

          {/* Description Preview */}
          <div className="text-sm text-gray-600 line-clamp-3">
            {decodeHTML(service.description || 'No description available.')}
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-6 pt-0 border-t border-gray-100">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
          >
            <FaEye className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>

      {/* Service Details Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Service Details</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Service Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {service.name}
          </h3>

          {/* Service Information Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Rate per 1000:
                </span>
                <div className="text-sm font-semibold text-gray-900">
                  <PriceDisplay
                    amount={service.rate}
                    originalCurrency={'USD'}
                  />
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Min order:
                </span>
                <div className="text-sm font-semibold text-gray-900">
                  {service.min_order?.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Max order:
                </span>
                <div className="text-sm font-semibold text-gray-900">
                  {service.max_order?.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Average time:
                </span>
                <div className="text-sm font-semibold text-gray-900">
                  {service.avg_time || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="mb-6">
            <span className="text-sm font-medium text-gray-600">Category:</span>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {service.category?.category_name || 'Uncategorized'}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <span className="text-sm font-medium text-gray-600">
              Description:
            </span>
            <div className="mt-2 text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: service.description || 'No description available.',
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-0 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-700 shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/40 transition-all duration-200"
            >
              Close
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
            >
              <FaShoppingCart className="w-4 h-4" />
              Buy Now
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
