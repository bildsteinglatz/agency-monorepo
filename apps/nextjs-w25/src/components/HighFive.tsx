'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export function HighFive() {
  const [isHovered, setIsHovered] = useState(false);

  const handleHighFive = (e: React.MouseEvent) => {
    // Get click coordinates for confetti origin
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#ff6600', '#ffffff', '#000000'], // Neon orange, white, black
      zIndex: 9999,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center mt-16 mb-8">
      <button
        onClick={handleHighFive}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex flex-col items-center justify-center transition-colors duration-300 border-none bg-transparent cursor-pointer outline-none"
        aria-label="High Five the Artists"
      >
        {/* Hand Icon */}
        <svg 
          viewBox="0 0 24 24" 
          className={`w-24 h-24 mb-4 transition-colors duration-300 ${isHovered ? 'text-[#ff6600]' : 'text-foreground'}`}
          fill="currentColor"
        >
          <path d="M10.5,22 C10.5,22 9.5,22 9.5,22 C9.5,22 9.5,14 9.5,14 C9.5,13.4 9.1,13 8.5,13 C7.9,13 7.5,13.4 7.5,14 C7.5,14 7.5,18 7.5,18 C7.5,18 5.5,18 5.5,18 C5.5,18 5.5,12 5.5,12 C5.5,11.4 5.1,11 4.5,11 C3.9,11 3.5,11.4 3.5,12 C3.5,12 3.5,16 3.5,16 C3.5,16 1.5,16 1.5,16 C1.5,16 1.5,9 1.5,9 C1.5,8.4 1.9,8 2.5,8 C3.1,8 3.5,8.4 3.5,9 C3.5,9 3.5,10 3.5,10 C3.5,10 5.5,10 5.5,10 C5.5,10 5.5,6 5.5,6 C5.5,5.4 5.9,5 6.5,5 C7.1,5 7.5,5.4 7.5,6 C7.5,6 7.5,11 7.5,11 C7.5,11 9.5,11 9.5,11 C9.5,11 9.5,3 9.5,3 C9.5,2.4 9.9,2 10.5,2 C11.1,2 11.5,2.4 11.5,3 C11.5,3 11.5,11 11.5,11 C11.5,11 13.5,11 13.5,11 C13.5,11 13.5,4.5 13.5,4.5 C13.5,3.9 13.9,3.5 14.5,3.5 C15.1,3.5 15.5,3.9 15.5,4.5 C15.5,4.5 15.5,12 15.5,12 C15.5,12 17.5,12 17.5,12 C17.5,12 17.5,12 17.5,12 C17.5,12 22.5,14 22.5,19 C22.5,20.7 21.2,22 19.5,22 L10.5,22 Z" />
        </svg>
        
        {/* Text */}
        <span 
          className={`text-2xl font-black italic tracking-wider transition-colors duration-300 ${isHovered ? 'text-[#ff6600]' : 'text-foreground'}`}
          style={{ fontFamily: "'Owners Text', Arial, sans-serif", fontWeight: 900, fontStyle: 'italic' }}
        >
          Go give the artists a high five!
        </span>
      </button>
    </div>
  );
}
