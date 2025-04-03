/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import { Icons } from './icon';

export default function BreadCrumb({ items }: any) {
  return (
    <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href={'/dashboard'}
        className="overflow-hidden text-ellipsis whitespace-nowrap"
      >
        Dashboard
      </Link>
      {items.map((item: any, index: any) => (
        <React.Fragment key={item.title}>
          <Icons.chevronRight className="w-4 h-4" />
          <Link
            href={item.link}
            className={cn(
              'font-medium',
              index === items.length - 1
                ? 'text-foreground pointer-events-none'
                : 'text-muted-foreground'
            )}
          >
            {item.title}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}
