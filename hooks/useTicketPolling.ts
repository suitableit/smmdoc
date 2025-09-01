import { useEffect, useRef, useState } from 'react';

interface TicketMessage {
  id: string;
  content: string;
  author: string;
  authorRole?: 'user' | 'admin';
  type?: 'customer' | 'staff' | 'system';
  createdAt: string;
  userImage?: string;
  attachments?: any[];
}

interface TicketDetails {
  id: string;
  messages: TicketMessage[];
  lastUpdated: string;
  [key: string]: any;
}

export const useTicketPolling = (
  ticketId: string | null,
  ticketDetails: TicketDetails | null,
  setTicketDetails: (details: TicketDetails) => void,
  interval: number = 5000
) => {
  const [isPolling, setIsPolling] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<string>('');

  const pollTicketUpdates = async () => {
    if (!ticketId) return;

    try {
      setIsPolling(true);
      const response = await fetch(`/api/support-tickets/${ticketId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket updates');
      }

      const updatedTicket: TicketDetails = await response.json();
      
      // Check if there are new messages
      const currentMessageCount = updatedTicket.messages?.length || 0;
      const hasUpdates = updatedTicket.lastUpdated !== lastUpdateRef.current;
      
      if (hasUpdates) {
        // Check if message count increased (new messages)
        if (currentMessageCount > lastMessageCount) {
          setHasNewMessages(true);
        }
        
        setLastMessageCount(currentMessageCount);
        lastUpdateRef.current = updatedTicket.lastUpdated;
        
        setTicketDetails(updatedTicket);
      }
    } catch (error) {
      console.error('Error polling ticket updates:', error);
    } finally {
      setIsPolling(false);
    }
  };

  // Start polling
  const startPolling = () => {
    if (intervalRef.current) return; // Already polling
    
    intervalRef.current = setInterval(pollTicketUpdates, interval);
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset new messages indicator
  const markMessagesAsRead = () => {
    setHasNewMessages(false);
  };

  // Initialize state with current ticket details
  useEffect(() => {
    if (ticketDetails) {
      setLastMessageCount(ticketDetails.messages?.length || 0);
      lastUpdateRef.current = ticketDetails.lastUpdated;
    }
  }, [ticketDetails]);

  // Initialize polling when conditions are met
  useEffect(() => {
    if (ticketId) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [ticketId, interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    isPolling,
    hasNewMessages,
    markMessagesAsRead,
    startPolling,
    stopPolling,
    pollTicketUpdates // Manual poll trigger
  };
};

export default useTicketPolling;