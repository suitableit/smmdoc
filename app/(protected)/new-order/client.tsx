"use client";

import dynamic from "next/dynamic";
const NewOrderComponent = dynamic(() => import('./page'), {
  ssr: false,
  loading: () => <div className="h-60 flex items-center justify-center">Loading...</div>
});

export default function NewOrderClient() {
  return <NewOrderComponent />;
} 