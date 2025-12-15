"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface GodNavContextType {
  isAuthenticated: boolean;
  showGodNav: boolean;
  setShowGodNav: (v: boolean) => void;
  showPainting: boolean;
  setShowPainting: (v: boolean) => void;
  showWriting: boolean;
  setShowWriting: (v: boolean) => void;
  showCurating: boolean;
  setShowCurating: (v: boolean) => void;
  showPortrait: boolean;
  setShowPortrait: (v: boolean) => void;
  showAGB: boolean;
  setShowAGB: (v: boolean) => void;
  showSpectral: boolean;
  setShowSpectral: (v: boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (v: boolean) => void;
}

const GodNavContext = createContext<GodNavContextType | undefined>(undefined);

export function useGodNav() {
  const ctx = useContext(GodNavContext);
  if (!ctx) throw new Error('useGodNav must be used within GodNavProvider');
  return ctx;
}

export function GodNavProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGodNav, setShowGodNav] = useState(false);
  const [showPainting, setShowPainting] = useState(false);
  const [showWriting, setShowWriting] = useState(false);
  const [showCurating, setShowCurating] = useState(false);
  const [showPortrait, setShowPortrait] = useState(false);
  const [showAGB, setShowAGB] = useState(false);
  const [showSpectral, setShowSpectral] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const data = snap.data();
            const settings = data.settings || {};
            
            setShowGodNav(settings.godMode !== undefined ? settings.godMode : true);
            setShowPainting(settings.painting !== undefined ? settings.painting : true);
            setShowWriting(settings.writing !== undefined ? settings.writing : true);
            setShowCurating(settings.curating !== undefined ? settings.curating : true);
            setShowPortrait(settings.portrait !== undefined ? settings.portrait : true);
            setShowAGB(settings.agb !== undefined ? settings.agb : true);
            setShowSpectral(settings.spectral !== undefined ? settings.spectral : true);
            setShowTerminal(settings.terminal !== undefined ? settings.terminal : true);
          } else {
             // If user doc doesn't exist, default to true (legacy behavior)
             setShowGodNav(true);
             setShowPainting(true);
             setShowWriting(true);
             setShowCurating(true);
             setShowPortrait(true);
             setShowAGB(true);
             setShowSpectral(true);
             setShowTerminal(true);
          }
        } catch (error) {
          console.error("Error fetching user settings:", error);
        }
      } else {
        // User logged out - reset all access
        setIsAuthenticated(false);
        setShowGodNav(false);
        setShowPainting(false);
        setShowWriting(false);
        setShowCurating(false);
        setShowPortrait(false);
        setShowAGB(false);
        setShowSpectral(false);
        setShowTerminal(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <GodNavContext.Provider value={{ 
      isAuthenticated,
      showGodNav, setShowGodNav,
      showPainting, setShowPainting,
      showWriting, setShowWriting,
      showCurating, setShowCurating,
      showPortrait, setShowPortrait,
      showAGB, setShowAGB,
      showSpectral, setShowSpectral,
      showTerminal, setShowTerminal
    }}>
      {children}
    </GodNavContext.Provider>
  );
}
