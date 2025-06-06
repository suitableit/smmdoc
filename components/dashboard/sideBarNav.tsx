'use client';
import { userNavItems } from '@/data/sidebar-nav/user-nav-items';
import { adminNavItems } from '@/data/sidebar-nav/admin-nav-items';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import * as FaIcons from 'react-icons/fa';

interface NavItem {
  title: string;
  href: string;
  icon: string;
  label: string;
  roles: string[];
  badge?: string;
  statusColor?: string;
  disabled?: boolean;
}

interface AdminSections {
  dashboard: NavItem[];
  orders: NavItem[];
  services: NavItem[];
  users: NavItem[];
  funds: NavItem[];
  support: NavItem[];
  analytics: NavItem[];
  api: NavItem[];
  reseller: NavItem[];
  settings: NavItem[];
  security: NavItem[];
  account: NavItem[];
  [key: string]: NavItem[];
}

interface UserSections {
  core: NavItem[];
  orders: NavItem[];
  services: NavItem[];
  funds: NavItem[];
  support: NavItem[];
  integrations: NavItem[];
  more: NavItem[];
  account: NavItem[];
  [key: string]: NavItem[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SideBarNav({
  collapsed = false,
  user,
  setOpen = () => {},
}: any) {
  const path = usePathname() || '';
  const isAdmin = user?.data?.role === 'admin';

  // Memoize items based on user role to prevent unnecessary recalculations
  const items = useMemo(() => {
    return isAdmin
      ? adminNavItems
      : userNavItems.filter((item: any) =>
          item.roles.includes(user?.data?.role || 'user')
        );
  }, [isAdmin, user?.data?.role]);

  // Memoize sections to prevent unnecessary recalculations on each render
  const sections = useMemo<AdminSections | UserSections>(() => {
    if (isAdmin) {
      // Group admin items into sections
      return {
        dashboard: items.filter((item) => ['Dashboard'].includes(item.title)),
        orders: items.filter((item) =>
          ['All Orders', 'Refill Orders', 'Refill Order & Cancel Tasks'].includes(item.title)
        ),
        services: items.filter((item) =>
          [
            'All Services',
            'Create Service',
            'Manage Categories',
            'Create Category',
            'Modify Bulk Services',
            'Sort by Category',
            'Synchronize Logs',
          ].includes(item.title)
        ),
        users: items.filter((item) =>
          [
            'User List',
            'Admins',
            'User Activity Logs',
            'KYC Approvals',
          ].includes(item.title)
        ),
        funds: items.filter((item) =>
          [
            'Funds Management',
            'Add User Funds',
            'All Transactions',
            'Update Price',
            'Payment Testing',
          ].includes(item.title)
        ),
        support: items.filter((item) =>
          ['All Ticket', 'AI Ticket', 'Human Ticket'].includes(item.title)
        ),
        analytics: items.filter((item) =>
          ['Sales Report', 'Trending Services', 'Export Data'].includes(
            item.title
          )
        ),
        api: items.filter((item) =>
          [
            'API Management',
            'Categories API',
            'Services API',
            'Funds API',
          ].includes(item.title)
        ),
        reseller: items.filter((item) =>
          ['Child Panels', 'Commission Settings', 'Reseller Requests'].includes(
            item.title
          )
        ),
        settings: items.filter((item) =>
          [
            'General Settings',
            'Appearance',
            'Email Settings',
            'SEO Settings',
            'Integrations',
          ].includes(item.title)
        ),
        security: items.filter((item) =>
          ['Security Logs', 'Access Control'].includes(item.title)
        ),
        account: items.filter((item) =>
          ['Account Settings', 'Logout'].includes(item.title)
        ),
      } as AdminSections;
    } else {
      // Group user items into sections
      return {
        core: items.filter((item) => ['Dashboard'].includes(item.title)),
        orders: items.filter((item) =>
          ['New Order', 'Mass Order', 'My Orders'].includes(item.title)
        ),
        services: items.filter((item) =>
          ['All Services', 'Favorite Services'].includes(item.title)
        ),
        funds: items.filter((item) =>
          ['Add Funds', 'Transactions'].includes(item.title)
        ),
        support: items.filter((item) =>
          [
            'Support Ticket',
            'Tickets History',
            'Contact Support',
            'FAQs',
          ].includes(item.title)
        ),
        integrations: items.filter((item) =>
          ['API Integration', 'Child Panel'].includes(item.title)
        ),
        more: items.filter((item) =>
          ['Affiliate Program', 'Terms'].includes(item.title)
        ),
        account: items.filter((item) =>
          ['Account Settings', 'Logout'].includes(item.title)
        ),
      } as UserSections;
    }
  }, [isAdmin, items]);

  const isActive = (itemPath: string) => {
    return path === itemPath || path.startsWith(itemPath + '/');
  };

  // Memoize the icon rendering function to prevent unnecessary re-renders
  const renderIcon = useMemo(() => {
    return (iconName: string) => {
      const Icon = (FaIcons as any)[iconName];
      return Icon ? <Icon /> : null;
    };
  }, []);

  const renderNavSection = (title: string, sectionItems: NavItem[]) => {
    if (!sectionItems || !sectionItems.length) return null;

    return (
      <div className={`nav-section ${collapsed ? 'mb-0 px-0' : 'mb-4 px-2'}`}>
        {title && (
          <p
            className={`section-title ${
              collapsed ? 'opacity-0 pointer-events-none' : ''
            } text-[11px] text-white/50 tracking-[1px] mx-4 my-2 whitespace-nowrap uppercase font-semibold`}
          >
            {title}
          </p>
        )}
        <ul
          className={`nav-links ${collapsed ? 'px-1' : 'px-3'} ${
            collapsed ? 'space-y-0' : 'space-y-1'
          }`}
        >
          {sectionItems.map((item, index) => {
            const active = isActive(item.href);

            return (
              <li
                key={index}
                className={`nav-item relative ${
                  collapsed ? 'rounded-md my-0' : 'rounded-lg mb-1'
                }`}
              >
                {active && !collapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5F1DE8] rounded-r-md"></div>
                )}
                <Link
                  href={item.disabled ? '/' : item.href}
                  className={cn(
                    collapsed
                      ? 'nav-link flex justify-center items-center text-white/70 hover:text-white py-3 relative transition-all duration-300'
                      : 'nav-link flex items-center text-white/70 hover:text-white px-3 py-2.5 hover:bg-white/5 rounded-lg transition-all duration-300 relative hover:shadow-sm',
                    active &&
                      (collapsed
                        ? "active text-white before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[60%] before:w-[3px] before:rounded-r before:bg-[#5F1DE8]"
                        : "active bg-[#5F1DE8]/10 text-white before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[60%] before:w-[3px] before:rounded-r before:bg-[#5F1DE8]"),
                    isAdmin && 'font-medium',
                    item.disabled && 'opacity-50 pointer-events-none'
                  )}
                  onClick={() => setOpen(false)}
                  title={collapsed ? item.title : undefined}
                >
                  <span
                    className={`text-[18px] min-w-[24px] flex justify-center ${
                      !collapsed && 'mr-3'
                    } ${
                      active
                        ? 'text-[#5F1DE8]'
                        : isAdmin
                        ? 'text-purple-400'
                        : ''
                    }`}
                  >
                    {renderIcon(item.icon)}
                  </span>
                  <span
                    className={`transition-all whitespace-nowrap overflow-hidden text-[14px] ${
                      isAdmin ? 'font-medium' : 'font-normal'
                    } ${collapsed ? 'opacity-0 w-0' : ''}`}
                  >
                    {item.title}
                  </span>
                  {item.badge && (
                    <div
                      className={`badge ml-auto text-[11px] py-0.5 px-1.5 bg-red-500/20 text-red-400 font-medium rounded-md ${
                        collapsed ? 'opacity-0 w-0 overflow-hidden' : ''
                      }`}
                    >
                      {item.badge}
                    </div>
                  )}
                  {item.statusColor && (
                    <div
                      className={`status-indicator ml-auto w-2 h-2 rounded-full transition-all duration-300 ${
                        item.statusColor === 'green'
                          ? 'bg-green-500 shadow-sm shadow-green-500/50'
                          : item.statusColor === 'red'
                          ? 'bg-red-500 shadow-sm shadow-red-500/50'
                          : 'bg-yellow-500 shadow-sm shadow-yellow-500/50'
                      } ${collapsed ? 'opacity-0 w-0 overflow-hidden' : ''}`}
                    ></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Return null if user data is not available yet
  if (!user) return null;

  // Helper function to safely access sections
  const getSectionItems = (sectionKey: string): NavItem[] => {
    return (sections as any)[sectionKey] || [];
  };

  return (
    <div className="sidebar-nav-container py-1">
      {isAdmin ? (
        <>
          {renderNavSection('', getSectionItems('dashboard'))}
          {renderNavSection('Orders', getSectionItems('orders'))}
          {renderNavSection('Services', getSectionItems('services'))}
          {renderNavSection('Users', getSectionItems('users'))}
          {renderNavSection('Funds', getSectionItems('funds'))}
          {renderNavSection('Support', getSectionItems('support'))}
          {renderNavSection('Analytics', getSectionItems('analytics'))}
          {renderNavSection('API', getSectionItems('api'))}
          {renderNavSection('Reseller', getSectionItems('reseller'))}
          {renderNavSection('Settings', getSectionItems('settings'))}
          {renderNavSection('Security', getSectionItems('security'))}
          {renderNavSection('Account', getSectionItems('account'))}
        </>
      ) : (
        <>
          {renderNavSection('', getSectionItems('core'))}
          {renderNavSection('Orders', getSectionItems('orders'))}
          {renderNavSection('Services', getSectionItems('services'))}
          {renderNavSection('Fund', getSectionItems('funds'))}
          {renderNavSection('Support', getSectionItems('support'))}
          {renderNavSection('Integrations', getSectionItems('integrations'))}
          {renderNavSection('More', getSectionItems('more'))}
          {renderNavSection('Account', getSectionItems('account'))}
        </>
      )}
    </div>
  );
}