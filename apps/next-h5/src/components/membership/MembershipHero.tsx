'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollIndicator from '@/components/ScrollIndicator';

export function MembershipHero() {
    return (
        <section className="relative font-black uppercase">
            {/* Fixed yellow background placed behind everything */}
                <div className="fixed top-0 left-0 w-full h-screen bg-yellow-400 -z-10 pointer-events-none" />

            {/* Visible hero box in normal flow so later content scrolls over it */}
                <div className="flex items-center justify-center h-screen px-8">
                    <div className="max-w-4xl w-full flex items-center justify-center pointer-events-auto">
                        <HeroBox />
                    </div>
                <ScrollIndicator position="absolute" bottomClass="bottom-32" fadeStart={200} fadeEnd={800} />
            </div>

            {/* Small spacer so following content is immediately visible */}
            <div className="h-8 bg-transparent" />
        </section>
    );
}

function HeroBox() {
    const { scrollY } = useScroll();
    // limit transform ranges so the box doesn't leave the viewport
    const y = useTransform(scrollY, [0, 200], [0, -120]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <motion.div
            style={{ y, opacity }}
            className="bg-transparent border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-10 md:p-14 max-w-3xl w-full text-center max-h-[85vh] overflow-hidden"
        >
            <h1
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-4 md:mb-6"
                style={{ fontFamily: 'var(--font-geist-sans)' }}
            >
                JETZT MITGLIED WERDEN
            </h1>

            <p className="text-base sm:text-lg md:text-2xl font-bold max-w-2xl mx-auto text-black">
                Der beste Einstieg in eine große Sache ist: Jetzt.
            </p>
        </motion.div>
    );
}
