"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIntro } from "@/context/IntroContext";

export default function HeaderLogo() {
  const [expanded, setExpanded] = useState(false);
  const touchTimer = useRef<number | null>(null);
  const pathname = usePathname();
  const { setIntroVisible } = useIntro();

  function handleTouch() {
    setExpanded(true);
    if (touchTimer.current) window.clearTimeout(touchTimer.current);
    touchTimer.current = window.setTimeout(() => setExpanded(false), 1200);
  }

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      // If we are already on home, just show intro and scroll top
      // We don't prevent default if we want the URL to be clean, but Next.js Link handles that.
      // Actually, if we are at /#something, clicking / might be useful.
      // But here we just want to reset the state.
      setIntroVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // If navigating from another page, ensure intro is visible when we land
      setIntroVisible(true);
    }
  };

  return (
    <Link
      href="/"
      aria-label="Home"
      className={`logo ${expanded ? "logo--expanded" : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      onTouchStart={handleTouch}
      onClick={handleClick}
    >
      {/* Only use the text wordmark now */}
      <span className="logo-wordmark-text" aria-hidden="true">
        BILDSTEIN <span className="logo-pipe">|</span> GLATZ
      </span>
    </Link>
  );
}
