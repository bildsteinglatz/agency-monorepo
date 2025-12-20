export default function Page() {
    return (
        <main className="min-h-screen bg-white text-black p-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-12 border-b-8 border-black">Pinguin</h1>
                <div className="bg-blue-500 text-white p-12 border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-4xl font-black uppercase mb-8">Kreativatelier für Kinder & Jugendliche</h2>
                    <p className="text-2xl font-bold uppercase mb-8 italic">Freies Arbeiten. Grenzenlose Phantasie.</p>
                    <div className="bg-white text-black p-6 font-black uppercase text-center border-4 border-black">
                        Nächster Termin: Samstag, 14:00 Uhr
                    </div>
                </div>
            </div>
        </main>
    );
}
