'use client';

import React, { useState, useEffect } from 'react';
import { useCollection } from '@/context/CollectionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AnonymousBanner() {
    const { isAnonymous, userId, loading } = useCollection();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Only show if anonymous and not dismissed
        // TEMPORARILY DISABLED: Returning false to hide popup
        if (false && !loading && isAnonymous && !isDismissed) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isAnonymous, loading, isDismissed]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-32px)] max-w-lg"
                >
                    <div className="bg-black text-white border border-white/20 shadow-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
                        {/* Ambient background effect */}
                        <div className="absolute inset-0 bg-neon-orange/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />

                        <div className="relative shrink-0 w-10 h-10 bg-white/10 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-neon-orange" />
                        </div>

                        <div className="relative flex-1 min-w-0">
                            <h4 className="font-owners font-black italic text-xs uppercase tracking-wider mb-0.5">
                                Temporary Protocol Active
                            </h4>
                            <p className="text-[10px] uppercase font-bold opacity-60 leading-tight">
                                Save your collection permanently.
                            </p>
                        </div>

                        <div className="relative flex items-center gap-3">
                            <Link
                                href="/user-settings"
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase text-neon-orange hover:text-white transition-colors"
                            >
                                Save
                                <ArrowRight className="w-3 h-3" />
                            </Link>

                            <button
                                onClick={() => setIsDismissed(true)}
                                className="p-1 hover:bg-white/10 transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="w-4 h-4 opacity-40" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
