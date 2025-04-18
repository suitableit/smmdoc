import BreadCrumb from '@/components/shared/BreadCrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import NewOrder from '@/components/user/new-order/newOrder';

export default function page() {
  const breadcrumbItems = [
    { title: 'New Order', link: '/dashboard/user/new-order' },
  ];
  return (
    <ScrollArea className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className="flex flex-col py-10">
        <NewOrder />
      </div>
    </ScrollArea>
  );
}
