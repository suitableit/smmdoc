'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RouteGuard } from '@/components/admin/route-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
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
