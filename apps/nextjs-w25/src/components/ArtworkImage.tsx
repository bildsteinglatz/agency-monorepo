'use client'

import { useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/imageBuilder'
import { Gallery, Artwork } from '@/types/artwork'

interface ArtworkImageProps {
  artwork: Artwork
}

export function ArtworkImage({ artwork }: ArtworkImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Combine main image with gallery images
  const allImages = []
  
  // Add main image first
  if (artwork.mainImage && typeof artwork.mainImage !== 'string' && artwork.mainImage.asset) {
    const mainImg: any = artwork.mainImage
    allImages.push({
      _key: 'main',
      _type: 'image',
      asset: mainImg.asset,
      alt: mainImg.alt || artwork.title,
      caption: mainImg.caption
    })
  }
  
  // Add gallery images
  if (artwork.gallery) {
    allImages.push(...artwork.gallery)
  }

  if (allImages.length === 0) {
    return (
      <div className="aspect-[4/3] bg-white dark:bg-white rounded-lg flex items-center justify-center">
        <div className="text-center text-black dark:text-black">
          <svg className="left-offset h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No image available</p>
        </div>
      </div>
    )
  }

  const currentImage = allImages[currentImageIndex]
  const imageUrl = urlFor(currentImage.asset)?.width(1200).height(900).quality(90).url()
  const thumbnailUrl = urlFor(currentImage.asset)?.width(150).height(150).quality(80).url()

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-white dark:bg-white rounded-lg overflow-hidden">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={currentImage.alt || artwork.title}
            fill
            className={`object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            priority={currentImageIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Image Caption */}
      {currentImage.caption && (
        <p className="text-sm text-black dark:text-black italic">
          {currentImage.caption}
        </p>
      )}

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => {
            const thumbUrl = urlFor(image.asset)?.width(80).height(80).quality(70).url()
            return (
              <button
                key={image._key}
                onClick={() => {
                  setCurrentImageIndex(index)
                  setIsLoading(true)
                }}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  index === currentImageIndex 
                    ? 'border-orange-500 shadow-md' 
                    : 'border-black dark:border-black hover:border-black'
                }`}
              >
                {thumbUrl && (
                  <Image
                    src={thumbUrl}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
