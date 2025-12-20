import { client } from "@/sanity/client";

export default async function Page() {
    const info = await client.fetch(`*[_type == "halle5Info"][0]`);

    return (
        <main className="max-w-3xl mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">Über Halle 5</h1>

            <div className="prose prose-lg max-w-none">
                {/* Placeholder for Portable Text - would need @portabletext/react */}
                <p className="text-xl leading-relaxed text-gray-800 italic mb-12">
                    "Wir sind Halle 5, ein Ort von und für Künstler:innen, ein Atelier für Kunst und Kulturproduktion."
                </p>

                <section className="space-y-6">
                    <p>
                        Seit Herbst 2023 entwickeln wir im Herzen des Campus V in der Halle 5.1 der CampusVäre
                        in der Spinnergasse 1 in Dornbirn die Anlaufstelle für Kunst- und Kulturproduktion in Vorarlberg.
                    </p>
                    <p>
                        Unsere Werkhalle mit dem eindrucksvollen Volumen von 20 x 52 x 8 Metern erlaubt uns
                        mit verschiedenen Atelier- und Werkstattmodulen und einem breit aufgestellten Team
                        unterschiedliche Zielgruppen zu betreuen.
                    </p>
                </section>
            </div>
        </main>
    );
}
