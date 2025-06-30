// data/admin-nav-items.tsx

export const adminNavItems = [
  // Dashboard Section
  {
    title: 'Dashboard',
    href: '/admin',
    icon: 'FaHome',
    label: 'Dashboard',
    roles: ['admin'],
  },

  // Orders Section
  {
    title: 'All Orders',
    href: '/admin/orders',
    icon: 'FaBox',
    label: 'All Orders',
    roles: ['admin'],
  },
  {
    title: 'Refill Requests',
    href: '/admin/orders/refill-requests',
    icon: 'FaRedo',
    label: 'Refill Requests',
    roles: ['admin'],
  },
  {
    title: 'Cancel Requests',
    href: '/admin/orders/cancel-requests',
    icon: 'FaTimes',
    label: 'Cancel Requests',
    roles: ['admin'],
  },

  // Services Section
  {
    title: 'Services',
    href: '/admin/services',
    icon: 'FaBriefcase',
    label: 'Services',
    roles: ['admin'],
  },
  {
    title: 'Service Types',
    href: '/admin/services/types',
    icon: 'FaShapes',
    label: 'Service Types',
    roles: ['admin'],
  },
  {
    title: 'Modify Bulk Services',
    href: '/admin/services/bulk-modify',
    icon: 'FaEdit',
    label: 'Modify Bulk Services',
    roles: ['admin'],
  },
  {
    title: 'Import Services',
    href: '/admin/services/import',
    icon: 'FaFileImport',
    label: 'Import Services',
    roles: ['admin'],
  },
  {
    title: 'API Sync Logs',
    href: '/admin/services/sync-logs',
    icon: 'FaSync',
    label: 'API Sync Logs',
    roles: ['admin'],
  },

  // Users Section
  {
    title: 'Users',
    href: '/admin/users',
    icon: 'FaUsers',
    label: 'Users',
    roles: ['admin'],
  },
  {
    title: 'Admins',
    href: '/admin/users/admins',
    icon: 'FaUserShield',
    label: 'Admins',
    roles: ['admin'],
  },
  {
    title: 'Moderators',
    href: '/admin/users/moderators',
    icon: 'FaUserCheck',
    label: 'Moderators',
    roles: ['Moderators'],
  },
  {
    title: 'User Activity Logs',
    href: '/admin/users/logs',
    icon: 'FaChartLine',
    label: 'User Activity Logs',
    roles: ['admin'],
  },

  // Funds Section
  {
    title: 'All Transactions',
    href: '/admin/transactions',
    icon: 'FaExchangeAlt',
    label: 'All Transactions',
    roles: ['admin'],
  },

  // Support Section
  {
    title: 'Support Tickets',
    href: '/admin/tickets',
    icon: 'FaTicketAlt',
    label: 'Support Tickets',
    roles: ['admin'],
  },
  {
    title: 'Contact Messages',
    href: '/admin/contact-messages',
    icon: 'FaEnvelope',
    label: 'Human Ticket',
    roles: ['admin'],
  },

  // Analytics Section
  {
    title: 'Analytics & Reports',
    href: '/admin/analytics',
    icon: 'FaChartBar',
    label: 'Analytics & Reports',
    roles: ['admin'],
  },

  // API Management
  {
    title: 'API Management',
    href: '/admin/api',
    icon: 'FaCode',
    label: 'API Management',
    roles: ['admin'],
  },

  // Reseller Section
  {
    title: 'Child Panels',
    href: '/admin/reseller/panels',
    icon: 'FaUserFriends',
    label: 'Child Panels',
    roles: ['admin'],
  },
  {
    title: 'Commission Settings',
    href: '/admin/reseller/commission',
    icon: 'FaPercentage',
    label: 'Commission Settings',
    roles: ['admin'],
  },
  {
    title: 'Reseller Requests',
    href: '/admin/reseller/requests',
    icon: 'FaUserPlus',
    label: 'Reseller Requests',
    roles: ['admin'],
  },

  // Settings Section
  {
    title: 'General Settings',
    href: '/admin/settings',
    icon: 'FaCog',
    label: 'General Settings',
    roles: ['admin'],
  },
  {
    title: 'Appearance',
    href: '/admin/settings/appearance',
    icon: 'FaSun',
    label: 'Appearance',
    roles: ['admin'],
  },
  {
    title: 'Providers',
    href: '/admin/settings/providers',
    icon: 'FaHandshake',
    label: 'Providers',
    roles: ['admin'],
  },
  {
    title: 'Payment Currency',
    href: '/admin/settings/currency',
    icon: 'FaDollarSign',
    label: 'Payment Currency',
    roles: ['admin'],
  },
  {
    title: 'Notification Settings',
    href: '/admin/settings/notifications',
    icon: 'FaBell',
    label: 'Notification Settings',
    roles: ['admin'],
  },
  {
    title: 'Email Settings',
    href: '/admin/settings/email',
    icon: 'FaEnvelope',
    label: 'Email Settings',
    roles: ['admin'],
  },
  {
    title: 'Integrations',
    href: '/admin/settings/integrations',
    icon: 'FaPuzzlePiece',
    label: 'Integrations',
    roles: ['admin'],
  },
  {
    title: 'Custom Codes',
    href: '/admin/settings/custom-codes',
    icon: 'FaCode',
    label: 'Custom Codes',
    roles: ['admin'],
  },

  // Account Section
  {
    title: 'Account Settings',
    href: '/account-settings',
    icon: 'FaUserCog',
    label: 'Account Settings',
    roles: ['admin'],
  },
  {
    title: 'Logout',
    href: '#',
    icon: 'FaSignOutAlt',
    label: 'Logout',
    roles: ['admin'],
    isLogout: true,
  },
];