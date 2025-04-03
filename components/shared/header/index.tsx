import LogoutButton from '@/components/logout';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/lib/actions/auth';
import { APP_NAME } from '@/lib/constants';
import { UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ModeToggle } from './mode-Toggle';

export default async function Header() {
  const user = await currentUser();
  return (
    <header className="w-full main-container">
      <div className="flex-between wrapper mt-2 lg:mt-4">
        <div className="flex-start">
          <Link href="/" className="flex-start">
            <Image
              src="/logo.png"
              alt={`${APP_NAME}`}
              width={42}
              height={42}
              priority={true}
            />
            <span className="hidden lg:block font-bold text-2xl ml-3 uppercase">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <div className="space-x-4">
          <ModeToggle />
          {!user ? (
            <Button asChild>
              <Link href="/sign-in">
                <UserIcon /> Sign In
              </Link>
            </Button>
          ) : (
            <LogoutButton />
          )}
        </div>
      </div>
    </header>
  );
}
