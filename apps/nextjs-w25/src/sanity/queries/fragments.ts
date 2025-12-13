export const IMAGE_FRAGMENT = `
  asset-> {
    _id,
    url,
    metadata {
      dimensions,
      lqip,
      palette
    }
  },
  alt,
  caption,
  hotspot,
  crop
`;

export const ARTIST_FRAGMENT = `
  _id,
  name,
  "slug": slug.current,
  bio,
  mainImage {
    asset-> {
      _id,
      url
    }
  }
`;

export const SLUG_FRAGMENT = `"slug": slug.current`;
