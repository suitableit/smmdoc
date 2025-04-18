import BreadCrumb from '@/components/shared/BreadCrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AddFundForm } from '@/components/user/addFund/addFunds';

export default function page() {
  const breadcrumbItems = [
    { title: 'Add Fund', link: '/dashboard/user/add-funds' },
  ];
  return (
    <ScrollArea className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className="flex flex-col py-10">
        <AddFundForm />
      </div>
    </ScrollArea>
  );
}
