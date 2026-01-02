"use client";
import { useGodNav } from './GodNavContext';
import { useGodSidebarMargin } from './GodSidebarMarginContext';
import React from 'react';
import { ThemeSwitch2 } from './ThemeSwitch2';
import { usePathname, useRouter } from 'next/navigation';
import { useRetraction } from './RetractionContext';

export function SidebarNav() {
  const pathname = usePathname();
  const { switchMargin } = useGodSidebarMargin();
  const { retractionLevel } = useRetraction();

  // Hide sidebar on virtual painting page
  if (pathname === '/virtual-painting') {
    return null;
  }

  return (
    <nav className={`fixed right-0 top-0 h-full flex flex-col items-center justify-start z-50 pointer-events-none transition-all duration-500 ease-in-out ${retractionLevel >= 4 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`} style={{ width: '40px', background: 'transparent' }}>
      <div style={{ marginTop: switchMargin + 100 }} className="pointer-events-auto">
        <div style={{ border: 'none', outline: 'none', boxShadow: 'none', background: 'none', padding: 0 }}>
          <ThemeSwitch2 speed={switchMargin} buttonSize={28} wheelSize={26} />
        </div>
      </div>
    </nav>
  );
}


