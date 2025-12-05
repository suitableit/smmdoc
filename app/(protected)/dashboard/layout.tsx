'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/current');
        const userData = await response.json();
        
        if (userData.success) {
          setUser(userData.data);
        } else {
          console.error('Failed to fetch user data:', userData.error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  // Redirect admin/moderator to admin dashboard
  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      const userRole = session.user.role;
      if (userRole === 'admin' || userRole === 'moderator') {
        router.push('/admin');
        return;
      }
    }

    if (!loading && user) {
      if (user.role === 'ADMIN' || user.role === 'admin' || user.role === 'moderator') {
        router.push('/admin');
        return;
      }
    }
  }, [session, user, loading, router, status]);

  // Show loading while checking
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Don't render if admin/moderator (will redirect)
  if (session?.user) {
    const userRole = session.user.role;
    if (userRole === 'admin' || userRole === 'moderator') {
      return null;
    }
  }

  if (!loading && user) {
    if (user.role === 'ADMIN' || user.role === 'admin' || user.role === 'moderator') {
      return null;
    }
  }

  return (
    <div className="h-full">
      <main className="h-full">
        {children}
      </main>
    </div>
  );
} 
