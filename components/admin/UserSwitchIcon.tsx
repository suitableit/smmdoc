'use client';

import React, { useState, useEffect } from 'react';
import { FaUserShield, FaTimes } from 'react-icons/fa';

interface UserSwitchIconProps {
  onSwitchBack: () => void;
  isLoading?: boolean;
}

const UserSwitchIcon: React.FC<UserSwitchIconProps> = ({ onSwitchBack, isLoading = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null);

  useEffect(() => {
    // Check if user switching is active by calling the session API
    const checkImpersonation = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user?.isImpersonating) {
          setIsVisible(true);
          setImpersonatedUser(session.user.username || 'user');
        } else {
          setIsVisible(false);
          setImpersonatedUser(null);
        }
      } catch (error) {
        console.error('Error checking impersonation status:', error);
        setIsVisible(false);
        setImpersonatedUser(null);
      }
    };

    checkImpersonation();
    
    // Check periodically in case session changes
    const interval = setInterval(checkImpersonation, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
        <button
          onClick={onSwitchBack}
          disabled={isLoading}
          className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gradient-to-r hover:from-purple-800 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Switch back to admin account"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaUserShield className="w-5 h-5" />
          )}
        </button>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-lg">
          Switch back to admin
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default UserSwitchIcon;