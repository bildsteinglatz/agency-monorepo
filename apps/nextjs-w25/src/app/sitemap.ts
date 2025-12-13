import { MetadataRoute } from 'next'
import { client } from '@/sanity/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bildstein-glatz.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/new-work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artworks`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/exhibitions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/texts`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/portrait`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/publications`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Dynamic artwork pages
  let artworkPages: MetadataRoute.Sitemap = []
  try {
    const artworks = await client.fetch<Array<{ slug: string; _updatedAt: string }>>(
      `*[_type == "artwork" && showOnWebsite == true && defined(slug.current)] { 
        "slug": slug.current, 
        _updatedAt 
      }`
    )
    artworkPages = artworks.map((artwork) => ({
      url: `${baseUrl}/artworks/${artwork.slug}`,
      lastModified: new Date(artwork._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Failed to fetch artworks for sitemap:', error)
  }

  // Dynamic exhibition pages
  let exhibitionPages: MetadataRoute.Sitemap = []
  try {
    const exhibitions = await client.fetch<Array<{ _id: string; _updatedAt: string }>>(
      `*[_type == "exhibition" && showInSelectedExhibitions == true] { _id, _updatedAt }`
    )
    exhibitionPages = exhibitions.map((exhibition) => ({
      url: `${baseUrl}/exhibitions/${exhibition._id}`,
      lastModified: new Date(exhibition._updatedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Failed to fetch exhibitions for sitemap:', error)
  }

  // Dynamic text pages
  let textPages: MetadataRoute.Sitemap = []
  try {
    const texts = await client.fetch<Array<{ slug: string; _updatedAt: string }>>(
      `*[_type == "textDocument" && defined(slug.current)] { 
        "slug": slug.current, 
        _updatedAt 
      }`
    )
    textPages = texts.map((text) => ({
      url: `${baseUrl}/texts/${text.slug}`,
      lastModified: new Date(text._updatedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    }))
  } catch (error) {
    console.error('Failed to fetch texts for sitemap:', error)
  }

  return [...staticPages, ...artworkPages, ...exhibitionPages, ...textPages]
}
