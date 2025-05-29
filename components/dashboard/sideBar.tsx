'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import SideBarNav from './sideBarNav';

interface SideBarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

export default function SideBar({ collapsed: externalCollapsed, setCollapsed: setExternalCollapsed }: SideBarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use external or internal collapsed state
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = (value: boolean) => {
    setInternalCollapsed(value);
    if (setExternalCollapsed) {
      setExternalCollapsed(value);
    }
  };
  
  useEffect(() => {
    // Fetch user data on client side
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/current');
        const userData = await response.json();
        
        if (userData.success) {
          setUser(userData);
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
  
  return (
    <div className={`h-full bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white transition-all duration-300 ${collapsed ? 'w-[80px]' : 'w-[280px]'} overflow-hidden`}>
      {/* Sidebar Header with Logo */}
      <div className={`sidebar-header ${collapsed ? 'p-4 justify-between' : 'p-4'} flex items-center border-b border-slate-700/50`}>
        {!collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="logo-container w-full flex items-center justify-center">
              <Image 
                src="/sit_logo-landscape-dark.png" 
                alt="Suitable IT Logo" 
                width={220} 
                height={60} 
                className="object-contain max-h-[40px]"
              />
            </div>
          </div>
        )}
        
        <button 
          className={`${collapsed ? 'mx-auto' : 'ml-auto'} text-white p-2 rounded-md transition-all ${collapsed ? 'bg-gradient-to-br from-blue-600 to-teal-400 shadow-md' : 'hover:bg-white/10'}`}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`${collapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'} text-[20px]`}></i>
        </button>
      </div>
      
      {/* Sidebar Navigation */}
      <div className="sidebar-nav mt-0 overflow-y-auto overflow-x-hidden h-[calc(100%-4rem)]">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <SideBarNav collapsed={collapsed} user={user} setOpen={() => {}} />
        )}
      </div>
      
      {/* Add custom font for handwritten style */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Dancing+Script:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}
