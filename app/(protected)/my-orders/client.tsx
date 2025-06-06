"use client";

import dynamic from "next/dynamic";

// Dynamic import of client component
const OrdersList = dynamic(() => import('@/components/user/my-orders/ordersList'), {
  ssr: false,
  loading: () => <div className="h-60 flex items-center justify-center">Loading...</div>
});

export default function OrdersListClient() {
  return <OrdersList />;
} 