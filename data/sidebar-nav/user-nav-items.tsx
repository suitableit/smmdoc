// data/user-nav-items.tsx
export const userNavItems = [
  // Core item
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'FaTachometerAlt', // Changed from FaHome to dashboard-specific icon
    label: 'Dashboard',
    roles: ['user'],
  },
  // Orders items
  {
    title: 'New Order',
    href: '/new-order',
    icon: 'FaPlus', // Changed from FaShoppingCart to plus icon for "new"
    label: 'New Order',
    roles: ['user'],
  },
  {
    title: 'Mass Orders',
    href: '/mass-orders',
    icon: 'FaLayerGroup', // Changed from FaShoppingBasket to layer group for "mass"
    label: 'Mass Orders',
    roles: ['user'],
  },
  {
    title: 'My Orders',
    href: '/my-orders',
    icon: 'FaClipboardList', // Changed from FaCog to clipboard list for orders
    label: 'My Orders',
    roles: ['user'],
  },
  // Services items
  {
    title: 'All Services',
    href: '/services',
    icon: 'FaBriefcase', // Briefcase icon for services
    label: 'All Services',
    roles: ['user'],
  },
  {
    title: 'Favorite Services',
    href: '/services/favorite-services',
    icon: 'FaStar', // Changed from FaStar to heart for favorites
    label: 'Favorite Services',
    roles: ['user'],
  },
  {
    title: 'Service Updates',
    href: '/services/updates',
    icon: 'FaBell', // Changed from FaStar to bell for updates/notifications
    label: 'Service Updates',
    roles: ['user'],
  },
  // Funds items
  {
    title: 'Add Funds',
    href: '/add-funds',
    icon: 'FaCreditCard', // Changed from FaDollarSign to credit card for adding funds
    label: 'Add Funds',
    roles: ['user'],
  },
  {
    title: 'Transfer Funds',
    href: '/transfer-funds',
    icon: 'FaArrowsAltH', // Changed from FaDollarSign to horizontal arrows for transfer
    label: 'Transfer Funds',
    roles: ['user'],
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: 'FaHistory', // Changed from FaExchangeAlt to history for transaction history
    label: 'Transactions',
    roles: ['user'],
  },
  // Support items
  {
    title: 'Support Tickets',
    href: '/support-tickets',
    icon: 'FaLifeRing', // Changed from FaTicketAlt to life ring for support
    label: 'Support Tickets',
    statusColor: 'green',
    roles: ['user'],
  },
  {
    title: 'Tickets History',
    href: '/support-tickets/history',
    icon: 'FaClipboardCheck', // Changed from FaListAlt to clipboard check for ticket history
    label: 'Tickets History',
    roles: ['user'],
  },
  {
    title: 'Contact Support',
    href: '/contact-support',
    icon: 'FaEnvelope', // Changed from FaHeadset to envelope for contact
    label: 'Contact Support',
    roles: ['user'],
  },
  {
    title: 'FAQs',
    href: '/faqs',
    icon: 'FaQuestionCircle', // This one was already appropriate
    label: 'FAQs',
    roles: ['user'],
  },
  // Integrations items
  {
    title: 'API Integration',
    href: '/api',
    icon: 'FaPlug', // Changed from FaCode to plug for integration
    label: 'API Integration',
    roles: ['user'],
  },
  {
    title: 'Child Panel',
    href: '/child-panel',
    icon: 'FaSitemap', // Changed from FaUserFriends to sitemap for panel hierarchy
    label: 'Child Panel',
    roles: ['user'],
  },
  // More items
  {
    title: 'Affiliate Program',
    href: '/affiliate',
    icon: 'FaNetworkWired', // Changed from FaUsers to handshake for partnership/affiliate
    label: 'Affiliate Program',
    roles: ['user'],
  },
  {
    title: 'Terms',
    href: '/terms',
    icon: 'FaGavel', // Changed from FaFileAlt to gavel for legal terms
    label: 'Terms',
    roles: ['user'],
  },
  // Account items
  {
    title: 'Account Settings',
    href: '/account-settings',
    icon: 'FaUserCog', // Changed from FaUserCog to simple cog for settings
    label: 'Account Settings',
    roles: ['user'],
  },
  {
    title: 'Logout',
    href: '#',
    icon: 'FaSignOutAlt', // This one was already appropriate
    label: 'Logout',
    roles: ['user'],
    isLogout: true, // Mark as logout action
  },
];
