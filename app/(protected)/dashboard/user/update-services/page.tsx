import BreadCrumb from '@/components/shared/BreadCrumb';
import { Separator } from '@/components/ui/separator';
import UpdateServiceTable from '@/components/user/services/updateService/updateServiceTable';

export default function page() {
  const breadcrumbItems = [
    { title: 'Update Services', link: '/dashboard/user/update-services' },
  ];
  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className=" py-10">
        <UpdateServiceTable />
      </div>
    </div>
  );
}
