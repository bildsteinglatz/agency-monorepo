import { Metadata } from 'next'
import { client } from '@/sanity/client'
import { ARTWORKS_FILTERED_QUERY_YEAR_DESC, ARTWORK_STATS_QUERY } from '@/sanity/queries'
import { ArtworkPreview } from '@/types/artwork'
import { ArtworksClient } from '@/components/artworks/ArtworksClient'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Artworks | Bildstein/Glatz',
  description: 'Explore the complete collection of artworks by Bildstein/Glatz.',
}

// Increased to 100 to make the list view feel like a proper archive browser
const ARTWORKS_PER_PAGE = 100

interface ArtworksPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function ArtworksPage({ searchParams }: ArtworksPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const start = (page - 1) * ARTWORKS_PER_PAGE
  const end = start + ARTWORKS_PER_PAGE

  try {
    // Fetch artworks and total count
    const [artworks, stats] = await Promise.all([
      client.fetch<ArtworkPreview[]>(ARTWORKS_FILTERED_QUERY_YEAR_DESC, { start, end }),
      client.fetch<{ totalArtworks: number }>(ARTWORK_STATS_QUERY),
    ])

    const totalCount = stats.totalArtworks
    const totalPages = Math.ceil(totalCount / ARTWORKS_PER_PAGE)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return (
      <ErrorBoundary>
        <div className="min-h-screen transition-colors w-full">
          <div className="w-full">
            {artworks.length > 0 ? (
              <ArtworksClient 
                artworks={artworks} 
                resultsCount={artworks.length}
                totalCount={totalCount}
              />
            ) : (
              <div className="text-center py-32 border border-foreground/10 px-4">
                <h3 className="text-xl font-bold uppercase mb-2">No artworks found</h3>
                <p className="font-mono text-sm opacity-60">There are currently no published artworks to display.</p>
              </div>
            )}

            {/* Pagination - Only show if we have more than 100 items */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-8 font-mono text-sm uppercase pb-10">
                {hasPrevPage ? (
                  <a
                    href={`/artworks?page=${page - 1}`}
                    className="hover:text-neon-orange transition-colors"
                  >
                    ← Previous
                  </a>
                ) : (
                  <span className="opacity-20">← Previous</span>
                )}
                <span className="opacity-60">
                  Page {page} of {totalPages}
                </span>
                {hasNextPage ? (
                  <a
                    href={`/artworks?page=${page + 1}`}
                    className="hover:text-neon-orange transition-colors"
                  >
                    Next →
                  </a>
                ) : (
                  <span className="opacity-20">Next →</span>
                )}
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Failed to fetch artworks:', error)
    return (
      <div className="min-h-screen transition-colors">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Unable to load artworks</h1>
            <p className="text-black dark:text-black">
              There was an error connecting to the content management system. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
