// TypeScript interfaces for exhibitions - matching your Sanity schema

export interface SanityImage {
  _id?: string
  _ref?: string
  url?: string
  metadata?: {
    dimensions?: {
      width: number
      height: number
    }
    lqip?: string
    palette?: any
  }
}

export interface ImageAsset {
  _key?: string
  asset: SanityImage
  alt?: string
  caption?: string
  hotspot?: {
    x: number
    y: number
  }
}

export interface Artist {
  _id: string
  name: string
  slug?: string
  bio?: any[] // Portable Text
  mainImage?: ImageAsset
  website?: string
}

export interface Venue {
  _id: string
  name: string
  location?: string
  city?: string
  state?: string
  country?: string
  address?: string
  website?: string
  slug?: string
  description?: any[] // Portable Text
}

export interface GalleryImage {
  _key: string
  asset: SanityImage
  caption?: string
  alt?: string
}

export interface Exhibition {
  _id: string
  _createdAt?: string
  _updatedAt?: string
  title: string
  year: number
  artist?: Artist[]
  venue?: Venue
  exhibitionType: 'solo' | 'group' | 'fair' | 'biennale' | 'other'
  mainImage?: ImageAsset
  text?: any[] // Portable Text
  gallery?: GalleryImage[]
  weblink?: string
  serialNumber?: string
  notes?: string
  slug?: string
}

export interface ExhibitionPreview {
  _id: string
  title: string
  year: number
  exhibitionType: 'solo' | 'group' | 'fair' | 'biennale' | 'other'
  serialNumber?: string
  mainImage?: ImageAsset
  slug?: string
  artists?: Artist[]
  venue?: Venue
  gallery?: GalleryImage[]
  text?: any[]
  weblink?: string
}

export interface ExhibitionFilters {
  type?: string
  year?: number
  venue?: string
  artist?: string
  search?: string
}

export interface ExhibitionPageProps {
  searchParams: Promise<{
    page?: string
    type?: string
    year?: string
    search?: string
  }>
}

export interface ExhibitionDetailProps {
  params: Promise<{
    id: string
  }>
}
