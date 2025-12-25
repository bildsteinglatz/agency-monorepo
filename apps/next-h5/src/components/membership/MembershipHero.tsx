'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import ScrollIndicator from '@/components/ScrollIndicator';

interface MembershipHeroProps {
    description?: string;
}

export function MembershipHero({ description }: MembershipHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // 0 to 0.2: Initial text is visible
    // 0.2 to 0.6: Initial text flies out left, DB text flies in from right (Smoother transition)
    // 0.6 to 0.8: DB text is visible
    // 0.8 to 1.0: DB text flies out left

    const initialX = useTransform(scrollYProgress, [0.2, 0.6], [0, -1200]);
    const initialOpacity = useTransform(scrollYProgress, [0.2, 0.5], [1, 0]);

    const dbX = useTransform(scrollYProgress, [0.125, 0.425, 0.9, 1.0], [1200, 0, 0, -1200]);
    const dbOpacity = useTransform(scrollYProgress, [0.25, 0.5, 0.8, 0.9], [0, 1, 1, 0]);

    // The box itself stays sticky but eventually moves up
    const boxY = useTransform(scrollYProgress, [0.8, 1.0], [0, -100]);
    const boxOpacity = useTransform(scrollYProgress, [0.9, 1.0], [1, 0]);

    return (
        <section ref={containerRef} className="relative h-[300vh]">
            {/* Fixed yellow background */}
            <div className="fixed top-0 left-0 w-full h-screen bg-[#facc15] -z-10 pointer-events-none" />

            {/* Sticky container for the hero box */}
            <div className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-8 overflow-hidden">
                <motion.div
                    style={{ y: boxY, opacity: boxOpacity }}
                    className="relative bg-transparent border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-10 md:p-14 max-w-3xl w-full text-center overflow-hidden"
                >
                    {/* Initial Text Layer */}
                    <motion.div style={{ x: initialX, opacity: initialOpacity }} className="relative z-10 text-center">
                        <h1
                            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-4 md:mb-6 uppercase"
                            style={{ fontFamily: 'var(--font-geist-sans)' }}
                        >
                            Der Beste Einstieg ist Jetzt
                        </h1>
                        <p className="text-base sm:text-lg md:text-2xl font-bold max-w-2xl mx-auto text-black text-center">
                            Der beste Einstieg in eine große Sache ist: Jetzt.
                        </p>
                    </motion.div>

                    {/* Database Text Layer (Absolute positioned to overlap) */}
                    <motion.div 
                        style={{ x: dbX, opacity: dbOpacity }} 
                        className="absolute inset-0 flex items-center justify-center p-4 sm:p-12 md:p-16 z-20 pointer-events-none"
                    >
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-[13px] sm:text-sm md:text-base font-bold leading-tight text-black whitespace-pre-wrap text-center">
                                {description || "Lade Informationen..."}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                <ScrollIndicator 
                    position="absolute" 
                    bottomClass="bottom-[110px]" 
                    barColorClass="bg-white"
                    removeAfterScreens={2.4}
                />
            </div>
        </section>
    );
}
