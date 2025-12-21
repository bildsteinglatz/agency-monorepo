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
    description: string;
    benefits: string[];
    order: number;
    type: 'tier' | 'project';
    ctaText?: string;
}

async function getMemberships(): Promise<Membership[]> {
    const memberships = await client.fetch(
        groq`
            *[_type == "membership"] | order(order asc) {
                _id,
                title,
                slug,
                category,
                priceLabel,
                description,
                benefits,
                order,
                type,
                ctaText
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
    }));

    // For projects, create items for MembershipProject component
    const projectItems = serializedProjects.map((m: Membership) => ({
        title: m.title,
        description: m.description,
        price: m.priceLabel,
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
                <section className="py-20 md:py-32 px-6 md:px-8 bg-gray-50 border-t-8 border-b-8 border-black">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">
                            Für Einzelne
                        </h2>
                        <p className="text-xl text-gray-700 mb-12 md:mb-20">
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
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">
                            Für Unternehmen
                        </h2>
                        <p className="text-xl text-gray-700 mb-12 md:mb-20">
                            Erweitere dein Netzwerk und unterstütze kreative Prozesse.
                        </p>

                        <MembershipScale pricePoints={pricePoints} />

                        <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {serializedProfessional.map((tier: Membership) => (
                                <div
                                    key={tier._id}
                                    className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <h3 className="text-2xl font-black uppercase mb-3">
                                        {tier.title}
                                    </h3>
                                    <p className="text-gray-700 mb-6">{tier.description}</p>
                                    <ul className="space-y-3 mb-8">
                                        {tier.benefits?.map((benefit, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <span className="text-xl font-black mt-1">
                                                    ✓
                                                </span>
                                                <span className="text-base font-semibold">
                                                    {benefit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="w-full bg-black hover:bg-[#FF3100] text-white border-4 border-black py-4 text-lg font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                        {tier.ctaText || 'Jetzt kontaktieren'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Project Funding - Manifest Style */}
            {projectItems.length > 0 && (
                <section className="py-20 md:py-32 px-6 md:px-8 bg-black">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 text-white">
                            Für Projekte
                        </h2>
                        <p className="text-xl text-gray-300 mb-12 md:mb-20">
                            Unterstütze spezifische Künstler*innen Projekte direkt.
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
                    <p className="text-xl text-gray-700 mb-12">
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
        </div>
    );
}
