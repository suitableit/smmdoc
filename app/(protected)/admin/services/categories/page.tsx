import CategoriesTable from '@/components/admin/categories/categoriesTable';
import BreadCrumb from '@/components/shared/BreadCrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function page() {
  const breadcrumbItems = [
    { title: 'All Categories', link: '/admin/categories' },
  ];
  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
        <Button asChild variant="default" size="sm">
          <Link
            href="/admin/categories/create-category"
            className="animation animate-pulse"
          >
            Create Category <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col items-center justify-center py-10">
        <CategoriesTable />
      </div>
    </div>
  );
}
