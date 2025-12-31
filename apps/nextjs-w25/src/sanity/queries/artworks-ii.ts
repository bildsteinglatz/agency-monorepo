import { IMAGE_FRAGMENT, SLUG_FRAGMENT } from './fragments';

/**
 * Query optimized for Artworks II archive view
 * Returns all artworks with images array, category, and metadata
 */
export const ARTWORKS_II_QUERY = `*[_type == "artwork" && showOnWebsite == true && defined(mainImage)] {
  _id,
  title,
  year,
  size,
  technique,
  "category": fieldOfArt->title,
  "categoryId": fieldOfArt->_id,
  mainImage { ${IMAGE_FRAGMENT} },
  gallery[] { 
    asset->,
    alt,
    caption
  },
  content,
  ${SLUG_FRAGMENT}
} | order(year desc)`;
