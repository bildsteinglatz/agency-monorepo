import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from 'next-sanity'
import { client } from '@/sanity/client'
import { safeFetch } from '@/sanity/safeFetch'
import { 
  EXHIBITION_BY_ID_QUERY, 
  EXHIBITION_BY_SLUG_QUERY,
  EXHIBITION_METADATA_QUERY,
  RELATED_EXHIBITIONS_QUERY,
  EXHIBITION_NAVIGATION_QUERY
} from '@/sanity/queries'
import { Exhibition, ExhibitionPreview, ExhibitionDetailProps } from '@/types/exhibition'
import { ExhibitionCarousel } from '@/components/exhibitions/ExhibitionCarousel'
import { ExhibitionCard } from '@/components/exhibitions/ExhibitionCard'
import { ExhibitionBackButton } from '@/components/exhibitions/ExhibitionBackButton'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Generate metadata for SEO
export async function generateMetadata({ params }: ExhibitionDetailProps): Promise<Metadata> {
  try {
  const { id } = await params
  const exhibition = await safeFetch(EXHIBITION_METADATA_QUERY, { id }, null) as Exhibition | null
    
    if (!exhibition) {
      return {
        title: 'Exhibition Not Found | Bildstein | Glatz'
      }
    }

    const title = `${exhibition.title} ${exhibition.year} | Bildstein | Glatz`
    const description = exhibition.text?.[0]?.children?.[0]?.text || 
      `${exhibition.title} (${exhibition.year}) ${exhibition.exhibitionType} exhibition${exhibition.artist?.length ? ` featuring ${exhibition.artist.slice(0, 3).join(', ')}` : ''}${exhibition.venue ? ` at ${exhibition.venue}` : ''}.`

    return {
      title,
      description,
      openGraph: {
        type: 'article',
        title,
        description,
        images: exhibition.mainImage?.asset ? [{
          url: `${exhibition.mainImage.asset.url}?w=1200&h=630&fit=crop`,
          width: 1200,
          height: 630,
          alt: exhibition.mainImage.alt || exhibition.title,
        }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error)
    return {
      title: 'Exhibition | Bildstein | Glatz'
    }
  }
}

// Generate static params for all exhibitions (optional - for static generation)
export async function generateStaticParams() {
  try {
    const exhibitions = (await safeFetch<{ _id: string }[]>(`*[_type == "exhibition" && showInSelectedExhibitions == true]{ _id }`, undefined, [])) as { _id: string }[]
    return exhibitions.map((exhibition) => ({ id: exhibition._id }))
  } catch (error) {
    console.error('Failed to fetch exhibition IDs:', error)
    return []
  }
}

// Custom components for PortableText rendering
const portableTextComponents = {
  block: {
    normal: ({children}: any) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
    h2: ({children}: any) => <h2 className="text-2xl font-medium text-foreground mb-4 mt-8 uppercase">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-xl font-medium text-foreground mb-3 mt-6 uppercase">{children}</h3>,
    h4: ({children}: any) => <h4 className="text-lg font-medium text-foreground mb-2 mt-4 uppercase">{children}</h4>,
    blockquote: ({children}: any) => (
      <blockquote className="border-l border-foreground pl-4 my-6 italic text-foreground/80">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({children}: any) => <strong className="font-medium">{children}</strong>,
    em: ({children}: any) => <em className="italic">{children}</em>,
    link: ({children, value}: any) => (
      <a 
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline hover:opacity-70"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({children}: any) => <ul className="list-disc list-inside mb-4 space-y-1 text-foreground">{children}</ul>,
    number: ({children}: any) => <ol className="list-decimal list-inside mb-4 space-y-1 text-foreground">{children}</ol>,
  },
}

export default async function ExhibitionDetailPage({ params }: ExhibitionDetailProps) {
  try {
  const { id } = await params
    
    // Try to fetch by slug first, then by ID
  let exhibition = await safeFetch<Exhibition>(EXHIBITION_BY_SLUG_QUERY, { slug: id }, null) as Exhibition | null
    
    // If no exhibition found by slug, try by ID
    if (!exhibition) {
      exhibition = await safeFetch<Exhibition>(EXHIBITION_BY_ID_QUERY, { id }, null) as Exhibition | null
    }

    if (!exhibition) {
      notFound()
    }

    // Fetch navigation data
    const allExhibitions = await safeFetch<{ _id: string, title: string }[]>(EXHIBITION_NAVIGATION_QUERY, undefined, []) || []
    const currentIndex = allExhibitions.findIndex(e => e._id === exhibition?._id)
    const prevExhibition = currentIndex > 0 ? allExhibitions[currentIndex - 1] : null
    const nextExhibition = currentIndex < allExhibitions.length - 1 ? allExhibitions[currentIndex + 1] : null

    // Fetch related exhibitions
    let relatedExhibitions: ExhibitionPreview[] = []
    try {
      relatedExhibitions = await safeFetch<ExhibitionPreview[]>(RELATED_EXHIBITIONS_QUERY, {
        currentId: exhibition._id,
        venueName: exhibition.venue?.name ?? null,
        year: exhibition.year ?? null,
        artistIds: exhibition.artist?.map(a => a._id) || []
      }, []) || []
    } catch (error) {
      console.error('Failed to fetch related exhibitions:', error)
    }

    // Prepare gallery images (include main image if not in gallery)
    const galleryImages = exhibition.gallery || []
    if (exhibition.mainImage && !galleryImages.find(img => img?.asset?._id === exhibition.mainImage?.asset?._id)) {
      galleryImages.unshift({
        asset: exhibition.mainImage.asset,
        alt: exhibition.mainImage.alt,
        caption: exhibition.mainImage.caption,
        _key: 'main-image'
      })
    }

    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col">
          <div className="flex flex-col md:flex-row gap-6 w-full flex-grow pt-0 md:pt-0">
            
            {/* Mobile Navigation */}
            <div className="flex md:hidden justify-center items-center gap-2 text-sm font-normal text-[var(--filterbar-link-color)] px-6 pt-20 pb-0 order-1 w-full">
              {prevExhibition ? (
                <Link href={`/app/exhibitions/${prevExhibition._id}`} className="px-0 py-0 hover:opacity-60 transition-opacity">
                  ← prev
                </Link>
              ) : (
                <span className="opacity-30 cursor-not-allowed px-0 py-0">← prev</span>
              )}
              <span className="text-gray-400">|</span>
              <ExhibitionBackButton />
              <span className="text-gray-400">|</span>
              {nextExhibition ? (
                <Link href={`/app/exhibitions/${nextExhibition._id}`} className="px-0 py-0 hover:opacity-60 transition-opacity">
                  next →
                </Link>
              ) : (
                <span className="opacity-30 cursor-not-allowed px-0 py-0">next →</span>
              )}
            </div>

            {/* Left Column: Gallery (Desktop) / Top (Mobile) */}
            <div className="flex-1 md:w-2/3 relative order-2 md:order-1">
              <ExhibitionCarousel 
                images={galleryImages} 
                title={exhibition.title} 
              />
            </div>

            {/* Right Column: Info (Desktop) / Bottom (Mobile) */}
            <aside className="w-full md:w-1/3 md:pl-4 md:pr-0 order-3 md:order-2 px-6 md:px-0 pt-0">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2 text-sm font-normal text-[var(--filterbar-link-color)] mb-1 md:pr-6">
                {prevExhibition ? (
                  <Link href={`/app/exhibitions/${prevExhibition._id}`} className="px-0 py-0 hover:opacity-60 transition-opacity">
                    ← prev
                  </Link>
                ) : (
                  <span className="opacity-30 cursor-not-allowed px-0 py-0">← prev</span>
                )}
                <span className="text-gray-400">|</span>
                <ExhibitionBackButton />
                <span className="text-gray-400">|</span>
                {nextExhibition ? (
                  <Link href={`/app/exhibitions/${nextExhibition._id}`} className="px-0 py-0 hover:opacity-60 transition-opacity">
                    next →
                  </Link>
                ) : (
                  <span className="opacity-30 cursor-not-allowed px-0 py-0">next →</span>
                )}
              </div>

              {/* Divider & Info */}
              <div className="text-sm font-normal text-[var(--filterbar-link-color)] w-full border-t pt-3 md:pr-6" style={{ borderTopColor: 'var(--foreground)' }}>
                <div className="text-sm font-normal uppercase mb-6 leading-snug">
                  BILDSTEIN | GLATZ, {exhibition.title}
                  {exhibition.venue?.name ? ` ${exhibition.venue.name}` : ''}
                  {exhibition.venue?.city ? `, ${exhibition.venue.city}` : ''}
                  {exhibition.year ? ` ${exhibition.year}` : ''}
                </div>
                
                {/* Detail Text */}
                {exhibition.text && (
                  <div className="text-sm opacity-90 leading-relaxed prose max-w-none">
                    {typeof exhibition.text === 'string' ? (
                      <div className="whitespace-pre-line">{exhibition.text}</div>
                    ) : (
                      <PortableText value={exhibition.text} components={portableTextComponents} />
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Error rendering exhibition page:', error)
    throw error
  }
}
