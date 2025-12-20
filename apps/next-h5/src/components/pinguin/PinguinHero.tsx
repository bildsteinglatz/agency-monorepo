'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface PinguinHeroProps {
    title: string;
    subtitle?: string;
    youtubeId?: string;
}

export function PinguinHero({ title, subtitle, youtubeId }: PinguinHeroProps) {
    const videoId = youtubeId || 'dQw4w9WgXcQ'; // Fallback video
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    
    // Animate title: move down and fade out as user scrolls
    const titleY = useTransform(scrollY, [0, 400], [0, 200]);
    const titleOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    
    // Animate subtitle: move down and fade out as user scrolls (slightly delayed)
    const subtitleY = useTransform(scrollY, [0, 500], [0, 250]);
    const subtitleOpacity = useTransform(scrollY, [100, 400], [1, 0]);
    
    // Arrow indicator opacity
    const arrowOpacity = useTransform(scrollY, [200, 400], [1, 0]);

    return (
        <section className="fixed top-0 left-0 h-screen w-full overflow-hidden bg-black z-0">
            {/* YouTube Background */}
            <div className="absolute inset-0 z-0">
                <iframe
                    className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                    allow="autoplay; encrypted-media"
                    title="Background video"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Brutalist Title Overlay */}
            <div className="relative z-10 h-full flex items-center justify-center p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                        duration: 0.8,
                    }}
                    className="text-center pointer-events-auto"
                    style={{
                        y: titleY,
                        opacity: titleOpacity,
                    }}
                >
                    <motion.h1
                        className="text-[12vw] md:text-[15vw] lg:text-[18vw] font-black uppercase tracking-tighter leading-none text-white border-8 border-white p-4 md:p-8 bg-black/80 shadow-[20px_20px_0px_0px_rgba(255,255,255,0.3)]"
                        style={{ fontFamily: 'var(--font-geist-mono)' }}
                        whileHover={{
                            scale: 1.02,
                            rotate: -1,
                            transition: { duration: 0.2 }
                        }}
                    >
                        PINGUIN
                    </motion.h1>

                    {subtitle && (
                        <motion.p
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="mt-8 text-xl md:text-3xl font-bold uppercase text-white bg-[#FF3100] border-4 border-white p-6 inline-block shadow-[10px_10px_0px_0px_rgba(255,255,255,0.5)]"
                            style={{
                                y: subtitleY,
                                opacity: subtitleOpacity,
                            }}
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="mt-12"
                        style={{ opacity: arrowOpacity }}
                    >
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-white text-4xl"
                        >
                            ↓
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
