// import BreadCrumb from '@/components/shared/BreadCrumb';
import { AddFundForm } from '@/components/user/addFund/addFunds';

export default function page() {
  // const breadcrumbItems = [
  //   { title: 'Add Funds', link: '/dashboard/user/add-funds' },
  // ];
  return (
    <div className="h-full">
      <div className="flex flex-col py-6">
        <h1 className="text-2xl font-bold mb-6">Add Funds</h1>
        <AddFundForm />
      </div>
    </div>
  );
}
