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
  "bodyOfWork": bodyOfWork-> { _id, title },
  "exhibitions": exhibitionHistory[]-> { _id, title },
  "literature": literature[]-> { _id, title },
  mainImage { ${IMAGE_FRAGMENT} },
  gallery[] { 
    ${IMAGE_FRAGMENT}
  },
  content,
  ${SLUG_FRAGMENT}
} | order(year desc)`;
