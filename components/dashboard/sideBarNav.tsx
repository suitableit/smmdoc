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

    return (
      <div className={`nav-section ${collapsed ? 'mb-0 px-0' : 'mb-6 px-2'}`}>
        {title && (
          <p
            className={`section-title ${
              collapsed ? 'opacity-0 pointer-events-none' : ''
            } text-xs font-semibold tracking-wider mx-4 my-2.5 whitespace-nowrap uppercase`}
            style={{
              color: 'var(--text-muted, rgba(255, 255, 255, 0.5))',
              fontSize: '11px',
              letterSpacing: '0.08em',
            }}
          >
            {title}
          </p>
        )}
        <ul
          className={`nav-links ${collapsed ? 'px-1' : 'px-3'} ${
            collapsed ? 'space-y-1' : 'space-y-1.5'
          }`}
        >
          {sectionItems.map((item, index) => {
            const active = isActive(item.href);

            return (
              <li
                key={index}
                className={`nav-item relative ${
                  collapsed ? 'rounded-lg my-0' : 'rounded-lg mb-1'
                }`}
              >
                {active && !collapsed && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-md"
                    style={{ backgroundColor: 'var(--primary, #5F1DE8)' }}
                  ></div>
                )}
                <Link
                  href={item.disabled ? '/' : item.href}
                  className={cn(
                    collapsed
                      ? 'nav-link flex justify-center items-center py-3 relative transition-all duration-200'
                      : 'nav-link flex items-center px-3.5 py-2.5 rounded-lg transition-all duration-200 relative',
                    active
                      ? collapsed
                        ? 'active text-white'
                        : 'active text-white'
                      : 'text-white/70 hover:text-white',
                    !active && !collapsed && 'hover:bg-white/5',
                    active && !collapsed && 'bg-[var(--primary)]/10',
                    item.disabled &&
                      'opacity-50 pointer-events-none cursor-not-allowed'
                  )}
                  style={{
                    fontSize: '14px',
                    fontWeight: isAdmin ? '500' : '400',
                    fontFamily: 'inherit',
                  }}
                  onClick={() => setOpen(false)}
                  title={collapsed ? item.title : undefined}
                >
                  {active && collapsed && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[3px] rounded-r"
                      style={{ backgroundColor: 'var(--primary, #5F1DE8)' }}
                    ></div>
                  )}
                  <span
                    className={`flex items-center justify-center ${
                      !collapsed && 'mr-3'
                    } transition-colors duration-200`}
                    style={{
                      fontSize: '18px',
                      minWidth: '24px',
                      color: active
                        ? 'var(--primary, #5F1DE8)'
                        : isAdmin
                        ? '#c084fc'
                        : 'currentColor',
                    }}
                  >
                    {renderIcon(item.icon)}
                  </span>
                  <span
                    className={`transition-all whitespace-nowrap overflow-hidden ${
                      collapsed ? 'opacity-0 w-0' : ''
                    }`}
                    style={{
                      fontSize: '14px',
                      fontWeight: isAdmin ? '500' : '400',
                      lineHeight: '1.5',
                    }}
                  >
                    {item.title}
                  </span>
                  {item.badge && (
                    <div
                      className={`badge ml-auto py-0.5 px-2 font-medium rounded-md transition-all duration-200 ${
                        collapsed ? 'opacity-0 w-0 overflow-hidden' : ''
                      }`}
                      style={{
                        fontSize: '11px',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        letterSpacing: '0.025em',
                      }}
                    >
                      {item.badge}
                    </div>
                  )}
                  {item.statusColor && (
                    <div
                      className={`status-indicator ml-auto rounded-full transition-all duration-200 ${
                        collapsed ? 'opacity-0 w-0 overflow-hidden' : ''
                      }`}
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor:
                          item.statusColor === 'green'
                            ? '#10b981'
                            : item.statusColor === 'red'
                            ? '#ef4444'
                            : '#f59e0b',
                        boxShadow:
                          item.statusColor === 'green'
                            ? '0 0 0 4px rgba(16, 185, 129, 0.1), 0 1px 2px rgba(16, 185, 129, 0.5)'
                            : item.statusColor === 'red'
                            ? '0 0 0 4px rgba(239, 68, 68, 0.1), 0 1px 2px rgba(239, 68, 68, 0.5)'
                            : '0 0 0 4px rgba(245, 158, 11, 0.1), 0 1px 2px rgba(245, 158, 11, 0.5)',
                      }}
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
