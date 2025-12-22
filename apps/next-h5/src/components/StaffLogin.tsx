'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffLogin() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');

        // In a real app, this would be a server action with proper auth
        // For now, we'll just redirect to /staff and let the server-side check handle it
        // or we could do a quick check here.
        
        router.push(`/staff?email=${encodeURIComponent(email)}`);
    }

    return (
        <div className="bg-black text-white border-8 border-white p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-5xl font-black uppercase mb-8">Staff Login</h2>
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-xl font-black uppercase">Staff Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        className="w-full border-4 border-white bg-black p-4 text-xl focus:bg-zinc-800 outline-none transition-colors text-white"
                        placeholder="yourname@halle5.at"
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full bg-white text-black py-6 text-3xl font-black uppercase hover:bg-yellow-400 transition-all"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
