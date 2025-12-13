import '@/styles/globals.css';
import React from 'react';
import ClientRoot from '@/components/ClientRoot';
import { ConditionalNav } from '@/components/ConditionalNav';
import { Metadata, Viewport } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bildstein-glatz.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Bildstein | Glatz',
    template: '%s | Bildstein | Glatz',
  },
  description: 'Contemporary art by the Austrian-Swiss artist duo Bildstein | Glatz. Artwork, exhibitions, texts, and projects.',
  keywords: ['Bildstein Glatz', 'contemporary art', 'installation art', 'Austrian artists', 'Swiss artists', 'sculpture', 'public art'],
  authors: [{ name: 'Bildstein | Glatz' }],
  creator: 'Bildstein | Glatz',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Bildstein | Glatz',
    title: 'Bildstein | Glatz',
    description: 'Contemporary art by the Austrian-Swiss artist duo Bildstein | Glatz.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bildstein | Glatz',
    description: 'Contemporary art by the Austrian-Swiss artist duo Bildstein | Glatz.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <React.Suspense fallback={null}>
          <ClientRoot>
            <ConditionalNav />
            <main className="flex-grow">
              {children}
            </main>
          </ClientRoot>
        </React.Suspense>
      </body>
    </html>
  );
}

