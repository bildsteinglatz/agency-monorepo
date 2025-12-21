'use client';

import React, { useState, useEffect } from 'react';
import { client } from "@/sanity/client";
import BrutalistMap from "@/components/BrutalistMap";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/sanity/image';

export default function VisitPage() {
    const [info, setInfo] = useState<any>(null);
    const [isRouteActive, setIsRouteActive] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    useEffect(() => {
        client.fetch(`*[_type == "halle5Info"][0]{..., visitPanel}`).then(setInfo);
    }, []);

    const panelData = info?.visitPanel || {};

    return (
        <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-black">
            {/* Background Map */}
            <div className="absolute inset-0 z-0">
                <BrutalistMap onRouteStateChange={(active: boolean) => setIsRouteActive(active)} />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 p-8 md:p-12 lg:p-20 flex flex-col justify-end min-h-[calc(100vh-80px)] pointer-events-none">
                <AnimatePresence>
                    {!isRouteActive && isPanelVisible && (
                        <motion.div
                            key="besuchen-panel"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -500, opacity: 0, transition: { duration: 0.8, ease: "easeIn" } }}
                            transition={{ delay: 0.6, duration: 0.9, ease: "easeOut" }}
                            className="max-w-3xl bg-white text-black p-0 md:p-0 border-l-[16px] border-[#FF3100] shadow-[12px_12px_0px_0px_rgba(0,77,77,1)] pointer-events-auto relative overflow-hidden"
                        >
                            {/* Brutalist close button */}
                            <button
                                aria-label="Close Besuchen"
                                onClick={() => setIsPanelVisible(false)}
                                className="absolute right-4 top-4 z-20 bg-white border-4 border-black text-black font-black w-12 h-12 flex items-center justify-center text-2xl hover:bg-[#FF3100] hover:text-white transition-colors"
                            >
                                ×
                            </button>

                            <div className="p-8 md:p-12 max-h-[70vh] overflow-auto">
                                <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter leading-none">
                                    {panelData.title || 'Besuchen'}
                                </h1>

                                <div className="space-y-6 text-xl md:text-2xl font-bold leading-tight uppercase">
                                    {/* Render portable text if available, otherwise fallback */}
                                    {panelData.text ? (
                                        <div>
                                            <PortableText value={panelData.text} />
                                        </div>
                                    ) : (
                                        <>
                                            <p>
                                                Du findest Halle 5 im Herzen Dornbirns. Zugang ist über unserer Künstler:innen möglich oder besuche eine Veranstaltung des Designforums oder der CampusVäre und schau vorbei.
                                            </p>

                                            <p>
                                                Wir freuen uns, dich in Halle 5 willkommen zu heißen. Sei es auf einen kurzen Blick,
                                                einen Plausch bei Kaffee oder um an deinem Werk oder Projekt zu arbeiten.
                                            </p>
                                        </>
                                    )}
                                </div>

                                {panelData.images && panelData.images.length > 0 && (
                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {panelData.images.map((img: any, i: number) => (
                                            <div key={i} className="w-full max-w-4xl mx-auto border-4 border-black bg-white overflow-hidden">
                                                <div style={{ aspectRatio: '16/9' }} className="w-full h-full">
                                                    <img src={urlFor(img).url()} alt={img.alt || ''} loading="lazy" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 flex flex-wrap gap-4">
                                    {(panelData.links || []).map((link: any, i: number) => (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`${link.style === 'primary' ? 'bg-black text-white' : 'border-4 border-black'} px-8 py-4 text-xl font-black uppercase hover:bg-[#FF3100] transition-colors`}
                                        >
                                            {link.label}
                                        </a>
                                    ))}

                                    {/* Fallback buttons if no links provided */}
                                    {(!panelData.links || panelData.links.length === 0) && (
                                        <>
                                            <a
                                                href={info?.googleMapsLink || "https://maps.google.com/?q=Spinnergasse+1,6850+Dornbirn"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-black text-white px-8 py-4 text-xl font-black uppercase hover:bg-[#FF3100] transition-colors"
                                            >
                                                Google Maps
                                            </a>
                                            <a
                                                href={`mailto:${info?.contactEmail || "info@halle5.at"}`}
                                                className="border-4 border-black px-8 py-4 text-xl font-black uppercase hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-[-4px] active:translate-y-0"
                                            >
                                                Kontakt
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
