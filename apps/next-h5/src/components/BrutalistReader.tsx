'use client';

import { m, AnimatePresence } from 'framer-motion';
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/sanity/image';
import Image from 'next/image';

interface BrutalistReaderProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    content: any;
    portrait?: any;
}

export default function BrutalistReader({ isOpen, onClose, title, subtitle, content, portrait }: BrutalistReaderProps) {
    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div key="reader-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        {/* Backdrop */}
                        <m.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/95 backdrop-blur-sm"
                        />

                        {/* Reader Window */}
                        <m.div 
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="relative w-full max-w-5xl max-h-[90vh] bg-white border-8 border-black shadow-[20px_20px_0px_0px_#FF3100] flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-black text-white p-6 flex justify-between items-center border-b-8 border-black">
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black uppercase leading-none tracking-tighter">{title}</h2>
                                    {subtitle && <p className="text-[#FF3100] font-bold uppercase mt-1">{subtitle}</p>}
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="bg-[#FF3100] text-white px-6 py-3 font-black uppercase hover:bg-white hover:text-black transition-colors border-4 border-white"
                                >
                                    Schliessen [X]
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-white text-black">
                                <div className="flex flex-col md:flex-row gap-12">
                                    {portrait && (
                                        <div className="w-full md:w-1/3 shrink-0">
                                            <div className="border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative aspect-[3/4] overflow-hidden">
                                                <Image 
                                                    src={urlFor(portrait).width(600).url()} 
                                                    alt={title} 
                                                    fill 
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1 text-lg md:text-xl font-bold leading-[1.15] space-y-6">
                                        <PortableText 
                                            value={content} 
                                            components={{
                                                block: {
                                                    normal: ({ children }) => <p className="mb-4">{children}</p>,
                                                    h3: ({ children }) => <h3 className="text-2xl md:text-3xl font-black uppercase mt-10 mb-4">{children}</h3>,
                                                },
                                                list: {
                                                    bullet: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                                                },
                                                marks: {
                                                    strong: ({ children }) => <strong className="font-black">{children}</strong>,
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Progress */}
                            <div className="bg-yellow-400 p-4 border-t-8 border-black flex justify-between items-center">
                                <span className="font-black uppercase text-sm">Atelier für Auẞergewöhnliche Angelegenheiten</span>
                                <button 
                                    onClick={onClose}
                                    className="text-black font-black uppercase hover:underline"
                                >
                                    Zurück zur Übersicht
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 12px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: black; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #FF3100; 
                    border: 3px solid black; 
                }
            `}</style>
        </>
    );
}
