'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubOpen, setIsSubOpen] = useState(false);

    const pathname = usePathname();

    if (pathname === '/virtual-painting' || pathname === '/pong' || pathname === '/pottery') return <div className="hidden" />;

    return (
        <nav className="sticky top-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-black border-b-2 border-black h-16 opacity-100 translate-y-0 pointer-events-auto">
            <div className="w-full px-4 min-h-[4rem]">
                <div className="flex justify-between h-16">
                    <div className="flex w-full justify-between items-center">
                        <Link href="/" className="flex items-center text-white hover:text-[#FF3100] transition-colors group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto fill-current" viewBox="0 0 147.4 20.88">
                                <path d="M42.09 13.64c.27.55.82 1.98.95 2.45.15.52.32 1.03.48 1.53.07.23.21.4.43.48.22 0 .33-.15.38-.37.16-.76.08-1.53-.07-2.28-.31-1.51-.86-2.93-1.61-4.26-.37-.66-.73-1.32-1.2-1.92-.38-.49-.62-1.06-.86-1.64-.12-.28-.12-.53-.04-.83.17-.55.4-1.06.65-1.56.16-.32.37-.55.68-.69.12-.05.22-.14.35-.24-.07-.09-.11-.2-.17-.21-.3-.07-.6-.07-.86.12-.41.3-.87.42-1.33.57-.18.06-.37.12-.52.22-.4.28-.66.67-.67 1.2v1.11c0 .52-.08 1-.3 1.48-.48 1.05-.9 2.13-1.37 3.18-.19.44-.41.87-.67 1.26-.48.73-.65 1.55-.77 2.4-.04.28-.07.56-.11.88.04.26.08.57.14.88.07.33.42.48.71.31.2-.11.33-.28.4-.51.11-.35.23-.7.32-1.05.12-.44.13-1.72.4-2.09.43-.31.63.52.63.52.04.13.07.26.07.39.01.37-.04.73-.07 1.1-.01.2-.07.41-.03.59.12.56.09 1.13.12 1.7.01.28.07.56.12.95-.01.05-.06.21-.1.38-.1.42-.35.69-.74.82-.33.12-.66.2-1.02.2-1.34-.03-2.69-.02-4.04-.03-.38 0-.75-.02-1.12-.1-.42-.08-.86-.06-1.29-.07h-2.1c-.32 0-.64.06-.96.1-.45.07-.91.09-1.4-.01-.04-.15-.13-.3-.12-.45 0-.16.08-.33.15-.48.71-1.66 1.45-3.3 2.36-4.86.04-.07.08-.15.11-.23.6-1.21 1.2-2.42 1.81-3.62.81-1.61 1.62-3.21 2.42-4.82.23-.45.43-.92.64-1.38.49-1.08.96-2.16 1.45-3.24.12-.26.25-.5.38-.75.58-.29 1.11-.32 1.65-.31 1.16.02 2.31.02 3.47 0 .29 0 .58-.11.88-.12.81-.02 1.61-.02 2.42-.02.2 0 .37.08.51.22.22.21.41.45.54.74.26.59.54 1.18.82 1.76.24.51.48 1.02.73 1.52.4.81.8 1.61 1.2 2.42.01.03.03.05.04.07.23.8.6 1.52.98 2.24.42.8.8 1.61 1.2 2.41.12.25.24.51.34.77.5 1.35 1.11 2.65 1.81 3.9.29.51.56 1.04.85 1.55s.61 1 .91 1.51c.16.26.36.5.44.76-.05.37-.27.51-.52.45-1.2-.28-2.41-.1-3.62-.15-.45-.02-.92-.03-1.36.14-.02 0-.05.01-.08.01-.83.06-1.66.16-2.49.16-.61 0-1.23-.1-1.84-.2-.24-.04-.47-.06-.71 0-.54.13-1.07-.01-1.58-.19-.07-.02-.12-.11-.17-.17-.03-.28.09-.51.25-.7.3-.34.54-.72.62-1.18.11-.64.27-1.28.13-1.94a5 5 0 0 1-.08-.76c-.01-.68 0-1.36 0-2.09.12-.05-.11-.01 0 0m95.5-1.06c-.32-.01-.56-.03-.79-.03-1.88 0-3.77.02-5.65.03-.62 0-1.24-.02-1.86 0-.37 0-.75.08-1.12.11-.29.02-.59.04-.88.04-.09 0-.19-.09-.3-.15-.02-.2-.05-.4-.06-.59-.03-.77.04-1.54-.12-2.3-.03-.14-.02-.29 0-.43.17-1.16-.06-2.32-.03-3.48.03-1.16 0-2.32-.03-3.48-.02-.5-.12-1-.19-1.53.26-.19.53-.33.88-.22.2.06.43.06.64.04.53-.04 1.06-.1 1.59-.1.38 0 .75-.03 1.12.08.17.05.37.03.56.03 1.16 0 2.31.02 3.47.02.4 0 .8-.01 1.2-.11.28-.07.59-.05.88-.05 1.4 0 2.8.02 4.2.02.78 0 1.57.03 2.34-.07.8-.11 1.61-.1 2.41-.14.27-.01.54 0 .76 0 .69.42.87 1.04.84 1.77 0 .11 0 .24-.04.34-.2.53-.15 1.05.04 1.61-.16.09-.28.21-.43.24-.18.04-.37 0-.56.01-.48.01-.97-.04-1.44.12-.1.03-.21.03-.32.03-1.13 0-2.26.02-3.39-.01-.51-.01-1.01-.17-1.52-.12-.27.02-.53.06-.8.08-.37.03-.75.07-1.12.08-.62.01-1.24.02-1.86 0-.46 0-.9.11-1.37.25-.04.17-.1.33-.11.49-.01.4 0 .8 0 1.2 0 .34.02.68 0 1.03 0 .31-.05.62-.07.94.08.19.23.31.43.31.54 0 1.08.04 1.61-.03.38-.05.75-.09 1.12-.09 1.61 0 3.23-.04 4.84.01.74.02 1.5.1 2.22.33.5.16.94.42 1.33.78.12.11.23.25.37.33.61.36.78.99.9 1.64.13.73.16 1.47.16 2.21s.01 1.48 0 2.22c-.01.66-.15 1.3-.35 1.92-.19.59-.59 1.03-1.09 1.33-.51.31-1.05.57-1.59.82-.22.1-.46.17-.7.19-.88.07-1.77.15-2.65.17-1.91.03-3.82.03-5.73.04-.32 0-.64.06-.96.1-.99.1-1.97.31-2.97.2-.56-.06-1.12-.16-1.68-.13-.16 0-.33-.01-.48.02-.77.18-1.47-.1-2.1-.27-.31-.35-.37-.68-.38-1.03-.01-.68.04-1.36-.1-2.04-.04-.17.08-.37.11-.5.31-.32.64-.3.96-.3 1.08 0 2.15-.02 3.23 0 .99.02 1.98.1 2.98.12.97.02 1.94.02 2.91.02.22 0 .43.02.64-.01.12-.02.24-.1.37-.15.01-.14.05-.25.03-.36-.09-.7-.19-1.4-.27-2.11-.03-.25 0-.51-.01-.77 0-.2-.01-.39-.02-.68ZM97.45.74c.2-.32.44-.39.73-.39 1.32.01 2.64.01 3.95.01 2.07 0 4.14.01 6.21 0 1.75 0 3.5.02 5.24-.06.96-.04 1.93-.04 2.88-.27.41-.1.8.02 1.18.19.23.11.43.31.42.58-.04.88.28 1.75.14 2.63-.06.37-.38.51-.74.53-1.47.06-2.95.13-4.42.18-.89.03-1.77 0-2.66.01-.27 0-.53.06-.8.08-.29.02-.59.05-.88.05h-1.75c-.23.15-.3.37-.31.6-.03.96-.17 1.92-.16 2.88 0 .2 0 .4.23.58.13.02.32.06.5.06 1.02 0 2.04 0 3.07-.04.4-.01.8-.1 1.2-.13s.81 0 1.21-.03c.29-.02.58-.11.87-.14.7-.05 1.39.05 2.07.23.28.28.37.62.37 1.01 0 .51 0 1.03.02 1.54 0 .28.04.56.07.92-.08.52-.47.73-.97.72-1.02-.02-2.04.1-3.05-.11-.24-.05-.48-.04-.72-.03-.51.02-1.02.07-1.53.07-.48 0-.96-.04-1.44-.06-.11 0-.22 0-.32.01-.45.06-.89.13-1.31.19-.16.17-.13.35-.13.51 0 .74.02 1.48.02 2.22 0 .35.05.68.26.99.34.19.72.16 1.08.08.35-.08.69-.1 1.04-.1 2.69 0 5.38-.01 8.07-.01.24 0 .48.03.71.1.41.12.63.42.63.88 0 .31.01.63.01.94 0 .37 0 .74-.02 1.11-.02.42-.15.78-.49 1.02-.06.02-.11.06-.16.06-.96.07-1.92.17-2.89.2-.94.03-1.88 0-2.82-.03-.27 0-.53-.07-.8-.08-.46-.02-.92-.09-1.36 0-.59.11-1.18.1-1.76.14-.37.02-.75-.05-1.12.09-.05.02-.11.03-.16.01-.88-.19-1.77-.06-2.65-.11-.91-.05-1.83.05-2.73-.15-.1-.02-.21.01-.32.03-.51.1-1.01.13-1.52 0-.15-.04-.32-.04-.48-.05-.65-.04-1.1-.51-1.09-1.22 0-.6 0-1.2-.01-1.79-.02-.97 0-1.93-.11-2.9-.09-.79-.04-1.59-.05-2.39 0-.57 0-1.13-.1-1.7-.08-.41-.03-.85-.04-1.28l-.03-4.44c0-.43-.03-.85-.09-1.27-.07-.42-.03-.85-.04-1.28 0-.45.02-.91-.11-1.38ZM23.69 20.43c-.26.23-.51.29-.79.28-.56-.01-1.13 0-1.69-.01-.13 0-.28.02-.4-.02-.53-.18-1.06-.12-1.59 0-.23.05-.5.08-.72 0-.51-.15-1.01-.1-1.52-.11h-.74c-.37-.22-.69-.38-.85-.74-.12-.26-.21-.52-.21-.82.01-.46.01-.91 0-1.37-.01-.37-.06-.73-.09-1.1-.02-.31-.08-.63-.03-.93.11-.65.11-1.3.15-1.95.01-.17.06-.33.09-.55-.13-.04-.25-.1-.37-.1h-2.26c-.32 0-.64-.05-.96-.09-.85-.1-1.71-.17-2.59.12-.02.16-.07.32-.07.49v2.56c0 .14-.01.29.02.43.25 1.13.1 2.27.13 3.4 0 .11-.01.23-.04.34-.07.26-.22.45-.47.54-.08.02-.16.06-.23.06-.89 0-1.78.03-2.66-.04-.37-.03-.74-.07-1.12-.08H3.39c-.24 0-.48.04-.72.08-.68.1-1.34.14-2.02-.43-.24-.31-.34-.79-.33-1.33 0-2.02 0-4.05-.02-6.07 0-.51.03-1.02-.11-1.53-.06-.21-.03-.45-.03-.68a1038 1038 0 0 0-.04-5.56c0-.28-.05-.56-.07-.84-.08-.91-.09-1.82.1-2.71.05-.23.16-.42.3-.54.5-.14.96-.27 1.43-.39.13-.03.28-.08.4-.05.51.16 1.01-.05 1.51 0 .51.05 1.02.02 1.53.02h1.53c.32 0 .64-.04.97-.03.48 0 .89.18 1.15.58.28.93.29 1.85.18 2.75-.08.65-.09 1.3-.11 1.95-.02.68 0 1.37 0 2.05 0 .14.03.28.04.46.14.03.26.08.39.08.89 0 1.78-.02 2.66-.02.54 0 1.07.02 1.61.1.42.06.84-.07 1.2-.3.3-.47.23-.97.17-1.44-.18-1.42-.07-2.84-.08-4.27 0-.42.11-.84.18-1.3.05-.09.12-.21.2-.32.16-.21.37-.32.63-.34.83-.05 1.66-.14 2.49-.16 1.34-.03 2.69-.01 4.03 0 .92 0 1.37.4 1.57 1.37.05.22.06.45.06.68 0 2.37 0 4.73.01 7.1 0 1.54.03 3.08.03 4.62 0 1.14 0 2.28-.05 3.42-.03.59-.1 1.19-.11 1.78 0 .39-.24.68-.39.96ZM54.88.38c.24 0 .49-.05.72 0 .69.17 1.39.11 2.09.12.51 0 1.02 0 1.53-.02.64-.03 1.28-.1 1.93-.13.56-.02 1.13 0 1.64 0 .51.27.69.69.7 1.21v2.73c0 2.28-.03 4.56-.03 6.84 0 .65.02 1.31.05 1.96 0 .2.09.39.09.59.01.54.07 1.08-.05 1.61-.08.36-.13.73.12 1.09.14.02.3.06.46.06 2.37 0 4.73-.02 7.1-.04.37 0 .74-.08 1.12-.11.51-.04 1.01-.06 1.52.09.6.18.87.48.92 1.11v.17c0 .63 0 1.25.01 1.88 0 .32-.03.63-.26.9-.32.21-.66.2-1.06.15a7 7 0 0 0-1.77 0c-.54.08-1.07.1-1.6.12-.51.02-1.02-.03-1.52.11-.18.05-.38.04-.56 0-.5-.13-1.02-.1-1.52-.1-2.37-.02-4.73-.03-7.1-.04-.16 0-.32 0-.48.01-1.02.09-2.04-.08-3.05-.18-.66-.07-1.01-.48-1.09-1.26-.03-.28-.04-.58.01-.85.12-.57.09-1.13.1-1.7 0-.66.02-1.31 0-1.97-.02-.62-.1-1.25-.11-1.87-.02-1.42-.02-2.85-.03-4.27 0-.43.01-.86-.01-1.28-.03-.48-.1-.96-.13-1.44-.03-.45.02-.92-.05-1.36-.18-1.11-.06-2.22-.12-3.32-.02-.38.12-.66.46-.82Zm30.46 15.78q.57.285 1.23.27l4.76-.03c.19 0 .37-.03.56-.04.32-.03.64-.08.96-.07.5.02 1 .05 1.51.01.5-.04 1.01.08 1.52.16.13.02.24.12.34.17.21.25.29.52.27.81-.02.34-.05.68-.07 1.02 0 .17-.06.35 0 .5.1.3 0 .56-.07.83-.08.35-.31.52-.64.56-.13.02-.27 0-.4.01-.81.01-1.62-.04-2.42.04-1.58.15-3.17.06-4.75.19-1.02.08-2.04.1-3.06.1-.13 0-.28.02-.4-.01-.61-.18-1.23-.1-1.84-.11-1.24-.02-2.47-.03-3.71-.04-.13 0-.28.01-.4-.03-.47-.15-.96-.13-1.44-.11-.11 0-.22.01-.32 0-.49-.05-.79-.36-.81-.89-.03-.74-.02-1.48-.03-2.22 0-.34 0-.68-.09-1.02-.07-.27-.04-.57-.05-.85-.03-.85.02-1.7-.13-2.55-.08-.5-.03-1.02-.03-1.54 0-.46.03-.92-.01-1.37-.14-1.56-.08-3.13-.2-4.69-.1-1.22-.06-2.44-.12-3.67-.01-.25 0-.51 0-.71.21-.39.51-.51.84-.55.13-.02.27-.01.4-.01 1.4 0 2.8 0 4.2-.02.27 0 .53-.07.8-.08.64-.02 1.29-.04 1.93-.03.18 0 .36.1.54.17.24.09.41.27.5.53.1.29.19.59.18.91-.01.74 0 1.48 0 2.22 0 .66-.02 1.31-.03 1.97 0 .45-.04.9-.08 1.36-.08.7-.1 1.43 0 2.13.1.77.05 1.53.11 2.3.03.45.07.9.13 1.35.08.67.05 1.36.06 2.05 0 .35.02.68.28.97Z" />
                            </svg>
                        </Link>

                        <div className="hidden lg:flex lg:items-center lg:justify-end lg:w-full">
                            <div className="flex items-center gap-[2px]">
                                <Link
                                    href="/visit"
                                    className="group relative inline-flex items-center px-4 h-10 border-2 border-transparent text-sm font-bold uppercase text-white hover:border-[#FF3100] transition-all overflow-hidden"
                                >
                                    <span className="group-hover:opacity-0 transition-opacity">Besuchen</span>
                                    <div className="absolute inset-y-0 left-0 hidden group-hover:flex items-center whitespace-nowrap animate-marquee pl-4">
                                        <span className="text-[#FF3100]">BESUCHEN – FINDE HALLE 5 IM HERZEN DORNBIRNS AM CAMPUS V IN DER SPINNERGASSE 1 —&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        <span className="text-[#FF3100]">BESUCHEN – FINDE HALLE 5 IM HERZEN DORNBIRNS AM CAMPUS V IN DER SPINNERGASSE 1 —&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    </div>
                                </Link>

                                <NavLink href="/artists">Künstler:innen</NavLink>
                                <Link
                                    href="/atelier-aaa"
                                    className="group relative inline-flex items-center px-4 h-10 border-2 border-transparent text-sm font-bold uppercase text-white hover:border-[#FF3100] transition-all overflow-hidden"
                                >
                                    <span className="group-hover:opacity-0 transition-opacity whitespace-nowrap">Kunstproduktion</span>
                                    <div className="absolute inset-y-0 left-0 hidden group-hover:flex items-center whitespace-nowrap animate-marquee pl-4">
                                        <span className="text-[#FF3100]">KUNSTPRODUKTION – ATELIER FÜR AUSSERGEWÖHLICHE ANGELEGENHEITEN – DEIN PROFESSIONELLER PARTNER FÜR KUNSTPRODUKTION AUF ABBAU UND TRANSPORTE —&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        <span className="text-[#FF3100]">KUNSTPRODUKTION – ATELIER FÜR AUSSERGEWÖHLICHE ANGELEGENHEITEN – DEIN PROFESSIONELLER PARTNER FÜR KUNSTPRODUKTION AUF ABBAU UND TRANSPORTE —&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/pinguin"
                                    className="group relative inline-flex items-center px-4 h-10 border-2 border-transparent text-sm font-bold uppercase text-white hover:border-[#FF3100] transition-all overflow-hidden"
                                >
                                    <span className="group-hover:opacity-0 transition-opacity">Pinguin</span>
                                    <div className="absolute inset-y-0 left-0 hidden group-hover:flex items-center whitespace-nowrap animate-marquee pl-4">
                                        <span className="text-[#FF3100]">PINGUIN – OFFENES ATELIER FÜR KINDER UND JUGENDLICHE —&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        <span className="text-[#FF3100]">PINGUIN – OFFENES ATELIER FÜR KINDER UND JUGENDLICHE —&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    </div>
                                </Link>
                                <NavLink href="/workshops">Workshops</NavLink>
                                <NavLink href="/member" className="bg-[#FF3100] text-white hover:bg-white hover:text-black transition-colors uppercase">Jetzt Mitglied werden</NavLink>

                                <div className="relative group" onMouseLeave={() => setIsSubOpen(false)}>
                                    <button
                                        onMouseEnter={() => setIsSubOpen(true)}
                                        className="inline-flex items-center px-4 h-10 border-2 border-transparent text-sm font-bold uppercase text-white hover:border-[#FF3100] hover:text-[#FF3100] transition-all"
                                    >
                                        Über uns
                                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <div
                                        className={`${isSubOpen ? 'block' : 'hidden'} absolute top-10 right-0 z-50 w-64 bg-black border-2 border-[#FF3100] shadow-[8px_8px_0px_0px_rgba(255,49,0,1)] pt-2 pb-2`}
                                    >
                                        <SubLink href="/konzept">Halle 5 Konzept</SubLink>
                                        <SubLink href="/about#about-sections">Adlassnigg KG & Kulturverein</SubLink>
                                        <SubLink href="/partners">Partner & Fördergeber</SubLink>
                                        <div className="border-t border-[#FF3100] border-opacity-30 my-1"></div>
                                        <SubLink href="/imprint">Imprint</SubLink>
                                        <SubLink href="/register">Register</SubLink>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 border-4 border-white text-white hover:bg-[#FF3100] transition-colors"
                            >
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isOpen ? (
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="4" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="4" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Overlay */}
                <div className={`${isOpen ? 'block' : 'hidden'} lg:hidden bg-black border-t-4 border-[#FF3100] absolute top-16 left-0 w-full z-[100] shadow-[0_20px_50px_rgba(0,0,0,1)] max-h-[calc(100vh-4rem)] overflow-y-auto`}>
                    <div className="flex flex-col p-2 space-y-1">
                        <MobileNavLink href="/visit" onClick={() => setIsOpen(false)}>Besuchen</MobileNavLink>
                        <MobileNavLink href="/artists" onClick={() => setIsOpen(false)}>Künstler:innen</MobileNavLink>
                        <MobileNavLink href="/atelier-aaa" onClick={() => setIsOpen(false)}>Kunstproduktion</MobileNavLink>
                        <MobileNavLink href="/pinguin" onClick={() => setIsOpen(false)}>Pinguin</MobileNavLink>
                        <MobileNavLink href="/workshops" onClick={() => setIsOpen(false)}>Workshops</MobileNavLink>
                        <MobileNavLink href="/events" onClick={() => setIsOpen(false)}>Events</MobileNavLink>
                        <MobileNavLink href="/member" onClick={() => setIsOpen(false)} className="bg-[#FF3100] text-white">Mitglied werden</MobileNavLink>

                        <div className="pt-2 border-t-2 border-[#FF3100]/30 space-y-0.5">
                            <span className="px-2 pb-0.5 block text-[8px] text-[#FF3100] font-black tracking-widest uppercase">Über uns</span>
                            <MobileNavLink href="/konzept" onClick={() => setIsOpen(false)} isSub>Halle 5 Konzept</MobileNavLink>
                            <MobileNavLink href="/about#about-sections" onClick={() => setIsOpen(false)} isSub>Adlassnigg KG & Kulturverein</MobileNavLink>
                            <MobileNavLink href="/partners" onClick={() => setIsOpen(false)} isSub>Partner & Fördergeber</MobileNavLink>
                            <div className="border-t-2 border-[#FF3100]/30 my-1"></div>
                            <div className="flex gap-1">
                                <MobileNavLink href="/imprint" onClick={() => setIsOpen(false)} isSub>Imprint</MobileNavLink>
                                <MobileNavLink href="/register" onClick={() => setIsOpen(false)} isSub>Register</MobileNavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center px-4 h-10 border-2 border-transparent text-sm font-bold uppercase text-white hover:border-[#FF3100] hover:text-[#FF3100] transition-all ${className}`}
        >
            {children}
        </Link>
    );
}

function SubLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
    return (
        <Link
            href={href}
            className={`block px-4 py-2 text-sm font-bold uppercase text-white hover:bg-[#FF3100] hover:text-white transition-colors ${className}`}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, children, onClick, className = "", isSub = false }: { href: string; children: React.ReactNode; onClick: () => void; className?: string; isSub?: boolean }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`block px-2 py-1 text-sm font-black uppercase text-white border-2 border-transparent hover:border-[#FF3100] hover:bg-white hover:text-black transition-all ${isSub ? 'text-xs pl-4 border-l-2 border-l-[#FF3100]' : ''} ${className}`}
        >
            {children}
        </Link>
    );
}
