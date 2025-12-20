'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export default function ScrollIndicator() {
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 100], [0.7, 0]);
    const y = useTransform(scrollY, [0, 100], [0, -20]);

    return (
        <motion.div
            style={{ opacity, y }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
        >
            <div className="w-8 h-14 border-4 border-white flex justify-center p-2 relative bg-black/20 backdrop-blur-sm">
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-1.5 h-4 bg-yellow-400"
                />
            </div>
            <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase drop-shadow-md">
                Scroll Down
            </span>
        </motion.div>
    );
}
