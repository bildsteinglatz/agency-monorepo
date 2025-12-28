import DsvgoForm from "@/components/DsvgoForm";
import StaffLogin from "@/components/StaffLogin";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-white text-black font-black uppercase flex items-center justify-center p-4 pb-12 md:pb-32">
            <section className="w-full max-w-4xl space-y-8">
                <div className="bg-yellow-400 border-8 border-black p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center">
                    <h2 className="text-3xl md:text-4xl mb-2 tracking-tighter">Besucher-Registrierung</h2>
                    <p className="text-2xl leading-tight font-bold">
                        Registrieren Sie sich hier für Ihren Besuch.
                    </p>
                </div>
                <div className="w-full">
                    <DsvgoForm />
                </div>
            </section>
        </main>
    );
}
