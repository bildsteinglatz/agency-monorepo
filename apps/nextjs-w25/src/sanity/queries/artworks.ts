import { IMAGE_FRAGMENT, ARTIST_FRAGMENT, SLUG_FRAGMENT } from './fragments';

const BASIC_ARTWORK_FIELDS = `
  _id,
  title,
  year,
  serialNumber,
  vimeoUrl,
  mainImage { ${IMAGE_FRAGMENT} },
  artist-> { ${ARTIST_FRAGMENT} },
  fieldOfArt-> { _id, title, description, ${SLUG_FRAGMENT} },
  "bodyOfWorkRef": bodyOfWork, bodyOfWork-> { _id, title, description, ${SLUG_FRAGMENT} },
  technique,
  dimensions,
  price,
  isSold,
  showOnWebsite,
  ${SLUG_FRAGMENT}
`;

export const ARTWORKS_BY_FIELD_OF_ART_QUERY = `*[_type == "artwork" && showOnWebsite == true && fieldOfArt->_id == $fieldOfArt] { 
  _id, title, ${SLUG_FRAGMENT}, year
} | order(year desc)`;

export const ARTWORKS_BY_BODY_OF_WORK_QUERY = `*[_type == "artwork" && showOnWebsite == true && bodyOfWork->_id == $bodyOfWork] { 
  _id, title, ${SLUG_FRAGMENT}, year
} | order(year desc)`;

export const ARTWORKS_BY_YEAR_QUERY = `*[_type == "artwork" && showOnWebsite == true && year == $year] { 
  _id, title, ${SLUG_FRAGMENT}, year
} | order(fieldOfArt->sortOrder asc, bodyOfWork->sortOrder asc)`;

export const ARTWORK_SLUGS_QUERY = `*[_type == "artwork" && showOnWebsite == true] {
  ${SLUG_FRAGMENT}
}`;

export const ARTWORK_BY_ID_QUERY = `*[_type == "artwork" && _id == $id][0] {
  ${BASIC_ARTWORK_FIELDS},
  _createdAt,
  _updatedAt,
  size,
  edition,
  description
}`;

export const ARTWORK_METADATA_QUERY = `*[_type == "artwork" && slug.current == $slug && showOnWebsite == true][0] {
  title,
  description,
  mainImage {
    asset-> {
      url,
      metadata { dimensions }
    }
  }
}`;

export const ARTWORK_BY_SLUG_QUERY = `*[_type == "artwork" && slug.current == $slug && showOnWebsite == true][0] {
  ${BASIC_ARTWORK_FIELDS},
  _createdAt,
  _updatedAt,
  size,
  edition,
  description,
  "relatedArtworks": *[_type == "artwork" && references(^.bodyOfWork._ref) && _id != ^._id && showOnWebsite == true][0...4] {
    _id,
    title,
    mainImage { ${IMAGE_FRAGMENT} },
    ${SLUG_FRAGMENT}
  }
}`;

export const FEATURED_ARTWORKS_QUERY = `*[_type == "artwork" && showOnWebsite == true && featured == true && defined(mainImage)] | order(_updatedAt desc) [0..5] {
  ${BASIC_ARTWORK_FIELDS}
}`;

export const RELATED_ARTWORKS_QUERY = `*[_type == "artwork" && showOnWebsite == true && _id != $currentId && (
  artist._ref == $artistId || 
  fieldOfArt._ref == $fieldOfArtId ||
  bodyOfWork._ref == $bodyOfWorkId
)] | order(year desc) [0...4] {
  ${BASIC_ARTWORK_FIELDS}
}`;

export const ARTWORK_STATS_QUERY = `
{
  "totalArtworks": count(*[_type == "artwork" && showOnWebsite == true && defined(mainImage)]),
  "totalArtists": count(*[_type == "artist" && count(*[_type == "artwork" && artist._ref == ^._id && showOnWebsite == true]) > 0])
}
`;

export const ARTWORK_FILTER_OPTIONS_QUERY = `{
  "fieldOfArt": *[_type == "category" && (categoryType->slug.current == "field-of-art" || KategorieTyp->slug.current == "field-of-art") && showOnWebsite != false && count(*[_type == "artwork" && references(^._id) && showOnWebsite == true]) > 0] | order(sortOrder asc) {
    _id,
    vimeoUrl,
    title,
    description,
    ${SLUG_FRAGMENT},
    "artworkCount": count(*[_type == "artwork" && references(^._id) && showOnWebsite == true]),
    sortOrder,
    showOnWebsite
  },
  "bodyOfWork": *[_type == "category" && categoryType->slug.current == "body-of-work" && showOnWebsite != false && count(*[_type == "artwork" && references(^._id) && showOnWebsite == true]) > 0] | order(sortOrder asc) {
    _id,
    vimeoUrl,
    title,
    description,
    ${SLUG_FRAGMENT},
    "artworkCount": count(*[_type == "artwork" && references(^._id) && showOnWebsite == true]),
    sortOrder,
    showOnWebsite
  },
  "technique": *[_type == "category" && categoryType->slug.current == "technique" && showOnWebsite != false && count(*[_type == "artwork" && references(^._id) && showOnWebsite == true]) > 0] | order(sortOrder asc) {
    _id,
    title,
    ${SLUG_FRAGMENT},
    "artworkCount": count(*[_type == "artwork" && references(^._id) && showOnWebsite == true])
  },
  "artists": *[_type == "artist" && count(*[_type == "artwork" && references(^._id) && showOnWebsite == true]) > 0] | order(name asc) {
    _id,
    name,
    ${SLUG_FRAGMENT},
    "artworkCount": count(*[_type == "artwork" && references(^._id) && showOnWebsite == true])
  },
  "years": array::unique(*[_type == "artwork" && showOnWebsite == true && defined(year)].year) | order(@ desc)
}`;

// Base filter condition
const FILTER_CONDITION = `_type == "artwork" && showOnWebsite == true && defined(title) && defined(mainImage) && ($searchTerm == null || title match $searchTerm || artist->name match $searchTerm || technique match $searchTerm || fieldOfArt->title match $searchTerm || bodyOfWork->title match $searchTerm) && ($technique == null || technique match $technique) && ($fieldOfArt == null || fieldOfArt._ref == $fieldOfArt) && ($bodyOfWork == null || bodyOfWork._ref == $bodyOfWork) && ($year == null || year == $year) && ($artist == null || artist._ref == $artist)`;

export const ARTWORKS_FILTERED_QUERY = (order: string = "year desc") => `*[${FILTER_CONDITION}] | order(${order}) [$start...$end] {
  ${BASIC_ARTWORK_FIELDS}
}`;

// Pre-defined ordered queries for compatibility
export const ARTWORKS_FILTERED_QUERY_YEAR_DESC = ARTWORKS_FILTERED_QUERY("year desc");
export const ARTWORKS_FILTERED_QUERY_YEAR_ASC = ARTWORKS_FILTERED_QUERY("year asc");
export const ARTWORKS_FILTERED_QUERY_TITLE_ASC = ARTWORKS_FILTERED_QUERY("title asc");
export const ARTWORKS_FILTERED_QUERY_TITLE_DESC = ARTWORKS_FILTERED_QUERY("title desc");
export const ARTWORKS_FILTERED_QUERY_UPDATED = ARTWORKS_FILTERED_QUERY("_updatedAt desc");
export const ARTWORKS_COUNT_QUERY = `count(*[${FILTER_CONDITION}])`;
export const SELECTED_ARTWORKS_QUERY = `*[_type == "artworkOrder"][0].orderedArtworks[]->{
  ${BASIC_ARTWORK_FIELDS}
}`;
