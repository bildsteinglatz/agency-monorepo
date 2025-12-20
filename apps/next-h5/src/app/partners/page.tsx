export default function Page() {
    return (
        <main className="min-h-screen bg-gray-100 text-black p-12">
            <div className="max-w-4xl mx-auto border-4 border-black p-12 bg-white">
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-12">Fördergeber & Partner</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <PartnerBox name="Stadt Dornbirn" />
                    <PartnerBox name="Land Vorarlberg" />
                    <PartnerBox name="BMKÖS" />
                    <PartnerBox name="CampusVäre" />
                </div>
            </div>
        </main>
    );
}

function PartnerBox({ name }: { name: string }) {
    return (
        <div className="aspect-square border-4 border-black flex items-center justify-center p-4 text-center font-black uppercase text-xl hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {name}
        </div>
    )
}
