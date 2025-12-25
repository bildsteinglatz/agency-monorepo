'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrutalistSearchTrigger from './BrutalistSearchTrigger';
import BrutalistPaintTrigger from './BrutalistPaintTrigger';
import BrutalistPongTrigger from './BrutalistPongTrigger';
import BrutalistPotteryTrigger from './BrutalistPotteryTrigger';
import BrutalistSearchModal from './BrutalistSearchModal';
import PotteryModal from './PotteryModal';

export default function RightNavigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPotteryOpen, setIsPotteryOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const openConcierge = () => setIsSearchOpen(true);
    const openPottery = () => setIsPotteryOpen(true);

    window.addEventListener('open-concierge', openConcierge);
    window.addEventListener('open-pottery', openPottery);

    return () => {
      window.removeEventListener('open-concierge', openConcierge);
      window.removeEventListener('open-pottery', openPottery);
    };
  }, []);
  
  if (pathname === '/virtual-painting' || pathname === '/pong' || pathname === '/pottery') return <div className="hidden" />;

  const isEventsPage = pathname === '/events';

  // Common styles
  // Shrink each side by ~30%
  const buttonSize = "w-[29px] h-[31px] md:w-[34px] md:h-[36px]"; 
  const iconScale = "[&_svg]:w-[17px] [&_svg]:h-[17px] md:[&_svg]:w-[20px] md:[&_svg]:h-[20px]";
  const borderStyle = "border-4 border-black";
  const shadowStyle = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";

  return (
    <>
      {/* Navigation Hub Container - Moved 1px more to the right */}
      <div className="fixed right-[-1px] top-1/2 -translate-y-1/2 z-50 flex flex-col items-end">
        
        {/* 0. Pong Trigger (Top-most) */}
        <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
            className={`${shadowStyle} mb-0 relative z-40`}
        >
            <BrutalistPongTrigger 
                className={`${buttonSize} ${iconScale} ${borderStyle} border-b-0`}
            />
        </motion.div>

        {/* 0.5 Pottery Trigger */}
        <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className={`${shadowStyle} mb-0 relative z-35`}
        >
            <BrutalistPotteryTrigger 
                onClick={() => setIsPotteryOpen(true)}
                className={`${buttonSize} ${iconScale} ${borderStyle} border-b-0 border-t-0`}
            />
        </motion.div>

        {/* 1. Paint Trigger (Top) */}
        <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className={`${shadowStyle} mb-0 relative z-30`}
        >
            <BrutalistPaintTrigger 
                className={`${buttonSize} ${iconScale} ${borderStyle} border-b-0 border-t-0`} 
            />
        </motion.div>

        {/* 2. Search Trigger (Middle) */}
        <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className={`${shadowStyle} mb-0 relative z-20`}
        >
            <BrutalistSearchTrigger 
                onClick={() => setIsSearchOpen(true)} 
                className={`${buttonSize} ${iconScale} ${borderStyle} border-b-0 border-t-0`} 
            />
        </motion.div>

        {/* 3. Side Events Tab (Bottom) */}
        <AnimatePresence>
            {!isEventsPage && (
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                    className={`${shadowStyle} relative z-10`}
                >
                    <Link 
                        href="/events"
                        className={`
                            block bg-yellow-400 text-black 
                            ${borderStyle} 
                            w-[29px] md:w-[34px]
                            flex items-center justify-center
                            hover:bg-black hover:text-yellow-400 transition-colors
                        `}
                        style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                            transform: 'rotate(180deg)',
                            paddingTop: '1.5rem',
                            paddingBottom: '1.5rem',
                        }}
                    >
                        <span className="font-bold uppercase tracking-widest text-xs whitespace-nowrap">
                            Side Events
                        </span>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <BrutalistSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <PotteryModal isOpen={isPotteryOpen} onClose={() => setIsPotteryOpen(false)} />
    </>
  );
}
