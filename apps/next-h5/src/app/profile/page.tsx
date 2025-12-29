'use client';

import { useAuth } from '@/context/AuthContext';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Shield, Star, Briefcase, Users, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, profile, loading, logout } = useAuth();
    const router = useRouter();
    const [myWorkshops, setMyWorkshops] = useState<any[]>([]);
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
                    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
                    const snapshot = await getDocs(q);
                    const workshops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setMyWorkshops(workshops);
                } catch (error) {
                    console.error("Error fetching workshops:", error);
                }
            };
            fetchWorkshops();
            
            // Load preferences if they exist in profile (mocking for now as they might not be in schema yet)
            if (profile) {
                // In a real app, these would come from the profile document
                // setPreferences(profile.preferences || defaultPreferences)
            }
        }
    }, [user, profile]);

    const togglePreference = async (key: keyof typeof preferences) => {
        const newValue = !preferences[key];
        setPreferences(prev => ({ ...prev, [key]: newValue }));
        
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                // We use dot notation to update nested fields in Firestore
                // Note: This assumes a 'preferences' map exists or will be created
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Column 1: Status & Roles */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                                    <span className="w-4 h-4 bg-[#FF3100] border border-black block"></span>
                                    Status
                                </h2>
                                <div className="p-6 border-4 border-black font-bold uppercase text-black bg-gray-50">
                                    {profile.roles.includes('member') ? (
                                        <div>
                                            <div className="text-[#FF3100] text-xl mb-2">Aktives Mitglied</div>
                                            <p className="text-sm normal-case mb-4">Danke für deinen Support! Deine Mitgliedschaft ist aktiv.</p>
                                            <button className="w-full bg-black text-white py-2 text-sm font-black uppercase hover:bg-gray-800">
                                                Verwalten
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-xl mb-2">Basis-Account</div>
                                            <p className="text-sm normal-case mb-4">Werde Mitglied und unterstütze die Halle 5.</p>
                                            <button className="w-full bg-[#FF3100] text-white py-2 text-sm font-black uppercase hover:bg-red-600 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                                                Mitglied werden
                                            </button>
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
                                            <div key={workshop.id} className="border-4 border-black p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                                <div>
                                                    <h3 className="text-xl font-black uppercase">{workshop.workshopTitle}</h3>
                                                    <p className="font-bold text-gray-600">{workshop.workshopDate}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block px-3 py-1 text-xs font-black uppercase border-2 border-black ${
                                                        workshop.status === 'confirmed' ? 'bg-green-300' : 'bg-yellow-300'
                                                    }`}>
                                                        {workshop.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-4 border-dashed border-gray-300 p-12 text-center">
                                        <p className="font-bold text-gray-400 uppercase">Keine aktiven Workshops.</p>
                                        <Link href="/workshops" className="inline-block mt-4 text-black font-black uppercase underline hover:text-[#FF3100]">
                                            Jetzt Workshops entdecken
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Preferences */}
                            <div>
                                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                                    <span className="w-4 h-4 bg-[#FF3100] border border-black block"></span>
                                    Einstellungen
                                </h2>
                                <div className="border-4 border-black p-8 bg-white">
                                    <h3 className="text-xl font-black uppercase mb-6">Newsletter Präferenzen</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold uppercase">Events & Ausstellungen</span>
                                            <button onClick={() => togglePreference('newsletterEvents')}>
                                                {preferences.newsletterEvents ? <ToggleRight className="w-10 h-10 text-[#FF3100]" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold uppercase">Kids & Pinguin Atelier</span>
                                            <button onClick={() => togglePreference('newsletterKids')}>
                                                {preferences.newsletterKids ? <ToggleRight className="w-10 h-10 text-[#FF3100]" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold uppercase">Pottery & Keramik</span>
                                            <button onClick={() => togglePreference('newsletterPottery')}>
                                                {preferences.newsletterPottery ? <ToggleRight className="w-10 h-10 text-[#FF3100]" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </m.div>
            </div>
        </main>
    );
}
