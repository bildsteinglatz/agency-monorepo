export default function Page() {
    return (
        <main className="min-h-screen bg-yellow-400 text-black p-12 flex items-center justify-center">
            <div className="max-w-md w-full border-8 border-black bg-white p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 text-center">Jetzt Mitglied werden</h1>
                <p className="text-xl font-bold uppercase mb-8 text-center">Unterstütze die zeitgenössische Kunst in Dornbirn.</p>
                <button className="w-full bg-black text-white text-2xl font-black uppercase py-4 hover:bg-gray-800 transition-colors border-4 border-black">
                    Anmeldeformular (PDF)
                </button>
            </div>
        </main>
    );
}
