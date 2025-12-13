'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FileTree } from './FileTree';
import { AiTerminal } from './AiTerminal';

interface HudInterfaceProps {
    texts: any[];
    artworks: any[];
    categories: any;
    exhibitions: any[];
    publications: any[];
}

export function HudInterface({ texts, artworks, categories, exhibitions, publications }: HudInterfaceProps) {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState('');
    const [selectedItem, setSelectedItem] = useState<{ type: string, data: any } | null>(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toISOString().replace('T', ' ').split('.')[0]);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Set initial selection
    useEffect(() => {
        if (artworks.length > 0 && !selectedItem) {
            // Default to first artwork if nothing selected
            // setSelectedItem({ type: 'artwork', data: artworks[0] });
        }
    }, [artworks]);

    const handleSelect = (type: string, data: any) => {
        setSelectedItem({ type, data });
    };

    // Helper to get background image based on selection
    const getBackgroundImage = () => {
        if (selectedItem?.type === 'artwork' && selectedItem.data.mainImage) return selectedItem.data.mainImage.asset.url;
        if (selectedItem?.type === 'exhibition' && selectedItem.data.mainImage) return selectedItem.data.mainImage.asset.url;
        if (selectedItem?.type === 'publication' && selectedItem.data.mainImage) return selectedItem.data.mainImage.asset.url;
        // Fallback to first artwork
        if (artworks.length > 0 && artworks[0].mainImage) return artworks[0].mainImage.asset.url;
        return null;
    };

    const bgImage = getBackgroundImage();

    return (
        <div className="relative w-full h-full font-mono text-green-500 bg-black overflow-hidden">
            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    {bgImage && (
                        <motion.div
                            key={bgImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.2 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={bgImage}
                                alt="Background"
                                fill
                                className="object-cover grayscale contrast-125"
                                priority
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Scanlines / Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-30" 
                    style={{ 
                        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)',
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* HUD Overlay Grid */}
            <div className="relative z-10 w-full h-full flex flex-col pointer-events-none">
                
                {/* Top Bar */}
                <div className="h-12 border-b border-green-500/50 bg-black/40 backdrop-blur-sm flex justify-between items-center px-4 pointer-events-auto shrink-0">
                    <div className="text-xl font-bold tracking-widest flex items-center gap-4">
                        <span>BILDSTEIN | GLATZ</span>
                        <span className="text-[10px] font-normal opacity-70 border border-green-500 px-1">SYS.V.2.0</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex gap-1">
                            <span className="opacity-50">LAT:</span> 47.4196
                            <span className="opacity-50">LON:</span> 9.7345
                        </div>
                        <div>{currentTime} UTC</div>
                    </div>
                </div>

                {/* Main Content Area with Sidebars */}
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* Left Sidebar - File Tree */}
                    <div className="w-64 border-r border-green-500/50 bg-black/20 backdrop-blur-sm flex flex-col pointer-events-auto shrink-0">
                        <div className="p-2 border-b border-green-500/30 text-[10px] uppercase tracking-widest opacity-70">
                            [01] FILE SYSTEM
                        </div>
                        <FileTree 
                            categories={categories}
                            exhibitions={exhibitions}
                            publications={publications}
                            texts={texts}
                            onSelect={handleSelect}
                        />
                    </div>

                    {/* Center Viewport (Preview) */}
                    <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
                        {/* Corner Brackets */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-green-500 opacity-50"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-green-500 opacity-50"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-green-500 opacity-50"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-green-500 opacity-50"></div>
                        
                        <AnimatePresence mode="wait">
                            {!selectedItem && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center opacity-50"
                                >
                                    <div className="text-4xl font-bold mb-2">SYSTEM READY</div>
                                    <div className="text-xs">SELECT A FILE TO VIEW CONTENT</div>
                                </motion.div>
                            )}

                            {selectedItem?.type === 'category' && (
                                <motion.div 
                                    key={selectedItem.data._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full overflow-y-auto custom-scrollbar pointer-events-auto"
                                >
                                    <h2 className="text-2xl font-bold mb-4 border-b border-green-500 pb-2">{selectedItem.data.title}</h2>
                                    <div className="grid grid-cols-3 gap-4">
                                        {artworks.filter((a: any) => a.fieldOfArt?._id === selectedItem.data._id).map((artwork: any) => (
                                            <div 
                                                key={artwork._id} 
                                                onClick={() => handleSelect('artwork', artwork)}
                                                className="aspect-square border border-green-500/30 relative cursor-pointer hover:border-green-500 transition-colors group"
                                            >
                                                {artwork.mainImage && (
                                                    <Image 
                                                        src={artwork.mainImage.asset.url} 
                                                        alt={artwork.title} 
                                                        fill 
                                                        className="object-cover grayscale contrast-125 opacity-70 group-hover:opacity-100 transition-opacity"
                                                    />
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[10px] truncate">
                                                    {artwork.title}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {artworks.filter((a: any) => a.fieldOfArt?._id === selectedItem.data._id).length === 0 && (
                                        <div className="opacity-50 italic">NO PREVIEWS AVAILABLE IN CACHE</div>
                                    )}
                                </motion.div>
                            )}

                            {selectedItem?.type === 'artwork' && (
                                <motion.div 
                                    key={selectedItem.data._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    className="relative w-full h-full flex flex-col items-center justify-center pointer-events-auto"
                                >
                                    <div className="relative w-full h-full max-h-[85%] border border-green-500/30 bg-black/40 backdrop-blur-sm p-1">
                                        {selectedItem.data.mainImage && (
                                            <Image 
                                                src={selectedItem.data.mainImage.asset.url} 
                                                alt={selectedItem.data.title}
                                                fill
                                                className="object-contain"
                                            />
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-green-500/50 p-2 flex justify-between items-end">
                                            <div>
                                                <h2 className="text-lg font-bold">{selectedItem.data.title}</h2>
                                                <p className="text-xs opacity-70">{selectedItem.data.year} // {selectedItem.data.materials || 'Mixed Media'}</p>
                                            </div>
                                            <div className="text-[10px] font-mono opacity-50">
                                                ID: {selectedItem.data._id.slice(0, 8)}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {selectedItem?.type === 'exhibition' && (
                                <motion.div 
                                    key={selectedItem.data._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full max-w-2xl border border-green-500 bg-black/80 backdrop-blur-md p-6 pointer-events-auto"
                                >
                                    <div className="text-xs opacity-50 mb-2">EXHIBITION RECORD</div>
                                    <h2 className="text-2xl font-bold mb-2">{selectedItem.data.title}</h2>
                                    <div className="flex gap-4 text-sm mb-4 border-b border-green-500/30 pb-4">
                                        <span>{selectedItem.data.year}</span>
                                        <span>{selectedItem.data.venue?.city}, {selectedItem.data.venue?.country}</span>
                                    </div>
                                    {selectedItem.data.mainImage && (
                                        <div className="relative w-full h-64 mb-4 border border-green-500/30">
                                            <Image 
                                                src={selectedItem.data.mainImage.asset.url} 
                                                alt={selectedItem.data.title} 
                                                fill 
                                                className="object-cover grayscale contrast-125"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {selectedItem?.type === 'publication' && (
                                <motion.div 
                                    key={selectedItem.data._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full max-w-2xl border border-green-500 bg-black/80 backdrop-blur-md p-6 pointer-events-auto"
                                >
                                    <div className="text-xs opacity-50 mb-2">PUBLICATION RECORD</div>
                                    <h2 className="text-2xl font-bold mb-2">{selectedItem.data.title}</h2>
                                    {selectedItem.data.mainImage && (
                                        <div className="relative w-full h-64 mb-4 border border-green-500/30">
                                            <Image 
                                                src={selectedItem.data.mainImage.asset.url} 
                                                alt={selectedItem.data.title} 
                                                fill 
                                                className="object-contain grayscale contrast-125"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {selectedItem?.type === 'text' && (
                                <motion.div 
                                    key={selectedItem.data._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="relative w-full max-w-3xl h-full max-h-[90%] border border-green-500 bg-black/80 backdrop-blur-md p-8 overflow-y-auto custom-scrollbar pointer-events-auto"
                                >
                                    <div className="flex justify-between items-start border-b border-green-500 pb-4 mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-1">{selectedItem.data.title}</h2>
                                            <p className="text-xs opacity-70 font-mono">AUTHOR: {selectedItem.data.author || 'UNKNOWN'}</p>
                                        </div>
                                        <div className="text-xs font-mono border border-green-500 px-2 py-1">
                                            {selectedItem.data.publishedAt?.split('T')[0]}
                                        </div>
                                    </div>
                                    <div className="prose prose-invert prose-p:text-green-500/80 prose-headings:text-green-500 max-w-none font-mono text-sm leading-relaxed">
                                        {selectedItem.data.textContent ? (
                                            selectedItem.data.textContent.split('\n').map((para: string, i: number) => (
                                                <p key={i} className="mb-4">{para}</p>
                                            ))
                                        ) : (
                                            <div className="opacity-50 italic">[ENCRYPTED CONTENT - PREVIEW ONLY]</div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {selectedItem?.type === 'page' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center border border-green-500 p-8 bg-black/80 backdrop-blur-md"
                                >
                                    <h2 className="text-2xl font-bold mb-4">{selectedItem.data.title}</h2>
                                    <p className="opacity-70">CONTENT MODULE LOADING...</p>
                                    <div className="mt-4 w-full h-1 bg-green-900/50">
                                        <div className="h-full bg-green-500 w-[40%] animate-pulse"></div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Sidebar - AI Terminal */}
                    <div className="w-80 border-l border-green-500/50 bg-black/20 backdrop-blur-sm flex flex-col pointer-events-auto shrink-0">
                        <AiTerminal />
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="h-8 border-t border-green-500/50 bg-black/40 backdrop-blur-sm flex justify-between items-center px-4 pointer-events-auto shrink-0 text-[10px]">
                    <div className="flex gap-4">
                        <span className="opacity-50">STATUS:</span> <span className="text-green-400">OPERATIONAL</span>
                        <span className="opacity-50 ml-4">NET:</span> <span className="text-green-400">SECURE</span>
                    </div>
                    <div className="flex items-center gap-2 w-1/3">
                        <span className="opacity-50">BUFFER</span>
                        <div className="flex-1 h-1 bg-green-900/50">
                            <div className="h-full bg-green-500 w-[65%] animate-pulse"></div>
                        </div>
                    </div>
                </div>

            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #001100;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #00ff00;
                }
            `}</style>
        </div>
    );
}
