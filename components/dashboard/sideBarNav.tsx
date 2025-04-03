'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../shared/icon';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SideBarNav({ items, user, setOpen = () => {} }: any) {
  const path = usePathname();
  const pathId = path.split('/').slice(0, -1).join('/');

  if (!items?.length) {
    return null;
  }

  return (
    <nav className="grid items-start gap-2">
      {items
        .filter((item: any) => item.roles.includes(user?.role))
        .map((item: any, index: any) => {
          const Icon = Icons[item.icon as keyof typeof Icons];
          return (
            item.href && (
              <Link key={index} href={item.disabled ? '/' : item.href}>
                <span
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    path === item.href ||
                      path === item.href2 ||
                      pathId === item.href
                      ? 'bg-accent'
                      : 'transparent',
                    item.disabled && 'cursor-not-allowed opacity-80'
                  )}
                  onClick={() => setOpen(!setOpen)}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        'mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground',
                        path === item.href ||
                          path === item.href2 ||
                          pathId === item.href
                          ? 'text-orange-600'
                          : 'text-muted-foreground group-hover:text-accent-foreground'
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'font-bold leading-none',
                      path === item.href ||
                        path === item.href2 ||
                        pathId === item.href
                        ? 'text-orange-600'
                        : 'text-muted-foreground group-hover:text-accent-foreground'
                    )}
                  >
                    {item.title}
                  </span>
                </span>
              </Link>
            )
          );
        })}
    </nav>
  );
}
