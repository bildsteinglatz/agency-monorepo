'use client';

import React, { useState, useEffect } from 'react';
import { useCollection } from '@/context/CollectionContext';
import { client } from '@/sanity/client';
import { ArtworkCardEnhanced } from '@/components/artworks/ArtworkCardEnhanced';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const COLLECTION_QUERY = `*[_type == "artwork" && _id in $ids] {
  _id,
  title,
  year,
  serialNumber,
  mainImage {
    asset-> {
      _id,
      url,
      metadata {
        dimensions,
        lqip,
        palette
      }
    },
    alt,
    hotspot,
    crop
  },
  artist-> {
    name,
    "slug": slug.current
  },
  "slug": slug.current
}`;

export default function CollectionPage() {
  const { collection, loading: collectionLoading } = useCollection();
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      if (collection.length === 0) {
        setArtworks([]);
        setLoading(false);
        return;
      }

      try {
        const data = await client.fetch(COLLECTION_QUERY, { ids: collection });
        setArtworks(data);
      } catch (error) {
        console.error("Error fetching collection artworks:", error);
      }
      setLoading(false);
    };

    if (!collectionLoading) {
      fetchArtworks();
    }
  }, [collection, collectionLoading]);

  if (collectionLoading || loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="animate-pulse font-owners font-black italic text-xl uppercase">Loading Collection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/user-settings" className="flex items-center gap-2 text-sm uppercase font-bold opacity-50 hover:opacity-100 mb-4">
          <ArrowLeft size={16} /> Back to Control Room
        </Link>
        <h1 className="font-owners font-black italic text-4xl uppercase">My Collection</h1>
      </div>

      {artworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <ArtworkCardEnhanced key={artwork._id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-foreground opacity-50">
          <p className="uppercase font-bold">Your collection is empty.</p>
          <Link href="/artworks-browse" className="text-neon-orange hover:underline mt-2 inline-block">
            Browse Artworks
          </Link>
        </div>
      )}
    </div>
  );
}
