import BreadCrumb from '@/components/shared/BreadCrumb';
import { Separator } from '@/components/ui/separator';
import TricketForm from '@/components/user/tricketSupport/tricketForm';

export default function page() {
  const breadcrumbItems = [
    { title: 'Submit Tricket', link: '/dashboard/user/trickets' },
  ];
  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className="py-10">
        <TricketForm />
      </div>
    </div>
  );
}
