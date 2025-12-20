export default function Page() {
    return (
        <main className="min-h-screen bg-white text-black p-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-7xl font-black uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Impressum</h1>
                <div className="grid md:grid-cols-2 gap-12 text-xl font-bold uppercase">
                    <section className="border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-4xl font-black mb-6">Offenlegung</h2>
                        <p>Halle 5 Ateliers</p>
                        <p>Roland Adlassnigg</p>
                        <p>Spinnergasse 1</p>
                        <p>6850 Dornbirn</p>
                    </section>
                    <section className="border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-black text-white">
                        <h2 className="text-4xl font-black mb-6">Kontakt</h2>
                        <p>info@halle5.at</p>
                        <p>UID: ATU12345678</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
