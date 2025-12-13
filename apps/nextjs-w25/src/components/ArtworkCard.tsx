'use client'

import Link from 'next/link'
import Image from 'next/image'
import { memo } from 'react'
import { ArtworkPreview } from '@/types/artwork'
import { urlFor } from '@/sanity/imageBuilder'
import { motion } from 'framer-motion'
import { useCollection } from '@/context/CollectionContext'
import { Heart } from 'lucide-react'

interface ArtworkCardProps {
  artwork: ArtworkPreview
  index?: number
}

// Format price
const formatPrice = (price?: number, currency = 'EUR') => {
  if (!price) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price)
}

// Format availability
const getAvailabilityColor = (availability?: string) => {
  switch (availability) {
    case 'available':
      return 'text-green-600'
    case 'sold':
      return 'text-red-600'
    case 'on-hold':
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
}

export const ArtworkCard = memo(function ArtworkCard({ artwork, index = 0 }: ArtworkCardProps) {
  const { isCollected, addToCollection, removeFromCollection } = useCollection()
  const collected = isCollected(artwork._id)

  const handleCollect = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()
    if (collected) {
      removeFromCollection(artwork._id)
    } else {
      addToCollection(artwork._id)
    }
  }

  // Handle artworks without slugs by using ID as fallback
  // slug may be a string or an object { current: string }
  const slugValue = typeof artwork.slug === 'string' ? artwork.slug : (artwork.slug as { current?: string })?.current
  const artworkUrl = slugValue ? `/artworks/${slugValue}` : `/artworks/${artwork._id}`
  const imageUrl = artwork.mainImage?.asset 
    ? urlFor(artwork.mainImage.asset)?.width(400).height(300).quality(80).url()
    : null

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
    >
        <Link 
      href={artworkUrl}
      className="group block overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
        <button
          onClick={handleCollect}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black transition-colors z-10"
          aria-label={collected ? "Remove from collection" : "Add to collection"}
        >
          <Heart 
            className={`w-5 h-5 ${collected ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} 
          />
        </button>
          {imageUrl ? (
          <Image
            src={imageUrl}
            alt={(artwork as { mainImage?: { alt?: string } }).mainImage?.alt || artwork.title || 'Artwork image'}
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* All info as plain text under the image */}
      <div className="p-4">
        <pre className="whitespace-pre-wrap text-xs text-gray-800 dark:text-gray-200">
{JSON.stringify(artwork, null, 2)}
        </pre>
      </div>
    </Link>
    </motion.div>
  )
})
