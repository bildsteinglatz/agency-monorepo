import { client } from "@/sanity/client";
import { PortableText } from "@portabletext/react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PrivacyPage() {
    let imprintData = null;
    try {
        imprintData = await client.fetch(`*[_id == "imprint" && showOnWebsite != false][0]`, {}, { next: { revalidate: 0 } });
    } catch (error) {
        console.error("Error fetching privacy data:", error);
    }

    if (!imprintData || !imprintData.privacyContent) {
        return (
            <main className="min-h-screen bg-white text-black p-12 flex items-center justify-center font-black uppercase text-center">
                <div className="border-8 border-black p-20 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)]">
                    <h1 className="text-7xl mb-8 leading-none">Datenschutz</h1>
                    <p className="text-2xl">Keine Daten gefunden.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white text-black font-black uppercase">
            <section className="bg-black text-white p-12 md:p-24 border-b-8 border-black">
                <h1 className="text-4xl md:text-6xl leading-none tracking-tighter">
                    Datenschutz (DSVGO)
                </h1>
                <p className="text-xl mt-4">
                    Stand • {new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </section>

            <section className="p-8 md:p-24 max-w-4xl mx-auto normal-case text-lg md:text-xl leading-relaxed font-sans font-medium space-y-12">
                <style>{`
                  .privacy-content h2 { font-weight: 900; text-transform: uppercase; font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; }
                  .privacy-content h3 { font-weight: 900; text-transform: uppercase; font-size: 1.25em; margin-top: 1.2em; margin-bottom: 0.5em; }
                  .privacy-content p { margin-bottom: 1em; }
                  .privacy-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
                  .privacy-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
                  .privacy-content li { margin-bottom: 0.5em; }
                  .privacy-content strong { font-weight: bold; }
                  .privacy-content a { text-decoration: underline; text-underline-offset: 4px; }
                  .privacy-content a:hover { background-color: black; color: white; text-decoration: none; }
                `}</style>

                <div className="space-y-8">
                    <div className="privacy-content">
                        <PortableText value={imprintData.privacyContent} />
                    </div>
                </div>
            </section>
        </main>
    );
}
