import { client } from "@/sanity/client";
import { PortableText } from "@portabletext/react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const components = {
    block: {
        h1: ({ children }: any) => <h1 className="text-4xl md:text-6xl font-black uppercase mb-8 leading-none tracking-tighter">{children}</h1>,
        h2: ({ children }: any) => <h2 className="text-2xl md:text-3xl font-black uppercase mb-6 mt-12 leading-none tracking-tighter">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-xl font-black uppercase mb-4 mt-8 leading-none tracking-tighter">{children}</h3>,
        normal: ({ children }: any) => <p className="mb-6 text-xl md:text-2xl leading-snug font-bold text-zinc-800 normal-case">{children}</p>,
    },
};

export default async function KonzeptPage() {
    let data = null;

    try {
        data = await client.fetch(`*[_id == "halle5Konzept" && showOnWebsite != false][0]`, {}, { next: { revalidate: 0 } });
    } catch (error) {
        console.error("Error fetching konzept page data:", error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-white text-black p-12 flex items-center justify-center font-black uppercase text-center">
                <div className="border-8 border-black p-20 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)]">
                    <h1 className="text-7xl mb-8 leading-none">Konzept</h1>
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

            {/* Content Section */}
            <section className="max-w-4xl mx-auto p-8 md:p-24">
                <div className="prose prose-xl max-w-none">
                    <PortableText value={data.text} components={components} />
                </div>
            </section>
        </main>
    );
}
