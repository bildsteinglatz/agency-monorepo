"use client";
import React, { useEffect, useRef, useState } from "react";

export default function ResponsiveArtworkMedia({
  imgSrc,
  alt,
  className,
  margin = 8,
  // small extra space to add to computed available height (fixes visual sub-pixel gaps)
  extraSpace = 8,
}: {
  imgSrc?: string | undefined;
  alt?: string | undefined;
  className?: string;
  // margin in px to leave below media (default 0 to fill viewport)
  margin?: number;
  // extra space in px to add to available height
  extraSpace?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const recompute = () => {
    // on mobile we want a different behavior: don't constrain height, allow image
    // to fill from right-to-left and run out of sight at the bottom
    if (isMobile) {
      setMaxHeight(undefined);
      if (imgRef.current) imgRef.current.style.marginBottom = "";
      return;
    }
    const el = containerRef.current;
    if (!el) return setMaxHeight(undefined);
    const rect = el.getBoundingClientRect();
    // compute available pixels from top of media container to bottom of viewport
    // no extra margin by default so the image can reach the bottom exactly
  // add a small extraSpace to compensate for sub-pixel/rounding gaps in different browsers
  const available = Math.max(0, Math.floor(window.innerHeight - rect.top - (margin || 0) + (extraSpace || 0)));
    setMaxHeight(available);
    // small adjustment to remove sub-pixel gaps after image is rendered
    requestAnimationFrame(() => {
      if (imgRef.current) {
        const imgRect = imgRef.current.getBoundingClientRect();
        const gap = Math.round(window.innerHeight - imgRect.bottom);
        if (gap > 0 && gap <= 40) {
          imgRef.current.style.marginBottom = `-${gap}px`;
        } else {
          imgRef.current.style.marginBottom = "";
        }
      }
    });
  };

  useEffect(() => {
    // detect mobile at mount and on resize
    const checkMobile = () => {
      const mobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
      setIsMobile(mobile);
    };
    checkMobile();
    const onResize = () => {
      checkMobile();
      recompute();
    };
    window.addEventListener("resize", onResize);
    recompute();
    const ro = new ResizeObserver(() => recompute());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!imgSrc) return null;

  return (
    <div ref={containerRef} className="w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt || "Artwork"}
        className={`${className || (isMobile ? "w-full block object-contain object-right" : "w-full block object-contain object-left")}`}
        style={isMobile ? { height: 'auto', display: 'block', objectPosition: 'right top' } : (maxHeight ? { maxHeight: `${maxHeight}px`, height: 'auto', display: 'block' } : { height: 'auto', display: 'block' })}
        loading="lazy"
        onLoad={() => {
          // re-evaluate layout and remove any tiny bottom gap once the image has its natural size
          recompute();
        }}
      />
    </div>
  );
}
