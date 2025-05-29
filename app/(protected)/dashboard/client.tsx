'use client';

import dynamic from 'next/dynamic';

// Client component 
const UserDashboard = dynamic(() => import('@/components/dashboard/userDashboard'), { 
  ssr: false,
  loading: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
      ))}
    </div>
  )
});

export default function DashboardClient() {
  return <UserDashboard />;
} 