'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/imageBuilder'

export interface CarouselImage {
  _key: string
  asset?: any
  url?: string
  alt?: string
  caption?: string
}

interface ArtworkCarouselProps {
  images: CarouselImage[]
  title: string
}

export function ArtworkCarousel({ images, title }: ArtworkCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const available = Math.max(0, window.innerHeight - rect.top)
        setMaxHeight(available)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  if (!images || images.length === 0) {
    return null
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const currentImage = images[currentIndex]
  
  // Resolve image URL
  let imageUrl: string | undefined
  if (currentImage.url) {
    imageUrl = currentImage.url
  } else if (currentImage.asset) {
    imageUrl = urlFor(currentImage.asset)?.width(1600).quality(90).url()
  }

  return (
    <div ref={containerRef} className="relative w-full group" style={{ height: maxHeight ? `${maxHeight}px` : 'calc(100vh - 6rem)' }}>
      <div className="relative w-full h-full overflow-hidden">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={currentImage.alt || `${title} - Image ${currentIndex + 1}`}
            fill
            className="object-contain object-left-bottom"
            priority={currentIndex === 0}
            sizes="(max-width: 768px) 100vw, 66vw"
          />
        )}
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-0 bottom-0 w-1/2 z-10 focus:outline-none"
              style={{ cursor: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMTJINU0xMiAxOWwtNy03IDctNyIvPjwvc3ZnPg==') 16 16, w-resize` }}
              aria-label="Previous image"
            />
            
            <button
              onClick={handleNext}
              className="absolute right-0 top-0 bottom-0 w-1/2 z-10 focus:outline-none"
              style={{ cursor: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNSAxMmgxNE0xMiA1bDcgNy03IDciLz48L3N2Zz4=') 16 16, e-resize` }}
              aria-label="Next image"
            />
          </>
        )}
      </div>
    </div>
  )
}
