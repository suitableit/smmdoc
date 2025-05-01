import BreadCrumb from '@/components/shared/BreadCrumb';
import { Separator } from '@/components/ui/separator';
import UserServiceTable from '@/components/user/services/services';

export default function page() {
  const breadcrumbItems = [
    { title: 'New Service', link: '/dashboard/user/services' },
  ];
  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className=" py-10">
        <UserServiceTable />
      </div>
    </div>
  );
}
