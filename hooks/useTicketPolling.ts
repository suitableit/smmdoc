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
  interval: number = 5000,
  apiEndpoint: 'admin' | 'user' = 'admin'
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
      const apiUrl = apiEndpoint === 'admin' 
        ? `/api/admin/tickets/${ticketId}` 
        : `/api/support-tickets/${ticketId}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket updates');
      }

      const result = await response.json();
      const updatedTicket: TicketDetails = apiEndpoint === 'admin' ? result.ticket : result;
      
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