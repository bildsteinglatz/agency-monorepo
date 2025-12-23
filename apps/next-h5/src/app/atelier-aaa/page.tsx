import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import ScrollIndicator from "@/components/ScrollIndicator";
import BrutalistGalleryStack from "@/components/BrutalistGalleryStack";
import AtelierReferences from "@/components/AtelierReferences";
import AtelierAaaClient from "@/components/AtelierAaaClient";

export default async function Page() {
    let data = null;
    let rolandData = null;
    try {
        [data, rolandData] = await Promise.all([
            client.fetch(`*[_id == "atelierAAA" && showOnWebsite != false][0]{
                ...,
                "institutions": institutions[@->showOnWebsite != false]->{
                    _id,
                    name,
                    "description": description,
                    "gallery": gallery,
                    website
                },
                "artists": artists[@->showOnWebsite != false]->{
                    _id,
                    name,
                    description,
                    gallery,
                    website
                }
            }`),
            client.fetch(`*[_id == "rolandAdlassnigg" && showOnWebsite != false][0]{
                title,
                bio
            }`)
        ]);
    } catch (error) {
        console.error("BUILD ERROR in /atelier-aaa fetch:", error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-black text-white p-12 flex items-center justify-center font-black uppercase text-center">
                <div className="border-8 border-yellow-400 p-20 shadow-[24px_24px_0px_0px_rgba(253,224,71,1)]">
                    <h1 className="text-7xl mb-8 leading-none">Atelier für<br />Aussergewöhliche<br />Angelegenheiten</h1>
                    <p className="text-2xl text-yellow-400">Professional Art Production Services.</p>
                </div>
            </main>
        );
    }

    // Combine all gallery images
    const allGalleryImages = data.gallery || [];

    // Custom components for PortableText to ensure classes apply to nested elements
    const ptComponents = {
        block: {
            normal: ({ children }: any) => <p className="mb-4 text-black">{children}</p>,
            h3: ({ children }: any) => <h3 className="text-2xl md:text-4xl font-black uppercase mt-10 mb-4">{children}</h3>,
        },
        list: {
            bullet: ({ children }: any) => <ul className="list-disc pl-8 mb-4 space-y-1">{children}</ul>,
        },
        marks: {
            strong: ({ children }: any) => <strong className="font-black">{children}</strong>,
        }
    };

    const ptComponentsBottom = {
        block: {
            normal: ({ children }: any) => <p className="m-0">{children}</p>,
        },
    };

    return (
        <main className="relative font-black">
            {/* Fixed Hero Background - Stays perfectly still */}
            <section className="fixed top-0 left-0 w-full h-[70vh] md:h-[90vh] bg-black text-white flex flex-col md:flex-row z-0 overflow-hidden text-white uppercase">
                <div className="flex-1 p-8 flex flex-col justify-end pb-12 md:pb-24 text-white">
                    <h1 className="text-5xl md:text-7xl leading-none mb-5 tracking-tighter text-white">
                        {data.title}
                    </h1>
                    {data.heroText && (
                        <p className="text-xl md:text-3xl text-yellow-400 max-w-2xl leading-none">
                            {data.heroText}
                        </p>
                    )}
                </div>
                {data.heroImage && (
                    <div className="flex-1 relative bg-gray-900 border-t-8 md:border-t-0 md:border-l-8 border-black">
                        <Image
                            src={urlFor(data.heroImage).url()}
                            alt={data.title}
                            fill
                            className="object-cover opacity-70"
                            priority
                        />
                    </div>
                )}
                <ScrollIndicator variant="light" />
            </section>

            {/* Spacer to allow scrolling past the fixed hero */}
            <div className="h-[70vh] md:h-[90vh]" />

            {/* Slide-over Content Wrapper - z-index 60 covers Navigation (50) */}
            <div className="relative z-[60] bg-white shadow-[0_-20px_100px_rgba(0,0,0,0.8)] border-t-8 border-black text-black">
                {/* Content Section 1 */}
                <section className="py-20 px-8 md:px-8 grid md:grid-cols-2 gap-18 items-start">
                    <div className="md:text-2xl leading-[1.1] tracking-tighter space-y-6 text-black">
                        <PortableText value={data.contentBlock1} components={ptComponents} />
                        <div className="pt-4">
                            <a
                                href="mailto:roland@halle5.at"
                                className="inline-block bg-black text-white px-8 py-4 text-xl md:text-2xl hover:bg-[#FF3100] transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] border-4 border-black uppercase"
                            >
                                Jetzt per Mail anfragen
                            </a>
                        </div>
                    </div>
                    
                    {allGalleryImages.length > 0 && (
                        <div className="p-0">
                            <BrutalistGalleryStack images={allGalleryImages} />
                        </div>
                    )}
                </section>

                {/* Content Section 2 - Main Content (Bottom) */}
                {data.contentBlock2 && (
                    <section className="py-20 px-8 md:px-8 border-t-8 border-black bg-yellow-400">
                        <div className="max-w-5xl mx-auto text-3xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tighter text-black">
                            <PortableText value={data.contentBlock2} components={ptComponentsBottom} />
                        </div>
                    </section>
                )}

                {/* Roland Adlassnigg Bio Trigger */}
                <AtelierAaaClient rolandData={rolandData} />

                {/* Institutions & Artists Section */}
                {data.institutions?.length > 0 && (
                    <AtelierReferences 
                        items={data.institutions} 
                        title="Referenzen (Institutionen):" 
                        bgColor="bg-yellow-400"
                        accentColor="bg-white"
                    />
                )}

                {data.artists?.length > 0 && (
                    <AtelierReferences 
                        items={data.artists} 
                        title="Referenzen (Künstler:innen):" 
                        bgColor="bg-[#02eefa]"
                        accentColor="bg-white"
                    />
                )}

                {/* CTA Section - Moved to bottom */}
                <section className="bg-[#FF3100] text-white p-12 text-center border-t-8 border-black mt-20 uppercase">
                    <h2 className="text-5xl md:text-7xl mb-12 tracking-tighter text-white">Bereit für etwas Aussergewöhnliches?</h2>
                    <a
                        href="mailto:roland@halle5.at"
                        className="inline-block bg-white text-black px-12 py-6 text-3xl hover:bg-black hover:text-white transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-[-4px] active:translate-y-0 border-4 border-black"
                    >
                        Projekt anfragen
                    </a>
                </section>


            </div>

        </main>
    );
}
