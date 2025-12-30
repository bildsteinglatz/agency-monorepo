'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Exhibition } from '@/types/exhibition'
import { urlFor } from '@/sanity/imageBuilder'

interface ExhibitionHeaderProps {
  exhibition: Exhibition
}

export function ExhibitionHeader({ exhibition }: ExhibitionHeaderProps) {
  const imageUrl = exhibition.mainImage?.asset 
    ? urlFor(exhibition.mainImage.asset)?.width(1920).height(800).quality(90).url()
    : null

  const getTypeBadge = (type: string) => {
    const badges = {
      solo: { text: 'Solo Exhibition', color: 'bg-blue-600' },
      group: { text: 'Group Exhibition', color: 'bg-green-600' },
      fair: { text: 'Art Fair', color: 'bg-purple-600' },
      biennale: { text: 'Biennale', color: 'bg-orange-600' },
      other: { text: 'Exhibition', color: 'bg-white' }
    }
    return badges[type as keyof typeof badges] || badges.other
  }

  const badge = getTypeBadge(exhibition.exhibitionType)

  return (
    <header className="relative">
      {/* Hero Image */}
      <div className="relative h-96 lg:h-[500px] overflow-hidden bg-white">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={exhibition.mainImage?.alt || exhibition.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-white">
            <svg className="w-24 h-24 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.448M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-12 w-full">
            <div className="max-w-4xl">
              {/* Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${badge.color}`}>
                  {badge.text}
                </span>
              </div>

              {/* Title and Year */}
              <h1 className="text-4xl lg:text-5xl title-text mb-4">
                {exhibition.title?.replace(/\s+,/g, ',')}
              </h1>
              
              <div className="text-2xl lg:text-3xl text-black mb-6">
                {exhibition.year}
              </div>

              {/* Venue and Artists */}
              <div className="space-y-2 text-lg text-black">
                {exhibition.venue && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {exhibition.venue.name}
                      {exhibition.venue.location && `, ${exhibition.venue.location}`}
                    </span>
                  </div>
                )}

                {exhibition.artist && exhibition.artist.length > 0 && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      {exhibition.artist.length === 1 ? (
                        <span>{exhibition.artist[0].name}</span>
                      ) : exhibition.artist.length <= 3 ? (
                        <span>{exhibition.artist.map(a => a.name).join(', ')}</span>
                      ) : (
                        <span>
                          {exhibition.artist.slice(0, 2).map(a => a.name).join(', ')} 
                          {' '}and {exhibition.artist.length - 2} other{exhibition.artist.length > 3 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-white border-b border-black dark:border-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center space-x-2 text-sm text-black dark:text-black">
            <Link href="/" className="hover:text-black dark:hover:text-black">
              Home
            </Link>
            <span>/</span>
            <Link href="/exhibitions" className="hover:text-black dark:hover:text-black">
              Exhibitions
            </Link>
            <span>/</span>
            <span className="text-black dark:text-black font-medium">
              {exhibition.title?.replace(/\s+,/g, ',')}
            </span>
          </nav>
        </div>
      </div>
    </header>
  )
}
