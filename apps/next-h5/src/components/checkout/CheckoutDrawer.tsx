'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { X, CheckCircle, Lock, CreditCard, Banknote, User, Mail, Key, ArrowRight, CheckCircle2, QrCode } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth } from '@/firebase/config';

import { useRouter } from 'next/navigation';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    item?: {
        id: string;
        title: string;
        subtitle?: string;
        price: number; // Price in full euros
        date?: string;
        type: 'workshop' | 'membership' | 'product';
    };
    items?: Array<{
        id: string;
        title: string;
        subtitle?: string;
        price: number;
        date?: string;
        type: 'workshop' | 'membership' | 'product';
    }>;
}

type CheckoutStep = 'summary' | 'auth' | 'billing' | 'payment' | 'success';

export function CheckoutDrawer(props: CheckoutDrawerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <Elements stripe={stripePromise}>
            <CheckoutDrawerContent {...props} />
        </Elements>,
        document.body
    );
}

function CheckoutDrawerContent({ isOpen, onClose, item, items }: CheckoutDrawerProps) {
    const { user, profile, updateBillingAddress } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<CheckoutStep>('summary');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const stripe = useStripe();
    const elements = useElements();

    // Normalize items
    const checkoutItems = items || (item ? [item] : []);
    const totalAmount = checkoutItems.reduce((sum, i) => sum + i.price, 0);

    // Auth State
    const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Billing State
    const [billingData, setBillingData] = useState({
        firstName: '',
        lastName: '',
        street: '',
        zip: '',
        city: '',
        country: 'Österreich'
    });

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedRevocation, setAcceptedRevocation] = useState(false);

    // Auto-advance logic
    useEffect(() => {
        if (isOpen) {
            if (step === 'summary') {
                // If user is logged in, check billing. If not, go to auth.
                if (user) {
                    if (profile?.billingAddress) {
                        setBillingData(profile.billingAddress);
                        setStep('payment');
                    } else {
                        setStep('billing');
                    }
                } else {
                    setStep('auth');
                }
            }
        }
    }, [isOpen, user, profile, step]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(firebaseAuth, email, password);
                // Step will auto-advance via useEffect
            } else if (authMode === 'register') {
                await createUserWithEmailAndPassword(firebaseAuth, email, password);
                // Step will auto-advance via useEffect
            }
        } catch (error: any) {
            console.error("Auth failed:", error);
            setErrorMessage(error.message || "Authentifizierung fehlgeschlagen.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePayment = async () => {
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            if (paymentMethod === 'card') {
                if (!stripe || !elements) {
                    throw new Error("Stripe not initialized");
                }

                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                    throw new Error("Card element not found");
                }

                // 1. Create Payment Intent
                const response = await fetch('/api/checkout/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: totalAmount * 100, // Convert to cents
                        currency: 'eur',
                        metadata: {
                            userId: user?.uid,
                            itemIds: checkoutItems.map(i => i.id).join(','),
                            itemTitles: checkoutItems.map(i => i.title).join(', ')
                        }
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Payment initialization failed');
                }

                const { clientSecret } = await response.json();

                // 2. Confirm Payment
                const result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: `${billingData.firstName} ${billingData.lastName}`,
                            email: user?.email || undefined,
                            address: {
                                line1: billingData.street,
                                city: billingData.city,
                                postal_code: billingData.zip,
                                country: billingData.country === 'Österreich' ? 'AT' : billingData.country === 'Deutschland' ? 'DE' : 'CH', // Simple mapping
                            }
                        }
                    }
                });

                if (result.error) {
                    throw new Error(result.error.message);
                }

                if (result.paymentIntent?.status === 'succeeded') {
                    // Create booking records
                    for (const item of checkoutItems) {
                        await fetch('/api/bookings/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: user?.uid,
                                itemId: item.id,
                                itemType: item.type,
                                itemTitle: item.title,
                                amount: item.price * 100,
                                paymentMethod: 'card',
                                status: 'paid',
                                paymentIntentId: result.paymentIntent.id,
                                billingDetails: billingData
                            })
                        });
                    }
                    setStep('success');
                }
            } else {
                // Handle Bank Transfer (Invoice)
                for (const item of checkoutItems) {
                    await fetch('/api/bookings/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user?.uid,
                            itemId: item.id,
                            itemType: item.type,
                            itemTitle: item.title,
                            amount: item.price * 100,
                            paymentMethod: 'transfer',
                            status: 'pending_transfer',
                            billingDetails: billingData
                        })
                    });
                }
                setStep('success');
            }
        } catch (error: any) {
            console.error("Payment failed:", error);
            setErrorMessage(error.message || "Zahlung fehlgeschlagen. Bitte versuche es erneut.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <div className="fixed inset-0 z-[101] flex justify-end pointer-events-none">
                        <m.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-md h-full bg-white shadow-2xl pointer-events-auto flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b-4 border-black flex justify-between items-start bg-white z-10">
                                <div>
                                    <h2 className="text-2xl font-black uppercase leading-none mb-1">Checkout</h2>
                                    <p className="text-sm font-bold text-black uppercase">Schritt {getStepNumber(step)} von 3</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-black hover:text-white rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* A. Summary (Always Visible) */}
                                <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <h3 className="font-black uppercase text-lg mb-4 border-b-2 border-black pb-2">Zusammenfassung</h3>
                                    <div className="space-y-4 mb-4">
                                        {checkoutItems.map((item, idx) => (
                                            <div key={idx} className="border-b-2 border-black pb-2 last:border-0">
                                                <h4 className="font-black uppercase text-sm">{item.title}</h4>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-[10px] font-bold uppercase">{item.date || 'Sofort verfügbar'}</p>
                                                    <p className="text-sm font-black">€ {item.price},-</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-end mt-4 border-t-4 border-black pt-4">
                                        <p className="text-xs font-bold uppercase text-black">Gesamtbetrag</p>
                                        <p className="text-2xl font-black text-[#FF3100]">€ {totalAmount},-</p>
                                    </div>
                                </div>

                                {/* B. Auth Gate */}
                                {step === 'auth' && (
                                    <div className="space-y-6">
                                        <div className="flex border-4 border-black p-1 bg-black">
                                            <button 
                                                onClick={() => setAuthMode('login')}
                                                className={`flex-1 py-2 font-black uppercase text-sm transition-colors ${authMode === 'login' ? 'bg-white text-black' : 'text-white hover:bg-[#FF3100]'}`}
                                            >
                                                Einloggen
                                            </button>
                                            <button 
                                                onClick={() => setAuthMode('register')}
                                                className={`flex-1 py-2 font-black uppercase text-sm transition-colors ${authMode === 'register' ? 'bg-white text-black' : 'text-white hover:bg-[#FF3100]'}`}
                                            >
                                                Registrieren
                                            </button>
                                            <button 
                                                onClick={() => setAuthMode('guest')}
                                                className={`flex-1 py-2 font-black uppercase text-sm transition-colors ${authMode === 'guest' ? 'bg-white text-black' : 'text-white hover:bg-[#FF3100]'}`}
                                            >
                                                Gast
                                            </button>
                                        </div>

                                        {authMode === 'guest' ? (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                                <p className="text-sm font-bold text-black leading-relaxed">
                                                    Du kannst auch ohne Account fortfahren. Deine Daten werden nur für diese Buchung verwendet.
                                                </p>
                                                <button 
                                                    onClick={() => setStep('billing')}
                                                    className="w-full bg-black text-white p-4 font-black uppercase hover:bg-[#FF3100] transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Als Gast fortfahren <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleAuth} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                                <div>
                                                    <label className="block text-xs font-black uppercase mb-1">E-Mail Adresse</label>
                                                    <input 
                                                        required 
                                                        type="email" 
                                                        className="w-full border-4 border-black p-3 font-bold focus:ring-0 focus:border-[#FF3100] outline-none"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        placeholder="deine@email.at"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black uppercase mb-1">Passwort</label>
                                                    <input 
                                                        required 
                                                        type="password" 
                                                        className="w-full border-4 border-black p-3 font-bold focus:ring-0 focus:border-[#FF3100] outline-none"
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                {errorMessage && (
                                                    <p className="text-xs font-bold text-[#FF3100] uppercase">{errorMessage}</p>
                                                )}
                                                <button 
                                                    disabled={isSubmitting}
                                                    type="submit"
                                                    className="w-full bg-black text-white p-4 font-black uppercase hover:bg-[#FF3100] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? 'Wird geladen...' : authMode === 'login' ? 'Einloggen' : 'Account erstellen'}
                                                    {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {/* C. Billing Details */}
                                {step === 'billing' && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black uppercase">Rechnungsdaten</h3>
                                        <form className="space-y-4" onSubmit={async (e) => { 
                                            e.preventDefault(); 
                                            setIsSubmitting(true);
                                            try {
                                                await updateBillingAddress(billingData);
                                                setStep('payment');
                                            } catch (error) {
                                                console.error("Failed to update billing address:", error);
                                                setErrorMessage("Fehler beim Speichern der Adresse.");
                                            } finally {
                                                setIsSubmitting(false);
                                            }
                                        }}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-black uppercase mb-1">Vorname</label>
                                                    <input required type="text" className="w-full border-4 border-black p-3 font-bold" 
                                                        value={billingData.firstName} onChange={e => setBillingData({...billingData, firstName: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black uppercase mb-1">Nachname</label>
                                                    <input required type="text" className="w-full border-4 border-black p-3 font-bold" 
                                                        value={billingData.lastName} onChange={e => setBillingData({...billingData, lastName: e.target.value})} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase mb-1">Straße / Nr.</label>
                                                <input required type="text" className="w-full border-4 border-black p-3 font-bold" 
                                                    value={billingData.street} onChange={e => setBillingData({...billingData, street: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="col-span-1">
                                                    <label className="block text-xs font-black uppercase mb-1">PLZ</label>
                                                    <input required type="text" className="w-full border-4 border-black p-3 font-bold" 
                                                        value={billingData.zip} onChange={e => setBillingData({...billingData, zip: e.target.value})} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-black uppercase mb-1">Ort</label>
                                                    <input required type="text" className="w-full border-4 border-black p-3 font-bold" 
                                                        value={billingData.city} onChange={e => setBillingData({...billingData, city: e.target.value})} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase mb-1">Land</label>
                                                <select className="w-full border-4 border-black p-3 font-bold bg-white" 
                                                    value={billingData.country} onChange={e => setBillingData({...billingData, country: e.target.value})}>
                                                    <option value="Österreich">Österreich</option>
                                                    <option value="Deutschland">Deutschland</option>
                                                    <option value="Schweiz">Schweiz</option>
                                                </select>
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={isSubmitting}
                                                className="w-full bg-black text-white p-4 font-black uppercase hover:bg-[#FF3100] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? 'Speichere...' : 'Weiter zur Zahlung'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* D. Payment & Legal */}
                                {step === 'payment' && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black uppercase">Zahlung</h3>
                                        
                                        {/* Payment Methods */}
                                        <div className="space-y-3">
                                            <label className={`flex items-center p-4 border-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#FF3100] bg-white' : 'border-black bg-white'}`}>
                                                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="mr-3 w-5 h-5 accent-[#FF3100]" />
                                                <CreditCard className="w-6 h-6 mr-3" />
                                                <span className="font-bold uppercase">Kreditkarte / Apple Pay</span>
                                            </label>
                                            
                                            {/* Stripe Card Element */}
                                            {paymentMethod === 'card' && (
                                                <div className="p-4 border-4 border-black bg-white animate-in fade-in slide-in-from-top-2">
                                                    <CardElement options={{
                                                        style: {
                                                            base: {
                                                                fontSize: '16px',
                                                                color: '#000000',
                                                                fontFamily: 'Inter, sans-serif',
                                                                '::placeholder': {
                                                                    color: '#000000',
                                                                },
                                                            },
                                                            invalid: {
                                                                color: '#FF3100',
                                                            },
                                                        },
                                                    }} />
                                                </div>
                                            )}

                                            <label className={`flex items-center p-4 border-4 cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-[#FF3100] bg-white' : 'border-black bg-white'}`}>
                                                <input type="radio" name="payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="mr-3 w-5 h-5 accent-[#FF3100]" />
                                                <Banknote className="w-6 h-6 mr-3" />
                                                <span className="font-bold uppercase">Direkt Überweisung</span>
                                            </label>

                                            {paymentMethod === 'transfer' && (
                                                <div className="p-4 border-4 border-black bg-white space-y-4 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex justify-center bg-white p-2 border-2 border-black">
                                                        <QrCode className="w-32 h-32" />
                                                    </div>
                                                    <div className="text-xs font-bold uppercase space-y-1">
                                                        <p>Empfänger: Agency Mono</p>
                                                        <p>IBAN: AT12 3456 7890 1234 5678</p>
                                                        <p>BIC: RZBAATWW</p>
                                                        <p>Verwendungszweck: {checkoutItems[0]?.title.substring(0, 20)}...</p>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-black leading-tight">
                                                        Bitte überweise den Betrag innerhalb von 3 Tagen. Deine Buchung wird nach Zahlungseingang bestätigt.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Legal Checkboxes */}
                                        <div className="space-y-3 pt-4 border-t-4 border-black">
                                            <label className="flex items-start cursor-pointer group">
                                                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 mr-3 w-5 h-5 accent-[#FF3100] border-2 border-black" />
                                                <span className="text-sm text-black font-bold leading-tight">Ich akzeptiere die <a href="#" className="underline decoration-2">AGB</a> und die <a href="#" className="underline decoration-2">Datenschutzerklärung</a>.</span>
                                            </label>
                                            <label className="flex items-start cursor-pointer group">
                                                <input type="checkbox" checked={acceptedRevocation} onChange={e => setAcceptedRevocation(e.target.checked)} className="mt-1 mr-3 w-5 h-5 accent-[#FF3100] border-2 border-black" />
                                                <span className="text-sm text-black font-bold leading-tight">Ich stimme der sofortigen Ausführung der Dienstleistung zu und nehme zur Kenntnis, dass ich mein Widerrufsrecht bei vollständiger Vertragserfüllung verliere.</span>
                                            </label>
                                        </div>

                                        {errorMessage && (
                                            <div className="p-4 bg-white border-4 border-[#FF3100] text-[#FF3100]">
                                                <p className="font-black uppercase text-xs">Fehler</p>
                                                <p className="font-bold text-sm">{errorMessage}</p>
                                            </div>
                                        )}

                                        <button 
                                            onClick={handlePayment}
                                            disabled={!acceptedTerms || !acceptedRevocation || isSubmitting}
                                            className="w-full bg-[#FF3100] text-white p-4 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? 'Verarbeite...' : paymentMethod === 'card' ? 'Jetzt bezahlen' : 'Kostenpflichtig buchen'}
                                            {!isSubmitting && <CheckCircle2 className="w-6 h-6" />}
                                        </button>
                                    </div>
                                )}

                                {/* E. Success */}
                                {step === 'success' && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in zoom-in-95 duration-300">
                                        <div className="w-24 h-24 bg-[#FF3100] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <CheckCircle2 className="w-12 h-12 text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black uppercase">Erfolgreich!</h3>
                                            <p className="font-bold text-black">Vielen Dank für deine Buchung.</p>
                                        </div>
                                        <div className="bg-white border-4 border-black p-4 w-full text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <p className="text-xs font-black uppercase mb-2">Zusammenfassung</p>
                                            <div className="space-y-2">
                                                {checkoutItems.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center">
                                                        <p className="font-bold text-sm">{item.title}</p>
                                                        <p className="text-sm font-bold">€ {item.price},-</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs font-bold mt-4 uppercase border-t-2 border-black pt-2">Gesamt: € {totalAmount},-</p>
                                            <p className="text-xs font-bold mt-1 uppercase">Status: {paymentMethod === 'card' ? 'Bezahlt' : 'Warten auf Überweisung'}</p>
                                        </div>
                                        <p className="text-xs font-bold text-black uppercase leading-relaxed">
                                            Du erhältst in Kürze eine Bestätigung per E-Mail mit allen weiteren Details.
                                        </p>
                                        <button 
                                            onClick={onClose}
                                            className="w-full bg-black text-white p-4 font-black uppercase hover:bg-[#FF3100] transition-colors"
                                        >
                                            Schließen
                                        </button>
                                    </div>
                                )}
                            </div>
                        </m.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

function getStepNumber(step: CheckoutStep): number {
    switch (step) {
        case 'summary': return 1;
        case 'auth': return 1;
        case 'billing': return 2;
        case 'payment': return 3;
        case 'success': return 3;
    }
}
