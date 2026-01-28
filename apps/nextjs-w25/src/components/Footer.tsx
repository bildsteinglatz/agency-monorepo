"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGodNav } from './GodNavContext';
import { GodModeLogo } from './GodModeLogo';
import { motion } from 'framer-motion';

export function Footer() {
  // Footer implements the clean mirrored navigation structure:
  // 1. Second Nav (Top)
  // 2. Main Nav (Bottom)
  const pathname = usePathname();
  const { isAuthenticated, showAGB } = useGodNav();
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Detect if user is near the bottom
  useEffect(() => {
    const handleScroll = () => {
        const scrollPos = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 100;
        // Also show if page is short (content fits in viewport)
        const isShortPage = document.documentElement.scrollHeight <= window.innerHeight + 50;
        setIsNearBottom(isShortPage || scrollPos >= threshold);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]); // Re-check on route change
  
  return (
    <footer className="w-full mt-auto bg-background z-[10] relative text-left">
      <div className="w-full flex flex-col">
        {/* 1. Second Nav (Top) - Portal Target for Page-Specific Navs */}
        <div id="footer-secondary-portal" className="w-full secondary-navigation relative">
           <nav className="second-nav pb-[6px] relative">
              {/* This container will be populated by Portals. The Portal content usually brings its own border-t. */}
              <div id="footer-portal-content"></div>
           </nav>
        </div>

        {/* 2. Main Nav (Bottom) - Now includes Portrait, CV, etc. */}
        <div className="w-full relative">
          <nav className="flex items-center pt-[6px] pb-[38px] relative">
            <motion.div 
                 initial={{ opacity: 0, scaleX: 0 }}
                 animate={{ opacity: isNearBottom ? 1 : 0, scaleX: isNearBottom ? 1 : 0 }}
                 transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
                 className="border-t-[1px] border-foreground w-full absolute top-0 left-0 origin-left" 
            />
            <div className="nav-container-alignment">
              <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: isNearBottom ? 0 : 20, opacity: isNearBottom ? 1 : 0 }}
                 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                 className="flex items-center justify-between w-full uppercase nav-text select-none"
              >
                {/* Left Group */}
                <ul className="flex gap-3 items-center nav-list-reset flex-1 justify-start">
                  <li><Link href="/exhibitions" className={pathname.startsWith('/exhibitions') && !pathname.startsWith('/exhibitions-list') ? 'active' : ''}>Exhibitions</Link></li>
                  <li><Link href="/artworks-ii" className={pathname.startsWith('/artworks-ii') ? 'active' : ''}>Artworks</Link></li>
                  <li><Link href="/publications" className={pathname.startsWith('/publications') ? 'active' : ''}>Publications</Link></li>
                  <li><Link href="/texts" className={pathname.startsWith('/texts') ? 'active' : ''}>Texts</Link></li>
                </ul>

                {/* Center Group - Control Room */}
                <div className="flex justify-center shrink-0 px-4">
                  {isAuthenticated && (
                    <Link
                      href="/user-settings"
                      className={`flex items-center ${pathname.startsWith('/user-settings') ? 'active' : ''}`}
                      aria-label="Control Room"
                    >
                      <GodModeLogo className="w-[20px] h-[20px]" />
                    </Link>
                  )}
                </div>

                {/* Right Group */}
                <ul className="flex gap-3 items-center nav-list-reset flex-1 justify-end">
                  <li><Link href="/portrait" className={`${pathname === '/portrait' ? 'active' : ''}`}>Portrait</Link></li>
                  <li><Link href="/exhibitions-list" className={`${pathname === '/exhibitions-list' ? 'active' : ''}`}>CV</Link></li>
                  <li><Link href="/contact" className={`${pathname === '/contact' ? 'active' : ''}`}>Contact</Link></li>
                  {isAuthenticated && showAGB && (
                    <li><Link href="/agb" className={`${pathname === '/agb' ? 'active' : ''}`}>AGB</Link></li>
                  )}
                  <li className="ml-0"><Link href="/imprint" className={`${pathname === '/imprint' ? 'active' : ''}`}>Imprint & DSVGO</Link></li>

                  {!isAuthenticated && (
                    <li>
                      <Link
                        href="/user-settings"
                        className={`flex items-center ${pathname.startsWith('/user-settings') ? 'active' : ''}`}
                        aria-label="Sign In"
                      >
                        Sign In
                      </Link>
                    </li>
                  )}
                </ul>
              </motion.div>
            </div>
          </nav>

          <div className="w-full flex justify-center pb-2">
             <span className="text-[12px] font-normal opacity-50">
               © Bildstein | Glatz, {new Date().getFullYear()}
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
