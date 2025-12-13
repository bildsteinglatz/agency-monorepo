'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, Variants } from 'framer-motion'

interface ExhibitionFiltersProps {
  years: number[]
  types: string[]
  resultsCount?: number
  totalCount?: number
}

export function ExhibitionFilters({ years, types, resultsCount, totalCount }: ExhibitionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const currentType = searchParams.get('type') || ''
  const currentYear = searchParams.get('year') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to first page when filtering
    params.delete('page')
    
  const query = params.toString()
  router.push(query ? `/exhibitions?${query}` : '/exhibitions')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', searchTerm)
  }

  const clearFilters = () => {
    setSearchTerm('')
  router.push('/exhibitions')
  }

  const hasActiveFilters = currentType || currentYear || searchTerm

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.7
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 20
      }
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className=""
    >
      <div className="flex flex-col lg:flex-row gap-0 items-start lg:items-center border-b border-foreground">
        {/* Search */}
        <motion.form variants={itemVariants} onSubmit={handleSearch} className="w-full lg:w-64 lg:border-r border-foreground relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-0 border-none bg-transparent text-foreground placeholder-foreground/50 focus:outline-none focus:ring-0"
            />
          </div>
        </motion.form>

        {/* Type Filter */}
        <motion.div variants={itemVariants} className="w-full lg:w-48 lg:border-r border-foreground relative">
          <select
            value={currentType}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="block w-full pl-3 pr-8 py-0 text-base border-none bg-transparent text-foreground focus:outline-none focus:ring-0 appearance-none cursor-pointer"
          >
            <option value="" className="bg-background text-foreground">All Types</option>
            {types.filter(t => t).map((type) => {
              const label = (() => {
                switch (type) {
                  case 'solo': return 'Solo Exhibitions'
                  case 'group': return 'Group Exhibitions'
                  case 'public_space': return 'Work in Public Space'
                  case 'fair': return 'Art Fairs'
                  case 'biennale': return 'Biennales'
                  default: return type.charAt(0).toUpperCase() + type.slice(1) + 's'
                }
              })()
              
              return (
                <option key={type} value={type} className="bg-background text-foreground">
                  {label}
                </option>
              )
            })}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.div>

        {/* Year Filter */}
        <motion.div variants={itemVariants} className="w-full lg:w-32 lg:border-r border-foreground relative">
          <select
            value={currentYear}
            onChange={(e) => updateFilter('year', e.target.value)}
            className="block w-full pl-3 pr-8 py-0 text-base border-none bg-transparent text-foreground focus:outline-none focus:ring-0 appearance-none cursor-pointer"
          >
            <option value="" className="bg-background text-foreground">All Years</option>
            {years.map((year) => (
              <option key={year} value={year.toString()} className="bg-background text-foreground">
                {year}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.div>

        {/* Active Filters / Clear */}
        {hasActiveFilters && (
          <motion.button
            variants={itemVariants}
            onClick={clearFilters}
            className="w-full lg:w-auto px-4 py-0 text-base text-foreground hover:opacity-50 uppercase lg:border-r border-foreground text-left"
          >
            Clear
          </motion.button>
        )}

        {/* Spacer */}
        <div className="hidden lg:block flex-grow"></div>

        {/* Results Count / Status */}
        <motion.div variants={itemVariants} className="w-full lg:w-auto px-4 py-0 text-sm text-foreground whitespace-nowrap flex items-center justify-between lg:justify-end">
          <span>
            {hasActiveFilters ? (
              <>{resultsCount} results</>
            ) : (
              <>{resultsCount} of {totalCount}</>
            )}
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
