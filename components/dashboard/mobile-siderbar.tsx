/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import SideBarNav from './sideBarNav';

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2">
          <span className="sr-only">Open menu</span>
          <MenuIcon className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <SheetHeader className="p-4 border-b border-slate-700/50">
          <SheetTitle className="text-white flex items-center">
            <div className="logo bg-gradient-to-br from-blue-600 to-teal-400 rounded-md w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg relative overflow-hidden">
              SIT
              <div className="absolute w-3 h-3 bg-white/30 rounded-full -bottom-1 -right-1"></div>
            </div>
            <span className="ml-3">SMM Panel</span>
          </SheetTitle>
        </SheetHeader>
        <div className="py-2">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
            </div>
          ) : (
            <SideBarNav user={user} setOpen={setOpen} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
