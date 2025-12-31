import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-[15vw] font-black leading-none mb-8 animate-pulse">404</h1>
            <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 tracking-tighter">
                    Verlaufen? <br />
                    <span className="text-[#fdc800]">Diese Seite existiert nicht.</span>
                </h2>
                <p className="text-xl md:text-2xl font-bold mb-12 uppercase text-white">
                    Vielleicht ist sie gerade in der Werkstatt oder wurde ins Archiv verschoben.
                </p>
                <Link 
                    href="/"
                    className="inline-block bg-[#fdc800] text-white text-2xl md:text-4xl font-black uppercase px-12 py-6 border-4 border-white shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
                >
                    Zurück zur Halle 5
                </Link>
            </div>
        </main>
    );
}
