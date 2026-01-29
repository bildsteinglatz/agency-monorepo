'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { urlFor } from '@/sanity/imageBuilder';
import { PortableText } from '@portabletext/react';
import { Publication } from '@/types/publication';

// Polyfill URL.parse for older browsers/environments (added to spec in 2024)
if (typeof URL !== 'undefined' && !URL.parse) {
    (URL as any).parse = (url: string, base?: string | URL) => {
        try {
            return new URL(url, base);
        } catch {
            return null;
        }
    };
}

// Dynamically import PDF content to avoid SSR issues with pdfjs (DOMMatrix error)
const PdfMediaContent = dynamic(() => import('./PdfMediaContent'), { ssr: false });

interface PublicationsClientProps {
    publications: Publication[];
}


export function PublicationsClient({ publications }: PublicationsClientProps) {
    return (
        <div className="pt-32 pb-20 space-y-40">
            {publications.map((pub, index) => (
                <PublicationCard key={pub._id} publication={pub} isFirst={index === 0} />
            ))}

            {publications.length === 0 && (
                <div className="text-center py-32 px-4">
                    <p className="font-owners uppercase text-lg opacity-60">
                        No publications found.
                    </p>
                </div>
            )}
        </div>
    );
}



const CURSOR_PREV = `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMTJINU0xMiAxOWwtNy03IDctNyIvPjwvc3ZnPg==') 16 16, w-resize`;
const CURSOR_NEXT = `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNSAxMmgxNE0xMiA1bDcgNy03IDciLz48L3N2Zz4=') 16 16, e-resize`;

