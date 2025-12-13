'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'brutalist' | 'normal' | 'cinematic' | null;

export default function TerminalPage() {
    const router = useRouter();
    const [text, setText] = useState('');
    const [step, setStep] = useState<'typing' | 'menu' | 'brutalist'>('typing');
    const [selection, setSelection] = useState<Mode>(null);

    const fullText = "system status: full stack loaded";

    // Typing effect
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) {
                clearInterval(interval);
                setTimeout(() => setStep('menu'), 500);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        if (step !== 'menu') return;

        const modes: Mode[] = ['brutalist', 'normal', 'cinematic'];
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                setSelection(prev => {
                    const currentIndex = prev ? modes.indexOf(prev) : -1;
                    if (e.key === 'ArrowDown') {
                        return modes[(currentIndex + 1) % modes.length];
                    } else {
                        return modes[(currentIndex - 1 + modes.length) % modes.length];
                    }
                });
            }
            if (e.key === 'Enter' && selection) {
                confirmSelection(selection);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step, selection]);

    const confirmSelection = (mode: Mode) => {
        if (mode === 'brutalist') {
            router.push('/hud');
        } else if (mode === 'normal') {
            router.push('/new-work');
        } else if (mode === 'cinematic') {
            router.push('/spectral?mode=cinematic');
        }
    };

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center font-mono">
            {/* Terminal Window Frame */}
            <div className="w-full max-w-[600px] border border-green-500 bg-black flex flex-col shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                {/* Window Header */}
                <div className="bg-green-500 text-black px-2 py-1 flex justify-between items-center select-none">
                    <div className="text-[10px] uppercase font-bold tracking-wider">TERMINAL - version: BETA.0.3</div>
                    <div className="text-[10px] font-bold"></div>
                </div>

                {/* Content Area */}
                <div className="p-4 text-xs sm:text-sm text-green-500 min-h-[300px]">
                    {/* Status Line */}
                    <div className="mb-6">
                        <span>{text}</span>
                        <span className="animate-pulse">_</span>
                    </div>

                    {/* Mode Selection Menu */}
                    {step === 'menu' && (
                        <div className="flex flex-col gap-2 animate-in fade-in duration-500">
                            <div className="mb-2 text-green-700 text-[10px] uppercase tracking-widest">
                                select your mode:
                            </div>

                            <button
                                onClick={() => { setSelection('brutalist'); confirmSelection('brutalist'); }}
                                onMouseEnter={() => setSelection('brutalist')}
                                className="text-left hover:text-green-300 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent outline-none"
                            >
                                <span className={`w-4 ${selection === 'brutalist' ? 'opacity-100' : 'opacity-0'}`}>&gt;</span>
                                <span className={selection === 'brutalist' ? 'text-green-300 bg-green-900/30' : ''}>
                                    brutalist view
                                </span>
                            </button>

                            <button
                                onClick={() => { setSelection('normal'); confirmSelection('normal'); }}
                                onMouseEnter={() => setSelection('normal')}
                                className="text-left hover:text-green-300 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent outline-none"
                            >
                                <span className={`w-4 ${selection === 'normal' ? 'opacity-100' : 'opacity-0'}`}>&gt;</span>
                                <span className={selection === 'normal' ? 'text-green-300 bg-green-900/30' : ''}>
                                    normal view
                                </span>
                            </button>

                            <button
                                onClick={() => { setSelection('cinematic'); confirmSelection('cinematic'); }}
                                onMouseEnter={() => setSelection('cinematic')}
                                className="text-left hover:text-green-300 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent outline-none"
                            >
                                <span className={`w-4 ${selection === 'cinematic' ? 'opacity-100' : 'opacity-0'}`}>&gt;</span>
                                <span className={selection === 'cinematic' ? 'text-green-300 bg-green-900/30' : ''}>
                                    cinematic view
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Brutalist Mode Content */}
                    {step === 'brutalist' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="text-green-400 mb-4">
                                &gt; brutalist mode activated
                            </div>
                            <div className="text-green-700 text-[10px] uppercase tracking-widest mb-2">
                                [brutalist version available only if you find a way to hack into the system]
                            </div>
                            <button
                                onClick={() => setStep('menu')}
                                className="text-green-500 hover:text-green-300 underline cursor-pointer border-none bg-transparent outline-none mt-4"
                            >
                                &lt; back to menu
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

