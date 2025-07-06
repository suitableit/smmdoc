"use client"

import { useState, useEffect } from "react"

interface UseOrderFormProps {
  platform?: string | null
  showToast?: (message: string, type?: "success" | "error" | "info" | "pending") => void
}

interface FormData {
  search: string
  selectedCategory: string
  selectedService: string
  link: string
  qty: number
}

interface Category {
  id: string
  category_name: string
}

interface Service {
  id: string
  name: string
  rate: string
  categoryId?: string
  min_order?: number
  max_order?: number
  avg_time?: string
  description?: string
}

export function useOrderForm({ platform, showToast }: UseOrderFormProps = {}) {
  const [formData, setFormData] = useState<FormData>({
    search: "",
    selectedCategory: "",
    selectedService: "",
    link: "",
    qty: 0,
  })

  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [servicesData, setServicesData] = useState<Service[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredCategories = categories.filter((category) => {
    if (!platform || platform === "Everything") return true
    return category.category_name.toLowerCase().includes(platform.toLowerCase())
  })

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "selectedCategory") {
      setFormData((prev) => ({ ...prev, selectedService: "", qty: 0 }))
    }

    if (field === "search" && value.trim()) {
      setTimeout(() => {
        const mockServices: Service[] = [
          { id: "1", name: `${platform || "Sample"} Followers`, rate: "0.50", categoryId: "1" },
          { id: "2", name: `${platform || "Sample"} Likes`, rate: "0.30", categoryId: "1" },
          { id: "3", name: `${platform || "Sample"} Views`, rate: "0.20", categoryId: "1" },
          { id: "4", name: `${platform || "Sample"} Comments`, rate: "0.40", categoryId: "1" },
          { id: "5", name: `${platform || "Sample"} Shares`, rate: "0.35", categoryId: "1" },
        ]

        const filteredServices =
          platform && platform !== "Everything"
            ? mockServices.filter((service) => service.name.toLowerCase().includes(platform.toLowerCase()))
            : mockServices

        setServicesData(filteredServices)
        setShowDropdown(true)
      }, 300)
    } else if (field === "search") {
      setServicesData([])
      setShowDropdown(false)
    }
  }

  const handleServiceSelect = (service: Service) => {
    setFormData((prev) => ({
      ...prev,
      selectedService: service.id,
      selectedCategory: service.categoryId || "",
      search: service.name,
      qty: 0,
    }))
    setShowDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.selectedService) {
      showToast?.("Please select a service", "error")
      return
    }

    if (!formData.link || !formData.link.startsWith("http")) {
      showToast?.("Please enter a valid link starting with http or https", "error")
      return
    }

    if (formData.qty < 1) {
      showToast?.("Please enter a valid quantity", "error")
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      showToast?.(`${platform || "Social media"} order created successfully!`, "success")

      setFormData({
        search: "",
        selectedCategory: "",
        selectedService: "",
        link: "",
        qty: 0,
      })
    } catch (error) {
      showToast?.("Failed to create order", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const mockCategories: Category[] = [
      { id: "1", category_name: "Instagram Followers" },
      { id: "2", category_name: "Instagram Likes" },
      { id: "3", category_name: "Instagram Views" },
      { id: "4", category_name: "Facebook Followers" },
      { id: "5", category_name: "Facebook Likes" },
      { id: "6", category_name: "Facebook Page Likes" },
      { id: "7", category_name: "YouTube Subscribers" },
      { id: "8", category_name: "YouTube Views" },
      { id: "9", category_name: "YouTube Likes" },
      { id: "10", category_name: "TikTok Followers" },
      { id: "11", category_name: "TikTok Likes" },
      { id: "12", category_name: "TikTok Views" },
      { id: "13", category_name: "Twitter Followers" },
      { id: "14", category_name: "Twitter Likes" },
      { id: "15", category_name: "Twitter Retweets" },
      { id: "16", category_name: "LinkedIn Followers" },
      { id: "17", category_name: "LinkedIn Connections" },
      { id: "18", category_name: "Spotify Followers" },
      { id: "19", category_name: "Spotify Plays" },
      { id: "20", category_name: "Website Traffic" },
      { id: "21", category_name: "SEO Services" },
    ]

    setCategories(mockCategories)
  }, [])

  useEffect(() => {
    if (formData.selectedCategory) {
      const selectedCategory = categories.find((cat) => cat.id === formData.selectedCategory)
      const categoryName = selectedCategory?.category_name || ""

      const mockServices: Service[] = [
        {
          id: "1",
          name: `${categoryName} - Premium Quality`,
          rate: "0.50",
          min_order: 100,
          max_order: 10000,
          avg_time: "0-1 hours",
          description: `High quality ${categoryName.toLowerCase()} for your account`,
        },
        {
          id: "2",
          name: `${categoryName} - Standard Quality`,
          rate: "0.30",
          min_order: 50,
          max_order: 5000,
          avg_time: "0-30 minutes",
          description: `Standard ${categoryName.toLowerCase()} from active users`,
        },
        {
          id: "3",
          name: `${categoryName} - Budget Friendly`,
          rate: "0.20",
          min_order: 25,
          max_order: 2500,
          avg_time: "1-2 hours",
          description: `Budget-friendly ${categoryName.toLowerCase()} option`,
        },
      ]

      setServices(mockServices)

      if (mockServices.length > 0 && !formData.selectedService) {
        setFormData((prev) => ({ ...prev, selectedService: mockServices[0].id }))
      }
    }
  }, [formData.selectedCategory, categories])

  useEffect(() => {
    setFormData({
      search: "",
      selectedCategory: "",
      selectedService: "",
      link: "",
      qty: 0,
    })
    setServices([])
    setServicesData([])
    setShowDropdown(false)
  }, [platform])

  return {
    formData,
    services,
    categories,
    servicesData,
    showDropdown,
    isSubmitting,
    filteredCategories,
    handleInputChange,
    handleServiceSelect,
    handleSubmit,
    setShowDropdown,
  }
}
