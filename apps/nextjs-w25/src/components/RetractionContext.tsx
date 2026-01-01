'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useScroll, useMotionValueEvent } from 'framer-motion';

interface RetractionContextType {
    retractionLevel: number; // 0: all visible, 1: logo out, 2: main nav out, 3: artworks nav out, 4: all out
}

const RetractionContext = createContext<RetractionContextType>({
    retractionLevel: 0,
});

export const useRetraction = () => useContext(RetractionContext);

export const RetractionProvider = ({ children }: { children: React.ReactNode }) => {
    const [retractionLevel, setRetractionLevel] = useState(0);
    const pathname = usePathname();
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (pathname !== '/artworks-ii') {
            if (retractionLevel !== 0) setRetractionLevel(0);
            return;
        }

        const previous = scrollY.getPrevious() || 0;
        const scrollDelta = latest - previous;

        if (latest <= 10) {
            setRetractionLevel(0);
        } else if (scrollDelta > 0) {
            // Scrolling DOWN - Disappear almost immediately
            if (latest > 50) setRetractionLevel(4);
            else if (latest > 35) setRetractionLevel(3);
            else if (latest > 20) setRetractionLevel(2);
            else if (latest > 10) setRetractionLevel(1);
        } else if (scrollDelta < -20) {
            // Scrolling UP - Appear only when very close to the top
            if (latest < 80) {
                setRetractionLevel(0);
            }
        }
    });

    return (
        <RetractionContext.Provider value={{ retractionLevel }}>
            {children}
        </RetractionContext.Provider>
    );
};
