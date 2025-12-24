'use client';

import Link from 'next/link';
import { useState } from 'react';

interface BrutalistPongTriggerProps {
  className?: string;
}

export default function BrutalistPongTrigger({ className = "" }: BrutalistPongTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/pong"
      className={`relative block bg-white flex items-center justify-center transition-colors hover:bg-black hover:text-white group overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Play Pong"
    >
      <div className={`flex items-center justify-center w-full h-full transition-colors duration-200 ${isHovered ? 'text-white' : 'text-black'}`}>
        {/* Pong Icon: Two paddles and a ball */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="fill-current"
        >
          {/* Left Paddle */}
          <rect x="4" y="6" width="3" height="12" />
          {/* Right Paddle */}
          <rect x="17" y="6" width="3" height="12" />
          {/* Ball */}
          <rect x="10.5" y="10.5" width="3" height="3" />
        </svg>
      </div>
    </Link>
  );
}
