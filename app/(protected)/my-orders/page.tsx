"use client";

// import BreadCrumb from '@/components/shared/BreadCrumb';
import OrdersListClient from './client';

export default function MyOrdersPage() {
  // const breadcrumbItems = [
  //   { title: 'My Orders', link: '/dashboard/user/my-orders' },
  // ];
  
  return (
    <div className="h-full">
        <OrdersListClient />
    </div>
  );
}
