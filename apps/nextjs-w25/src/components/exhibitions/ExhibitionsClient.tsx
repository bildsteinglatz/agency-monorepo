'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ExhibitionPreview } from '@/types/exhibition'
import { urlFor } from '@/sanity/imageBuilder'
import { PortableText } from '@portabletext/react'
import { useGodNav } from '../GodNavContext'

interface ExhibitionsClientProps {
  exhibitions: ExhibitionPreview[]
  years: number[]
  types: string[]
  resultsCount?: number
  totalCount?: number
}

export function ExhibitionsClient({ exhibitions, years, types, resultsCount, totalCount }: ExhibitionsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showGodNav } = useGodNav()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid')

  const currentType = searchParams.get('type') || ''
  const currentYear = searchParams.get('year') || ''

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'solo': return 'Solo Exhibitions'
      case 'group': return 'Group Exhibitions'
      case 'public_space': return 'Work in Public Space'
      case 'fair': return 'Art Fairs'
      case 'biennale': return 'Biennales'
      default: return type.charAt(0).toUpperCase() + type.slice(1) + 's'
    }
  }

  const getShortTypeLabel = (type: string) => {
    switch (type) {
      case 'solo': return 'Solo'
      case 'group': return 'Group'
      case 'public_space': return 'Public Space'
      case 'fair': return 'Fair'
      case 'biennale': return 'Biennale'
      default: return type
    }
  }

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to first page when filtering
    params.delete('page')
    
    const query = params.toString()
    router.push(query ? `/exhibitions?${query}` : '/exhibitions')
  }

  const clearFilters = () => {
    router.push('/exhibitions')
  }

  const hasActiveFilters = currentType || currentYear

  // Set initial selection when exhibitions change
  useEffect(() => {
    if (exhibitions.length > 0) {
      setSelectedId(exhibitions[0]._id)
    }
  }, [exhibitions])

  // Reset image index when selection changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedId])

  // Scroll selected item into view when switching to detail mode
  useEffect(() => {
    if (viewMode === 'detail' && selectedId) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(`exhibition-list-item-${selectedId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
    }
  }, [viewMode, selectedId])

  const selectedExhibition = exhibitions.find(e => e._id === selectedId) || exhibitions[0]

  if (!selectedExhibition) return null

  // Prepare display images (Gallery + Main Image fallback)
  const displayImages = (selectedExhibition.gallery && selectedExhibition.gallery.length > 0
    ? selectedExhibition.gallery
    : (selectedExhibition.mainImage && selectedExhibition.mainImage.asset ? [selectedExhibition.mainImage] : []))
    .filter((img: any) => img && img.asset)

  const totalImages = displayImages.length
  
  // Safety check for image index
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
      {/* Filters - Styled as Second Nav */}
      <div className="w-full secondary-navigation mb-[80px]">
        <nav className="second-nav pt-[6px] pb-0.5">
                    <div className="flex gap-x-3 gap-y-1 justify-start items-start nav-text flex-wrap" style={{ marginLeft: '8px' }}>
            {/* Type Filter */}
            <div className="relative inline-block group">
              <div className="flex items-center gap-0.5 font-owners font-bold italic uppercase hover:text-neon-orange transition-colors pointer-events-none">
                <span>{currentType ? getTypeLabel(currentType) : 'All Types'}</span>
                <svg className="w-3 h-3 fill-current mt-[1px]" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
              <select
                value={currentType}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
              >
                <option value="" className="bg-background text-foreground">All Types</option>
                {types.filter(t => t).map((type) => (
                  <option key={type} value={type} className="bg-background text-foreground">
                    {getTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="relative inline-block group">
              <div className="flex items-center gap-0.5 font-owners font-bold italic uppercase hover:text-neon-orange transition-colors pointer-events-none">
                <span>{currentYear || 'All Years'}</span>
                <svg className="w-3 h-3 fill-current mt-[1px]" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
              <select
                value={currentYear}
                onChange={(e) => updateFilter('year', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
              >
                <option value="" className="bg-background text-foreground">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()} className="bg-background text-foreground">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Locations Link (God Mode) */}
            {showGodNav && (
              <Link 
                href="/locations"
                className="font-owners font-bold italic uppercase hover:text-neon-orange transition-colors"
              >
                Locations
              </Link>
            )}

            {/* View Toggle */}
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'detail' : 'grid')}
              className="font-owners font-bold italic uppercase hover:text-neon-orange transition-colors flex items-center"
              aria-label={viewMode === 'grid' ? "Switch to List" : "Switch to Grid"}
            >
              {viewMode === 'grid' ? (
                <svg className="w-[16px] h-[16px] fill-current mt-[1px]" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                </svg>
              ) : (
                <svg className="w-[16px] h-[16px] fill-current mt-[1px]" viewBox="0 0 24 24">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
              )}
            </button>

            {/* Clear */}
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="font-owners font-bold italic uppercase hover:text-neon-orange transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </nav>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 px-0 pb-20 animate-in fade-in duration-500">
          {exhibitions.map((ex) => (
            <motion.div 
              key={ex._id}
              layoutId={`exhibition-container-${ex._id}`}
              onClick={() => {
                setSelectedId(ex._id)
                setViewMode('detail')
              }}
              className="group cursor-pointer relative bg-foreground/5 overflow-hidden"
            >
              {/* Text Info at Top */}
              <div className="w-full p-4 pb-2 bg-background z-10">
                <div className="flex flex-col font-owners uppercase text-xs leading-tight">
                  <div className="flex gap-1.5">
                    <span>{ex.year}</span>
                    <span className="font-black italic">{ex.title}</span>
                  </div>
                  <div className="flex justify-between opacity-60 mt-0.5">
                    <span className="truncate pr-2">
                      {ex.venue && [ex.venue.name, ex.venue.city, ex.venue.state].filter(Boolean).join(', ')}
                    </span>
                    <span className="whitespace-nowrap">
                      {getShortTypeLabel(ex.exhibitionType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-[4/3] w-full">
                {ex.mainImage && ex.mainImage.asset && (
                  <motion.div 
                    layoutId={`exhibition-image-${ex._id}`}
                    className="w-full h-full"
                  >
                    <Image
                      src={urlFor(ex.mainImage).width(800).height(600).url()}
                      alt={ex.title}
                      fill
                      className="object-contain px-4 pb-4 pt-0"
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
            {exhibitions.map((ex, index) => (
              <button
                key={ex._id}
                id={`exhibition-list-item-${ex._id}`}
                onClick={() => setSelectedId(ex._id)}
                aria-current={selectedId === ex._id}
                className={`w-full text-left py-[11px] pl-0 pr-2 border-t border-b border-current -mt-[1px] transition-all duration-200 group relative ${
                  selectedId === ex._id ? 'text-[#ff6600] border-[#ff6600] z-10' : 'hover:text-[#ff6600] hover:border-[#ff6600] hover:z-10'
                }`}
                tabIndex={0}
              >
                <div className="flex gap-3 items-start pl-4">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-12 flex-shrink-0 bg-foreground/5">
                    {ex.mainImage && ex.mainImage.asset && (
                      <motion.div 
                        layoutId={`exhibition-image-${ex._id}`}
                        className="w-full h-full"
                      >
                        <Image
                          src={urlFor(ex.mainImage).width(200).height(150).url()}
                          alt={ex.title}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col font-owners uppercase text-xs leading-tight justify-center h-12">
                    <div className="flex gap-1.5">
                      <span>{ex.year}</span>
                      <span className="font-black italic truncate">
                        {ex.title}
                      </span>
                    </div>
                    {ex.venue && (
                      <div className="opacity-60 mt-0.5 truncate">
                        {[ex.venue.name, ex.venue.city, ex.venue.state].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      {/* Middle Column: Gallery / Image */}
      <div className="lg:col-span-6 flex items-center justify-center relative h-[400px] lg:h-full order-3 lg:order-none mb-6 lg:mb-0 bg-foreground/5">
        <AnimatePresence mode="wait">
          {currentImage ? (
            <div className="relative w-full h-full group">
              <motion.div
                key={`${selectedExhibition._id}-${currentImageIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full p-4"
              >
                <Image
                  src={urlFor(currentImage).width(1600).fit('max').url()}
                  alt={currentImage.caption || selectedExhibition.title}
                  fill
                  className="object-contain"
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

      {/* Right Column: All Data (Details) */}
      <div className="lg:col-span-3 flex flex-col h-full overflow-y-auto pl-0 lg:pl-4 pr-2 order-4 lg:order-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedExhibition._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 py-4"
          >
            {/* Header Info - Minimal Brutalist */}
            <div className="flex flex-col font-owners uppercase text-xs leading-tight">
              <div className="font-black italic mb-0.5">
                {selectedExhibition.title}
              </div>
              
              {selectedExhibition.venue && (
                <div className="opacity-60">
                  {[selectedExhibition.venue.name, selectedExhibition.venue.city, selectedExhibition.venue.state].filter(Boolean).join(', ')}
                </div>
              )}
              
              <div className="opacity-60">
                {selectedExhibition.year}
              </div>
            </div>

            {/* Description / Text */}
            {selectedExhibition.text && (
              <div className="normal-case font-sans text-sm leading-relaxed opacity-90 whitespace-pre-wrap">
                {typeof selectedExhibition.text === 'string' ? selectedExhibition.text : <PortableText value={selectedExhibition.text} />}
              </div>
            )}

            {/* Links */}
            {selectedExhibition.weblink && (
              <div className="pt-2">
                <a 
                  href={selectedExhibition.weblink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-owners uppercase text-xs font-bold italic border-b border-foreground hover:text-neon-orange hover:border-neon-orange transition-colors pb-0.5"
                >
                  Visit Website ↗
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
      )}
    </>
  )
}