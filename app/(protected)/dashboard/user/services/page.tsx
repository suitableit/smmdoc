// import BreadCrumb from '@/components/shared/BreadCrumb';
import ServicesClient from './client';

export default function ServicesPage() {
  // const breadcrumbItems = [
  //   { title: 'Services', link: '/dashboard/user/services' },
  // ];
  return (
    <div className="h-full">
      <div className="flex flex-col py-6">
        <h1 className="text-2xl font-bold mb-6">Services</h1>
        <ServicesClient />
      </div>
    </div>
  );
}