'use client';
import { cn } from '@/lib/utils';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import Link from 'next/link';
import { ModeToggle } from '../shared/header/mode-Toggle';
import { Menu } from './menu';
import MobileSidebar from './mobile-siderbar';

const Header = () => {
  const user = useCurrentUser();
  const { currency, setCurrency, rate, isLoading } = useCurrency();

  const handleCurrencyChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newCurrency = e.target.value as 'USD' | 'BDT';
    await setCurrency(newCurrency);
  };

  return (
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="hidden lg:flex items-center gap-2">
          <Link href={'/dashboard'} target="_blank">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </Link>
          <span className="hidden lg:block uppercase">SMMPanel</span>
        </div>
        <div className={cn('block lg:!hidden')}>
          <MobileSidebar user={user} />
        </div>

        <div className="flex items-center gap-2">
          {/* Enhanced currency switcher */}
          <div className="flex items-center gap-1">
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="bg-transparent border rounded-md px-2 py-1 text-sm focus:outline-none"
              disabled={isLoading}
            >
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
            </select>
            {rate && !isLoading && (
              <span className="text-xs text-gray-500">
                1USD ≈ {rate.toFixed(2)}BDT
              </span>
            )}
          </div>

          {user && <Menu user={user} />}
          <ModeToggle />
        </div>
      </nav>
    </div>
  );
};

export default Header;
