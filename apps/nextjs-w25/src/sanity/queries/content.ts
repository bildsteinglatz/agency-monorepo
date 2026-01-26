import { SLUG_FRAGMENT } from './fragments';

// --- Texts ---

const TEXT_FIELDS = `
  _id,
  title,
  ${SLUG_FRAGMENT},
  author,
  publishedAt,
  category,
  body[0...3], // First 3 blocks for preview
  textContent,
  showOnWebsite,
  "pdfUrl": originalPdf.asset->url
`;

export const TEXTS_QUERY = `*[_type == "textDocument" && showOnWebsite == true] | order(publishedAt desc) [$start...$end] {
  ${TEXT_FIELDS}
}`;

export const TEXT_ORDER_QUERY = `*[_type == "textOrder"][0].orderedTexts[$start...$end]->{
  ${TEXT_FIELDS}
}`;

export const TEXT_TYPES_QUERY = `array::unique(*[_type == "textDocument" && showOnWebsite == true && defined(category)].category)`;

export const TEXT_YEARS_QUERY = `array::unique(*[_type == "textDocument" && showOnWebsite == true && defined(publishedAt)].publishedAt) | order(@ desc)`;

export const FILTERED_TEXTS_QUERY = `*[_type == "textDocument" && showOnWebsite == true && 
  (!defined($type) || category == $type) && 
  (!defined($year) || dateTime(publishedAt) >= dateTime($year + "-01-01T00:00:00Z") && dateTime(publishedAt) <= dateTime($year + "-12-31T23:59:59Z"))
] | order(publishedAt desc) [$start...$end] {
  ${TEXT_FIELDS}
}`;

export const SEARCH_TEXTS_QUERY = `*[_type == "textDocument" && showOnWebsite == true && (
  title match $searchTerm ||
  author match $searchTerm ||
  textContent match $searchTerm ||
  category match $searchTerm
)] | order(publishedAt desc) {
  ${TEXT_FIELDS}
}`;

export const TEXT_BY_SLUG_QUERY = `*[_type == "textDocument" && slug.current == $slug && showOnWebsite == true][0] {
  _id,
  title,
  ${SLUG_FRAGMENT},
  author,
  publishedAt,
  body,
  textContent,
  showOnWebsite,
  _updatedAt,
  "pdfUrl": originalPdf.asset->url
}`;

export const TEXT_METADATA_QUERY = `*[_type == "textDocument" && slug.current == $slug && showOnWebsite == true][0] {
  title,
  author,
  publishedAt,
  body[0...1], // First block for description
  textContent
}`;

export const TEXTS_COUNT_QUERY = `count(*[_type == "textDocument" && showOnWebsite == true])`;

export const TEXT_SLUGS_QUERY = `*[_type == "textDocument" && showOnWebsite == true] {
  ${SLUG_FRAGMENT}
}`;
