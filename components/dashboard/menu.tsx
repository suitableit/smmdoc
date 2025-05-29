/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/actions/logout';
import Link from 'next/link';

export function Menu({ user }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                user?.photo ||
                '/user-placeholder.jpg'
              }
              alt={user?.name || 'User'}
            />
            <AvatarFallback>{'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* email */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* profile */}
        <Link href={'/dashboard/profile'}>
          <DropdownMenuItem className="cursor-pointer hover:outline-none">
            Profile
            <DropdownMenuSeparator />
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuGroup></DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* logout */}
        <DropdownMenuItem
          className="cursor-pointer hover:outline-none"
          onClick={async () => await logout()}
        >
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
