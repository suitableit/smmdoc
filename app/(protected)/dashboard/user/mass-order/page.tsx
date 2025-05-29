import BreadCrumb from '@/components/shared/BreadCrumb';
import { Separator } from '@/components/ui/separator';
import MassOrderClient from './client';

export default function MassOrderPage() {
  const breadcrumbItems = [
    { title: 'Mass Order', link: '/dashboard/user/mass-order' },
  ];
  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className="flex flex-col py-10">
        <h1 className="text-2xl font-bold mb-6">Mass Order</h1>
        <MassOrderClient />
      </div>
    </div>
  );
} 