'use client'

import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { Venue } from '@/types/exhibition'

interface VenueSectionProps {
  venue: Venue
}

// Custom components for PortableText venue description
const descriptionComponents = {
  block: {
    normal: ({children}: any) => <p className="text-black dark:text-black text-sm leading-relaxed mb-2">{children}</p>,
  },
  marks: {
    strong: ({children}: any) => <strong className="font-medium">{children}</strong>,
    em: ({children}: any) => <em className="italic">{children}</em>,
    link: ({children, value}: any) => (
      <a 
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline"
      >
        {children}
      </a>
    ),
  },
}

export function VenueSection({ venue }: VenueSectionProps) {
  const venueUrl = venue.slug ? `/venues/${venue.slug}` : `/venues/${venue._id}`

  return (
    <div className="bg-white dark:bg-white rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold title-text">Venue</h3>
        <svg className="w-5 h-5 text-black flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 00-2-2H8a2 2 0 00-2 2v9m8 0V9a2 2 0 012-2h2a2 2 0 012 2v9.94" />
        </svg>
      </div>

      <div className="space-y-3">
        {/* Venue Name */}
        <div>
          <h4 className="font-medium mb-1">
            {venue.slug ? (
              <Link 
                href={venueUrl}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {venue.name}
              </Link>
            ) : (
              venue.name
            )}
          </h4>
          
          {/* Location */}
          {venue.location && (
            <p className="text-sm text-black dark:text-black">
              {venue.location}
            </p>
          )}
        </div>

        {/* Address */}
        {venue.address && (
          <div>
            <dt className="text-xs font-medium text-black dark:text-black uppercase tracking-wide mb-1">
              Address
            </dt>
            <dd className="text-sm text-black dark:text-black">
              {venue.address}
            </dd>
          </div>
        )}

        {/* Website */}
        {venue.website && (
          <div>
            <dt className="text-xs font-medium text-black dark:text-black uppercase tracking-wide mb-1">
              Website
            </dt>
            <dd>
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 break-all"
              >
                {venue.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <svg className="inline w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </dd>
          </div>
        )}

        {/* Description */}
        {venue.description && venue.description.length > 0 && (
          <div>
            <dt className="text-xs font-medium text-black dark:text-black uppercase tracking-wide mb-1">
              About
            </dt>
            <dd className="prose prose-sm prose dark:prose-invert max-w-none">
              <PortableText value={venue.description} components={descriptionComponents} />
            </dd>
          </div>
        )}

        {/* Map Link */}
        {venue.address && (
          <div className="pt-2 border-t border-black dark:border-black">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${venue.name} ${venue.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-black hover:text-black dark:text-black dark:hover:text-black"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View on Maps
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
