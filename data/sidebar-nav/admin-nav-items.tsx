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
    icon: 'FaListAlt',
    label: 'All Orders',
    roles: ['admin'],
  },
  {
    title: 'Order Status',
    href: '/admin/orders/status',
    icon: 'FaChartLine',
    label: 'Order Status',
    roles: ['admin'],
  },
  {
    title: 'Refill Orders',
    href: '/admin/orders/refill',
    icon: 'FaRedo',
    label: 'Refill Orders',
    roles: ['admin'],
  },
  {
    title: 'Refill Order & Cancel Tasks',
    href: '/admin/orders/refill-cancel',
    icon: 'FaUndo',
    label: 'Refill Order & Cancel Tasks',
    roles: ['admin'],
  },

  // Services Section
  {
    title: 'All Services',
    href: '/admin/services',
    icon: 'FaBriefcase',
    label: 'All Services',
    roles: ['admin'],
  },
  {
    title: 'Create Service',
    href: '/admin/services/create-service',
    icon: 'FaPlusCircle',
    label: 'Create Service',
    roles: ['admin'],
  },
  {
    title: 'Manage Categories',
    href: '/admin/services/categories',
    icon: 'FaLayerGroup',
    label: 'Manage Categories',
    roles: ['admin'],
  },
  {
    title: 'Create Category',
    href: '/admin/services/categories/create-category',
    icon: 'FaPlusCircle',
    label: 'Create Category',
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
    title: 'Sort by Category',
    href: '/admin/services/sort-category',
    icon: 'FaSortAmountDown',
    label: 'Sort by Category',
    roles: ['admin'],
  },
  {
    title: 'Synchronize Logs',
    href: '/admin/services/sync-logs',
    icon: 'FaSync',
    label: 'Synchronize Logs',
    roles: ['admin'],
  },

  // Users Section
  {
    title: 'Users List',
    href: '/admin/users',
    icon: 'FaUsers',
    label: 'Users List',
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
    title: 'User Activity Logs',
    href: '/admin/users/logs',
    icon: 'FaChartLine',
    label: 'User Activity Logs',
    roles: ['admin'],
  },
  {
    title: 'KYC Approvals',
    href: '/admin/users/kyc',
    icon: 'FaUserCheck',
    label: 'KYC Approvals',
    roles: ['admin'],
  },

  // Funds Section
  {
    title: 'Funds Management',
    href: '/admin/funds',
    icon: 'FaMoneyBillWave',
    label: 'Funds Management',
    roles: ['admin'],
  },
  {
    title: 'Add User Funds',
    href: '/admin/funds?tab=add-user-fund',
    icon: 'FaMoneyBillWave',
    label: 'Add User Funds',
    roles: ['admin'],
  },
  {
    title: 'All Transactions',
    href: '/admin/funds?tab=all-transactions',
    icon: 'FaExchangeAlt',
    label: 'All Transactions',
    roles: ['admin'],
  },
  {
    title: 'Update Price',
    href: '/admin/funds?tab=update-price',
    icon: 'FaUndo',
    label: 'Update Price',
    roles: ['admin'],
  },
  {
    title: 'Payment Testing',
    href: '/admin/payment-testing',
    icon: 'FaFlask',
    label: 'Payment Testing',
    roles: ['admin'],
  },

  // Support Section
  {
    title: 'All Ticket',
    href: '/admin/Ticket',
    icon: 'FaTicketAlt',
    label: 'All Ticket',
    roles: ['admin'],
  },
  {
    title: 'AI Ticket',
    href: '/admin/Ticket/ai',
    icon: 'FaRobot',
    label: 'AI Ticket',
    roles: ['admin'],
  },
  {
    title: 'Human Ticket',
    href: '/admin/Ticket/human',
    icon: 'FaHeadset',
    label: 'Human Ticket',
    roles: ['admin'],
  },

  // Analytics Section
  {
    title: 'Sales Report',
    href: '/admin/analytics/sales',
    icon: 'FaChartBar',
    label: 'Sales Report',
    roles: ['admin'],
  },
  {
    title: 'Trending Services',
    href: '/admin/analytics/trending',
    icon: 'FaChartLine',
    label: 'Trending Services',
    roles: ['admin'],
  },
  {
    title: 'Export Data',
    href: '/admin/analytics/export',
    icon: 'FaFileExport',
    label: 'Export Data',
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
  {
    title: 'Categories API',
    href: '/admin/api/categories',
    icon: 'FaLayerGroup',
    label: 'Categories API',
    roles: ['admin'],
  },
  {
    title: 'Services API',
    href: '/admin/api/services',
    icon: 'FaBriefcase',
    label: 'Services API',
    roles: ['admin'],
  },
  {
    title: 'Funds API',
    href: '/admin/api/funds',
    icon: 'FaMoneyBillWave',
    label: 'Funds API',
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
    href: '/admin/settings/general',
    icon: 'FaCog',
    label: 'General Settings',
    roles: ['admin'],
  },
  {
    title: 'Appearance',
    href: '/admin/settings/appearance',
    icon: 'FaPalette',
    label: 'Appearance',
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
    title: 'SEO Settings',
    href: '/admin/settings/seo',
    icon: 'FaSearch',
    label: 'SEO Settings',
    roles: ['admin'],
  },
  {
    title: 'Integrations',
    href: '/admin/settings/integrations',
    icon: 'FaPuzzlePiece',
    label: 'Integrations',
    roles: ['admin'],
  },

  // Security Section
  {
    title: 'Security Logs',
    href: '/admin/security/logs',
    icon: 'FaShieldAlt',
    label: 'Security Logs',
    roles: ['admin'],
  },
  {
    title: 'Access Control',
    href: '/admin/security/access',
    icon: 'FaUserLock',
    label: 'Access Control',
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
    href: '/auth/logout',
    icon: 'FaSignOutAlt',
    label: 'Logout',
    roles: ['admin'],
  },
];