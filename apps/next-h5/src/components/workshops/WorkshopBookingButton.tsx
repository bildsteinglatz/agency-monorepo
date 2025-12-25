'use client';

import { useState } from 'react';
import { WorkshopDrawer } from './WorkshopDrawer';

interface WorkshopBookingButtonProps {
    workshopTitle: string;
    workshopDate?: string;
    price?: string;
}

export function WorkshopBookingButton({
    workshopTitle,
    workshopDate,
    price,
}: WorkshopBookingButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-black text-white py-6 px-12 text-2xl font-black uppercase hover:bg-[#FF3100] transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none"
            >
                Jetzt Anmelden
            </button>

            <WorkshopDrawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                workshopTitle={workshopTitle}
                workshopDate={workshopDate}
                price={price}
            />
        </>
    );
}
