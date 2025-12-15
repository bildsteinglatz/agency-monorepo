import Link from "next/link";
import { safeFetch } from '@/sanity/safeFetch'
import { MotionWrapper } from '@/components/MotionWrapper'
import {
  ARTWORK_FILTER_OPTIONS_QUERY,
  ARTWORKS_FILTERED_QUERY_YEAR_DESC,
  CATEGORY_DETAILS_QUERY,
} from "@/sanity/queries";
import { Category, ArtworkPreview } from '@/types/artwork'
import { slugToString } from '@/utils/sanity-helpers'
import { 
  ARTWORKS_PER_PAGE, 
  DEFAULT_YEAR, 
  DEFAULT_FIELD_OF_ART_SLUG, 
  DEFAULT_FIELD_OF_ART_TITLE,
  DEFAULT_BODY_OF_WORK_SLUG,
  DEFAULT_BODY_OF_WORK_TITLE
} from '@/constants/artwork'
import { GodModeArtworkLinks } from '@/components/GodModeArtworkLinks'
import { ArtworksClient } from '@/components/artworks/ArtworksClient'

export const metadata = {
  title: "Artworks | Bildstein | Glatz",
  description: "Minimal, fast artwork browser.",
};

type RawFilterOptions = {
  fieldOfArt?: Category[]
  bodyOfWork?: Category[]
  years?: number[]
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function NewWorkPage({ searchParams }: { searchParams: SearchParams }) {
  const resolved = await searchParams;
  const params = (resolved || {}) as Record<string, unknown>;
  const getParamString = (k: string): string | undefined => {
    const v = params[k];
    if (typeof v === 'string') return v;
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') return v[0];
    return undefined;
  }

  const page = Math.max(1, parseInt(getParamString('page') || "1", 10));
  const start = (page - 1) * ARTWORKS_PER_PAGE;
  const end = start + ARTWORKS_PER_PAGE;
  const layer = getParamString('layer') || "fieldOfArt";

  const searchTerm = getParamString('searchTerm') ?? null;
  const fieldOfArt = getParamString('fieldOfArt') ?? null;
  const bodyOfWork = getParamString('bodyOfWork') ?? null;
  const year = getParamString('year') ? Number(getParamString('year')) : null;
  const artist = getParamString('artist') ?? null;

  let rawFilterOptions: RawFilterOptions = { fieldOfArt: [], bodyOfWork: [], years: [] };
  let artworks: ArtworkPreview[] = [];
  let totalCount = 0;
  let categoryDetails: any = null;

  try {
    // 1. Fetch filter options first to determine defaults
    rawFilterOptions = (await safeFetch<RawFilterOptions>(ARTWORK_FILTER_OPTIONS_QUERY, undefined, { fieldOfArt: [], bodyOfWork: [], years: [] })) ?? { fieldOfArt: [], bodyOfWork: [], years: [] };

    const filterOptions = {
      fieldOfArt: Array.isArray(rawFilterOptions?.fieldOfArt) ? rawFilterOptions.fieldOfArt : [],
      bodyOfWork: Array.isArray(rawFilterOptions?.bodyOfWork) ? rawFilterOptions.bodyOfWork : [],
      years: Array.isArray(rawFilterOptions?.years) ? rawFilterOptions.years : [],
    };

    // 2. Determine effective selection (URL params OR defaults)
    let selectedFieldOfArt = fieldOfArt;
    let selectedBodyOfWork = bodyOfWork;
    let selectedYear = year;

    if (!selectedFieldOfArt && layer === "fieldOfArt") {
      const publicSpaceCategory = filterOptions.fieldOfArt.find((cat: Category) => cat.title === DEFAULT_FIELD_OF_ART_TITLE || slugToString(cat.slug) === DEFAULT_FIELD_OF_ART_SLUG);
      if (publicSpaceCategory && publicSpaceCategory._id) {
        selectedFieldOfArt = publicSpaceCategory._id;
      }
    }

    if (!selectedBodyOfWork && layer === "bodyOfWork") {
      const erstbesteigungCategory = filterOptions.bodyOfWork.find((cat: Category) => cat.title === DEFAULT_BODY_OF_WORK_TITLE || slugToString(cat.slug) === DEFAULT_BODY_OF_WORK_SLUG);
      if (erstbesteigungCategory && erstbesteigungCategory._id) {
        selectedBodyOfWork = erstbesteigungCategory._id;
      }
    }

    if (!selectedYear && layer === "year") {
      selectedYear = DEFAULT_YEAR;
    }

    if (selectedFieldOfArt) {
      categoryDetails = await safeFetch(CATEGORY_DETAILS_QUERY, { id: selectedFieldOfArt });
    } else if (selectedBodyOfWork) {
      categoryDetails = await safeFetch(CATEGORY_DETAILS_QUERY, { id: selectedBodyOfWork });
    }

    // 3. Single fetch for artworks with effective params
    const groqParams = { 
      searchTerm, 
      fieldOfArt: selectedFieldOfArt, 
      bodyOfWork: selectedBodyOfWork, 
      year: selectedYear, 
      artist, 
      technique: null 
    };
    
    // Fetch ALL matching artworks to handle grouping
    const allArtworks = (await safeFetch<ArtworkPreview[]>(ARTWORKS_FILTERED_QUERY_YEAR_DESC, { ...groqParams, start: 0, end: 10000 }, [])) ?? [];

    // Group by bodyOfWork if not filtering by a specific bodyOfWork
    const shouldGroup = !selectedBodyOfWork;

    if (allArtworks.length > 0) {
      const ftp = allArtworks.filter(a => a.title?.includes('FTP'));
      if (ftp.length > 0) {
        console.log(`DEBUG: Found ${ftp.length} FTP artworks`);
        console.log('DEBUG: First FTP bodyOfWork:', JSON.stringify(ftp[0].bodyOfWork, null, 2));
        console.log('DEBUG: shouldGroup:', shouldGroup);
      }
    }

    if (shouldGroup) {
      const groupedArtworks: ArtworkPreview[] = [];
      const seenBodyOfWork = new Set<string>();

      allArtworks.forEach(artwork => {
        const bowId = artwork.bodyOfWork?._id || artwork.bodyOfWorkRef?._ref;
        
        if (bowId) {
          // It has a body of work
          if (!seenBodyOfWork.has(bowId)) {
            // First time seeing this body of work - add it as the representative
            groupedArtworks.push(artwork);
            seenBodyOfWork.add(bowId);
          }
          // If we've already seen this body of work, skip this artwork (it's a sibling)
        } else {
          // No body of work, always add
          groupedArtworks.push(artwork);
        }
      });
      
      artworks = groupedArtworks.slice(start, end);
      // Calculate total count based on grouped list
      totalCount = groupedArtworks.length;
    } else {
      artworks = allArtworks.slice(start, end);
      // Calculate total count based on raw list
      totalCount = allArtworks.length;
    }

  } catch (error) {
    console.error('Failed to fetch data from Sanity:', error);
    // Return empty data if fetch fails
    rawFilterOptions = { fieldOfArt: [], bodyOfWork: [], years: [] };
    artworks = [];
  }

  const filterOptions = {
    fieldOfArt: Array.isArray(rawFilterOptions?.fieldOfArt) ? rawFilterOptions.fieldOfArt : [],
    bodyOfWork: Array.isArray(rawFilterOptions?.bodyOfWork) ? rawFilterOptions.bodyOfWork : [],
    years: Array.isArray(rawFilterOptions?.years) ? rawFilterOptions.years : [],
  };

  // Re-derive selected values for UI consistency (though they should match what we used for fetching)
  let selectedFieldOfArt = fieldOfArt;
  let selectedBodyOfWork = bodyOfWork;
  let selectedYear = year;

  if (!selectedFieldOfArt && layer === "fieldOfArt") {
    const publicSpaceCategory = filterOptions.fieldOfArt.find((cat: Category) => cat.title === DEFAULT_FIELD_OF_ART_TITLE || slugToString(cat.slug) === DEFAULT_FIELD_OF_ART_SLUG);
    if (publicSpaceCategory && publicSpaceCategory._id) {
      selectedFieldOfArt = publicSpaceCategory._id;
    }
  }

  if (!selectedBodyOfWork && layer === "bodyOfWork") {
    const erstbesteigungCategory = filterOptions.bodyOfWork.find((cat: Category) => cat.title === DEFAULT_BODY_OF_WORK_TITLE || slugToString(cat.slug) === DEFAULT_BODY_OF_WORK_SLUG);
    if (erstbesteigungCategory && erstbesteigungCategory._id) {
      selectedBodyOfWork = erstbesteigungCategory._id;
    }
  }

  if (!selectedYear && layer === "year") {
    selectedYear = DEFAULT_YEAR;
  }

  const baseParams: Record<string, string | undefined> = {
    page: String(page),
  fieldOfArt: selectedFieldOfArt || getParamString('fieldOfArt'),
  bodyOfWork: selectedBodyOfWork || getParamString('bodyOfWork'),
  year: selectedYear ? String(selectedYear) : getParamString('year'),
    layer,
  };

  return (
  <div className="py-0 text-left" style={{ marginLeft: 0, paddingLeft: 0 }}>
      {/* Navigation moved to ArtworksClient */}
      
      {/* Artworks Client Component */}
      <div className="mt-0">
        <ArtworksClient 
          artworks={artworks} 
          resultsCount={artworks.length}
          totalCount={totalCount}
          filterOptions={filterOptions}
          categoryDetails={categoryDetails}
        />
      </div>
    </div>
  );
}
