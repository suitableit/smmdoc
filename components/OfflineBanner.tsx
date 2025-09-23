'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function OfflineBanner({ isOnline, onRetry, isRetrying = false }: OfflineBannerProps) {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <WifiOff className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              You're currently offline
            </p>
            <p className="text-xs opacity-90">
              Some features may not be available. Check your internet connection.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="flex items-center space-x-1 px-3 py-1 bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-medium transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Checking...' : 'Retry'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}