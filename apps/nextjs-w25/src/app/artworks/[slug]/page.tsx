import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { ARTWORK_BY_SLUG_QUERY, ARTWORK_BY_ID_QUERY, ARTWORK_METADATA_QUERY, RELATED_ARTWORKS_QUERY } from '@/sanity/queries'
import { Artwork, ArtworkPreview } from '@/types/artwork'
import { ArtworkImage } from '@/components/ArtworkImage'
import { ArtworkMetadata } from '@/components/ArtworkMetadata'
import { ArtworkCard } from '@/components/ArtworkCard'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface ArtworkPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const artwork = await client.fetch(ARTWORK_METADATA_QUERY, { slug })

    if (!artwork) {
      return {
        title: 'Artwork Not Found | Bildstein/Glatz'
      }
    }

    const title = `${artwork.title} | Bildstein/Glatz`
    const description = artwork.content?.[0]?.children?.[0]?.text || `${artwork.title} by ${artwork.artist?.name || 'Bildstein/Glatz'}${artwork.year ? ` (${artwork.year})` : ''}`
    return {
      title,
      description,
      openGraph: {
        type: 'article',
        title,
        description,
        images: artwork.mainImage?.asset ? [{
          url: `${artwork.mainImage.asset.url}?w=1200&h=630&fit=crop`,
          width: 1200,
          height: 630,
          alt: artwork.mainImage.alt || artwork.title,
        }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: artwork.mainImage?.asset ? [`${artwork.mainImage.asset.url}?w=1200&h=630&fit=crop`] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Artwork | Bildstein/Glatz'
    }
  }
}

export async function generateStaticParams() {
  try {
    const raw = await client.fetch<any[]>(
      `*[_type == "artwork" && showOnWebsite == true]{ "slug": slug, _id }`
    )
    const slugs = raw
      .map((s) => {
        const slug = s?.slug
        if (!slug) return s?._id ? String(s._id) : null
        if (typeof slug === 'string') return slug
        if (typeof slug === 'object' && slug.current) return String(slug.current)
        return null
      })
      .filter(Boolean)
    return slugs.map((slug) => ({ slug: String(slug) }))
  } catch (error) {
    console.error('Failed to fetch artwork slugs:', error)
    return []
  }
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  try {
    const { slug } = await params

    let artwork = await client.fetch<Artwork>(ARTWORK_BY_SLUG_QUERY, { slug })

    if (!artwork) {
      artwork = await client.fetch<Artwork>(ARTWORK_BY_ID_QUERY, { id: slug })
    }

    if (!artwork) {
      notFound()
    }

    let relatedArtworks: ArtworkPreview[] = []
    try {
      relatedArtworks = await client.fetch<ArtworkPreview[]>(RELATED_ARTWORKS_QUERY, {
        currentId: artwork._id,
        // artwork.artist may be missing from the Artwork type in some builds; use safe any-cast access
        artistId: (artwork as any)?.artist?._id ?? null,
        fieldOfArtId: (artwork as any)?.fieldOfArt?._id ?? null,
        bodyOfWorkId: (artwork as any)?.bodyOfWork?._id ?? null,
      })
    } catch (error) {
      console.error('Failed to fetch related artworks:', error)
    }

    return (
      <ErrorBoundary>
        <div className="min-h-screen transition-colors">
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
            {/* Breadcrumb Navigation */}
            <nav className="mb-8 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-black hover:text-orange-500">
                    Home
                  </Link>
                </li>
                <li className="text-black">/</li>
                <li>
                  <Link href="/artworks" className="text-black hover:text-orange-500">
                    Artworks
                  </Link>
                </li>
                <li className="text-black">/</li>
                <li className="text-black dark:text-black font-medium">
                  {artwork.title}
                </li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div>
                <ArtworkImage artwork={artwork} />
              </div>

              <div>
                <ArtworkMetadata artwork={artwork} />
              </div>
            </div>

            {relatedArtworks.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-8">Related Artworks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {relatedArtworks.map((relatedArtwork) => (
                    <ArtworkCard key={relatedArtwork._id} artwork={relatedArtwork} />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12 pt-8 border-t border-black dark:border-black">
              <Link 
                href="/artworks"
                className="inline-flex items-center gap-2 text-orange-500 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to all artworks
              </Link>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Failed to fetch artwork:', error)
    notFound()
  }
}
