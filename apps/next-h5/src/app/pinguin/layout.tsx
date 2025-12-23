import { client } from "@/sanity/client";
import { PinguinNav } from "@/components/pinguin/PinguinNav";

// Helper to slugify strings for IDs
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

function generateNavItems(data: any) {
    const navItems: { label: string; href: string }[] = [];

    if (!data) return [];

    // 1. Introduction
    if (data.introduction) {
        navItems.push({ label: 'Für wen!', href: '/pinguin#fuer-wen' });
    }

    // 2. Feature Blocks (Dynamic)
    if (data.featureBlocks && data.featureBlocks.length > 0) {
        data.featureBlocks.forEach((block: any) => {
            const label = block.navLabel || block.title;
            navItems.push({ 
                label: label, 
                href: `/pinguin#${slugify(block.title)}` 
            });
        });
    }

    // 3. Schedule
    const hasAblauf = navItems.some(item => item.href.includes('#ablauf'));
    if (data.schedule && !hasAblauf) {
        navItems.push({ label: 'Ablauf', href: '/pinguin#ablauf' });
    }

    // 4. Team
    navItems.push({ label: 'Pinguin Team', href: '/pinguin#team' });

    // 5. Gallery
    navItems.push({ label: 'Galerie', href: '/pinguin#galerie' });

    // 6. CTA
    navItems.push({ label: 'Buchen!', href: '/pinguin#buchen' });

    return navItems;
}

export default async function PinguinLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let data = null;
    try {
        data = await client.fetch(`
            *[_id == "pinguin"][0] {
                introduction,
                featureBlocks[] {
                    title,
                    navLabel
                },
                schedule,
                team,
                gallery
            }
        `);
    } catch (error) {
        console.error("Error fetching pinguin nav data:", error);
    }

    const navItems = generateNavItems(data);

    return (
        <div className="relative min-h-screen bg-white">
            <PinguinNav items={navItems} />
            {children}
        </div>
    );
}
