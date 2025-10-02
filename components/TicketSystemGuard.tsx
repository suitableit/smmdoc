'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaTicketAlt, FaExclamationTriangle } from 'react-icons/fa';

// Custom Gradient Spinner Component
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

interface TicketSystemGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const TicketSystemGuard: React.FC<TicketSystemGuardProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const checkTicketSystem = async () => {
      try {
        const response = await fetch('/api/ticket-system-status');
        if (response.ok) {
          const data = await response.json();
          const enabled = data.ticketSystemEnabled || false;
          setIsEnabled(enabled);
          
          // If disabled, redirect to appropriate dashboard
          if (!enabled) {
            // Check if user is admin to determine redirect destination
            const isAdmin = session?.user?.role === 'admin';
            const redirectPath = isAdmin ? '/admin' : '/dashboard';
            router.push(redirectPath);
            return;
          }
        } else {
          // If we can't fetch settings, assume disabled for security
          const isAdmin = session?.user?.role === 'admin';
          const redirectPath = isAdmin ? '/admin' : '/dashboard';
          router.push(redirectPath);
          return;
        }
      } catch (error) {
        console.error('Error checking ticket system status:', error);
        // If there's an error, assume disabled for security
        const isAdmin = session?.user?.role === 'admin';
        const redirectPath = isAdmin ? '/admin' : '/dashboard';
        router.push(redirectPath);
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkTicketSystem();
  }, []);

  // Show loading spinner while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GradientSpinner className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children if ticket system is enabled
  return <>{children}</>
};

export default TicketSystemGuard;