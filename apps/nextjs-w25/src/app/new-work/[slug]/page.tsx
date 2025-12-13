import ExtendedArtworkLayout from "@/components/artwork/ExtendedArtworkLayout.client";
import React from "react";
import SimpleArtworkLayout from "@/components/artwork/SimpleArtworkLayout";
// DebugFilterOptions removed in production
import Link from "next/link";
import { ARTWORK_BY_SLUG_QUERY, ARTWORK_BY_ID_QUERY, ARTWORKS_BY_FIELD_OF_ART_QUERY, ARTWORKS_BY_BODY_OF_WORK_QUERY, ARTWORKS_BY_YEAR_QUERY } from '@/sanity/queries'
import { safeFetch } from '@/sanity/safeFetch';
import { Artwork as OriginalArtwork, ArtworkPreview, Category } from '@/types/artwork';
import { slugToString, getAssetUrl } from '@/utils/sanity-helpers';
import { Metadata } from 'next';

// Extend Artwork type to include vimeoVideo property
type Artwork = OriginalArtwork & {
  vimeoVideo?: {
    vimeoUrl?: string;
  };
};
import { notFound } from "next/navigation";
import {
  ARTWORK_FILTER_OPTIONS_QUERY,
} from "@/sanity/queries";

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await safeFetch<Artwork | null>(ARTWORK_BY_SLUG_QUERY, { slug }, null);
  
  if (!artwork) {
    return {
      title: 'Artwork | Bildstein | Glatz',
      description: 'Artwork by Bildstein | Glatz',
    };
  }
  
  const mainImageUrl = getAssetUrl(artwork.mainImage);
  
  return {
    title: `${artwork.title || 'Untitled'} | Bildstein | Glatz`,
    description: artwork.technique 
      ? `${artwork.title} (${artwork.year}) - ${artwork.technique}`
      : `Artwork by Bildstein | Glatz${artwork.year ? ` (${artwork.year})` : ''}`,
    openGraph: mainImageUrl ? {
      images: [{ url: mainImageUrl, width: 1200, height: 630 }],
    } : undefined,
  };
}

function qs(base: Record<string, string | undefined>, mods: Record<string, string | null | undefined>) {
  const p = new URLSearchParams();
  const next: Record<string, string | undefined> = { ...base };
  for (const [k, v] of Object.entries(mods)) {
    if (v === null) delete next[k];
    else if (v !== undefined) next[k] = v;
  }
  for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
  return p.toString();
}

