import { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Category interfaces
export interface Category {
  _id: string
  _type: string
  title: string
  description?: string
  slug?: {
    current: string
  }
}

export interface Artist {
  _id: string
  name: string
  slug?: {
    current: string
  }
  bio?: string
  mainImage?: {
    asset: {
      url: string
    }
  }
}

export interface Exhibition {
  _id: string
  title: string
  venue?: string
  startDate?: string
  endDate?: string
  city?: string
  country?: string
}

export interface Gallery {
  _key: string
  _type: 'image'
  asset: SanityImageSource
  alt?: string
  caption?: string
}

// Main Artwork interface
export interface Artwork {
  _id: string
  title?: string
  year?: number
  technique?: string
  size?: string
  edition?: string
  notes?: string
  slug?: { current?: string } | string
  mainImage?: { asset?: any; url?: string } | string
  gallery?: any[]
  fieldOfArt?: Category
  bodyOfWork?: Category
  artist?: Artist
  // Portable Text / content blocks from Sanity
  content?: any[]
  // legacy direct vimeo url (some queries include this)
  vimeoUrl?: string
  // new:
  layoutType?: 'blog' | 'extended' | 'simple'
  vimeoVideo?: {
    vimeoUrl?: string
  }
}

// Simplified version for listing
export interface ArtworkPreview {
  _id: string
  title?: string
  year?: number
  mainImage?: {
    asset?: any
  }
  gallery?: any[]
  technique?: string
  size?: string
  content?: any[]
  // slug may be a string or an object with current (sanity)
  slug?: string | { current?: string }
  // allow blog in preview to match Artwork.layoutType
  layoutType?: 'extended' | 'simple' | 'blog'
  bodyOfWork?: Category
  bodyOfWorkRef?: { _ref: string }
  fieldOfArt?: Category
  artist?: Artist
}
