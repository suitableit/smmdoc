"use client";

import dynamic from "next/dynamic";

// Dynamic import of client component
const NewOrderComponent = dynamic(() => import('@/components/user/new-order/newOrder'), {
  ssr: false,
  loading: () => <div className="h-60 flex items-center justify-center">Loading...</div>
});

export default function NewOrderClient() {
  return <NewOrderComponent />;
} 