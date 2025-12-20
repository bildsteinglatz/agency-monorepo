export default function Page() {
    return (
        <main className="min-h-screen bg-white text-black p-12">
            <div className="max-w-4xl mx-auto border-4 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-gray-100">
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-12">Kooperationspartner</h1>
                <p className="text-2xl font-bold uppercase mb-8">Wir arbeiten eng mit führenden Institutionen zusammen.</p>
                <div className="grid md:grid-cols-2 gap-8 text-xl font-black italic">
                    <div className="p-4 border-2 border-black bg-white">ARTquer</div>
                    <div className="p-4 border-2 border-black bg-white">Atelier 10</div>
                    <div className="p-4 border-2 border-black bg-white">Living Museums</div>
                    <div className="p-4 border-2 border-black bg-white">Kunstraum Dornbirn</div>
                </div>
            </div>
        </main>
    );
}
