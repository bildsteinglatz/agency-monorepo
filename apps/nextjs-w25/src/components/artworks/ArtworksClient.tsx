'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArtworkPreview } from '@/types/artwork'
import { urlFor } from '@/sanity/imageBuilder'
import { PortableText } from '@portabletext/react'

interface CategoryDetails {
  _id: string;
  title: string;
  description?: any;
  parent?: { title: string; slug: string };
  children?: { _id: string; title: string; slug: string; artworkCount: number }[];
}

interface ArtworksClientProps {
  artworks: ArtworkPreview[]
  resultsCount?: number
  totalCount?: number
  filterOptions?: {
    fieldOfArt: any[]
    bodyOfWork: any[]
    years: number[]
  }
  categoryDetails?: CategoryDetails | null;
}

export function ArtworksClient({ artworks, resultsCount, totalCount, filterOptions, categoryDetails }: ArtworksClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid')
  

  // Set initial selection when artworks change
  useEffect(() => {
    if (artworks.length > 0) {
      setSelectedId(artworks[0]._id)
    }
  }, [artworks])

  // Reset image index when selection changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedId])

  // Scroll selected item into view when switching to detail mode
  useEffect(() => {
    if (viewMode === 'detail' && selectedId) {
      setTimeout(() => {
        const element = document.getElementById(`artwork-list-item-${selectedId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
    }
  }, [viewMode, selectedId])

  const selectedArtwork = artworks.find(a => a._id === selectedId) || artworks[0]

  if (!selectedArtwork) return null

  // Prepare display images (Gallery + Main Image fallback)
  const displayImages = (selectedArtwork.gallery && selectedArtwork.gallery.length > 0
    ? selectedArtwork.gallery
    : (selectedArtwork.mainImage && selectedArtwork.mainImage.asset ? [selectedArtwork.mainImage] : []))
    .filter((img: any) => img && img.asset)

  const totalImages = displayImages.length
  const currentImage = displayImages[currentImageIndex]

  const nextImage = () => {
    if (totalImages > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages)
    }
  }

  const prevImage = () => {
    if (totalImages > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)
    }
  }

  return (
    <>
      {/* Filters are rendered by NewWorkFiltersClient above the artworks list */}

      {categoryDetails && (
        <div className="mb-8 px-2">
          {categoryDetails.description && (
            <div className="prose max-w-none mb-4">
              <PortableText value={categoryDetails.description} />
            </div>
          )}
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-0 pb-20 animate-in fade-in duration-500">
          {artworks.map((artwork) => (
            <motion.div 
              key={artwork._id}
              layoutId={`artwork-container-${artwork._id}`}
              onClick={() => {
                setSelectedId(artwork._id)
                setViewMode('detail')
              }}
              className="group cursor-pointer relative bg-transparent overflow-hidden"
            >
              {/* Text Info at Top */}
              <div className="w-full pb-2 bg-background z-10">
                <div className="font-owners uppercase text-xs leading-tight">
                  <span className="font-black italic">{artwork.title}</span>
                  {artwork.year && <span className="font-normal ml-1">{artwork.year}</span>}
                </div>
              </div>

              {/* Image */}
              <div className="relative w-full">
                {artwork.mainImage && artwork.mainImage.asset && (
                  <motion.div 
                    layoutId={`artwork-image-${artwork._id}`}
                    className="w-full"
                  >
                    <Image
                      src={urlFor(artwork.mainImage).width(800).url()}
                      alt={artwork.title || 'Artwork'}
                      width={800}
                      height={artwork.mainImage.asset.metadata?.dimensions ? Math.round(800 / (artwork.mainImage.asset.metadata.dimensions.width / artwork.mainImage.asset.metadata.dimensions.height)) : 600}
                      className="w-full h-auto object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-180px)] min-h-[600px] pl-0 pr-4">
          {/* Left Column: List */}
          <div className="contents lg:flex lg:flex-col lg:col-span-3 lg:h-full lg:overflow-hidden lg:pr-4">
            <div className="order-2 lg:order-none h-[280px] lg:h-auto lg:flex-1 overflow-y-auto space-y-0 scrollbar-hide">
              {artworks.map((artwork) => (
                <button
                  key={artwork._id}
                  id={`artwork-list-item-${artwork._id}`}
                  onClick={() => setSelectedId(artwork._id)}
                  aria-current={selectedId === artwork._id}
                  className={`w-full text-left py-[11px] pl-0 pr-2 border-t border-b border-current -mt-[1px] transition-all duration-200 group relative ${
                    selectedId === artwork._id ? 'text-[#ff6600] border-[#ff6600] z-10' : 'hover:text-[#ff6600] hover:border-[#ff6600] hover:z-10'
                  }`}
                  tabIndex={0}
                >
                  <div className="flex gap-3 items-start pl-4">
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 flex-shrink-0 bg-foreground/5">
                      {artwork.mainImage && artwork.mainImage.asset && (
                        <motion.div 
                          layoutId={`artwork-image-${artwork._id}`}
                          className="w-full h-full"
                        >
                          <Image
                            src={urlFor(artwork.mainImage).width(200).height(200).url()}
                            alt={artwork.title || 'Artwork'}
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col font-owners uppercase text-xs leading-tight justify-center h-12">
                      <div className="font-black italic truncate">
                        {artwork.title}
                      </div>
                      <div className="opacity-60 mt-0.5 truncate">
                        {artwork.year}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Middle Column: Gallery / Image */}
          <div className="lg:col-span-9 flex items-start justify-center relative h-[400px] lg:h-full order-3 lg:order-none mb-6 lg:mb-0 bg-foreground/5">
            <AnimatePresence mode="wait">
              {currentImage ? (
                <div className="relative w-full h-full group">
                  <motion.div
                    key={`${selectedArtwork._id}-${currentImageIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full p-4"
                  >
                    <Image
                      src={urlFor(currentImage).width(1600).fit('max').url()}
                      alt={currentImage.alt || selectedArtwork.title}
                      fill
                      className="object-contain object-top"
                      priority
                    />
                  </motion.div>

                  {/* Navigation Arrows */}
                  {totalImages > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-0 top-0 bottom-0 w-1/2 z-10 focus:outline-none"
                        style={{ cursor: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMTJINU0xMiAxOWwtNy03IDctNyIvPjwvc3ZnPg==') 16 16, w-resize` }}
                        aria-label="Previous image"
                      />
                      <button 
                        onClick={nextImage}
                        className="absolute right-0 top-0 bottom-0 w-1/2 z-10 focus:outline-none"
                        style={{ cursor: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNSAxMmgxNE0xMiA1bDcgNy03IDciLz48L3N2Zz4=') 16 16, e-resize` }}
                        aria-label="Next image"
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-foreground/20 font-owners uppercase">
                  No Images Available
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column removed to disable sidebar/details view */}
        </div>
      )}
    </>
  )
}
