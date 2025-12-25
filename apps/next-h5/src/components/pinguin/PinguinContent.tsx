'use client';

import { m } from 'framer-motion';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/sanity/image';

interface PinguinContentProps {
    data: any;
}

// Helper to slugify strings for IDs
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

// Helper to determine if color is light
function isLightColor(hex: string): boolean {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 180;
}

export function PinguinContent({ data }: PinguinContentProps) {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const blockVariants = {
        hidden: { 
            opacity: 0, 
            y: 20,
            scale: 0.98,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15,
                duration: 0.4,
            },
        },
    };

    return (
        <main className="relative z-10" style={{ marginTop: '100vh' }}>
            
            {/* Spacer to allow video viewing */}
            <div className="h-0 md:h-48"></div>
            
            {/* Introduction Section */}
            {data.introduction && (
                <section id="fuer-wen" className="w-full lg:w-[80%] max-w-none ml-0 lg:ml-auto mr-0 px-0 md:px-12 py-0 md:py-12 scroll-mt-40">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.4 }}
                        className="max-w-4xl mx-auto text-black font-bold uppercase leading-relaxed [&_p]:m-0"
                    >
                        <PortableText value={data.introduction} />
                    </m.div>
                </section>
            )}

            {/* Bento Box Grid - Feature Blocks */}
            {data.featureBlocks && data.featureBlocks.length > 0 && (
                <section className="w-full lg:w-[80%] max-w-none ml-0 lg:ml-auto mr-0 px-0 md:px-12 py-0 md:py-8">
                    <m.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6 md:auto-rows-fr"
                    >
                        {data.featureBlocks.map((block: any, index: number) => {
                            const bgColor = block.colorHex || '#000000';
                            const isLight = isLightColor(bgColor);
                            const textColor = isLight ? 'text-black' : 'text-white';
                            const borderColor = isLight ? 'border-black' : 'border-white';
                            
                            // Layout classes
                            const layoutClass = block.layoutType === 'full' 
                                ? 'md:col-span-2 lg:col-span-3' 
                                : 'md:col-span-1';

                            return (
                                <m.div
                                    key={index}
                                    id={slugify(block.title)}
                                    variants={blockVariants}
                                    whileHover={{
                                        scale: 1.02,
                                        rotate: Math.random() > 0.5 ? 0.5 : -0.5,
                                        transition: { duration: 0.2 }
                                    }}
                                    className={`${layoutClass} scroll-mt-40`}
                                >
                                    <div
                                        className={`p-8 md:p-12 border-0 md:border-4 ${borderColor} ${textColor} shadow-none md:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,0.3)] transition-shadow`}
                                        style={{ backgroundColor: bgColor }}
                                    >
                                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-none">
                                            {block.title}
                                        </h2>
                                        {block.description && (
                                            <div className="prose prose-lg md:prose-xl font-bold uppercase">
                                                <PortableText value={block.description} />
                                            </div>
                                        )}
                                    </div>
                                </m.div>
                            );
                        })}
                    </m.div>
                </section>
            )}

            {/* Team Section - Styled as Blocks */}
            {data.team && data.team.length > 0 && (
                <section id="team" className="w-full lg:w-[80%] max-w-none ml-0 lg:ml-auto mr-0 px-0 md:px-12 py-0 md:py-8 scroll-mt-40">
                    <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 px-6 md:px-0">Pinguin Team</h2>
                    <m.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6"
                    >
                        {data.team.filter((m: any) => m).map((member: any, index: number) => (
                            <m.div
                                key={member._id || index}
                                variants={blockVariants}
                                className="md:col-span-1"
                            >
                                <div className="bg-white border-0 md:border-4 border-black shadow-none md:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] h-full flex flex-col">
                                    {member.image && (
                                        <div className="relative aspect-[4/5] w-full border-b-0 md:border-b-4 border-black overflow-hidden">
                                            <Image
                                                src={urlFor(member.image).width(600).auto('format').url()}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6 flex-grow">
                                        <h3 className="text-2xl font-black uppercase mb-1">{member.name}</h3>
                                        {member.role && (
                                            <p className="text-[#FF3100] font-bold uppercase text-sm mb-4">{member.role}</p>
                                        )}
                                        {member.bio && (
                                            <div className="text-sm font-bold uppercase line-clamp-3">
                                                <PortableText value={member.bio} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </m.div>
                </section>
            )}

            {/* Gallery Section - Styled as Blocks */}
            {data.gallery && data.gallery.length > 0 && (
                <section id="galerie" className="w-full lg:w-[80%] max-w-none ml-0 lg:ml-auto mr-0 px-0 md:px-12 py-0 md:py-8 scroll-mt-40">
                    <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 px-6 md:px-0">Galerie</h2>
                    <m.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6"
                    >
                        {data.gallery.map((item: any, index: number) => (
                            <m.div
                                key={index}
                                variants={blockVariants}
                                className="md:col-span-1"
                            >
                                <div className="bg-black border-0 md:border-4 border-black shadow-none md:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] aspect-square relative overflow-hidden group">
                                    <Image
                                        src={urlFor(item.asset).width(800).auto('format').url()}
                                        alt={item.alt || 'Gallery Image'}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            </m.div>
                        ))}
                    </m.div>
                </section>
            )}

            {/* Schedule Section */}
            {data.schedule && (
                <section id="ablauf" className="w-full lg:w-[80%] max-w-none ml-0 lg:ml-auto mr-0 px-0 md:px-12 py-0 md:py-8 scroll-mt-40">
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 15,
                        }}
                        whileHover={{
                            scale: 1.02,
                            rotate: -1,
                            transition: { duration: 0.2 }
                        }}
                        className="bg-[#FF3100] text-white p-8 md:p-12 border-0 md:border-8 border-black shadow-none md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <h2 className="text-3xl md:text-5xl font-black uppercase mb-6 leading-none">
                            Wann & Wie viel?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            {data.schedule.days && (
                                <div className="bg-white text-black p-6 border-4 border-black">
                                    <div className="text-xs font-black uppercase mb-1">Tage</div>
                                    <div className="text-xl font-black uppercase">{data.schedule.days}</div>
                                </div>
                            )}
                            {data.schedule.time && (
                                <div className="bg-white text-black p-6 border-4 border-black">
                                    <div className="text-xs font-black uppercase mb-1">Zeit</div>
                                    <div className="text-xl font-black uppercase">{data.schedule.time}</div>
                                </div>
                            )}
                            {data.schedule.cost && (
                                <div className="bg-white text-black p-6 border-4 border-black">
                                    <div className="text-xs font-black uppercase mb-1">Kosten</div>
                                    <div className="text-xl font-black uppercase">{data.schedule.cost}</div>
                                </div>
                            )}
                        </div>
                    </m.div>
                </section>
            )}

            {/* CTA Section */}
            <section id="buchen" className="w-full lg:w-[80%] max-w-none ml-0 lg:ml-auto mr-0 px-0 md:px-12 py-0 md:py-8 mb-0 md:mb-8 scroll-mt-40">
                <m.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 12,
                    }}
                    className="bg-yellow-400 p-8 md:p-12 border-0 md:border-8 border-black shadow-none md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] text-center"
                >
                    <h3 className="text-3xl md:text-5xl font-black uppercase mb-6">
                        Buchen! Atelier Pinguin anschreiben, ist kein Sprung ins kalte Wasser.
                    </h3>
                    <p className="text-lg md:text-xl font-bold uppercase mb-8">
                        Am einfachsten lässt sich per E-Mail klären, wann und wie ein Workshop mit Kindern oder Jugendlichen im Atelier Pinguin gebucht werden kann, was wir bieten und was die Gruppe hier Cooles erwartet.

Alles, was wir benötigen, sind das Alter und die Anzahl der Teilnehmenden sowie bevorzugte Termine.
                    </p>
                    <m.a
                        href="mailto:pinguin@halle5.at"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "15px 15px 0px 0px rgba(0,0,0,1)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block bg-black text-white px-12 py-6 text-2xl font-black uppercase border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)] transition-all"
                    >
                        Mehr Infos anfragen
                    </m.a>
                </m.div>
            </section>
        </main>
    );
}

