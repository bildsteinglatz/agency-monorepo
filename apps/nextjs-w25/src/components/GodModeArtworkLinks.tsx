"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGodNav } from './GodNavContext';

export function GodModeArtworkLinks() {
  const { showGodNav } = useGodNav();
  const pathname = usePathname();

  if (!showGodNav) return null;

  return (
    <>
      <Link
        href="/gallery"
        className={`filterbar-link px-2 py-0 rounded transition-colors ${pathname === '/gallery' ? 'active' : ''}`}
      >
        Virtual Gallery
      </Link>
    </>
  );
}
