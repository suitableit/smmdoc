import BreadCrumb from '@/components/shared/BreadCrumb';
import { Separator } from '@/components/ui/separator';
import NewOrderClient from './client';

export default function NewOrderPage() {
  const breadcrumbItems = [
    { title: 'New Order', link: '/dashboard/user/new-order' },
  ];
  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className="flex flex-col py-10">
        <h1 className="text-2xl font-bold mb-6">New Order</h1>
        <NewOrderClient />
      </div>
    </div>
  );
}
    