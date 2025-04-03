'use client';
import EditCategory from '@/components/admin/categories/editCategory';
import BreadCrumb from '@/components/shared/BreadCrumb';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Page() {
  const searchParams = useParams();
  const { id } = searchParams as { id: string };
  const breadcrumbItems = [
    { title: 'Edit Category', link: '/dashboard/admin/categories' },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
        <Button asChild variant="default" size="sm">
          <Link
            href="/dashboard/admin/categories"
            className="animation animate-pulse"
          >
            View All Categories <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col items-center justify-center py-10">
        <EditCategory id={id} />
      </div>
    </ScrollArea>
  );
}
