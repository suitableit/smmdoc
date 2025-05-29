import BreadCrumb from '@/components/shared/BreadCrumb';
import { Separator } from '@/components/ui/separator';

export default async function page() {
  const breadcrumbItems = [
    { title: 'All Orders', link: '/dashboard/admin/orders' },
  ];

  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className="flex flex-col items-center justify-center py-10">
        {/* <ServiceTable /> */}
        <h1 className="text-2xl font-bold">All Orders Here</h1>
      </div>
    </div>
  );
}
