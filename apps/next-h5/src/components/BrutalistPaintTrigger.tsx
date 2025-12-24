'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface BrutalistPaintTriggerProps {
  className?: string;
}

export default function BrutalistPaintTrigger({ className = "" }: BrutalistPaintTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href="/virtual-painting" className="block">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-white text-black flex items-center justify-center transition-colors hover:bg-black hover:text-white ${className}`}
        aria-label="Open Virtual Painting"
      >
        <img 
          src="/pinsel.svg" 
          alt="Paint" 
          className={`w-9 h-9 transition-all duration-200 ${isHovered ? 'invert' : ''}`}
        />
      </motion.button>
    </Link>
  );
}
