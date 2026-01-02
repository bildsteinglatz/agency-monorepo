"use client"

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useRetraction } from '../RetractionContext'

export default function NewWorkFiltersClient({ filterOptions }: { filterOptions: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { retractionLevel } = useRetraction()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const currentFieldOfArt = searchParams.get('fieldOfArt')
  const currentBodyOfWork = searchParams.get('bodyOfWork')
  const currentYear = searchParams.get('year')

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'fieldOfArt') {
      params.delete('bodyOfWork')
      params.delete('year')
      params.set('layer', 'fieldOfArt')
    } else if (key === 'bodyOfWork') {
      params.delete('fieldOfArt')
      params.delete('year')
      params.set('layer', 'bodyOfWork')
    } else if (key === 'year') {
      params.delete('fieldOfArt')
      params.delete('bodyOfWork')
      params.set('layer', 'year')
    }

    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
    setActiveDropdown(null)
  }

  const clearFilters = () => {
    router.push(pathname)
    setActiveDropdown(null)
  }

  return (
    <div className={`w-full secondary-navigation mb-0 sticky top-0 z-[90] bg-background transition-all duration-500 ease-in-out ${retractionLevel >= 3 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
      <nav className="second-nav pt-1 pb-0.5">
        <div className="flex gap-3 justify-start items-start nav-text" style={{ marginLeft: '8px' }}>
          {filterOptions && (
            <>
              <button onClick={() => setActiveDropdown(activeDropdown === 'fieldOfArt' ? null : 'fieldOfArt')} className={`font-owners font-bold italic uppercase hover:text-neon-orange transition-colors flex items-center gap-1 ${currentFieldOfArt || activeDropdown === 'fieldOfArt' ? 'text-neon-orange' : ''}`}>
                Field of Art
              </button>
              <button onClick={() => setActiveDropdown(activeDropdown === 'bodyOfWork' ? null : 'bodyOfWork')} className={`font-owners font-bold italic uppercase hover:text-neon-orange transition-colors flex items-center gap-1 ${currentBodyOfWork || activeDropdown === 'bodyOfWork' ? 'text-neon-orange' : ''}`}>
                Body of Work
              </button>
              <button onClick={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')} className={`font-owners font-bold italic uppercase hover:text-neon-orange transition-colors flex items-center gap-1 ${currentYear || activeDropdown === 'year' ? 'text-neon-orange' : ''}`}>
                Year
              </button>
            </>
          )}

          <button onClick={() => { const mode = searchParams.get('view') === 'detail' ? 'grid' : 'detail'; const params = new URLSearchParams(searchParams.toString()); params.set('view', mode); router.push(`${pathname}?${params.toString()}`) }} className="font-owners font-bold italic uppercase hover:text-neon-orange transition-colors flex items-center ml-auto mr-4">
            Toggle View
          </button>

          {(currentFieldOfArt || currentBodyOfWork || currentYear) && (
            <button onClick={clearFilters} className="font-owners font-bold italic uppercase hover:text-neon-orange transition-colors">Clear</button>
          )}
        </div>
      </nav>

      {activeDropdown && filterOptions && (
        <nav className="third-nav pt-1 pb-0.5">
          <div className="flex gap-3 justify-start items-start nav-text flex-wrap" style={{ marginLeft: '8px' }}>
            {activeDropdown === 'fieldOfArt' && filterOptions.fieldOfArt.map((option: any) => (
              <button key={option._id} onClick={() => updateFilter('fieldOfArt', option._id)} className={`uppercase hover:text-neon-orange transition-colors ${currentFieldOfArt === option._id ? 'text-neon-orange' : ''}`}>{option.title}</button>
            ))}
            {activeDropdown === 'bodyOfWork' && filterOptions.bodyOfWork.map((option: any) => (
              <button key={option._id} onClick={() => updateFilter('bodyOfWork', option._id)} className={`uppercase hover:text-neon-orange transition-colors ${currentBodyOfWork === option._id ? 'text-neon-orange' : ''}`}>{option.title}</button>
            ))}
            {activeDropdown === 'year' && filterOptions.years.map((year: any) => (
              <button key={year} onClick={() => updateFilter('year', String(year))} className={`uppercase hover:text-neon-orange transition-colors ${String(currentYear) === String(year) ? 'text-neon-orange' : ''}`}>{year}</button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
