import DsvgoForm from "@/components/DsvgoForm";
import StaffLogin from "@/components/StaffLogin";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-white text-black font-black uppercase">
            <section className="bg-black text-white p-12 md:p-24 border-b-8 border-black">
                <h1 className="text-4xl md:text-6xl leading-none tracking-tighter">
                    Registrierung & Login
                </h1>
            </section>

            <section className="p-8 md:p-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-12">
                    <div className="bg-yellow-400 border-8 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-3xl md:text-4xl mb-6">Besucher-Registrierung</h2>
                        <p className="text-xl leading-tight">
                            Registrieren Sie sich hier für Ihren Besuch und (optional) unseren Newsletter. 
                            Ihre Daten werden gemäß DSVGO sicher verarbeitet.
                        </p>
                    </div>
                    <DsvgoForm />
                </div>

                <div className="space-y-12">
                    <div className="bg-blue-600 text-white border-8 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-3xl md:text-4xl mb-6">Team Login</h2>
                        <p className="text-xl leading-tight">
                            Interner Bereich für Teammitglieder und Staff.
                        </p>
                    </div>
                    <StaffLogin />
                </div>
            </section>
        </main>
    );
}
