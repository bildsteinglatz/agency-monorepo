'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function SideEvents() {
    const pathname = usePathname();
    
    // Don't show on the events page itself
    const isEventsPage = pathname === '/events';

    return (
        <AnimatePresence>
            {!isEventsPage && (
                <motion.div
                    key="side-events"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ 
                        type: 'spring', 
                        damping: 20, 
                        stiffness: 100, 
                        delay: 0.5 
                    }}
                    className="fixed right-0 top-1/2 z-[100]"
                >
                    <Link 
                        href="/events"
                        className="block bg-yellow-400 text-black border-2 md:border-4 border-black px-4 py-1 md:px-6 md:py-2 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-yellow-400 transition-all duration-300 shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                        style={{ 
                            transform: 'rotate(-90deg) translateY(-100%)',
                            transformOrigin: 'top right',
                        }}
                    >
                        Side Events
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
