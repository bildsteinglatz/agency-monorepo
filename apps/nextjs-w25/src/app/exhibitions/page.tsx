import { Metadata } from 'next'
import { client } from '@/sanity/client'
import { 
  EXHIBITIONS_QUERY, 
  EXHIBITIONS_COUNT_QUERY, 
  EXHIBITION_YEARS_QUERY, 
  EXHIBITION_TYPES_QUERY,
  SEARCH_EXHIBITIONS_QUERY,
  FILTERED_EXHIBITIONS_QUERY,
  FILTERED_EXHIBITIONS_COUNT_QUERY,
  EXHIBITION_ORDER_QUERY,
  EXHIBITION_ORDER_COUNT_QUERY
} from '@/sanity/queries'
import { ExhibitionPreview, ExhibitionPageProps } from '@/types/exhibition'
import { ExhibitionsClient } from '@/components/exhibitions/ExhibitionsClient'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Exhibitions | Bildstein | Glatz',
  description: 'Comprehensive exhibition history featuring solo shows, group exhibitions, art fairs, and biennales by Bildstein | Glatz.',
  openGraph: {
    type: 'website',
    title: 'Exhibitions | Bildstein | Glatz',
    description: 'Explore our complete exhibition history including venues, artists, and detailed information.',
  },
}

// Increased to 100 to make the list view feel like a proper archive browser
const EXHIBITIONS_PER_PAGE = 100

export default async function ExhibitionsPage({ searchParams }: ExhibitionPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const start = (page - 1) * EXHIBITIONS_PER_PAGE
  const end = start + EXHIBITIONS_PER_PAGE

  try {
    // Get filter options
    const [years, types] = await Promise.all([
      client.fetch<number[]>(EXHIBITION_YEARS_QUERY),
      client.fetch<string[]>(EXHIBITION_TYPES_QUERY)
    ])

    // Build query based on filters
    let exhibitionsQuery = FILTERED_EXHIBITIONS_QUERY
    let countQuery = FILTERED_EXHIBITIONS_COUNT_QUERY
    let queryParams: any = { start, end }
    let useManualOrder = false

    // Apply filters
    if (params.search) {
      exhibitionsQuery = SEARCH_EXHIBITIONS_QUERY
      queryParams.searchTerm = `*${params.search}*`
    } else if (params.type || params.year) {
      queryParams.type = params.type || null
      queryParams.year = params.year ? parseInt(params.year, 10) : null
    } else {
      // No filters - check if we should use manual order
      try {
        const manualCount = await client.fetch<number>(EXHIBITION_ORDER_COUNT_QUERY)
        if (manualCount > 0) {
          useManualOrder = true
          exhibitionsQuery = EXHIBITION_ORDER_QUERY
          countQuery = EXHIBITION_ORDER_COUNT_QUERY
        }
      } catch (e) {
        console.warn('Failed to check manual order:', e)
      }
      
      // If manual order check failed or count is 0, we fall back to default (already set)
      if (!useManualOrder) {
        queryParams.type = null
        queryParams.year = null
      }
    }

    // Fetch exhibitions and count
    let exhibitions: ExhibitionPreview[] = []
    let totalCount = 0

    if (params.search) {
      exhibitions = await client.fetch<ExhibitionPreview[]>(exhibitionsQuery, queryParams)
      totalCount = exhibitions.length
    } else {
      [exhibitions, totalCount] = await Promise.all([
        client.fetch<ExhibitionPreview[]>(exhibitionsQuery, queryParams),
        client.fetch<number>(countQuery, queryParams)
      ])
    }

    const totalPages = Math.ceil(totalCount / EXHIBITIONS_PER_PAGE)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return (
      <ErrorBoundary>
        <div className="min-h-screen transition-colors w-full">
          <div className="w-full">
            
            <div className="">
              {exhibitions.length > 0 ? (
                <ExhibitionsClient 
                  exhibitions={exhibitions} 
                  years={years}
                  types={types}
                  resultsCount={exhibitions.length}
                  totalCount={totalCount}
                />
              ) : (
                <div className="text-center py-32 border border-foreground/10 px-4">
                  <h3 className="text-xl font-bold uppercase mb-2">No exhibitions found</h3>
                  <p className="font-mono text-sm opacity-60">Try adjusting your filters</p>
                </div>
              )}
            </div>

            {/* Pagination - Only show if we have more than 100 items */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-8 font-mono text-sm uppercase">
                {hasPrevPage ? (
                  <a
                    href={`/exhibitions?page=${page - 1}${params.type ? `&type=${params.type}` : ''}${params.year ? `&year=${params.year}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                    className="hover:text-neon-orange transition-colors"
                  >
                    ← Previous
                  </a>
                ) : (
                  <span className="opacity-20">← Previous</span>
                )}
                
                <span>Page {page} / {totalPages}</span>
                
                {hasNextPage ? (
                  <a
                    href={`/exhibitions?page=${page + 1}${params.type ? `&type=${params.type}` : ''}${params.year ? `&year=${params.year}` : ''}${params.search ? `&search=${params.search}` : ''}`}
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
    console.error('Failed to fetch exhibitions:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Unable to load exhibitions</h1>
        </div>
      </div>
    )
  }
}
