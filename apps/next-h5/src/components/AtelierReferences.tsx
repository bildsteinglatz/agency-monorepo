'use client';

import { useState } from 'react';
import { urlFor } from "@/sanity/image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';

interface ReferenceItem {
    _id: string;
    name: string;
    description?: any;
    gallery?: any[];
    website?: string;
}

interface AtelierReferencesProps {
    items: ReferenceItem[];
    title: string;
    bgColor?: string;
    accentColor?: string;
}

export default function AtelierReferences({ items, title, bgColor = 'bg-yellow-400', accentColor = 'bg-white' }: AtelierReferencesProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (item: ReferenceItem) => {
        if (!item) return;
        const hasContent = (item.description && item.description.length > 0) || (item.gallery && item.gallery.length > 0);
        if (!hasContent) return;
        
        setExpandedId(expandedId === item._id ? null : item._id);
    };

    return (
        <section className={`py-12 md:py-20 px-4 md:px-8 border-t-8 border-black ${bgColor}`}>
            <h2 className="text-4xl md:text-7xl mb-8 md:mb-12 uppercase tracking-tighter border-b-8 border-black pb-4">
                {title}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {items.filter(item => item !== null).map((item) => {
                    const isExpanded = expandedId === item._id;
                    const hasContent = (item.description && item.description.length > 0) || (item.gallery && item.gallery.length > 0);
                    
                    return (
                        <motion.div 
                            key={item._id}
                            layout
                            onClick={() => toggleExpand(item)}
                            className={`
                                ${accentColor} border-4 border-black p-4 md:p-6 
                                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
                                flex flex-col transition-all relative
                                ${hasContent ? 'cursor-pointer' : 'cursor-default'}
                                ${isExpanded ? 'lg:col-span-3 xl:col-span-3 row-span-3 z-10' : 'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`text-xl md:text-2xl uppercase leading-none font-black ${isExpanded ? 'text-3xl md:text-5xl mb-6' : ''}`}>
                                    {item.name}
                                </h3>
                                {isExpanded && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedId(null);
                                        }}
                                        className="bg-black text-white px-4 py-2 text-sm font-black uppercase hover:bg-[#FF3100] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                                    >
                                        Schliessen [X]
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {isExpanded ? (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="space-y-8"
                                    >
                                        {item.description && (
                                            <div className="text-base md:text-xl leading-[1.1] font-bold max-w-4xl">
                                                <PortableText 
                                                    value={item.description} 
                                                    components={{
                                                        block: {
                                                            normal: ({ children }) => <p className="mb-3">{children}</p>,
                                                        },
                                                        marks: {
                                                            strong: ({ children }) => <strong className="font-black">{children}</strong>,
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        {item.gallery && item.gallery.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {item.gallery.map((img, idx) => (
                                                    <div key={idx} className="relative border-4 border-black bg-gray-100 overflow-hidden">
                                                        <img 
                                                            src={urlFor(img).url()} 
                                                            alt={`${item.name} gallery ${idx}`} 
                                                            className="w-full h-auto block"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            <div className={`mt-auto pt-4 ${isExpanded ? 'border-t-4 border-black mt-12' : ''}`}>
                                {item.website && (
                                    <a 
                                        href={item.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-block border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors font-black uppercase text-xs"
                                    >
                                        Website ↗
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
