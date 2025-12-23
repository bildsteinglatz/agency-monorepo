import { client } from "@/sanity/client";
import { PinguinHero } from "@/components/pinguin/PinguinHero";
import { PinguinContent } from "@/components/pinguin/PinguinContent";

export const revalidate = 60;

export default async function PinguinPage() {
    let data = null;
    try {
        const pinguinData = await client.fetch(`
            *[_id == "pinguin" && showOnWebsite != false][0] {
                title,
                slug,
                seoDescription,
                youtubeId,
                heroSubtitle,
                introduction,
                featureBlocks[] {
                    title,
                    navLabel,
                    description,
                    colorHex,
                    layoutType
                },
                schedule,
                gallery[] {
                    asset,
                    alt
                }
            }
        `);

        const teamData = await client.fetch(`
            *[_type == "pinguinteam" && showOnWebsite != false] | order(name asc) {
                _id,
                name,
                role,
                image,
                bio,
                email
            }
        `);

        if (pinguinData) {
            data = { ...pinguinData, team: teamData };
        }
    } catch (error) {
        console.error("BUILD ERROR in /pinguin fetch:", error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-white text-black flex items-center justify-center p-8">
                <div className="max-w-2xl text-center">
                    <h1 className="text-6xl font-black uppercase tracking-tighter mb-8 border-b-8 border-black pb-4">
                        Pinguin
                    </h1>
                    <p className="text-2xl font-bold uppercase">
                        Offenes Atelier – Daten werden geladen...
                    </p>
                </div>
            </main>
        );
    }

    // Serialize data to ensure proper passing to Client Components
    const serializedData = JSON.parse(JSON.stringify(data));

    return (
        <>
            <PinguinHero 
                title={serializedData.title}
                subtitle={serializedData.heroSubtitle}
                youtubeId={serializedData.youtubeId}
            />
            {/* Spacer to allow scrolling past the fixed hero */}
            <div className="h-screen" />
            <PinguinContent data={serializedData} />
        </>
    );
}
