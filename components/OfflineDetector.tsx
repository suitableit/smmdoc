'use client';

import { useEffect, useState } from 'react';
import OfflineBanner from './OfflineBanner';

export default function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // Check network connectivity
  const checkConnectivity = async (): Promise<boolean> => {
    try {
      setIsCheckingConnection(true);
      
      // Try to fetch a small resource from the same origin
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      return response.ok;
    } catch (error) {
      console.log('Connectivity check failed:', error);
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  };

  // Handle retry connection attempt
  const handleRetryConnection = async () => {
    const actuallyOnline = await checkConnectivity();
    setIsOnline(actuallyOnline);
  };

  // Handle online/offline status changes
  const handleOnlineStatusChange = async () => {
    const browserOnline = navigator.onLine;
    
    if (browserOnline) {
      // Browser says we're online, but let's verify with a network request
      const actuallyOnline = await checkConnectivity();
      setIsOnline(actuallyOnline);
    } else {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => handleOnlineStatusChange();
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check (every 30 seconds)
    const connectivityInterval = setInterval(async () => {
      if (navigator.onLine) {
        const actuallyOnline = await checkConnectivity();
        setIsOnline(actuallyOnline);
      }
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectivityInterval);
    };
  }, []);

  return (
    <>
      <OfflineBanner 
        isOnline={isOnline} 
        onRetry={handleRetryConnection}
        isRetrying={isCheckingConnection}
      />
      <div className={!isOnline ? 'pt-16' : ''}>
        {children}
      </div>
    </>
  );
}