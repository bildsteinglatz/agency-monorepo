'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Instagram, Mail, Phone, MapPin, LucideIcon } from 'lucide-react';

interface NavLink {
    label: string;
    href: string;
    icon?: LucideIcon;
}

interface NavSection {
    title: string;
    links: NavLink[];
}

const SITEMAP: NavSection[] = [
    {
        title: 'Halle 5',
        links: [
            { label: 'Künstler:innen', href: '/artists' },
            { label: 'Veranstaltungen', href: '/events' },
            { label: 'Über Halle 5', href: '/konzept' },
            { label: 'Adlassnig KG & Kulurturverein Halle 5', href: '/about#about-sections' },
            { label: 'Standort & Anfahrt', href: '/visit' },         
        ],  
    }, 
    {
        title: 'Kulturverein Halle 5',
        links: [
            { label: 'Offenes Atelier Pinguin', href: '/pinguin' },
            { label: 'Workshops', href: '/workshops' },
            { label: 'Mitgliedschaft', href: '/member' },
            { label: 'Fördergeber', href: '/partners#funding' },
            { label: 'Kooperationspartner', href: '/partners#cooperation' },        ],
    },
     {
        title: 'Atelier für Auẞergewöhnliche Angelegenheiten',
        links: [
            { label: 'Kontakt AfAA', href: '/atelier-aaa#kontakt' },
            { label: 'Referenzen Institutionen', href: '/atelier-aaa#referenzen' },
            { label: 'Referenzen Künstler:innen', href: '/atelier-aaa#referenzen-kuenstler' },
            { label: 'Über Roland Adlassnigg', href: '/atelier-aaa#ueber-roland' },
        ],
    },
    {
        title: 'virtueller Spielplatz',
        links: [
            { label: 'Malraum', href: '/virtual-painting' },
            { label: 'Pong', href: '/pong' },
            { label: "Franzi's Pixel Pottery", href: '/pottery' },
            { label: "Halle 5 Concierge", href: '/open-concierge' },
       ],
    },
];

export default function Footer() {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    // Hide footer on full-screen interactive pages
    const isHiddenPage = ['/virtual-painting', '/pong', '/pottery'].includes(pathname);

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const handleCloseSitemap = () => setIsExpanded(false);
        window.addEventListener('open-roland-bio', handleCloseSitemap);
        window.addEventListener('open-concierge', handleCloseSitemap);
        return () => {
            window.removeEventListener('open-roland-bio', handleCloseSitemap);
            window.removeEventListener('open-concierge', handleCloseSitemap);
        };
    }, []);

    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        if (href === '/open-concierge') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('open-concierge'));
            setIsExpanded(false);
            return;
        }

        if (href.includes('#')) {
            const [path, hash] = href.split('#');
            if (pathname === path) {
                e.preventDefault();
                
                if (hash === 'ueber-roland') {
                    window.dispatchEvent(new CustomEvent('open-roland-bio'));
                } else {
                    const element = document.getElementById(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                setIsExpanded(false);
            }
        } else {
            // Close sitemap when navigating to other pages
            setIsExpanded(false);
        }
    };

    if (isHiddenPage) return null;

    return (
        <footer className="w-full bg-black text-white relative z-50 border-t border-white/5 font-sans selection:bg-[#FF3100] selection:text-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Sleek Footer Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center py-8 h-auto md:h-20 gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="hidden md:flex items-center gap-4 text-[11px] uppercase font-bold tracking-[0.15em] text-white">
                            <Link href="/visit" className="hover:text-[#FF3100] transition-colors duration-300">
                                © {new Date().getFullYear()} Halle 5, Spinnergasse 1, 6850 Dornbirn
                            </Link>
                            <span className="w-1 h-1 bg-[#FF3100] rounded-full" />
                            <Link href="mailto:info@halle5.at" className="text-white hover:text-[#FF3100] transition-all duration-300 transform hover:scale-110">
                                <Mail className="w-4 h-4" />
                            </Link>
                            <span className="w-1 h-1 bg-[#FF3100] rounded-full" />
                            <Link href="/impressum" className="hover:text-[#FF3100] transition-colors duration-300">Impressum</Link>
                            <Link href="/datenschutz" className="hover:text-[#FF3100] transition-colors duration-300">Datenschutz (Dsvgo)</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {!isHomePage && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 hover:border-[#FF3100]/50 hover:bg-white/5 transition-all duration-500 group"
                            >
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] group-hover:text-[#FF3100] transition-colors duration-300">
                                    {isExpanded ? 'einklappen' : 'ausklappen'}
                                </span>
                                <div className="relative w-3 h-3">
                                    <AnimatePresence mode="wait">
                                        {isExpanded ? (
                                            <m.div
                                                key="up"
                                                initial={{ opacity: 0, rotate: -90 }}
                                                animate={{ opacity: 1, rotate: 0 }}
                                                exit={{ opacity: 0, rotate: 90 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronDown className="w-3 h-3 text-white group-hover:text-[#FF3100] transform rotate-180" />
                                            </m.div>
                                        ) : (
                                            <m.div
                                                key="down"
                                                initial={{ opacity: 0, rotate: 90 }}
                                                animate={{ opacity: 1, rotate: 0 }}
                                                exit={{ opacity: 0, rotate: -90 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronUp className="w-3 h-3 text-white group-hover:text-[#FF3100]" />
                                            </m.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Expandable Sitemap Section */}
                <AnimatePresence initial={false}>
                    {(isHomePage || isExpanded) && (
                        <m.div
                            key="sitemap-content"
                            initial={isHomePage ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: [0.23, 1, 0.32, 1],
                            }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 py-16 border-t border-white/5">
                                {SITEMAP.map((column) => (
                                    <div key={column.title} className="flex flex-col gap-5">
                                        <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#FF3100] font-black">
                                            {column.title}
                                        </h3>
                                        <ul className="flex flex-col gap-3">
                                            {column.links.map((link) => (
                                                <li key={link.label}>
                                                    <Link
                                                        href={link.href}
                                                        onClick={(e) => handleLinkClick(e, link.href)}
                                                        className="group flex items-center gap-2 text-[11px] text-white hover:text-[#FF3100] transition-all duration-300 ease-out"
                                                    >
                                                        {link.icon && <link.icon className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />}
                                                        <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>

                {/* Mobile Bottom Info (Visible when not expanded) */}
                {!isExpanded && !isHomePage && (
                    <div className="md:hidden flex flex-row items-center justify-center gap-4 py-4 border-t border-white text-[9px] uppercase tracking-widest text-white">
                        <Link href="/impressum" className="hover:text-white transition-colors duration-300">Impressum</Link>
                        <span className="opacity-50">/</span>
                        <Link href="/datenschutz" className="hover:text-white transition-colors duration-300">Datenschutz (Dsvgo)</Link>
                    </div>
                )}
            </div>
        </footer>
    );
}
