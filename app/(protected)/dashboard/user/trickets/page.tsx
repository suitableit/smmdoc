// import BreadCrumb from '@/components/shared/BreadCrumb';
import TicketsClient from './client';

export default function TicketsPage() {
  // const breadcrumbItems = [
  //   { title: 'Tickets', link: '/dashboard/user/trickets' },
  // ];
  return (
    <div className="h-full">
      <div className="flex flex-col py-6">
        <h1 className="text-2xl font-bold mb-6">Tickets</h1>
        <TicketsClient />
      </div>
    </div>
  );
}
