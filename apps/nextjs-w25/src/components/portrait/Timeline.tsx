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
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [mouseX, setMouseX] = useState(0);
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
  const YEAR_LABEL_WIDTH = 100;
  const IMAGE_WIDTH = 500; // Larger images
  const TEXT_WIDTH = 375; // 3/4 of IMAGE_WIDTH
  const GAP = 60;
  const EMPTY_YEAR_WIDTH = 60;
  const PADDING_RIGHT = 600;
  
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
  type TimelineItem = 
    | { type: 'year', year: number, x: number }
    | { type: 'artwork', artwork: any | null, x: number, width: number, text?: string, title?: string };

  const items: TimelineItem[] = [];
  let currentX = 0;

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

  useEffect(() => {
    if (contentRef.current && containerRef.current) {
      const max = totalWidth - containerRef.current.clientWidth;
      const finalMax = max > 0 ? max : 0;
      setMaxScroll(finalMax);
      
      // Start at the end (most recent)
      setScrollPos(finalMax);
    }
  }, [artworks, totalWidth]);

  const animate = useCallback(() => {
    if (!containerRef.current) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    // Handle intro animation
    if (isIntro) {
      // Wait for maxScroll to be calculated
      if (maxScroll <= 0) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      setScrollPos(prev => {
        const remaining = maxScroll - prev;
        // Fly fast (cap at 600), then slow down as we approach the end
        const speed = Math.max(1, Math.min(600, remaining * 0.5));
        
        const next = prev + speed;
        if (remaining < 1) {
          setIsIntro(false);
          return maxScroll;
        }
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    if (!isHovering) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const containerWidth = containerRef.current.clientWidth;
    const centerX = containerWidth / 2;
    const deadZone = 100; // 100px dead zone in the middle
    
    let speed = 0;
    const dist = mouseX - centerX;
    
    if (Math.abs(dist) > deadZone) {
      const activeDist = Math.abs(dist) - deadZone;
      const maxDist = (containerWidth / 2) - deadZone;
      const intensity = Math.min(1, activeDist / maxDist);
      // Non-linear speed for better control (quadratic)
      speed = Math.sign(dist) * 20 * (intensity * intensity);
    }

    if (speed !== 0) {
      setScrollPos(prev => {
        const newPos = prev + speed;
        return Math.max(0, Math.min(newPos, maxScroll));
      });
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [mouseX, isHovering, maxScroll, isIntro]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMouseX(e.clientX);
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
  };

  const handleScrollRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScrollPos(prev => Math.min(prev + window.innerWidth * 0.8, maxScroll));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: cursorStyle }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
        ref={contentRef}
        className="absolute top-0 left-0 h-full"
        style={{ 
          transform: `translateX(-${scrollPos}px)`,
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
                className="absolute top-0 bottom-0" 
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
                className="absolute top-0 bottom-0"
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
