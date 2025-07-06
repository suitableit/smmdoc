"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaShoppingCart, FaLayerGroup } from "react-icons/fa"
import GradientSpinner from "@/components/ui/GradientSpinner"
import OrderFormFields from "./OrderFormFields"
import ServiceDetailsCard from "./ServiceDetailsCard"
import { Toaster } from "sonner"


interface NewOrderFormProps {
  selectedPlatform: string | null
}

export default function NewOrderForm({ selectedPlatform }: NewOrderFormProps) {
  const router = useRouter()
  const [isFormLoading, setIsFormLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<{
    message: string
    type: "success" | "error" | "info" | "pending"
  } | null>(null)

  const showToast = (message: string, type: "success" | "error" | "info" | "pending" = "success") => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      {toastMessage && (
        <Toaster  />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Order Form */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                <FaShoppingCart className="mr-2 w-4 h-4" />
                New Order
              </button>
              <button
                onClick={() => router.push("/mass-orders")}
                className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-purple-900 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200"
              >
                <FaLayerGroup className="mr-2 w-4 h-4" />
                Mass Orders
              </button>
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {isFormLoading ? (
              <div className="text-center py-12 flex flex-col items-center">
                <GradientSpinner size="w-16 h-16" className="mb-6" />
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading Order Form...</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedPlatform
                    ? `Preparing ${selectedPlatform} services for you...`
                    : "Please wait while we prepare everything for you"}
                </div>
              </div>
            ) : (
              <OrderFormFields showToast={showToast} selectedPlatform={selectedPlatform} />
            )}
          </div>
        </div>

        {/* Right Column - Service Details */}
        <div className="space-y-6">
          <ServiceDetailsCard selectedPlatform={selectedPlatform} />
        </div>
      </div>
    </div>
  )
}
