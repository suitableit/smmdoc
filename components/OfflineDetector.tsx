'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const pathname = usePathname();

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

  // Handle going offline - redirect to offline page
  const handleGoOffline = () => {
    // Don't redirect if already on offline page
    if (pathname !== '/offline') {
      // Store current page info and redirect to offline page
      const currentPageTitle = document.title;
      const currentPath = pathname;
      
      // Redirect to offline page with current page context
      window.location.href = `/offline?from=${encodeURIComponent(currentPath)}&title=${encodeURIComponent(currentPageTitle)}&error=connection_lost`;
    }
  };

  // Handle online/offline status changes
  const handleOnlineStatusChange = async () => {
    const browserOnline = navigator.onLine;
    
    if (browserOnline) {
      // Browser says we're online, but let's verify with a network request
      const actuallyOnline = await checkConnectivity();
      setIsOnline(actuallyOnline);
      
      // If we were offline and now we're online, and we're on the offline page, go back
      if (actuallyOnline && pathname === '/offline') {
        const urlParams = new URLSearchParams(window.location.search);
        const fromPage = urlParams.get('from');
        if (fromPage) {
          window.location.href = fromPage;
        } else {
          window.location.href = '/';
        }
      }
    } else {
      setIsOnline(false);
      handleGoOffline();
    }
  };

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => handleOnlineStatusChange();
    const handleOffline = () => {
      setIsOnline(false);
      handleGoOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check (every 30 seconds)
    const connectivityInterval = setInterval(async () => {
      if (navigator.onLine) {
        const actuallyOnline = await checkConnectivity();
        const wasOnline = isOnline;
        setIsOnline(actuallyOnline);
        
        // If we just went offline, redirect
        if (wasOnline && !actuallyOnline) {
          handleGoOffline();
        }
        // If we just came back online and we're on offline page, go back
        else if (!wasOnline && actuallyOnline && pathname === '/offline') {
          const urlParams = new URLSearchParams(window.location.search);
          const fromPage = urlParams.get('from');
          if (fromPage) {
            window.location.href = fromPage;
          } else {
            window.location.href = '/';
          }
        }
      }
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectivityInterval);
    };
  }, [pathname, isOnline]);

  return (
    <div>
      {children}
    </div>
  );
}