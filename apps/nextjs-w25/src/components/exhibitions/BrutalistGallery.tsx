'use client'

import Image from 'next/image'
import { urlFor } from '@/sanity/imageBuilder'
import { ImageAsset, GalleryImage } from '@/types/exhibition'

interface BrutalistGalleryProps {
  mainImage?: ImageAsset
  gallery?: GalleryImage[]
  title: string
}

export function BrutalistGallery({ mainImage, gallery, title }: BrutalistGalleryProps) {
  // Combine main image and gallery images into a single array
  const allImages = [
    ...(mainImage ? [{
      _key: 'main',
      asset: mainImage.asset,
      alt: mainImage.alt || title
    }] : []),
    ...(gallery || []).map(img => ({
      _key: img._key,
      asset: img.asset,
      alt: img.alt || title
    }))
  ]

  if (allImages.length === 0) return null

  return (
    <div className="flex flex-col gap-12 w-full">
      {allImages.map((image, index) => {
        const imageUrl = urlFor(image.asset)?.width(1600).quality(90).url()
        
        if (!imageUrl) return null

        return (
          <div key={image._key} className="w-full relative">
            <div className="relative w-full h-auto">
              <Image
                src={imageUrl}
                alt={image.alt || `Exhibition image ${index + 1}`}
                width={1600}
                height={1200}
                className="w-full h-auto object-contain border border-foreground"
                sizes="100vw"
                priority={index === 0}
              />
            </div>
            {/* Optional Caption */}
            {/* {image.caption && (
              <p className="mt-2 text-sm text-foreground/60 font-mono">{image.caption}</p>
            )} */}
          </div>
        )
      })}
    </div>
  )
}
