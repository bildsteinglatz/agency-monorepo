import '@/styles/globals.css';
import React from 'react';
import ClientRoot from '@/components/ClientRoot';

// Spectral has its own minimal layout - no navigation or sidebar
export default function SpectralLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClientRoot>
            {children}
        </ClientRoot>
    );
}
