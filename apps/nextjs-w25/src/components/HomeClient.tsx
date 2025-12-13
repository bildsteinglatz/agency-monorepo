"use client";

import { SelectedArtworks } from "@/components/home/SelectedArtworks";
import HeaderLogo from "@/components/HeaderLogo";
import { Navigation } from "@/components/Navigation";
import { SidebarNav } from "@/components/SidebarNav";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";

interface HomeClientProps {
    selectedArtworks: any[];
    introSlides?: any[];
}

export function HomeClient({ selectedArtworks, introSlides }: HomeClientProps) {
    const searchParams = useSearchParams();
    const [showTransition, setShowTransition] = useState(false);

    useEffect(() => {
        if (searchParams.get('transition') === 'true') {
            setShowTransition(true);
            // Clean up URL after transition starts
            window.history.replaceState({}, '', '/');
        }
    }, [searchParams]);

    return (
        <>
            {/* Transition Overlay */}
            <AnimatePresence>
                {showTransition && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.0, ease: "easeOut", delay: 0.5 }}
                        className="fixed inset-0 z-[100] pointer-events-none"
                        style={{
                            background: 'linear-gradient(90deg, #ff0000, #ff8c00, #ffff00, #00ff00, #0066ff, #9400d3)',
                            filter: 'blur(100px)',
                            transform: 'scale(1.5)'
                        }}
                        onAnimationComplete={() => setShowTransition(false)}
                    />
                )}
            </AnimatePresence>

            {/* Fixed Logo on Top Right */}
            <div className="fixed top-0 right-0 flex items-center gap-3 logo-text pr-2 z-[60]" style={{ top: '-5px' }}>
                <HeaderLogo />
            </div>

            {/* Navigation */}
            <div className="sticky top-0 z-50 bg-background">
                <SidebarNav />
                <Navigation />
            </div>

            {/* Main Content */}
            <main id="home-content" className="relative z-10 bg-background min-h-screen">
                <SelectedArtworks artworks={selectedArtworks} />
            </main>
        </>
    );
}
