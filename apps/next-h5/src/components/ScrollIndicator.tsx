'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ScrollIndicator({ variant = 'dark', bottomClass = 'bottom-32', position = 'fixed', fadeStart, fadeEnd, removeAfterScreens, containerClass = 'left-1/2 -translate-x-1/2', barColorClass }: { variant?: 'dark' | 'light' | 'yellow', bottomClass?: string, position?: 'fixed' | 'absolute', fadeStart?: number, fadeEnd?: number, removeAfterScreens?: number, containerClass?: string, barColorClass?: string }) {
    const { scrollY } = useScroll();
    // If removeAfterScreens is provided, keep indicator fully visible until that many viewport heights have been scrolled,
    // then hide it instantly (small transition). Otherwise fall back to fadeStart/fadeEnd mapping.
    const [removePoint, setRemovePoint] = useState<number | null>(null);
    useEffect(() => {
        if (typeof removeAfterScreens === 'number' && typeof window !== 'undefined') {
            setRemovePoint(window.innerHeight * removeAfterScreens);
        }
    }, [removeAfterScreens]);

    let opacity: any;
    if (removePoint !== null) {
        opacity = useTransform(scrollY, [Math.max(0, removePoint - 10), removePoint + 10], [1, 0]);
    } else if (typeof fadeStart === 'number' && typeof fadeEnd === 'number') {
        opacity = useTransform(scrollY, [fadeStart, fadeEnd], [0.9, 0]);
    } else {
        opacity = useTransform(scrollY, [0, 100], [0.9, 0]);
    }
    // Keep position fixed visually; do not translate with scroll when using removeAfterScreens
    const y = 0;

    const borderClass = variant === 'light' ? 'border-white' : variant === 'yellow' ? 'border-[#facc15]' : 'border-black';
    const barClass = barColorClass || (variant === 'light' ? 'bg-white' : variant === 'yellow' ? 'bg-[#facc15]' : 'bg-black');
    const textClass = variant === 'light' ? 'text-white' : variant === 'yellow' ? 'text-[#facc15]' : 'text-black';
    const positionClass = position === 'absolute' ? 'absolute' : 'fixed';

    return (
        <motion.div
            style={{ opacity, y }}
            className={`${positionClass} ${bottomClass} ${containerClass} z-20 flex flex-col items-center gap-1 pointer-events-none`}
        >
            <div className={`w-8 h-14 border-4 ${borderClass} flex justify-center p-2 relative bg-transparent`}>
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`w-1.5 h-4 ${barClass}`}
                />
            </div>
            <span className={`${textClass} text-[10px] font-black tracking-[0.2em] uppercase`}>
                Scroll Down
            </span>
        </motion.div>
    );
}
