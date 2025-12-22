'use client';

import { useState, useEffect } from 'react';

export default function PartyBackground({ children }: { children: React.ReactNode }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <main 
            className="min-h-screen relative overflow-hidden transition-colors duration-500" 
            style={{
                background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, #ff0080 0%, #7928ca 30%, #0070f3 60%, #00dfd8 100%)`,
            }}
        >
            {/* Fancy Multi-colored Glitter Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-50" style={{
                backgroundImage: `
                    radial-gradient(circle at 20% 30%, #ffffff 0.5px, transparent 0.5px),
                    radial-gradient(circle at 70% 10%, #ffff00 0.5px, transparent 0.5px),
                    radial-gradient(circle at 40% 80%, #00ffff 0.5px, transparent 0.5px),
                    radial-gradient(circle at 80% 50%, #ff00ff 0.5px, transparent 0.5px),
                    radial-gradient(circle at 10% 90%, #ffffff 0.5px, transparent 0.5px),
                    radial-gradient(circle at 90% 20%, #ffff00 0.5px, transparent 0.5px),
                    radial-gradient(circle at 50% 50%, #00ffff 0.5px, transparent 0.5px),
                    radial-gradient(circle at 30% 70%, #ff00ff 0.5px, transparent 0.5px),
                    radial-gradient(circle at 15% 15%, #ff3100 0.5px, transparent 0.5px),
                    radial-gradient(circle at 85% 85%, #00ff00 0.5px, transparent 0.5px)
                `,
                backgroundSize: '60px 60px',
                transform: `translate(${(mousePos.x - 50) * 0.1}px, ${(mousePos.y - 50) * 0.1}px)`,
            }} />
            
            {/* Fine Grain Glitter */}
            <div className="absolute inset-0 pointer-events-none opacity-15" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} />

            {children}
        </main>
    );
}
