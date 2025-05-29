"use client";

import dynamic from "next/dynamic";

// Dynamic import of client component
const MassOrderComponent = dynamic(() => import('@/components/user/mass-order/massOrder'), {
  ssr: false,
  loading: () => <div className="h-60 flex items-center justify-center">Loading...</div>
});

export default function MassOrderClient() {
  return <MassOrderComponent />;
} 