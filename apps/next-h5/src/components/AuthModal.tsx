'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onClose();
        } catch (err: any) {
            console.error('Firebase Auth Error:', err);
            let message = 'Ein Fehler ist aufgetreten.';
            if (err.code === 'auth/invalid-credential') message = 'Ungültige E-Mail oder Passwort.';
            if (err.code === 'auth/user-not-found') message = 'Benutzer nicht gefunden.';
            if (err.code === 'auth/wrong-password') message = 'Falsches Passwort.';
            if (err.code === 'auth/email-already-in-use') message = 'Diese E-Mail wird bereits verwendet.';
            if (err.code === 'auth/invalid-api-key') message = 'Firebase Konfigurationsfehler (API Key).';
            if (err.code === 'auth/operation-not-allowed') message = 'Diese Login-Methode ist nicht aktiviert.';
            
            setError(message + ' (' + (err.code || 'error') + ')');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            onClose();
        } catch (err: any) {
            console.error('Firebase Google Auth Error:', err);
            setError('Google Login fehlgeschlagen: ' + (err.code || err.message));
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto pt-12 md:pt-24">
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    
                    <m.div
                        initial={{ y: '-100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-sm bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,49,0,1)] p-6 mb-12"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-3 right-3 bg-black text-white p-1.5 border-2 border-white hover:bg-[#FF3100] transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black uppercase leading-none tracking-tighter mb-1 text-black">
                                {isLogin ? 'Anmelden' : 'Registrieren'}
                            </h2>
                            <p className="text-xs font-bold uppercase text-black">
                                {isLogin ? 'Willkommen zurück.' : 'Werde Teil der Halle 5.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 text-black">E-Mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full border-2 border-black p-2 font-bold text-black outline-none focus:bg-white transition-colors placeholder:text-black"
                                    placeholder="deine@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 text-black">Passwort</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full border-2 border-black p-2 font-bold text-black outline-none focus:bg-white transition-colors placeholder:text-black"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <p className="text-[10px] font-bold text-[#FF3100] uppercase bg-[#FF3100]/10 p-2 border-2 border-[#FF3100]">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-3 text-lg font-black uppercase hover:bg-[#FF3100] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                            >
                                {loading ? 'Lädt...' : isLogin ? 'Anmelden' : 'Konto erstellen'}
                            </button>
                        </form>

                        <div className="mt-4 space-y-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-black"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black text-black">
                                    <span className="bg-white px-2">Oder</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                className="w-full border-2 border-black py-2 font-black uppercase text-black flex items-center justify-center gap-2 text-sm hover:bg-black hover:text-white transition-all"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Mit Google anmelden
                            </button>

                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="w-full text-xs font-black uppercase text-black hover:text-[#FF3100] transition-colors"
                            >
                                {isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits ein Konto? Hier anmelden'}
                            </button>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
