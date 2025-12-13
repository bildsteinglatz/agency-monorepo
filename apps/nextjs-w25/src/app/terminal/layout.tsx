import '@/styles/globals.css';
import React from 'react';
import ClientRoot from '@/components/ClientRoot';

// Terminal has its own minimal layout - no navigation or sidebar
export default function TerminalLayout({
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
