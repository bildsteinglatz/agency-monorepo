import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import ScrollIndicator from "@/components/ScrollIndicator";
import BrutalistGalleryStack from "@/components/BrutalistGalleryStack";

export default async function Page() {
    let data = null;
    try {
        data = await client.fetch(`*[_type == "atelierAAA"][0]`);
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
        },
    };

    return (
        <main className="relative font-black">
            {/* Fixed Hero Background - Stays perfectly still */}
            <section className="fixed top-0 left-0 w-full h-[80vh] md:h-[90vh] bg-black text-white flex flex-col md:flex-row z-0 overflow-hidden text-white uppercase">
                <div className="flex-1 p-8 flex flex-col justify-end pb-24 text-white">
                    <h1 className="text-6xl md:text-7xl leading-none mb-5 tracking-tighter text-white">
                        {data.title}
                    </h1>
                    {data.heroText && (
                        <p className="text-2xl md:text-3xl text-yellow-400 max-w-2xl leading-none">
                            {data.heroText}
                        </p>
                    )}
                </div>
                {data.heroImage && (
                    <div className="flex-1 relative bg-gray-900 border-l-8 border-black">
                        <Image
                            src={urlFor(data.heroImage).url()}
                            alt={data.title}
                            fill
                            className="object-cover opacity-70"
                            priority
                        />
                    </div>
                )}
                <ScrollIndicator />
            </section>

            {/* Spacer to allow scrolling past the fixed hero */}
            <div className="h-[90vh] md:h-[90vh]" />

            {/* Slide-over Content Wrapper - z-index 60 covers Navigation (50) */}
            <div className="relative z-[60] bg-white shadow-[0_-20px_100px_rgba(0,0,0,0.8)] border-t-8 border-black text-black">
                {/* Content Section 1 */}
                <section className="py-20 px-8 md:px-8 grid md:grid-cols-2 gap-18 items-start">
                    <div className="md:text-3xl leading-[1.05] tracking-tighter space-y-8 text-black">
                        <PortableText value={data.contentBlock1} components={ptComponents} />
                    </div>
                    
                    {allGalleryImages.length > 0 && (
                        <div className="p-0">
                            <BrutalistGalleryStack images={allGalleryImages} />
                        </div>
                    )}
                </section>

                {/* CTA Section - Moved to bottom */}
                <section className="bg-[#FF3100] text-white p-12 text-center border-t-8 border-black mt-20 uppercase">
                    <h2 className="text-5xl md:text-7xl mb-12 tracking-tighter text-white">Bereit für etwas Aussergewöhnliches?</h2>
                    <a
                        href="mailto:info@halle5.at"
                        className="inline-block bg-white text-black px-12 py-6 text-3xl hover:bg-black hover:text-white transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-[-4px] active:translate-y-0 border-4 border-black"
                    >
                        Projekt anfragen
                    </a>
                </section>


            </div>

        </main>
    );
}
