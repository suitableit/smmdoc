'use client';
import { navItems } from '@/data/side-nav-items';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as FaIcons from 'react-icons/fa';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SideBarNav({ collapsed = false, user, setOpen = () => {} }: any) {
  const path = usePathname();
  
  // Filter items based on user role
  const filteredItems = navItems.filter((item: any) => 
    item.roles.includes(user?.data?.role || 'user')
  );
  
  // Group items into categories
  const coreItems = filteredItems.filter(item => 
    ['Dashboard'].includes(item.title)
  );
  
  const orderItems = filteredItems.filter(item => 
    ['New Order', 'Mass Order', 'My Orders', 'Order History'].includes(item.title)
  );
  
  const serviceItems = filteredItems.filter(item => 
    ['All Services', 'Favorite Services'].includes(item.title)
  );
  
  const fundsItems = filteredItems.filter(item => 
    ['Add Fund', 'Transactions'].includes(item.title)
  );
  
  const supportItems = filteredItems.filter(item => 
    ['Support Ticket', 'Ticket History', 'Contact Support', 'FAQ'].includes(item.title)
  );
  
  const integrationItems = filteredItems.filter(item => 
    ['API Integration', 'Child Panel'].includes(item.title)
  );
  
  const moreItems = filteredItems.filter(item => 
    ['Affiliates', 'Terms'].includes(item.title)
  );
  
  const accountItems = filteredItems.filter(item => 
    ['Account Settings', 'Logout'].includes(item.title)
  );
  
  // Admin specific items
  const adminItems = filteredItems.filter(item => 
    ['Categories', 'Services', 'Orders', 'Users', 'Settings'].includes(item.title) && 
    item.roles.includes('admin')
  );
  
  const isActive = (itemPath: string, itemPath2?: string) => {
    return path === itemPath || 
           (itemPath2 && path === itemPath2) ||
           path.startsWith(itemPath + '/');
  };

  // Render the React icon dynamically
  const renderIcon = (iconName: string) => {
    const Icon = (FaIcons as any)[iconName];
    return Icon ? <Icon /> : null;
  };
  
  const renderNavSection = (title: string, items: any[]) => {
    if (!items.length) return null;
    
    return (
      <div className={`nav-section ${collapsed ? 'mb-0 px-0' : 'mb-4 px-2'}`}>
        {title && (
          <p className={`section-title ${collapsed ? 'opacity-0 pointer-events-none' : ''} text-[11px] text-white/50 tracking-[1px] mx-4 my-2 whitespace-nowrap capitalize`} style={{textTransform: 'capitalize'}}>{title}</p>
        )}
        <ul className={`nav-links ${collapsed ? 'px-1' : 'px-3'} ${collapsed ? 'space-y-0' : 'space-y-1'}`}>
          {items.map((item, index) => {
            const active = isActive(item.href, item.href2);
            
            return (
              <li key={index} className={`nav-item relative ${collapsed ? 'rounded-md my-0' : 'rounded-md mb-1'}`}>
                {active && !collapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-md"></div>
                )}
                <Link 
                  href={item.disabled ? '/' : item.href}
                  className={cn(
                    collapsed 
                      ? "nav-link flex justify-center items-center text-white/70 hover:text-white py-3 relative transition-all duration-300"
                      : "nav-link flex items-center text-white/70 hover:text-white px-3 py-3 hover:bg-white/5 rounded-md transition-all duration-300 relative",
                    active && (collapsed 
                      ? "active text-white before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[60%] before:w-[3px] before:rounded-r before:bg-gradient-to-b before:from-indigo-500 before:to-blue-400" 
                      : "active bg-white/10 text-white before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[60%] before:w-[3px] before:rounded-r before:bg-gradient-to-b before:from-indigo-500 before:to-blue-400"),
                    item.disabled && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => setOpen(false)}
                  title={collapsed ? item.title : undefined}
                >
                  <span className={`text-[20px] min-w-[24px] flex justify-center ${!collapsed && 'mr-3'} ${active ? 'text-indigo-400' : ''}`}>
                    {renderIcon(item.icon)}
                  </span>
                  <span className={`transition-all whitespace-nowrap overflow-hidden text-[14px] font-normal ${collapsed ? 'opacity-0 w-0' : ''}`}>
                    {item.title}
                  </span>
                  {item.badge && (
                    <div className={`badge ml-auto text-[11px] py-0.5 px-1.5 bg-red-500/20 text-red-400 font-medium rounded-md ${collapsed ? 'opacity-0 w-0 overflow-hidden' : ''}`}>{item.badge}</div>
                  )}
                  {item.statusColor && (
                    <div className={`status-indicator ml-auto w-2 h-2 rounded-full transition-all duration-300 ${
                      item.statusColor === 'green' ? 'bg-green-500 shadow-sm shadow-green-500/50' : 
                      item.statusColor === 'red' ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-yellow-500 shadow-sm shadow-yellow-500/50'
                    } ${collapsed ? 'opacity-0 w-0 overflow-hidden' : ''}`}></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  
  return (
    <div className="sidebar-nav-container py-1">
      {renderNavSection('', coreItems)}
      {renderNavSection(collapsed ? '' : 'Orders', orderItems)}
      {renderNavSection(collapsed ? '' : 'Services', serviceItems)}
      {renderNavSection(collapsed ? '' : 'Fund', fundsItems)}
      {renderNavSection(collapsed ? '' : 'Support', supportItems)}
      {renderNavSection(collapsed ? '' : 'Integrations', integrationItems)}
      {renderNavSection(collapsed ? '' : 'More', moreItems)}
      {renderNavSection(collapsed ? '' : 'Account', accountItems)}
      {user?.data?.role === 'admin' && renderNavSection(collapsed ? '' : 'Administration', adminItems)}
    </div>
  );
}
