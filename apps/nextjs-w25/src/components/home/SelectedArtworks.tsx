'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArtworkPreview } from '@/types/artwork'
import { urlFor } from '@/sanity/imageBuilder'

interface SelectedArtworksProps {
  artworks: ArtworkPreview[]
}

export function SelectedArtworks({ artworks }: SelectedArtworksProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [mouseX, setMouseX] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorStyle, setCursorStyle] = useState<string>('auto')
  const requestRef = useRef<number | null>(null)

  // Repeat artworks to create an "endless" feel
  const REPEAT_COUNT = 20
  const repeatedArtworks = Array(REPEAT_COUNT).fill(artworks).flat().map((artwork, index) => ({
    ...artwork,
    uniqueKey: `${artwork._id}-${index}`
  }))

  // Scroll to middle on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current
      scrollContainerRef.current.scrollLeft = (scrollWidth - clientWidth) / 2
    }
  }, [artworks])

  const animate = useCallback(() => {
    if (!scrollContainerRef.current) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    if (!isHovering) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const container = scrollContainerRef.current;
    const containerWidth = document.documentElement.clientWidth; // Use viewport width for mouse calculations
    const centerX = containerWidth / 2;
    const deadZone = 100; // 100px dead zone in the middle

    let speed = 0;
    const dist = mouseX - centerX;

    if (Math.abs(dist) > deadZone) {
      const activeDist = Math.abs(dist) - deadZone;
      const maxDist = (containerWidth / 2) - deadZone;
      const intensity = Math.min(1, activeDist / maxDist);
      // Non-linear speed for better control
      speed = Math.sign(dist) * 15 * (intensity * intensity);
    }

    if (speed !== 0) {
      container.scrollLeft += speed;

      // Infinite scroll logic: jump if too close to edges
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const threshold = clientWidth; // buffer

      if (scrollLeft < threshold) {
        container.scrollLeft = scrollWidth / 2 - clientWidth / 2; // Jump to middle
      } else if (scrollLeft > scrollWidth - clientWidth - threshold) {
        container.scrollLeft = scrollWidth / 2 - clientWidth / 2; // Jump to middle
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [mouseX, isHovering]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMouseX(e.clientX);
    setIsHovering(true);

    const width = document.documentElement.clientWidth;
    const centerX = width / 2;

    // SVG Cursor (White Arrows)
    if (e.clientX < centerX) {
      setCursorStyle(`url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>') 16 16, w-resize`);
    } else {
      setCursorStyle(`url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>') 16 16, e-resize`);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  if (!artworks || artworks.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full h-screen bg-background text-foreground flex flex-col justify-center items-center overflow-hidden relative"
      id="selected-artworks"
      style={{ cursor: cursorStyle }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center w-full px-0 overflow-x-hidden" // Hidden overflow to hide scrollbar
        style={{ columnGap: '60px' }} // Explicit gap
      >
        <div className="flex gap-16 px-8 items-center">
          {repeatedArtworks.map((artwork) => (
            <Link
              key={artwork.uniqueKey}
              href={`/new-work/${artwork.slug || artwork._id}`}
              className="flex-none group/card relative block"
            >
              <div className="relative h-[60vh] w-auto">
                {artwork.mainImage ? (
                  /* Use img tag for natural aspect ratio with fixed height */
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={urlFor(artwork.mainImage).height(800).url()}
                    alt={artwork.title || 'Artwork'}
                    className="h-full w-auto object-contain transition-transform duration-500"
                    draggable={false}
                  />
                ) : (
                  <div className="h-full w-[400px] bg-gray-200 flex items-center justify-center">
                    No Image
                  </div>
                )}
              </div>
              <div className="mt-4 px-1">
                <h3 className="text-sm font-medium uppercase truncate max-w-[300px]">{artwork.title}</h3>
                <p className="text-xs text-gray-500">{artwork.year}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
