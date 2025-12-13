import { safeFetch } from '@/sanity/safeFetch'
import { INTRO_SLIDES_QUERY, SELECTED_ARTWORKS_QUERY } from '@/sanity/queries'
import { HomeClient } from '@/components/HomeClient'
import { client } from '@/sanity/client'

export const metadata = {
    title: "Bildstein | Glatz",
    description: "Contemporary art by the Austrian-Swiss artist duo Bildstein | Glatz.",
};

export default async function HomePage() {
    // Fetch Intro Slides and Selected Artworks
    const [introSlidesData, selectedArtworksData] = await Promise.all([
        safeFetch<any[]>(INTRO_SLIDES_QUERY),
        client.fetch(SELECTED_ARTWORKS_QUERY)
    ])

    const introSlides = introSlidesData || []
    const selectedArtworks = selectedArtworksData || []

    return (
        <main className="min-h-screen bg-background">
            <HomeClient
                introSlides={introSlides}
                selectedArtworks={selectedArtworks}
            />
        </main>
    );
}
