'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useScroll, useMotionValueEvent } from 'framer-motion';

interface RetractionContextType {
    retractionLevel: number; // 0: all visible, 1: logo out, 2: main nav out, 3: artworks nav out, 4: all out
    setTempHidden: (hidden: boolean) => void;
}

const RetractionContext = createContext<RetractionContextType>({
    retractionLevel: 0,
    setTempHidden: () => { },
});

export const useRetraction = () => useContext(RetractionContext);

export const RetractionProvider = ({ children }: { children: React.ReactNode }) => {
    const [retractionLevel, setRetractionLevel] = useState(0);
    const [tempHidden, setTempHidden] = useState(false);
    const pathname = usePathname();
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        const scrollDelta = latest - previous;

        if (latest <= 10 && !tempHidden) {
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
            // Release temp hidden state on significant scroll up ONLY if not at the very top (avoids reset on scrollTo(0))
            if (latest > 10) {
                setTempHidden(false);
            }
        }

        // Ensure that if we are temp hidden, we stay hidden (Level 4) unless we are at top (handled above) or scrolling up (handled above)
        // Actually, if tempHidden is TRUE, we want Level 4 forced?
        // If we are at top (latest <= 10) and tempHidden is true, we skip setRetractionLevel(0).
        // So level remains whatever it was?
        // We should force it to 4 if tempHidden is set.
    });

    // Determine if we need to force level 4 when tempHidden becomes true
    useEffect(() => {
        if (tempHidden) {
            setRetractionLevel(4);
        }
    }, [tempHidden]);

    return (
        <RetractionContext.Provider value={{ retractionLevel, setTempHidden }}>
            {children}
        </RetractionContext.Provider>
    );
};
