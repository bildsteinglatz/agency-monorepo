'use client';

import { motion } from 'framer-motion';

interface PricePoint {
    price: string;
    label?: string;
}

interface MembershipScaleProps {
    pricePoints: PricePoint[];
    title?: string;
}

export function MembershipScale({ pricePoints, title }: MembershipScaleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
        >
            {title && (
                <h3 className="text-4xl font-black uppercase mb-12 border-b-4 border-black pb-4">
                    {title}
                </h3>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {pricePoints.map((point, index) => (
                    <motion.div
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
                        className="bg-black text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,49,0,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(255,49,0,1)] transition-shadow"
                    >
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-black uppercase leading-none mb-2">
                                {point.price}
                            </div>
                            {point.label && (
                                <div className="text-xs font-bold uppercase text-gray-300">
                                    {point.label}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-12 text-lg font-bold uppercase text-gray-700"
            >
                Individuell gestaltbare Partnerschaften – Kontaktieren Sie uns für ein Angebot
            </motion.p>
        </motion.div>
    );
}
