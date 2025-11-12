'use client';
import { adminNavItems } from '@/data/sidebar-nav/admin-nav-items';
import { userNavItems } from '@/data/sidebar-nav/user-nav-items';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Session } from 'next-auth';
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
  isLogout?: boolean;
}

interface AdminSections {
  dashboard: NavItem[];
  orders: NavItem[];
  services: NavItem[];
  managements: NavItem[];
  funds: NavItem[];
  transactions: NavItem[];
  support: NavItem[];
  posts: NavItem[];
  additional: NavItem[];
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

interface SideBarNavProps {
  collapsed?: boolean;
  session?: Session | null;
  setOpen?: () => void;
}

export default function SideBarNav({
  collapsed = false,
  session,
  setOpen = () => {},
}: SideBarNavProps) {
  const path = usePathname() || '';
  const isAdmin = session?.user?.role === 'admin';
  const [ticketSystemEnabled, setTicketSystemEnabled] = useState(true);
  const [contactSystemEnabled, setContactSystemEnabled] = useState(true);

  useEffect(() => {
    const fetchTicketSettings = async () => {
      try {
        const response = await fetch('/api/ticket-system-status');
        if (response.ok) {
          const data = await response.json();
          setTicketSystemEnabled(data.ticketSystemEnabled ?? true);
        }
      } catch (error) {
        console.error('Error fetching ticket settings:', error);

        setTicketSystemEnabled(true);
      }
    };

    fetchTicketSettings();
  }, []);

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const response = await fetch('/api/contact-system-status');
        if (response.ok) {
          const data = await response.json();
          setContactSystemEnabled(data.contactSystemEnabled ?? true);
        }
      } catch (error) {
        console.error('Error fetching contact settings:', error);

        setContactSystemEnabled(true);
      }
    };

    fetchContactSettings();
  }, []);

  const items = useMemo(() => {
    return isAdmin
      ? adminNavItems
      : userNavItems.filter((item: NavItem) =>
          item.roles.includes(session?.user?.role || 'user')
        );
  }, [isAdmin, session?.user?.role]);

  const sections = useMemo<AdminSections | UserSections>(() => {
    if (isAdmin) {

      return {
        dashboard: items.filter((item) => ['Dashboard'].includes(item.title)),
        orders: items.filter((item) =>
          [
            'All Orders',
            'Refill Requests',
            'Cancel Requests',
          ].includes(item.title)
        ),
        services: items.filter((item) =>
          [
            'All Services',
            'Import Services',
            'Service Types',
            'Modify Bulk Services',
            'Update Price',
            'API Sync Logs',
          ].includes(item.title)
        ),
        managements: items.filter((item) =>
          [
            'Users',
            'Admins',
            'Moderators',
            'User Activity Logs',
          ].includes(item.title)
        ),
        funds: items.filter((item) =>
          [
            'Add Funds',
            'Transfer Funds',
          ].includes(item.title)
        ),
        transactions: items.filter((item) =>
          [
            'All Transactions',
          ].includes(item.title)
        ),
        support: items.filter((item) => {
          const supportItems = ['Support Tickets', 'Contact Messages'];
          if (!ticketSystemEnabled && item.title === 'Support Tickets') {
            return false;
          }
          if (!contactSystemEnabled && item.title === 'Contact Messages') {
            return false;
          }
          return supportItems.includes(item.title);
        }),
        posts: items.filter((item) =>
          ['Blogs', 'Announcements'].includes(item.title)
        ),
        additional: items.filter((item) =>
          ['Affiliates', 'Analytics & Reports'].includes(
            item.title
          )
        ),
        reseller: items.filter((item) =>
          ['Child Panels'].includes(
            item.title
          )
        ),
        settings: items.filter((item) =>
          [
            'General Settings',
            'Providers',
            'Payment Currency',
            'Notification Settings',
            'Email Settings',
            'Integrations',
            'Custom Codes',
          ].includes(item.title)
        ),
        security: items.filter((item) =>
          [
            'Security Settings',
            'Two Factor Authentication',
          ].includes(item.title)
        ),
        account: items.filter((item) =>
          ['Account Settings', 'Logout'].includes(item.title)
        ),
      } as AdminSections;
    } else {

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
        support: items.filter((item) => {
          const supportItems = [
            'Support Tickets',
            'Tickets History',
            'Contact Support',
            'FAQs',
          ];
          if (!ticketSystemEnabled && (item.title === 'Support Tickets' || item.title === 'Tickets History')) {
            return false;
          }
          if (!contactSystemEnabled && item.title === 'Contact Support') {
            return false;
          }
          return supportItems.includes(item.title);
        }),
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
  }, [isAdmin, items, ticketSystemEnabled, contactSystemEnabled]);

  const isActive = (itemPath: string) => {

    if (path === itemPath) return true;

    if (itemPath === '/' && path === '/') return true;


    if (path.startsWith(itemPath + '/')) {

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

  const renderIcon = useMemo(() => {
    return (iconName: string) => {
      const Icon = (FaIcons as Record<string, React.ComponentType>)[iconName];
      return Icon ? <Icon /> : null;
    };
  }, []);

  const renderNavSection = (title: string, sectionItems: NavItem[]) => {
    if (!sectionItems || !sectionItems.length) return null;

    if (collapsed) {

      return (
        <ul className="nav-links space-y-0">
          {sectionItems.map((item, index) => {
            const active = isActive(item.href);

            const handleClick = () => {
              if (item.isLogout) {
                signOut({ callbackUrl: '/' });
              } else {
                setOpen();
              }
            };

            return (
              <li key={index} className="nav-item relative group">
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] z-10 transition-opacity duration-200',
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                ></div>

                {item.isLogout ? (
                  <button
                    onClick={handleClick}
                    className={cn(
                      'flex items-center transition-all duration-200 relative group justify-center py-3 px-0 w-full',
                      'text-slate-300 hover:text-white hover:bg-slate-700/50',
                      item.disabled &&
                        'opacity-50 pointer-events-none cursor-not-allowed'
                    )}
                    title={item.title}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center transition-colors duration-200 text-lg',
                        'text-slate-400 group-hover:text-white'
                      )}
                    >
                      {renderIcon(item.icon)}
                    </span>
                  </button>
                ) : (
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
                    onClick={handleClick}
                    title={item.title}
                  >
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
                )}
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

            const handleClick = () => {
              if (item.isLogout) {
                signOut({ callbackUrl: '/' });
              } else {
                setOpen();
              }
            };

            return (
              <li key={index} className="nav-item relative group">
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] z-10 transition-opacity duration-200',
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                ></div>

                {item.isLogout ? (
                  <button
                    onClick={handleClick}
                    className={cn(
                      'flex items-center px-8 py-3 transition-all duration-200 relative group w-full text-left',
                      'text-slate-300 hover:text-white hover:bg-slate-700/50',
                      item.disabled &&
                        'opacity-50 pointer-events-none cursor-not-allowed'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center transition-colors duration-200 text-lg mr-3',
                        'text-slate-400 group-hover:text-white'
                      )}
                    >
                      {renderIcon(item.icon)}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium transition-all duration-200 opacity-100',
                        'text-slate-300 group-hover:text-white'
                      )}
                    >
                      {item.title}
                    </span>
                  </button>
                ) : (
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
                    onClick={handleClick}
                    title={collapsed ? item.title : undefined}
                  >
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
                    {item.badge && (
                      <div className="badge ml-auto py-1 px-2 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        {item.badge}
                      </div>
                    )}
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
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [session]);

  if (!session?.user || isLoading) {
    return (
      <div className="sidebar-nav-container">
        <div className="py-2">
          {Array.from({ length: 8 }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="nav-section mb-4 px-0">
              <div className="h-4 w-20 bg-slate-700/50 animate-pulse rounded mx-4 mt-6 mb-2 ml-6"></div>
              <ul className="nav-links space-y-0">
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <li key={itemIndex} className="nav-item relative">
                    <div className="flex items-center px-8 py-3">
                      <div className="w-5 h-5 bg-slate-700/50 animate-pulse rounded mr-3"></div>
                      <div className="h-4 w-32 bg-slate-700/50 animate-pulse rounded"></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getSectionItems = (sectionKey: keyof (AdminSections | UserSections)): NavItem[] => {
    return sections[sectionKey] || [];
  };

  return (
    <div className="sidebar-nav-container">
      <div className="py-2">
        {isAdmin ? (
          <>
            {renderNavSection('', getSectionItems('dashboard'))}
            {renderNavSection('Orders', getSectionItems('orders'))}
            {renderNavSection('Services', getSectionItems('services'))}
            {renderNavSection('Managements', getSectionItems('managements'))}
            {renderNavSection('Funds', getSectionItems('funds'))}
            {renderNavSection('Transactions', getSectionItems('transactions'))}
            {renderNavSection('Support', getSectionItems('support'))}
            {renderNavSection('Posts', getSectionItems('posts'))}
            {renderNavSection('Additional', getSectionItems('additional'))}
            {renderNavSection('Reseller Panels', getSectionItems('reseller'))}
            {renderNavSection('Settings', getSectionItems('settings'))}
            {renderNavSection('Security', getSectionItems('security'))}
            {renderNavSection('Account', getSectionItems('account'))}
          </>
        ) : (
          <>
            {renderNavSection('', getSectionItems('core'))}
            {renderNavSection('Orders', getSectionItems('orders'))}
            {renderNavSection('Services', getSectionItems('services'))}
            {renderNavSection('Funds', getSectionItems('funds'))}
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

SideBarNav.displayName = 'SideBarNav';