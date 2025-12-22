import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import PartyBackground from "@/components/PartyBackground";

export const revalidate = 60;

export default async function Page() {
    // Fetch events, sorting by the first date in the array (descending)
    const events = await client.fetch(`*[_type == "event"] | order(dates[0] desc) {
        _id,
        title,
        slug,
        dates,
        image,
        content
    }`);

    const ptComponents = {
        block: {
            h3: ({ children }: any) => <h3 className="text-xl font-bold mt-6 mb-2 text-black">{children}</h3>,
            normal: ({ children }: any) => <p className="mb-4 leading-relaxed text-black">{children}</p>,
        },
        list: {
            bullet: ({ children }: any) => <ul className="list-disc ml-6 mb-4 space-y-1 text-black">{children}</ul>,
        },
    };

    return (
        <PartyBackground>
            {/* Header Section */}
            <section className="py-16 px-6 md:px-12 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                        <span className="text-white" style={{ WebkitTextStroke: '2px black' }}>Events in Halle 5</span>
                    </h1>
                    <p className="mt-6 text-xl md:text-2xl font-bold max-w-2xl text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        In Halle 5 konzentrieren wir uns auf die Produktion! Manchmal finden hier aber auch die angesagtesten Ausstellungen, Konzerte und Events statt.
                    </p>
                </div>
            </section>

            {/* Events List */}
            <section className="py-12 px-6 md:px-12 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 gap-16">
                        {events.map((event: any) => (
                            <article 
                                key={event._id} 
                                id={event.slug?.current}
                                className="group relative border-4 border-black p-6 md:p-10 bg-white/90 backdrop-blur-md hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
                            >
                                <div className="flex flex-col lg:flex-row gap-10">
                                    {/* Image Column */}
                                    {event.image && (
                                        <div className="lg:w-2/5 shrink-0">
                                            <div className="border-4 border-black overflow-hidden aspect-[4/3] relative bg-gray-100">
                                                <Image
                                                    src={urlFor(event.image).width(800).url()}
                                                    alt={event.title || "Event Image"}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Content Column */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {event.dates?.map((date: string, idx: number) => (
                                                <span 
                                                    key={idx}
                                                    className="bg-black text-white px-3 py-1 text-sm font-bold uppercase tracking-wider"
                                                >
                                                    {new Date(date).toLocaleDateString('de-AT', { 
                                                        day: '2-digit', 
                                                        month: '2-digit', 
                                                        year: 'numeric' 
                                                    })}
                                                </span>
                                            ))}
                                        </div>

                                        <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase leading-tight text-black group-hover:text-yellow-500 transition-colors">
                                            {event.title}
                                        </h2>

                                        <div className="prose prose-xl max-w-none font-medium text-black">
                                            <PortableText value={event.content} components={ptComponents} />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {events.length === 0 && (
                            <div className="border-4 border-black border-dashed p-20 text-center">
                                <p className="text-2xl font-bold italic text-gray-400">
                                    Derzeit sind keine aktuellen Events eingetragen.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </PartyBackground>
    );
}
