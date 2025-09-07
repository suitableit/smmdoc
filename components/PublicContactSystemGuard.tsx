'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GradientSpinner } from '@/components/ui/GradientSpinner';

interface PublicContactSystemGuardProps {
  children: React.ReactNode;
}

const PublicContactSystemGuard: React.FC<PublicContactSystemGuardProps> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkContactSystem = async () => {
      try {
        const response = await fetch('/api/contact-system-status');
        if (response.ok) {
          const data = await response.json();
          const enabled = data.contactSystemEnabled || false;
          setIsEnabled(enabled);
          
          // If disabled, redirect to home page
          if (!enabled) {
            router.push('/');
            return;
          }
        } else {
          // If we can't fetch settings, assume disabled for security
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error checking contact system status:', error);
        // If there's an error, assume disabled for security
        router.push('/');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkContactSystem();
  }, [router]);

  // Show loading spinner while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GradientSpinner size="w-16 h-16" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If contact system is disabled, don't render children (redirect will happen)
  if (!isEnabled) {
    return null;
  }

  // If contact system is enabled, render children
  return <>{children}</>;
};

export default PublicContactSystemGuard;