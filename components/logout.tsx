'use client';

import { logout } from '@/lib/actions/logout';
import { FaSignOutAlt } from 'react-icons/fa';
import { Button } from './ui/button';

export default function LogoutButton() {
  const signOut = async () => {
    await logout();
  };
  return (
    <Button className="cursor-pointer" variant="outline" onClick={signOut}>
      <FaSignOutAlt /> Sign Out
    </Button>
  );
}
