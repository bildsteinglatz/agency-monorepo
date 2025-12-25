import { Metadata } from 'next';
import { client } from '@/sanity/client';
import { generatePageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
    const data = await client.fetch(`*[_id == "visitPage"][0]{ seo }`);
    return generatePageMetadata(
        data?.seo,
        "Besuchen | Halle 5",
        "Finde Halle 5 im Herzen Dornbirns am Campus V. Anfahrt, Karte und Öffnungszeiten."
    );
}

export default function VisitLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
