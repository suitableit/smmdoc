'use client';

import Header from '@/components/dashboard/header/page';
import SideBar from '@/components/dashboard/sideBar';
import Announcements from '@/components/dashboard/announcements';
import { checkSessionValidity, setupSessionInvalidationListener } from '@/lib/session-invalidation';
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === '/dashboard';
  const isAdminPage = pathname?.startsWith('/admin');
  const { data: session, status } = useSession();
  const [isValidating, setIsValidating] = useState(true);

  const userPages = [
    '/dashboard',
    '/my-orders',
    '/new-order',
    '/transactions',
    '/add-funds',
    '/transfer-funds',
    '/account-settings',
    '/services',
    '/support-tickets',
    '/affiliate',
    '/child-panel',
    '/api',
    '/mass-orders',
    '/contact-support',
    '/verify-payment',
  ];

  const isUserPage = userPages.some(page => 
    pathname === page || pathname?.startsWith(page + '/')
  );

  useEffect(() => {
    if (status === 'loading' || isValidating) return;

    if (session?.user && isUserPage && !isAdminPage) {
      const userRole = session.user.role;
      if (userRole === 'admin' || userRole === 'moderator') {
        router.push('/admin');
        return;
      }
    }
  }, [session, pathname, isUserPage, isAdminPage, router, status, isValidating]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    const validateSessionOnMount = async () => {
      setIsValidating(true);
      
      try {
        if (status === 'unauthenticated') {
          const { clearAllSessionData } = await import('@/lib/logout-helper');
          clearAllSessionData();
          setIsValidating(false);
          window.location.href = '/sign-in';
          return;
        }
        
        if (status === 'authenticated' && session?.user?.id) {
          try {
            const response = await fetch('/api/auth/session-check', {
              method: 'GET',
              credentials: 'include',
              cache: 'no-store',
            });
            
            if (response.ok) {
              const data = await response.json();
              
              if (!data.valid || !data.session) {
                console.log('Session invalid on mount, clearing and redirecting...');
                const { clearAllSessionData } = await import('@/lib/logout-helper');
                clearAllSessionData();
                setIsValidating(false);
                await signOut({ callbackUrl: '/sign-in', redirect: true });
                return;
              }
            } else {
              console.warn('Session check failed with status:', response.status, '- continuing anyway');
            }
          } catch (error) {
            console.warn('Session check network error (will continue):', error);
          }
        } else if (status === 'authenticated' && !session?.user?.id) {
          console.log('Session missing user data, clearing and redirecting...');
          const { clearAllSessionData } = await import('@/lib/logout-helper');
          clearAllSessionData();
          setIsValidating(false);
          await signOut({ callbackUrl: '/sign-in', redirect: true });
          return;
        }
      } catch (error) {
        console.error('Error validating session on mount:', error);
        const { clearAllSessionData } = await import('@/lib/logout-helper');
        clearAllSessionData();
        setIsValidating(false);
        window.location.href = '/sign-in';
      } finally {
        setIsValidating(false);
      }
    };

    validateSessionOnMount();
  }, [status, session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || isValidating) return;

    const cleanup = setupSessionInvalidationListener(
      session.user.id,
      async () => {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        await signOut({ callbackUrl: '/sign-in', redirect: true });
      }
    );

    return cleanup;
  }, [session?.user?.id, isValidating]);

  useEffect(() => {
    if (!session?.user?.id || isValidating) return;

    const checkInterval = setInterval(async () => {
      try {
        const isValid = await checkSessionValidity();
        if (!isValid) {
          console.log('Session is no longer valid, logging out...');
          if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
          }
          await signOut({ callbackUrl: '/sign-in', redirect: true });
        }
      } catch (error) {
        console.error('Error checking session validity (will retry):', error);
      }
    }, 30000);

    return () => clearInterval(checkInterval);
  }, [session?.user?.id, isValidating]);


  if (status === 'unauthenticated' || !session?.user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
    return null;
  }

  if (session?.user && isUserPage && !isAdminPage) {
    const userRole = session.user.role;
    if (userRole === 'admin' || userRole === 'moderator') {
      return null;
    }
  }

  return (
    <div className="flex min-h-screen">
      <div
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 bg-gradient-to-br from-[#0f172a] to-[#1e293b] transition-all duration-300 ${
          sidebarCollapsed ? 'w-[80px]' : 'w-[280px]'
        }`}
      >
        <SideBar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          session={session}
        />
      </div>

      <div
        className={`flex flex-col w-full transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'
        }`}
      >
        <div
          className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
            sidebarCollapsed
              ? 'lg:w-[calc(100%-80px)]'
              : 'lg:w-[calc(100%-280px)]'
          } w-full bg-white dark:bg-slate-800`}
        >
          <Header />
        </div>

        <main className="w-full mt-16 lg:mt-20">
          <div
            className={
              isDashboard
                ? 'p-0'
                : 'px-4 sm:px-8 py-4 sm:py-8 bg-[var(--page-bg)] dark:bg-[var(--page-bg)]'
            }
          >
            {/* Show announcements for users (non-admin, non-moderator) on non-dashboard pages */}
            {session?.user?.role !== 'admin' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'moderator' && session?.user?.role !== 'MODERATOR' && !isDashboard && (
              <Announcements visibility="all_pages" />
            )}
            {/* Show announcements for admin users on admin pages (except admin dashboard) */}
            {(session?.user?.role === 'admin' || session?.user?.role === 'ADMIN') && isAdminPage && pathname !== '/admin' && (
              <Announcements visibility="all_pages" />
            )}
            {/* Show announcements for moderators on admin pages (except admin dashboard) */}
            {(session?.user?.role === 'moderator' || session?.user?.role === 'MODERATOR') && isAdminPage && pathname !== '/admin' && (
              <Announcements visibility="all_pages" />
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
