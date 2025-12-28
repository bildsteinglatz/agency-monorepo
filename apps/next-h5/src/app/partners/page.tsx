import { client } from "@/sanity/client";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { PortableText } from "@portabletext/react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PartnersPage() {
    const fundingPartners = await client.fetch(
        `*[_type == "fundingPartner" && showOnWebsite != false]{_id, title, website, logo}`,
        {},
        { next: { revalidate: 0 } }
    );

    const projectPartners = await client.fetch(
        `*[_type == "projectPartner" && showOnWebsite != false]{_id, title, website, logo, text}`,
        {},
        { next: { revalidate: 0 } }
    );

    return (
        <main className="min-h-screen bg-white text-black">
            {/* Hero Section */}
            <section className="bg-black text-white p-12 md:p-24 border-b-8 border-black">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                    Partner & Fördergeber
                </h1>
                <p className="mt-6 text-xl md:text-2xl font-bold max-w-3xl">
                    Unsere Arbeit wird durch die großzügige Unterstützung öffentlicher und privater Partner ermöglicht.
                </p>
            </section>

            {/* Funding Partners Grid */}
            <section className="p-8 md:p-24 border-b-8 border-black bg-white">
                <h2 className="text-3xl md:text-5xl font-black uppercase mb-16 tracking-tight">Fördergeber</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {fundingPartners.map((partner: any) => (
                        <div 
                            key={partner._id} 
                            className="group border-4 border-black p-8 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex flex-col items-center justify-center text-center min-h-[300px]"
                        >
                            {partner.logo ? (
                                <div className="relative w-full aspect-[3/2] mb-8">
                                    <Image 
                                        src={urlFor(partner.logo).width(400).auto('format').url()} 
                                        alt={partner.title} 
                                        fill 
                                        className="object-contain grayscale group-hover:grayscale-0 transition-all"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-[3/2] mb-8 bg-white flex items-center justify-center border-2 border-black border-dashed">
                                    <span className="text-black font-black uppercase">Kein Logo</span>
                                </div>
                            )}
                            
                            <h2 className="text-2xl font-black uppercase mb-4 tracking-tight">
                                {partner.title}
                            </h2>
                            
                            {partner.website && (
                                <a 
                                    href={partner.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-auto inline-block bg-black text-white px-6 py-2 font-black uppercase text-sm hover:bg-[#FF3100] transition-colors"
                                >
                                    Website besuchen
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Project Partners Grid */}
            {projectPartners.length > 0 && (
                <section className="p-8 md:p-24">
                    <h2 className="text-3xl md:text-5xl font-black uppercase mb-16 tracking-tight">Projektpartner</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {projectPartners.map((partner: any) => (
                            <div 
                                key={partner._id} 
                                className="group border-4 border-black p-8 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex flex-col min-h-[300px]"
                            >
                                {partner.logo && (
                                    <div className="relative w-full aspect-[3/2] mb-8">
                                        <Image 
                                            src={urlFor(partner.logo).width(400).auto('format').url()} 
                                            alt={partner.title} 
                                            fill 
                                            className="object-contain grayscale group-hover:grayscale-0 transition-all"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                )}
                                
                                <h2 className="text-2xl font-black uppercase mb-4 tracking-tight">
                                    {partner.title}
                                </h2>
                                
                                {partner.text && (
                                    <div className="text-lg font-bold mb-6 text-black normal-case">
                                        <PortableText value={partner.text} />
                                    </div>
                                )}
                                
                                {partner.website && (
                                    <a 
                                        href={partner.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="mt-auto inline-block bg-black text-white px-6 py-2 font-black uppercase text-sm hover:bg-[#FF3100] transition-colors self-start"
                                    >
                                        Website besuchen
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Call to Action */}
            <section className="p-8 md:p-24 bg-yellow-400 border-t-8 border-black text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase mb-8">Möchten Sie uns unterstützen?</h2>
                <p className="text-xl md:text-2xl font-bold mb-12 max-w-2xl mx-auto">
                    Wir sind immer auf der Suche nach Partnern, die unsere Vision einer lebendigen Kunst- und Kulturszene teilen.
                </p>
                <a 
                    href="mailto:info@halle5.at" 
                    className="inline-block bg-black text-white px-12 py-6 text-xl font-black uppercase hover:bg-white hover:text-black transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                    Kontakt aufnehmen
                </a>
            </section>
        </main>
    );
}