export default async function ArtworkDetailPage({ params, searchParams }: Props) {
  // Normalize params and searchParams ONCE at the top using props
  const normalizedParams = await params;
  const normalizedSearchParams = (await searchParams) || {};
  const urlParams = normalizedSearchParams as Record<string, unknown>;
  
  // Fetch artwork by slug or ID (fallback for artworks without slugs)
  let artworkRaw = await safeFetch<Artwork | null>(ARTWORK_BY_SLUG_QUERY, { slug: normalizedParams.slug }, null)
  // artworkRaw fetched

  // If not found by slug, try by ID (fallback)
  if (!artworkRaw) {
    artworkRaw = await safeFetch(ARTWORK_BY_ID_QUERY, { id: normalizedParams.slug }, null)
  }


  if (!artworkRaw) return notFound();

  const artwork = artworkRaw as Artwork

  if (!artwork) return notFound();

  // Fetch siblings if bodyOfWork exists to populate gallery
  if (artwork.bodyOfWork) {
    const siblings = await safeFetch<ArtworkPreview[]>(
      `*[_type == "artwork" && bodyOfWork._ref == $bodyOfWorkId && _id != $currentId] | order(year desc) {
        _id, title, mainImage, slug
      }`,
      { bodyOfWorkId: artwork.bodyOfWork._id, currentId: artwork._id },
      []
    );

    if (siblings && siblings.length > 0) {
      // Create gallery items from siblings
      const siblingGalleryItems = siblings.map(sibling => ({
        _key: sibling._id,
        _type: 'image',
        asset: sibling.mainImage?.asset,
        alt: sibling.title,
      })).filter(item => item.asset);

      // Combine with existing gallery
      if (!artwork.gallery) {
        artwork.gallery = [];
      }
      
      // Add siblings to gallery
      artwork.gallery = [...artwork.gallery, ...siblingGalleryItems];
    }
  }

  // Fetch filter options for navigation
  const rawFilterOptions = await safeFetch<{ fieldOfArt?: unknown[]; bodyOfWork?: unknown[]; years?: unknown[] }>(
    ARTWORK_FILTER_OPTIONS_QUERY,
    undefined,
    { fieldOfArt: [], bodyOfWork: [], years: [] }
  );

  const filterOptions = {
  fieldOfArt: Array.isArray(rawFilterOptions?.fieldOfArt) ? (rawFilterOptions.fieldOfArt as unknown as Category[]) : [],
  bodyOfWork: Array.isArray(rawFilterOptions?.bodyOfWork) ? (rawFilterOptions.bodyOfWork as unknown as Category[]) : [],
    years: Array.isArray(rawFilterOptions?.years) ? rawFilterOptions.years : [],
  };

  // Use layer from URL params or determine based on artwork's connections
  const getUrlParam = (k: string): string | undefined => {
    const v = (urlParams as Record<string, unknown>)[k];
    if (typeof v === 'string') return v;
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') return v[0];
    return undefined;
  }
  const layer = getUrlParam('layer') || (artwork.fieldOfArt ? "fieldOfArt" : artwork.bodyOfWork ? "bodyOfWork" : "fieldOfArt");
  const selectedFieldOfArt = getUrlParam('fieldOfArt') || artwork.fieldOfArt?._id || null;
  const selectedBodyOfWork = getUrlParam('bodyOfWork') || artwork.bodyOfWork?._id || null;
  const selectedYear = getUrlParam('year') ? Number(getUrlParam('year')) : null;

  const baseParams: Record<string, string | undefined> = {
    page: "1",
    fieldOfArt: selectedFieldOfArt || undefined,
    bodyOfWork: selectedBodyOfWork || undefined,
    year: selectedYear ? String(selectedYear) : undefined,
    layer,
  };

  const firstNav = [
    { key: "fieldOfArt", label: "Field of Art" },
    { key: "bodyOfWork", label: "Body of Work" },
    { key: "year", label: "Year" },
  ];

  const secondNav =
    layer === "fieldOfArt"
      ? filterOptions.fieldOfArt.map((o) => {
            const id = String((o as Category)._id || (o as any)?.value || (o as any)?.key || String(o));
            const label = String((o as Category).title || (o as any)?.label || (o as any)?.value || String(o));
            return {
              key: id,
              label,
              isActive: selectedFieldOfArt === id,
          href: `/new-work?${qs({
            page: "1",
            layer: "fieldOfArt",
                fieldOfArt: id,
          }, {})}`,
            }
          })
      : layer === "bodyOfWork"
      ? filterOptions.bodyOfWork.map((o) => {
          const id = String((o as Category)._id || (o as any)?.value || (o as any)?.key || String(o));
          const label = String((o as Category).title || (o as any)?.label || (o as any)?.value || String(o));
          return {
            key: id,
            label,
            isActive: selectedBodyOfWork === id,
          href: `/new-work?${qs({
            page: "1",
            layer: "bodyOfWork", 
              bodyOfWork: id,
          }, {})}`,
          }
        })
      : filterOptions.years.map((y) => {
          const yearStr = typeof y === 'object' && y !== null ? String((y as { year?: number }).year ?? '') : String(y);
          return {
            key: yearStr,
            label: yearStr,
          isActive: false,
          href: `/new-work?${qs({
            page: "1",
            layer: "year",
              year: yearStr,
          }, {})}`,
          }
        });

  let categoryArtworks: ArtworkPreview[] = [];

  if (layer === "fieldOfArt" && selectedFieldOfArt) {
  categoryArtworks = (await safeFetch<ArtworkPreview[] | null>(ARTWORKS_BY_FIELD_OF_ART_QUERY, { fieldOfArt: selectedFieldOfArt }, [])) || []
  } else if (layer === "bodyOfWork" && selectedBodyOfWork) {
  categoryArtworks = (await safeFetch<ArtworkPreview[] | null>(ARTWORKS_BY_BODY_OF_WORK_QUERY, { bodyOfWork: selectedBodyOfWork }, [])) || []
  } else if (layer === "year" && selectedYear) {
  categoryArtworks = (await safeFetch<ArtworkPreview[] | null>(ARTWORKS_BY_YEAR_QUERY, { year: selectedYear }, [])) || []
  }

  const currentIndex = categoryArtworks.findIndex((a) => a._id === artwork._id);
  
  let prevArtwork: ArtworkPreview | undefined, nextArtwork: ArtworkPreview | undefined;

  if (categoryArtworks.length > 1) {
    if (currentIndex > 0) {
      prevArtwork = categoryArtworks[currentIndex - 1];
    } else {
      prevArtwork = categoryArtworks[categoryArtworks.length - 1];
    }

    if (currentIndex < categoryArtworks.length - 1) {
      nextArtwork = categoryArtworks[currentIndex + 1];
    } else {
      nextArtwork = categoryArtworks[0];
    }
  }

  // Generate hrefs for prev/next artwork navigation
  const prevHref = prevArtwork
    ? `/new-work/${prevArtwork.slug || prevArtwork._id}?${qs(baseParams, {})}`
    : undefined;
  const nextHref = nextArtwork
    ? `/new-work/${nextArtwork.slug || nextArtwork._id}?${qs(baseParams, {})}`
    : undefined;

  // Get main image URL for display
  const mainImageUrl = getAssetUrl(artwork.mainImage);

  // Determine if the currently selected fieldOfArt corresponds to the 'video' category
  const selectedFieldIsVideo = (() => {
    try {
      if (!selectedFieldOfArt) return false;
      const match = filterOptions.fieldOfArt.find((f) => String((f as any)._id) === String(selectedFieldOfArt));
      if (!match) return false;
      const slug = (match as any).slug;
      if (!slug) return false;
      return String((slug.current || slug)).toLowerCase() === 'video';
    } catch (e) {
      return false;
    }
  })();

  // debug logging removed

  return (
  <div className="py-0 text-left" style={{ marginLeft: 0, paddingLeft: 0 }}>
  {/* filter options UI */}
      {/* First Nav */}
      <nav className="first-nav flex gap-1 pt-1 mb-0">
        <div className="flex gap-0 gap-y-0 flex-wrap" style={{ marginTop: '2px' }}>
          {firstNav.map((tab) => {
            const navParams: Record<string, string | undefined> = { ...baseParams, layer: tab.key, page: "1", fieldOfArt: undefined, bodyOfWork: undefined, year: undefined };
            // If clicking Field of Art, default to "Kunst im öffentlichen Raum"
            if (tab.key === "fieldOfArt") {
                const publicSpaceCategory = filterOptions?.fieldOfArt?.find((cat) => {
                  const s = slugToString(((cat as { slug?: unknown }).slug) as unknown as { current?: string } | string | undefined);
                  return cat.title === "Kunst im öffentlichen Raum" || s === "public-space";
                });
              if (publicSpaceCategory && publicSpaceCategory._id) {
                navParams.fieldOfArt = publicSpaceCategory._id;
              }
            }
            return (
              <Link
                key={tab.key}
                href={`/new-work?${qs(navParams, {})}`}
                className={`filterbar-link px-2 py-0 rounded transition-colors ${tab.key === layer ? 'active' : ''}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

  <nav className="flex mb-10 second-nav" style={{ marginTop: '2px' }}>
        <div className="flex gap-0 gap-y-0 flex-wrap">
          {secondNav.map((opt: { key: string; label: string; isActive: boolean; href: string }) => (
            <Link
              key={opt.key}
              href={opt.href}
              className={`filterbar-link px-2 py-0 rounded transition-colors ${opt.isActive ? 'active' : ''}`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </nav>
      {/* Prev/Next Navigation across all artworks and categories */}
      { /* Replace the artwork-image / prev-next area with this responsive layout */ }
      {(artwork.layoutType === "simple" || !artwork.layoutType) && (
        <SimpleArtworkLayout
          artwork={artwork}
          prevHref={prevHref}
          nextHref={nextHref}
          mainImageUrl={mainImageUrl}
          vimeoUrl={artwork.vimeoVideo?.vimeoUrl || artwork.vimeoUrl}
          preferVimeo={
            selectedFieldIsVideo ||
            ((artwork as any)?.fieldOfArt?.slug === 'video') ||
            ((artwork as any)?.fieldOfArt?.slug?.current === 'video') ||
            !!(artwork.vimeoVideo?.vimeoUrl || artwork.vimeoUrl)
          }
        />
      )}

      {artwork.layoutType === "extended" ? (
        <ExtendedArtworkLayout artwork={artwork} prevHref={prevHref} nextHref={nextHref} />
      ) : null}
      
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VisualArtwork',
            name: artwork.title,
            dateCreated: artwork.year?.toString(),
            creator: {
              '@type': 'Organization',
              name: 'Bildstein | Glatz',
            },
            artMedium: artwork.technique,
            image: mainImageUrl,
          }),
        }}
      />
    </div>
  );
}

// Simple and Blog layouts extracted to separate components
