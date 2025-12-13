'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { SidebarNav } from '@/components/SidebarNav';

// Routes where navigation should be hidden (handled by page itself or not needed)
const HIDDEN_NAV_ROUTES = ['/terminal', '/spectral', '/home', '/hud'];

export function ConditionalNav() {
    const pathname = usePathname();

    // Hide nav on terminal and spectral routes
    const shouldHideNav = HIDDEN_NAV_ROUTES.some(route => pathname.startsWith(route));

    if (shouldHideNav) {
        return null;
    }

    return (
        <>
            <SidebarNav />
            <Navigation />
        </>
    );
}
