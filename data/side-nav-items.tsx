export const navItems = [
  // Core item
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'FaHome',
    label: 'Dashboard',
    roles: ['admin', 'user'],
  },
  
  // Orders items
  {
    title: 'New Order',
    href: '/dashboard/user/new-order',
    icon: 'FaShoppingCart',
    label: 'New Order',
    roles: ['user'],
  },
  {
    title: 'Mass Order',
    href: '/dashboard/user/mass-order',
    icon: 'FaShoppingBasket',
    label: 'Mass Order',
    roles: ['user'],
  },
  {
    title: 'My Orders',
    href: '/dashboard/user/my-orders',
    icon: 'FaCog',
    label: 'My Orders',
    roles: ['user'],
  },
  {
    title: 'Order History',
    href: '/dashboard/user/order-history',
    icon: 'FaHistory',
    label: 'Order History',
    roles: ['user'],
  },
  
  // Services items
  {
    title: 'All Services',
    href: '/dashboard/user/services',
    icon: 'FaBriefcase',
    label: 'All Services',
    roles: ['user'],
  },
  {
    title: 'Favorite Services',
    href: '/dashboard/user/favorite-services',
    icon: 'FaStar',
    label: 'Favorite Services',
    roles: ['user'],
  },
  
  // Funds items
  {
    title: 'Add Fund',
    href: '/dashboard/user/add-funds',
    icon: 'FaDollarSign',
    label: 'Add Fund',
    roles: ['user'],
  },
  {
    title: 'Transactions',
    href: '/dashboard/user/transactions',
    icon: 'FaExchangeAlt',
    label: 'Transactions',
    roles: ['user'],
  },
  
  // Support items
  {
    title: 'Support Ticket',
    href: '/dashboard/user/trickets',
    icon: 'FaTicketAlt',
    label: 'Support Ticket',
    statusColor: 'green',
    roles: ['user'],
  },
  {
    title: 'Ticket History',
    href: '/dashboard/user/trickets/history',
    icon: 'FaListAlt',
    label: 'Ticket History',
    roles: ['user'],
  },
  {
    title: 'Contact Support',
    href: '/dashboard/user/contact',
    icon: 'FaHeadset',
    label: 'Contact Support',
    roles: ['user'],
  },
  {
    title: 'FAQ',
    href: '/dashboard/user/faq',
    icon: 'FaQuestionCircle',
    label: 'FAQ',
    roles: ['user'],
  },
  
  // Integrations items
  {
    title: 'API Integration',
    href: '/dashboard/user/web-api',
    icon: 'FaCode',
    label: 'API Integration',
    roles: ['user'],
  },
  {
    title: 'Child Panel',
    href: '/dashboard/user/child-panel',
    icon: 'FaUserFriends',
    label: 'Child Panel',
    roles: ['user'],
  },
  
  // More items
  {
    title: 'Affiliates',
    href: '/dashboard/user/affiliates',
    icon: 'FaUsers',
    label: 'Affiliates',
    badge: 'Coming soon',
    roles: ['user'],
  },
  {
    title: 'Terms',
    href: '/dashboard/user/terms',
    icon: 'FaFileAlt',
    label: 'Terms',
    roles: ['user'],
  },
  
  // Account items
  {
    title: 'Account Settings',
    href: '/dashboard/profile',
    icon: 'FaUserCog',
    label: 'Account Settings',
    roles: ['user', 'admin'],
  },
  {
    title: 'Logout',
    href: '/auth/logout',
    icon: 'FaSignOutAlt',
    label: 'Logout',
    roles: ['user', 'admin'],
  },

  // Admin only items
  {
    title: 'Categories',
    href: '/dashboard/admin/categories',
    href2: '/dashboard/admin/categories/create-category',
    icon: 'FaFolder',
    label: 'Categories',
    roles: ['admin'],
  },
  {
    title: 'Services',
    href: '/dashboard/admin/services',
    icon: 'FaBriefcase',
    label: 'Services',
    roles: ['admin'],
  },
  {
    title: 'Orders',
    href: '/dashboard/admin/orders',
    icon: 'FaShoppingCart',
    label: 'Orders',
    roles: ['admin'],
  },
  {
    title: 'Users',
    href: '/dashboard/admin/users',
    icon: 'FaUsers',
    label: 'Users',
    roles: ['admin'],
  },
  {
    title: 'Settings',
    href: '/dashboard/admin/settings',
    icon: 'FaCog',
    label: 'Settings',
    roles: ['admin'],
  },
];
