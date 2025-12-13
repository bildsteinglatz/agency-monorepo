"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
// Update the import path below to the correct relative or alias path for your project structure.
// For example, if useWheelAnimation is in src/hooks/useWheelAnimation.tsx:
import { useWheelAnimation } from "@/hooks/useWheelAnimation";
// Or, if using a relative path:
// import { useWheelAnimation } from "../hooks/useWheelAnimation";
import { useGodSidebarMargin } from './GodSidebarMarginContext';

export interface ThemeSwitchProps {
  marginTop?: number;
}

type Theme = "white" | "lightGrey" | "darkGrey" | "black" | "rainbow" | "blue";

type ThemeConfig = { bg: string; text: string; isGradient?: boolean };

const THEME_ORDER: Theme[] = [
  "white",
  "lightGrey",
  "darkGrey",
  "black",
  "blue",
  "rainbow",
];

const THEMES: Record<Theme, ThemeConfig> = {
  white: { bg: "#ffffff", text: "#000000" },
  lightGrey: { bg: "#f5f5f5", text: "#171717" },
  darkGrey: { bg: "#1a1a1a", text: "#ededed" },
  black: { bg: "#000000", text: "#ffffff" },
  blue: { bg: "#4219e6", text: "#ffffff" },
  rainbow: {
    bg: "linear-gradient(45deg, #ff69b4, #5a09f1ff, #3bed3bff, #ffd700, #ff1493, #7fff00, #ff6347)",
    text: "#000000",
    isGradient: true,
  },
};

const STORAGE_KEY = "theme";

export function ThemeSwitch({ marginTop = 150 }: ThemeSwitchProps) {
  const { switchMargin } = useGodSidebarMargin();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "white";
    const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved && saved in THEMES ? saved : "white";
  });

  // Persist + apply to body
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, theme);
    const cfg = THEMES[theme];
    const body = document.body;
    // Remove previous theme classes
    THEME_ORDER.forEach(t => body.classList.remove(`theme-${t}`));
    body.classList.add(`theme-${theme}`);
    if (cfg.isGradient) {
      body.style.background = cfg.bg;
      body.style.backgroundImage = cfg.bg;
      body.style.backgroundColor = "";
    } else {
      body.style.backgroundImage = "";
      body.style.backgroundColor = cfg.bg;
      body.style.background = cfg.bg;
    }
    body.style.color = cfg.text;
    
    // Update CSS custom properties for theme-aware components
    const root = document.documentElement;
    root.style.setProperty('--background', cfg.bg);
    root.style.setProperty('--foreground', cfg.text);
  }, [theme]);

  const nextTheme = useMemo(() => {
    const idx = THEME_ORDER.indexOf(theme);
    console.log('Current theme:', theme, 'Index:', idx, 'Next theme:', THEME_ORDER[(idx + 1) % THEME_ORDER.length]);
    console.log('Theme order:', THEME_ORDER);
    return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
  }, [theme]);

  // Use shared wheel animation hook
  const svgRef = useRef<SVGSVGElement>(null);
  const { updateAnimationSpeed } = useWheelAnimation({ speed: switchMargin, svgRef });


  const cfg = THEMES[theme];
  const style: React.CSSProperties = cfg.isGradient
    ? { background: cfg.bg, backgroundImage: cfg.bg }
    : { background: cfg.bg };

  return (
    <button
      aria-label="Switch color theme"
      title="Switch color theme"
  onMouseEnter={e => updateAnimationSpeed(1.2)}
  onMouseLeave={e => updateAnimationSpeed(switchMargin)}
      onClick={() => setTheme(nextTheme)}
      className="w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-0 active:outline-none hover:outline-none focus-visible:outline-none theme-switch-button"
      style={{
        ...style,
        color: cfg.text,
        marginTop,
        border: "none",
        outline: "none",
        boxShadow: "none",
        WebkitTapHighlightColor: "transparent",
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
      } as React.CSSProperties}
    >
      <svg
        ref={svgRef}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{ willChange: "transform", transition: "transform 120ms" }}
      >
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff69b4" />
            <stop offset="20%" stopColor="#32cd32" />
            <stop offset="40%" stopColor="#ffd700" />
            <stop offset="60%" stopColor="#ff1493" />
            <stop offset="80%" stopColor="#7fff00" />
            <stop offset="100%" stopColor="#ff6347" />
          </linearGradient>
        </defs>
        <path d="M 12 12 L 12 2 A 10 10 0 0 0 2 12 Z" fill="#000000" />
        <path d="M 12 12 L 22 12 A 10 10 0 0 0 12 2 Z" fill="#ffffff" stroke="#d1d5db" strokeWidth="0.5" />
        <path d="M 12 12 L 12 22 A 10 10 0 0 0 22 12 Z" fill="url(#rainbow)" />
        <path d="M 12 12 L 2 12 A 10 10 0 0 0 12 22 Z" fill="#4219e6" />
      </svg>
    </button>
  );
}
