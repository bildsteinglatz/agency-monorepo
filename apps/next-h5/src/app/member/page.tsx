import { Metadata } from 'next';
import { client } from '@/sanity/client';
import { groq } from 'next-sanity';
import { MembershipHero } from '@/components/membership/MembershipHero';
import { MembershipTier } from '@/components/membership/MembershipTier';
import { MembershipScale } from '@/components/membership/MembershipScale';
import { MembershipProject } from '@/components/membership/MembershipProject';

export const metadata: Metadata = {
    title: 'Jetzt Mitglied Werden | halle 5',
    description:
        'Werde Mitglied bei halle 5. Unterstütze unser Atelier und profitiere von exklusiven Angeboten und Workshops.',
};

interface Membership {
    _id: string;
    title: string;
    slug: {
        current: string;
    };
    category: 'private' | 'professional' | 'projects';
    priceLabel: string;
    priceValue?: number;
    description: string;
    benefits: string[];
    order: number;
    type: 'tier' | 'project';
    ctaText?: string;
    checkoutUrl?: string;
}

async function getMemberships(): Promise<Membership[]> {
    const memberships = await client.fetch(
        groq`
            *[_type == "membership" && showOnWebsite != false] | order(priceValue asc, order asc) {
                _id,
                title,
                slug,
                category,
                priceLabel,
                priceValue,
                description,
                benefits,
                order,
                type,
                ctaText,
                checkoutUrl
            }
        `
    );

    return memberships;
}

async function getPartnerData() {
    const texts = await client.fetch(groq`*[_type == "partnerTexts" && showOnWebsite != false][0]{ title, description, additionalInfo }`);
    return { texts };
}

