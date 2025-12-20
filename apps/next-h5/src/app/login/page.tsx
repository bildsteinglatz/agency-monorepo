export default function Page() {
    return (
        <main className="min-h-screen bg-black text-white p-12">
            <div className="max-w-4xl mx-auto border-4 border-white p-12">
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-12">Login</h1>
                <form className="space-y-8 max-w-sm">
                    <div>
                        <label className="block text-2xl font-black uppercase mb-2">Email</label>
                        <input type="text" className="w-full bg-white text-black border-4 border-white p-4 font-bold outline-none focus:ring-4 ring-yellow-400" />
                    </div>
                    <div>
                        <label className="block text-2xl font-black uppercase mb-2">Password</label>
                        <input type="password" className="w-full bg-white text-black border-4 border-white p-4 font-bold outline-none focus:ring-4 ring-yellow-400" />
                    </div>
                    <button className="bg-yellow-400 text-black px-8 py-4 text-2xl font-black uppercase hover:bg-white transition-colors">
                        Enter
                    </button>
                </form>
            </div>
        </main>
    );
}
