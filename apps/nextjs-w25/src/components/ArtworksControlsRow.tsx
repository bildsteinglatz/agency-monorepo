"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useGodNav } from "@/components/GodNavContext";

export interface ArtworksControlsRowProps {
  params: any;
  layer: string;
  baseParams: Record<string, string | undefined>;
  sorts: ReadonlyArray<{ key: string; label: string }>;
  sort: string;
  start: number;
  end: number;
  totalCount: number;
  filterOptions: {
    fieldOfArt: Array<any>;
    bodyOfWork: Array<any>;
    years: Array<any>;
    artists: Array<any>;
  };
    // qs: (base: Record<string, string | undefined>, mods: Record<string, string | null | undefined>) => string;
}

export function ArtworksControlsRow({ params, layer, baseParams, sorts, sort, start, end, totalCount, filterOptions }: ArtworksControlsRowProps) {
  const { showGodNav } = useGodNav();
  // Destructure filterOptions for dropdowns
  const { fieldOfArt, bodyOfWork, years, artists } = filterOptions;
  function qs(base: Record<string, string | undefined>, mods: Record<string, string | null | undefined>) {
    const p = new URLSearchParams();
    const next: Record<string, string | undefined> = { ...base };
    for (const [k, v] of Object.entries(mods)) {
      if (v === null) delete next[k];
      else if (v !== undefined) next[k] = v;
    }
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    return p.toString();
  }
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  <form method="get" action="/artworks-browse-controlsrow" className="flex-1 max-w-md">
        {/* Preserve current filters */}
        <input type="hidden" name="layer" value={layer} />
        {params.sort && <input type="hidden" name="sort" value={params.sort} />}
        <div className="relative mb-2">
          <input
            type="text"
            name="search"
            defaultValue={params.search || ''}
            placeholder="Search artworks, artists, techniques…"
            className="w-full pl-3 pr-24 py-1 border-b-2 border-orange-500 focus:border-orange-700 bg-transparent text-foreground placeholder-foreground/50 outline-none rounded-none"
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
            {params.search && (
                <Link
                href={`/artworks-browse-controlsrow?${qs(baseParams, { search: null, page: '1' })}`}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </Link>
            )}
            <button
              type="submit"
              className="px-3 py-1 text-sm font-medium bg-orange-600 text-white rounded-md"
            >
              Search
            </button>
          </div>
        </div>
      </form>
      <div className="flex items-center justify-between md:justify-end gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {start + 1}-{Math.min(end, totalCount)} of {totalCount} artworks
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {sorts.map((s) => (
            <Link
            key={s.key}
            href={`/artworks-browse-controlsrow?${qs(baseParams, { sort: s.key, page: '1' })}`}
            className={`text-sm px-2.5 py-1.5 rounded-md transition-colors ${
              sort === s.key
                ? 'text-[#171717] dark:text-[#ededed]'
                : 'text-[#171717] dark:text-[#ededed]'
            } bg-transparent`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
