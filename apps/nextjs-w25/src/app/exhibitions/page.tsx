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

  try {
    // Get filter options
    const [years, types] = await Promise.all([
      client.fetch<number[]>(EXHIBITION_YEARS_QUERY),
      client.fetch<string[]>(EXHIBITION_TYPES_QUERY)
    ])

    // Build query based on filters
    let exhibitionsQuery = FILTERED_EXHIBITIONS_QUERY
    let queryParams: any = {}

    // We remove $start $end from the query for the "all on one page" experience
    // However, the FILTERED_EXHIBITIONS_QUERY currently uses them.
    // I will pass large values or modify the query in memory if needed.
    // Let's check FILTERED_EXHIBITIONS_QUERY again.
    // It's `*[_type == "exhibition" && showInSelectedExhibitions == true && (!defined($type) || exhibitionType == $type) && (!defined($year) || year == $year)] | order(year desc) [$start...$end]`

    queryParams.start = 0
    queryParams.end = 500 // Large enough for all exhibitions

    // Apply filters
    if (params.search) {
      exhibitionsQuery = SEARCH_EXHIBITIONS_QUERY
      queryParams.searchTerm = `*${params.search}*`
    } else if (params.type || params.year) {
      queryParams.type = params.type || null
      queryParams.year = params.year ? parseInt(params.year, 10) : null
    } else {
      // Use manual order if no filters are applied
      exhibitionsQuery = EXHIBITION_ORDER_QUERY
      queryParams.type = null
      queryParams.year = null
    }

    // Fetch exhibitions
    let exhibitions: ExhibitionPreview[] = []
    if (params.search) {
      exhibitions = await client.fetch<ExhibitionPreview[]>(exhibitionsQuery, queryParams)
    } else {
      exhibitions = await client.fetch<ExhibitionPreview[]>(exhibitionsQuery, queryParams)
    }

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
                />
              ) : (
                <div className="text-center py-32 border border-foreground/10 px-4">
                  <h3 className="text-xl font-bold uppercase mb-2">No exhibitions found</h3>
                  <p className="font-mono text-sm opacity-60">Try adjusting your filters</p>
                </div>
              )}
            </div>
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

