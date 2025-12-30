'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ArtworkPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export function ArtworkPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage
}: ArtworkPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
  router.push(`/artworks-enhanced?${params.toString()}`)
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 7

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      if (currentPage <= 4) {
        // Near beginning
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Near end
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In middle
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return (
      <div className="flex justify-center text-sm text-black dark:text-white">
        Showing {totalItems} artwork{totalItems !== 1 ? 's' : ''}
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
      {/* Results info */}
      <div className="text-sm text-black dark:text-white">
        Showing <span className="font-medium text-black dark:text-white">{startItem}</span> to{' '}
        <span className="font-medium text-black dark:text-white">{endItem}</span> of{' '}
        <span className="font-medium text-black dark:text-white">{totalItems}</span> artworks
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-black dark:border-white rounded-l-md hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm text-black dark:text-white">
                ...
              </span>
            ) : (
              <button
                onClick={() => goToPage(page as number)}
                className={`px-3 py-2 text-sm font-medium border-t border-b transition-colors ${
                  currentPage === page
                    ? 'bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-900/20 dark:border-orange-400 dark:text-orange-400'
                    : 'bg-white dark:bg-black border-black dark:border-white text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            )}
          </div>
        ))}

        {/* Next button */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-black dark:border-white rounded-r-md hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
