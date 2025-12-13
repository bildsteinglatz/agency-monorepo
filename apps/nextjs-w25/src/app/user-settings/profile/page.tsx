'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
      } else {
        router.push('/user-settings');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, 'users', user.uid), { displayName });
      // Success feedback could go here
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="animate-pulse font-owners font-black italic text-xl uppercase">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/user-settings" className="flex items-center gap-2 text-sm uppercase font-bold opacity-50 hover:opacity-100 mb-4">
          <ArrowLeft size={16} /> Back to Control Room
        </Link>
        <h1 className="font-owners font-black italic text-4xl uppercase">Profile Settings</h1>
      </div>

      <div className="border border-foreground p-8">
        <form onSubmit={handleSave} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase opacity-70">Email Address</label>
            <div className="p-2 border-b border-foreground opacity-50 cursor-not-allowed">
              {user?.email}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase opacity-70">Display Name</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
              placeholder="Enter your name"
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-neon-orange text-black font-bold uppercase px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
