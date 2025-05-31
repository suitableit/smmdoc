"use client";

import MassOrderClient from './client';

export default function MassOrderPage() {
  return (
    <div className="h-full">
      <div className="flex flex-col py-3 md:py-4">
        <h1 className="text-2xl font-bold mb-4 md:mb-5">Mass Order</h1>
        <MassOrderClient />
      </div>
    </div>
  );
}