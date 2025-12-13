'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { Artist } from '@/types/exhibition'
import { urlFor } from '@/sanity/imageBuilder'

interface ArtistSectionProps {
  artists: Artist[]
}

// Custom components for PortableText bio rendering
const bioComponents = {
  block: {
    normal: ({children}: any) => <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{children}</p>,
  },
  marks: {
    strong: ({children}: any) => <strong className="font-medium">{children}</strong>,
    em: ({children}: any) => <em className="italic">{children}</em>,
  },
}

export function ArtistSection({ artists }: ArtistSectionProps) {
  if (!artists || artists.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p>No artist information available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {artists.map((artist) => {
        const imageUrl = artist.mainImage?.asset 
          ? urlFor(artist.mainImage.asset)?.width(200).height(200).quality(85).url()
          : null

  const artistUrl = artist.slug ? `/artists/${artist.slug}` : `/artists/${artist._id}`

        return (
          <div key={artist._id} className="flex flex-col sm:flex-row gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {/* Artist Image */}
            <div className="flex-shrink-0">
              {imageUrl ? (
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto sm:mx-0 rounded-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={artist.mainImage?.alt || artist.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto sm:mx-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Artist Information */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              {/* Artist Name */}
              <h3 className="text-xl font-semibold title-text mb-2">
                {artist.slug ? (
                  <Link 
                    href={artistUrl}
                    className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {artist.name}
                  </Link>
                ) : (
                  artist.name
                )}
              </h3>

              {/* Artist Bio */}
              {artist.bio && artist.bio.length > 0 ? (
                <div className="prose prose-sm prose-gray dark:prose-invert max-w-none mb-4">
                  <PortableText value={artist.bio} components={bioComponents} />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 italic">
                  No biography available
                </p>
              )}

              {/* Artist Website */}
              {artist.website && (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Artist Website
                  </a>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
