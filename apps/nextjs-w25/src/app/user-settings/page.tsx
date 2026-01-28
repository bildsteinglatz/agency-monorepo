'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Settings, Heart, ShoppingBag, CreditCard,
  FileText, LogOut, Shield, Mail, Lock, ArrowRight,
  Palette, PenTool, Terminal, Ghost, LayoutGrid
} from 'lucide-react';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, deleteUser, updateEmail, updatePassword,
  GoogleAuthProvider, signInWithPopup, linkWithPopup
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useGodNav } from '@/components/GodNavContext';
import { GodModeLogo } from '@/components/GodModeLogo';
import { useGodSidebarMargin } from '@/components/GodSidebarMarginContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Components ---

const GodModeIcon = ({ size = 18, className = '' }: { size?: number, className?: string }) => (
  <div style={{ width: size, height: size }} className={className}>
    <GodModeLogo className="w-full h-full" />
  </div>
);

const AuthForm = ({ onLogin, isAnonymous = false }: { onLogin: () => void, isAnonymous?: boolean }) => {
  const [isRegistering, setIsRegistering] = useState(isAnonymous);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      let result;
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        // Upgrade flow: Link anonymous account to Google
        try {
          result = await linkWithPopup(auth.currentUser, provider);
          // Update Firestore to mark as NOT anonymous
          await updateDoc(doc(db, 'users', result.user.uid), {
            isAnonymous: false,
            email: result.user.email,
            updatedAt: new Date()
          });
          setSuccess('Protocol Upgraded. Your progress is now permanent.');
        } catch (linkErr: any) {
           if (linkErr.code === 'auth/credential-already-in-use') {
             // If the Google account is already in use, we can't link.
             // We should prompt the user to sign in with that account instead,
             // creating a fresh session (potentially merging logic needed elsewhere if we supported merging).
             // For now, ask them to log in instead.
             setError('This Google account is already linked to another user. Please log in with it.');
           } else {
             throw linkErr;
           }
           return;
        }
      } else {
        // Login flow
        result = await signInWithPopup(auth, provider);
        
        // Ensure user doc exists
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
           await setDoc(doc(db, 'users', result.user.uid), {
            createdAt: new Date(),
            settings: { godMode: true },
            collection: [],
            isAnonymous: false,
            email: result.user.email
          });
        }
      }
      onLogin();
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isRegistering) {
        // When anonymous, we "upgrade" by creating a new account. 
        // Firebase handles linking if we use linkWithCredential, but here we'll keep it simple:
        // If they are anonymous, we create a new user and the CollectionContext handles the data migration/Firestore creation.
        // Actually, linkWithCredential is better but requires more setup. 
        // Let's just create the user. The CollectionContext will see the new UID and start fresh or we can migrate Firestore.

        // BETTER: Use linkWithCredential to keep the UID and Firestore data.
        const { linkWithCredential, EmailAuthProvider } = await import('firebase/auth');
        const credential = EmailAuthProvider.credential(email, password);

        if (auth.currentUser && auth.currentUser.isAnonymous) {
          try {
            await linkWithCredential(auth.currentUser, credential);
            // Update Firestore to mark as NOT anonymous
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              isAnonymous: false,
              email: email,
              updatedAt: new Date()
            });
            setSuccess('Protocol Upgraded. Your progress is now permanent.');
          } catch (linkErr: any) {
            if (linkErr.code === 'auth/email-already-in-use') {
              setError('This email is already registered. Please log in instead.');
              setIsRegistering(false);
            } else {
              throw linkErr;
            }
          }
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            createdAt: new Date(),
            settings: { godMode: true },
            collection: [],
            isAnonymous: false,
            email: email
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 border border-foreground p-8 bg-background">
      <h2 className="font-owners font-black italic text-3xl uppercase mb-6">
        {isRegistering ? (isAnonymous ? 'Register here to save your progress' : 'Register to save your progress') : 'Access Control'}
      </h2>

      {isAnonymous && (
        <p className="text-xs uppercase font-bold opacity-60 mb-6 leading-relaxed">
          You are currently using temporary access. Register below to make your collection and settings permanent.
        </p>
      )}

      {success ? (
        <div className="space-y-6">
          <div className="text-green-500 text-xs uppercase font-bold p-4 border border-green-500/30 bg-green-500/5">
            {success}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-foreground text-background font-bold uppercase py-3 hover:bg-neon-orange hover:text-black transition-colors"
          >
            Refresh Control Room
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase opacity-70">Email Frequency</label>
            <div className="flex items-center border-b border-foreground">
              <Mail size={16} className="mr-2 opacity-50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent p-2 focus:outline-none"
                placeholder="user@domain.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase opacity-70">Security Key</label>
            <div className="flex items-center border-b border-foreground">
              <Lock size={16} className="mr-2 opacity-50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent p-2 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs uppercase font-bold">{error}</div>}

          <button type="submit" className="w-full bg-neon-orange text-black font-bold uppercase py-3 hover:bg-foreground hover:text-background transition-colors">
            {isRegistering ? (isAnonymous ? 'Register now' : 'Initialize') : 'Authenticate'}
          </button>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black border border-gray-300 font-bold uppercase py-3 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
             {/* Simple Google Icon */}
             <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
             </svg>
             Google Access
          </button>

          <div className="text-center text-xs uppercase font-bold mt-4">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="opacity-50 hover:opacity-100"
            >
              {isRegistering ? 'Log in here if you already have credentials' : 'Need initialization?'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const ControlRoomCard = ({
  title,
  description,
  icon: Icon,
  href,
  action,
  disabled = false
}: {
  title: string,
  description: string,
  icon: any,
  href?: string,
  action?: () => void,
  disabled?: boolean
}) => {
  const Content = () => (
    <div className={`border border-foreground p-6 h-full flex flex-col justify-between transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-foreground/5'}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <Icon size={24} />
          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h3 className="font-owners font-black italic text-xl uppercase mb-2">{title}</h3>
        <p className="text-sm opacity-70">{description}</p>
      </div>
    </div>
  );

  if (disabled) {
    return <div className="group h-full"><Content /></div>;
  }

  if (href) {
    return (
      <Link href={href} className="group block h-full">
        <Content />
      </Link>
    );
  }

  return (
    <button onClick={action} className="group block w-full text-left h-full">
      <Content />
    </button>
  );
};

const AGBSection = ({ signed, onSign }: { signed: boolean, onSign: () => void }) => {
  return (
    <div className="border border-foreground p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-owners font-black italic text-xl uppercase flex items-center gap-2">
          <FileText size={20} />
          AGB Protocol
        </h3>
        {signed ? (
          <span className="bg-green-500/20 text-green-500 px-2 py-1 text-xs font-bold uppercase">Signed</span>
        ) : (
          <span className="bg-red-500/20 text-red-500 px-2 py-1 text-xs font-bold uppercase">Pending</span>
        )}
      </div>
      <p className="text-sm opacity-70 mb-4">
        Please review and sign the General Terms and Conditions to access advanced features.
      </p>
      <div className="flex gap-4">
        <Link href="/agb" className="text-xs font-bold uppercase border-b border-foreground hover:opacity-50">
          Read AGB
        </Link>
        {!signed && (
          <button
            onClick={onSign}
            className="text-xs font-bold uppercase bg-foreground text-background px-4 py-2 hover:bg-neon-orange hover:text-black transition-colors"
          >
            Sign Protocol
          </button>
        )}
      </div>
    </div>
  );
};

export default function UserSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agbSigned, setAgbSigned] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const sidebarMargin = useGodSidebarMargin();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check Firestore for user data
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setAgbSigned(data.agbSigned || false);
          setIsAdmin(data.role === 'admin');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignAGB = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        agbSigned: true,
        agbSignedAt: new Date()
      });
      setAgbSigned(true);
    } catch (error) {
      console.error("Error signing AGB:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="animate-pulse font-owners font-black italic text-xl uppercase">Loading Protocol...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <AuthForm onLogin={() => { }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 px-4 pb-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-foreground pb-4">
          <div>
            <h1 className="font-owners font-black italic text-6xl uppercase mb-2">
              {user.isAnonymous ? 'Control Panel' : 'Control Room'}
            </h1>
            <p className="text-sm opacity-70 font-owners">
              {user.isAnonymous ? 'Welcome to our BETA Playground' : user.email}
            </p>
          </div>
          {user.isAnonymous ? (
            <div className="text-right mb-1">
              <div className="font-owners font-bold italic text-sm uppercase text-neon-orange">Temporary Access</div>
              <div className="text-xs opacity-60 font-owners uppercase">Anonymous Protocol Active</div>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold uppercase hover:text-neon-orange transition-colors"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          )}
        </div>

        {user.isAnonymous && (
          <div className="mb-12">
            <AuthForm onLogin={() => { }} isAnonymous={true} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ControlRoomCard
            title="Profile"
            description="Manage your personal information."
            icon={User}
            href="/user-settings/profile"
          />
          <ControlRoomCard
            title="Collection"
            description="View your saved artworks."
            icon={Heart}
            href="/user-settings/collection"
          />
          <ControlRoomCard
            title="Payment"
            description="Manage billing and payment methods in your profile."
            icon={CreditCard}
            href="/user-settings/profile"
          />
        </div>

        <AGBSection signed={agbSigned} onSign={handleSignAGB} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <ControlRoomCard
            title="Painting"
            description="Enter the virtual painting environment."
            icon={Palette}
            href="/virtual-painting"
          />
          <ControlRoomCard
            title="Writing"
            description="Access digital writings and publications."
            icon={PenTool}
            href="/writing"
          />
          <ControlRoomCard
            title="Curating"
            description="Manage exhibitions and artwork metadata."
            icon={LayoutGrid}
            href="/gallery"
          />
          <ControlRoomCard
            title="Spectral"
            description="Enter the spectral analysis room."
            icon={Ghost}
            href="/spectral"
          />
          <ControlRoomCard
            title="Terminal"
            description="Direct command line interface access."
            icon={Terminal}
            href="/terminal"
          />
          {isAdmin && (
            <ControlRoomCard
              title="Admin"
              description="System administration and user management."
              icon={Shield}
              href="/admin"
            />
          )}
        </div>

      </div>
    </div>
  );
}
