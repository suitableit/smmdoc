'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { hasPermission } from '@/lib/permissions';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard component that checks if the current user has permission to access the route
 * Redirects to /admin if the user doesn't have permission
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/sign-in');
      return;
    }

    const userRole = session.user.role;
    const userPermissions = (session.user as any)?.permissions as string[] | null | undefined;

    // Normalize pathname for comparison
    const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
      ? pathname.slice(0, -1) 
      : pathname;

    // Don't redirect if already on admin dashboard (moderators should always have access)
    if (normalizedPath === '/admin') {
      return;
    }

    // Check if user has permission to access this route using normalized path
    const hasAccess = hasPermission(userRole, userPermissions, normalizedPath);
    
    if (!hasAccess) {
      router.push('/admin');
    }
  }, [session, pathname, router, status]);

  // Show loading state while checking
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Don't render children if user doesn't have permission (will redirect)
  if (session?.user) {
    const userRole = session.user.role;
    const userPermissions = (session.user as any)?.permissions as string[] | null | undefined;
    
    // Normalize pathname for permission check
    const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
      ? pathname.slice(0, -1) 
      : pathname;
    
    if (!hasPermission(userRole, userPermissions, normalizedPath)) {
      return null;
    }
  }

  return <>{children}</>;
}

