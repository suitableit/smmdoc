"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  FaBuffer,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaTwitter,
  FaTelegram,
  FaSpotify,
  FaLinkedin,
  FaDiscord,
  FaGlobe,
} from "react-icons/fa"


const platforms = [
  {
    name: "Everything",
    icon: <FaBuffer size={40} className="bg-purple-500 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-purple-700/20 to-purple-500/20",
    categoryKeyword: null,
  },
  {
    name: "Instagram",
    icon: <FaInstagram size={40} className="bg-pink-500 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-pink-600/20 to-pink-400/20",
    categoryKeyword: "Instagram",
  },
  {
    name: "Facebook",
    icon: <FaFacebook size={40} className="bg-blue-600 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-blue-600/20 to-blue-400/20",
    categoryKeyword: "Facebook",
  },
  {
    name: "YouTube",
    icon: <FaYoutube size={40} className="bg-red-600 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-red-600/20 to-red-400/20",
    categoryKeyword: "YouTube",
  },
  {
    name: "TikTok",
    icon: <FaTiktok size={40} className="bg-gray-800 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-gray-800/20 to-gray-600/20",
    categoryKeyword: "TikTok",
  },
  {
    name: "Twitter",
    icon: <FaTwitter size={40} className="bg-blue-400 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-blue-400/20 to-blue-300/20",
    categoryKeyword: "Twitter",
  },
  {
    name: "Telegram",
    icon: <FaTelegram size={40} className="bg-blue-500 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-blue-500/20 to-blue-300/20",
    categoryKeyword: "Telegram",
  },
  {
    name: "Spotify",
    icon: <FaSpotify size={40} className="bg-green-600 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-green-600/20 to-green-400/20",
    categoryKeyword: "Spotify",
  },
  {
    name: "LinkedIn",
    icon: <FaLinkedin size={40} className="bg-blue-800 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-blue-800/20 to-blue-600/20",
    categoryKeyword: "LinkedIn",
  },
  {
    name: "Discord",
    icon: <FaDiscord size={40} className="bg-indigo-600 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-indigo-600/20 to-indigo-400/20",
    categoryKeyword: "Discord",
  },
  {
    name: "Website Traffic",
    icon: <FaGlobe size={40} className="bg-purple-500 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-purple-500/20 to-purple-300/20",
    categoryKeyword: "Website",
  },
  {
    name: "Others",
    icon: <FaBuffer size={40} className="bg-gray-700 mb-2 p-2 rounded-lg backdrop-blur-sm" />,
    color: "bg-gradient-to-r from-gray-700/20 to-gray-500/20",
    categoryKeyword: "Others",
  },
];



export default function PlatformSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPlatform = searchParams.get("platform")

  const handleCategoryClick = (categoryKeyword: string | null) => {
    if (categoryKeyword) {
      router.push(`/new-order?platform=${categoryKeyword}`)
    } else {
      router.push("/new-order")
    }
  }

  return (
    <div className="  rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2  dark:bg-purple-900 rounded-lg">
            <FaBuffer className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select Platform</h3>
        </div>
        <span className="hidden sm:inline-block bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
          {selectedPlatform ? `${selectedPlatform} Services` : "Choose Your Service"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {platforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => handleCategoryClick(platform.categoryKeyword)}
            className={`${platform.color} ${
              selectedPlatform === platform.categoryKeyword || (!selectedPlatform && platform.categoryKeyword === null)
                ? "ring-4 ring-white ring-opacity-50 scale-105 shadow-2xl"
                : ""
            } text-white p-4 rounded-xl flex flex-col items-center justify-center h-24 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-white/20`}
          >
            <div className="">{platform.icon}</div>
            <div className="text-xs font-semibold text-center leading-tight">{platform.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
