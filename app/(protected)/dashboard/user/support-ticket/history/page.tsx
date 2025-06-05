'use client';

import { useEffect, useState } from 'react';
// import BreadCrumb from '@/components/shared/BreadCrumb';
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
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

export default function ticketsHistoryPage() {
  const [Ticket, setTicket] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // const breadcrumbItems = [
  //   { title: 'Tickets History', link: '/dashboard/user/ticket/history' },
  // ];

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch('/api/Ticket');
        if (response.ok) {
          const data = await response.json();
          setTicket(data);
        } else {
          toast.error('Failed to fetch Ticket');
        }
      } catch (error) {
        console.error('Error fetching Ticket:', error);
        toast.error('Error fetching Ticket');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchTicket();
    }
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800';
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-col py-6">
        <h1 className="text-2xl font-bold mb-6">Tickets History</h1>
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>Your Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black font-nunito">
                    Ticket ID
                  </TableHead>
                  <TableHead className="text-black font-nunito">
                    Subject
                  </TableHead>
                  <TableHead className="text-black font-nunito">
                    Status
                  </TableHead>
                  <TableHead className="text-black font-nunito">Date</TableHead>
                  <TableHead className="text-right text-black font-nunito">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-black font-nunito"
                    >
                      Loading Ticket...
                    </TableCell>
                  </TableRow>
                ) : Ticket.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-black font-nunito"
                    >
                      No information was found for you.
                    </TableCell>
                  </TableRow>
                ) : (
                  Ticket.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="text-black font-nunito">
                        #{ticket.id}
                      </TableCell>
                      <TableCell className="text-black font-nunito">
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ticket.status === 'OPEN'
                              ? 'default'
                              : ticket.status === 'CLOSED'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="font-nunito"
                        >
                          {ticket.status === 'OPEN'
                            ? 'Open'
                            : ticket.status === 'CLOSED'
                            ? 'Closed'
                            : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-black font-nunito">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/user/ticket/${ticket.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
