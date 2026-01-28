'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRetraction } from '@/components/RetractionContext';
import TextListItem from './TextListItem.client';
import ClientPortal from '@/components/ClientPortal';

interface TextItem {
    _id: string;
    title: string;
    slug: { current: string };
    author?: string;
    publishedAt?: string;
    category?: string;
    textContent?: string;
    pdfUrl?: string;
}

interface TextsClientProps {
    texts: TextItem[];
    types: string[];
}

const TYPE_ORDER = [
    'review',
    'statement',
    'exhibition',
    'catalog',
    'interview',
    'other'
];

const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
        case 'review': return 'Review';
        case 'statement': return 'Statement';
        case 'exhibition': return 'Exhibition';
        case 'catalog': return 'Catalog';
        case 'interview': return 'Interview';
        case 'other': return 'Other';
        default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
};

export default function TextsClient({ texts, types: rawTypes }: TextsClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { retractionLevel } = useRetraction();

    const types = rawTypes
        .filter((t, index, self) => {
            if (!t) return false;
            if (self.indexOf(t) !== index) return false;
            // Check if any text belongs to this category
            return texts.some(text => text.category === t);
        })
        .sort((a, b) => {
            const indexA = TYPE_ORDER.indexOf(a);
            const indexB = TYPE_ORDER.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

    const [activeType, setActiveType] = useState<string | null>(() => {
        const typeParam = searchParams.get('type');
        return typeParam ? types.find(t => t.toLowerCase() === typeParam.toLowerCase()) || null : null;
    });

    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    const [isNearBottom, setIsNearBottom] = useState(false);
    const [isInstantTransition, setIsInstantTransition] = useState(false);

    // Detect if user is near the bottom
    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.innerHeight + window.scrollY;
            const threshold = document.documentElement.scrollHeight - 100;
            setIsNearBottom(scrollPos >= threshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const typeParam = searchParams.get('type');
        const searchParam = searchParams.get('search');

        if (typeParam) {
            setActiveType(types.find(t => t.toLowerCase() === typeParam.toLowerCase()) || null);
        } else {
            setActiveType(null);
        }

        if (searchParam !== null) {
            setSearchQuery(searchParam);
        }
    }, [searchParams, types]);

    const handleTypeChange = (type: string | null, fromBottom = false) => {
        const params = new URLSearchParams(searchParams.toString());
        if (type) {
            params.set('type', type.toLowerCase());
            setActiveType(type);
        } else {
            params.delete('type');
            setActiveType(null);
        }

        if (fromBottom) {
             setIsInstantTransition(true);
             window.scrollTo({ top: 0, behavior: 'auto' });
             router.push(`${pathname}?${params.toString()}`, { scroll: false });
             
             setTimeout(() => {
                 setIsInstantTransition(false);
             }, 500);
        } else {
             setIsInstantTransition(false);
             router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
    };

    const filteredTexts = texts.filter((t) => {
        const matchesType = !activeType || t.category === activeType;
        const matchesSearch = !searchQuery ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.author && t.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (t.textContent && t.textContent.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesType && matchesSearch;
    });

    return (
        <div className="w-full min-h-screen">
            {/* Category Tabs */}
            <div className={`w-full secondary-navigation sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                <nav className="second-nav pt-[6px] pb-[7px] relative">
                    <div className="nav-container-alignment flex gap-x-3 gap-y-1 items-start justify-start flex-wrap font-bold italic uppercase">
                        <button
                            onClick={() => handleTypeChange(null)}
                            className={`nav-text transition-colors whitespace-nowrap ${activeType === null ? 'active' : ''}`}
                        >
                            All
                        </button>
                        {types.map((type) => (
                            <button
                                key={type}
                                onClick={() => handleTypeChange(type)}
                                className={`nav-text transition-colors whitespace-nowrap ${activeType === type ? 'active' : ''}`}
                            >
                                {getTypeLabel(type)}
                            </button>
                        ))}
                    </div>
                    <div className="border-b-[1px] border-foreground w-full absolute bottom-0 left-0" />
                </nav>
            </div>

            {/* Texts Feed */}
            <ClientPortal selector="footer-portal-content">
                <AnimatePresence>
                    {isNearBottom && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                exit={{ opacity: 0, scaleX: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="border-t-[1px] border-foreground w-full absolute top-0 left-0 origin-left" 
                            />
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="nav-container-alignment w-full pt-[6px]"
                            >
                                <ul className="flex gap-x-3 gap-y-1 justify-start items-start nav-text nav-list-reset flex-wrap font-bold italic uppercase">
                                    <li>
                                        <button
                                            onClick={() => handleTypeChange(null, true)}
                                            className={`transition-colors whitespace-nowrap uppercase ${activeType === null ? 'active' : ''}`}
                                        >
                                            All
                                        </button>
                                    </li>
                                    {types.map((type) => (
                                        <li key={`footer-${type}`}>
                                            <button
                                                onClick={() => handleTypeChange(type, true)}
                                                className={`transition-colors whitespace-nowrap uppercase ${activeType === type ? 'active' : ''}`}
                                            >
                                                {getTypeLabel(type)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </ClientPortal>

            <motion.div 
               animate={{ opacity: isInstantTransition ? 0 : 1 }}
               className="pt-10 md:pt-24 lg:pt-32 pb-20"
            >
                <div className="flex flex-col">
                    {filteredTexts.map((text, index) => (
                        <TextListItem key={text._id} text={text} index={index} />
                    ))}
                </div>

                {filteredTexts.length === 0 && (
                    <div className="text-center py-32 px-4">
                        <p className="font-owners uppercase text-lg opacity-60">
                            No texts found in this category.
                        </p>
                    </div>
                )}
            </motion.div>

        </div>
    );
}
