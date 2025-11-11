'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaTicketAlt, FaExclamationTriangle } from 'react-icons/fa';

const ShimmerStyles = () => (
  <style jsx>{`
    .gradient-shimmer {
      background: linear-gradient(90deg, #f0f0f0 0%, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%, #f0f0f0 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .dark .gradient-shimmer {
      background: linear-gradient(90deg, #2d2d2d 0%, #353535 25%, #2f2f2f 50%, #353535 75%, #2d2d2d 100%);
      background-size: 200% 100%;
    }
  `}</style>
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
        console.error('Error checking ticket system status:', error);

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

  if (isLoading) {
    return (
      <>
        <ShimmerStyles />
      </>
    );
  }

  return <>{children}</>
};

export default TicketSystemGuard;