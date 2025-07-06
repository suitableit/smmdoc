"use client"

import GradientSpinner from "@/components/ui/GradientSpinner"
import { FaInfoCircle, FaHashtag, FaLink, FaTachometerAlt, FaClock, FaShieldAlt } from "react-icons/fa"
import { useOrderForm } from "./useOrderForm"


interface ServiceDetailsCardProps {
  selectedPlatform: string | null
}

export default function ServiceDetailsCard({ selectedPlatform }: ServiceDetailsCardProps) {
  const { services, formData } = useOrderForm({ platform: selectedPlatform })
  const selectedService = services?.find((s) => s.id === formData.selectedService)
  const isLoading = false // You can add loading state here

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-12 flex flex-col items-center">
          <GradientSpinner size="w-12 h-12" className="mb-4" />
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Loading {selectedPlatform || ""} service details...
          </div>
        </div>
      </div>
    )
  }

  if (!selectedService) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {selectedPlatform
              ? `Select a ${selectedPlatform} service to view details`
              : "Select a service to view details"}
          </p>
        </div>
      </div>
    )
  }

  function decodeHTML(html: string) {
    const txt = document.createElement("textarea")
    txt.innerHTML = html
    return txt.value
  }

  return (
    <div className="space-y-6">
      {/* Service Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
            <FaHashtag className="inline mr-1" />
            {selectedService.id}
          </div>
          {selectedPlatform && (
            <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">{selectedPlatform}</div>
          )}
        </div>
        <h3 className="text-lg font-bold leading-tight">{selectedService.name}</h3>
        <div className="text-sm opacity-90 mt-2">
          Max {selectedService.max_order || "N/A"} ~ NO REFILL ~ {selectedService.avg_time || "N/A"} ~ INSTANT - $
          {selectedService.rate || "0.00"} per 1000
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Example Link */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Example Link</h4>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                <FaLink className="text-red-600 dark:text-red-400 text-sm" />
              </div>
              <span className="text-sm">
                {selectedPlatform ? `${selectedPlatform.toLowerCase()}.com/example` : "-"}
              </span>
            </div>
          </div>

          {/* Speed */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Speed</h4>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                <FaTachometerAlt className="text-purple-600 dark:text-purple-400 text-sm" />
              </div>
              <span className="text-sm">Fast</span>
            </div>
          </div>

          {/* Start Time */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Start Time</h4>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <FaClock className="text-blue-600 dark:text-blue-400 text-sm" />
              </div>
              <span className="text-sm">0-1 hours</span>
            </div>
          </div>

          {/* Average Time */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Average Time</h4>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <FaClock className="text-blue-600 dark:text-blue-400 text-sm" />
              </div>
              <span className="text-sm">{selectedService.avg_time || "Not enough data"}</span>
            </div>
          </div>

          {/* Guarantee */}
          <div className="col-span-2">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Guarantee</h4>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                <FaShieldAlt className="text-green-600 dark:text-green-400 text-sm" />
              </div>
              <span className="text-sm text-red-600 dark:text-red-400">✕</span>
            </div>
          </div>
        </div>

        {/* More Details */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">More Details</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: decodeHTML(selectedService.description || "No additional details available."),
              }}
            />
          </div>
        </div>

        {/* Service Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.min_order || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Min Order</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.max_order || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Max Order</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">${selectedService.rate || "0.00"}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Per 1000</div>
          </div>
        </div>
      </div>
    </div>
  )
}
