'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { urlFor } from '@/sanity/imageBuilder';
import { Heart, Download, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { useCollection } from '@/context/CollectionContext';
import { useRetraction } from '@/components/RetractionContext';
import PdfGenerator from '../PdfGenerator';

import { WorkItem } from '@/app/artworks-ii/page';

interface ArtworksIIClientProps {
    works: WorkItem[];
    categories: string[];
}

const ITEMS_PER_PAGE = 12;

const CATEGORY_ORDER = [
    'Public Space',
    'Painting',
    'Relational',
    'Sculpture',
    'Print',
    'Photography',
    'Video'
];

export function ArtworksIIClient({ works, categories: rawCategories }: ArtworksIIClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Filter out unwanted categories and sort based on predefined order
    const categories = rawCategories
        .map(cat => cat === 'Happening' ? 'Relational' : cat)
        .filter((cat, index, self) => {
            const lower = cat.toLowerCase();
            return lower !== 'digital' && lower !== 'test' && lower !== 'book' && self.indexOf(cat) === index;
        })
        .slice()
        .sort((a, b) => {
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
    const [activeCategory, setActiveCategory] = useState<string | null>(() => {
        const catParam = searchParams.get('category');
        if (catParam) {
            return categories.find(c => c.toLowerCase() === catParam.toLowerCase()) || defaultCategory;
        }
        return defaultCategory;
    });
    const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [showIntroHint, setShowIntroHint] = useState(true);

    // Sync activeCategory with searchParams
    useEffect(() => {
        const catParam = searchParams.get('category');
        if (catParam) {
            const matchedCat = categories.find(c => c.toLowerCase() === catParam.toLowerCase());
            if (matchedCat) {
                setActiveCategory(matchedCat);
                return;
            }
        }
        // Default to Public Space if no param or no match
        setActiveCategory(defaultCategory);
    }, [searchParams, categories, defaultCategory]);

    const handleCategoryChange = (cat: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', cat.toLowerCase());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Firebase collection for logged-in users
    const { isCollected, addToCollection, removeFromCollection, userId } = useCollection();
    const { retractionLevel } = useRetraction();

    // Reset pagination when category changes
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
        setExpandedWorkId(null);
    }, [activeCategory]);

    // Filter works by category
    const filteredWorks = activeCategory
        ? works.filter((w) => {
            const workCategory = w.category === 'Happening' ? 'Relational' : w.category;
            return workCategory === activeCategory;
        })
        : works;

    // Paginated works
    const visibleWorks = filteredWorks.slice(0, visibleCount);
    const hasMore = visibleCount < filteredWorks.length;
    const isAtEnd = visibleCount >= filteredWorks.length && filteredWorks.length > ITEMS_PER_PAGE;

    // Toggle favorite (uses Firebase for logged-in users)
    const toggleFavorite = async (id: string) => {
        if (!userId) {
            router.push('/user-settings');
            return;
        }
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
            <div className={`w-full secondary-navigation pb-10 sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                <nav className="second-nav pt-[6px] pb-0.5">
                    <div className="flex gap-x-3 gap-y-1 items-center px-0 flex-wrap" style={{ marginLeft: '8px', marginTop: '2px', paddingBottom: '4px' }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`nav-text transition-colors whitespace-nowrap ${activeCategory === cat ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </nav>
            </div>

            {/* Works Feed */}
            <div className="pt-0 space-y-10 md:space-y-40">
                {visibleWorks.map((work, index) => (
                    <WorkCard
                        key={work._id}
                        work={work}
                        isFirst={index === 0}
                        isExpanded={expandedWorkId === work._id}
                        isFavorite={isCollected(work._id)}
                        isLoggedIn={!!userId}
                        showHint={index === 0 && showIntroHint}
                        onHintComplete={() => setShowIntroHint(false)}
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

// Helper to get embed URL for YouTube or Vimeo
function getEmbedUrl(url: string) {
    if (!url) return null;
    
    // If it's already an embed URL, return it
    if (url.includes('player.vimeo.com/video/') || url.includes('youtube.com/embed/')) {
        return url;
    }
    
    // Vimeo
    // More robust regex for various Vimeo URL formats
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|manage\/videos\/|)(\d+)(?:$|\/|\?)/i);
    if (vimeoMatch) {
        const id = vimeoMatch[1];
        // Check for private hash in URL (e.g. vimeo.com/123456789/abcdef1234)
        const hashMatch = url.match(/vimeo\.com\/\d+\/([a-z0-9]+)/i);
        const hash = hashMatch ? hashMatch[1] : null;
        return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ''}?badge=0&autopause=0&player_id=0&app_id=58479`;
    }
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    return null;
}

// Individual Work Card Component
interface WorkCardProps {
    work: WorkItem;
    isFirst?: boolean;
    isExpanded: boolean;
    isFavorite: boolean;
    isLoggedIn: boolean;
    showHint?: boolean;
    onHintComplete?: () => void;
    onToggleExpand: () => void;
    onToggleFavorite: () => void;
}

function WorkCard({
    work,
    isFirst,
    isExpanded,
    isFavorite,
    isLoggedIn,
    showHint,
    onHintComplete,
    onToggleExpand,
    onToggleFavorite,
}: WorkCardProps) {

    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Prepare media items: Images first, then Video at the end
    const videoUrl = work.vimeoVideo?.vimeoUrl || work.vimeoUrl;
    const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
    
    const mediaItems: any[] = [];
    
    if (work.mainImage?.asset) {
        mediaItems.push({ type: 'image', ...work.mainImage });
    }
    
    if (work.gallery && work.gallery.length > 0) {
        const mainImageAssetId = work.mainImage?.asset?._id || work.mainImage?.asset?._ref;
        const galleryImages = work.gallery.filter(item => {
            const assetId = item.asset?._id || item.asset?._ref;
            return assetId && assetId !== mainImageAssetId;
        }).map(img => ({ type: 'image', ...img }));
        mediaItems.push(...galleryImages);
    }

    // Always put video at the end of the gallery
    if (embedUrl) {
        mediaItems.push({ type: 'video', url: embedUrl });
    }

    const totalItems = mediaItems.length;

    // Get current metadata (for grouped works)
    const currentItem = mediaItems[currentIndex];
    const displayTitle = currentItem?.title || work.title;
    const displayYear = currentItem?.year || work.year;
    const displaySize = currentItem?.size || work.size;
    const displayTechnique = currentItem?.technique || work.technique;
    const displayExhibitions = currentItem?.exhibitions || work.exhibitions;
    const displayLiterature = currentItem?.literature || work.literature;
    const displayContent = currentItem?.content || work.content;

    // Handle scroll to update current index
    const handleScroll = () => {
        if (scrollRef.current && totalItems > 0) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const itemWidth = scrollRef.current.offsetWidth;
            const index = Math.round(scrollLeft / itemWidth);
            setCurrentIndex(Math.min(index, totalItems - 1));
        }
    };

    return (
        <article className="group pb-10 md:pb-20" style={{ overflowAnchor: 'none' }}>
            {/* Horizontal Gallery */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide items-center"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {mediaItems.map((item, idx) => {
                        if (item.type === 'video') {
                            return (
                                <div
                                    key={idx}
                                    className="flex-shrink-0 w-full snap-start relative aspect-video bg-black max-h-[80vh] md:max-h-[90vh] min-h-[300px] md:min-h-[500px] self-center"
                                >
                                    <iframe
                                        src={item.url}
                                        className="absolute inset-0 w-full h-full"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        title={work.title || 'Video'}
                                        style={{ border: 'none' }}
                                    />
                                </div>
                            );
                        }

                        const dimensions = item.asset?.metadata?.dimensions;
                        const isVertical = dimensions ? dimensions.height > dimensions.width : false;

                        return (
                            <div
                                key={idx}
                                className={`flex-shrink-0 w-full snap-start relative self-end ${isVertical
                                    ? 'h-[80vh] md:h-[90vh]'
                                    : 'aspect-square md:aspect-[4/3] bg-foreground/5 max-h-[80vh] md:max-h-[90vh]'
                                    }`}
                            >
                                {item.asset && (
                                    <Image
                                        src={urlFor(item).width(2000).url()}
                                        alt={item.alt || work.title || 'Artwork'}
                                        fill
                                        className="object-contain object-left-bottom"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                        priority={isFirst && idx === 0}
                                        fetchPriority={isFirst && idx === 0 ? "high" : undefined}
                                        placeholder={item.asset?.metadata?.lqip ? "blur" : "empty"}
                                        blurDataURL={item.asset?.metadata?.lqip}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Swipe Hint Overlay */}
                <AnimatePresence>
                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
                            onAnimationComplete={() => {
                                setTimeout(() => onHintComplete?.(), 4500);
                            }}
                        >
                            <motion.div
                                animate={{
                                    x: [0, 0, 0, -120, 120, 0],
                                    y: [300, -400, 0, 0, 0, 0],
                                    opacity: [0, 1, 1, 1, 1, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                                    ease: "easeInOut"
                                }}
                                className="flex flex-col items-center"
                            >
                                <svg 
                                    width="40" 
                                    height="40" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className="text-white/40"
                                >
                                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                                </svg>
                                <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Swipe</div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Image Counter - Under Image */}
            {totalItems > 1 && (
                <div className="mt-[3px] px-4 md:px-8" style={{ paddingLeft: '8px' }}>
                    <div className="font-mono text-[10px] opacity-60 tracking-tighter leading-none">
                        {currentIndex + 1} von {totalItems}
                    </div>
                </div>
            )}

            {/* Title & Metadata Line */}
            <div className={`${totalItems > 1 ? 'mt-[0px]' : 'mt-[13px]'} px-4 md:px-8`} style={{ paddingLeft: '8px' }}>
                <div className="flex items-center gap-x-10 gap-y-2 flex-wrap">
                    <h2 className="font-owners uppercase text-lg md:text-xl font-black italic">
                        {displayTitle}{displayYear ? `, ${displayYear}` : ''}
                    </h2>
                    <div className="flex items-center gap-x-1">
                        <button
                            onClick={onToggleExpand}
                            className="flex items-center justify-center hover:text-[#ff6600] transition-colors"
                        >
                            <span className="text-[20px] md:text-[22px] font-medium leading-none" style={{ marginTop: '0px' }}>
                                {isExpanded ? '−' : '+'}
                            </span>
                        </button>
                        <button
                            onClick={onToggleFavorite}
                            className="hover:text-[#ff6600] transition-colors"
                            style={{ marginTop: '-2px', marginLeft: '2px' }}
                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart
                                className={`w-4 h-4 ${isFavorite ? 'fill-[#ff6600] text-[#ff6600]' : ''}`}
                            />
                        </button>
                    </div>
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
                        style={{ overflowAnchor: 'none' }}
                    >
                        <div className="mt-2 px-4 md:px-8 pb-4" style={{ paddingLeft: '8px' }}>
                            {/* Metadata */}
                            <div className="flex flex-col gap-y-3 mb-4">
                                {displaySize && (
                                    <div>
                                        <p className="font-mono text-[10px] uppercase opacity-60 leading-none mb-1">Größe</p>
                                        <p className="font-owners text-sm font-bold">{displaySize}</p>
                                    </div>
                                )}
                                {displayTechnique && (
                                    <div>
                                        <p className="font-mono text-[10px] uppercase opacity-60 leading-none mb-1">Technik</p>
                                        <p className="font-owners text-sm font-bold">{displayTechnique}</p>
                                    </div>
                                )}
                            </div>

                            {/* Exhibitions & Literature */}
                            <div className="flex flex-col gap-y-4 mb-4">
                                {displayExhibitions && displayExhibitions.length > 0 && (
                                    <div>
                                        <p className="font-mono text-[10px] uppercase opacity-60 mb-1 leading-none">AUSGESTELLT</p>
                                        <div className="space-y-0.5">
                                            {displayExhibitions.map((ex: any) => (
                                                <p key={ex._id} className="font-owners text-sm font-bold italic">{ex.title}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {displayLiterature && displayLiterature.length > 0 && (
                                    <div>
                                        <p className="font-mono text-[10px] uppercase opacity-60 mb-1 leading-none">ABGEBILDET</p>
                                        <div className="space-y-0.5">
                                            {displayLiterature.map((lit: any) => (
                                                <p key={lit._id} className="font-owners text-sm font-bold italic">{lit.title}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description / Content */}
                            {displayContent && (
                                <div className="mb-4 max-w-2xl">
                                    <div className="font-owners text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
                                        <PortableText value={displayContent} />
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <PdfGenerator
                                    imageUrl={urlFor(currentItem).url()}
                                    title={displayTitle || ''}
                                    artist="Bildstein | Glatz"
                                    year={displayYear?.toString() || ''}
                                    technique={displayTechnique}
                                    size={displaySize}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </article>
    );
}
