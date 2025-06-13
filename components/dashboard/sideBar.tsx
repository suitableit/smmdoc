'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import all components to prevent hydration issues
const Image = dynamic(() => import('next/image'), { ssr: false });
const Link = dynamic(() => import('next/link'), { ssr: false });

// Dynamically import SideBarNav to avoid SSR issues
const SideBarNav = dynamic(() => import('./sideBarNav'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-20">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
    </div>
  )
});

interface SideBarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

interface UserData {
  success: boolean;
  data?: {
    name?: string;
    username?: string;
    balance?: number;
    role?: string;
  };
  error?: string;
}

function SideBarContent({ collapsed, setCollapsed, user }: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  user: UserData | null;
}) {
  return (
    <div className={`h-full bg-slate-800 text-white transition-all duration-300 ${collapsed ? 'w-[80px]' : 'w-[280px]'} overflow-hidden`}>
      {/* Sidebar Header with Logo */}
      <div className={`sidebar-header ${collapsed ? 'p-4 flex-col space-y-3' : 'p-4'} flex items-center border-b border-slate-700/50`}>
        {collapsed ? (
          <>
            <Link href={user?.data?.role === 'admin' ? '/admin' : '/dashboard'}>
              <Image 
                src="/favicon.png" 
                alt="Favicon" 
                width={50} 
                height={50} 
                className="object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
                priority={true}
              />
            </Link>
            <button 
              className="p-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] shadow-lg w-10 h-10 flex items-center justify-center text-white rounded-md transition-all duration-300"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Expand sidebar"
            >
              <i className="ri-menu-unfold-line text-lg transition-all duration-300"></i>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center w-full">
              <div className="logo-container w-full flex items-center">
                {user?.data?.role === 'admin' ? (
                  <Link href="/admin">
                    <Image 
                      src="/sit_logo-landscape-dark.png" 
                      alt="Suitable IT Logo" 
                      width={280} 
                      height={60} 
                      className="object-cover w-full h-[40px] cursor-pointer hover:opacity-80 transition-opacity duration-200"
                      priority={true}
                    />
                  </Link>
                ) : user?.data ? (
                  <Link href="/dashboard">
                    <Image 
                      src="/logo.png" 
                      alt="User Logo" 
                      width={280} 
                      height={60} 
                      className="object-cover w-full h-[40px] cursor-pointer hover:opacity-80 transition-opacity duration-200"
                      priority={true}
                    />
                  </Link>
                ) : (
                  <div className="w-full h-[40px] bg-slate-700/50 rounded animate-pulse"></div>
                )}
              </div>
            </div>
            <button 
              className="ml-auto p-2 hover:bg-slate-700 text-white rounded-md transition-all duration-300"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Collapse sidebar"
            >
              <i className="ri-menu-fold-line text-xl transition-all duration-300"></i>
            </button>
          </>
        )}
      </div>
      
      {/* Sidebar Navigation */}
      <div className="sidebar-nav overflow-y-auto overflow-x-hidden h-[calc(100%-6rem)]">
        <SideBarNav collapsed={collapsed} user={user} setOpen={() => {}} />
      </div>
    </div>
  );
}

export default function SideBar({ collapsed: externalCollapsed, setCollapsed: setExternalCollapsed }: SideBarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Use external or internal collapsed state
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = (value: boolean) => {
    setInternalCollapsed(value);
    if (setExternalCollapsed) {
      setExternalCollapsed(value);
    }
  };
  
  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
    
    // Fetch user data on client side
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/current');
        const userData = await response.json();
        
        if (userData.success) {
          setUser(userData);
        } else {
          console.error('Failed to fetch user data:', userData.error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    // Initial fetch
    fetchUser();
    
    // Refresh user data every 30 seconds
    const intervalId = setInterval(() => {
      fetchUser();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Show minimal placeholder during SSR and hydration
  if (!isHydrated) {
    return (
      <div className={`h-full bg-slate-800 transition-all duration-300 ${collapsed ? 'w-[80px]' : 'w-[280px]'}`}>
        <div className="h-full animate-pulse bg-slate-700/20"></div>
      </div>
    );
  }
  
  return <SideBarContent collapsed={collapsed} setCollapsed={setCollapsed} user={user} />;
}