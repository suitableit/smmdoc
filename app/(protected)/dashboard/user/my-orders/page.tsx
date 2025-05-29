"use client";

import BreadCrumb from '@/components/shared/BreadCrumb';
import { Separator } from '@/components/ui/separator';
import OrdersListClient from './client';

export default function MyOrdersPage() {
  const breadcrumbItems = [
    { title: 'My Orders', link: '/dashboard/user/my-orders' },
  ];
  
  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className="flex flex-col py-6">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <OrdersListClient />
      </div>
    </div>
  );
}
