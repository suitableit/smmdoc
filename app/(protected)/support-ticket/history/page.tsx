'use client';

import { FaEye } from 'react-icons/fa';

type Ticket = {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
};

const dummyTicket: Ticket[] = [
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

export default function ticketsHistory() {
  const getStatusBadge = (status: string) => {
    const baseClasses =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'open':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Open
          </span>
        );
      case 'closed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Closed
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Pending
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const handleViewTicket = (ticketId: string) => {
    // Handle navigation to ticket details
    console.log(`Navigate to ticket ${ticketId}`);
  };

  return (
    <div className="w-full mx-auto max-w-6xl mb-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 m-0">
            Tickets History
          </h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Subject
                </th>
                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="bg-gray-50 px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {dummyTicket.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-4 py-3 border-t border-gray-200 text-sm">
                    #{ticket.id}
                  </td>
                  <td className="px-4 py-3 border-t border-gray-200 text-sm">
                    {ticket.subject}
                  </td>
                  <td className="px-4 py-3 border-t border-gray-200 text-sm">
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                    {ticket.createdAt}
                  </td>
                  <td className="px-4 py-3 border-t border-gray-200 text-sm text-right">
                    <button
                      onClick={() => handleViewTicket(ticket.id)}
                      className="inline-flex items-center justify-center w-8 h-8 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                      title="View Ticket"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
