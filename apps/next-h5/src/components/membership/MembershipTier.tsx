'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MembershipDrawer } from './MembershipDrawer';

interface MembershipTierProps {
    title: string;
    price: string;
    description: string;
    benefits?: string[];
    onSelect?: () => void;
    ctaText?: string;
}

export function MembershipTier({
    title,
    price,
    description,
    benefits = [],
    onSelect,
    ctaText = 'Jetzt beitreten',
}: MembershipTierProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = () => {
        setIsOpen(true);
        onSelect?.();
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                }}
                className="cursor-pointer"
                onClick={handleSelect}
            >
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow p-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block bg-black text-white px-4 py-2 border-3 border-black mb-6"
                    >
                        <span className="text-sm font-black uppercase">Preis</span>
                    </motion.div>

                    <h3 className="text-4xl font-black uppercase mb-4 leading-tight">
                        {title}
                    </h3>

                    <div className="text-5xl font-black uppercase mb-8 text-black">
                        {price}
                    </div>

                    <p className="text-lg font-bold uppercase mb-6 leading-relaxed text-gray-700">
                        {description}
                    </p>

                    {benefits && benefits.length > 0 && (
                        <ul className="mb-8 space-y-2 text-sm font-bold uppercase">
                            {benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="mr-3 font-black">▪</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-black text-white font-black uppercase py-4 border-3 border-black text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(255,49,0,1)] transition-shadow"
                        onClick={handleSelect}
                    >
                        {ctaText}
                    </motion.button>
                </div>
            </motion.div>

            <MembershipDrawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={title}
                price={price}
            />
        </>
    );
}
