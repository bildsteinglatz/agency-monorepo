'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface TimelineProps {
  artworks: any[];
  timelineTexts?: any[];
}

export default function Timeline({ artworks, timelineTexts = [] }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<{ x: number, y: number } | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<string>('auto');
  const [cursorColor, setCursorColor] = useState<string>('white');
  const [isIntro, setIsIntro] = useState(false);
  const requestRef = useRef<number | null>(null);

  // Monitor theme changes to update cursor color
  useEffect(() => {
    const updateCursorColor = () => {
      if (typeof window === 'undefined') return;
      const computedStyle = window.getComputedStyle(document.body);
      // Use the body text color, or fallback to white if not set/detected
      setCursorColor(computedStyle.color || 'white');
    };

    // Initial check
    updateCursorColor();

    // Observer for body class/style changes
    const observer = new MutationObserver(updateCursorColor);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, []);

  // Configuration
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const YEAR_LABEL_WIDTH = isMobile ? 60 : 100;
  const IMAGE_WIDTH = isMobile ? 320 : 500;
  const TEXT_WIDTH = isMobile ? 280 : 375;
  const GAP = isMobile ? 30 : 60;
  const EMPTY_YEAR_WIDTH = isMobile ? 30 : 60;
  const PADDING_RIGHT = isMobile ? window.innerWidth * 0.5 : 600;
  const PADDING_LEFT = isMobile ? 32 : 100; // Offset from start

  // Parse artwork year to get position
  const getArtworkYear = (yearStr: string | number) => {
    if (!yearStr) return null;
    const stringValue = yearStr.toString();
    const match = stringValue.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  };

  // Group artworks by year
  const artworksByYear: Record<number, any[]> = {};
  artworks.forEach(art => {
    const y = getArtworkYear(art.year);
    if (y) {
      if (!artworksByYear[y]) artworksByYear[y] = [];
      artworksByYear[y].push(art);
    }
  });

  // Group texts by year
  const textsByYear: Record<number, any[]> = {};
  timelineTexts.forEach(txt => {
    let y = txt.year;
    // Fallback to date if year is missing
    if (!y && txt.date) {
      const match = txt.date.toString().match(/(\d{4})/);
      if (match) y = parseInt(match[1]);
    }

    if (y) {
      if (!textsByYear[y]) textsByYear[y] = [];
      textsByYear[y].push(txt);
    }
  });

  // Flatten items for linear rendering
  interface YearItem { type: 'year'; year: number; x: number; }
  interface ArtworkItem { type: 'artwork'; artwork: any | null; x: number; width: number; text?: string; title?: string; }
  type TimelineItem = YearItem | ArtworkItem;

  const items: TimelineItem[] = [];
  let currentX = PADDING_LEFT; // Start after padding

  // Collect all years from both artworks and texts
  const allYearsSet = new Set<number>();
  artworks.forEach(art => {
    const y = getArtworkYear(art.year);
    if (y) allYearsSet.add(y);
  });
  timelineTexts.forEach(txt => {
    let y = txt.year;
    // Fallback to date if year is missing
    if (!y && txt.date) {
      const match = txt.date.toString().match(/(\d{4})/);
      if (match) y = parseInt(match[1]);
    }
    if (y) allYearsSet.add(y);
  });

  const startYear = 1978;
  const currentYear = new Date().getFullYear();
  const maxYear = Math.max(currentYear, ...Array.from(allYearsSet));
  const years = Array.from({ length: maxYear - startYear + 1 }, (_, i) => startYear + i);

  years.forEach(year => {
    const yearArtworks = artworksByYear[year] || [];
    const yearTexts = textsByYear[year] || [];

    if (yearArtworks.length > 0 || yearTexts.length > 0) {
      // Year with content
      items.push({ type: 'year', year, x: currentX });
      currentX += YEAR_LABEL_WIDTH;

      // Add text item(s) first
      if (yearTexts.length > 0) {
        yearTexts.forEach(textObj => {
          items.push({
            type: 'artwork',
            artwork: null,
            x: currentX,
            width: TEXT_WIDTH,
            text: textObj.text,
            title: textObj.title
          });
          currentX += TEXT_WIDTH + GAP;
        });
      }

      // Add artwork items
      yearArtworks.forEach((art) => {
        items.push({
          type: 'artwork',
          artwork: art,
          x: currentX,
          width: IMAGE_WIDTH,
        });
        currentX += IMAGE_WIDTH + GAP;
      });
    } else {
      // Empty year - compressed
      items.push({ type: 'year', year, x: currentX });
      currentX += EMPTY_YEAR_WIDTH;
    }
  });

  const totalWidth = currentX + PADDING_RIGHT;

  // Scroll to last image on mount
  useEffect(() => {
    if (containerRef.current && items.length > 0) {
      const container = containerRef.current;
      const clientWidth = container.clientWidth;

      // Find the last artwork item
      const lastArtwork = [...items].reverse().find((item): item is ArtworkItem => item.type === 'artwork' && !!item.artwork);

      if (lastArtwork) {
        // Position it so it's centered or near the right, but not cut off
        // Scroll to: item.x - (half of screen) + (half of item width)
        const targetScroll = lastArtwork.x - (clientWidth / 2) + (lastArtwork.width / 2);
        container.scrollLeft = targetScroll;
      } else {
        // Fallback to absolute end
        container.scrollLeft = container.scrollWidth - clientWidth;
      }
      setScrollPos(container.scrollLeft);
    }
  }, [artworks, totalWidth]); // totalWidth ensures layout is ready

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPos(containerRef.current.scrollLeft);
    }
  };

  // Click Navigation Helpers
  const nextItem = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollBy({ left: window.innerWidth * 0.7, behavior: 'smooth' });
    }
  };

  const prevItem = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollBy({ left: -window.innerWidth * 0.7, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    cursorRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!cursorRef.current) return;
    const diffX = Math.abs(e.clientX - cursorRef.current.x);
    const diffY = Math.abs(e.clientY - cursorRef.current.y);

    // If it was a click (not a drag)
    if (diffX < 5 && diffY < 5) {
      const width = window.innerWidth;
      if (e.clientX < width / 2) {
        prevItem();
      } else {
        nextItem();
      }
    }
    cursorRef.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setIsHovering(true);

    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const centerX = width / 2;

      // Encode color for SVG (handle # for hex)
      const encodedColor = encodeURIComponent(cursorColor);

      if (e.clientX < centerX) {
        setCursorStyle(`url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${encodedColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>') 16 16, w-resize`);
      } else {
        setCursorStyle(`url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${encodedColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>') 16 16, e-resize`);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setCursorStyle('auto'); // Reset cursor when leaving
  };

  const handleScrollRight = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    nextItem();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      ref={containerRef}
      onScroll={handleScroll}
      className="relative w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide active:cursor-grabbing"
      style={{ cursor: cursorStyle }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >

      {/* Mobile Scroll Button */}
      <button
        onClick={handleScrollRight}
        className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center active:scale-95 transition-transform bg-black/10 backdrop-blur-[2px]"
        aria-label="Scroll right"
      >
        <ArrowRight className="w-6 h-6 text-white" />
      </button>

      <div
        className="relative h-full"
        style={{
          width: `${totalWidth}px`
        }}
      >
        {/* The Timeline Line */}
        <div
          className="absolute left-0 h-px -translate-y-1/2"
          style={{
            top: 'calc(50% - 65px + 18vh)',
            width: currentX + 300,
            background: 'linear-gradient(to right, currentColor 0%, currentColor 60%, transparent 100%)'
          }}
        />

        {/* Render Items */}
        {items.map((item, index) => {
          if (item.type === 'year') {
            return (
              <div
                key={`year-${item.year}`}
                className="absolute top-0 bottom-0 snap-start"
                style={{ left: item.x, width: YEAR_LABEL_WIDTH }}
              >
                {/* Vertical Line */}
                <div
                  className="absolute left-0 w-px h-6 -translate-y-1/2 bg-current"
                  style={{ top: 'calc(50% - 65px + 18vh)' }}
                />

                {/* Year Text */}
                <div
                  className="absolute left-2 -translate-y-full -mt-3 font-owners font-black italic text-xs"
                  style={{ top: 'calc(50% - 65px + 18vh)' }}
                >
                  {item.year}
                </div>
              </div>
            );
          } else {
            const art = item.artwork;
            return (
              <div
                key={`art-${art ? art._id : 'text'}-${index}`}
                className="absolute top-0 bottom-0 snap-center"
                style={{ left: item.x, width: item.width }}
              >
                {art && (
                  <div
                    className="absolute -translate-y-[66%] w-full h-[60vh] group flex flex-col"
                    style={{ top: 'calc(50% - 65px)' }}
                  >
                    <div className={`relative w-full h-full transition-all duration-500 ${isIntro ? 'blur-sm scale-75' : ''}`}>
                      {art.mainImage?.asset?.url && (
                        <Image
                          src={art.mainImage.asset.url}
                          alt={art.title}
                          fill
                          className="object-contain object-bottom"
                          sizes="500px"
                        />
                      )}
                    </div>
                  </div>
                )}
                {item.text && (
                  <div
                    className="absolute left-0 w-full text-sm font-owners max-w-full whitespace-pre-line z-10 overflow-y-auto pr-4 pb-10"
                    style={{
                      top: 'calc(50% - 45px + 18vh)',
                      bottom: '20px'
                    }}
                    onMouseEnter={() => setIsHovering(false)}
                    onMouseMove={(e) => e.stopPropagation()}
                  >
                    {item.title && <div className="font-bold mb-1">{item.title}</div>}
                    {item.text}
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>
    </motion.div>
  );
}
