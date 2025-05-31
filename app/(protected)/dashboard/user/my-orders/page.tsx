"use client";

// import BreadCrumb from '@/components/shared/BreadCrumb';
import OrdersListClient from './client';

export default function MyOrdersPage() {
  // const breadcrumbItems = [
  //   { title: 'My Orders', link: '/dashboard/user/my-orders' },
  // ];
  
  return (
    <div className="h-full">
      <div className="flex flex-col py-6">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <OrdersListClient />
      </div>
    </div>
  );
}
