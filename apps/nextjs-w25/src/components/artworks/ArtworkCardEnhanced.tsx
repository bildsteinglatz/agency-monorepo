'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/imageBuilder'
import { Artwork, ArtworkPreview } from '@/types/artwork'
import { motion } from 'framer-motion'
// Using simple SVG icons since Heroicons might not be installed
const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const HeartSolidIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
)

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
)

interface ArtworkCardEnhancedProps {
  artwork: Artwork | ArtworkPreview
  priority?: boolean
  size?: 'small' | 'medium' | 'large'
  showHover?: boolean
  index?: number
}

export function ArtworkCardEnhanced({ 
  artwork, 
  priority = false, 
  size = 'medium',
  showHover = true,
  index = 0
}: ArtworkCardEnhancedProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const slugValue = typeof artwork.slug === 'string' ? artwork.slug : artwork.slug?.current
  const artworkUrl = slugValue
    ? `/artworks/${slugValue}`
    : `/artworks/${artwork._id}`

  // Use higher resolution for sharper images
  // Safely extract the Sanity image asset only when mainImage is not a string
  const imageAsset = ((): any | undefined => {
    if (!artwork.mainImage) return undefined
    if (typeof artwork.mainImage === 'string') return undefined
    return (artwork.mainImage as { asset?: any }).asset
  })()

  const mainImageUrl = imageAsset
    ? urlFor(imageAsset).width(1200).height(1200).quality(90).url()
    : null

  const sizeClasses = {
    small: 'aspect-square',
    medium: 'aspect-[4/5]',
    large: 'aspect-[3/4]'
  }

  const cardSizes = {
    small: 'h-64',
    medium: 'h-80 md:h-96',
    large: 'h-96 md:h-[500px]'
  }

  // Extract dominant color and lqip from image metadata for loading placeholder when available
  let dominantColor = '#f3f4f6'
  let lqip: string | undefined = undefined
  // Helper to safely read optional metadata from the Sanity image asset shape
  const getImageMetadata = (asset: unknown) => {
    if (!asset) return null
    if (typeof asset === 'object' && asset !== null) {
      const a = asset as { metadata?: { palette?: { dominant?: { background?: string } }, lqip?: string } }
      return a.metadata ?? null
    }
    return null
  }

  const meta = getImageMetadata(imageAsset)
  if (meta) {
    dominantColor = meta?.palette?.dominant?.background || dominantColor
    lqip = meta?.lqip
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Safely obtain an artist name without relying on a property that may not exist on all union types
    const artistName = (artwork as any)?.artist?.name ?? (artwork as any)?.artistName ?? 'Unknown artist'
    const title = artwork.title || 'Untitled Artwork'
    const text = `${title} by ${artistName} (${artwork.year ?? 'n.d.'})`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.origin + artworkUrl
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + artworkUrl)
        // Could show a toast notification here
      } catch (error) {
        console.error('Failed to copy link:', error)
      }
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    // Here you would typically save to localStorage or send to an API
  }

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        mass: 1,
        delay: 0.9 + (index * 0.05)
      }}
      className={`group relative shadow-sm transition-all duration-300 ${
      showHover ? 'hover:shadow-xl hover:-translate-y-1' : ''
    }`}>
      {/* Image Container */}
      <Link href={artworkUrl} className="block relative">
        <div className="relative overflow-hidden flex items-center justify-center" style={{ height: '400px', width: '100%' }}>
          {mainImageUrl && !imageError ? (
            <>
              {/* LQIP or dominant color loading placeholder */}
              <div 
                className={`absolute inset-0 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                style={{ 
                  backgroundColor: dominantColor,
                  backgroundImage: lqip ? `url(${lqip})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              {/* Actual image */}
              <Image
                src={mainImageUrl}
                alt={artwork.title || 'Artwork image'}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                style={{ objectFit: 'contain' }}
                onError={() => setImageError(true)}
                onLoad={() => setImageLoaded(true)}
                priority={priority}
              />
            </>
          ) : (
            <div className="w-full h-full bg-white dark:bg-black flex items-center justify-center">
              <div className="text-black dark:text-white text-center">
                <div className="w-12 h-12 left-offset mb-2 opacity-50">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
      {/* Content */}
      <div className="p-4" style={{ height: '80px' }}>
        <Link href={artworkUrl} className="block">
          <h4 className={`font-semibold text-black dark:text-white line-clamp-1 transition-colors ${
            showHover ? 'group-hover:text-orange-600 dark:group-hover:text-orange-400' : ''
          }`}>
            {artwork.title || 'Untitled'}
          </h4>
        </Link>
        {/* Year and metadata */}
        <div className="flex items-center justify-between text-xs text-black dark:text-black mb-3">
          <span className="font-medium">{artwork.year}</span>
        </div>
      </div>
    </motion.div>
  
  );
}
