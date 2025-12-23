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

export default async function MemberPage() {
    const memberships = await getMemberships();

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
    const projectItems = serializedProjects.map((m: Membership) => ({
        title: m.title,
        description: m.description,
        price: m.priceLabel,
        checkoutUrl: m.checkoutUrl,
    }));

    return (
        <div className="min-h-screen bg-transparent">
            {/* Hero */}
            <section className="pt-8 pb-8 md:pt-0 md:pb-8 px-6 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <MembershipHero />
                </div>
            </section>

            {/* Private Memberships - 3 Column Grid */}
            {serializedPrivate.length > 0 && (
                <section className="py-20 md:py-32 px-6 md:px-8 bg-white border-t-8 border-b-8 border-black">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 text-black">
                            Für Einzelne
                        </h2>
                        <p className="text-lg text-black mb-12 md:mb-20 leading-tight">
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
                            Dein Unternehmen führern wir als Unterstützer:in auf unserer Website an.<br />
                            Erhalte Zugang zur Frühbuchung von Workshops, auch für deine Mitarbeiter:innen.<br /> 
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
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 text-white">
                            Einmaliger Support:
                        </h2>
                        <p className="text-lg text-white mb-12 md:mb-20 leading-tight">
                            Unterstütze spezifische Projekte und Wohlbefinden einmalig.
                        </p>

                        <MembershipProject projects={projectItems} />
                    </div>
                </section>
            )}

            {/* CTA Footer */}
            <section className="py-20 md:py-32 px-6 md:px-8 border-t-8 border-black">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black uppercase mb-6">
                        Fragen?
                    </h2>
                    <p className="text-lg text-black mb-12 leading-tight">
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
                    <h2 className="text-4xl md:text-5xl font-black uppercase mb-12">
                        Whats the fuzz<br />just send cash
                    </h2>
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
