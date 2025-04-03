/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { navItems } from '@/data/side-nav-items';
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';
import SideBarNav from './sideBarNav';
export default function MobileSidebar({ user }: any) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MenuIcon />
        </SheetTrigger>
        <SheetTitle></SheetTitle>
        <SheetContent side="left" className="!px-0">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Overview
              </h2>
              <div className="space-y-1">
                <SideBarNav items={navItems} user={user} setOpen={setOpen} />
              </div>
            </div>
          </div>
        </SheetContent>
        <SheetDescription></SheetDescription>
      </Sheet>
    </>
  );
}
