export interface TextDocument {
  _id: string
  title: string
  slug?: {
    current: string
  }
  author?: string
  publishedAt?: string
  body?: string
  textContent?: string
  showOnWebsite?: boolean
  _updatedAt?: string
}

export interface TextPreview {
  _id: string
  title: string
  slug?: {
    current: string
  }
  author?: string
  publishedAt?: string
  body?: string[] // First few blocks for preview
  textContent?: string
}
