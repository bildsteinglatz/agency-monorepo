// This file is a cleaned top-level implementation of the artworks browse filter bar.
import { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/sanity/client'
import {
	ARTWORKS_COUNT_QUERY,
	ARTWORK_FILTER_OPTIONS_QUERY,
	ARTWORKS_FILTERED_QUERY_YEAR_DESC,
} from '@/sanity/queries'
import { ArtworkCardEnhanced } from '@/components/artworks/ArtworkCardEnhanced'

export const metadata: Metadata = {
	title: 'Browse Artworks (Filter Bar) | Bildstein | Glatz',
	description: 'Explore artworks by field of art, body of work, and year.',
}
const PER_PAGE = 18

type SearchParams = Promise<{
	page?: string
	fieldOfArt?: string
	bodyOfWork?: string
	year?: string
	layer?: 'fieldOfArt' | 'bodyOfWork' | 'year'
	searchTerm?: string
	artist?: string
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

export default async function ArtworksBrowseFilterBarPage({ searchParams }: { searchParams: SearchParams }) {
	const params = await searchParams
	const page = Math.max(1, parseInt(params.page || '1', 10))
	const start = (page - 1) * PER_PAGE
	const end = start + PER_PAGE
	const layer = params.layer || 'fieldOfArt'

	const searchTerm = params.searchTerm ?? null
	const fieldOfArt = params.fieldOfArt ?? null
	const bodyOfWork = params.bodyOfWork ?? null
	const year = params.year ?? null
	const artist = params.artist ?? null

	const groqParams = { searchTerm, fieldOfArt, bodyOfWork, year, artist }

	const [rawFilterOptions, artworks, totalCount] = await Promise.all([
		client.fetch<any>(ARTWORK_FILTER_OPTIONS_QUERY),
		client.fetch<any[]>(ARTWORKS_FILTERED_QUERY_YEAR_DESC, {
			...groqParams,
			start,
			end,
		}),
		client.fetch<number>(ARTWORKS_COUNT_QUERY, groqParams),
	])

	const filterOptions = {
		fieldOfArt: Array.isArray(rawFilterOptions?.fieldOfArt) ? rawFilterOptions.fieldOfArt : [],
		bodyOfWork: Array.isArray(rawFilterOptions?.bodyOfWork) ? rawFilterOptions.bodyOfWork : [],
		years: Array.isArray(rawFilterOptions?.years) ? rawFilterOptions.years : [],
	}

	const baseParams: Record<string, string | undefined> = {
		page: String(page),
		fieldOfArt: params.fieldOfArt,
		bodyOfWork: params.bodyOfWork,
		year: params.year,
		layer,
	}

	const secondLevel =
		layer === 'fieldOfArt'
			? filterOptions.fieldOfArt
					.filter((o: any) => o.count !== 0)
					.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
					.map((o: any) => ({
						key: o._id,
						label: o.title,
						isActive: params.fieldOfArt === o._id,
						href: `/artworks-browse-filterbar?${qs(baseParams, {
							page: '1',
							fieldOfArt: params.fieldOfArt === o._id ? null : o._id,
						})}`,
					}))
			: layer === 'bodyOfWork'
			? filterOptions.bodyOfWork
					.filter((o: any) => o.count !== 0)
					.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
					.map((o: any) => ({
						key: o._id,
						label: o.title,
						isActive: params.bodyOfWork === o._id,
						href: `/artworks-browse-filterbar?${qs(baseParams, {
							page: '1',
							bodyOfWork: params.bodyOfWork === o._id ? null : o._id,
						})}`,
					}))
			: filterOptions.years
					.filter((y: any) => (typeof y === 'object' ? y.count !== 0 : true))
					.sort((a: any, b: any) => {
						const aOrder = typeof a === 'object' ? a.sortOrder ?? 0 : a
						const bOrder = typeof b === 'object' ? b.sortOrder ?? 0 : b
						return aOrder - bOrder
					})
					.map((y: any) => ({
						key: typeof y === 'object' ? String(y.year) : String(y),
						label: typeof y === 'object' ? String(y.year) : String(y),
						isActive: params.year === (typeof y === 'object' ? String(y.year) : String(y)),
						href: `/artworks-browse-filterbar?${qs(baseParams, {
							page: '1',
							year: params.year === (typeof y === 'object' ? String(y.year) : String(y)) ? null : (typeof y === 'object' ? String(y.year) : String(y)),
						})}`,
					}))

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Filter Bar */}
			<div className="mb-6">
				<div className="flex flex-col gap-0">
					<div className="flex items-center gap-0 flex-wrap">
						{(['fieldOfArt', 'bodyOfWork', 'year'] as const).map((tab) => (
							<Link
								key={tab}
								href={`/artworks-browse-filterbar?${qs(baseParams, { layer: tab, page: '1' })}`}
								className={`filterbar-link px-3 py-1.5 transition-colors text-[#171717] dark:text-[#ededed] bg-transparent flex items-center gap-1 border-none focus-visible:border-none outline-none`}
							>
								<span aria-hidden className="arrow">➟</span>
								{tab === 'fieldOfArt' ? 'Field of Art' : tab === 'bodyOfWork' ? 'Body of Work' : 'Year'}
							</Link>
						))}
					</div>
					<div className="flex gap-2 overflow-x-auto pb-0">
						{secondLevel.map((opt: any) => (
							<Link
								key={opt.key}
								href={opt.href}
								className={`filterbar-link whitespace-nowrap px-3 py-1.5 transition-colors text-[#171717] dark:text-[#ededed] bg-transparent flex items-center gap-1 border-none focus-visible:border-none outline-none`}
								title={opt.label}
							>
								<span aria-hidden className="arrow">➟</span>
								<span>{opt.label}</span>
							</Link>
						))}
					</div>
				</div>
			</div>
			{/* Grid */}
			{Array.isArray(artworks) && artworks.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-transparent text-[#171717] dark:text-[#ededed]">
					{artworks.map((artwork: any) => (
						<ArtworkCardEnhanced key={artwork._id} artwork={artwork} />
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<p className="text-black dark:text-black">No artworks match your criteria.</p>
				</div>
			)}
		</div>
	)
}
