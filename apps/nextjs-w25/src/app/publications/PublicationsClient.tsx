'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Publication } from '@/types/publication'
import { urlFor } from '@/sanity/imageBuilder'
import { PortableText } from 'next-sanity'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false })

interface PublicationsClientProps {
  publications: Publication[]
}

export default function PublicationsClient({ publications }: PublicationsClientProps) {
  // Sort publications: move "Kunstankäufe" to the end
  const sortedPublications = [...publications].sort((a, b) => {
    const isA = a.title.toLowerCase().includes('kunstankäufe')
    const isB = b.title.toLowerCase().includes('kunstankäufe')
    if (isA && !isB) return 1
    if (!isA && isB) return -1
    return 0
  })

  const [selectedId, setSelectedId] = useState<string | null>(
    sortedPublications.length > 0 ? sortedPublications[0]._id : null
  )
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    setCurrentImageIndex(0)
    setNumPages(null)
  }, [selectedId])

  const handlePublicationClick = (id: string) => {
    setSelectedId(id)
    setIsFirstLoad(false)
  }

  const selectedPublication = sortedPublications.find(p => p._id === selectedId)

  // Use gallery if available, otherwise fallback to main image
  const displayImages = selectedPublication
    ? (selectedPublication.previewImages && selectedPublication.previewImages.length > 0)
      ? selectedPublication.previewImages.map((img: any) => ({
        _key: img._key,
        asset: img.asset,
        alt: img.alt
      }))
      : (selectedPublication.mainImage ? [{
        _key: 'main',
        asset: selectedPublication.mainImage.asset,
        alt: selectedPublication.mainImage.alt || selectedPublication.title
      }] : [])
    : []

  const hasPdf = !!selectedPublication?.pdfUrl
  const totalItems = hasPdf ? (numPages || 0) : displayImages.length

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (totalItems > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % totalItems)
    }
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (totalItems > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + totalItems) % totalItems)
    }
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  const getAuthorNames = (pub: any) => {
    if (pub.authorsExpanded?.length) return pub.authorsExpanded.map((a: any) => a.name).join(', ')
    if (pub.authorExpanded?.name) return pub.authorExpanded.name
    if (Array.isArray(pub.authors) && typeof pub.authors[0] === 'string') return pub.authors.join(', ')
    if (typeof pub.author === 'string') return pub.author

    // Handle bookFacts.authors (can be array or string)
    if (pub.bookFacts?.authors) {
      if (Array.isArray(pub.bookFacts.authors)) return pub.bookFacts.authors.join(', ')
      return pub.bookFacts.authors
    }

    if (pub.bookFacts?.author) return pub.bookFacts.author
    return null
  }

  const getEditorNames = (pub: any) => {
    if (pub.editorsExpanded?.length) return pub.editorsExpanded.map((e: any) => e.name).join(', ')
    if (pub.editorExpanded?.name) return pub.editorExpanded.name
    if (Array.isArray(pub.editors) && typeof pub.editors[0] === 'string') return pub.editors.join(', ')
    if (typeof pub.editor === 'string') return pub.editor
    if (pub.bookFacts?.editors) return pub.bookFacts.editors
    if (pub.bookFacts?.editor) return pub.bookFacts.editor
    return null
  }

  const authorNames = selectedPublication ? getAuthorNames(selectedPublication) : null
  const editorNames = selectedPublication ? getEditorNames(selectedPublication) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-180px)] min-h-[600px] pl-0 pr-0 mt-[80px]">
      {/* Left Column: List */}
      <div className="contents lg:flex lg:flex-col lg:col-span-3 lg:h-full lg:overflow-hidden lg:pr-4">
        <div className="order-2 lg:order-none h-[280px] lg:h-auto lg:flex-1 overflow-y-auto space-y-0 scrollbar-hide pt-[26px]">
          {sortedPublications.map((pub, index) => (
            <button
              key={pub._id}
              onClick={() => handlePublicationClick(pub._id)}
              className={`w-full text-left py-[11px] border-t border-b border-current -mt-[1px] transition-all duration-200 group relative -mx-4 px-4 lg:-mx-0 lg:pl-0 lg:pr-2 ${selectedId === pub._id
                  ? 'text-[#ff6600] border-[#ff6600] z-10'
                  : 'hover:text-[#ff6600] hover:border-[#ff6600] hover:z-10'
                }`}
            >
              <div className="flex gap-3 items-start pl-4">
                {/* Thumbnail */}
                <div className="relative w-12 h-16 flex-shrink-0 bg-white dark:bg-white">
                  {pub.mainImage && (
                    <Image
                      src={urlFor(pub.mainImage.asset).width(200).url()}
                      alt={pub.mainImage.alt || pub.title}
                      fill
                      className="object-cover object-top"
                      sizes="48px"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col font-owners uppercase text-xs leading-tight justify-center h-16">
                  <div className="font-black italic truncate">
                    {pub.title}
                  </div>
                  {pub.bookFacts?.publisher && (
                    <div className="opacity-60 truncate mt-0.5">
                      {pub.bookFacts.publisher}
                    </div>
                  )}
                  {pub.bookFacts?.publishedDate && (
                    <div className="opacity-60 truncate">
                      {new Date(pub.bookFacts.publishedDate).getFullYear()}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Middle Column: Gallery / Image */}
      <div className="lg:col-span-6 flex items-start justify-center relative h-[400px] lg:h-full order-3 lg:order-none mb-6 lg:mb-0 bg-foreground/5">
        <AnimatePresence mode="wait">
          {selectedPublication ? (
            <motion.div
              key={`img-${selectedPublication._id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full pt-0 px-4 pb-4"
            >
              <div className="relative w-full h-full flex justify-center items-start">
                {hasPdf ? (
                  <div className="relative w-full h-full flex justify-center items-start group">
                    <div className="relative w-full h-full flex justify-center items-start">
                      <PdfViewer
                        file={selectedPublication.pdfUrl!}
                        onLoadSuccess={onDocumentLoadSuccess}
                        pageNumber={currentImageIndex + 1}
                      />
                    </div>

                    {/* Navigation Arrows for PDF */}
                    {numPages && numPages > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-0 top-0 bottom-0 w-1/4 z-10 focus:outline-none"
                          style={{ cursor: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMTJINU0xMiAxOWwtNy03IDctNyIvPjwvc3ZnPg==') 16 16, w-resize` }}
                          aria-label="Previous page"
                        />
                        <button
                          onClick={nextImage}
                          className="absolute right-0 top-0 bottom-0 w-1/4 z-10 focus:outline-none"
                          style={{ cursor: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNSAxMmgxNE0xMiA1bDcgNy03IDciLz48L3N2Zz4=') 16 16, e-resize` }}
                          aria-label="Next page"
                        />
                      </>
                    )}
                  </div>
                ) : (
                  displayImages.length > 0 && displayImages[currentImageIndex] && (
                    <div className="relative w-full h-full group">
                      <Image
                        key={displayImages[currentImageIndex]._key}
                        src={urlFor(displayImages[currentImageIndex].asset).width(1200).quality(90).url()}
                        alt={displayImages[currentImageIndex].alt || selectedPublication.title}
                        fill
                        className="object-contain object-top"
                        priority
                      />

                      {/* Navigation Arrows for Images */}
                      {displayImages.length > 1 && (
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
                  )
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-foreground/20 font-owners uppercase">
              Select a publication
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: All Data (Details) */}
      <div className="lg:col-span-3 flex flex-col h-full overflow-y-auto px-4 lg:pl-4 lg:pr-0 order-4 lg:order-none">
        <AnimatePresence mode="wait">
          {selectedPublication && (
            <motion.div
              key={`info-${selectedPublication._id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pb-4 pt-0 lg:pr-6"
            >
              {/* Header Info - Minimal Brutalist */}
              <div className="flex flex-col font-owners uppercase text-xs leading-tight">
                <div className="font-black italic mb-0.5">
                  {selectedPublication.title}
                </div>
                <div className="border-t border-foreground/10 -mx-4 lg:-ml-0 lg:-mr-6 my-2" />
                {selectedPublication.subtitle && (
                  <div className="opacity-60 mb-2">
                    {selectedPublication.subtitle}
                  </div>
                )}

                {/* Authors */}
                {authorNames && (
                  <div className="opacity-60">
                    {authorNames}
                  </div>
                )}

                {/* Publisher & Year */}
                {(selectedPublication.bookFacts as any)?.publisher && (
                  <div className="opacity-60">
                    {(selectedPublication.bookFacts as any).publisher}
                    {(selectedPublication.bookFacts as any)?.publishedDate && `, ${new Date((selectedPublication.bookFacts as any).publishedDate).getFullYear()}`}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="normal-case font-sans text-sm leading-relaxed opacity-90 whitespace-pre-wrap">
                {(selectedPublication as any).shortDescription && (
                  <div className="mb-4 font-medium">
                    {(selectedPublication as any).shortDescription}
                  </div>
                )}

                {selectedPublication.description && (
                  <div>
                    {typeof selectedPublication.description === 'string' ? (
                      selectedPublication.description
                    ) : (
                      <PortableText value={selectedPublication.description} />
                    )}
                  </div>
                )}
              </div>

              {/* Additional Facts - Minimal */}
              <div className="font-owners uppercase text-xs leading-tight space-y-2 pt-4 border-t border-foreground/10 -mx-4 lg:-ml-0 lg:-mr-6">
                {/* Design */}
                {(selectedPublication.bookFacts as any)?.design && (
                  <div>
                    <span className="opacity-40 mr-2">Design</span>
                    {(selectedPublication.bookFacts as any).design}
                  </div>
                )}

                {/* Pages */}
                {(selectedPublication.bookFacts as any)?.pages && (
                  <div>
                    <span className="opacity-40 mr-2">Seiten</span>
                    {(selectedPublication.bookFacts as any).pages}
                  </div>
                )}

                {/* Dimensions */}
                {(selectedPublication.bookFacts as any)?.dimensions && (
                  <div>
                    <span className="opacity-40 mr-2">Dimension</span>
                    {(selectedPublication.bookFacts as any).dimensions}
                  </div>
                )}

                {/* Edition */}
                {(selectedPublication.bookFacts as any)?.edition && (
                  <div>
                    <span className="opacity-40 mr-2">Edition</span>
                    {(selectedPublication.bookFacts as any).edition}
                  </div>
                )}

                {/* ISBN */}
                {(selectedPublication.bookFacts as any)?.isbn && (
                  <div>
                    <span className="opacity-40 mr-2">ISBN</span>
                    {(selectedPublication.bookFacts as any).isbn}
                  </div>
                )}

                {/* Price */}
                {((selectedPublication.bookFacts as any)?.price || (selectedPublication as any).price) && (
                  <div>
                    <span className="opacity-40 mr-2">Price</span>
                    {(() => {
                      const price = (selectedPublication.bookFacts as any)?.price || (selectedPublication as any).price
                      const numPrice = Number(price)
                      if (!isNaN(numPrice)) {
                        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(numPrice)
                      }
                      return price
                    })()}
                  </div>
                )}

                {/* Purchase Link */}
                {(selectedPublication.bookFacts as any)?.purchaseLink && (
                  <div className="pt-2">
                    <a
                      href={(selectedPublication.bookFacts as any).purchaseLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold italic border-b border-foreground hover:text-neon-orange hover:border-neon-orange transition-colors pb-0.5"
                    >
                      Purchase ↗
                    </a>
                  </div>
                )}

                {/* PDF Download */}
                {selectedPublication.pdfUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedPublication.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold italic border-b border-foreground hover:text-neon-orange hover:border-neon-orange transition-colors pb-0.5"
                    >
                      Download PDF ↗
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
