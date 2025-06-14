'use client';
import { adminNavItems } from '@/data/sidebar-nav/admin-nav-items';
import { userNavItems } from '@/data/sidebar-nav/user-nav-items';
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
          [
            'All Orders',
            'Refill Orders',
            'Refill Order & Cancel Tasks',
          ].includes(item.title)
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
          ['New Order', 'Mass Orders', 'My Orders'].includes(item.title)
        ),
        services: items.filter((item) =>
          ['All Services', 'Favorite Services', 'Service Updates'].includes(
            item.title
          )
        ),
        funds: items.filter((item) =>
          ['Add Funds', 'Transfer Funds', 'Transactions'].includes(item.title)
        ),
        support: items.filter((item) =>
          [
            'Support Tickets',
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
    // Exact match
    if (path === itemPath) return true;

    // For root path
    if (itemPath === '/' && path === '/') return true;

    // Prevent parent routes from being active when on child routes
    // Only mark as active if this is the most specific match
    if (path.startsWith(itemPath + '/')) {
      // Check if any other item has a more specific match
      const allItems = Object.values(sections).flat() as NavItem[];
      const hasMoreSpecificMatch = allItems.some((item) => {
        return (
          item.href !== itemPath &&
          item.href.startsWith(itemPath) &&
          (path === item.href || path.startsWith(item.href + '/'))
        );
      });

      return !hasMoreSpecificMatch;
    }

    return false;
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

    if (collapsed) {
      // When collapsed, render items without section wrapper to remove gaps
      return (
        <ul className="nav-links space-y-0">
          {sectionItems.map((item, index) => {
            const active = isActive(item.href);

            return (
              <li key={index} className="nav-item relative group">
                {/* Blue indicator bar - shows on active or hover */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] z-10 transition-opacity duration-200',
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                ></div>

                <Link
                  href={item.disabled ? '/' : item.href}
                  className={cn(
                    'flex items-center transition-all duration-200 relative group justify-center py-3 px-0',
                    active
                      ? 'bg-slate-700/50 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50',
                    item.disabled &&
                      'opacity-50 pointer-events-none cursor-not-allowed'
                  )}
                  onClick={() => setOpen(false)}
                  title={item.title}
                >
                  {/* Icon */}
                  <span
                    className={cn(
                      'flex items-center justify-center transition-colors duration-200 text-lg',
                      active
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-white'
                    )}
                  >
                    {renderIcon(item.icon)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <div className="nav-section mb-4 px-0">
        {title && (
          <p className="text-xs text-white/50 uppercase tracking-wide mx-4 mt-6 mb-2 ml-6 transition-all duration-300 ease-out whitespace-nowrap">
            {title}
          </p>
        )}
        <ul className="nav-links space-y-0">
          {sectionItems.map((item, index) => {
            const active = isActive(item.href);

            return (
              <li key={index} className="nav-item relative group">
                {/* Blue indicator bar - shows on active or hover */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] z-10 transition-opacity duration-200',
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                ></div>

                <Link
                  href={item.disabled ? '/' : item.href}
                  className={cn(
                    'flex items-center px-8 py-3 transition-all duration-200 relative group',
                    active
                      ? 'bg-slate-700/50 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50',
                    item.disabled &&
                      'opacity-50 pointer-events-none cursor-not-allowed'
                  )}
                  onClick={() => setOpen(false)}
                  title={collapsed ? item.title : undefined}
                >
                  {/* Icon */}
                  <span
                    className={cn(
                      'flex items-center justify-center transition-colors duration-200 text-lg mr-3',
                      active
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-white'
                    )}
                  >
                    {renderIcon(item.icon)}
                  </span>

                  {/* Title */}
                  <span
                    className={cn(
                      'text-sm font-medium transition-all duration-200 opacity-100',
                      active
                        ? 'text-white'
                        : 'text-slate-300 group-hover:text-white'
                    )}
                  >
                    {item.title}
                  </span>

                  {/* Badge */}
                  {item.badge && (
                    <div className="badge ml-auto py-1 px-2 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      {item.badge}
                    </div>
                  )}

                  {/* Status Indicator */}
                  {item.statusColor && (
                    <div className="ml-auto">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          item.statusColor === 'green' &&
                            'bg-green-400 shadow-green-400/50',
                          item.statusColor === 'red' &&
                            'bg-red-400 shadow-red-400/50',
                          item.statusColor === 'yellow' &&
                            'bg-yellow-400 shadow-yellow-400/50'
                        )}
                        style={{
                          boxShadow: `0 0 8px ${
                            item.statusColor === 'green'
                              ? 'rgba(34, 197, 94, 0.6)'
                              : item.statusColor === 'red'
                              ? 'rgba(239, 68, 68, 0.6)'
                              : 'rgba(245, 158, 11, 0.6)'
                          }`,
                        }}
                      />
                    </div>
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
    <div className="sidebar-nav-container">
      <div className="py-2">
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
    </div>
  );
}
