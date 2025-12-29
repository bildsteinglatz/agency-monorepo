'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StaffBar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Only show if user is logged in and has @halle5.at email
  // Also don't show on the dashboard itself to avoid redundancy, or keep it for navigation
  if (loading || !user || !user.email?.endsWith('@halle5.at')) {
    return null;
  }

  return (
    <div className="bg-black text-white px-4 py-2 flex justify-between items-center text-xs font-mono uppercase tracking-wider sticky top-0 z-[100]">
      <div className="flex items-center gap-4">
        <span className="text-[#FF3100] font-bold">Staff Mode</span>
        <span>{user.email}</span>
      </div>
      <div className="flex items-center gap-4">
        {pathname !== '/staff/dashboard' && (
          <Link href="/staff/dashboard" className="hover:text-[#FF3100] transition-colors">
            Dashboard
          </Link>
        )}
        <Link href="/profile" className="hover:text-[#FF3100] transition-colors">
          Profil
        </Link>
      </div>
    </div>
  );
}
