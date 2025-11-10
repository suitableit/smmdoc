'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaUserShield } from 'react-icons/fa';

interface UserSwitchIconProps {
  onSwitchBack: () => void;
  isLoading?: boolean;
}

const UserSwitchIcon: React.FC<UserSwitchIconProps> = ({ onSwitchBack, isLoading = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null);

  useEffect(() => {
    const isMountedRef = { current: true };
    const retryRef = { current: 0 };
    const timeoutRef = { current: null as number | null };
    const abortRef = { current: null as AbortController | null };

    const BASE_INTERVAL_MS = 30000; // 30s base poll
    const MAX_INTERVAL_MS = 300000; // 5 minutes cap

    const clearScheduled = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };

    const scheduleNext = (hadError: boolean, impersonating: boolean) => {
      // Only poll when tab is visible to avoid background noise
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return; // will reschedule on visibility change
      }

      let interval = BASE_INTERVAL_MS;
      if (hadError) {
        retryRef.current = Math.min(retryRef.current + 1, 5); // max 5 retries
        interval = Math.min(BASE_INTERVAL_MS * Math.pow(2, retryRef.current), MAX_INTERVAL_MS);
      } else {
        retryRef.current = 0;
        // If impersonating, we can keep the same 30s interval
        interval = impersonating ? BASE_INTERVAL_MS : BASE_INTERVAL_MS;
      }

      timeoutRef.current = window.setTimeout(() => {
        checkImpersonation();
      }, interval);
    };

    const checkImpersonation = async () => {
      // Cancel any in-flight request before starting a new one
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      try {
        const response = await fetch('/api/auth/session', {
          signal: abortRef.current.signal,
          cache: 'no-store',
        });
        const session = await response.json();

        const impersonating = Boolean(session?.user?.isImpersonating);
        if (!isMountedRef.current) return;
        setIsVisible(impersonating);
        setImpersonatedUser(impersonating ? session.user.username || 'user' : null);

        scheduleNext(false, impersonating);
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error('Error checking impersonation status:', error);
        setIsVisible(false);
        setImpersonatedUser(null);
        scheduleNext(true, false);
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;
      if (document.visibilityState === 'visible') {
        clearScheduled();
        // Immediately check when returning to the tab
        checkImpersonation();
      } else {
        // Stop polling when hidden
        clearScheduled();
      }
    };

    // Initial check
    checkImpersonation();

    // Visibility-based polling: only when tab is visible
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      isMountedRef.current = false;
      clearScheduled();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
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