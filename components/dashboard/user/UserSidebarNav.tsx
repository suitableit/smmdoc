// data/user-nav-items.tsx

export const userNavItems = [
  // Core item
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'FaHome',
    label: 'Dashboard',
    roles: ['user'],
  },

  // Orders items
  {
    title: 'New Order',
    href: '/new-order',
    icon: 'FaShoppingCart',
    label: 'New Order',
    roles: ['user'],
  },
  {
    title: 'Mass Order',
    href: '/mass-order',
    icon: 'FaShoppingBasket',
    label: 'Mass Order',
    roles: ['user'],
  },
  {
    title: 'My Orders',
    href: '/my-orders',
    icon: 'FaCog',
    label: 'My Orders',
    roles: ['user'],
  },

  // Services items
  {
    title: 'All Services',
    href: '/services',
    icon: 'FaBriefcase',
    label: 'All Services',
    roles: ['user'],
  },
  {
    title: 'Favorite Services',
    href: '/services/favorite-services',
    icon: 'FaStar',
    label: 'Favorite Services',
    roles: ['user'],
  },

  // Funds items
  {
    title: 'Add Funds',
    href: '/add-funds',
    icon: 'FaDollarSign',
    label: 'Add Funds',
    roles: ['user'],
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: 'FaExchangeAlt',
    label: 'Transactions',
    roles: ['user'],
  },

  // Support items
  {
    title: 'Support Ticket',
    href: '/support-ticket',
    icon: 'FaTicketAlt',
    label: 'Support Ticket',
    statusColor: 'green',
    roles: ['user'],
  },
  {
    title: 'Tickets History',
    href: '/support-ticket/history',
    icon: 'FaListAlt',
    label: 'Tickets History',
    roles: ['user'],
  },
  {
    title: 'Contact Support',
    href: '/contact-support',
    icon: 'FaHeadset',
    label: 'Contact Support',
    roles: ['user'],
  },
  {
    title: 'FAQs',
    href: '/faqs',
    icon: 'FaQuestionCircle',
    label: 'FAQs',
    roles: ['user'],
  },

  // Integrations items
  {
    title: 'API Integration',
    href: '/api',
    icon: 'FaCode',
    label: 'API Integration',
    roles: ['user'],
  },
  {
    title: 'Child Panel',
    href: '/child-panel',
    icon: 'FaUserFriends',
    label: 'Child Panel',
    roles: ['user'],
  },

  // More items
  {
    title: 'Affiliate Program',
    href: '/affiliate',
    icon: 'FaUsers',
    label: 'Affiliate Program',
    roles: ['user'],
  },
  {
    title: 'Terms',
    href: '/terms',
    icon: 'FaFileAlt',
    label: 'Terms',
    roles: ['user'],
  },

  // Account items
  {
    title: 'Account Settings',
    href: '/account-settings',
    icon: 'FaUserCog',
    label: 'Account Settings',
    roles: ['user'],
  },
  {
    title: 'Logout',
    href: '/auth/logout',
    icon: 'FaSignOutAlt',
    label: 'Logout',
    roles: ['user'],
  },
];