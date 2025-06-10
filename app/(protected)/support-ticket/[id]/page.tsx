'use client';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
// import BreadCrumb from '@/components/shared/BreadCrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export default function TicketDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/Ticket/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setTicket(data);
        } else {
          toast.error('Failed to fetch ticket details');
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
        toast.error('Error fetching ticket details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTicket();
    }
  }, [params.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/Ticket/${params.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, message],
              }
            : null
        );
        setNewMessage('');
        toast.success('Message sent successfully');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading ticket details...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg text-red-600">Ticket not found</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex flex-col py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ticket Details</h1>
          <Button variant="outline" size="sm" asChild>
            <Link
              href="/support-ticket/history"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ticket
            </Link>
          </Button>
        </div>
        <Card className="w-full mx-auto max-w-6xl font-nunito">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black font-nunito">
                Ticket #{params.id}
              </CardTitle>
              <Badge className="font-nunito">Open</Badge>
            </div>
            <CardDescription className="text-black font-nunito">
              Order #123 Issue - March 20, 2024
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-black font-nunito">
                  My order hasn't been delivered yet. Please check.
                </p>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg ml-8">
                <p className="text-sm text-black font-nunito">
                  Dear customer, your order is being processed. It will be
                  delivered soon.
                </p>
                <p className="text-xs text-black mt-2 font-nunito">
                  Support Team - March 20, 2024
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder="Write your reply..."
                className="min-h-[100px] text-black font-nunito"
              />
              <Button className="w-full font-nunito">Send Reply</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
