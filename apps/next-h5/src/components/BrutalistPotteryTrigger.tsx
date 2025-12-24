'use client';

import React, { useState } from 'react';

interface BrutalistPotteryTriggerProps {
  onClick?: () => void;
  className?: string;
}

export default function BrutalistPotteryTrigger({ onClick, className = "" }: BrutalistPotteryTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center justify-center bg-white hover:bg-black transition-colors duration-200 ${className}`}
      title="Franzi's Pixel Pottery"
    >
      <img 
        src="/pottery.svg" 
        alt="Pottery" 
        className={`w-7 h-7 transition-all duration-200 ${isHovered ? 'invert' : ''}`}
      />
    </button>
  );
}
