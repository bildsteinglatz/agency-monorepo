'use client';

import { motion } from 'framer-motion';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/sanity/image';

interface PinguinContentProps {
    data: any;
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
            y: 100,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15,
                duration: 0.6,
            },
        },
    };

    return (
        <main className="relative z-10" style={{ marginTop: '100vh' }}>
            {/* Spacer to allow video viewing */}
            <div className="h-32 md:h-48"></div>
            
            {/* Introduction Section */}
            {data.introduction && (
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-black font-bold uppercase leading-relaxed"
                    >
                        <PortableText value={data.introduction} />
                    </motion.div>
                </section>
            )}

            {/* Bento Box Grid - Feature Blocks */}
            {data.featureBlocks && data.featureBlocks.length > 0 && (
                <section className="max-w-[1600px] mx-auto px-6 md:px-12 py-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
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
                                <motion.div
                                    key={index}
                                    variants={blockVariants}
                                    whileHover={{
                                        scale: 1.02,
                                        rotate: Math.random() > 0.5 ? 0.5 : -0.5,
                                        transition: { duration: 0.2 }
                                    }}
                                    className={layoutClass}
                                >
                                    <div
                                        className={`p-8 md:p-12 border-4 ${borderColor} ${textColor} shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,0.3)] transition-shadow`}
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
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>
            )}

            {/* Team Section */}
            {data.team && data.team.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-8">
                    <motion.h2
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 border-b-8 border-black pb-4"
                    >
                        Team
                    </motion.h2>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {data.team.map((member: any, index: number) => (
                            <motion.div
                                key={index}
                                variants={blockVariants}
                                whileHover={{ scale: 1.05 }}
                                className="bg-black text-white p-8 border-4 border-white shadow-[10px_10px_0px_0px_rgba(255,49,0,1)] hover:shadow-[15px_15px_0px_0px_rgba(255,49,0,1)] transition-shadow"
                            >
                                {member.image && (
                                    <div className="relative w-full aspect-square mb-6 border-4 border-white">
                                        <Image
                                            src={urlFor(member.image).url()}
                                            alt={member.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <h3 className="text-3xl font-black uppercase mb-2">
                                    {member.name}
                                </h3>
                                {member.role && (
                                    <p className="text-xl font-bold uppercase text-[#FF3100] mb-4">
                                        {member.role}
                                    </p>
                                )}
                                {member.bio && (
                                    <div className="prose prose-sm text-white font-medium">
                                        <PortableText value={member.bio} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            )}

            {/* Schedule Section */}
            {data.schedule && (
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-8">
                    <motion.div
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
                        className="bg-[#FF3100] text-white p-8 md:p-12 border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"
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
                    </motion.div>
                </section>
            )}

            {/* Gallery */}
            {data.gallery && data.gallery.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-8">
                    <motion.h2
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 border-b-8 border-black pb-4"
                    >
                        Galerie
                    </motion.h2>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                        {data.gallery.map((img: any, i: number) => (
                            <motion.div
                                key={i}
                                variants={blockVariants}
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                className="aspect-square relative border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,49,0,1)] transition-shadow"
                            >
                                <Image
                                    src={urlFor(img).url()}
                                    alt={img.alt || "Pinguin Gallery"}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            )}

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-8 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 12,
                    }}
                    className="bg-yellow-400 p-8 md:p-12 border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] text-center"
                >
                    <h3 className="text-3xl md:text-5xl font-black uppercase mb-6">
                        Buchen! Atelier Pinguin anschreiben, ist kein Sprung ins kalte Wasser.
                    </h3>
                    <p className="text-lg md:text-xl font-bold uppercase mb-8">
                        Am einfachsten lässt sich per E-Mail klären, wann und wie ein Workshop mit Kindern oder Jugendlichen im Atelier Pinguin gebucht werden kann, was wir bieten und was die Gruppe hier Cooles erwartet.

Alles, was wir benötigen, sind das Alter und die Anzahl der Teilnehmenden sowie bevorzugte Termine.
                    </p>
                    <motion.a
                        href="mailto:pinguin@halle5.at"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "15px 15px 0px 0px rgba(0,0,0,1)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block bg-black text-white px-12 py-6 text-2xl font-black uppercase border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)] transition-all"
                    >
                        Mehr Infos anfragen
                    </motion.a>
                </motion.div>
            </section>
        </main>
    );
}

// Helper function to determine if color is light
function isLightColor(hex: string): boolean {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 180;
}
