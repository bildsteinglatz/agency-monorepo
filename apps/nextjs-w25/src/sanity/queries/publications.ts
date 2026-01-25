import { IMAGE_FRAGMENT, SLUG_FRAGMENT } from './fragments';

/**
 * Query for Publications page
 * Returns publications in the order configured in Sanity Studio's "Publication Order (Visual List)"
 * Uses the publicationOrder document which contains a drag-and-drop ordered array
 */
export const PUBLICATIONS_QUERY = `*[_type == "publicationOrder"][0].orderedPublications[]-> {
  _id,
  title,
  subtitle,
  mainImage { ${IMAGE_FRAGMENT} },
  previewImages[] { 
    ...,
    ${IMAGE_FRAGMENT}
  },
  gallery[] { 
    ...,
    ${IMAGE_FRAGMENT}
  },
  bookFacts,
  "authors": authors[]->name,
  "authorsTitle": authors[]->title, 
  "author": author->name,
  "editors": editors[]->name,
  "editor": editor->name,
  "textAuthors": textAuthors,
  credits,
  shortDescription,
  description,
  "pdfUrl": pdf.asset->url,
  ${SLUG_FRAGMENT}
}`;
