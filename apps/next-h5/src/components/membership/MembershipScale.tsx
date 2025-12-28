'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MembershipDrawer = dynamic(() => import('./MembershipDrawer').then(mod => mod.MembershipDrawer), {
    ssr: false,
});

interface PricePoint {
    price: string;
    label?: string;
    checkoutUrl?: string;
}

interface MembershipScaleProps {
    pricePoints: PricePoint[];
    title?: string;
}

export function MembershipScale({ pricePoints, title }: MembershipScaleProps) {
    const [selectedPoint, setSelectedPoint] = useState<PricePoint | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (point: PricePoint) => {
        if (point.checkoutUrl) {
            window.location.href = point.checkoutUrl;
            return;
        }
        setSelectedPoint(point);
        setIsOpen(true);
    };

    return (
        <>
            <m.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6 }}
            >
                {title && (
                    <h3 className="text-4xl font-black uppercase mb-12 border-b-4 border-black pb-4 text-black">
                        {title.replace(/ß/g, 'ẞ')}
                    </h3>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {pricePoints.map((point, index) => (
                        <m.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.08, rotate: -2 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: index * 0.05,
                                type: 'spring',
                                stiffness: 100,
                                damping: 15,
                            }}
                            className="bg-black hover:bg-[#FF3100] text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                            onClick={() => handleSelect(point)}
                        >
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-black uppercase leading-none mb-2">
                                    {point.price.replace(/ß/g, 'ẞ')}
                                </div>
                                {point.label && (
                                    <div className="text-xs font-bold uppercase text-white">
                                        {point.label.replace(/ß/g, 'ẞ')}
                                    </div>
                                )}
                            </div>
                        </m.div>
                    ))}
                </div>

                <m.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-base font-bold uppercase text-black leading-tight"
                >   Dein Unternehmen führen wir <Link href="/partners" className="underline hover:text-[#FF3100] transition-colors">HIER</Link> als Unterstützer:in auf unserer Website an.<br />
                    Erhalte zudem Zugang zur Frühbuchung von Workshops, auch für deine Mitarbeiter:innen.<br /> 
                    Kontaktieren Sie uns für individuell gestaltete Angebote und Partnerschaften.
                </m.p>
            </m.div>

            {selectedPoint && (
                <MembershipDrawer
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title={selectedPoint.label || 'Partnerschaft'}
                    price={selectedPoint.price}
                />
            )}
        </>
    );
}
