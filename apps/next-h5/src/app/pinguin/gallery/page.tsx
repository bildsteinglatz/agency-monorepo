import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import Image from "next/image";

export const revalidate = 60;

export default async function PinguinGalleryPage() {
    let data = null;
    try {
        data = await client.fetch(`
            *[_type == "pinguin"][0] {
                gallery[] {
                    asset,
                    alt
                }
            }
        `);
    } catch (error) {
        console.error("Error fetching pinguin gallery:", error);
    }

    if (!data?.gallery) {
        return <div className="p-12 text-center">No gallery images found.</div>;
    }

    return (
        <main className="min-h-screen bg-white pt-32 pb-12 px-6 md:px-12">
            <div className="w-[80%] max-w-none ml-auto mr-0">
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-16 border-b-8 border-black pb-8">
                    Galerie
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.gallery.map((img: any, index: number) => (
                        <div 
                            key={index}
                            className="relative aspect-square border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,49,0,1)] transition-all duration-300 hover:-translate-y-1 hover:z-10"
                        >
                            <Image
                                src={urlFor(img).url()}
                                alt={img.alt || "Pinguin Gallery Image"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
