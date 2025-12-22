import { client } from "@/sanity/client";
import { PortableText } from "@portabletext/react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ImprintPage() {
    let imprintData = null;
    try {
        imprintData = await client.fetch(`*[_type == "imprint"][0]`, {}, { next: { revalidate: 0 } });
    } catch (error) {
        console.error("Error fetching imprint data:", error);
    }

    if (!imprintData) {
        return (
            <main className="min-h-screen bg-white text-black p-12 flex items-center justify-center font-black uppercase text-center">
                <div className="border-8 border-black p-20 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)]">
                    <h1 className="text-7xl mb-8 leading-none">Impressum</h1>
                    <p className="text-2xl">Lade Daten...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white text-black font-black uppercase">
            <section className="bg-black text-white p-12 md:p-24 border-b-8 border-black">
                <h1 className="text-4xl md:text-6xl leading-none tracking-tighter">
                    {imprintData.title}
                </h1>
            </section>

            <section className="p-8 md:p-24 max-w-4xl mx-auto normal-case font-bold text-xl md:text-2xl leading-tight">
                <PortableText value={imprintData.content} />
            </section>
        </main>
    );
}
