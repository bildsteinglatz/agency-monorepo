export default function Page() {
    return (
        <main className="min-h-screen bg-white text-black p-12">
            <div className="max-w-4xl mx-auto border-8 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-8">Workshops</h1>
                <p className="text-2xl font-bold uppercase mb-12">Unser Kursprogramm für 2025.</p>
                <div className="space-y-8">
                    <WorkshopItem title="Aktzeichnen" date="05.03.2025" />
                    <WorkshopItem title="Metallbearbeitung" date="12.03.2025" />
                    <WorkshopItem title="Druckgrafik" date="19.03.2025" />
                </div>
            </div>
        </main>
    );
}

function WorkshopItem({ title, date }: { title: string, date: string }) {
    return (
        <div className="border-4 border-black p-6 flex justify-between items-center hover:bg-black hover:text-white transition-colors cursor-pointer group">
            <span className="text-3xl font-black uppercase leading-none">{title}</span>
            <span className="text-xl font-bold uppercase group-hover:italic">{date}</span>
        </div>
    )
}
