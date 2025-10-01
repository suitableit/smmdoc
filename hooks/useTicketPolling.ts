import { useEffect, useRef, useState } from 'react';

interface TicketMessage {
  id: string;
  content: string;
  author: string;
  authorRole?: 'user' | 'admin';
  type?: 'customer' | 'staff' | 'system';
  createdAt: string;
  userImage?: string;
  attachments?: {
    id: string;
    filename: string;
    url: string;
    size?: number;
    type?: string;
  }[];
}

interface TicketDetails {
  id: string;
  messages: TicketMessage[];
  lastUpdated: string;
  status?: string;
  userInfo?: {
    name?: string;
    username?: string;
    fullName?: string;
    phone?: string;
    company?: string;
    address?: string;
    registeredAt?: string;
  };
}

export const useTicketPolling = <T extends TicketDetails>(
  ticketId: string | null,
  ticketDetails: T | null,
  setTicketDetails: (details: T) => void,
  interval: number = 5000,
  apiEndpoint: 'admin' | 'user' = 'admin'
) => {
  const [isPolling, setIsPolling] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [hasStatusChange, setHasStatusChange] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<string>('');
  const lastStatusRef = useRef<string>('');

  const pollTicketUpdates = async () => {
    if (!ticketId) return;

    try {
      setIsPolling(true);
      const apiUrl = apiEndpoint === 'admin' 
        ? `/api/admin/tickets/${ticketId}` 
        : `/api/support-tickets/${ticketId}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket updates');
      }

      const result = await response.json();
      const updatedTicket: T = apiEndpoint === 'admin' ? result.ticket : result;
      
      // Check if there are new messages or status changes
      const currentMessageCount = updatedTicket.messages?.length || 0;
      const currentStatus = updatedTicket.status;
      const hasUpdates = updatedTicket.lastUpdated !== lastUpdateRef.current;
      
      if (hasUpdates) {
        // Check if message count increased (new messages)
        if (currentMessageCount > lastMessageCount) {
          setHasNewMessages(true);
        }
        
        // Check if status changed
        if (currentStatus !== lastStatusRef.current && lastStatusRef.current !== '') {
          setHasStatusChange(true);
        }
        
        setLastMessageCount(currentMessageCount);
        lastUpdateRef.current = updatedTicket.lastUpdated;
        lastStatusRef.current = currentStatus || '';
        
        // Enhance the data with userInfo like in the initial fetch (only for admin)
        if (apiEndpoint === 'admin') {
          const enhancedData = {
            ...updatedTicket,
            userInfo: {
              ...updatedTicket.userInfo,
              fullName: updatedTicket.userInfo?.name || 'N/A',
              username: updatedTicket.userInfo?.username,
              phone: 'N/A', // Not available in current schema
              company: 'N/A', // Not available in current schema
              address: 'N/A', // Not available in current schema
              registeredAt: 'N/A', // Would need user creation date
            }
          };
          setTicketDetails(enhancedData);
        } else {
          setTicketDetails(updatedTicket);
        }
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

  // Reset status change indicator
  const markStatusChangeAsRead = () => {
    setHasStatusChange(false);
  };

  // Initialize state with current ticket details
  useEffect(() => {
    if (ticketDetails) {
      setLastMessageCount(ticketDetails.messages?.length || 0);
      lastUpdateRef.current = ticketDetails.lastUpdated;
      lastStatusRef.current = ticketDetails.status || '';
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
    hasStatusChange,
    markMessagesAsRead,
    markStatusChangeAsRead,
    startPolling,
    stopPolling,
    pollTicketUpdates // Manual poll trigger
  };
};

export default useTicketPolling;