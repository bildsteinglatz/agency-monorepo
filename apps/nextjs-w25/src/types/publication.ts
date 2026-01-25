import { SanityImageSource } from '@sanity/image-url/lib/types/types'

export interface Publication {
  _id: string
  title: string
  mainImage?: {
    asset: {
      _id: string
      url: string
      metadata?: {
        dimensions?: {
          width: number
          height: number
        }
        lqip?: string
      }
    }
    alt?: string
  }
  previewImages?: {
    _key: string
    asset: {
      _id: string
      url: string
      metadata?: {
        dimensions?: {
          width: number
          height: number
        }
        lqip?: string
      }
    }
    alt?: string
  }[]
  gallery?: {
    _key: string
    asset: {
      _id: string
      url: string
      metadata?: {
        dimensions?: {
          width: number
          height: number
        }
        lqip?: string
      }
    }
    alt?: string
  }[]
  bookFacts?: {
    publisher?: string
    design?: string
    pages?: string | number
    dimensions?: string
    edition?: string
    isbn?: string
    publishedDate?: string
    price?: number
    availability?: string
    editors?: string
    authors?: string[]
  }
  description?: any // Portable Text or string
  shortDescription?: any // Portable Text or string
  authors?: string[]
  authorsTitle?: string[]
  author?: string
  editors?: string[]
  editor?: string
  textAuthors?: string[] | string
  credits?: string
  pdfUrl?: string
  [key: string]: any
}
