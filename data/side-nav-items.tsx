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
    title: 'Affiliate Program',
    href: '/dashboard/user/affiliate',
    icon: 'FaUsers',
    label: 'Affiliate Program',
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
    icon: 'FaLayerGroup',
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
    title: 'Funds',
    href: '/dashboard/admin/funds',
    icon: 'FaMoneyBillWave',
    label: 'Funds',
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

export const adminNavItems = [
  // Dashboard Section
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: 'FaHome',
    label: 'Dashboard',
    roles: ['admin'],
  },

  // Orders Section
  {
    title: 'All Orders',
    href: '/dashboard/admin/orders',
    icon: 'FaListAlt',
    label: 'All Orders',
    roles: ['admin'],
  },
  {
    title: 'Order Status',
    href: '/dashboard/admin/orders/status',
    icon: 'FaChartLine',
    label: 'Order Status',
    roles: ['admin'],
  },
  {
    title: 'Refill Orders',
    href: '/dashboard/admin/orders/refill',
    icon: 'FaRedo',
    label: 'Refill Orders',
    roles: ['admin'],
  },
  {
    title: 'Refill Order & Cancel Tasks',
    href: '/dashboard/admin/orders/refill-cancel',
    icon: 'FaUndo',
    label: 'Refill Order & Cancel Tasks',
    roles: ['admin'],
  },

  // Services Section
  {
    title: 'All Services',
    href: '/dashboard/admin/services',
    icon: 'FaList',
    label: 'All Services',
    roles: ['admin'],
  },
  {
    title: 'Create Service',
    href: '/dashboard/admin/services/create-services',
    icon: 'FaPlusCircle',
    label: 'Create Service',
    roles: ['admin'],
  },
  {
    title: 'Manage Categories',
    href: '/dashboard/admin/categories',
    icon: 'FaLayerGroup',
    label: 'Manage Categories',
    roles: ['admin'],
  },
  {
    title: 'Create Category',
    href: '/dashboard/admin/categories/create-category',
    icon: 'FaPlusCircle',
    label: 'Create Category',
    roles: ['admin'],
  },
  {
    title: 'Modify Bulk Services',
    href: '/dashboard/admin/services/bulk-modify',
    icon: 'FaEdit',
    label: 'Modify Bulk Services',
    roles: ['admin'],
  },
  {
    title: 'Sort by Category',
    href: '/dashboard/admin/services/sort-category',
    icon: 'FaSortAmountDown',
    label: 'Sort by Category',
    roles: ['admin'],
  },
  {
    title: 'Synchronize Logs',
    href: '/dashboard/admin/services/sync-logs',
    icon: 'FaSync',
    label: 'Synchronize Logs',
    roles: ['admin'],
  },

  // Users Section
  {
    title: 'User List',
    href: '/dashboard/admin/users',
    icon: 'FaUsers',
    label: 'User List',
    roles: ['admin'],
  },
  {
    title: 'Admins',
    href: '/dashboard/admin/users/admins',
    icon: 'FaUserShield',
    label: 'Admins',
    roles: ['admin'],
  },
  {
    title: 'User Activity Logs',
    href: '/dashboard/admin/users/logs',
    icon: 'FaChartLine',
    label: 'User Activity Logs',
    roles: ['admin'],
  },
  {
    title: 'KYC Approvals',
    href: '/dashboard/admin/users/kyc',
    icon: 'FaUserCheck',
    label: 'KYC Approvals',
    roles: ['admin'],
  },

  // Funds Section
  {
    title: 'Funds Management',
    href: '/dashboard/admin/funds',
    icon: 'FaMoneyBillWave',
    label: 'Funds Management',
    roles: ['admin'],
  },
  {
    title: 'Add User Fund',
    href: '/dashboard/admin/funds?tab=add-user-fund',
    icon: 'FaMoneyBillWave',
    label: 'Add User Fund',
    roles: ['admin'],
  },
  {
    title: 'All Transactions',
    href: '/dashboard/admin/funds?tab=all-transactions',
    icon: 'FaExchangeAlt',
    label: 'All Transactions',
    roles: ['admin'],
  },
  {
    title: 'Update Price',
    href: '/dashboard/admin/funds?tab=update-price',
    icon: 'FaUndo',
    label: 'Update Price',
    roles: ['admin'],
  },
  {
    title: 'Payment Testing',
    href: '/dashboard/admin/payment-testing',
    icon: 'FaFlask',
    label: 'Payment Testing',
    roles: ['admin'],
  },

  // Support Section
  {
    title: 'All Tickets',
    href: '/dashboard/admin/tickets',
    icon: 'FaTicketAlt',
    label: 'All Tickets',
    roles: ['admin'],
  },
  {
    title: 'AI Tickets',
    href: '/dashboard/admin/tickets/ai',
    icon: 'FaRobot',
    label: 'AI Tickets',
    roles: ['admin'],
  },
  {
    title: 'Human Tickets',
    href: '/dashboard/admin/tickets/human',
    icon: 'FaHeadset',
    label: 'Human Tickets',
    roles: ['admin'],
  },

  // Analytics Section
  {
    title: 'Sales Report',
    href: '/dashboard/admin/analytics/sales',
    icon: 'FaChartBar',
    label: 'Sales Report',
    roles: ['admin'],
  },
  {
    title: 'Trending Services',
    href: '/dashboard/admin/analytics/trending',
    icon: 'FaChartLine',
    label: 'Trending Services',
    roles: ['admin'],
  },
  {
    title: 'Export Data',
    href: '/dashboard/admin/analytics/export',
    icon: 'FaFileExport',
    label: 'Export Data',
    roles: ['admin'],
  },

  // API Management
  {
    title: 'API Management',
    href: '/dashboard/admin/api',
    icon: 'FaCode',
    label: 'API Management',
    roles: ['admin'],
  },
  {
    title: 'Categories API',
    href: '/dashboard/admin/api/categories',
    icon: 'FaLayerGroup',
    label: 'Categories API',
    roles: ['admin'],
  },
  {
    title: 'Services API',
    href: '/dashboard/admin/api/services',
    icon: 'FaBriefcase',
    label: 'Services API',
    roles: ['admin'],
  },
  {
    title: 'Funds API',
    href: '/dashboard/admin/api/funds',
    icon: 'FaMoneyBillWave',
    label: 'Funds API',
    roles: ['admin'],
  },

  // Reseller Section
  {
    title: 'Child Panels',
    href: '/dashboard/admin/reseller/panels',
    icon: 'FaUserFriends',
    label: 'Child Panels',
    roles: ['admin'],
  },
  {
    title: 'Commission Settings',
    href: '/dashboard/admin/reseller/commission',
    icon: 'FaPercentage',
    label: 'Commission Settings',
    roles: ['admin'],
  },
  {
    title: 'Reseller Requests',
    href: '/dashboard/admin/reseller/requests',
    icon: 'FaUserPlus',
    label: 'Reseller Requests',
    roles: ['admin'],
  },

  // Settings Section
  {
    title: 'General Settings',
    href: '/dashboard/admin/settings/general',
    icon: 'FaCog',
    label: 'General Settings',
    roles: ['admin'],
  },
  {
    title: 'Appearance',
    href: '/dashboard/admin/settings/appearance',
    icon: 'FaPalette',
    label: 'Appearance',
    roles: ['admin'],
  },
  {
    title: 'Email Settings',
    href: '/dashboard/admin/settings/email',
    icon: 'FaEnvelope',
    label: 'Email Settings',
    roles: ['admin'],
  },
  {
    title: 'SEO Settings',
    href: '/dashboard/admin/settings/seo',
    icon: 'FaSearch',
    label: 'SEO Settings',
    roles: ['admin'],
  },
  {
    title: 'Integrations',
    href: '/dashboard/admin/settings/integrations',
    icon: 'FaPuzzlePiece',
    label: 'Integrations',
    roles: ['admin'],
  },

  // Security Section
  {
    title: 'Security Logs',
    href: '/dashboard/admin/security/logs',
    icon: 'FaShieldAlt',
    label: 'Security Logs',
    roles: ['admin'],
  },
  {
    title: 'Access Control',
    href: '/dashboard/admin/security/access',
    icon: 'FaUserLock',
    label: 'Access Control',
    roles: ['admin'],
  },

  // Account Section
  {
    title: 'Account Settings',
    href: '/dashboard/admin/profile',
    icon: 'FaUserCog',
    label: 'Account Settings',
    roles: ['admin'],
  },
  {
    title: 'Logout',
    href: '/auth/logout',
    icon: 'FaSignOutAlt',
    label: 'Logout',
    roles: ['admin'],
  },
];
