'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Lock, User as UserIcon, MapPin, Building, CreditCard } from 'lucide-react';
import Link from 'next/link';

const COUNTRIES = [
  'Österreich',
  'Schweiz',
  'Deutschland',
  'Sonstiges'
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Österreich');
  const [uid, setUid] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');

        // Fetch extra fields from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setStreet(data.street || '');
          setHouseNumber(data.houseNumber || '');
          setCity(data.city || '');
          setState(data.state || 'Österreich');
          setUid(data.uid || '');
        }
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
      await updateProfile(user, { displayName: `${firstName} ${lastName}`.trim() || displayName });
      await updateDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        street,
        houseNumber,
        city,
        state,
        uid,
        updatedAt: new Date()
      });
      alert('Profile updated successfully.');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Failed to update profile.');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Error updating password:", error);
      setPasswordError(error.message.replace('Firebase: ', ''));
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="animate-pulse font-owners font-black italic text-xl uppercase">Loading Protocol...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/user-settings" className="flex items-center gap-2 text-sm uppercase font-bold opacity-50 hover:opacity-100 mb-4">
          <ArrowLeft size={16} /> Back to Control Room Beta
        </Link>
        <h1 className="font-owners font-black italic text-4xl uppercase">Profile Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Personal Details */}
        <div className="border border-foreground p-8 bg-background">
          <h2 className="font-owners font-black italic text-2xl uppercase mb-6 flex items-center gap-2">
            <UserIcon size={20} /> Personal Information
          </h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-70">Vorname *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
                  placeholder="Max"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-70">Nachname *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
                  placeholder="Mustermann"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-70">Email Access</label>
              <div className="p-2 border-b border-foreground opacity-50 cursor-not-allowed">
                {user?.email}
              </div>
            </div>

            <h3 className="font-owners font-black italic text-lg uppercase mt-8 mb-4 flex items-center gap-2">
              <MapPin size={18} /> Address
            </h3>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-70">Strasse *</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
                  placeholder="Hauptstraße"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-70">Nr. *</label>
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
                  placeholder="42"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-70">Ort *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
                  placeholder="Wien"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-70">Staat *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none cursor-pointer appearance-none"
                  required
                >
                  {COUNTRIES.map(c => (
                    <option key={c} value={c} className="bg-background text-foreground">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className="font-owners font-black italic text-lg uppercase mt-8 mb-4 flex items-center gap-2">
              <Building size={18} /> Business Information
            </h3>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-70">UID (VAT ID)</label>
              <input
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
                placeholder="ATU12345678"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center items-center gap-2 bg-neon-orange text-black font-bold uppercase px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 mt-8"
            >
              <Save size={18} />
              {saving ? 'Syncing...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Security / Password */}
        <div className="space-y-8">
          <div className="border border-foreground p-8 bg-background">
            <h2 className="font-owners font-black italic text-2xl uppercase mb-6 flex items-center gap-2">
              <Lock size={20} /> Security Settings
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-70">Current Security Key</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-70">New Security Key</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-70">Confirm New Key</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent p-2 border-b border-foreground focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              {passwordError && <div className="text-red-500 text-xs uppercase font-bold">{passwordError}</div>}
              {passwordSuccess && <div className="text-green-500 text-xs uppercase font-bold">{passwordSuccess}</div>}

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full flex justify-center items-center gap-2 border border-foreground font-bold uppercase px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                <Lock size={18} />
                {changingPassword ? 'Verifying...' : 'Update Key'}
              </button>
            </form>
          </div>

          <div className="border border-foreground p-8 bg-background">
            <h2 className="font-owners font-black italic text-2xl uppercase mb-6 flex items-center gap-2">
              <CreditCard size={20} /> Payment Settings Beta
            </h2>
            <div className="text-center py-6">
              <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="font-owners font-bold text-lg uppercase mb-2">No Payment Methods</h3>
              <p className="text-xs opacity-70 mb-6">You have not added any payment methods yet.</p>
              <button className="w-full bg-foreground text-background font-bold uppercase px-6 py-3 hover:bg-neon-orange hover:text-black transition-colors">
                Add Payment Method
              </button>
            </div>
          </div>

          <div className="border border-red-500/30 p-8 bg-red-500/5">
            <h3 className="text-red-500 font-owners font-black italic text-xl uppercase mb-2">Danger Zone</h3>
            <p className="text-xs opacity-70 mb-4 leading-relaxed">
              Deleting your account will permanently remove all collections and control room beta access. This action cannot be undone.
            </p>
            <button className="text-red-500 text-xs font-bold uppercase border border-red-500/30 px-4 py-2 hover:bg-red-500 hover:text-white transition-all">
              Terminate Protocol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
