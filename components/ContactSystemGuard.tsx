'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';

const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

interface ContactSystemGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ContactSystemGuard: React.FC<ContactSystemGuardProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const checkContactSystem = async () => {
      try {
        const response = await fetch('/api/contact-system-status');
        if (response.ok) {
          const data = await response.json();
          const enabled = data.contactSystemEnabled || false;
          setIsEnabled(enabled);

          if (!enabled) {

            const isAdmin = session?.user?.role === 'admin';
            const redirectPath = isAdmin ? '/admin' : '/dashboard';
            router.push(redirectPath);
            return;
          }
        } else {

          const isAdmin = session?.user?.role === 'admin';
          const redirectPath = isAdmin ? '/admin' : '/dashboard';
          router.push(redirectPath);
          return;
        }
      } catch (error) {
        console.error('Error checking contact system status:', error);

        const isAdmin = session?.user?.role === 'admin';
        const redirectPath = isAdmin ? '/admin' : '/dashboard';
        router.push(redirectPath);
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkContactSystem();
  }, []);

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

  return <>{children}</>;
};

export default ContactSystemGuard;