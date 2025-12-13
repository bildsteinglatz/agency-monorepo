'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    role: 'user' | 'system' | 'ai';
    content: string;
    timestamp: string;
}

export function AiTerminal() {
    const router = useRouter();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'system',
            content: 'AI INTERFACE ONLINE. WAITING FOR INPUT...\nAVAILABLE COMMANDS: "NORMAL", "CINEMATIC", "HUD", "TERMINAL"',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const command = userMsg.content.toLowerCase().trim();

        // Command Handling
        if (command === 'normal' || command === 'view normal') {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'system',
                    content: 'REDIRECTING TO NORMAL VIEW...',
                    timestamp: new Date().toLocaleTimeString()
                }]);
                setTimeout(() => router.push('/new-work'), 1000);
            }, 500);
            return;
        }

        if (command === 'hud' || command === 'view hud') {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'system',
                    content: 'RELOADING HUD INTERFACE...',
                    timestamp: new Date().toLocaleTimeString()
                }]);
                setTimeout(() => window.location.reload(), 1000);
            }, 500);
            return;
        }

        if (command === 'terminal' || command === 'view terminal') {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'system',
                    content: 'ACCESSING TERMINAL SUBSYSTEM...',
                    timestamp: new Date().toLocaleTimeString()
                }]);
                setTimeout(() => router.push('/terminal'), 1000);
            }, 500);
            return;
        }

        if (command === 'cinematic' || command === 'view cinematic') {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'system',
                    content: 'INITIATING CINEMATIC SEQUENCE...',
                    timestamp: new Date().toLocaleTimeString()
                }]);
                setTimeout(() => router.push('/spectral?mode=cinematic'), 1000);
            }, 500);
            return;
        }

        // Mock AI Response for other inputs
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: `ANALYZING QUERY: "${userMsg.content}"... \nACCESS DENIED. UNKNOWN COMMAND. TRY: "NORMAL", "CINEMATIC", "HUD", "TERMINAL".`,
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full w-full font-mono text-xs">
            <div className="p-2 border-b border-green-500/30 flex justify-between items-center bg-green-500/10">
                <span className="uppercase tracking-widest opacity-70">[04] AI_TERMINAL</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px]">
                            <span>{msg.role.toUpperCase()}</span>
                            <span>{msg.timestamp}</span>
                        </div>
                        <div className={`p-2 max-w-[90%] border ${
                            msg.role === 'user' 
                                ? 'border-green-500/50 bg-green-500/10 text-right' 
                                : msg.role === 'system'
                                    ? 'border-transparent text-green-500/50 italic'
                                    : 'border-green-500 bg-black text-green-500'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-center gap-1 text-green-500 animate-pulse">
                        <span>&gt;</span>
                        <span>PROCESSING...</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-2 border-t border-green-500/30 bg-black/40">
                <div className="flex items-center gap-2">
                    <span className="text-green-500">&gt;</span>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-green-500 placeholder-green-500/30"
                        placeholder="ENTER COMMAND..."
                    />
                </div>
            </form>
        </div>
    );
}
