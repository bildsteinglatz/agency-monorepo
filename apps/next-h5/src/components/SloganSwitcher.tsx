'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slogans = ['entdecken', 'schaffen', 'verbinden'];

export default function SloganSwitcher() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % slogans.length);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-12 md:h-16 flex items-center justify-start md:justify-end">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    // Large Y values to fly in/out of the whole hero section
                    initial={{ y: 600, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -600, opacity: 0 }}
                    transition={{
                        duration: 0.7,
                        ease: [0.23, 1, 0.32, 1]
                    }}
                    className="whitespace-nowrap text-yellow-400 text-4xl md:text-7xl font-black italic tracking-tighter"
                >
                    {slogans[index]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
