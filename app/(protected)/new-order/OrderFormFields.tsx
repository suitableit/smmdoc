"use client"

import { useEffect, useRef } from "react"
import { FaSearch, FaFilter } from "react-icons/fa"
import { useOrderForm } from "./useOrderForm"
import GradientSpinner from "@/components/ui/GradientSpinner"

interface OrderFormFieldsProps {
  showToast: (message: string, type?: "success" | "error" | "info" | "pending") => void
  selectedPlatform: string | null
}

export default function OrderFormFields({ showToast, selectedPlatform }: OrderFormFieldsProps) {
  const searchRef = useRef<HTMLDivElement>(null)

  const {
    formData,
    services,
    servicesData,
    showDropdown,
    isSubmitting,
    handleInputChange,
    handleServiceSelect,
    handleSubmit,
    setShowDropdown,
    filteredCategories,
  } = useOrderForm({ platform: selectedPlatform, showToast })


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setShowDropdown])

  const selectedService = services?.find((s) => s.id === formData.selectedService)
  const rate = parseFloat(selectedService?.rate || "0")
  const totalPrice = (rate * formData.qty) / 1000

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Platform Filter Info */}
      {selectedPlatform && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Showing {selectedPlatform} services only
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400">
              ({filteredCategories.length} categories available)
            </span>
          </div>
        </div>
      )}

      {/* Search Input with Dropdown */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Search {selectedPlatform || "All"} Services
        </label>
        <div className="relative" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="search"
            value={formData.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder={`Search ${selectedPlatform || "all"} services...`}
            autoComplete="off"
          />
          {/* Search Dropdown */}
          {showDropdown && servicesData.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {servicesData.map((service) => (
                <div
                  key={service.id}
                  className="p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-900 dark:text-white truncate pr-2 flex-1">{service.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      ${service.rate || "0.00"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedPlatform ? `${selectedPlatform} Categories` : "All Categories"}
        </label>
        <select
          value={formData.selectedCategory}
          onChange={(e) => handleInputChange("selectedCategory", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">{selectedPlatform ? `Select ${selectedPlatform} category` : "Select a category"}</option>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {selectedPlatform ? `No ${selectedPlatform} categories found` : "No categories available"}
            </option>
          )}
        </select>
        {selectedPlatform && filteredCategories.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            No categories found for {selectedPlatform}.
          </p>
        )}
      </div>

      {/* Service Dropdown */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedPlatform ? `${selectedPlatform} Services` : "Services"}
        </label>
        <select
          value={formData.selectedService}
          onChange={(e) => handleInputChange("selectedService", e.target.value)}
          disabled={!formData.selectedCategory || services.length === 0}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          required
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - ${service.rate || "0.00"}
            </option>
          ))}
        </select>
      </div>

      {/* Link Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedPlatform ? `${selectedPlatform} Link` : "Link"}
        </label>
        <input
          type="url"
          value={formData.link}
          onChange={(e) => handleInputChange("link", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder={selectedPlatform ? `https://${selectedPlatform.toLowerCase()}.com/your-profile` : "https://example.com"}
          required
        />
      </div>

      {/* Quantity Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
        <input
          type="number"
          value={formData.qty || ""}
          onChange={(e) => handleInputChange("qty", Number.parseInt(e.target.value) || 0)}
          min={selectedService?.min_order || 0}
          max={selectedService?.max_order || 0}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Enter Quantity"
          required
        />
        {selectedService && (
          <small className="text-xs text-gray-500 dark:text-gray-400">
            Min: {selectedService.min_order || 0} - Max: {selectedService.max_order || 0}
          </small>
        )}
      </div>

      {/* Price Display */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Total Price (per 1000 = ${selectedService?.rate || "0.00"})
        </label>
        <input
          type="text"
          value={`$${totalPrice.toFixed(4)}`}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !formData.selectedService || !formData.link || formData.qty < 1}
        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <GradientSpinner size="w-4 h-4" className="mr-2" />
            Creating {selectedPlatform || ""} Order...
          </>
        ) : (
          `Create ${selectedPlatform || ""} Order`
        )}
      </button>
    </form>
  )
}
