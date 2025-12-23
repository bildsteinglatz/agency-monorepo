'use client';

import { useState } from 'react';
import BrutalistReader from './BrutalistReader';
import InnovativeButton from './InnovativeButton';

interface AtelierAaaClientProps {
    rolandData: {
        title: string;
        bio: any;
    } | null;
}

export default function AtelierAaaClient({ rolandData }: AtelierAaaClientProps) {
    const [isReaderOpen, setIsReaderOpen] = useState(false);

    if (!rolandData) return null;

    return (
        <>
            <div className="flex justify-center py-20 bg-white border-t-8 border-black">
                <InnovativeButton 
                    label="Über Roland Adlassnigg" 
                    onClick={() => setIsReaderOpen(true)} 
                />
            </div>

            <BrutalistReader 
                isOpen={isReaderOpen}
                onClose={() => setIsReaderOpen(false)}
                title={rolandData.title}
                content={rolandData.bio}
            />
        </>
    );
}
