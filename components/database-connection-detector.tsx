'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function DatabaseConnectionDetector({ children }: { children: React.ReactNode }) {
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isDatabaseErrorPage = pathname === '/database-error';

  const checkDatabaseConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/test-db', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.log('Database connection check failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (isDatabaseErrorPage) {
      return;
    }

    const performCheck = async () => {
      const connected = await checkDatabaseConnection();
      setIsDatabaseConnected(connected);

      if (!connected) {
        router.push('/database-error');
      }
    };

    performCheck();

    const interval = setInterval(() => {
      performCheck();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [pathname, router, isDatabaseErrorPage, checkDatabaseConnection]);

  if (isDatabaseErrorPage) {
    return <>{children}</>;
  }

  if (isDatabaseConnected === null) {
    return <>{children}</>;
  }

  if (isDatabaseConnected) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

