'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrutalistSearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export default function BrutalistSearchTrigger({ onClick, className = "" }: BrutalistSearchTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white text-black flex items-center justify-center transition-colors hover:bg-black hover:text-white ${className}`}
      aria-label="Open AI Concierge"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </motion.button>
  );
}
