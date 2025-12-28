'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto pt-12 md:pt-24">
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    
                    <m.div
                        initial={{ y: '-100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-sm bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,49,0,1)] p-6 mb-12"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-3 right-3 bg-black text-white p-1.5 border-2 border-white hover:bg-[#FF3100] transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black uppercase leading-none tracking-tighter mb-4 text-black">
                                Bald verfügbar
                            </h2>
                            <p className="text-sm font-bold text-black leading-relaxed">
                                Wir bauen derzeit an unserem Mitgliederbereich. Bitte komm später wieder oder melde dich zum Newsletter an, dann geben wir dir Bescheid sobald wir damit online gehen.
                            </p>
                        </div>
                        
                        <button
                            onClick={onClose}
                            className="w-full bg-black text-white py-3 text-lg font-black uppercase hover:bg-[#FF3100] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                            Verstanden
                        </button>
                    </m.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
