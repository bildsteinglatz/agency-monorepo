'use client';

import { useAuth } from '@/context/AuthContext';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Shield, Star, Briefcase, Users, Settings } from 'lucide-react';

export default function ProfilePage() {
    const { user, profile, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

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
            <div className="max-w-4xl mx-auto">
                <m.div 
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="border-8 border-black p-8 md:p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
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
                            className="bg-black text-white px-8 py-4 text-xl font-black uppercase hover:bg-[#fdc800] transition-colors shadow-[8px_8px_0px_0px_rgba(253,200,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        >
                            Abmelden
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2 text-black">Deine Rollen</h2>
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

                            <div>
                                <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2 text-black">Status</h2>
                                <div className="p-4 border-4 border-black font-bold uppercase text-black">
                                    {profile.roles.includes('member') ? (
                                        <div className="text-[#fdc800]">Aktives Mitglied — Danke für deinen Support!</div>
                                    ) : (
                                        <div>Basis-Account</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 border-4 border-black">
                            <h2 className="text-2xl font-black uppercase mb-4 text-black">Ökosystem</h2>
                            <p className="font-bold uppercase text-sm leading-relaxed mb-6 text-black">
                                Als Teil der Halle 5 hast du Zugriff auf verschiedene Bereiche. Je nach Rolle kannst du Workshops buchen, deine Kunst präsentieren oder das Studio nutzen.
                            </p>
                            <div className="space-y-2">
                                <button className="w-full text-left p-3 border-2 border-black font-black uppercase text-xs hover:bg-black hover:text-white transition-colors text-black">
                                    Meine Workshops
                                </button>
                                <button className="w-full text-left p-3 border-2 border-black font-black uppercase text-xs hover:bg-black hover:text-white transition-colors text-black">
                                    Mitgliedschaft verwalten
                                </button>
                                {profile.roles.includes('artist') && (
                                    <button className="w-full text-left p-3 border-2 border-black font-black uppercase text-xs bg-[#fdc800] text-white hover:bg-black transition-colors">
                                        Artist Dashboard
                                    </button>
                                )}
                                {profile.roles.includes('admin') && (
                                    <button className="w-full text-left p-3 border-2 border-black font-black uppercase text-xs bg-black text-white hover:bg-[#fdc800] transition-colors">
                                        Admin Panel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </m.div>
            </div>
        </main>
    );
}
