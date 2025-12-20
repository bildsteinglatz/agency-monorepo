export default function Page() {
    return (
        <main className="min-h-screen bg-white text-black p-12">
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-8 border-b-8 border-black pb-4 italic">Datenschutzerklärung</h1>
            <div className="max-w-3xl prose prose-xl font-bold uppercase leading-tight">
                <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst.</p>
                <p className="mt-8 border-4 border-black p-4">Alle Daten werden gemäß DSVGO behandelt.</p>
            </div>
        </main>
    );
}
