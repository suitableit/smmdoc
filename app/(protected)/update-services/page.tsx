// import BreadCrumb from '@/components/shared/BreadCrumb';
import UpdateServicesClient from './client';

export default function UpdateServicesPage() {
  // const breadcrumbItems = [
  //   { title: 'Update Services', link: '/dashboard/user/update-services' },
  // ];
  return (
    <div className="h-full">
      <div className="flex flex-col py-6">
        <h1 className="text-2xl font-bold mb-6">Update Services</h1>
        <UpdateServicesClient />
      </div>
    </div>
  );
}
