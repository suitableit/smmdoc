import EditCategory from '@/components/admin/categories/editCategory';
import BreadCrumb from '@/components/shared/BreadCrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Eye } from 'lucide-react';
import Link from 'next/link';

export default function page() {
  const breadcrumbItems = [
    { title: 'Edit Category', link: '/admin/categories' },
  ];

  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
        <Button asChild variant="default" size="sm">
          <Link href="/admin/categories" className="animation animate-pulse">
            View All Categories <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col items-center justify-center py-10">
        <EditCategory />
      </div>
    </div>
  );
}
