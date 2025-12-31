'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { urlFor } from '@/sanity/imageBuilder';
import { Heart, Download, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';
import { useCollection } from '@/context/CollectionContext';

interface WorkItem {
    _id: string;
    title?: string;
    year?: number;
    size?: string;
    technique?: string;
    category?: string;
    categoryId?: string;
    mainImage?: {
        alt: string | undefined; asset?: any
    };
    gallery?: Array<{ asset?: any; alt?: string; caption?: string }>;
    content?: any[];
    slug?: { current?: string };
}

interface ArtworksIIClientProps {
    works: WorkItem[];
    categories: string[];
}

const ITEMS_PER_PAGE = 12;

const CATEGORY_ORDER = [
    'Public Space',
    'Painting',
    'Photography',
    'Digital',
    'Sculpture',
    'Happening',
    'Print',
    'Book',
    'Video'
];

export function ArtworksIIClient({ works, categories: rawCategories }: ArtworksIIClientProps) {
    // Sort categories based on predefined order
    const categories = rawCategories.slice().sort((a, b) => {
        const indexA = CATEGORY_ORDER.findIndex(cat => cat.toLowerCase() === a.toLowerCase());
        const indexB = CATEGORY_ORDER.findIndex(cat => cat.toLowerCase() === b.toLowerCase());

        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    // Find the actual category string that matches "Public Space" from the data
    const defaultCategory = categories.find(cat => cat.toLowerCase() === 'public space') || categories[0] || null;

    // State
    const [activeCategory, setActiveCategory] = useState<string | null>(defaultCategory);
    const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Firebase collection for logged-in users
    const { isCollected, addToCollection, removeFromCollection, userId } = useCollection();

    // Reset pagination when category changes
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
        setExpandedWorkId(null);
    }, [activeCategory]);

    // Filter works by category
    const filteredWorks = activeCategory
        ? works.filter((w) => w.category === activeCategory)
        : works;

    // Paginated works
    const visibleWorks = filteredWorks.slice(0, visibleCount);
    const hasMore = visibleCount < filteredWorks.length;
    const isAtEnd = visibleCount >= filteredWorks.length && filteredWorks.length > ITEMS_PER_PAGE;

    // Toggle favorite (uses Firebase for logged-in users)
    const toggleFavorite = async (id: string) => {
        if (!userId) return; // Only works for logged-in users
        if (isCollected(id)) {
            await removeFromCollection(id);
        } else {
            await addToCollection(id);
        }
    };

    // Show more / show less
    const showMore = () => {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
    };

    const showLess = () => {
        setVisibleCount(ITEMS_PER_PAGE);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="pb-20">
            {/* Category Tabs - styled like main nav */}
            <nav className="sticky top-0 z-40 bg-background border-b border-foreground/10 overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 px-2 py-2 min-w-max" style={{ marginLeft: '6px' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`nav-text transition-colors whitespace-nowrap ${activeCategory === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Works Feed */}
            <div className="px-4 md:px-8 pt-8 space-y-10 md:space-y-40">
                {visibleWorks.map((work) => (
                    <WorkCard
                        key={work._id}
                        work={work}
                        isExpanded={expandedWorkId === work._id}
                        isFavorite={isCollected(work._id)}
                        isLoggedIn={!!userId}
                        onToggleExpand={() =>
                            setExpandedWorkId((prev) => (prev === work._id ? null : work._id))
                        }
                        onToggleFavorite={() => toggleFavorite(work._id)}
                    />
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-16 px-4">
                {hasMore && (
                    <button
                        onClick={showMore}
                        className="px-8 py-4 border border-foreground font-owners uppercase text-sm font-bold hover:bg-foreground hover:text-background transition-colors"
                    >
                        Show More (+{ITEMS_PER_PAGE})
                    </button>
                )}
                {isAtEnd && (
                    <button
                        onClick={showLess}
                        className="px-8 py-4 border border-foreground font-owners uppercase text-sm font-bold hover:bg-foreground hover:text-background transition-colors flex items-center gap-2"
                    >
                        <ArrowUp className="w-4 h-4" />
                        Back to Top
                    </button>
                )}
            </div>

            {/* Empty State */}
            {filteredWorks.length === 0 && (
                <div className="text-center py-32 px-4">
                    <p className="font-owners uppercase text-lg opacity-60">
                        No works found in this category.
                    </p>
                </div>
            )}
        </div>
    );
}

// Individual Work Card Component
interface WorkCardProps {
    work: WorkItem;
    isExpanded: boolean;
    isFavorite: boolean;
    isLoggedIn: boolean;
    onToggleExpand: () => void;
    onToggleFavorite: () => void;
}

function WorkCard({
    work,
    isExpanded,
    isFavorite,
    isLoggedIn,
    onToggleExpand,
    onToggleFavorite,
}: WorkCardProps) {

    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Prepare images array
    const images =
        work.gallery && work.gallery.length > 0
            ? work.gallery
            : work.mainImage?.asset
                ? [work.mainImage]
                : [];

    const totalImages = images.length;

    // Handle scroll to update current index
    const handleScroll = () => {
        if (scrollRef.current && totalImages > 0) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const itemWidth = scrollRef.current.offsetWidth;
            const index = Math.round(scrollLeft / itemWidth);
            setCurrentIndex(Math.min(index, totalImages - 1));
        }
    };

    return (
        <article className="group">
            {/* Horizontal Gallery */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 w-full snap-center aspect-square md:aspect-[4/3] relative bg-foreground/5"
                        >
                            {img.asset && (
                                <Image
                                    src={urlFor(img).width(1200).url()}
                                    alt={img.alt || work.title || 'Artwork'}
                                    fill
                                    className="object-contain"
                                    sizes="100vw"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Image Counter */}
                {totalImages > 1 && (
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-sm font-mono text-xs">
                        {currentIndex + 1} / {totalImages}
                    </div>
                )}

                {/* Scroll Hint */}
                {totalImages > 1 && currentIndex === 0 && (
                    <div className="absolute bottom-4 left-4 font-mono text-xs opacity-60 animate-pulse">
                        ← Scroll →
                    </div>
                )}
            </div>

            {/* Title & Metadata Line */}
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mt-4 px-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        {isLoggedIn && (
                            <button
                                onClick={onToggleFavorite}
                                className="hover:text-[#ff6600] transition-colors"
                                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <Heart
                                    className={`w-5 h-5 ${isFavorite ? 'fill-[#ff6600] text-[#ff6600]' : ''}`}
                                />
                            </button>
                        )}
                        <h2 className="font-owners uppercase text-lg md:text-xl font-black italic">
                            {work.title}
                        </h2>
                    </div>
                    <p className="font-mono text-xs opacity-60 mt-1">
                        {work.year}
                        {work.technique && ` · ${work.technique}`}
                        {work.size && ` · ${work.size}`}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleExpand}
                        className="flex items-center gap-1 font-owners uppercase text-xs font-bold hover:text-[#ff6600] transition-colors"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                More Info
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Expandable Metadata Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="mt-6 px-2 pb-4 border-t border-foreground/10 pt-6">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {work.year && (
                                    <div>
                                        <p className="font-mono text-[10px] uppercase opacity-60">Year</p>
                                        <p className="font-owners text-sm font-bold">{work.year}</p>
                                    </div>
                                )}
                                {work.size && (
                                    <div>
                                        <p className="font-mono text-[10px] uppercase opacity-60">Size</p>
                                        <p className="font-owners text-sm font-bold">{work.size}</p>
                                    </div>
                                )}
                                {work.technique && (
                                    <div>
                                        <p className="font-mono text-[10px] uppercase opacity-60">Technique</p>
                                        <p className="font-owners text-sm font-bold">{work.technique}</p>
                                    </div>
                                )}
                                {work.category && (
                                    <div>
                                        <p className="font-mono text-[10px] uppercase opacity-60">Category</p>
                                        <p className="font-owners text-sm font-bold">{work.category}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={onToggleFavorite}
                                    className={`flex items-center gap-2 px-4 py-2 border font-owners uppercase text-xs font-bold transition-colors ${isFavorite
                                        ? 'border-[#ff6600] text-[#ff6600]'
                                        : 'border-foreground/20 hover:border-foreground'
                                        }`}
                                >
                                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                                    {isFavorite ? 'Saved' : 'Save'}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 border border-foreground/20 hover:border-foreground font-owners uppercase text-xs font-bold transition-colors">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </article>
    );
}
