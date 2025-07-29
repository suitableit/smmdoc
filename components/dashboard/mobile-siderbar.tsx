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
import Image from 'next/image';
import Link from 'next/link';
import SideBarNav from './sideBarNav';

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

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 text-slate-600 hover:text-slate-800 transition-colors">
          <span className="sr-only">Open menu</span>
          <MenuIcon className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 bg-slate-800 text-white w-[280px]"
      >
        {/* Mobile Sidebar Header with Logo */}
        <SheetHeader className="p-4 flex items-center border-b border-slate-700/50">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex items-center w-full">
            <div className="logo-container w-full flex items-center">
              <Link href="/" onClick={() => setOpen(false)}>
                <Image 
                  src="/logo.png" 
                  alt="SMMDOC Logo" 
                  width={280} 
                  height={60} 
                  className="object-cover w-full h-[40px] cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  priority={true}
                />
              </Link>
            </div>
          </div>
        </SheetHeader>

        {/* Mobile Sidebar Navigation */}
        <div className="sidebar-nav overflow-y-auto overflow-x-hidden h-[calc(100vh-6rem)]">
          <SideBarNav user={user} setOpen={setOpen} />
        </div>
      </SheetContent>
    </Sheet>
  );
}