import { IMAGE_FRAGMENT, SLUG_FRAGMENT } from './fragments';

export const TIMELINE_ARTWORKS_QUERY = `*[_type == "timeline" && showOnWebsite == true] | order(date desc) {
  _id,
  title,
  "year": date,
  mainImage { ${IMAGE_FRAGMENT} },
  size
}`

export const TIMELINE_TEXTS_QUERY = `*[_type == "timelineText"] | order(year desc) {
  _id,
  year,
  date,
  title,
  text
}`

export const INTRO_SLIDES_QUERY = `*[_type == "introSlide"] | order(order asc) {
  _id,
  title,
  statement,
  "image": backgroundWorkImage { ${IMAGE_FRAGMENT} }
}`;
