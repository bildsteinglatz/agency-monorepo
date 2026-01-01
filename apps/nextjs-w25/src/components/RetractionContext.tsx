'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface RetractionContextType {
    retractionLevel: number; // 0: all visible, 1: logo out, 2: main nav out, 3: artworks nav out, 4: all out
}

const RetractionContext = createContext<RetractionContextType>({
    retractionLevel: 0,
});

export const useRetraction = () => useContext(RetractionContext);

export const RetractionProvider = ({ children }: { children: React.ReactNode }) => {
    const [retractionLevel, setRetractionLevel] = useState(0);
    const lastScrollY = useRef(0);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== '/artworks-ii') {
            setRetractionLevel(0);
            return;
        }

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollY.current;

            if (currentScrollY <= 20) {
                // At the very top, everything should be visible
                setRetractionLevel(0);
            } else if (scrollDelta > 0) {
                // Scrolling DOWN - Increase level sequentially
                // Using 20px steps for a smooth staggered effect
                if (currentScrollY > 100) setRetractionLevel(4);
                else if (currentScrollY > 80) setRetractionLevel(3);
                else if (currentScrollY > 60) setRetractionLevel(2);
                else if (currentScrollY > 40) setRetractionLevel(1);
            } else if (scrollDelta < -20) {
                // Scrolling UP - Show everything immediately
                setRetractionLevel(0);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    return (
        <RetractionContext.Provider value={{ retractionLevel }}>
            {children}
        </RetractionContext.Provider>
    );
};
