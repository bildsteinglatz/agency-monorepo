"use client";

import React from "react";
import Link from "next/link";
import { Artwork } from "@/types/artwork";
import ResponsiveArtworkMedia from "@/components/artwork/ResponsiveArtworkMedia.client";
import PdfDownloadButton from "@/components/PdfDownloadButton";

export default function SimpleArtworkLayout({
  artwork,
  prevHref,
  nextHref,
  mainImageUrl,
  vimeoUrl: vimeoUrlProp,
  preferVimeo = false,
}: {
  artwork: Artwork;
  prevHref?: string | undefined;
  nextHref?: string | undefined;
  mainImageUrl?: string | undefined;
  vimeoUrl?: string | undefined;
  preferVimeo?: boolean;
}) {
  

  const getAssetUrl = (maybeAsset: any): string | undefined => {
    if (!maybeAsset) return undefined;
    if (typeof maybeAsset === "string") return maybeAsset;
    if (maybeAsset?.url) return maybeAsset.url;
    if (maybeAsset?.asset?.url) return maybeAsset.asset.url;
    return undefined;
  };

  // Vimeo embed logic — prefer explicit prop then artwork fields
  const vimeoUrlFromArtwork = artwork.vimeoVideo?.vimeoUrl || artwork.vimeoUrl;
  const effectiveVimeoUrl = vimeoUrlProp || vimeoUrlFromArtwork;
  const extractVimeoId = (url: string): string | undefined => {
    if (!url) return undefined;
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : undefined;
  };
  const vimeoId = effectiveVimeoUrl ? extractVimeoId(effectiveVimeoUrl) : undefined;
  // Determine if the artwork is categorized as video (defensive checks for slug/title shapes)
  const isVideoCategory = (() => {
    try {
      const slugOrTitle =
        (artwork as any)?.fieldOfArt?.slug?.current ||
        (artwork as any)?.fieldOfArt?.slug ||
        (artwork as any)?.fieldOfArt?.title;
      if (!slugOrTitle) return false;
      return String(slugOrTitle).toLowerCase() === "video";
    } catch (e) {
      return false;
    }
  })();
  const showVimeo = !!vimeoId && (preferVimeo || !mainImageUrl || isVideoCategory);

  return (
    <div className="flex flex-col" data-debug="simple-top-block">
  {/* controls moved next to title/year blocks for better separation from image */}

      {/* Image + sidebar (desktop) */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: image and mobile-only title/year; desktop controls above image */}
        <div className="flex-1 md:w-2/3 md:pt-4">
          {/* Mobile: controls above image (visible only on small screens) */}
          <div className="md:hidden mb-2">
            <div className="flex justify-center items-center gap-3 text-sm">
              <Link href={prevHref || "#"} className="px-0 py-1">← prev</Link>
              <span className="text-black">|</span>
              <Link href="/new-work" className="px-0 py-1">back</Link>
              <span className="text-black">|</span>
              <Link href={nextHref || "#"} className="px-0 py-1">next →</Link>
            </div>
          </div>
          {/* desktop controls removed from here and placed in aside */}

          {showVimeo ? (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?loop=1&dnt=1`}
              title={artwork.title || "Vimeo video"}
              className="w-full h-auto block object-contain"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
              style={{ minHeight: 320 }}
            />
          ) : mainImageUrl ? (
            <ResponsiveArtworkMedia imgSrc={mainImageUrl} alt={artwork.title} />
          ) : null}

          <div className="mt-2 text-sm font-normal text-[var(--filterbar-link-color)] w-full text-left md:hidden" style={{ marginLeft: 8 }}>
            <span>{artwork.title}{artwork.year ? ", " : ""}{artwork.year}</span>
            {artwork.size && <div>{artwork.size}</div>}
            {artwork.technique && <div>{artwork.technique}</div>}<br/>
            {artwork.edition && <div>{artwork.edition}</div>}
            <div className="mt-3" />
            <PdfDownloadButton 
              imageUrl={mainImageUrl || ''}
              title={artwork.title || 'Untitled'}
              artist="Bildstein | Glatz"
              year={artwork.year?.toString() || ''}
              technique={artwork.technique || ''}
              size={artwork.size || ''}
              edition={artwork.edition || ''}
            />
          </div>
        </div>

  <aside className="hidden md:flex md:flex-col md:w-1/3 md:items-start md:pl-4 md:mt-7">
          <div className="mb-1">
            <div className="flex items-center gap-2 text-sm font-normal text-[var(--filterbar-link-color)]">
              <Link href={prevHref || "#"} className="px-0 py-0">← prev</Link>
              <span className="text-black">|</span>
              <Link href="/new-work" className="px-0 py-0">back</Link>
              <span className="text-black">|</span>
              <Link href={nextHref || "#"} className="px-0 py-0">next →</Link>
            </div>
          </div>
          <div className="text-sm font-normal text-[var(--filterbar-link-color)] w-full border-t pt-3" style={{ borderTopColor: 'var(--foreground)' }}>
            <div>{artwork.title}{artwork.year ? ", " : ""}{artwork.year}</div>
            {artwork.size && <div>{artwork.size}</div>}
            {artwork.technique && <div>{artwork.technique}</div>}<br/>
            {artwork.edition && <div>{artwork.edition}</div>}
            <div className="mt-3" />
            <PdfDownloadButton 
              imageUrl={mainImageUrl || ''}
              title={artwork.title || 'Untitled'}
              artist="Bildstein | Glatz"
              year={artwork.year?.toString() || ''}
              technique={artwork.technique || ''}
              size={artwork.size || ''}
              edition={artwork.edition || ''}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
