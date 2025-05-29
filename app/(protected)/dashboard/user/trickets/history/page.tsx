import BreadCrumb from '@/components/shared/BreadCrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function TicketHistoryPage() {
  const breadcrumbItems = [
    { title: 'Ticket History', link: '/dashboard/user/trickets/history' },
  ];
  
  // Load ticket history from API
  const demoTickets = [
    {
      id: 'TCK-001',
      subject: 'Question about service',
      status: 'open',
      createdAt: '25 May, 2023',
      lastUpdated: '26 May, 2023'
    },
    {
      id: 'TCK-002',
      subject: 'Payment issue',
      status: 'closed',
      createdAt: '10 June, 2023',
      lastUpdated: '12 June, 2023'
    },
    {
      id: 'TCK-003',
      subject: 'Order update needed',
      status: 'pending',
      createdAt: '05 July, 2023',
      lastUpdated: '07 July, 2023'
    }
  ];
  
  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className="py-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">Ticket History</h2>
          <Button asChild>
            <Link href="/dashboard/user/trickets">Create New Ticket</Link>
          </Button>
        </div>
        
        {demoTickets.length > 0 ? (
          <div className="space-y-4">
            {demoTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-medium">{ticket.subject}</CardTitle>
                    <div className="text-sm text-gray-500">Ticket ID: {ticket.id}</div>
                  </div>
                  <Badge className={
                    ticket.status === 'open' ? 'bg-green-500' : 
                    ticket.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                  }>
                    {
                      ticket.status === 'open' ? 'Active' : 
                      ticket.status === 'pending' ? 'Pending' : 'Closed'
                    }
                  </Badge>
                </CardHeader>
                <CardContent className="px-6 py-3">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Created Date</span>
                      <span className="text-sm">{ticket.createdAt}</span>
                    </div>
                    <div className="flex flex-col mt-2 sm:mt-0">
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <span className="text-sm">{ticket.lastUpdated}</span>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/user/trickets/view/${ticket.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-gray-500 mb-4">No ticket history found</p>
              <Button asChild>
                <Link href="/dashboard/user/trickets">Create Your First Ticket</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}