'use client';

import { useState, useEffect, Suspense } from 'react';
import { isSignInWithEmailLink, signInWithEmailLink, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { m } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { sendLoginLink } from '@/app/actions/auth';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/profile';

    useEffect(() => {
        // Check if this is a magic link redirect
        if (isSignInWithEmailLink(auth, window.location.href)) {
            setStatus('verifying');
            let emailForSignIn = window.localStorage.getItem('emailForSignIn');
            
            if (!emailForSignIn) {
                // If email is missing from local storage, ask user for it
                // Use a custom UI state instead of window.prompt for better UX
                setStatus('idle');
                setErrorMessage('Bitte gib deine Email-Adresse erneut ein, um die Anmeldung abzuschließen.');
                return;
            }

            if (emailForSignIn) {
                signInWithEmailLink(auth, emailForSignIn, window.location.href)
                    .then((result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        setStatus('success');
                        // Redirect to returnUrl
                        setTimeout(() => router.push(returnUrl), 1500);
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
    }, [router, returnUrl]);

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // If we are in the verification flow but missing the email, try to complete sign-in
        if (isSignInWithEmailLink(auth, window.location.href)) {
            setStatus('verifying');
            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    window.localStorage.removeItem('emailForSignIn');
                    setStatus('success');
                    setTimeout(() => router.push(returnUrl), 1500);
                })
                .catch((error) => {
                    console.error(error);
                    setStatus('error');
                    setErrorMessage('Der Link ist ungültig oder abgelaufen. Bitte versuche es erneut.');
                });
            return;
        }

        setStatus('sending');
        setErrorMessage('');

        try {
            // Include returnUrl in the redirect URL for the magic link
            const redirectUrl = new URL(window.location.origin + '/login');
            if (searchParams.get('returnUrl')) {
                redirectUrl.searchParams.set('returnUrl', searchParams.get('returnUrl')!);
            }
            
            const result = await sendLoginLink(email, redirectUrl.toString());
            
            if (result.success) {
                window.localStorage.setItem('emailForSignIn', email);
                setStatus('sent');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setErrorMessage('Konnte Email nicht senden. Bitte prüfe die Adresse.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            setStatus('success');
            setTimeout(() => router.push(returnUrl), 1500);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage('Google Login fehlgeschlagen.');
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
                            <p className="text-sm text-black">Du wirst weitergeleitet...</p>
                        </div>
                    )}

                    {status === 'sent' && (
                        <div className="text-center py-8">
                            <Mail className="w-16 h-16 mx-auto mb-4 text-[#FF3100]" />
                            <h2 className="font-black uppercase text-xl mb-4 text-black">Email gesendet!</h2>
                            <p className="font-bold text-sm mb-6 text-black">
                                Wir haben einen Anmeldelink an <span className="underline">{email}</span> gesendet.
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
                                    className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-[#FF3100]/20 placeholder:text-black text-black"
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
                                        Einloggen / Registrieren
                                        <ArrowRight className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t-2 border-black"></div>
                                <span className="flex-shrink-0 mx-4 text-black text-xs font-bold uppercase">Oder</span>
                                <div className="flex-grow border-t-2 border-black"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full bg-white border-4 border-black text-black p-4 font-black uppercase text-lg hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Mit Google anmelden
                            </button>                            
                            <p className="text-xs font-bold text-center text-black uppercase mt-4">
                                Wir senden dir einen Link zum Einloggen oder Registrieren. Kein Passwort nötig.
                            </p>
                        </form>
                    )}
                </div>
            </m.div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-black" /></div>}>
            <LoginForm />
        </Suspense>
    );
}