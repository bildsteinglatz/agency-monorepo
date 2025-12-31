'use client';

import { m } from 'framer-motion';

interface InnovativeButtonProps {
    onClick: () => void;
    label: string;
}

export default function InnovativeButton({ onClick, label }: InnovativeButtonProps) {
    return (
        <m.button
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95, rotate: 2 }}
            onClick={onClick}
            className="relative group"
        >
            {/* Shadow Layer */}
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform" />
            
            {/* Main Button */}
            <div className="relative bg-[#fdc800] text-black border-4 border-black px-8 py-6 flex items-center gap-4 overflow-hidden">
                {/* Animated Background Element */}
                <m.div 
                    animate={{ 
                        x: [-100, 300],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-0 left-0 w-20 h-full bg-white/60 skew-x-12"
                />
                
                <span className="text-2xl md:text-4xl font-black uppercase tracking-tighter relative z-10">
                    {label}
                </span>
                
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-black group-hover:rotate-180 transition-transform duration-500">
                    <span className="text-black text-2xl">👁️</span>
                </div>
            </div>
        </m.button>
    );
}
