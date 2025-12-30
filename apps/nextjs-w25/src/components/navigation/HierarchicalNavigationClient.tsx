'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Category {
  _id: string;
  title: string;
  slug: string;
  hasChildren: boolean;
  artworkCount: number;
}

interface CategoryType {
  _id: string;
  title: string;
  slug: string;
  categories: Category[];
}

interface Props {
  structure: CategoryType[];
}

export function HierarchicalNavigationClient({ structure }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // State for expanded sections
  const [expandedType, setExpandedType] = useState<string | null>(null);

  // Determine active state from URL
  // URL structure: /works/[type]/[category] or /works?type=...&category=...
  // We'll support both, but prefer path-based for SEO if possible, or query params as per current implementation
  
  // Current implementation uses query params: ?layer=fieldOfArt&fieldOfArt=painting
  
  const currentLayer = searchParams.get('layer') || 'fieldOfArt';
  const currentCategory = searchParams.get(currentLayer);

  useEffect(() => {
    if (currentLayer) {
      // Find the type that matches the layer
      const type = structure.find(t => t.slug === currentLayer);
      if (type) {
        setExpandedType(type._id);
      }
    }
  }, [currentLayer, structure]);

  const toggleType = (typeId: string) => {
    setExpandedType(expandedType === typeId ? null : typeId);
  };

  return (
    <nav className="w-full max-w-xs bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-black">
      <ul className="space-y-2">
        {structure.map((type) => (
          <li key={type._id} className="flex flex-col">
            <button 
              onClick={() => toggleType(type._id)}
              className={`flex items-center justify-between w-full p-2 text-left hover:bg-white rounded transition-colors ${
                expandedType === type._id ? 'font-medium text-black' : 'text-black'
              }`}
            >
              <span>{type.title}</span>
              {expandedType === type._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            <AnimatePresence>
              {expandedType === type._id && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden ml-4 border-l border-black"
                >
                  {type.categories.map((category) => {
                    const isActive = currentCategory === category.slug && currentLayer === type.slug;
                    return (
                      <li key={category._id}>
                        <Link
                          href={`/new-work?layer=${type.slug}&${type.slug}=${category.slug}`}
                          className={`block py-1.5 px-3 text-sm hover:text-black transition-colors flex justify-between items-center ${
                            isActive ? 'text-black font-medium bg-white' : 'text-black'
                          }`}
                        >
                          <span>{category.title}</span>
                          <span className="text-xs text-black">{category.artworkCount}</span>
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </nav>
  );
}
