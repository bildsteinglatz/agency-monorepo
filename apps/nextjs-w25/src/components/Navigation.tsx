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

  // Hide navigation on virtual painting page and portfolio
  if (pathname === '/virtual-painting' || pathname === '/spectral' || pathname.startsWith('/portfolio')) {
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

          <div className={`w-full relative sticky top-0 z-[100] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 2 ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
            <nav className="flex items-center pt-8 pb-[5px]">
              <div className="nav-container-alignment">
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
                      href="/texts"
                      className={pathname.startsWith('/texts') ? 'active' : ''}
                    >
                      Texts
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/exhibitions-list"
                      className={['/portrait', '/exhibitions-list', '/contact', '/imprint', '/agb'].some(p => pathname.startsWith(p)) ? 'active' : ''}
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
              </div>
            </nav>
            {/* Absolute full-bleed line for first nav */}
            <div className="border-b-[1px] border-foreground w-full absolute bottom-0 left-0" />
          </div>
        </>
      )}

      {
        showNavLinks && (
          <>
            {(() => {
              if (pathname === '/about' || pathname === '/portrait' || pathname === '/exhibitions-list' || pathname === '/contact' || pathname === '/imprint' || pathname === '/agb') {
                return (
                  <div className={`w-full secondary-navigation sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <nav className="second-nav pt-[6px] pb-[7px] relative">
                      <div className="nav-container-alignment">
                        <ul className="flex gap-x-3 gap-y-1 justify-start items-start nav-text nav-list-reset flex-wrap font-bold italic uppercase">
                          <li><Link href="/portrait" className={`${pathname === '/portrait' ? 'active' : ''}`}>Portrait</Link></li>
                          <li><Link href="/exhibitions-list" className={`${pathname === '/exhibitions-list' ? 'active' : ''}`}>CV</Link></li>
                          <li><Link href="/contact" className={`${pathname === '/contact' ? 'active' : ''}`}>Contact</Link></li>
                          {isAuthenticated && showAGB && (
                            <li><Link href="/agb" className={`${pathname === '/agb' ? 'active' : ''}`}>AGB</Link></li>
                          )}
                          <li><Link href="/imprint" className={`${pathname === '/imprint' ? 'active' : ''}`}>Imprint & DSVGO</Link></li>
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
                      </div>
                      {/* Absolute full-bleed line for second nav */}
                      <div className="border-b-[1px] border-foreground w-full absolute bottom-0 left-0" />
                    </nav>
                  </div>
                );
              }

              if (pathname.startsWith('/gallery') || pathname.startsWith('/virtual-painting') || pathname.startsWith('/writing')) {
                return (
                  <div className={`w-full secondary-navigation sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <nav className="second-nav pt-[6px] pb-[7px] relative">
                      <div className="nav-container-alignment">
                        <ul className="flex gap-x-3 gap-y-1 justify-start items-start nav-text nav-list-reset font-bold italic uppercase">
                          {showWriting && (
                            <li><Link href="/writing" className={`${pathname.startsWith('/writing') ? 'active' : ''}`}>Writing</Link></li>
                          )}
                          {showPainting && (
                            <li><Link href="/virtual-painting" className={`${pathname.startsWith('/virtual-painting') ? 'active' : ''}`}>Painting</Link></li>
                          )}
                          {showCurating && (
                            <li><Link href="/gallery" className={`${pathname.startsWith('/gallery') ? 'active' : ''}`}>Curating</Link></li>
                          )}
                        </ul>
                      </div>
                      {/* Absolute full-bleed line for second nav */}
                      <div className="border-b-[1px] border-foreground w-full absolute bottom-0 left-0" />
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
                    <nav className="second-nav pt-[6px] pb-[7px] relative">
                      <div className="nav-container-alignment">
                        <ul className="flex gap-10 justify-start items-start nav-text nav-list-reset font-bold italic uppercase">
                          <li>
                            <a href="/artworks-browse-controlsrow" className="text-[#ff6600]">Search All Artwork</a>
                          </li>
                        </ul>
                      </div>
                      {/* Absolute full-bleed line for second nav */}
                      <div className="border-b-[1px] border-foreground w-full absolute bottom-0 left-0" />
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
                    <nav className="second-nav pt-[6px] pb-0.5">
                      <div>
                        <ul className="flex gap-x-3 justify-start items-start nav-text nav-list-reset">
                          <li><Link href="/exhibitions/gallery" className="text-accent">Gallery View</Link></li>
                        </ul>
                      </div>
                    </nav>
                  </div>
                );
              }
              return null;
            })()}
          </>
        )
      }
    </nav >
  );
}
