'use client'

import { useRouter, useSearchParams } from 'next/navigation'
// Using simple SVG icons since Heroicons might not be installed
const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const MasonryIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v11a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2z" />
  </svg>
)

const ListIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const SortIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
  </svg>
)

type ViewType = 'grid' | 'masonry' | 'list'
type SortType = 'year-desc' | 'year-asc' | 'title-asc' | 'title-desc' | 'updated'

const views: Array<{ key: ViewType; label: string; icon: React.ComponentType<any> }> = [
  { key: 'grid', label: 'Grid', icon: GridIcon },
  { key: 'masonry', label: 'Masonry', icon: MasonryIcon },
  { key: 'list', label: 'List', icon: ListIcon }
]

const sortOptions: Array<{ key: SortType; label: string }> = [
  { key: 'year-desc', label: 'Newest First' },
  { key: 'year-asc', label: 'Oldest First' },
  { key: 'title-asc', label: 'Title A-Z' },
  { key: 'title-desc', label: 'Title Z-A' },
  { key: 'updated', label: 'Recently Updated' }
]

interface ArtworkViewToggleProps {
  currentView?: ViewType
  currentSort?: SortType
}

export function ArtworkViewToggle({ 
  currentView = 'grid', 
  currentSort = 'year-desc' 
}: ArtworkViewToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateView = (view: ViewType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
  router.push(`/artworks-enhanced?${params.toString()}`)
  }

  const updateSort = (sort: SortType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    params.delete('page') // Reset to first page when sorting
  router.push(`/artworks-enhanced?${params.toString()}`)
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Sort Dropdown */}
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => updateSort(e.target.value as SortType)}
          className="appearance-none bg-white dark:bg-white border border-black dark:border-black rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <SortIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
      </div>

      {/* View Toggle */}
      <div className="flex bg-white dark:bg-white rounded-lg p-1 border border-black dark:border-black">
        {views.map((view) => {
          const Icon = view.icon
          const isActive = currentView === view.key
          
          return (
            <button
              key={view.key}
              onClick={() => updateView(view.key)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-white text-orange-600 dark:text-orange-400 shadow-sm border border-black dark:border-black'
                  : 'text-black dark:text-black hover:text-black dark:hover:text-black hover:bg-white/50 dark:hover:bg-white/50'
              }`}
              title={`${view.label} view`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{view.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
