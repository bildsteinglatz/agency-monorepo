'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export default function ScrollIndicator({ variant = 'dark', bottomClass = 'bottom-32', position = 'fixed' }: { variant?: 'dark' | 'light', bottomClass?: string, position?: 'fixed' | 'absolute' }) {
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 100], [0.7, 0]);
    const y = useTransform(scrollY, [0, 100], [0, -20]);

    const borderClass = variant === 'light' ? 'border-white' : 'border-black';
    const barClass = variant === 'light' ? 'w-1.5 h-4 bg-white' : 'w-1.5 h-4 bg-black';
    const textClass = variant === 'light' ? 'text-white' : 'text-black';
    const positionClass = position === 'absolute' ? 'absolute' : 'fixed';

    return (
        <motion.div
            style={{ opacity, y }}
            className={`${positionClass} ${bottomClass} left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none`}
        >
            <div className={`w-8 h-14 border-4 ${borderClass} flex justify-center p-2 relative bg-transparent`}>
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={barClass}
                />
            </div>
            <span className={`${textClass} text-[10px] font-black tracking-[0.2em] uppercase`}>
                Scroll Down
            </span>
        </motion.div>
    );
}
