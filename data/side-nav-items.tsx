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
    href: '/dashboard/new-order',
    icon: 'cart',
    label: 'New Order',
    roles: ['user'],
  },
  {
    title: 'Services',
    href: '/dashboard/services',
    icon: 'list',
    label: 'Services',
    roles: ['user'],
  },

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
];
