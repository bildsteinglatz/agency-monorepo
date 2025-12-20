'use client';

import { motion } from 'framer-motion';

export function MembershipHero() {
    return (
        <section className="min-h-screen bg-white flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl w-full text-center"
            >
                <motion.h1
                    className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-8 border-b-8 border-black pb-8"
                    style={{ fontFamily: 'var(--font-geist-mono)' }}
                >
                    Jetzt Mitglied Werden
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-2xl md:text-3xl font-bold uppercase max-w-3xl mx-auto leading-relaxed"
                >
                    Unterstütze Halle 5 und werde Teil einer kreativen Community
                </motion.p>
            </motion.div>
        </section>
    );
}
