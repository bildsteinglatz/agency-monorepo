'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
    label: string;
    href: string;
}

interface PinguinNavProps {
    items?: NavItem[];
}

const defaultNavItems = [
    { label: 'Buchen', href: '/pinguin#buchen' },
    { label: 'Für wen?', href: '/pinguin#fuer-wen' },
    { label: 'Team', href: '/pinguin/team' },
    { label: 'Galerie', href: '/pinguin/gallery' },
];

export function PinguinNav({ items = defaultNavItems }: PinguinNavProps) {
    const pathname = usePathname();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.warn(`Element with id "${id}" not found`);
        }
    };

    return (
        <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="hidden lg:block fixed left-0 top-1/2 -translate-y-1/2 z-50"
        >
            <div className="flex flex-col bg-black border-y-4 border-r-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
                {items.map((item, index) => {
                    // Check if this is a hash link on the current page
                    const [path, hash] = item.href.split('#');
                    const isCurrentPage = pathname === path || (path === '/pinguin' && pathname === '/pinguin/');
                    const isHashLink = !!hash;

                    if (isCurrentPage && isHashLink) {
                        return (
                            <button
                                key={index}
                                onClick={() => scrollToSection(hash)}
                                className="text-left px-6 py-3 text-white font-bold uppercase text-sm tracking-widest hover:bg-[#FF3100] transition-colors border-b-2 border-white last:border-b-0"
                            >
                                {item.label}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className="text-left px-6 py-3 text-white font-bold uppercase text-sm tracking-widest hover:bg-[#FF3100] transition-colors border-b-2 border-white last:border-b-0 block"
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}
