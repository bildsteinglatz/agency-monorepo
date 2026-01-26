'use client';

import React, { useState, useEffect } from 'react';
import { useCollection } from '@/context/CollectionContext';
import { client } from '@/sanity/client';
import { ArtworkCardEnhanced } from '@/components/artworks/ArtworkCardEnhanced';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const COLLECTION_QUERY = `*[(_type == "artwork" || _type == "text") && _id in $ids] {
  _id,
  _type,
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
  "slug": slug.current,
  // Text fields
  author,
  publishedAt,
  pdfUrl,
  "excerpt": textContent
}`;

export default function CollectionPage() {
  const { collection, loading: collectionLoading } = useCollection();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (collection.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const data = await client.fetch(COLLECTION_QUERY, { ids: collection });
        setItems(data);
      } catch (error) {
        console.error("Error fetching collection items:", error);
      }
      setLoading(false);
    };

    if (!collectionLoading) {
      fetchItems();
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

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            item._type === 'artwork' ? (
              <ArtworkCardEnhanced key={item._id} artwork={item} />
            ) : (
              <CollectedTextCard key={item._id} text={item} />
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-foreground opacity-50">
          <p className="uppercase font-bold">Your collection is empty.</p>
          <Link href="/artworks-ii" className="text-neon-orange hover:underline mt-2 inline-block">
            Browse Artworks
          </Link>
          <span className="mx-2">or</span>
          <Link href="/texts" className="text-neon-orange hover:underline mt-2 inline-block">
            Browse Texts
          </Link>
        </div>
      )}
    </div>
  );
}

function CollectedTextCard({ text }: { text: any }) {
  return (
    <Link
      href={`/texts/${text.slug}`}
      className="group block border border-foreground/10 h-full p-6 hover:bg-black hover:text-white transition-all bg-white"
    >
      <div className="flex flex-col h-full">
        <div className="font-azeret text-[10px] uppercase opacity-50 mb-2">Text</div>
        <h3 className="font-owners font-black italic text-xl uppercase mb-2 group-hover:text-neon-orange transition-colors">
          {text.title}
        </h3>
        {text.author && (
          <div className="text-sm font-owners italic mb-4">by {text.author}</div>
        )}
        {text.excerpt && (
          <p className="text-sm font-lato line-clamp-3 opacity-80 mb-6">
            {text.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between text-[10px] font-azeret uppercase">
          <span>{text.publishedAt ? new Date(text.publishedAt).getFullYear() : 'N/A'}</span>
          <span className="group-hover:translate-x-1 transition-transform">Read More →</span>
        </div>
      </div>
    </Link>
  );
}
