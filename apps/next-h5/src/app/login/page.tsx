'use client';

import { useState, useEffect } from 'react';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Check if this is a magic link redirect
        if (isSignInWithEmailLink(auth, window.location.href)) {
            setStatus('verifying');
            let emailForSignIn = window.localStorage.getItem('emailForSignIn');
            
            if (!emailForSignIn) {
                // If email is missing from local storage, ask user for it
                emailForSignIn = window.prompt('Bitte bestätige deine Email-Adresse zur Anmeldung:');
            }

            if (emailForSignIn) {
                signInWithEmailLink(auth, emailForSignIn, window.location.href)
                    .then((result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        setStatus('success');
                        // Redirect to profile or home
                        setTimeout(() => router.push('/profile'), 1500);
                    })
                    .catch((error) => {
                        console.error(error);
                        setStatus('error');
                        setErrorMessage('Der Link ist ungültig oder abgelaufen. Bitte versuche es erneut.');
                    });
            } else {
                 setStatus('idle'); // Fallback to login form if user cancels prompt
            }
        }
    }, [router]);

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be in the authorized domains list in the Firebase Console.
            url: window.location.origin + '/login',
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setStatus('sent');
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setErrorMessage('Konnte Email nicht senden. Bitte prüfe die Adresse.');
        }
    };

    return (
        <main className="min-h-screen bg-white flex items-center justify-center p-4">
            <m.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="border-8 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <h1 className="text-4xl font-black uppercase mb-8 text-center leading-none text-black">
                        Login
                    </h1>

                    {status === 'verifying' && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
                            <p className="font-bold uppercase text-black">Verifiziere Link...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <p className="font-bold uppercase text-xl mb-2 text-black">Erfolgreich!</p>
                            <p className="text-sm text-gray-600">Du wirst weitergeleitet...</p>
                        </div>
                    )}

                    {status === 'sent' && (
                        <div className="text-center py-8">
                            <Mail className="w-16 h-16 mx-auto mb-4 text-[#FF3100]" />
                            <h2 className="font-black uppercase text-xl mb-4 text-black">Email gesendet!</h2>
                            <p className="font-bold text-sm mb-6 text-black">
                                Wir haben einen Magic Link an <span className="underline">{email}</span> gesendet.
                                Klicke auf den Link in der Email, um dich anzumelden.
                            </p>
                            <button 
                                onClick={() => setStatus('idle')}
                                className="text-sm font-black uppercase underline hover:text-[#FF3100] text-black"
                            >
                                Zurück zum Login
                            </button>
                        </div>
                    )}

                    {(status === 'idle' || status === 'sending' || status === 'error') && (
                        <form onSubmit={handleSendLink} className="space-y-6">
                            {status === 'error' && (
                                <div className="bg-red-100 border-2 border-red-500 p-4 flex items-start gap-3">
                                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                                    <p className="font-bold text-red-500 text-sm uppercase">{errorMessage}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block font-black uppercase text-sm mb-2 text-black">
                                    Email Adresse
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="DEINE@EMAIL.COM"
                                    className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-[#FF3100]/20 placeholder:text-gray-300 text-black"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-black text-white p-4 font-black uppercase text-xl hover:bg-[#FF3100] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'sending' ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Sende...
                                    </>
                                ) : (
                                    <>
                                        Magic Link Senden
                                        <ArrowRight className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                            
                            <p className="text-xs font-bold text-center text-gray-400 uppercase mt-4">
                                Wir senden dir einen Link zum Einloggen. Kein Passwort nötig.
                            </p>
                        </form>
                    )}
                </div>
            </m.div>
        </main>
    );
}