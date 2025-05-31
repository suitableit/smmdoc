'use client';

import dynamic from 'next/dynamic';

const TicketForm = dynamic(() => import('@/components/user/ticketSupport/ticketForm'), {
  ssr: false,
});

const TicketHistory = dynamic(() => import('@/components/user/ticketSupport/ticketHistory'), {
  ssr: false,
});

export default function TicketsClient() {
  return (
    <div className="space-y-6">
      <TicketForm />
      <TicketHistory />
    </div>
  );
}