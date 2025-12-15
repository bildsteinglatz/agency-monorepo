import { groq } from 'next-sanity';

export const NAVIGATION_STRUCTURE_QUERY = groq`
  *[_type == "categoryType"] | order(sortOrder asc) {
    _id,
    title,
    "slug": slug.current,
    "categories": *[
      _type == "category" && 
      categoryType._ref == ^._id && 
      !defined(parent)
    ] | order(sortOrder asc) {
      _id,
      title,
      "slug": slug.current,
      "hasChildren": count(*[_type == "category" && parent._ref == ^._id]) > 0,
      "artworkCount": count(*[_type == "artwork" && references(^._id)])
    }
  }
`;

export const CATEGORY_CHILDREN_QUERY = groq`
  *[_type == "category" && parent._ref == $parentId] | order(sortOrder asc) {
    _id,
    title,
    "slug": slug.current,
    "hasChildren": count(*[_type == "category" && parent._ref == ^._id]) > 0,
    "artworkCount": count(*[_type == "artwork" && references(^._id)])
  }
`;

export const CATEGORY_DETAILS_QUERY = groq`
  *[_type == "category" && _id == $id][0] {
    _id,
    title,
    description,
    "parent": parent->{_id, title, "slug": slug.current},
    "children": *[_type == "category" && parent._ref == ^._id] | order(sortOrder asc) {
      _id,
      title,
      "slug": slug.current,
      "artworkCount": count(*[_type == "artwork" && references(^._id)])
    }
  }
`;
