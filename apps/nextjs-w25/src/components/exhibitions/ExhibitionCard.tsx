'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ExhibitionPreview } from '@/types/exhibition'
import { urlFor } from '@/sanity/imageBuilder'
import { motion } from 'framer-motion'

interface ExhibitionCardProps {
  exhibition: ExhibitionPreview
  index?: number
}

// Format exhibition type badge
const getTypeBadge = (type: string) => {
  const badges = {
    solo: { text: 'Solo', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    group: { text: 'Group', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    public_space: { text: 'Public Space', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
    fair: { text: 'Art Fair', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    biennale: { text: 'Biennale', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    other: { text: 'Other', color: 'bg-white text-black dark:bg-white dark:text-black' }
  }
  return badges[type as keyof typeof badges] || badges.other
}

// Format venue string with fallback logic
const getVenueString = (venue: any) => {
  if (!venue) return null
  if (typeof venue === 'string') return venue

  let venueName = venue.name

  // If name is null or Unknown, try to extract from venue ID (fallback for legacy data)
  if ((!venueName || venueName === 'Unknown') && venue._id) {
    const venueId = venue._id
    if (venueId.startsWith('venue-')) {
      venueName = venueId
        .replace('venue-', '')
        .replace(/-/g, ' ')
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
  }

  const parts = []
  
  if (venueName && venueName !== 'Unknown') {
    parts.push(venueName)
  }
  
  if (venue.city && venue.city !== 'Unknown') {
    parts.push(venue.city)
  }
  
  if (venue.state && venue.state !== 'Unknown') {
    parts.push(venue.state)
  }

  if (venue.country && venue.country !== 'Unknown') {
    parts.push(venue.country)
  }

  return parts.join(', ')
}

export function ExhibitionCard({ exhibition, index = 0 }: ExhibitionCardProps) {
  // Handle exhibitions without slugs by using ID as fallback
  const exhibitionUrl = exhibition.slug ? `/exhibitions/${exhibition.slug}` : `/exhibitions/${exhibition._id}`
  
  // Higher resolution for better quality on retina displays
  const imageUrl = exhibition.mainImage?.asset 
    ? urlFor(exhibition.mainImage.asset)?.width(1200).quality(90).url()
    : null
  
  // Get LQIP blur placeholder from Sanity metadata
  const blurDataURL = exhibition.mainImage?.asset?.metadata?.lqip

  const badge = getTypeBadge(exhibition.exhibitionType)
  const venueString = getVenueString(exhibition.venue)

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
      href={exhibitionUrl}
      className="group block overflow-hidden transition-all duration-300"
    >
      {/* Image Section */}
      <div className="aspect-[4/3] relative overflow-hidden ring-1 ring-transparent group-hover:ring-foreground transition-all duration-300">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={exhibition.mainImage?.alt || exhibition.title}
            fill
            className="object-contain transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-foreground/20">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Exhibition Type Badge */}
        <div className="absolute top-0 left-0">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium bg-foreground text-background`}>
            {badge.text}
          </span>
        </div>
        
        {/* Year Badge */}
        <div className="absolute top-0 right-0">
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-foreground text-background">
            {exhibition.year}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="pt-3 px-[5px]">
        {/* Title */}
        <h3 className="text-lg font-medium text-foreground mb-0 line-clamp-2">
          {exhibition.title?.replace(/\s+,/g, ',')}
        </h3>

        {/* Venue */}
        {venueString && (
          <div className="flex items-center mb-1 text-foreground/60 text-sm">
            <span className="truncate">
              {venueString}
            </span>
          </div>
        )}

        {/* Serial Number */}
        {exhibition.serialNumber && (
          <div className="text-xs text-foreground/40 font-mono mt-1">
            {exhibition.serialNumber}
          </div>
        )}
      </div>
    </Link>
    </motion.div>
  )
}
