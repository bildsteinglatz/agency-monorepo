"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGodNav } from './GodNavContext';
import HeaderLogo from './HeaderLogo';
import { GodModeLogo } from './GodModeLogo';
import { useRetraction } from './RetractionContext';

export function Navigation({ forceShow = false }: { forceShow?: boolean } = {}) {
  const pathname = usePathname();
  const { isAuthenticated, showGodNav, showPainting, showWriting, showCurating, showPortrait, showAGB, showSpectral, showTerminal } = useGodNav();
  const { retractionLevel } = useRetraction();

  // Calculate if Digital section should be shown
  const showDigital = isAuthenticated && (showPainting || showWriting || showCurating);

  // Hide navigation on virtual painting page
  if (pathname === '/virtual-painting' || pathname === '/spectral') {
    return null;
  }

  // On homepage, hide unless forceShow is true (rendered from page.tsx after Intro)
  if (pathname === '/' && !forceShow) {
    return null;
  }

  // Always show main nav
  const showNavLinks = true;

  return (
    <nav className="navigation" style={{ zIndex: 100 }}>
      {showNavLinks && (
        <>
          {/* Right controls: pin to viewport right - Decoupled from Main Nav */}
          <div
            className={`right-controls fixed top-0 right-0 flex items-center gap-3 logo-text pr-2 z-[100] transition-all duration-500 ease-in-out ${retractionLevel >= 1 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
            style={{ top: '-4px' }}
          >
            <HeaderLogo />
          </div>

          <div className={`w-full site-header-border sticky top-0 z-[100] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 2 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            <nav className="flex items-center relative pb-[5px]" style={{ marginLeft: '8px', marginTop: '32px' }}>
              <ul className="flex gap-3 nav-text items-center nav-list-reset select-none">
                <li>
                  <Link
                    href="/exhibitions"
                    className={pathname.startsWith('/exhibitions') && !pathname.startsWith('/exhibitions-list') ? 'active' : ''}
                  >
                    Exhibitions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/artworks-ii"
                    className={pathname.startsWith('/artworks-ii') ? 'active' : ''}
                  >
                    Artworks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/publications"
                    className={pathname.startsWith('/publications') ? 'active' : ''}
                  >
                    Publications
                  </Link>
                </li>
                <li>
                  <Link
                    href="/exhibitions-list"
                    className={['/portrait', '/exhibitions-list', '/texts', '/contact', '/imprint', '/agb'].some(p => pathname.startsWith(p)) ? 'active' : ''}
                  >
                    About
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link
                      href="/user-settings"
                      className={`flex items-center ${pathname.startsWith('/user-settings') ? 'active' : ''}`}
                      aria-label="Control Room"
                    >
                      <GodModeLogo className="w-[18px] h-[18px]" />
                    </Link>
                  </li>
                )}
              </ul>

            </nav>
            {/* Line - force full viewport width to prevent gaps on mobile */}
            <div className="border-b-[1px] border-foreground w-screen absolute bottom-0 left-1/2 -translate-x-1/2" />
          </div>
        </>
      )
      }

      {
        showNavLinks && (
          <>
            {(() => {
              if (pathname === '/about' || pathname === '/portrait' || pathname === '/exhibitions-list' || pathname === '/texts' || pathname === '/contact' || pathname === '/imprint' || pathname === '/agb' || pathname.startsWith('/texts/')) {
                return (
                  <div className={`w-full secondary-navigation pb-10 sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <nav className="second-nav pt-[6px] pb-0.5">
                      <div>
                        <ul className="flex gap-x-1 gap-y-1 justify-start items-start nav-text nav-list-reset flex-wrap" style={{ marginLeft: '4px' }}>
                          <li><Link href="/portrait" className={`px-1 py-0 ${pathname === '/portrait' ? 'active' : ''}`}>Portrait</Link></li>
                          <li><Link href="/exhibitions-list" className={`px-1 py-0 ${pathname === '/exhibitions-list' ? 'active' : ''}`}>CV</Link></li>
                          <li><Link href="/texts" className={`px-1 py-0 ${pathname.startsWith('/texts') ? 'active' : ''}`}>Texts</Link></li>
                          <li><Link href="/contact" className={`px-1 py-0 ${pathname === '/contact' ? 'active' : ''}`}>Contact</Link></li>
                          {isAuthenticated && showAGB && (
                            <li><Link href="/agb" className={`px-1 py-0 ${pathname === '/agb' ? 'active' : ''}`}>AGB</Link></li>
                          )}
                          <li><Link href="/imprint" className={`px-1 py-0 ${pathname === '/imprint' ? 'active' : ''}`}>Imprint</Link></li>
                          {!isAuthenticated && (
                            <li>
                              <Link
                                href="/user-settings"
                                className={`px-1 py-0 flex items-center ${pathname.startsWith('/user-settings') ? 'active' : ''}`}
                                aria-label="Sign In"
                              >
                                Sign In
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    </nav>
                  </div>
                );
              }

              if (pathname.startsWith('/gallery') || pathname.startsWith('/virtual-painting') || pathname.startsWith('/writing')) {
                return (
                  <div className={`w-full secondary-navigation pb-10 sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <nav className="second-nav pt-1 pb-0.5">
                      <div>
                        <ul className="flex gap-1 justify-start items-start nav-text nav-list-reset" style={{ marginLeft: '4px' }}>
                          {showWriting && (
                            <li><Link href="/writing" className={`px-1 py-0 ${pathname.startsWith('/writing') ? 'active' : ''}`}>Writing</Link></li>
                          )}
                          {showPainting && (
                            <li><Link href="/virtual-painting" className={`px-1 py-0 ${pathname.startsWith('/virtual-painting') ? 'active' : ''}`}>Painting</Link></li>
                          )}
                          {showCurating && (
                            <li><Link href="/gallery" className={`px-1 py-0 ${pathname.startsWith('/gallery') ? 'active' : ''}`}>Curating</Link></li>
                          )}
                        </ul>
                      </div>
                    </nav>
                  </div>
                );
              }

              if (!showGodNav) return null;

              if (pathname === '/') {
                return null;
              }
              if (pathname === '/artworks-browse-filterbar') {
                return (
                  <div className={`w-full secondary-navigation sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <nav>
                      <ul className="flex gap-10 justify-start items-start nav-text nav-list-reset">
                        <li>
                          <a href="/artworks-browse-controlsrow" className="text-[#ff6600]">Search All Artwork</a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                );
              }

              if (pathname === '/exhibitions' || pathname === '/exhibitions-list') {
                return null;
              }

              if (pathname === '/exhibitions/gallery') {
                return (
                  <div className={`w-full secondary-navigation pb-10 sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <nav className="pt-[6px] pb-0.5">
                      <ul className="flex gap-10 justify-start items-start nav-text nav-list-reset">
                        <li><Link href="/exhibitions/gallery" className="text-accent">Gallery View</Link></li>
                      </ul>
                    </nav>
                  </div>
                );
              }
              return null;
            })()}
          </>
        )}
    </nav>
  );
}
