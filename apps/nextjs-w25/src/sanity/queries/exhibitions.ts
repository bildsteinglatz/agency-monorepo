import { IMAGE_FRAGMENT, ARTIST_FRAGMENT, SLUG_FRAGMENT } from './fragments';

const EXHIBITION_FIELDS = `
  _id,
  title,
  year,
  exhibitionType,
  serialNumber,
  mainImage { ${IMAGE_FRAGMENT} },
  ${SLUG_FRAGMENT},
  "artists": artist[]-> { ${ARTIST_FRAGMENT} },
  venue-> {
    name,
    city,
    state,
    country
  },
  showInSelectedExhibitions
`;

export const EXHIBITIONS_QUERY = `*[_type == "exhibition" && showInSelectedExhibitions == true] | order(year desc) [$start...$end] {
  ${EXHIBITION_FIELDS}
}`;

export const CV_EXHIBITIONS_QUERY = `*[_type == "exhibition"] | order(year desc) [$start...$end] {
  ${EXHIBITION_FIELDS}
}`;

export const EXHIBITION_BY_SLUG_QUERY = `*[_type == "exhibition" && slug.current == $slug][0] {
  ${EXHIBITION_FIELDS},
  _createdAt,
  _updatedAt,
  text,
  gallery,
  weblink,
  notes
}`;

export const EXHIBITION_BY_ID_QUERY = `*[_type == "exhibition" && _id == $id][0] {
  ${EXHIBITION_FIELDS},
  _createdAt,
  _updatedAt,
  text,
  weblink,
  notes,
  "gallery": gallery[]{
    _key,
    asset-> {
      _id,
      url,
      metadata {
        dimensions,
        lqip,
        palette
      }
    },
    caption,
    alt
  }
}`;

export const EXHIBITION_METADATA_QUERY = `*[_type == "exhibition" && _id == $id][0] {
  title,
  year,
  exhibitionType,
  text,
  mainImage {
    asset-> {
      url
    },
    alt
  },
  "artists": artist[]->name,
  "venue": venue.name
}`;

export const EXHIBITIONS_COUNT_QUERY = `count(*[_type == "exhibition" && showInSelectedExhibitions == true])`;

export const EXHIBITIONS_BY_TYPE_QUERY = `*[_type == "exhibition" && showInSelectedExhibitions == true && exhibitionType == $type] | order(year desc) {
  ${EXHIBITION_FIELDS}
}`;

export const EXHIBITIONS_BY_YEAR_QUERY = `*[_type == "exhibition" && showInSelectedExhibitions == true && year == $year] | order(title asc) {
  ${EXHIBITION_FIELDS}
}`;

export const EXHIBITIONS_BY_VENUE_QUERY = `*[_type == "exhibition" && showInSelectedExhibitions == true && venue.name == $venueName] | order(year desc) {
  ${EXHIBITION_FIELDS}
}`;

export const EXHIBITIONS_BY_ARTIST_QUERY = `*[_type == "exhibition" && showInSelectedExhibitions == true && $artistId in artist[]._ref] | order(year desc) {
  ${EXHIBITION_FIELDS}
}`;

export const RELATED_EXHIBITIONS_QUERY = `*[_type == "exhibition" && showInSelectedExhibitions == true && _id != $currentId && (
  venue.name == $venueName ||
  year == $year ||
  count((artist[]._ref)[@ in $artistIds]) > 0
)] | order(year desc) [0..5] {
  ${EXHIBITION_FIELDS}
}`;

export const EXHIBITION_YEARS_QUERY = `array::unique(*[_type == "exhibition" && showInSelectedExhibitions == true].year) | order(@ desc)`;

export const EXHIBITION_TYPES_QUERY = `array::unique(*[_type == "exhibition" && showInSelectedExhibitions == true && defined(exhibitionType)].exhibitionType)`;

export const SEARCH_EXHIBITIONS_QUERY = `*[_type == "exhibition" && showInSelectedExhibitions == true && (
  title match $searchTerm ||
  text match $searchTerm ||
  artist[]->name match $searchTerm ||
  venue.name match $searchTerm ||
  venue->name match $searchTerm
)] | order(year desc) {
  ${EXHIBITION_FIELDS}
}`;

export const FILTERED_EXHIBITIONS_QUERY = `*[_type == "exhibition" && showInSelectedExhibitions == true && 
  (!defined($type) || exhibitionType == $type) && 
  (!defined($year) || year == $year)
] | order(year desc) [$start...$end] {
  ${EXHIBITION_FIELDS},
  text,
  weblink,
  notes,
  "gallery": gallery[]{
    _key,
    asset-> {
      _id,
      url,
      metadata {
        dimensions,
        lqip
      }
    },
    caption
  }
}`;

export const FILTERED_EXHIBITIONS_COUNT_QUERY = `count(*[_type == "exhibition" && showInSelectedExhibitions == true && 
  (!defined($type) || exhibitionType == $type) && 
  (!defined($year) || year == $year)
])`;

export const EXHIBITION_NAVIGATION_QUERY = `*[_type == "exhibition" && showInSelectedExhibitions == true] | order(year desc) {
  _id,
  title,
  year
}`;

export const EXHIBITION_ORDER_QUERY = `*[_type == "exhibitionOrder"][0].orderedExhibitions[$start...$end]->{
  ${EXHIBITION_FIELDS}
}`;

export const EXHIBITION_ORDER_COUNT_QUERY = `count(*[_type == "exhibitionOrder"][0].orderedExhibitions)`;
