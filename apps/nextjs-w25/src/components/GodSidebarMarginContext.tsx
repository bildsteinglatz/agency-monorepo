"use client";
import React, { createContext, useContext, useState } from "react";

interface GodSidebarMarginContextType {
  godMargin: number;
  setGodMargin: (v: number) => void;
  switchMargin: number;
  setSwitchMargin: (v: number) => void;
  wheelMargin: number;
  setWheelMargin: (v: number) => void;
}

const GodSidebarMarginContext = createContext<GodSidebarMarginContextType | undefined>(undefined);

export function GodSidebarMarginProvider({ children }: { children: React.ReactNode }) {
  const [godMargin, setGodMarginRaw] = useState(100);
  const [switchMargin, setSwitchMarginRaw] = useState(20);
  const [wheelMargin, setWheelMarginRaw] = useState(10);

  // Clamp to zero to prevent negative values
  const setGodMargin = (v: number) => setGodMarginRaw(Math.max(0, v));
  const setSwitchMargin = (v: number) => setSwitchMarginRaw(Math.max(0, v));
  const setWheelMargin = (v: number) => setWheelMarginRaw(Math.max(0, v));

  return (
    <GodSidebarMarginContext.Provider value={{ godMargin, setGodMargin, switchMargin, setSwitchMargin, wheelMargin, setWheelMargin }}>
      {children}
    </GodSidebarMarginContext.Provider>
  );
}

export function useGodSidebarMargin() {
  const ctx = useContext(GodSidebarMarginContext);
  if (!ctx) throw new Error("useGodSidebarMargin must be used within GodSidebarMarginProvider");
  return ctx;
}
