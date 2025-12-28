'use client';

import { useState } from 'react';
import { m } from 'framer-motion';

interface BrutalistSearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export default function BrutalistSearchTrigger({ onClick, className = "" }: BrutalistSearchTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <m.button
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
        className="translate-y-[2px]"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </m.button>
  );
}
