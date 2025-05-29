'use client';

import Header from '@/components/dashboard/header';
import MobileSidebar from '@/components/dashboard/mobile-siderbar';
import SideBar from '@/components/dashboard/sideBar';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <div className="flex min-h-screen">
      {/* Left sidebar - fixed black sidebar */}
      <div className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 bg-gradient-to-br from-[#0f172a] to-[#1e293b] transition-all duration-300 ${sidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>
        <SideBar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>
      
      {/* Right side content with header and main content */}
      <div className={`flex flex-col w-full transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'}`}>
        {/* Top header bar */}
        <div className={`fixed top-0 right-0 z-40 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-[calc(100%-80px)]' : 'lg:w-[calc(100%-280px)]'} w-full bg-white dark:bg-slate-800 border-b`}>
          <Header />
        </div>
        
        {/* Main content area */}
        <main className="w-full mt-16">
          <div className={isDashboard ? 'p-0' : 'p-2 md:p-3 lg:p-4'}> 
            <div className="flex items-center justify-between lg:hidden mb-2">
              <div className="flex items-center">
                <MobileSidebar />
                <span className="ml-3 font-semibold text-lg">SMM Panel</span>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
