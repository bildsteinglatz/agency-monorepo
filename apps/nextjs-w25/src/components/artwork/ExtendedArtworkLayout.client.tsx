"use client";
import React from "react";
import Link from 'next/link';
import { Artwork } from '@/types/artwork';
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import PdfDownloadButton from '@/components/PdfDownloadButton';
import { ArtworkCarousel, CarouselImage } from '@/components/artwork/ArtworkCarousel';

export default function ExtendedArtworkLayout({ artwork, prevHref, nextHref }: { artwork: Artwork; prevHref?: string; nextHref?: string }) {
  
  // Helper to get URL
  const getAssetUrl = (asset: SanityImageSource | { url?: string; asset?: any } | string | undefined): string | undefined => {
    if (!asset) return undefined
    if (typeof asset === 'string') return asset
    if (typeof asset === 'object') {
      if ('url' in asset && typeof asset.url === 'string') return asset.url
      const nested = (asset as any).asset
      if (nested) {
        if (typeof nested === 'string') return nested
        if (typeof nested === 'object' && 'url' in nested && typeof nested.url === 'string') return nested.url
      }
    }
    return undefined
  }

  // Prepare carousel images
  const carouselImages: CarouselImage[] = [];

  // 1. Main Image
  const mainImageUrl = getAssetUrl(artwork.mainImage);
  if (mainImageUrl) {
    // Check if main image is already in gallery to avoid duplicates
    // This is a simple check based on URL string matching
    const isInGallery = artwork.gallery?.some(img => {
       const imgUrl = getAssetUrl(img.asset);
       return imgUrl === mainImageUrl;
    });

    if (!isInGallery) {
       carouselImages.push({
         _key: 'main-image',
         url: mainImageUrl,
         asset: typeof artwork.mainImage === 'object' && 'asset' in artwork.mainImage ? (artwork.mainImage as any).asset : undefined,
         alt: artwork.title
       });
    }
  }

  // 2. Gallery Images
  if (artwork.gallery && Array.isArray(artwork.gallery)) {
    artwork.gallery.forEach(img => {
      carouselImages.push({
        _key: img._key || Math.random().toString(),
        asset: img.asset,
        alt: img.alt,
        caption: img.caption
      });
    });
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full flex-grow pt-0 md:pt-32">
       {/* Mobile Navigation */}
       <div className="flex md:hidden justify-center items-center gap-2 text-sm font-normal text-[var(--filterbar-link-color)] px-6 pt-20 pb-0 order-1 w-full">
          <Link href={prevHref || '#'} className={`px-0 py-0 hover:opacity-60 transition-opacity ${!prevHref ? 'opacity-30 cursor-not-allowed' : ''}`}>← prev</Link>
          <span className="text-gray-400">|</span>
          <Link href="/new-work" className="px-0 py-0 hover:opacity-60 transition-opacity">back</Link>
          <span className="text-gray-400">|</span>
          <Link href={nextHref || '#'} className={`px-0 py-0 hover:opacity-60 transition-opacity ${!nextHref ? 'opacity-30 cursor-not-allowed' : ''}`}>next →</Link>
       </div>

       {/* Left Column: Carousel */}
       <div className="flex-1 md:w-2/3 relative order-2 md:order-1 md:pt-4">
          <ArtworkCarousel images={carouselImages} title={artwork.title || ''} />
       </div>

       {/* Right Column: Info */}
       <aside className="w-full md:w-1/3 md:items-start md:pl-4 md:mt-7 md:pr-0 order-3 md:order-2 px-6 md:px-0 pt-0 md:pt-0">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 text-sm font-normal text-[var(--filterbar-link-color)] mb-1 md:pr-6">
             <Link href={prevHref || '#'} className={`px-0 py-0 hover:opacity-60 transition-opacity ${!prevHref ? 'opacity-30 cursor-not-allowed' : ''}`}>← prev</Link>
             <span className="text-gray-400">|</span>
             <Link href="/new-work" className="px-0 py-0 hover:opacity-60 transition-opacity">back</Link>
             <span className="text-gray-400">|</span>
             <Link href={nextHref || '#'} className={`px-0 py-0 hover:opacity-60 transition-opacity ${!nextHref ? 'opacity-30 cursor-not-allowed' : ''}`}>next →</Link>
          </div>

          {/* Info */}
          <div className="text-sm font-normal text-[var(--filterbar-link-color)] w-full border-t pt-3 md:pr-6" style={{ borderTopColor: 'var(--foreground)' }}>
             <div className="mb-6">
                <span>{artwork.title}{artwork.year ? ", " : ""}{artwork.year}</span>
                {artwork.size && <div>{artwork.size}</div>}
                {artwork.technique && <div>{artwork.technique}</div>}
                {artwork.edition && <div>{artwork.edition}</div>}
             </div>
             
             <PdfDownloadButton 
                imageUrl={mainImageUrl || ''}
                title={artwork.title || 'Untitled'}
                artist="Bildstein | Glatz"
                year={artwork.year?.toString() || ''}
                technique={artwork.technique || ''}
                size={artwork.size || ''}
                edition={artwork.edition || ''}
             />

             {/* Notes/Content */}
             {artwork.notes && (
                <div className="mt-6 prose max-w-none">
                   <p>{artwork.notes}</p>
                </div>
             )}
             {artwork.content && Array.isArray(artwork.content) && (
                <div className="mt-6 prose max-w-none">
                   {(artwork.content as any[]).map((block, idx) => {
                      if (block._type === 'block' || block._Type === 'block') {
                         return <p key={idx}>{(block.children || []).map((c: any) => c.text).join('')}</p>
                      }
                      return null;
                   })}
                </div>
             )}
          </div>
       </aside>
    </div>
  );
}
