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
  const [hasImpersonationCookie, setHasImpersonationCookie] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';').reduce((acc: any, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key.trim()] = decodeURIComponent(value.trim());
        }
        return acc;
      }, {});
      const hasCookie = !!(cookies['impersonated-user-id'] && cookies['original-admin-id']);
      setHasImpersonationCookie(hasCookie);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/current', {
          credentials: 'include',
          cache: 'no-store'
        });
        const userData = await response.json();
        
        if (userData.success) {
          setUser(userData.data);
          if (userData.data.isImpersonating) {
            setHasImpersonationCookie(true);
          }
          console.log('User data fetched:', { role: userData.data.role, isImpersonating: userData.data.isImpersonating });
        } else {
          console.error('Failed to fetch user data:', userData.error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (status !== 'loading') {
      fetchUser();
    }
  }, [session, status]);

  useEffect(() => {
    if (status === 'loading') return;

    const isImpersonating = session?.user?.isImpersonating || hasImpersonationCookie;

    if (session?.user && !isImpersonating) {
      const userRole = session.user.role;
      if (userRole === 'admin' || userRole === 'moderator') {
        router.push('/admin');
        return;
      }
    }

    if (!loading && user && !isImpersonating) {
      if (user.role === 'ADMIN' || user.role === 'admin' || user.role === 'moderator') {
        router.push('/admin');
        return;
      }
    }
  }, [session, user, loading, router, status, hasImpersonationCookie]);

  const isImpersonating = user?.isImpersonating || session?.user?.isImpersonating || false;
  const userRole = user?.role || session?.user?.role;

  console.log('Dashboard Layout Check:', { 
    userRole, 
    isImpersonating, 
    loading, 
    status, 
    hasUser: !!user,
    sessionRole: session?.user?.role 
  });

  if (userRole === 'user' || userRole === 'USER') {
    console.log('Dashboard Layout: Allowing - role is user');
    return (
      <div className="h-full">
        <main className="h-full">
          {children}
        </main>
      </div>
    );
  }

  if (isImpersonating) {
    console.log('Dashboard Layout: Allowing - impersonating flag is true');
    return (
      <div className="h-full">
        <main className="h-full">
          {children}
        </main>
      </div>
    );
  }

  if (session?.user && !loading && user) {
    const sessionRole = session.user.role;
    const apiRole = user.role;
    const apiIsImpersonating = user.isImpersonating === true;
    
    if (
      (sessionRole === 'admin' || sessionRole === 'moderator') && 
      (apiRole === 'admin' || apiRole === 'moderator' || apiRole === 'ADMIN') &&
      apiIsImpersonating === false &&
      isImpersonating === false
    ) {
      console.log('Dashboard Layout: Blocking - admin/moderator not impersonating (confirmed)');
      return null;
    }
  }

  console.log('Dashboard Layout: Allowing - uncertain state (defensive):', { 
    userRole, 
    isImpersonating, 
    loading,
    hasUser: !!user,
    sessionRole: session?.user?.role 
  });

  return (
    <div className="h-full">
      <main className="h-full">
        {children}
      </main>
    </div>
  );
} 
