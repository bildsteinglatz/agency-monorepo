'use client';

import { useState } from 'react';
import { CheckoutDrawer } from '@/components/checkout/CheckoutDrawer';

interface WorkshopBookingButtonProps {
    workshopTitle: string;
    workshopDate?: string;
    price?: string;
    label?: string;
    isPrebooking?: boolean;
    eventId?: string;
}

export function WorkshopBookingButton({
    workshopTitle,
    workshopDate,
    price,
    label = "Anmelden",
    isPrebooking = false,
    eventId,
}: WorkshopBookingButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse price string to number (e.g. "€ 360" -> 360)
    const numericPrice = price ? parseInt(price.replace(/[^0-9]/g, '')) : 0;

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-black text-white py-6 px-12 text-2xl font-black uppercase hover:bg-[#FF3100] transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none"
            >
                {label}
            </button>

            <CheckoutDrawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                item={{
                    id: eventId || 'unknown',
                    title: workshopTitle,
                    price: numericPrice,
                    date: workshopDate,
                    type: 'workshop'
                }}
            />
        </>
    );
}
