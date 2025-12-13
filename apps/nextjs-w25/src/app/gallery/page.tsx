import React from 'react';
import { safeFetch } from '@/sanity/safeFetch';
import { groq } from 'next-sanity';
import { ArtworkData } from '@/types';
import ImmersiveGalleryWrapper from '@/components/gallery/ImmersiveGalleryWrapper';

// Query to fetch artworks with dimensions
const GALLERY_QUERY = groq`
  *[_type == "artwork" && defined(mainImage.asset) && (category->title match "Painting*" || fieldOfArt->title match "Painting*")] {
    _id,
    title,
    "imageUrl": mainImage.asset->url,
    "artist": artist->name,
    year,
    technique,
    "aspectRatio": mainImage.asset->metadata.dimensions.aspectRatio,
    "size": size,
    description
  }
`;

// Helper to parse size string like "30 x 40 cm" or "100x100"
const parseDimensions = (sizeStr: string | undefined, aspectRatio: number): { width: number, height: number } => {
  // Default base size
  const DEFAULT_HEIGHT = 100;

  if (!sizeStr) {
    return { height: DEFAULT_HEIGHT, width: DEFAULT_HEIGHT * (aspectRatio || 1) };
  }

  // Remove "cm" and other non-digit/x chars (keep dots for decimals)
  const cleanStr = sizeStr.toLowerCase().replace(/cm/g, '').replace(/,/g, '.').trim();
  const parts = cleanStr.split('x').map(s => parseFloat(s.trim()));

  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    // Assume Width x Height from string
    const parsedWidth = parts[0];
    const parsedHeight = parts[1];

    // If we have the real image aspect ratio, use it to ensure the texture isn't stretched.
    // We use the parsed height as the scale reference.
    if (aspectRatio) {
      return { width: parsedHeight * aspectRatio, height: parsedHeight };
    }

    return { width: parsedWidth, height: parsedHeight };
  }

  return { height: DEFAULT_HEIGHT, width: DEFAULT_HEIGHT * (aspectRatio || 1) };
};

// This is the parent component that sets the viewport size.
export default async function GalleryPage() {
  // Fetch data on the server
  const rawArtworks = await safeFetch<any[]>(GALLERY_QUERY, {});

  const validArtworks: ArtworkData[] = (rawArtworks || []).map((art) => ({
    _id: art._id,
    title: art.title || 'Untitled',
    imageUrl: art.imageUrl,
    artist: art.artist || 'Unknown Artist',
    year: art.year ? parseInt(art.year) : new Date().getFullYear(),
    technique: art.technique || 'Mixed Media',
    dimensions: parseDimensions(art.size, art.aspectRatio),
    description: art.description || ''
  }));

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ImmersiveGalleryWrapper initialArtworkData={validArtworks} />
    </div>
  );
}