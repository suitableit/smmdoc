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
    // Fetch user data on client side
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

  // If we're on the root dashboard path and the user is loaded
  if (isDashboard && !loading && user) {
    // If user is admin, render admin dashboard, otherwise render user dashboard
    if (user.role === 'ADMIN' || user.role === 'admin') {
      // Import is done dynamically to avoid server/client mismatch
      const AdminDashboard = require('../admin/page').default;
      return <AdminDashboard />;
    }
  }

  // For all other cases, render the children
  return (
    <div className="h-full">
      <main className="h-full">
        {children}
      </main>
    </div>
  );
} 