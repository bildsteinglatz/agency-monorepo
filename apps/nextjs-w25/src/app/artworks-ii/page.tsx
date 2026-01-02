import { Metadata } from 'next';
import { Suspense } from 'react';
import { client } from '@/sanity/client';
import { ARTWORKS_II_QUERY } from '@/sanity/queries';
import { ArtworksIIClient } from '@/components/artworks/ArtworksIIClient';

export const metadata: Metadata = {
    title: 'Archive | Bildstein/Glatz',
    description: 'Browse the artist archive with hybrid gallery view.',
};

export interface WorkItem {
    _id: string;
    title?: string;
    year?: number;
    size?: string;
    technique?: string;
    category?: string;
    categoryId?: string;
    bodyOfWork?: { _id: string; title: string };
    mainImage?: {
        alt: string | undefined;
        asset?: any;
        title?: string;
        year?: number;
        size?: string;
        technique?: string;
        exhibitions?: Array<{ _id: string; title: string }>;
        literature?: Array<{ _id: string; title: string }>;
        content?: any[];
    };
    gallery?: Array<{
        asset?: any;
        alt?: string;
        caption?: string;
        // Metadata for grouped works
        title?: string;
        year?: number;
        size?: string;
        technique?: string;
        exhibitions?: Array<{ _id: string; title: string }>;
        literature?: Array<{ _id: string; title: string }>;
        content?: any[];
    }>;
    content?: any[];
    exhibitions?: Array<{ _id: string; title: string }>;
    literature?: Array<{ _id: string; title: string }>;
    vimeoUrl?: string;
    vimeoVideo?: { vimeoUrl?: string };
    slug?: { current?: string };
}

export default async function ArtworksIIPage() {
    let rawWorks: WorkItem[] = [];

    try {
        rawWorks = await client.fetch<WorkItem[]>(ARTWORKS_II_QUERY);
    } catch (error) {
        console.error('Failed to fetch artworks:', error);
    }

    // Map categories and filter out unwanted ones
    rawWorks = rawWorks.map(w => {
        let cat = w.category || '';
        const lowerCat = cat.toLowerCase().trim();
        
        // Normalize "Digital Painting" and "Digital" to "Painting"
        if (lowerCat === 'digital painting' || lowerCat === 'digital' || lowerCat === 'painting') {
            cat = 'Painting';
        } 
        // Normalize "Book" to "Print"
        else if (lowerCat === 'book' || lowerCat === 'print') {
            cat = 'Print';
        }
        else if (cat) {
            // Capitalize first letter of other categories for consistency
            cat = cat.charAt(0).toUpperCase() + cat.slice(1);
        }
        
        return { ...w, category: cat };
    }).filter(w => {
        const cat = w.category?.toLowerCase().trim();
        return cat !== 'test' && cat !== '';
    });

    // Group works by bodyOfWork if it exists
    const groupedMap = new Map<string, WorkItem>();

    rawWorks.forEach((work) => {
        if (work.bodyOfWork?._id) {
            const bodyId = work.bodyOfWork._id;
            if (groupedMap.has(bodyId)) {
                const existing = groupedMap.get(bodyId)!;
                const newGallery = [...(existing.gallery || [])];

                // Helper to check if asset is already in gallery
                const hasAsset = (asset: any) => {
                    const id = asset?._id || asset?._ref;
                    return newGallery.some(item => (item.asset?._id || item.asset?._ref) === id);
                };

                // Add main image if it exists and isn't already there
                if (work.mainImage?.asset && !hasAsset(work.mainImage.asset)) {
                    newGallery.push({
                        ...work.mainImage,
                        title: work.title,
                        year: work.year,
                        size: work.size,
                        technique: work.technique,
                        exhibitions: work.exhibitions,
                        literature: work.literature,
                        content: work.content
                    });
                }

                // Add gallery items that aren't already there
                if (work.gallery && work.gallery.length > 0) {
                    work.gallery.forEach(item => {
                        if (item.asset && !hasAsset(item.asset)) {
                            newGallery.push({
                                ...item,
                                title: work.title,
                                year: work.year,
                                size: work.size,
                                technique: work.technique,
                                exhibitions: work.exhibitions,
                                literature: work.literature,
                                content: work.content
                            });
                        }
                    });
                }

                existing.gallery = newGallery;
            } else {
                // Initialize group with this artwork's data
                const newGroup = { ...work };
                newGroup.title = work.bodyOfWork.title;
                newGroup._id = bodyId;

                // Start gallery with unique items from main image + gallery
                const initialGallery: any[] = [];
                const seenAssetIds = new Set<string>();

                const addUnique = (item: any) => {
                    const id = item?.asset?._id || item?.asset?._ref;
                    if (id && !seenAssetIds.has(id)) {
                        initialGallery.push({
                            ...item,
                            title: work.title,
                            year: work.year,
                            size: work.size,
                            technique: work.technique,
                            exhibitions: work.exhibitions,
                            literature: work.literature,
                            content: work.content
                        });
                        seenAssetIds.add(id);
                    }
                };

                addUnique(work.mainImage);
                if (work.gallery) {
                    work.gallery.forEach(addUnique);
                }
                newGroup.gallery = initialGallery;

                groupedMap.set(bodyId, newGroup);
            }
        }
    });

    // Combine grouped and individual works, preserving original list order
    const works: WorkItem[] = [];
    const seenGroups = new Set<string>();

    rawWorks.forEach((w) => {
        if (w.bodyOfWork?._id) {
            if (!seenGroups.has(w.bodyOfWork._id)) {
                works.push(groupedMap.get(w.bodyOfWork._id)!);
                seenGroups.add(w.bodyOfWork._id);
            }
        } else {
            works.push(w);
        }
    });

    // Extract unique categories from the data
    const categories = Array.from(
        new Set(works.map((w) => w.category).filter(Boolean))
    ) as string[];

    return (
        <div className="min-h-screen">
            <Suspense fallback={null}>
                <ArtworksIIClient works={works} categories={categories} />
            </Suspense>
        </div>
    );
}
