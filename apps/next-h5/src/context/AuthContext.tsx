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
    billingAddress?: {
        firstName: string;
        lastName: string;
        street: string;
        zip: string;
        city: string;
        country: string;
    };
}

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    hasRole: (role: UserRole) => boolean;
    updateBillingAddress: (address: NonNullable<UserProfile['billingAddress']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    logout: async () => { },
    hasRole: () => false,
    updateBillingAddress: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubProfile: (() => void) | null = null;

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            // Cleanup previous profile listener
            if (unsubProfile) {
                unsubProfile();
                unsubProfile = null;
            }

            if (firebaseUser) {
                // Sync with server
                try {
                    const token = await firebaseUser.getIdToken();
                    await fetch('/api/login', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                } catch (error) {
                    console.error('Failed to sync auth token:', error);
                }

                // Listen to profile changes in Firestore
                const profileRef = doc(db, 'users', firebaseUser.uid);

                unsubProfile = onSnapshot(profileRef, (docSnap) => {
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
                        // Use setDoc with merge: true to avoid overwriting if it was created concurrently
                        setDoc(profileRef, initialProfile, { merge: true }).catch(err => {
                            console.error("Error creating profile:", err);
                            // If permission denied, we might still want to set a local profile state
                            // so the UI doesn't break, although it won't be saved.
                            setProfile(initialProfile);
                        });
                        setProfile(initialProfile);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Firestore profile listener error:", error);
                    // Fallback for permission errors or other issues
                    if (firebaseUser) {
                        const fallbackProfile: UserProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || '',
                            roles: ['user'],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                        setProfile(fallbackProfile);
                    }
                    setLoading(false);
                });
            } else {
                // Clear server session
                await fetch('/api/logout');
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
            if (unsubProfile) unsubProfile();
        };
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const hasRole = (role: UserRole) => {
        return profile?.roles.includes(role) || profile?.roles.includes('admin') || false;
    };

    const updateBillingAddress = async (address: NonNullable<UserProfile['billingAddress']>) => {
        if (!user) throw new Error('User must be logged in to update billing address');

        const profileRef = doc(db, 'users', user.uid);
        await setDoc(profileRef, {
            billingAddress: address,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, logout, hasRole, updateBillingAddress }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
