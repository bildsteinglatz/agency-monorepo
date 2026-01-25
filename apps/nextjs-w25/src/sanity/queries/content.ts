import { IMAGE_FRAGMENT, SLUG_FRAGMENT } from './fragments';


// --- Texts ---

export const TEXTS_QUERY = `*[_type == "textDocument" && showOnWebsite == true] | order(publishedAt desc) [$start...$end] {
  _id,
  title,
  ${SLUG_FRAGMENT},
  author,
  publishedAt,
  body[0...3], // First 3 blocks for preview
  textContent,
  showOnWebsite,
  "pdfUrl": originalPdf.asset->url
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