function PublicationCard({ publication, isFirst }: { publication: Publication, isFirst: boolean }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<{ x: number, y: number } | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [pdfPageCount, setPdfPageCount] = useState(0);

    // Prepare media items: PDF (if exists) -> Main Image (skip if PDF exists) -> Preview Images -> Gallery
    const mediaItems: any[] = [];

    // Helper to add if valid
    const addImage = (item: any) => {
        if (item?.asset) {
            mediaItems.push({ type: 'image', ...item });
        }
    };

    // Add PDF first if it exists
    if (publication.pdfUrl) {
        mediaItems.push({ type: 'pdf', url: publication.pdfUrl });
    }

    // Only add main image if there's no PDF
    if (!publication.pdfUrl) {
        addImage(publication.mainImage);
    }

    if (publication.previewImages) {
        publication.previewImages.forEach(addImage);
    }

    if (publication.gallery) {
        publication.gallery.forEach(addImage);
    }

    // Calculate actual total items (counting all PDF pages as separate items)
    const totalItems = mediaItems.reduce((acc, item) => {
        if (item.type === 'pdf') {
            return acc + (pdfPageCount || 1); // Fallback to 1 while loading
        }
        return acc + 1;
    }, 0);

    const handleScroll = () => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const scrollLeft = container.scrollLeft;

            // Find closest item logic - now looking deeper into Document for PDF pages
            const getItems = (el: HTMLElement): HTMLElement[] => {
                const items: HTMLElement[] = [];
                Array.from(el.children).forEach(child => {
                    const htmlChild = child as HTMLElement;
                    // If it's a react-pdf Document, its children are the pages
                    if (htmlChild.classList.contains('react-pdf__Document')) {
                        items.push(...Array.from(htmlChild.children) as HTMLElement[]);
                    } else {
                        items.push(htmlChild);
                    }
                });
                return items;
            };

            const allItems = getItems(container);
            let closestIndex = 0;
            let minDiff = Infinity;
            allItems.forEach((child, idx) => {
                const diff = Math.abs(child.offsetLeft - scrollLeft);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = idx;
                }
            });
            setCurrentIndex(closestIndex);
        }
    };

    // Interaction Handlers (Click to navigate left/right)
    const nextImage = () => {
        if (totalItems > 1 && scrollRef.current) {
            const container = scrollRef.current;
            const getItems = (el: HTMLElement): HTMLElement[] => {
                const items: HTMLElement[] = [];
                Array.from(el.children).forEach(child => {
                    const htmlChild = child as HTMLElement;
                    if (htmlChild.classList.contains('react-pdf__Document')) {
                        items.push(...Array.from(htmlChild.children) as HTMLElement[]);
                    } else {
                        items.push(htmlChild);
                    }
                });
                return items;
            };
            const allItems = getItems(container);
            const nextItem = allItems[currentIndex + 1];
            if (nextItem) {
                container.scrollTo({
                    left: nextItem.offsetLeft,
                    behavior: 'smooth'
                });
            }
        }
    };

    const prevImage = () => {
        if (totalItems > 1 && scrollRef.current) {
            const container = scrollRef.current;
            const getItems = (el: HTMLElement): HTMLElement[] => {
                const items: HTMLElement[] = [];
                Array.from(el.children).forEach(child => {
                    const htmlChild = child as HTMLElement;
                    if (htmlChild.classList.contains('react-pdf__Document')) {
                        items.push(...Array.from(htmlChild.children) as HTMLElement[]);
                    } else {
                        items.push(htmlChild);
                    }
                });
                return items;
            };
            const allItems = getItems(container);
            const prevItem = allItems[currentIndex - 1];
            if (prevItem) {
                container.scrollTo({
                    left: prevItem.offsetLeft,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        cursorRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!cursorRef.current) return;

        const diffX = Math.abs(e.clientX - cursorRef.current.x);
        const diffY = Math.abs(e.clientY - cursorRef.current.y);

        // Click interpretation (< 5px movement)
        if (diffX < 5 && diffY < 5) {
            const width = window.innerWidth;
            if (e.clientX < width / 2) {
                prevImage();
            } else {
                nextImage();
            }
        }
        cursorRef.current = null;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (scrollRef.current) {
            const width = window.innerWidth;
            const cursor = e.clientX < width / 2 ? CURSOR_PREV : CURSOR_NEXT;
            scrollRef.current.style.cursor = cursor;
        }
    };

    return (
        <article className="group">
            {/* Horizontal Gallery */}
            {totalItems > 0 && (
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide items-start gap-[20px] md:gap-[40px] px-4 md:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {mediaItems.map((item, idx) => {
                        if (item.type === 'pdf') {
                            return (
                                <PdfMediaContent
                                    key={`${publication._id}-${idx}`}
                                    url={item.url}
                                    title={publication.title}
                                    onLoadSuccess={(count) => setPdfPageCount(count)}
                                />
                            );
                        }

                        return (
                            <div
                                key={`${publication._id}-${idx}`}
                                className="flex-shrink-0 snap-start relative overflow-hidden h-[50vh] md:h-[60vh] pointer-events-none"
                                style={{
                                    aspectRatio: item.asset?.metadata?.dimensions
                                        ? item.asset.metadata.dimensions.width / item.asset.metadata.dimensions.height
                                        : 0.7
                                }}
                            >
                                <Image
                                    src={urlFor(item).width(1200).url()}
                                    alt={item.alt || publication.title}
                                    fill
                                    className="object-contain object-left-top"
                                    priority={isFirst && idx === 0}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Dots / Counter if multiple */}
            {totalItems > 1 && (
                <div className="mt-2 px-4 md:px-8 font-owners text-[10px] opacity-60">
                    {currentIndex + 1} / {totalItems}
                </div>
            )}

            {/* Info Section - ALWAYS VISIBLE */}
            <div className="mt-4 px-4 md:px-8 font-owners">
                {/* Header: Title & Publisher/Year - Full width (max-w matching columns) */}
                <div className="mb-4 md:mb-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4 flex flex-col gap-1">
                        <h2 className="text-xl md:text-2xl font-black italic uppercase leading-none">
                            {publication.title}
                        </h2>
                        {publication.subtitle && (
                            <p className="text-sm font-normal uppercase leading-tight">{publication.subtitle}</p>
                        )}

                        {/* Publisher & Year - Inline, No Gap */}
                        <div className="text-xs opacity-80 uppercase tracking-wide leading-tight">
                            {[
                                publication.bookFacts?.publisher,
                                publication.bookFacts?.publishedDate ? new Date(publication.bookFacts.publishedDate).getFullYear() : null
                            ].filter(Boolean).join(', ')}
                        </div>
                    </div>
                </div>

                {/* Content Columns: Description (Left) aligned with Authors (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column: Descriptions & PDF (5 Units) */}
                    <div className="md:col-span-5">
                        {/* Short Description */}
                        {publication.shortDescription && (
                            <div className="prose prose-sm max-w-none font-sans leading-snug">
                                {typeof publication.shortDescription === 'string' ? (
                                    <p>{publication.shortDescription}</p>
                                ) : (
                                    <PortableText value={publication.shortDescription} />
                                )}
                            </div>
                        )}

                        {/* Description - Follows Short Description (with small gap if Short exists) */}
                        {publication.description && (
                            <div className={`prose prose-sm max-w-none font-sans leading-snug ${publication.shortDescription ? 'pt-2' : ''}`}>
                                {typeof publication.description === 'string' ? (
                                    <p>{publication.description}</p>
                                ) : (
                                    <PortableText value={publication.description} />
                                )}
                            </div>
                        )}

                        {/* PDF Download */}
                        {publication.pdfUrl && (
                            <div className="mt-4">
                                <a
                                    href={`${publication.pdfUrl}?dl=${(publication.title || 'publication').replace(/\s+/g, '_')}.pdf`}
                                    className="inline-block px-4 py-2 border border-foreground text-[10px] font-bold uppercase hover:bg-foreground hover:text-background transition-colors"
                                    download
                                >
                                    Download PDF
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Authors & Facts (4 Units, started after 1-unit gap) */}
                    <div className="md:col-span-4 md:col-start-7 space-y-4 text-sm leading-snug">
                        {/* Facts Grid - Mobile: 1 col, MD: 2 col */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs uppercase opacity-70">
                            {/* Authors in Grid */}
                            {(() => {
                                const toArray = (val: any) => Array.isArray(val) ? val : (val ? [val] : []);
                                const authorsList = [
                                    ...toArray(publication.authors),
                                    ...toArray(publication.authorsTitle),
                                    ...toArray(publication.textAuthors),
                                    ...toArray(publication.bookFacts?.authors),
                                    publication.author
                                ].filter((name): name is string => !!name && typeof name === 'string');
                                const uniqueAuthors = Array.from(new Set(authorsList));

                                if (uniqueAuthors.length === 0) return null;

                                return (
                                    <div className="flex flex-col">
                                        <span className="font-bold">{uniqueAuthors.length > 1 ? 'Authors' : 'Author'}</span>
                                        <span>{uniqueAuthors.join(', ')}</span>
                                    </div>
                                );
                            })()}

                            {/* Editors in Grid */}
                            {(() => {
                                const toArray = (val: any) => Array.isArray(val) ? val : (val ? [val] : []);
                                const editorsList = [
                                    ...toArray(publication.editors),
                                    ...toArray(publication.bookFacts?.editors),
                                    publication.editor
                                ].filter((name): name is string => !!name && typeof name === 'string');
                                const uniqueEditors = Array.from(new Set(editorsList));

                                if (uniqueEditors.length === 0) return null;

                                return (
                                    <div className="flex flex-col">
                                        <span className="font-bold">{uniqueEditors.length > 1 ? 'Editors' : 'Editor'}</span>
                                        <span>{uniqueEditors.join(', ')}</span>
                                    </div>
                                );
                            })()}

                            {/* Design */}
                            {publication.bookFacts?.design && (
                                <div className="flex flex-col">
                                    <span className="font-bold">Design</span>
                                    <span>{publication.bookFacts.design}</span>
                                </div>
                            )}

                            {/* Pages */}
                            {publication.bookFacts?.pages && (
                                <div className="flex flex-col">
                                    <span className="font-bold">Seiten</span>
                                    <span>{publication.bookFacts.pages}</span>
                                </div>
                            )}

                            {/* Dimensions */}
                            {publication.bookFacts?.dimensions && (
                                <div className="flex flex-col">
                                    <span className="font-bold">Dimension</span>
                                    <span>{publication.bookFacts.dimensions}</span>
                                </div>
                            )}

                            {/* Edition */}
                            {publication.bookFacts?.edition && (
                                <div className="flex flex-col">
                                    <span className="font-bold">Edition</span>
                                    <span>{publication.bookFacts.edition}</span>
                                </div>
                            )}

                            {/* ISBN */}
                            {publication.bookFacts?.isbn && (
                                <div className="flex flex-col">
                                    <span className="font-bold">ISBN</span>
                                    <span>{publication.bookFacts.isbn}</span>
                                </div>
                            )}

                            {/* Price */}
                            {publication.bookFacts?.price && (
                                <div className="flex flex-col">
                                    <span className="font-bold">Price</span>
                                    <span>€ {publication.bookFacts.price}</span>
                                </div>
                            )}

                            {/* Availability / Purchase Link Placeholder */}
                            {publication.bookFacts?.availability && (
                                <div className="flex flex-col">
                                    <span className="font-bold">Purchase ↗</span>
                                    <span>{publication.bookFacts.availability}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
