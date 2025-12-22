import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import Image from "next/image";
import { PortableText } from "@portabletext/react";

export const revalidate = 60;

export default async function PinguinTeamPage() {
    let data = null;
    try {
        const teamMembers = await client.fetch(`
            *[_type == "pinguinteam"] | order(name asc) {
                _id,
                name,
                role,
                image,
                bio,
                email
            }
        `);
        data = { team: teamMembers };
    } catch (error) {
        console.error("Error fetching pinguin team:", error);
    }

    if (!data?.team) {
        return <div className="p-12 text-center">No team members found.</div>;
    }

    return (
        <main className="min-h-screen bg-white pt-32 pb-12 px-6 md:px-12">
            <div className="w-[80%] max-w-none ml-auto mr-0">
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-16 border-b-8 border-black pb-8">
                    Pinguin Team
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.team?.filter((m: any) => m).map((member: any) => (
                        <div 
                            key={member._id}
                            className="group bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[15px_15px_0px_0px_rgba(255,49,0,1)] transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Image Container */}
                            <div className="relative w-full aspect-[3/4] border-b-4 border-black overflow-hidden">
                                {member.image ? (
                                    <Image
                                        src={urlFor(member.image).url()}
                                        alt={member.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-4xl">🐧</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h2 className="text-2xl font-black uppercase mb-2 leading-none">
                                    {member.name}
                                </h2>
                                {member.role && (
                                    <p className="text-lg font-bold uppercase text-[#FF3100] mb-4">
                                        {member.role}
                                    </p>
                                )}
                                
                                {/* Optional: Bio snippet or full bio */}
                                {member.bio && (
                                    <div className="prose prose-sm font-medium line-clamp-4">
                                        <PortableText value={member.bio} />
                                    </div>
                                )}

                                {member.email && (
                                    <a 
                                        href={`mailto:${member.email}`}
                                        className="inline-block mt-4 text-sm font-bold uppercase underline decoration-2 hover:text-[#FF3100]"
                                    >
                                        Kontakt
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
