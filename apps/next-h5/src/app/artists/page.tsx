import { client } from "@/sanity/client";
import ArtistsList from "@/components/ArtistsList";
import groq from "groq";

export default async function Page() {
    // Fetch on the server to avoid CORS issues and for better performance
    const query = groq`*[_type == "artist"] | order(name asc)`;
    let artists = [];
    try {
        artists = await client.fetch(query);
    } catch (error) {
        console.error("BUILD ERROR in /artists fetch:", error);
    }

    return (
        <main className="min-h-screen bg-[#004d4d] text-white p-8 md:p-12 lg:p-20">
            <ArtistsList initialArtists={artists} />
        </main>
    );
}
