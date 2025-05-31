'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Eye } from 'lucide-react';
import Link from 'next/link';

type Ticket = {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
};

const dummyTickets: Ticket[] = [
  {
    id: '1',
    subject: 'Order #123 - Issue',
    status: 'open',
    createdAt: '2024-03-20',
  },
  {
    id: '2',
    subject: 'Payment Issue',
    status: 'closed',
    createdAt: '2024-03-19',
  },
];

export default function TicketHistory() {
  return (
    <Card className="w-full mx-auto max-w-6xl mb-10">
      <CardHeader>
        <CardTitle>Ticket History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>#{ticket.id}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      ticket.status === 'open'
                        ? 'default'
                        : ticket.status === 'closed'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {ticket.status === 'open'
                      ? 'Open'
                      : ticket.status === 'closed'
                      ? 'Closed'
                      : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.createdAt}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/dashboard/user/tickets/${ticket.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 