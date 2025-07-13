import { PriceDisplay } from '@/components/PriceDisplay';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import {
    FaArrowDown,
    FaArrowUp,
    FaCheckCircle,
    FaClock,
    FaDollarSign,
    FaLink,
    FaRedo,
    FaTachometerAlt,
    FaTimes
} from 'react-icons/fa';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

export default function ServiceViewModal({ service, setIsOpen, isOpen }: any) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300); // Match animation duration
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-xl transition-all duration-300 transform ${
        isAnimating 
          ? 'scale-100 opacity-100 translate-y-0' 
          : 'scale-95 opacity-0 translate-y-4'
      }`}>
        
        {/* Scrollable Content Container */}
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <div className="flex justify-end p-4 pb-0 sticky top-0 bg-white z-10">
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
            >
              <FaTimes className="w-4 h-4 text-red-600" />
            </button>
          </div>

          {/* Header Section with ID and Title */}
          <div className="bg-[#f3f3f3] mx-6 mb-6 px-6 py-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 font-medium mb-2">
                ID: {service?.id ? formatNumber(service.id) : '14832'}
              </div>
              <h2 className="text-lg font-semibold text-gray-800 leading-tight">
                {service?.name || 'TikTok ~ Followers ~ [100% Real Users] ~ Max 10M ~ 100k/days ~ Instant ~ NO REFILL'}
              </h2>
            </div>
          </div>

          {/* Service Details Grid */}
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {/* Price Per 1000 */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaDollarSign className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Price Per 1000</span>
                </div>
                <span className="text-gray-800 font-semibold">
                  <PriceDisplay amount={service?.rate || 1.9688} originalCurrency={'USD'} />
                </span>
              </div>

              {/* Min Order */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaArrowDown className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Min Order</span>
                </div>
                <span className="text-gray-800 font-semibold">
                  {formatNumber(service?.min_order || 10)}
                </span>
              </div>

              {/* Max Order */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaArrowUp className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Max order</span>
                </div>
                <span className="text-gray-800 font-semibold">
                  {formatNumber(service?.max_order || 10000000)}
                </span>
              </div>

              {/* Average Time */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaClock className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Average Time</span>
                </div>
                <span className="text-gray-800 font-semibold">
                  {service?.avg_time || '4 minutes'}
                </span>
              </div>

              {/* Refill */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaRedo className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Refill</span>
                </div>
                <div className="flex items-center gap-2">
                  {service?.refill ? (
                    <>
                      <span className="text-green-600 font-semibold">Available</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </>
                  ) : (
                    <>
                      <span className="text-red-600 font-semibold">Not Available</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </>
                  )}
                </div>
              </div>

              {/* Cancel */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaTimes className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Cancel</span>
                </div>
                <div className="flex items-center gap-2">
                  {service?.cancel ? (
                    <>
                      <span className="text-green-600 font-semibold">Available</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </>
                  ) : (
                    <>
                      <span className="text-red-600 font-semibold">Not Available</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </>
                  )}
                </div>
              </div>

              {/* Start Time */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaClock className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Start Time</span>
                </div>
                <span className="text-gray-800 font-semibold">
                  {service?.start_time || '0-1 mint'}
                </span>
              </div>

              {/* Guarantee */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Guarantee</span>
                </div>
                <span className="text-gray-800 font-semibold">
                  {service?.guarantee || 'No Guarantee'}
                </span>
              </div>

              {/* Speed */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaTachometerAlt className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Speed</span>
                </div>
                <span className="text-gray-800 font-semibold">
                  {service?.speed || '100k/Days'}
                </span>
              </div>

              {/* Link Type */}
              <div className="flex items-center justify-between pb-2 border-b border-dotted border-gray-300">
                <div className="flex items-center gap-2">
                  <FaLink className="text-black w-4 h-4" />
                  <span className="text-gray-700 font-medium">Link Type</span>
                </div>
                <span className="text-gray-800 font-semibold">
                  {service?.link_type || 'Profile link or Username'}
                </span>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="px-6 pb-6">
            <div className="space-y-4 text-sm text-gray-700">
              {/* Service Description */}
              <div>
                <p className="font-semibold text-gray-800 mb-2">Service Description:</p>
                <div className="space-y-2 text-sm">
                  <p>• When the service is experiencing high demand, the starting speed may vary.</p>
                  <p>• Please avoid placing a second order on the same link until the current order is fully completed in the system.</p>
                  <p>• If you encounter any issues with the service, kindly reach out to our support team for assistance.</p>
                  <p>• Do not place orders for private accounts or private links. Orders for private content will not be processed and may not be refunded.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Buy Now Button */}
          <div className="px-6 pb-6">
            <Link href={`/new-order?sId=${service?.id}`}>
              <Button 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                onClick={handleClose}
              >
                Buy Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}