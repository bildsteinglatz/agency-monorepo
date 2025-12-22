'use client'

import { useState } from 'react';
import { registerVisitor } from '@/app/actions/registerVisitor';

export default function DsvgoForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    async function handleSubmit(formData: FormData) {
        setStatus('loading');
        const result = await registerVisitor(formData);

        if (result.success) {
            setStatus('success');
            setMessage('Vielen Dank! Ihre Registrierung war erfolgreich. Sie erhalten in Kürze eine Bestätigungs-Email.');
        } else {
            setStatus('error');
            setMessage(result.error || 'Ein Fehler ist aufgetreten.');
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-green-400 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-3xl mb-4 uppercase">Erfolgreich!</h3>
                <p className="text-xl font-bold">{message}</p>
                <button 
                    onClick={() => setStatus('idle')}
                    className="mt-6 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all font-black uppercase"
                >
                    Zurück
                </button>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-2">
                <label className="block text-xl font-black uppercase">Name *</label>
                <input 
                    name="name" 
                    type="text" 
                    required 
                    className="w-full border-4 border-black p-4 text-xl focus:bg-yellow-100 outline-none transition-colors"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-xl font-black uppercase">Email *</label>
                <input 
                    name="email" 
                    type="email" 
                    required 
                    className="w-full border-4 border-black p-4 text-xl focus:bg-yellow-100 outline-none transition-colors"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-xl font-black uppercase">Adresse</label>
                <textarea 
                    name="address" 
                    rows={3}
                    className="w-full border-4 border-black p-4 text-xl focus:bg-yellow-100 outline-none transition-colors"
                />
            </div>

            <div className="space-y-4 pt-4">
                <label className="flex items-start gap-4 cursor-pointer group">
                    <input 
                        name="dsvgoAccepted" 
                        type="checkbox" 
                        required 
                        className="mt-1 w-6 h-6 border-4 border-black checked:bg-black appearance-none cursor-pointer"
                    />
                    <span className="text-lg font-bold leading-tight group-hover:underline">
                        Ich akzeptiere die Datenschutzerklärung (DSVGO) *
                    </span>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group">
                    <input 
                        name="newsletterSubscribed" 
                        type="checkbox" 
                        className="mt-1 w-6 h-6 border-4 border-black checked:bg-black appearance-none cursor-pointer"
                    />
                    <span className="text-lg font-bold leading-tight group-hover:underline">
                        Ich möchte den Newsletter abonnieren
                    </span>
                </label>
            </div>

            {status === 'error' && (
                <p className="text-red-600 font-black uppercase">{message}</p>
            )}

            <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-black text-white py-6 text-3xl font-black uppercase hover:bg-yellow-400 hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
                {status === 'loading' ? 'Wird gesendet...' : 'Registrieren'}
            </button>
        </form>
    );
}
