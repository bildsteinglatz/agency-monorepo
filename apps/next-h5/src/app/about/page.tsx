import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
    const data = await client.fetch(`*[_id == "aboutPage"][0]{ seo }`);
    return generatePageMetadata(
        data?.seo,
        "Über uns | Halle 5",
        "Erfahre mehr über die Adlassnigg KG und den Kulturverein Halle 5."
    );
}

const components = {
    block: {
        h3: ({ children }: any) => <h3 className="text-xl font-black uppercase mb-4 mt-8">{children}</h3>,
        normal: ({ children }: any) => <p className="mb-4">{children}</p>,
    },
};

export default async function AboutPage() {
    let data = null;
    let fundingPartners = [];
    let projectPartners = [];

    try {
        data = await client.fetch(`*[_id == "aboutPage" && showOnWebsite != false][0]`, {}, { next: { revalidate: 0 } });
        fundingPartners = await client.fetch(`*[_type == "fundingPartner" && showOnWebsite != false] | order(title asc)`, {}, { next: { revalidate: 0 } });
        projectPartners = await client.fetch(`*[_type == "projectPartner" && showOnWebsite != false] | order(title asc)`, {}, { next: { revalidate: 0 } });
    } catch (error) {
        console.error("Error fetching about page data:", error);
    }

    if (!data || !data.adlassniggKG) {
        return (
            <main className="min-h-screen bg-white text-black p-12 flex items-center justify-center font-black uppercase text-center">
                <div className="border-8 border-black p-20 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)]">
                    <h1 className="text-7xl mb-8 leading-none">Über uns</h1>
                    <p className="text-2xl">Lade Daten...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white text-black font-black uppercase">
            {/* Hero Section */}
            <section className="bg-black text-white p-12 md:p-24 border-b-8 border-black">
                <h1 className="text-4xl md:text-6xl leading-none tracking-tighter">
                    {data.title}
                </h1>
            </section>

            {/* Adlassnigg KG & Kulturverein */}
            <section id="about-sections" className="grid md:grid-cols-2 border-b-8 border-black bg-white">
                {/* Adlassnigg KG */}
                <div id="adlassnigg" className="p-8 md:p-16 border-b-8 md:border-b-0 md:border-r-8 border-black flex flex-col justify-between bg-yellow-50">
                    <div>
                        <div className="inline-block bg-yellow-400 border-2 border-black px-4 py-1 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-black uppercase tracking-widest">
                            Professional Partner
                        </div>
                        <h2 className="text-2xl md:text-3xl mb-10 tracking-tighter leading-none">{data.adlassniggKG?.title}</h2>
                        <div className="text-xl md:text-2xl leading-snug mb-12 normal-case font-bold text-black">
                            <PortableText value={data.adlassniggKG?.text} components={components} />
                        </div>
                    </div>
                    
                    {data.adlassniggKG?.email && (
                        <div className="group relative">
                            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></div>
                            <div className="relative bg-yellow-400 border-4 border-black p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <p className="text-xs font-black uppercase mb-1 text-black">Projektanfragen & Kooperationen</p>
                                    <p className="text-2xl md:text-3xl font-black break-all">{data.adlassniggKG.email}</p>
                                </div>
                                <a 
                                    href={`mailto:${data.adlassniggKG.email}`} 
                                    className="bg-black text-white px-8 py-4 font-black uppercase hover:bg-white hover:text-black transition-all border-2 border-black whitespace-nowrap"
                                >
                                    Schreiben Sie uns
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Kulturverein Halle 5 */}
                <div id="kulturverein" className="p-8 md:p-16 flex flex-col justify-between bg-blue-50">
                    <div>
                        <div className="inline-block bg-[#02eefa] border-2 border-black px-4 py-1 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-black uppercase tracking-widest">
                            Community & Social
                        </div>
                        <h2 className="text-2xl md:text-3xl mb-10 tracking-tighter leading-none">{data.kulturvereinHalle5?.title}</h2>
                        <div className="text-xl md:text-2xl leading-snug mb-12 normal-case font-bold text-black">
                            <PortableText value={data.kulturvereinHalle5?.text} components={components} />
                        </div>
                    </div>

                    {data.kulturvereinHalle5?.email && (
                        <div className="group relative">
                            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></div>
                            <div className="relative bg-[#02eefa] border-4 border-black p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <p className="text-xs font-black uppercase mb-1 text-black">Vereinsangelegenheiten & Pinguin</p>
                                    <p className="text-2xl md:text-3xl font-black break-all">{data.kulturvereinHalle5.email}</p>
                                </div>
                                <a 
                                    href={`mailto:${data.kulturvereinHalle5.email}`} 
                                    className="bg-black text-white px-8 py-4 font-black uppercase hover:bg-white hover:text-black transition-all border-2 border-black whitespace-nowrap"
                                >
                                    Kontakt aufnehmen
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action to Partners Page */}
            <section className="p-8 md:p-24 bg-yellow-400 border-t-8 border-black text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase mb-8">Unsere Partner & Fördergeber</h2>
                <p className="text-xl md:text-2xl font-bold mb-12 max-w-2xl mx-auto">
                    Unsere Arbeit wird durch die großzügige Unterstützung öffentlicher und privater Partner ermöglicht.
                </p>
                <Link 
                    href="/partners" 
                    className="inline-block bg-black text-white px-12 py-6 text-xl font-black uppercase hover:bg-white hover:text-black transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                    Alle Partner ansehen
                </Link>
            </section>
        </main>
    );
}
