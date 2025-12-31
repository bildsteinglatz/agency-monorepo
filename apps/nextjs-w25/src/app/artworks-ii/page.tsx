import { Metadata } from 'next';
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
    mainImage?: { asset?: any };
    gallery?: Array<{ asset?: any; alt?: string; caption?: string }>;
    content?: any[];
    slug?: { current?: string };
}

export default async function ArtworksIIPage() {
    let works: WorkItem[] = [];

    try {
        works = await client.fetch<WorkItem[]>(ARTWORKS_II_QUERY);
    } catch (error) {
        console.error('Failed to fetch artworks:', error);
    }

    // Extract unique categories from the data
    const categories = Array.from(
        new Set(works.map((w) => w.category).filter(Boolean))
    ) as string[];

    return (
        <div className="min-h-screen">
            <ArtworksIIClient works={works} categories={categories} />
        </div>
    );
}
