import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/sanity/client'
// TriggerHueExtraction moved inline to avoid missing-module import

type Artwork = {
  _id: string
  title?: string
  slug?: string
  imageUrl?: string
  dominantColor?: string
  dominantHue?: number
}

const query = `*[_type == 'artwork' && showOnWebsite == true && defined(mainImage)] | order(coalesce(mainImageWithColor.dominantHue, 9999) asc) {
  _id,
  title,
  "slug": slug.current,
  // prefer the precomputed color image, fall back to the mainImage asset
  "imageUrl": coalesce(mainImageWithColor.image.asset->url, mainImage.asset->url),
  "dominantColor": mainImageWithColor.dominantColor,
  "dominantHue": mainImageWithColor.dominantHue
}`

export default async function Page() {
  const artworks: Artwork[] = await client.fetch(query)

  const missingIds = artworks.filter((a) => a.dominantHue == null).map((a) => a._id)

  return (
    <main style={{ padding: '1rem' }}>
      <div
        role="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 20px)',
          gap: '6px',
          alignItems: 'start',
        }}
      >
        {artworks.map((a) => (
          <Link
            key={a._id}
            href={a.slug ? `/artworks/${a.slug}` : `/new-work/${a._id}`}
            aria-label={a.title || a._id}
            title={a.title || a._id}
            style={{
              display: 'block',
              width: '20px',
              height: '20px',
              textDecoration: 'none',
            }}
          >
            {a.imageUrl ? (
              // show the main artwork image (no borders, shadows, or rounding)
              <Image
                src={a.imageUrl}
                alt={a.title || ''}
                width={200}
                height={200}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{ width: '20px', height: '20px', background: a.dominantColor || '#ccc' }} />
            )}
          </Link>
        ))}
      </div>

      {/* Trigger background hue extraction for artworks missing dominantHue */}
      {missingIds.length > 0 ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(ids){
                try {
                  if(!ids || !ids.length) return;
                  fetch('/api/dominant-color', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids })
                  }).catch(function(){});
                } catch(e) {}
              })(${JSON.stringify(missingIds)});
            `,
          }}
        />
      ) : null}
    </main>
  )
}
