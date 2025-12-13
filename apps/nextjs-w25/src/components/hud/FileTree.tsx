'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileTreeProps {
    categories: any;
    exhibitions: any[];
    publications: any[];
    texts: any[];
    onSelect: (type: string, data: any) => void;
}

export function FileTree({ categories, exhibitions, publications, texts, onSelect }: FileTreeProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        artworks: true,
        exhibitions: false,
        publications: false,
        texts: false,
        info: false
    });

    const toggle = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Group exhibitions by year
    const exhibitionsByYear = exhibitions.reduce((acc: any, ex: any) => {
        const year = ex.year || 'Unknown';
        if (!acc[year]) acc[year] = [];
        acc[year].push(ex);
        return acc;
    }, {});

    const years = Object.keys(exhibitionsByYear).sort((a, b) => Number(b) - Number(a));

    return (
        <div className="flex flex-col w-full h-full font-mono text-xs overflow-y-auto custom-scrollbar p-2 select-none">
            
            {/* ARTWORKS */}
            <div className="mb-2">
                <div 
                    onClick={() => toggle('artworks')}
                    className="flex items-center gap-2 cursor-pointer hover:text-green-300 font-bold mb-1"
                >
                    <span>{expanded.artworks ? '[-]' : '[+]'}</span>
                    <span>ARTWORKS</span>
                </div>
                <AnimatePresence>
                    {expanded.artworks && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-4 border-l border-green-500/30 pl-2 overflow-hidden"
                        >
                            {/* Field of Art Categories */}
                            {categories.fieldOfArt?.map((cat: any) => (
                                <div 
                                    key={cat._id}
                                    onClick={() => onSelect('category', cat)}
                                    className="cursor-pointer hover:bg-green-500/10 px-1 py-0.5 truncate opacity-80 hover:opacity-100"
                                >
                                    {cat.title} <span className="opacity-50">({cat.artworkCount})</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* EXHIBITIONS */}
            <div className="mb-2">
                <div 
                    onClick={() => toggle('exhibitions')}
                    className="flex items-center gap-2 cursor-pointer hover:text-green-300 font-bold mb-1"
                >
                    <span>{expanded.exhibitions ? '[-]' : '[+]'}</span>
                    <span>EXHIBITIONS</span>
                </div>
                <AnimatePresence>
                    {expanded.exhibitions && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-4 border-l border-green-500/30 pl-2 overflow-hidden"
                        >
                            {years.map(year => (
                                <div key={year} className="mb-1">
                                    <div className="opacity-50 text-[10px]">{year}</div>
                                    {exhibitionsByYear[year].map((ex: any) => (
                                        <div 
                                            key={ex._id}
                                            onClick={() => onSelect('exhibition', ex)}
                                            className="cursor-pointer hover:bg-green-500/10 px-1 py-0.5 truncate opacity-80 hover:opacity-100 pl-2"
                                        >
                                            {ex.title}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* PUBLICATIONS */}
            <div className="mb-2">
                <div 
                    onClick={() => toggle('publications')}
                    className="flex items-center gap-2 cursor-pointer hover:text-green-300 font-bold mb-1"
                >
                    <span>{expanded.publications ? '[-]' : '[+]'}</span>
                    <span>PUBLICATIONS</span>
                </div>
                <AnimatePresence>
                    {expanded.publications && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-4 border-l border-green-500/30 pl-2 overflow-hidden"
                        >
                            {publications.map((pub: any) => (
                                <div 
                                    key={pub._id}
                                    onClick={() => onSelect('publication', pub)}
                                    className="cursor-pointer hover:bg-green-500/10 px-1 py-0.5 truncate opacity-80 hover:opacity-100"
                                >
                                    {pub.title}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* TEXTS */}
            <div className="mb-2">
                <div 
                    onClick={() => toggle('texts')}
                    className="flex items-center gap-2 cursor-pointer hover:text-green-300 font-bold mb-1"
                >
                    <span>{expanded.texts ? '[-]' : '[+]'}</span>
                    <span>TEXTS</span>
                </div>
                <AnimatePresence>
                    {expanded.texts && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-4 border-l border-green-500/30 pl-2 overflow-hidden"
                        >
                            {texts.map((text: any) => (
                                <div 
                                    key={text._id}
                                    onClick={() => onSelect('text', text)}
                                    className="cursor-pointer hover:bg-green-500/10 px-1 py-0.5 truncate opacity-80 hover:opacity-100"
                                >
                                    {text.title}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* INFO / PAGES */}
            <div className="mb-2">
                <div 
                    onClick={() => toggle('info')}
                    className="flex items-center gap-2 cursor-pointer hover:text-green-300 font-bold mb-1"
                >
                    <span>{expanded.info ? '[-]' : '[+]'}</span>
                    <span>INFO</span>
                </div>
                <AnimatePresence>
                    {expanded.info && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-4 border-l border-green-500/30 pl-2 overflow-hidden"
                        >
                            {['CV', 'AGB', 'About', 'Contact', 'Imprint'].map((page) => (
                                <div 
                                    key={page}
                                    onClick={() => onSelect('page', { title: page, _id: page })}
                                    className="cursor-pointer hover:bg-green-500/10 px-1 py-0.5 truncate opacity-80 hover:opacity-100"
                                >
                                    {page.toUpperCase()}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
