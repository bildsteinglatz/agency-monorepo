import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';

const THEME_ORDER = [
  "white",
  "lightGrey",
  "darkGrey",
  "black",
  "blue",
  "rainbow",
];

const THEMES = {
  white: { bg: "#ffffff", text: "#000000" },
  lightGrey: { bg: "#f5f5f5", text: "#171717" },
  darkGrey: { bg: "#1a1a1a", text: "#ededed" },
  black: { bg: "#000000", text: "#ffffff" },
  blue: { bg: "#4219e6", text: "#ffffff" },
  rainbow: {
    bg: "linear-gradient(45deg, #ff69b4, #32cd32, #ffd700, #ff1493, #7fff00, #ff6347)",
    text: "#000000",
    isGradient: true,
  },
};

const STORAGE_KEY = "theme";

// ThemeSwitch2 now accepts speed and color as props
type ThemeSwitch2Props = {
  speed?: number;
  color?: string;
  buttonSize?: number;
  wheelSize?: number;
};

export function ThemeSwitch2({ speed = 8.0, color = '#4219e6', buttonSize = 74, wheelSize = 54 }: ThemeSwitch2Props) {
  // Accept custom sizes for sidebar usage
  const wheelRef = useRef<SVGSVGElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef<number>(0);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "white";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved && saved in THEMES ? saved : "white";
  });

  // Persist + apply to body
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, theme);
  const cfg = THEMES[theme as keyof typeof THEMES];
    const body = document.body;
    THEME_ORDER.forEach(t => body.classList.remove(`theme-${t}`));
    body.classList.add(`theme-${theme}`);
    if ('isGradient' in cfg && cfg.isGradient) {
      body.style.background = cfg.bg;
      body.style.backgroundImage = cfg.bg;
      body.style.backgroundColor = "";
    } else {
      body.style.backgroundImage = "";
      body.style.backgroundColor = cfg.bg;
      body.style.background = cfg.bg;
    }
    body.style.color = cfg.text;
    document.documentElement.style.setProperty('--foreground', THEMES[theme as keyof typeof THEMES].text);
  }, [theme]);

  const nextTheme = useMemo(() => {
    const idx = THEME_ORDER.indexOf(theme);
    return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
  }, [theme]);

  // Animation logic (same as before)
  const normalSpeed = speed;
  const hoverSpeed = 0.85;
  const scaleEffect = 1.2;
  const wheelState = useRef({
    isAnimating: false,
    startTime: 0,
    startAngle: 0,
    speed: normalSpeed,
    isDecelerating: false,
    decelStartTime: 0,
    decelStartSpeed: 0,
    decelEndSpeed: 0,
    decelDuration: 0
  });
  const extractRotationAngle = (transformStr: string): number => {
    if (!transformStr || transformStr === 'none') return 0;
    const rotateMatch = transformStr.match(/rotate\(([0-9.-]+)deg\)/);
    if (rotateMatch && rotateMatch[1]) {
      return parseFloat(rotateMatch[1]);
    }
    return 0;
  };
  const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
  const startDeceleration = (fromSpeed: number, toSpeed: number, duration: number) => {
    if (!wheelRef.current) return;
    const currentTransform = wheelRef.current.style.transform || 'rotate(0deg)';
    const currentAngleValue = extractRotationAngle(currentTransform);
    wheelState.current.isDecelerating = true;
    wheelState.current.decelStartTime = performance.now();
    wheelState.current.decelStartSpeed = fromSpeed;
    wheelState.current.decelEndSpeed = toSpeed;
    wheelState.current.decelDuration = duration * 1000;
    wheelState.current.startTime = performance.now();
    wheelState.current.startAngle = currentAngleValue;
  };
  const animateWheel = useCallback((timestamp: number) => {
    if (!wheelRef.current || !wheelState.current.isAnimating) {
      requestRef.current = requestAnimationFrame(animateWheel);
      return;
    }
    const elapsed = timestamp - wheelState.current.startTime;
    let currentSpeedValue = wheelState.current.speed;
    if (wheelState.current.isDecelerating) {
      const decelElapsed = timestamp - wheelState.current.decelStartTime;
      const decelProgress = Math.min(decelElapsed / wheelState.current.decelDuration, 1);
      const easeValue = easeOutCubic(decelProgress);
      currentSpeedValue = wheelState.current.decelStartSpeed + 
        (wheelState.current.decelEndSpeed - wheelState.current.decelStartSpeed) * easeValue;
      wheelState.current.speed = currentSpeedValue;
      if (decelProgress >= 1) {
        wheelState.current.isDecelerating = false;
        wheelState.current.speed = wheelState.current.decelEndSpeed;
      }
    }
    const degreesPerSecond = 360 / currentSpeedValue;
    const rotation = (wheelState.current.startAngle + (elapsed * degreesPerSecond / 1000)) % 360;
    wheelRef.current.style.transform = `rotate(${rotation}deg)`;
    requestRef.current = requestAnimationFrame(animateWheel);
  }, []);
  const updateAnimationSpeed = (targetSpeed: number, useDeceleration: boolean = false) => {
    if (!wheelRef.current) return;
    if (useDeceleration) {
      const currentSpeed = wheelState.current.speed;
      // Make deceleration longer (6 seconds)
      startDeceleration(currentSpeed, targetSpeed, 6.0);
    } else {
      const currentAngleValue = extractRotationAngle(wheelRef.current.style.transform || 'rotate(0deg)');
      wheelState.current.startTime = performance.now();
      wheelState.current.startAngle = currentAngleValue;
      wheelState.current.speed = targetSpeed;
      wheelState.current.isDecelerating = false;
    }
  };
  useEffect(() => {
    wheelState.current.isAnimating = true;
    wheelState.current.startTime = performance.now();
    wheelState.current.speed = normalSpeed;
    requestRef.current = requestAnimationFrame(animateWheel);
    return () => {
      wheelState.current.isAnimating = false;
      cancelAnimationFrame(requestRef.current);
    };
  }, [animateWheel, normalSpeed]);

  // Hydration fix: use default color on server, update after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // Always use blue for the animated wheel segment
  const wheelColor = '#4219e6';

  return (
    <button 
      ref={buttonRef}
      aria-label="Switch color theme"
      title="Switch color theme"
      className="notranslate"
      translate="no"
      style={{
        transition: 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
        transform: 'scale(1)',
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'transparent',
        position: 'relative'
      }}
      onMouseEnter={() => {
        updateAnimationSpeed(hoverSpeed);
        if (buttonRef.current) {
          buttonRef.current.style.transform = `scale(${scaleEffect})`;
          buttonRef.current.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }
      }}
      onMouseLeave={() => {
        updateAnimationSpeed(normalSpeed, true);
        if (buttonRef.current) {
          buttonRef.current.style.transform = 'scale(1)';
          buttonRef.current.style.transition = 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)';
        }
      }}
      onClick={() => setTheme(nextTheme)}
    >
      <svg 
        ref={wheelRef}
        width={wheelSize}
        height={wheelSize}
        viewBox="0 0 24 24" 
        style={{
          willChange: 'transform',
          transformOrigin: 'center',
          transition: 'none'
        }}
      >
        {/* Top-left quarter - Black */}
        <path d="M 12 12 L 12 2 A 10 10 0 0 0 2 12 Z" fill="#000000" />
        {/* Top-right quarter - White */}
        <path d="M 12 12 L 22 12 A 10 10 0 0 0 12 2 Z" fill="#ffffff" stroke="#ccc" strokeWidth="0.5" />
        {/* Bottom-right quarter - Rainbow gradient */}
        <path d="M 12 12 L 12 22 A 10 10 0 0 0 22 12 Z" fill="url(#pattern-demo)" />
        {/* Bottom-left quarter - Theme color */}
        <path d="M 12 12 L 2 12 A 10 10 0 0 0 12 22 Z" fill={wheelColor} />
        <defs>
          <linearGradient id="pattern-demo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff69b4" />
            <stop offset="20%" stopColor="#32cd32" />
            <stop offset="40%" stopColor="#ffd700" />
            <stop offset="60%" stopColor="#ff1493" />
            <stop offset="80%" stopColor="#7fff00" />
            <stop offset="100%" stopColor="#ff6347" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  );
}
