'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    User as FirebaseUser,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

export type UserRole = 'user' | 'artist' | 'workshop-attendy' | 'member' | 'partner' | 'admin';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    roles: UserRole[];
    createdAt: string;
    updatedAt: string;
    isMember?: boolean;
    isArtist?: boolean;
}

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    logout: async () => {},
    hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            
            if (firebaseUser) {
                // Listen to profile changes in Firestore
                const profileRef = doc(db, 'users', firebaseUser.uid);
                
                const unsubProfile = onSnapshot(profileRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setProfile(docSnap.data() as UserProfile);
                    } else {
                        // Create initial profile if it doesn't exist
                        const initialProfile: UserProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || '',
                            roles: ['user'],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                        setDoc(profileRef, initialProfile);
                        setProfile(initialProfile);
                    }
                    setLoading(false);
                });

                return () => unsubProfile();
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const hasRole = (role: UserRole) => {
        return profile?.roles.includes(role) || profile?.roles.includes('admin') || false;
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
