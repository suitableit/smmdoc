'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const pathname = usePathname();

  const checkConnectivity = async (): Promise<boolean> => {
    try {
      setIsCheckingConnection(true);

      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch (error) {
      console.log('Connectivity check failed:', error);
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleGoOffline = () => {

    if (pathname !== '/offline') {

      const currentPageTitle = document.title;
      const currentPath = pathname;

      window.location.href = `/offline?from=${encodeURIComponent(currentPath)}&title=${encodeURIComponent(currentPageTitle)}&error=connection_lost`;
    }
  };

  const handleOnlineStatusChange = async () => {
    const browserOnline = navigator.onLine;

    if (browserOnline) {

      const actuallyOnline = await checkConnectivity();
      setIsOnline(actuallyOnline);

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

    setIsOnline(navigator.onLine);

    const handleOnline = () => handleOnlineStatusChange();
    const handleOffline = () => {
      setIsOnline(false);
      handleGoOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connectivityInterval = setInterval(async () => {
      if (navigator.onLine) {
        const actuallyOnline = await checkConnectivity();
        const wasOnline = isOnline;
        setIsOnline(actuallyOnline);

        if (wasOnline && !actuallyOnline) {
          handleGoOffline();
        }

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