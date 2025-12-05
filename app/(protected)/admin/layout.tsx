'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RouteGuard } from '@/components/admin/route-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
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
    if (status === 'loading') return;

    if (!session) {
      router.push('/sign-in');
      return;
    }

    if (!session.user || (session.user.role !== 'admin' && session.user.role !== 'moderator')) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <RouteGuard>
        {children}
      </RouteGuard>
    );
  }

  if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'moderator')) {
    return null;
  }

  return (
    <RouteGuard>
      {children}
    </RouteGuard>
  );
}
