export const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    roles: ['admin', 'user'],
  },
  {
    title: 'New Order',
    href: '/dashboard/user/new-order',
    icon: 'cart',
    label: 'New Order',
    roles: ['user'],
  },
  {
    title: 'Services',
    href: '/dashboard/user/services',
    icon: 'list',
    label: 'Services',
    roles: ['user'],
  },

  {
    title: 'Add Funds',
    href: '/dashboard/user/add-funds',
    icon: 'payment',
    label: 'Add Funds',
    roles: ['user'],
  },

  // Admin only items

  {
    title: 'Categories',
    href: '/dashboard/admin/categories',
    href2: '/dashboard/admin/categories/create-category',
    icon: 'category',
    label: 'Categories',
    roles: ['admin'],
  },
  {
    title: 'Services',
    href: '/dashboard/admin/services',
    icon: 'services',
    label: 'Services',
    roles: ['admin'],
  },
  {
    title: 'Orders',
    href: '/dashboard/admin/orders',
    icon: 'cart',
    label: 'Orders',
    roles: ['admin'],
  },
  {
    title: 'Users',
    href: '/dashboard/admin/users',
    icon: 'users',
    label: 'Users',
    roles: ['admin'],
  },
  {
    title: 'Settings',
    href: '/dashboard/admin/settings',
    icon: 'settings',
    label: 'Settings',
    roles: ['admin'],
  },
];
