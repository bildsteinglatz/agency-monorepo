export default function Page() {
    return (
        <main className="min-h-screen bg-black text-white p-12">
            <div className="max-w-5xl mx-auto border-8 border-white p-12 shadow-[16px_16px_0px_0px_rgba(255,255,255,1)]">
                <h1 className="text-7xl font-black uppercase tracking-tighter mb-8 leading-none">Adlassnigg KG</h1>
                <p className="text-3xl font-bold uppercase mb-12 text-yellow-400">Professionelle Kunstproduktion.</p>
                <div className="prose prose-invert prose-2xl max-w-none">
                    <p className="font-bold">Realisierung außergewöhnlicher Projekte für Künstler:innen weltweit.</p>
                    <div className="mt-12 bg-white text-black p-8 border-4 border-yellow-400">
                        <h2 className="text-3xl font-black uppercase mb-4">Anfragen</h2>
                        <p className="text-xl">Kontaktieren Sie uns für Ihr nächstes Projekt.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
