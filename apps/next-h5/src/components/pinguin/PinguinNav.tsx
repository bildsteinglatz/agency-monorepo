'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NavItem {
    label: string;
    id: string;
}

interface PinguinNavProps {
    items?: NavItem[];
}

const defaultNavItems = [
    { label: 'Buchen', id: 'buchen' },
    { label: 'Für wen?', id: 'fuer-wen' },
    { label: 'Flow!', id: 'flow' },
    { label: 'Ablauf', id: 'ablauf' },
    { label: 'Regeln', id: 'regeln' },
    { label: 'Tabus', id: 'tabus' },
    { label: 'Team', id: 'team' },
    { label: 'Galerie', id: 'galerie' },
    { label: 'Buchen', id: 'buchen' },
];

export function PinguinNav({ items = defaultNavItems }: PinguinNavProps) {
    const [activeSection, setActiveSection] = useState('');

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
            className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-4"
        >
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left group flex items-center gap-2"
                >
                    <span className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-white font-bold uppercase text-sm tracking-widest hover:text-[#FF3100] transition-colors bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
                        {item.label}
                    </span>
                </button>
            ))}
        </motion.nav>
    );
}
