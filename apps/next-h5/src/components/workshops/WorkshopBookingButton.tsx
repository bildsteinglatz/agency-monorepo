'use client';

import { useState } from 'react';
import { WorkshopDrawer } from './WorkshopDrawer';

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

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-black text-white py-6 px-12 text-2xl font-black uppercase hover:bg-[#fdc800] transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none"
            >
                {label}
            </button>

            <WorkshopDrawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                workshopTitle={workshopTitle}
                workshopDate={workshopDate}
                price={price}
                isPrebooking={isPrebooking}
                eventId={eventId}
            />
        </>
    );
}
