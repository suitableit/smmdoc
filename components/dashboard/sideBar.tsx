import { navItems } from '@/data/side-nav-items';
import { currentUser } from '@/lib/actions/auth';
import { cn } from '@/lib/utils';
import SideBarNav from './sideBarNav';

export default async function SideBar() {
  const user = await currentUser();
  return (
    <nav className={cn(`relative hidden h-screen border-r lg:block w-72`)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <SideBarNav items={navItems} user={user} />
          </div>
        </div>
      </div>
    </nav>
  );
}
