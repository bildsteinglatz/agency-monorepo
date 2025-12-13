import { safeFetch } from '@/sanity/safeFetch'
import { TEXTS_QUERY, SELECTED_ARTWORKS_QUERY, ARTWORK_FILTER_OPTIONS_QUERY, EXHIBITIONS_QUERY, PUBLICATIONS_QUERY } from '@/sanity/queries'
import { HudInterface } from '@/components/hud/HudInterface'
import { client } from '@/sanity/client'

export const metadata = {
    title: "HUD | Bildstein | Glatz",
    description: "System Interface",
};

export default async function HudPage() {
    // Fetch all data in parallel
    const [texts, artworks, filterOptions, exhibitions, publications] = await Promise.all([
        safeFetch(TEXTS_QUERY, { start: 0, end: 20 }),
        client.fetch(SELECTED_ARTWORKS_QUERY),
        safeFetch(ARTWORK_FILTER_OPTIONS_QUERY),
        safeFetch(EXHIBITIONS_QUERY, { start: 0, end: 100 }),
        safeFetch(PUBLICATIONS_QUERY)
    ]);

    return (
        <main className="w-full h-screen bg-black overflow-hidden">
            <HudInterface 
                texts={Array.isArray(texts) ? texts : []} 
                artworks={Array.isArray(artworks) ? artworks : []}
                categories={filterOptions || {}}
                exhibitions={Array.isArray(exhibitions) ? exhibitions : []}
                publications={Array.isArray(publications) ? publications : []}
            />
        </main>
    );
}
