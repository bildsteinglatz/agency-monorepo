'use client'

import Link from 'next/link'
import { PortableText } from 'next-sanity'
import { Artwork, Category, Exhibition } from '@/types/artwork'

interface ArtworkMetadataProps {
  artwork: Artwork
}

// Format price with currency
const formatPrice = (price?: number, currency = 'EUR') => {
  if (!price) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format availability status
const formatAvailability = (availability?: string) => {
  switch (availability) {
    case 'available':
      return { text: 'Available', color: 'text-green-600 dark:text-green-400' }
    case 'sold':
      return { text: 'Sold', color: 'text-red-600 dark:text-red-400' }
    case 'on-hold':
      return { text: 'On Hold', color: 'text-yellow-600 dark:text-yellow-400' }
    case 'not-for-sale':
      return { text: 'Not for Sale', color: 'text-black dark:text-black' }
    default:
      return { text: 'Status Unknown', color: 'text-black dark:text-black' }
  }
}

// Category display component
function CategoryDisplay({ category, label }: { category?: Category, label: string }) {
  if (!category) return null
  
  return (
    <div>
      <span className="font-medium">{label}:</span>{' '}
      {category.slug?.current ? (
        <Link 
          href={`/category/${category.slug.current}`}
          className="text-orange-500 hover:underline"
        >
          {category.title}
        </Link>
      ) : (
        <span>{category.title}</span>
      )}
    </div>
  )
}

// Exhibition history component
function ExhibitionHistory({ exhibitions }: { exhibitions?: Exhibition[] }) {
  if (!exhibitions || exhibitions.length === 0) return null
  
  // Filter out unresolved references
  const resolvedExhibitions = exhibitions.filter(
    (ex): ex is Exhibition => ex && typeof ex === 'object' && !('_ref' in ex) && !!ex._id
  )
  
  if (resolvedExhibitions.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Exhibition History</h3>
      <ul className="space-y-2">
        {resolvedExhibitions.map((exhibition) => (
          <li key={exhibition._id} className="border-l-2 border-orange-500 pl-4">
            <div className="font-medium">{exhibition.title}</div>
            {exhibition.venue && (
              <div className="text-black dark:text-black">{exhibition.venue}</div>
            )}
            {(exhibition.city || exhibition.country) && (
              <div className="text-sm text-black">
                {[exhibition.city, exhibition.country].filter(Boolean).join(', ')}
              </div>
            )}
            {(exhibition.startDate || exhibition.endDate) && (
              <div className="text-sm text-black">
                {exhibition.startDate && formatDate(exhibition.startDate)}
                {exhibition.startDate && exhibition.endDate && ' - '}
                {exhibition.endDate && formatDate(exhibition.endDate)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ArtworkMetadata({ artwork }: ArtworkMetadataProps) {
  // cast to any to avoid TypeScript error if 'availability' is not defined on Artwork
  const availability = formatAvailability((artwork as any).availability)
  const formattedPrice = formatPrice(
    typeof (artwork as any).price === 'string' ? Number((artwork as any).price) : (artwork as any).price,
    'EUR'
  )
  
  // Safe access helpers for potentially unresolved references
  const artist = (artwork as any).artist
  const artistResolved = artist && typeof artist === 'object' && !('_ref' in artist) ? artist : null
  
  const fieldOfArt = (artwork as any).fieldOfArt
  const fieldOfArtResolved = fieldOfArt && typeof fieldOfArt === 'object' && !('_ref' in fieldOfArt) ? fieldOfArt : null
  
  const bodyOfWork = (artwork as any).bodyOfWork
  const bodyOfWorkResolved = bodyOfWork && typeof bodyOfWork === 'object' && !('_ref' in bodyOfWork) ? bodyOfWork : null

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <section>
        <h1 className="text-3xl title-text mb-4">{artwork.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-3">
            {artistResolved && (
              <div>
                <span className="font-medium">Artist:</span>{' '}
                {artistResolved.slug?.current ? (
                  <Link 
                    href={`/artist/${artistResolved.slug.current}`}
                    className="text-orange-500 hover:underline"
                  >
                    {artistResolved.name}
                  </Link>
                ) : (
                  <span>{artistResolved.name}</span>
                )}
              </div>
            )}
            
            {artwork.year && (
              <div>
                <span className="font-medium">Year:</span> {artwork.year}
              </div>
            )}
            
            {(artwork as any).serialNumber && (
              <div>
                <span className="font-medium">Serial Number:</span> {(artwork as any).serialNumber}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {artwork.size && (
              <div>
                <span className="font-medium">Size:</span> {artwork.size}
              </div>
            )}
            
            {artwork.technique && (
              <div>
                <span className="font-medium">Technique:</span> {artwork.technique}
              </div>
            )}
            
            {(artwork as any).edition && (
              <div>
                <span className="font-medium">Edition:</span> {(artwork as any).edition}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
  {(fieldOfArtResolved || bodyOfWorkResolved || (artwork as any).extraCategories) && (
        <section>
          <h3 className="font-semibold text-lg mb-3">Categories</h3>
          <div className="space-y-2">
            <CategoryDisplay category={fieldOfArtResolved} label="Field of Art" />
            <CategoryDisplay category={bodyOfWorkResolved} label="Body of Work" />
            
            {(artwork as any).extraCategories && (artwork as any).extraCategories.length > 0 && (
              <div>
                <span className="font-medium">Additional Categories:</span>{' '}
                {(artwork as any).extraCategories
                  .filter((category: any) => category && typeof category === 'object' && !('_ref' in category))
                  .map((category: any, index: number, arr: any[]) => (
                  <span key={category._id || index}>
                    {category.slug?.current ? (
                      <Link 
                        href={`/category/${category.slug.current}`}
                        className="text-orange-500 hover:underline"
                      >
                        {category.title}
                      </Link>
                    ) : (
                      <span>{category.title}</span>
                    )}
                    {index < arr.length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      {/* Commercial Information */}
      {(formattedPrice || availability) && (
        <section>
          <h3 className="font-semibold text-lg mb-3">Availability & Pricing</h3>
          <div className="space-y-2">
            {formattedPrice && (
              <div>
                <span className="font-medium">Price:</span> {formattedPrice}
              </div>
            )}
            
            {availability && (
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className={availability.color}>{availability.text}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Content/Description */}
      {artwork.content && artwork.content.length > 0 && (
        <section>
          <h3 className="font-semibold text-lg mb-3">Description</h3>
          <div className="prose dark:prose-invert max-w-none">
            <PortableText 
              value={artwork.content} 
              components={{
                types: {
                  // Handle unknown block types gracefully
                  vimeoVideo: () => null,
                  image: () => null,
                },
                // Handle unresolved references
                marks: {
                  link: ({ children, value }) => {
                    const href = value?.href || '#'
                    return <a href={href} className="text-orange-500 hover:underline">{children}</a>
                  },
                },
              }}
            />
          </div>
        </section>
      )}

      {/* Exhibition History */}
  <ExhibitionHistory exhibitions={(artwork as any).exhibitionHistory} />

      {/* Administrative Notes */}
      {artwork.notes && (
        <section>
          <h3 className="font-semibold text-lg mb-3">Notes</h3>
          <div className="bg-white dark:bg-white p-4 rounded-lg">
            <p className="text-sm text-black dark:text-black">{artwork.notes}</p>
          </div>
        </section>
      )}

      {/* Technical Information */}
      <section className="border-t pt-6">
        <h3 className="font-semibold text-lg mb-3">Technical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black dark:text-black">
          <div>
            <div><span className="font-medium">Created:</span> {formatDate((artwork as any)._createdAt)}</div>
            <div><span className="font-medium">Last Updated:</span> {formatDate((artwork as any)._updatedAt)}</div>
          </div>
          <div>
            <div><span className="font-medium">Artwork ID:</span> {artwork._id}</div>
            <div><span className="font-medium">Website Display:</span> {(artwork as any).showOnWebsite ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </section>
    </div>
  )
}
