import { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/sanity/client'
import {
  ARTWORKS_COUNT_QUERY,
  ARTWORK_FILTER_OPTIONS_QUERY,
  ARTWORKS_FILTERED_QUERY_YEAR_ASC,
  ARTWORKS_FILTERED_QUERY_TITLE_ASC,
  ARTWORKS_FILTERED_QUERY_TITLE_DESC,
  ARTWORKS_FILTERED_QUERY_UPDATED,
  ARTWORKS_FILTERED_QUERY_YEAR_DESC,
} from '@/sanity/queries'
import { ArtworkCardEnhanced } from '@/components/artworks/ArtworkCardEnhanced'
import { ArtworksControlsRow } from '@/components/ArtworksControlsRow'

export const metadata: Metadata = {
  title: 'Browse Artworks | Bildstein | Glatz',
  description: 'Explore artworks by field of art, body of work, and year.',
}
const PER_PAGE = 18

type SearchParams = Promise<{
  page?: string
  search?: string
  sort?: 'year-asc' | 'title-asc' | 'title-desc' | 'updated' | 'year-desc'
  fieldOfArt?: string
  bodyOfWork?: string
  year?: string
  artist?: string
  layer?: 'fieldOfArt' | 'bodyOfWork' | 'year'
}>

function qs(base: Record<string, string | undefined>, mods: Record<string, string | null | undefined>) {
  const p = new URLSearchParams()
  const next: Record<string, string | undefined> = { ...base }
  for (const [k, v] of Object.entries(mods)) {
    if (v === null) delete next[k]
    else if (v !== undefined) next[k] = v
  }
  for (const [k, v] of Object.entries(next)) if (v) p.set(k, v)
  return p.toString()
}

export default async function ArtworksBrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const start = (page - 1) * PER_PAGE
  const end = start + PER_PAGE
  const layer = params.layer || 'fieldOfArt'
  let sort = params.sort || 'year-desc'

  let queryString = ''
  switch (sort) {
    case 'year-asc':
      queryString = ARTWORKS_FILTERED_QUERY_YEAR_ASC
      break
    case 'title-asc':
      queryString = ARTWORKS_FILTERED_QUERY_TITLE_ASC
      break
    case 'title-desc':
      queryString = ARTWORKS_FILTERED_QUERY_TITLE_DESC
      break
    case 'updated':
      queryString = ARTWORKS_FILTERED_QUERY_UPDATED
      break
    case 'year-desc':
    default:
      queryString = ARTWORKS_FILTERED_QUERY_YEAR_DESC
      break
  }

  const queryParams = {
    start,
    end,
    searchTerm: params.search ? `*${params.search}*` : null,
    fieldOfArt: params.fieldOfArt || null,
    bodyOfWork: params.bodyOfWork || null,
    year: params.year || null,
    artist: params.artist || null,
  }

  const [rawFilterOptions, artworks, totalCount] = await Promise.all([
    client.fetch<any>(ARTWORK_FILTER_OPTIONS_QUERY),
    client.fetch<any[]>(queryString, queryParams),
    client.fetch<number>(ARTWORKS_COUNT_QUERY, queryParams),
  ])

  const filterOptions = {
    fieldOfArt: Array.isArray(rawFilterOptions?.fieldOfArt) ? rawFilterOptions.fieldOfArt : [],
    bodyOfWork: Array.isArray(rawFilterOptions?.bodyOfWork) ? rawFilterOptions.bodyOfWork : [],
    years: Array.isArray(rawFilterOptions?.years) ? rawFilterOptions.years : [],
    techniques: Array.isArray(rawFilterOptions?.techniques) ? rawFilterOptions.techniques : [],
    artists: Array.isArray(rawFilterOptions?.artists) ? rawFilterOptions.artists : [],
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const baseParams: Record<string, string | undefined> = {
    page: String(page),
    search: params.search,
    sort: params.sort,
    fieldOfArt: params.fieldOfArt,
    bodyOfWork: params.bodyOfWork,
    year: params.year,
    artist: params.artist,
    layer,
  }

  const secondLevel =
    layer === 'fieldOfArt'
      ? (filterOptions.fieldOfArt as any[]).map((o) => ({
          key: o._id as string,
          label: o.title as string,
          count: o.artworkCount as number,
          isActive: params.fieldOfArt === o._id,
          href: `/artworks-browse?${qs(baseParams, {
            page: '1',
            fieldOfArt: params.fieldOfArt === o._id ? null : o._id,
          })}`,
        }))
      : layer === 'bodyOfWork'
      ? (filterOptions.bodyOfWork as any[]).map((o) => ({
          key: o._id as string,
          label: o.title as string,
          count: o.artworkCount as number,
          isActive: params.bodyOfWork === o._id,
          href: `/artworks-browse?${qs(baseParams, {
            page: '1',
            bodyOfWork: params.bodyOfWork === o._id ? null : o._id,
          })}`,
        }))
      : (filterOptions.years as number[]).map((y) => ({
          key: String(y),
          label: String(y),
          count: undefined as number | undefined,
          isActive: params.year === String(y),
          href: `/artworks-browse?${qs(baseParams, {
            page: '1',
            year: params.year === String(y) ? null : String(y),
          })}`,
        }))

  const sorts = [
    { key: 'year-desc', label: 'Newest' },
    { key: 'year-asc', label: 'Oldest' },
    { key: 'title-asc', label: 'Title A–Z' },
    { key: 'title-desc', label: 'Title Z–A' },
    { key: 'updated', label: 'Recently updated' },
  ] as const

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top: two-level nav */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          {(['fieldOfArt', 'bodyOfWork', 'year'] as const).map((tab) => (
            <Link
              key={tab}
              href={`/artworks-browse?${qs(baseParams, { layer: tab, page: '1' })}`}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                layer === tab
                  ? 'text-[#171717] dark:text-[#ededed]'
                  : 'text-[#171717] dark:text-[#ededed]'
              } bg-transparent`}
            >
              {tab === 'fieldOfArt' ? 'Field of Art' : tab === 'bodyOfWork' ? 'Body of Work' : 'Year'}
            </Link>
          ))}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {secondLevel.filter(opt => opt.count !== 0 && opt.count !== undefined).map((opt) => (
              <Link
                key={opt.key}
                href={opt.href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-colors ${
                  opt.isActive
                    ? 'text-[#171717] dark:text-[#ededed]'
                    : 'text-[#171717] dark:text-[#ededed]'
                } bg-transparent`}
                title={opt.label}
              >
                <span>{opt.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <ArtworksControlsRow
          params={params}
          layer={layer}
          baseParams={baseParams}
          sorts={sorts}
          sort={sort}
          start={start}
          end={end}
          totalCount={totalCount}
          filterOptions={filterOptions}
        />
      </div>
  {/* ...existing code... */}

  {/* Grid */}
      {artworks && artworks.filter((a) => a && a._id && a.title).length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-transparent text-[#171717] dark:text-[#ededed]">
            {artworks
            .filter((a) => a && a._id && a.title)
            .map((artwork: any, index: number) => (
              <ArtworkCardEnhanced key={artwork._id} artwork={artwork} index={index} />
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No artworks match your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
              <Link
                aria-disabled={page <= 1}
                href={`/artworks-browse?${qs(baseParams, { page: String(Math.max(1, page - 1)) })}`}
            className={`px-3 py-1.5 rounded-md text-sm ${
              page <= 1
                ? 'opacity-40 cursor-not-allowed text-gray-500'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300'
            }`}
          >
            Previous
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
              <Link
                aria-disabled={page >= totalPages}
                href={`/artworks-browse?${qs(baseParams, { page: String(Math.min(totalPages, page + 1)) })}`}
            className={`px-3 py-1.5 rounded-md text-sm ${
              page >= totalPages
                ? 'opacity-40 cursor-not-allowed text-gray-500'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300'
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  )
}
