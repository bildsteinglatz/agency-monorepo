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
            setMessage('Vielen Dank! Ihre Registrierung war erfolgreich.');
        } else {
            setStatus('error');
            setMessage(result.error || 'Ein Fehler ist aufgetreten.');
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-green-400 border-8 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center">
                <h3 className="text-4xl mb-4 uppercase tracking-tighter">Erfolgreich!</h3>
                <p className="text-2xl font-bold">{message}</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-8 border-4 border-black bg-white px-8 py-4 hover:bg-black hover:text-white transition-all font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                    Zurück
                </button>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-4 bg-white border-8 border-black p-6 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-xl font-black uppercase">Name *</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="w-full border-4 border-black p-4 text-xl focus:bg-yellow-400 outline-none transition-colors placeholder-black"
                        placeholder="NAME"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-xl font-black uppercase">Email *</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full border-4 border-black p-4 text-xl focus:bg-yellow-400 outline-none transition-colors placeholder-black"
                        placeholder="EMAIL"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t-4 border-black mt-4">
                <label className="flex items-start gap-4 cursor-pointer group hover:bg-yellow-400 p-2 transition-colors border-2 border-transparent hover:border-black">
                    <input
                        name="privacyAccepted"
                        type="checkbox"
                        required
                        className="w-8 h-8 flex-shrink-0 border-4 border-black checked:bg-black accent-black cursor-pointer"
                    />
                    <span className="text-lg font-bold leading-tight group-hover:underline uppercase">
                        Datenschutz: Ich akzeptiere die Datenschutzerklärung. Ich bin damit einverstanden, dass meine Daten (Name, E-Mail, Anschrift) zum Zweck der Workshop-Abwicklung gespeichert werden. *
                    </span>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group hover:bg-yellow-400 p-2 transition-colors border-2 border-transparent hover:border-black">
                    <input
                        name="liabilityAccepted"
                        type="checkbox"
                        required
                        className="w-8 h-8 flex-shrink-0 border-4 border-black checked:bg-black accent-black cursor-pointer"
                    />
                    <span className="text-lg font-bold leading-tight group-hover:underline uppercase">
                        Haftung: Ich bestätige, dass die Teilnahme am Workshop auf eigenes Risiko erfolgt und ich die Haftungsfreistellung in Punkt 4 des Impressums gelesen und akzeptiert habe. *
                    </span>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group hover:bg-yellow-400 p-2 transition-colors border-2 border-transparent hover:border-black">
                    <input
                        name="photoConsent"
                        type="checkbox"
                        className="w-8 h-8 flex-shrink-0 border-4 border-black checked:bg-black accent-black cursor-pointer"
                    />
                    <span className="text-lg font-bold leading-tight group-hover:underline uppercase">
                        Bildaufnahmen: Ich erkläre mich damit einverstanden, dass während des Workshops Fotografien und Videoaufnahmen von mir und meinen Arbeiten zu Dokumentationszwecken erstellt und veröffentlicht werden dürfen. Diese Einwilligung kann ich jederzeit widerrufen.
                    </span>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group hover:bg-yellow-400 p-2 transition-colors border-2 border-transparent hover:border-black">
                    <input
                        name="newsletterSubscribed"
                        type="checkbox"
                        className="w-8 h-8 flex-shrink-0 border-4 border-black checked:bg-black accent-black cursor-pointer"
                    />
                    <span className="text-lg font-bold leading-tight group-hover:underline uppercase">
                        Newsletter: Ich möchte über zukünftige Events und Projekte per E-Mail informiert werden (optional).
                    </span>
                </label>
            </div>

            {status === 'error' && (
                <div className="bg-red-600 text-white p-4 font-bold border-4 border-black">
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-black text-white py-6 text-3xl font-black uppercase hover:bg-[#FF3100] hover:text-white transition-all shadow-[8px_8px_0px_0px_#000000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] border-4 border-transparent hover:border-black mt-8"
            >
                {status === 'loading' ? '...' : 'Registrieren'}
            </button>
        </form>
    );
}
