'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCollection } from '@/context/CollectionContext';
import { client } from '@/sanity/client';
import { ArtworkCardEnhanced } from '@/components/artworks/ArtworkCardEnhanced';
import { ArrowLeft, LayoutGrid, List, FileText, Download, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  SortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PortfolioPdfGenerator from '@/components/collection/PortfolioPdfGenerator';
import Image from 'next/image';
import { urlFor } from '@/sanity/imageBuilder';

const COLLECTION_QUERY = `*[(_type == "artwork" || _type == "textDocument" || _type == "exhibition") && _id in $ids] {
  _id,
  _type,
  title,
  year,
  technique,
  size,
  edition,
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
  "excerpt": textContent,
  // Exhibition fields
  startDate,
  endDate,
  venue-> {
    name,
    city,
    country
  }
}`;

export default function CollectionPage() {
  const {
    collection,
    loading: collectionLoading,
    updateCollectionOrder,
    portfolio,
    addToPortfolio,
    removeFromPortfolio,
    isInPortfolio
  } = useCollection();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchItems = async () => {
      if (collection.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const data = await client.fetch(COLLECTION_QUERY, { ids: collection });
        // Maintain the order from the collection array (from Firestore)
        const orderedData = collection
          .map(id => data.find((item: any) => item._id === id))
          .filter(Boolean);
        setItems(orderedData);
      } catch (error) {
        console.error("Error fetching collection items:", error);
      }
      setLoading(false);
    };

    if (!collectionLoading) {
      fetchItems();
    }
  }, [collection, collectionLoading]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item._id === active.id);
        const newIndex = currentItems.findIndex((item) => item._id === over.id);
        const newOrder = arrayMove(currentItems, oldIndex, newIndex);

        // Update Firestore
        updateCollectionOrder(newOrder.map(item => item._id));

        return newOrder;
      });
    }
  };

  const portfolioItems = useMemo(() => {
    return items.filter(item => portfolio.includes(item._id));
  }, [items, portfolio]);

  if (collectionLoading || loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="animate-pulse font-owners font-black italic text-xl uppercase">Loading Collection Beta...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen pt-24 px-4 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <Link href="/user-settings" className="flex items-center gap-2 text-sm uppercase font-bold opacity-50 hover:opacity-100 mb-4 transition-opacity">
            <ArrowLeft size={16} /> Back to Control Room Beta
          </Link>
          <h1 className="font-owners font-black italic text-4xl uppercase">My Collection Beta</h1>
        </div>

        <div className="flex items-center gap-6 self-end">
          {/* Layout Toggle */}
          <div className="flex border border-foreground font-owners font-bold uppercase text-[10px]">
            <button
              onClick={() => setLayout('grid')}
              className={`px-3 py-2 flex items-center gap-2 transition-colors ${layout === 'grid' ? 'bg-foreground text-background' : 'hover:bg-foreground/5'}`}
            >
              <LayoutGrid size={12} /> Grid
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`px-3 py-2 border-l border-foreground flex items-center gap-2 transition-colors ${layout === 'list' ? 'bg-foreground text-background' : 'hover:bg-foreground/5'}`}
            >
              <List size={12} /> List
            </button>
          </div>

          <PortfolioPdfGenerator
            items={portfolioItems}
            label={`Export Portfolio (${portfolio.length})`}
            className="text-[10px]"
          />
        </div>
      </div>

      {items.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(i => i._id)}
            strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'flex flex-col gap-4'}>
              {items.map((item) => (
                <SortableItem key={item._id} id={item._id}>
                  {layout === 'grid' ? (
                    <CollectionGridItem
                      item={item}
                      isInPortfolio={isInPortfolio(item._id)}
                      togglePortfolio={() => isInPortfolio(item._id) ? removeFromPortfolio(item._id) : addToPortfolio(item._id)}
                    />
                  ) : (
                    <CollectionListItem
                      item={item}
                      isInPortfolio={isInPortfolio(item._id)}
                      togglePortfolio={() => isInPortfolio(item._id) ? removeFromPortfolio(item._id) : addToPortfolio(item._id)}
                    />
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-24 border border-foreground border-dashed opacity-50 font-owners uppercase">
          <p className="font-bold text-xl mb-4 italic">Your vault is currently empty.</p>
          <div className="flex justify-center gap-4 text-xs">
            <Link href="/artworks-ii" className="hover:text-neon-orange underline">Browse Artworks</Link>
            <span>/</span>
            <Link href="/texts" className="hover:text-neon-orange underline">Read Texts</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper ---
function getSlugOrId(item: any): string {
  if (typeof item.slug === 'string') return item.slug;
  if (item.slug?.current) return item.slug.current;
  return item._id; // Fallback to ID if slug is missing
}

// --- Internal Components ---

function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </div>
      {children}
    </div>
  );
}

function CollectionGridItem({ item, isInPortfolio, togglePortfolio }: { item: any, isInPortfolio: boolean, togglePortfolio: () => void }) {
  const isArtwork = item._type === 'artwork';
  const isExhibition = item._type === 'exhibition';

  return (
    <div className="border border-foreground/10 bg-background hover:border-foreground/30 transition-all flex flex-col h-full relative">
      {/* Portfolio Selection Button */}
      <button
        onClick={(e) => { e.preventDefault(); togglePortfolio(); }}
        className="absolute top-2 right-2 z-20 p-2 rounded-full transition-all hover:scale-110"
        title={isInPortfolio ? "Remove from Portfolio" : "Add to Portfolio"}
      >
        {isInPortfolio ? (
          <CheckCircle2 size={24} className="text-neon-orange fill-white" />
        ) : (
          <Circle size={24} className="text-foreground/20 hover:text-foreground/50 bg-white/50 backdrop-blur-sm rounded-full" />
        )}
      </button>

      {isArtwork && <ArtworkCardEnhanced artwork={item} showHover={false} />}
      {isExhibition && <CollectedExhibitionCard exhibition={item} />}
      {!isArtwork && !isExhibition && <CollectedTextCard text={item} />}

      {/* Extra Detail Row for Artist Cards Requirement */}
      {isArtwork && (
        <div className="px-4 pb-4 mt-[-10px] space-y-1">
          {item.technique && <p className="text-[10px] uppercase font-bold opacity-60 leading-tight">{item.technique}</p>}
          {item.size && <p className="text-[10px] uppercase font-mono opacity-50">{item.size}</p>}
        </div>
      )}
    </div>
  );
}

function CollectionListItem({ item, isInPortfolio, togglePortfolio }: { item: any, isInPortfolio: boolean, togglePortfolio: () => void }) {
  const isArtwork = item._type === 'artwork';
  const isExhibition = item._type === 'exhibition';
  const imageUrl = (isArtwork || isExhibition)
    ? (item.mainImage?.asset ? urlFor(item.mainImage.asset).width(200).height(200).url() : null)
    : null;

  const itemSlug = getSlugOrId(item);
  let href = `/texts/${itemSlug}`; // Default for text

  if (isArtwork) href = `/artworks/${itemSlug}`;
  else if (isExhibition) href = `/exhibitions/${itemSlug}`;

  return (
    <div className="flex items-center gap-4 p-4 border border-foreground/10 hover:border-foreground/30 transition-all bg-background group/list">
      <div className="w-16 h-16 relative bg-foreground/5 shrink-0">
        {imageUrl ? (
          <Image src={imageUrl} alt={item.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            {isArtwork && <LayoutGrid size={24} />}
            {isExhibition && <LayoutGrid size={24} />}
            {!isArtwork && !isExhibition && <FileText size={24} />}
          </div>
        )}
      </div>

      <div className="flex-grow min-w-0">
        <h4 className="font-owners font-black italic text-lg uppercase truncate leading-tight">{item.title}</h4>
        <div className="flex gap-3 text-[10px] uppercase font-bold opacity-60">
          <span>{item.artist?.name || 'Bildstein | Glatz'}</span>
          <span>•</span>
          <span>{item.year || (item.startDate ? new Date(item.startDate).getFullYear() : 'n.d.')}</span>
          {isArtwork && item.technique && (
            <>
              <span>•</span>
              <span className="truncate max-w-[200px]">{item.technique}</span>
            </>
          )}
          {isExhibition && item.venue && (
             <>
               <span>•</span>
               <span className="truncate max-w-[200px]">{item.venue.name}</span>
             </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={togglePortfolio}
          className={`p-2 transition-all ${isInPortfolio ? 'text-neon-orange' : 'text-foreground/20 hover:text-foreground/50'}`}
        >
          <CheckCircle2 size={24} />
        </button>
        <Link href={href} className="p-2 opacity-30 hover:opacity-100 transition-opacity">
          <ArrowLeft size={18} className="rotate-180" />
        </Link>
      </div>
    </div>
  );
}

function CollectedExhibitionCard({ exhibition }: { exhibition: any }) {
  const slug = getSlugOrId(exhibition);
  const imageUrl = exhibition.mainImage?.asset ? urlFor(exhibition.mainImage.asset).width(600).url() : null;

  return (
    <Link
      href={`/exhibitions/${slug}`}
      className="group/card block h-full flex flex-col bg-background hover:bg-black/5 transition-all"
    >
      <div className="relative aspect-[4/3] w-full bg-foreground/5 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={exhibition.title}
            fill
            className="object-cover transition-transform duration-700 group-hover/card:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <LayoutGrid size={48} strokeWidth={1} />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="font-owners text-[10px] uppercase font-black italic opacity-50 mb-2">Exhibition</div>
        <h3 className="font-owners font-black italic text-xl uppercase mb-1 leading-tight group-hover/card:text-neon-orange transition-colors">
          {exhibition.title}
        </h3>
        {exhibition.venue && (
          <div className="text-xs font-bold uppercase opacity-70 mb-4">
            {exhibition.venue.name} {exhibition.venue.city && `, ${exhibition.venue.city}`}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>{exhibition.startDate ? new Date(exhibition.startDate).getFullYear() : 'N/A'}</span>
          <span className="group-hover/card:translate-x-1 transition-transform">View Show →</span>
        </div>
      </div>
    </Link>
  );
}

function CollectedTextCard({ text }: { text: any }) {
  const slug = getSlugOrId(text);
  return (
    <Link
      href={`/texts/${slug}`}
      className="group/card block h-full p-6 hover:bg-black/5 transition-all"
    >
      <div className="flex flex-col h-full min-h-[300px]">
        <div className="font-owners text-[10px] uppercase font-black italic opacity-50 mb-2">Selected Text</div>
        <h3 className="font-owners font-black italic text-2xl uppercase mb-2 group-hover/card:text-neon-orange transition-colors leading-tight">
          {text.title}
        </h3>
        {text.author && (
          <div className="text-sm font-owners italic mb-4 opacity-70">by {text.author}</div>
        )}
        {text.excerpt && (
          <p className="text-[12px] leading-relaxed line-clamp-4 opacity-80 mb-6 font-medium">
            {text.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span>{text.publishedAt ? new Date(text.publishedAt).getFullYear() : 'N/A'}</span>
          <span className="group-hover/card:translate-x-1 transition-transform">Read Protocol →</span>
        </div>
      </div>
    </Link>
  );
}
