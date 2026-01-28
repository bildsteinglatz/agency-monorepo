'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { urlFor } from '@/sanity/imageBuilder';
import { ArrowUp, Heart } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { useRetraction } from '@/components/RetractionContext';
import { ExhibitionPreview } from '@/types/exhibition';
import { useCollection } from '@/context/CollectionContext';
import ShareTrigger from '../artwork/ShareTrigger';
import ClientPortal from '@/components/ClientPortal';

interface ExhibitionsClientProps {
  exhibitions: ExhibitionPreview[];
  years: number[];
  types: string[];
}

const ITEMS_PER_PAGE = 1000;

const TYPE_ORDER = [
  'solo',
  'group',
  'public_space',
  'fair',
  'biennale'
];

const getTypeLabel = (type: string) => {
  switch (type.toLowerCase()) {
    case 'solo': return 'Solo';
    case 'group': return 'Group';
    case 'public_space': return 'Public Space';
    case 'fair': return 'Fair';
    case 'biennale': return 'Biennale';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export function ExhibitionsClient({ exhibitions, types: rawTypes }: ExhibitionsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { retractionLevel } = useRetraction();

  const types = rawTypes
    .filter((t, index, self) => t && self.indexOf(t) === index)
    .sort((a, b) => {
      const indexA = TYPE_ORDER.indexOf(a);
      const indexB = TYPE_ORDER.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  const defaultType = null;

  // State
  const [activeType, setActiveType] = useState<string | null>(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      return types.find(t => t.toLowerCase() === typeParam.toLowerCase()) || defaultType;
    }
    return defaultType;
  });
  const [expandedExId, setExpandedExId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showIntroHint, setShowIntroHint] = useState(true);
  const [isSearching, setIsSearching] = useState(searchParams.has('search'));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isInstantTransition, setIsInstantTransition] = useState(false);

  // Detect if user is near the bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 100;
      setIsNearBottom(scrollPos >= threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync activeType and search with searchParams
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const searchParam = searchParams.get('search');

    // Only use params to SET state, avoid clearing it if we're in the middle of a toggle
    if (typeParam) {
      const matchedType = types.find(t => t.toLowerCase() === typeParam.toLowerCase());
      if (matchedType) {
        setActiveType(matchedType);
        setIsSearching(false);
        setSearchQuery('');
      }
    } else if (searchParam !== null) {
      setSearchQuery(searchParam);
      setIsSearching(true);
      setActiveType(null);
    } else if (searchParams.toString() === '') {
      // Only reset to defaults if we are at the root URL with no params at all
      setActiveType(null);
      // Don't force-close search here if the user just opened it (query would be empty)
      if (searchQuery !== '') {
        setIsSearching(false);
        setSearchQuery('');
      }
    }
  }, [searchParams, types]);

  const handleTypeChange = (type: string | null, fromBottom = false) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    setIsSearching(false);
    setSearchQuery('');

    if (type) {
      params.set('type', type.toLowerCase());
      setActiveType(type);
    } else {
      params.delete('type');
      setActiveType(null);
    }

    if (fromBottom) {
      setIsInstantTransition(true);
      window.scrollTo({ top: 0, behavior: 'auto' });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      
      setTimeout(() => {
        setIsInstantTransition(false);
      }, 500);
    } else {
      setIsInstantTransition(false);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handleSearchToggle = () => {
    const nextState = !isSearching;
    setIsSearching(nextState);
    if (nextState) {
      setActiveType(null);
      // We don't push to router yet to avoid useEffect fighting us
    } else {
      setSearchQuery('');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');
      params.delete('type');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const onSearchChange = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Reset pagination when type changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    setExpandedExId(null);
  }, [activeType]);

  const filteredExhibitions = exhibitions.filter((e) => {
    const matchesType = !activeType || e.exhibitionType === activeType;
    const matchesSearch = !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue?.name && e.venue.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.year && e.year.toString().includes(searchQuery.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const visibleExhibitions = filteredExhibitions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredExhibitions.length;
  const isAtEnd = visibleCount >= filteredExhibitions.length && filteredExhibitions.length > ITEMS_PER_PAGE;

  const showMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const showLess = () => {
    setVisibleCount(ITEMS_PER_PAGE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <div className={`w-full secondary-navigation sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <nav className="second-nav pt-[6px] pb-[7px] relative">
          <div className="nav-container-alignment flex gap-x-[5px] md:gap-x-3 gap-y-1 items-center flex-wrap">
            <button
              onClick={() => handleTypeChange(null)}
              className={`nav-text transition-colors whitespace-nowrap ${activeType === null && !isSearching ? 'active' : ''}`}
            >
              All
            </button>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`nav-text transition-colors whitespace-nowrap ${activeType === type ? 'active' : ''}`}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
          <div className="border-b-[1px] border-foreground w-full absolute bottom-0 left-0" />
        </nav>
      </div>

      {/* Exhibitions FeedPortal for Footer */}
      <ClientPortal selector="footer-portal-content">
        <AnimatePresence>
          {isNearBottom && (
            <>
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="border-t-[1px] border-foreground w-full absolute top-0 left-0 origin-left" 
              />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="nav-container-alignment w-full pt-[6px]"
              >
                <div className="flex gap-x-[5px] md:gap-x-3 gap-y-1 items-start justify-start flex-wrap font-bold italic uppercase">
                  <button
                    onClick={() => handleTypeChange(null, true)}
                    className={`nav-text transition-colors whitespace-nowrap uppercase ${activeType === null && !isSearching ? 'active' : ''}`}
                  >
                    All
                  </button>
                  {types.map((type) => (
                    <button
                      key={`footer-${type}`}
                      onClick={() => handleTypeChange(type, true)}
                      className={`nav-text transition-colors whitespace-nowrap uppercase ${activeType === type ? 'active' : ''}`}
                    >
                      {getTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </ClientPortal>

      {/* Exhibitions Feed */}
      <motion.div 
        animate={{ opacity: isInstantTransition ? 0 : 1 }}
        className="pt-10 md:pt-24 lg:pt-32 space-y-4 md:space-y-28"
      >
        {visibleExhibitions.map((ex, index) => (
          <ExhibitionCard
            key={ex._id}
            exhibition={ex}
            isFirst={index === 0}
            isExpanded={expandedExId === ex._id}
            showHint={index === 0 && showIntroHint}
            onHintComplete={() => setShowIntroHint(false)}
            onToggleExpand={() =>
              setExpandedExId((prev) => (prev === ex._id ? null : ex._id))
            }
          />
        ))}
      </motion.div>
      
      <div className="flex justify-center flex-col items-center gap-4 mt-20 md:mt-32 pb-20">
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
      {filteredExhibitions.length === 0 && (
        <div className="text-center py-32 px-4">
          <p className="font-owners uppercase text-lg opacity-60">
            No shows found in this category.
          </p>
        </div>
      )}
    </div>
  );
}

function FadeInImage({ item, isPriority, className }: { item: any, isPriority: boolean, className?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {item.asset && (
        <div
          className={`w-full h-full transition-opacity duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={urlFor(item).width(1600).url()}
            alt={item.alt || 'Exhibition Image'}
            fill
            className={className || "object-contain object-left-top"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority={isPriority}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      )}
    </div>
  );
}

interface ExhibitionCardProps {
  exhibition: ExhibitionPreview;
  isFirst?: boolean;
  isExpanded: boolean;
  showHint?: boolean;
  onHintComplete?: () => void;
  onToggleExpand: () => void;
}

function ExhibitionCard({
  exhibition,
  isFirst,
  isExpanded,
  showHint,
  onHintComplete,
  onToggleExpand,
}: ExhibitionCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveringHeart, setHoveringHeart] = useState(false);
  const cursorRef = useRef<{ x: number, y: number } | null>(null);

  const { isCollected, addToCollection, removeFromCollection, userId } = useCollection();
  const isFavorite = isCollected(exhibition._id);
  const isLoggedIn = !!userId;

  const onToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      // Potentially redirect to login or show modal
      return;
    }
    if (isFavorite) {
      await removeFromCollection(exhibition._id);
    } else {
      await addToCollection(exhibition._id);
    }
  };

  // Prepare media items
  const mediaItems: any[] = [];

  // Always include main image first
  if (exhibition.mainImage?.asset) {
    mediaItems.push({ ...exhibition.mainImage, localId: exhibition._id + '-main' });
  }

  // Add gallery items
  if (exhibition.gallery && exhibition.gallery.length > 0) {
    exhibition.gallery.forEach((item: any) => {
      if (item.asset) {
        const assetId = item.asset._id || item.asset._ref;
        const mainAssetId = exhibition.mainImage?.asset?._id || exhibition.mainImage?.asset?._ref;
        if (assetId !== mainAssetId) {
          mediaItems.push({ ...item, localId: item._key || assetId });
        }
      }
    });
  }

  const totalItems = mediaItems.length;
  const isLooped = totalItems > 1;
  const renderedItems = isLooped ? [...mediaItems, ...mediaItems, ...mediaItems] : mediaItems;

  useEffect(() => {
    if (isLooped && scrollRef.current) {
      const container = scrollRef.current;
      const children = Array.from(container.children);
      setTimeout(() => {
        const startItem = children[totalItems] as HTMLElement;
        if (startItem) {
          container.scrollLeft = startItem.offsetLeft;
        }
      }, 0);
    }
  }, [isLooped, totalItems]);

  const handleScroll = () => {
    if (scrollRef.current && totalItems > 0) {
      const container = scrollRef.current;
      const scrollLeft = container.scrollLeft;
      const children = Array.from(container.children);

      let closestIndex = 0;
      let minDiff = Infinity;

      children.forEach((child, idx) => {
        const diff = Math.abs((child as HTMLElement).offsetLeft - scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = idx;
        }
      });
      setCurrentIndex(closestIndex % totalItems);

      if (isLooped && children.length >= totalItems * 3) {
        const firstSetStart = (children[0] as HTMLElement).offsetLeft;
        const middleSetStart = (children[totalItems] as HTMLElement).offsetLeft;
        const loopWidth = middleSetStart - firstSetStart;

        requestAnimationFrame(() => {
          if (!scrollRef.current) return;
          const currentScroll = scrollRef.current.scrollLeft;
          const buffer = loopWidth * 0.2;

          if (currentScroll < middleSetStart - loopWidth + buffer) {
            scrollRef.current.scrollLeft += loopWidth;
          } else if (currentScroll > middleSetStart + loopWidth - buffer) {
            scrollRef.current.scrollLeft -= loopWidth;
          }
        });
      }
    }
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (totalItems > 1 && scrollRef.current) {
      const container = scrollRef.current;
      const children = Array.from(container.children);
      let closestIndex = 0;
      let minDiff = Infinity;
      children.forEach((child, idx) => {
        const diff = Math.abs((child as HTMLElement).offsetLeft - container.scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = idx;
        }
      });

      const nextItem = children[closestIndex + 1];
      if (nextItem) {
        container.scrollTo({
          left: (nextItem as HTMLElement).offsetLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (totalItems > 1 && scrollRef.current) {
      const container = scrollRef.current;
      const children = Array.from(container.children);
      let closestIndex = 0;
      let minDiff = Infinity;
      children.forEach((child, idx) => {
        const diff = Math.abs((child as HTMLElement).offsetLeft - container.scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = idx;
        }
      });

      const prevItem = children[closestIndex - 1];
      if (prevItem) {
        container.scrollTo({
          left: (prevItem as HTMLElement).offsetLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const CURSOR_PREV = `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMTJINU0xMiAxOWwtNy03IDctNyIvPjwvc3ZnPg==') 16 16, w-resize`;
  const CURSOR_NEXT = `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNSAxMmgxNE0xMiA1bDcgNy03IDciLz48L3N2Zz4=') 16 16, e-resize`;

  const handleMouseDown = (e: React.MouseEvent) => {
    cursorRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!cursorRef.current) return;
    const diffX = Math.abs(e.clientX - cursorRef.current.x);
    const diffY = Math.abs(e.clientY - cursorRef.current.y);
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

  const venueString = exhibition.venue && [exhibition.venue.name, exhibition.venue.city, exhibition.venue.state].filter(Boolean).join(', ');

  return (
    <article className="group pb-6 md:pb-20" style={{ overflowAnchor: 'none' }}>
      {/* Title & Metadata - Refined Typography */}
      <div className="mb-[11px] px-4 md:px-8" style={{ paddingLeft: '8px' }}>
        <div className="flex flex-col font-owners">
          <div className="flex items-baseline gap-x-3 mb-[2px]">
            <span className="text-[10px] font-normal uppercase tracking-widest opacity-80 shrink-0">
              {exhibition.year}
            </span>
            <h2 className="text-xl md:text-2xl font-black italic uppercase leading-none">
              {exhibition.title}
            </h2>
          </div>
          <div className="flex items-center gap-x-12 text-[10px] font-normal uppercase tracking-widest opacity-80 leading-tight">
            {venueString && (
              <span>{venueString}</span>
            )}
            {exhibition.exhibitionType && (
              <span className="opacity-80">{getTypeLabel(exhibition.exhibitionType)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Gallery */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide items-start gap-[40px] md:gap-[150px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {renderedItems.map((item, idx) => {
            const dimensions = item.asset?.metadata?.dimensions;
            const aspectRatio = dimensions ? dimensions.width / dimensions.height : 1;

            return (
              <div
                key={`${idx}-${item.localId || item._id || item._key}`}
                className="flex-shrink-0 snap-start relative overflow-hidden h-[60vh] md:h-[70vh] lg:h-[75vh]"
                style={{ aspectRatio: aspectRatio }}
              >
                <FadeInImage
                  item={item}
                  isPriority={!!isFirst && idx === 0}
                  className="object-contain object-left-top pointer-events-none"
                />
              </div>
            );
          })}
        </div>

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
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
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

      {/* Metadata Line - Unified under image */}
      <div className="mt-2 px-4 md:px-8" style={{ paddingLeft: '8px' }}>
        <div className="flex items-center gap-x-6 text-[10px] uppercase font-normal font-owners tracking-widest leading-none">
          {/* Counter */}
          {totalItems > 1 && (
            <div className="opacity-80 whitespace-nowrap">
              {currentIndex + 1} von {totalItems}
            </div>
          )}

          {/* Info Toggle */}
          <button
            onClick={onToggleExpand}
            className="hover:text-[#ff6600] transition-colors whitespace-nowrap font-owners text-[10px] uppercase font-normal tracking-widest"
          >
            {isExpanded ? 'weniger information' : 'mehr information'}
          </button>

          {/* Share */}
          <ShareTrigger
            title={exhibition.title}
            description={venueString}
            slug={exhibition.slug || exhibition._id}
            imageUrl={exhibition.mainImage?.asset ? urlFor(exhibition.mainImage).url() : ''}
            baseUrl="/exhibitions"
            className="opacity-100"
          />

          {/* Collect / Favorite */}
          <div className="relative flex items-center">
            <button
              onClick={onToggleFavorite}
              onMouseEnter={() => setHoveringHeart(true)}
              onMouseLeave={() => setHoveringHeart(false)}
              className="hover:text-[#ff6600] transition-colors relative"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#ff6600] text-[#ff6600]' : 'opacity-60 hover:opacity-100'}`}
              />
            </button>

            {/* Tooltip */}
            <AnimatePresence>
              {hoveringHeart && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap pointer-events-none z-[100]"
                >
                  <div className="bg-background/90 backdrop-blur-sm px-2 py-1 border border-foreground/10 shadow-sm font-owners text-[10px] uppercase font-normal tracking-widest text-[#ff6600]">
                    {!isLoggedIn ? (
                      'Anmelden um zu sammeln'
                    ) : !isFavorite ? (
                      'Zu deiner Sammlung hinzufügen'
                    ) : 'Von Sammlung entfernen'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Website Link (Optional, if exists) */}
          {exhibition.weblink && (
            <a
              href={exhibition.weblink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#ff6600] transition-colors whitespace-nowrap hidden sm:inline font-owners text-[10px] uppercase font-normal tracking-widest"
            >
              Website ↗
            </a>
          )}
        </div>
      </div>

      {/* Expandable Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 px-4 md:px-8 pb-4" style={{ paddingLeft: '8px' }}>
              {exhibition.text && (
                <div className="max-w-2xl font-owners">
                  <div className="text-xs md:text-sm font-normal normal-case leading-relaxed prose prose-sm prose-invert max-w-none opacity-90">
                    {typeof exhibition.text === 'string' ? exhibition.text : <PortableText value={exhibition.text} />}
                  </div>
                </div>
              )}
              <div className="mt-6 flex flex-col gap-y-1 font-owners text-xs md:text-sm font-normal normal-case opacity-60">
                {exhibition.serialNumber && <p>Exhibition Nr. {exhibition.serialNumber}</p>}
                {exhibition.exhibitionType && <p>Type: {exhibition.exhibitionType}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