export default async function MemberPage() {
    const [memberships, partnerData] = await Promise.all([
        getMemberships(),
        getPartnerData()
    ]);

    // Group memberships by category
    const private_ = memberships.filter((m) => m.category === 'private' && m.type === 'tier');
    const professional = memberships.filter(
        (m) => m.category === 'professional' && m.type === 'tier'
    );
    const projects = memberships.filter(
        (m) => m.category === 'projects' && m.type === 'project'
    );

    // Convert to client-compatible format (JSON serialization)
    const serializedPrivate = JSON.parse(JSON.stringify(private_));
    const serializedProfessional = JSON.parse(JSON.stringify(professional));
    const serializedProjects = JSON.parse(JSON.stringify(projects));

    // For professional tier, extract price points
    const pricePoints = serializedProfessional.map((m: Membership) => ({
        price: m.priceLabel,
        label: m.title,
        checkoutUrl: m.checkoutUrl,
    }));

    // For projects, create items for MembershipProject component
    const sortedProjects = [...serializedProjects].sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        
        // Priority 1: Praktikum Support
        if (titleA.includes('praktikum')) return -1;
        if (titleB.includes('praktikum')) return 1;
        
        // Priority 2: Artist in Residence
        if (titleA.includes('residence')) return -1;
        if (titleB.includes('residence')) return 1;
        
        return 0;
    });

    const projectItems = sortedProjects.map((m: Membership, index: number) => {
        const title = m.title.toLowerCase();
        let gapClass = 'mt-4'; // Default

        if (index === 0) {
            gapClass = 'mt-0';
        } else if (title.includes('residence')) {
            gapClass = 'mt-2'; // Less gap after Praktischer Support
        } else if (title.includes('kaffee') || title.includes('coffee')) {
            // Check if the previous item was also coffee
            const prevTitle = sortedProjects[index - 1]?.title.toLowerCase() || '';
            if (prevTitle.includes('kaffee') || prevTitle.includes('coffee')) {
                gapClass = 'mt-2'; // Less gap between coffee items
            } else {
                gapClass = 'mt-8 md:mt-12'; // Halved gap before the first coffee item
            }
        }

        return {
            title: m.title,
            description: m.description,
            price: m.priceLabel,
            checkoutUrl: m.checkoutUrl,
            gapClass
        };
    });

    return (
        <div className="min-h-screen bg-transparent">
            {/* Hero */}
            <MembershipHero description={partnerData.texts?.description} />

            {/* Private Memberships - 3 Column Grid */}
            {serializedPrivate.length > 0 && (
                <section className="py-20 md:py-32 px-6 md:px-8 bg-white border-t-8 border-b-8 border-black">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 text-black">
                            Für Einzelne
                        </h2>
                        <p className="text-lg text-black mb-6 md:mb-10 leading-tight">
                            Unterstütze unser Atelier und profitiere von exklusiven Angeboten.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {serializedPrivate.map((tier: Membership) => (
                                <MembershipTier
                                    key={tier._id}
                                    title={tier.title}
                                    price={tier.priceLabel}
                                    description={tier.description}
                                    benefits={tier.benefits}
                                    ctaText={tier.ctaText || 'Jetzt beitreten'}
                                    checkoutUrl={tier.checkoutUrl}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Professional Partnerships - Price Scale */}
            {serializedProfessional.length > 0 && (
                <section className="py-20 md:py-32 px-6 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 text-black">
                            Für Unternehmen
                        </h2>
                        <p className="text-lg text-black mb-6 md:mb-8 leading-tight">
                            Erweitere dein Netzwerk und unterstütze kreative Prozesse.<br />    
                            Wähle den passenden Beitrag für dein Unternehmen aus unserer Preisskala.    
                        </p>
                        <MembershipScale pricePoints={pricePoints} />
                    </div>
                </section>
            )}

            {/* Project Funding - Manifest Style */}
            {projectItems.length > 0 && (
                <section className="py-20 md:py-32 px-6 md:px-8 bg-black">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 text-white">
                            Einmaliger Support:
                        </h2>
                        <p className="text-lg text-white mb-6 md:mb-10 leading-tight">
                            Unterstütze spezifische Projekte und Wohlbefinden einmalig.
                        </p>

                        <MembershipProject projects={projectItems} />
                    </div>
                </section>
            )}

            {/* Partner & Förderer Section */}
            {partnerData.texts && (
                <section className="py-12 md:py-16 px-6 md:px-8 bg-[#facc15] border-t-8 border-black">
                    <div className="max-w-6xl mx-auto">
                        {partnerData.texts?.additionalInfo && (
                            <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-3xl mx-auto">
                                <p className="text-lg font-bold leading-snug text-black whitespace-pre-wrap text-center">
                                    {partnerData.texts.additionalInfo}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* CTA Footer */}
            <section className="pt-4 md:pt-6 pb-20 md:pb-32 px-6 md:px-8 bg-[#facc15]">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black uppercase mb-3 text-black">
                        Fragen?
                    </h2>
                    <p className="text-lg text-black mb-6 leading-tight">
                        Kontaktiere uns gerne unter{' '}
                        <a
                            href="mailto:info@halle5.at"
                            className="underline hover:text-[#FF3100] transition-colors font-bold"
                        >
                            info@halle5.at
                        </a>
                    </p>
                    <a
                        href="mailto:info@halle5.at"
                        className="inline-block bg-black hover:bg-[#FF3100] text-white border-4 border-black px-12 py-6 text-lg font-black uppercase transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Schreib uns
                    </a>
                </div>
            </section>

            {/* QR Code Section */}
            <section className="py-20 md:py-32 px-6 md:px-8 border-t-8 border-black bg-black text-white">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">
                        Whats the fuzz<br />just send cash
                    </h2>
                    <p className="text-[10px] font-black uppercase mb-2 tracking-widest opacity-80">
                        scan with your banking app for direkt action
                    </p>
                    <div className="inline-block bg-white border-8 border-black p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        <img 
                            src="/qrcode.png" 
                            alt="QR Code for cash support" 
                            className="w-64 h-64 md:w-80 md:h-80 object-contain mx-auto"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
