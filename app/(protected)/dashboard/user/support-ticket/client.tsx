'use client';

import dynamic from 'next/dynamic';

const TicketForm = dynamic(
  () => import('@/components/user/support-ticket/ticketForm'),
  {
    ssr: false,
  }
);

const ticketsHistory = dynamic(
  () => import('@/components/user/support-ticket/ticketsHistory'),
  {
    ssr: false,
  }
);

export default function TicketClient() {
  return (
    <div className="space-y-6">
      <TicketForm />
      <ticketsHistory />
    </div>
  );
}
