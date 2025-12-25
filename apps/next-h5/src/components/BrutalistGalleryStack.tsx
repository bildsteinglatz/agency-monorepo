'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { urlFor } from '@/sanity/image';

interface GalleryImage {
    alt?: string;
    [key: string]: any;
}

interface BrutalistGalleryStackProps {
    images: GalleryImage[];
}

export default function BrutalistGalleryStack({ images }: BrutalistGalleryStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    // Show up to 3 shadow layers behind
    const stackLevels = [1, 2, 3];

    return (
        <div className="relative w-full aspect-[5/8] group">
            {/* The Stack effect (Shadow layers) */}
            {stackLevels.map((level) => (
                <div
                    key={level}
                    className="absolute inset-0 border-4 border-black bg-white"
                    style={{
                        transform: `translate(${level * 3}px, ${level * 3}px)`,
                        zIndex: -level,
                    }}
                />
            ))}

            {/* Main Image Container */}
            <div className="absolute inset-0 border-4 border-black bg-white overflow-hidden z-0">
                <AnimatePresence mode="wait">
                    <m.div
                        key={currentIndex}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full h-full relative"
                    >
                        <Image
                            src={urlFor(images[currentIndex]).width(1000).auto('format').url()}
                            alt={images[currentIndex].alt || `Gallery image ${currentIndex + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </m.div>
                </AnimatePresence>
            </div>

            {/* Interaction Layer */}
            <button
                onClick={nextImage}
                className="absolute inset-0 z-10 flex items-center justify-end p-4 group/btn"
                aria-label="Nächstes Bild"
            >
                {/* Brutalist Arrow Overlay - Right Centered */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border-4 border-black p-3 translate-x-3 group-hover:translate-x-0 transition-transform duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        className="text-black"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>

                {/* Count Indicator */}
                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 text-sm font-black border-2 border-white">
                    {currentIndex + 1} / {images.length}
                </div>
            </button>
        </div>
    );
}
