'use client';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { m, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Shield, Star, Briefcase, Users, Settings, ToggleLeft, ToggleRight, ShoppingBag, Trash2, LogOut, Calendar } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import { CheckoutDrawer } from '@/components/checkout/CheckoutDrawer';

export default function ProfilePage() {
    const { user, profile, loading, logout } = useAuth();
    const { items, removeFromCart, total, clearCart } = useCart();
    const router = useRouter();
    const [myWorkshops, setMyWorkshops] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'bookings' | 'cart' | 'settings'>('bookings');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [preferences, setPreferences] = useState({
        newsletterEvents: true,
        newsletterKids: false,
        newsletterPottery: false
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Fetch user's workshops
    useEffect(() => {
        if (user) {
            const fetchWorkshops = async () => {
                try {
                    const q = query(
                        collection(db, 'bookings'), 
                        where('userId', '==', user.uid),
                        orderBy('createdAt', 'desc')
                    );
                    const snapshot = await getDocs(q);
                    const workshops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setMyWorkshops(workshops);
                } catch (error) {
                    console.error("Error fetching workshops:", error);
                }
            };
            fetchWorkshops();
        }
    }, [user]);

    const togglePreference = async (key: keyof typeof preferences) => {
        const newValue = !preferences[key];
        setPreferences(prev => ({ ...prev, [key]: newValue }));
        
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    [`preferences.${key}`]: newValue
                });
            } catch (error) {
                console.error('Error updating preference:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-4xl font-black uppercase animate-pulse text-black">Lädt...</div>
            </div>
        );
    }

    if (!user || !profile) return null;

    const roleIcons: Record<string, any> = {
        'admin': Shield,
        'artist': Star,
        'member': Users,
        'partner': Briefcase,
        'workshop-attendy': Settings,
        'user': User
    };

    return (
        <main className="min-h-screen bg-white pt-24 pb-12 px-4 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <m.div 
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="border-8 border-black p-8 md:p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b-8 border-black pb-8">
                        <div>
                            <h1 className="text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter mb-4 text-black">
                                Profil
                            </h1>
                            <p className="text-xl font-bold uppercase text-black">
                                {user.email}
                            </p>
                        </div>
                        <button 
                            onClick={() => logout()}
                            className="bg-black text-white px-8 py-4 text-xl font-black uppercase hover:bg-[#FF3100] transition-colors shadow-[8px_8px_0px_0px_rgba(255,49,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        >
                            Abmelden
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b-4 border-black mb-12 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`px-8 py-4 font-black uppercase text-xl transition-colors whitespace-nowrap ${activeTab === 'bookings' ? 'bg-black text-white' : 'hover:bg-[#FF3100] hover:text-white'}`}
                        >
                            Meine Buchungen
                        </button>
                        <button
                            onClick={() => setActiveTab('cart')}
                            className={`px-8 py-4 font-black uppercase text-xl transition-colors whitespace-nowrap flex items-center gap-3 ${activeTab === 'cart' ? 'bg-black text-white' : 'hover:bg-[#FF3100] hover:text-white'}`}
                        >
                            Warenkorb
                            {items.length > 0 && (
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activeTab === 'cart' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                    {items.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-8 py-4 font-black uppercase text-xl transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-black text-white' : 'hover:bg-[#FF3100] hover:text-white'}`}
                        >
                            Einstellungen
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'bookings' && (
                            <m.div
                                key="bookings"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-12"
                            >
                                {/* Column 1: Status & Roles */}
                                <div className="space-y-12">
                                    <div>
                                        <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                                            <span className="w-4 h-4 bg-[#FF3100] border border-black block"></span>
                                            Status
                                        </h2>
                                        <div className="p-6 border-4 border-black font-bold uppercase text-black bg-white">
                                            {profile.roles.includes('member') ? (
                                                <div>
                                                    <div className="text-[#FF3100] text-xl mb-2">Aktives Mitglied</div>
                                                    <p className="text-sm normal-case mb-4">Danke für deinen Support! Deine Mitgliedschaft ist aktiv.</p>
                                                    <button className="w-full bg-black text-white py-2 text-sm font-black uppercase hover:bg-[#FF3100]">
                                                        Verwalten
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-xl mb-2">Basis-Account</div>
                                                    <p className="text-sm normal-case mb-4">Werde Mitglied und unterstütze die Halle 5.</p>
                                                    <Link href="/membership" className="block w-full bg-[#FF3100] text-white py-2 text-center text-sm font-black uppercase hover:bg-black border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1">
                                                        Mitglied werden
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-black uppercase mb-4 text-black">Deine Rollen</h2>
                                        <div className="flex flex-wrap gap-4">
                                            {profile.roles.map(role => {
                                                const Icon = roleIcons[role] || User;
                                                return (
                                                    <div 
                                                        key={role}
                                                        className="flex items-center gap-2 bg-black text-white px-4 py-2 font-black uppercase text-sm"
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        {role}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: My Ateliers / Workshops */}
                                <div className="lg:col-span-2 space-y-12">
                                    <div>
                                        <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                                            <span className="w-4 h-4 bg-[#FF3100] border border-black block"></span>
                                            Meine Ateliers
                                        </h2>
                                        {myWorkshops.length > 0 ? (
                                            <div className="grid gap-4">
                                                {myWorkshops.map((workshop) => (
                                                    <div key={workshop.id} className="border-4 border-black p-6 flex justify-between items-center hover:bg-[#FF3100] hover:text-white group transition-colors">
                                                        <div>
                                                            <h3 className="text-xl font-black uppercase">{workshop.itemTitle}</h3>
                                                            <p className="font-bold text-black group-hover:text-white">{workshop.itemDate || 'Sofort verfügbar'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`inline-block px-3 py-1 text-xs font-black uppercase border-2 border-black ${
                                                                workshop.status === 'paid' || workshop.status === 'confirmed' ? 'bg-green-300 text-black' : 'bg-yellow-300 text-black'
                                                            }`}>
                                                                {workshop.status === 'paid' || workshop.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="border-4 border-dashed border-black p-12 text-center">
                                                <p className="font-bold text-black uppercase">Keine aktiven Workshops.</p>
                                                <Link href="/workshops" className="inline-block mt-4 text-black font-black uppercase underline hover:text-[#FF3100]">
                                                    Jetzt Workshops entdecken
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </m.div>
                        )}

                        {activeTab === 'cart' && (
                            <m.div
                                key="cart"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                {items.length > 0 ? (
                                    <>
                                        <div className="space-y-4">
                                            {items.map((item) => (
                                                <div key={item.id} className="border-4 border-black p-8 flex items-center justify-between gap-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-black flex items-center justify-center shrink-0">
                                                            <ShoppingBag className="text-white w-8 h-8" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black uppercase text-2xl leading-tight">{item.title}</h3>
                                                            <p className="font-bold uppercase text-sm text-black">{item.type}</p>
                                                            <p className="font-black text-2xl mt-2">€ {item.price}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="p-4 hover:bg-[#FF3100] hover:text-white transition-colors border-4 border-transparent hover:border-black"
                                                    >
                                                        <Trash2 className="w-8 h-8" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t-8 border-black pt-12 mt-12">
                                            <div className="flex justify-between items-end mb-12">
                                                <p className="font-black uppercase text-4xl">Gesamtbetrag</p>
                                                <p className="font-black text-6xl">€ {total}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <button
                                                    onClick={() => clearCart()}
                                                    className="bg-white text-black border-8 border-black font-black uppercase py-6 text-2xl hover:bg-black hover:text-white transition-colors"
                                                >
                                                    Warenkorb leeren
                                                </button>
                                                <button
                                                    onClick={() => setIsCheckoutOpen(true)}
                                                    className="bg-[#FF3100] text-white border-8 border-black font-black uppercase py-6 text-2xl shadow-[12px_12px_0px_0px_#000000] hover:shadow-[16px_16px_0px_0px_#000000] transition-all hover:-translate-x-1 hover:-translate-y-1"
                                                >
                                                    Jetzt Bezahlen
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-24 text-center border-8 border-dashed border-black">
                                        <p className="font-black uppercase text-3xl mb-8">Dein Warenkorb ist leer</p>
                                        <Link href="/membership" className="inline-block bg-black text-white font-black uppercase px-12 py-6 text-xl border-4 border-black shadow-[10px_10px_0px_0px_#FF3100]">
                                            Angebote ansehen
                                        </Link>
                                    </div>
                                )}
                            </m.div>
                        )}

                        {activeTab === 'settings' && (
                            <m.div
                                key="settings"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="border-8 border-black p-12 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] bg-white"
                            >
                                <h3 className="font-black uppercase text-4xl mb-12">Kontoeinstellungen</h3>
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div>
                                            <label className="block font-black uppercase text-lg mb-4">Anzeigename</label>
                                            <input
                                                type="text"
                                                defaultValue={user.displayName || ''}
                                                className="w-full border-4 border-black p-4 font-black uppercase text-xl focus:bg-[#FF3100]/10 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-black uppercase text-lg mb-4">E-Mail</label>
                                            <input
                                                type="email"
                                                disabled
                                                defaultValue={user.email || ''}
                                                className="w-full border-4 border-black p-4 font-black uppercase text-xl bg-white cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-black uppercase text-2xl mb-8 border-b-4 border-black pb-4">Newsletter & Benachrichtigungen</h4>
                                        <div className="space-y-6">
                                            {Object.entries(preferences).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-4 border-4 border-black hover:bg-[#FF3100] hover:text-white group transition-colors">
                                                    <span className="font-black uppercase text-lg">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <button 
                                                        onClick={() => togglePreference(key as keyof typeof preferences)}
                                                        className="transition-transform active:scale-90"
                                                    >
                                                        {value ? (
                                                            <ToggleRight className="w-12 h-12 text-[#FF3100] group-hover:text-white" />
                                                        ) : (
                                                            <ToggleLeft className="w-12 h-12 text-black group-hover:text-white" />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="bg-black text-white font-black uppercase px-12 py-6 text-xl border-4 border-black hover:bg-[#FF3100] transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        Änderungen speichern
                                    </button>
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>
                </m.div>
            </div>

            {/* Checkout Drawer */}
            <CheckoutDrawer
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                items={items.map(item => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    type: item.type
                }))}
            />
        </main>
    );
}
