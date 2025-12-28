'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import InnovativeButton from './InnovativeButton';

const BrutalistReader = dynamic(() => import('./BrutalistReader'), {
    ssr: false,
});

interface AtelierAaaClientProps {
    rolandData: {
        title: string;
        bio: any;
    } | null;
}

export default function AtelierAaaClient({ rolandData }: AtelierAaaClientProps) {
    const [isReaderOpen, setIsReaderOpen] = useState(false);

    useEffect(() => {
        // Check hash on mount
        if (window.location.hash === '#ueber-roland') {
            setIsReaderOpen(true);
        }

        // Listen for custom event
        const handleOpenBio = () => setIsReaderOpen(true);
        window.addEventListener('open-roland-bio', handleOpenBio);
        
        // Also listen for hash changes
        const handleHashChange = () => {
            if (window.location.hash === '#ueber-roland') {
                setIsReaderOpen(true);
            }
        };
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('open-roland-bio', handleOpenBio);
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    if (!rolandData) return null;

    return (
        <>
            <div className="flex justify-center py-20 bg-white border-t-8 border-black">
                <InnovativeButton 
                    label="Über Roland Adlassnigg" 
                    onClick={() => setIsReaderOpen(true)} 
                />
            </div>

            {isReaderOpen && (
                <BrutalistReader 
                    isOpen={isReaderOpen}
                    onClose={() => {
                        setIsReaderOpen(false);
                        // Optional: clear hash when closing
                        if (window.location.hash === '#ueber-roland') {
                            history.pushState({}, document.title, window.location.pathname + window.location.search);
                        }
                    }}
                    title={rolandData.title}
                    content={rolandData.bio}
                />
            )}
        </>
    );
}
