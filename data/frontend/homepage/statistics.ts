export interface CounterItem {
  iconName: string;
  title: string;
  count: string;
}

export const counterData: CounterItem[] = [
  {
    iconName: 'FaShoppingCart',
    title: 'Order Completed',
    count: '1,000+',
  },
  {
    iconName: 'FaServer',
    title: 'Active Services',
    count: '50+',
  },
  {
    iconName: 'FaUsers',
    title: 'Active Users',
    count: '500+',
  },
  {
    iconName: 'FaShareAlt',
    title: 'Affiliate Users',
    count: '100+',
  },
];