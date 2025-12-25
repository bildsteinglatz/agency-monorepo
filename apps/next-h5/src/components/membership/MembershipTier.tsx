'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const MembershipDrawer = dynamic(() => import('./MembershipDrawer').then(mod => mod.MembershipDrawer), {
    ssr: false,
});

interface MembershipTierProps {
    title: string;
    price: string;
    description: string;
    benefits?: string[];
    onSelect?: () => void;
    ctaText?: string;
    checkoutUrl?: string;
}

export function MembershipTier({
    title,
    price,
    description,
    benefits = [],
    onSelect,
    ctaText = 'Jetzt beitreten',
    checkoutUrl,
}: MembershipTierProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = () => {
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
            return;
        }
        setIsOpen(true);
        onSelect?.();
    };

    return (
        <>
            <m.div
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
                    <h3 className="text-4xl font-black uppercase mb-4 leading-tight text-black">
                        {title}
                    </h3>

                    <div className="text-4xl sm:text-5xl font-black uppercase mb-8 text-black break-words">
                        {price}
                    </div>

                    <p className="text-base font-bold uppercase mb-6 leading-tight text-black">
                        {description}
                    </p>

                    {benefits && benefits.length > 0 && (
                        <ul className="mb-8 space-y-2 text-xs font-bold uppercase text-black">
                            {benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="mr-3 font-black">▪</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <m.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-black hover:bg-[#FF3100] text-white font-black uppercase py-4 border-3 border-black text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                        onClick={handleSelect}
                    >
                        {ctaText}
                    </m.button>
                </div>
            </m.div>

            <MembershipDrawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={title}
                price={price}
            />
        </>
    );
}
