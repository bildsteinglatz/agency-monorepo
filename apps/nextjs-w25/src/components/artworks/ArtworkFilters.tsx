'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
// Using simple SVG icons since Heroicons might not be installed
const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const FunnelIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
)

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

interface FilterOption {
  _id: string
  title: string
  name?: string  // For artists
  description?: string
  slug?: string
  artworkCount: number
}

interface ArtworkStats {
  totalArtworks: number
  totalArtists: number
  yearRange: { earliest: number; latest: number }
  topCategories: Array<{
    _id: string
    title: string
    count: number
  }>
  availabilityStats: {
    available: number
    sold: number
    reserved: number
  }
}

interface ArtworkFiltersProps {
  fieldOfArt: FilterOption[]
  bodyOfWork: FilterOption[]
  years: number[]
  techniques: string[]
  artists: FilterOption[]
  stats: ArtworkStats
}

export function ArtworkFilters({ 
  fieldOfArt, 
  bodyOfWork, 
  years, 
  techniques, 
  artists, 
  stats 
}: ArtworkFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const currentFilters = {
    fieldOfArt: searchParams.get('fieldOfArt'),
    bodyOfWork: searchParams.get('bodyOfWork'),
    year: searchParams.get('year'),
    technique: searchParams.get('technique'),
    artist: searchParams.get('artist')
  }

  const hasActiveFilters = Object.values(currentFilters).some(Boolean) || searchTerm
  const activeFilterCount = Object.values(currentFilters).filter(Boolean).length + (searchTerm ? 1 : 0)

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to first page when filtering
    params.delete('page')
    
  router.push(`/artworks-enhanced?${params.toString()}`)
  }

  const clearAllFilters = () => {
  router.push('/artworks-view')
    setSearchTerm('')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', searchTerm || null)
  }

  return (
    <div className="bg-white dark:bg-black border-b border-black dark:border-white sticky top-16 z-40">
      {/* Statistics Bar */}
      <div className="border-b border-black dark:border-white py-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-black dark:text-white">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <ChartBarIcon className="w-4 h-4" />
                <span><strong className="text-black dark:text-white">{stats.totalArtworks}</strong> works</span>
              </div>
              <span><strong className="text-black dark:text-white">{stats.totalArtists}</strong> artists</span>
              <span><strong className="text-black dark:text-white">{stats.yearRange.earliest}-{stats.yearRange.latest}</strong></span>
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-green-600 dark:text-green-400">
                  <strong>{stats.availabilityStats.available}</strong> available
                </span>
                <span className="text-red-600 dark:text-red-400">
                  <strong>{stats.availabilityStats.sold}</strong> sold
                </span>
                {stats.availabilityStats.reserved > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    <strong>{stats.availabilityStats.reserved}</strong> reserved
                  </span>
                )}
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Clear all filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
              <input
                type="text"
                placeholder="Search works, artists, techniques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-black dark:border-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-black text-foreground placeholder-foreground/50 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    updateFilter('search', null)
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-black dark:hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              showFilters || hasActiveFilters
                ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300 shadow-sm'
                : 'bg-white border-black text-black hover:bg-black/5 dark:bg-black dark:border-white dark:text-white dark:hover:bg-white/10'
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-orange-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-white dark:bg-white/50 rounded-xl border border-black dark:border-black">
            {/* Field of Art */}
            <div>
              <h3 className="font-semibold mb-3 text-black dark:text-white flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Field of Art
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {fieldOfArt.map((field) => (
                  <button
                    key={field._id}
                    onClick={() => updateFilter('fieldOfArt', currentFilters.fieldOfArt === field._id ? null : field._id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      currentFilters.fieldOfArt === field._id
                        ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200 shadow-sm'
                        : 'hover:bg-white dark:hover:bg-white text-black dark:text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{field.title}</span>
                      <span className="text-xs text-black dark:text-black bg-white dark:bg-white px-1.5 py-0.5 rounded ml-2">
                        {field.artworkCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Body of Work */}
            <div>
              <h3 className="font-semibold mb-3 text-black dark:text-white flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Body of Work
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {bodyOfWork.map((body) => (
                  <button
                    key={body._id}
                    onClick={() => updateFilter('bodyOfWork', currentFilters.bodyOfWork === body._id ? null : body._id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      currentFilters.bodyOfWork === body._id
                        ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200 shadow-sm'
                        : 'hover:bg-white dark:hover:bg-white text-black dark:text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{body.title}</span>
                      <span className="text-xs text-black dark:text-black bg-white dark:bg-white px-1.5 py-0.5 rounded ml-2">
                        {body.artworkCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Years */}
            <div>
              <h3 className="font-semibold mb-3 text-black dark:text-white flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Year
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {years.filter((y) => y != null).slice(0, 20).map((year) => (
                  <button
                    key={year}
                    onClick={() => updateFilter('year', currentFilters.year === year.toString() ? null : year.toString())}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      currentFilters.year === year.toString()
                        ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200 shadow-sm'
                        : 'hover:bg-white dark:hover:bg-white text-black dark:text-black'
                    }`}
                  >
                    {year}
                  </button>
                ))}
                {years.length > 20 && (
                  <p className="text-xs text-black dark:text-black px-3 py-1">
                    + {years.length - 20} more years
                  </p>
                )}
              </div>
            </div>

            {/* Artists */}
            <div>
              <h3 className="font-semibold mb-3 text-black dark:text-white flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Artist
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {artists.slice(0, 15).map((artist) => (
                  <button
                    key={artist._id}
                    onClick={() => updateFilter('artist', currentFilters.artist === artist._id ? null : artist._id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      currentFilters.artist === artist._id
                        ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200 shadow-sm'
                        : 'hover:bg-white dark:hover:bg-white text-black dark:text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{artist.name || artist.title}</span>
                      <span className="text-xs text-black dark:text-black bg-white dark:bg-white px-1.5 py-0.5 rounded ml-2">
                        {artist.artworkCount}
                      </span>
                    </div>
                  </button>
                ))}
                {artists.length > 15 && (
                  <p className="text-xs text-black dark:text-black px-3 py-1">
                    + {artists.length - 15} more artists
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
