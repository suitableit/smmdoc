
"use client"

import { APP_NAME } from "@/lib/constants"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import NewOrderForm from "./NewOrderForm"
import PlatformSelector from "./PlatformSelector"


export default function NewOrderPage() {

  const searchParams = useSearchParams()
  const selectedPlatform = searchParams.get("platform")

  useEffect(() => {
    document.title = `New Order — ${APP_NAME}`
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <PlatformSelector />
          <NewOrderForm selectedPlatform={selectedPlatform} />
        </div>
      </div>
    </div>
  )
}
