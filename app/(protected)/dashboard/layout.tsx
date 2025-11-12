'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';
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

  if (isDashboard && !loading && user) {
    if (user.role === 'ADMIN' || user.role === 'admin') {
      const AdminDashboard = require('../admin/page').default;
      return <AdminDashboard />;
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
