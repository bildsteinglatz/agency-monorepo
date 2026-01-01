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
    if (pathname === '/artworks-ii') {
      // If we are already on artworks, reset category if needed or just scroll top
      window.scrollTo({ top: 0, behavior: "smooth" });
      // We can also force a state reset by using a custom event or just letting the component handle it
    }
    setIntroVisible(true);
  };

  return (
    <Link
      href="/artworks-ii"
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
