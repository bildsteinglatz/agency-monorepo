# Hybrid Hierarchical Artwork Navigation Implementation

## Project Context

I'm working on a Sanity-powered art portfolio website for Bildstein/Glatz. We've updated our backend schema to support a hybrid hierarchical category system and now need to implement the frontend navigation components.

## Current Schema Structure

Our artwork schema uses:
- **fieldOfArt**: Main discipline (painting, sculpture, etc.)
- **bodyOfWork**: Series or collection
- **extraCategories**: Special tags/categories

Our category schema now includes:
- **categoryType**: Reference to categoryType document (field-of-art, body-of-work, god-mode)
- **parent**: Optional reference to parent category for hierarchy

## Navigation Requirements

We need a four-level navigation structure:
1. **First level**: Category types (Field of Art, Body of Work, Year, God Mode)
2. **Second level**: Categories within each type
3. **Third level**: Artwork previews filtered by selected categories
4. **Fourth level**: Artwork detail pages

The navigation should:
- Support both direct URL parameters (/works?field=drawing) and hierarchical paths (/works/field-of-art/drawing)
- Allow viewing artworks that match any category in the hierarchy
- Include breadcrumb navigation for browsing
- Display category counts for informed browsing
- Be responsive and accessible
- Have smooth transitions and modern aesthetics

## Implementation Tasks

### 1. Create Hierarchical Navigation Component

Implement a primary navigation component that:
- Shows the four main category types
- Expands to show categories within a selected type
- Supports browsing through nested categories
- Displays breadcrumbs for current path
- Shows counts of artworks in each category

### 2. Implement Category Detail Page

Create a page that:
- Shows artworks filtered by selected category
- Includes filtering options for refining results
- Displays subcategories if available
- Has a clean, gallery-style layout
- Includes sorting options (relevance, year, title)

### 3. Build Artwork Grid Component

Create a responsive grid to display artwork previews:
- Card-based design with images and basic info
- Lazy loading for performance
- Hover states with additional details
- Transition animations between states

### 4. Create Artwork Detail Page

Implement the final level showing artwork details:
- Large artwork image(s)
- Complete metadata
- Related artworks
- Navigation to previous/next works
- Ability to navigate back to category view

### 5. Connect URL and State Management

Implement a system that:
- Syncs navigation state with URL parameters
- Supports both hierarchical URLs and query parameters
- Allows for direct linking and sharing
- Preserves navigation state during browsing

## Technical Guidelines

### GROQ Queries

For fetching the navigation structure:
```groq
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
```

For fetching artworks by category (including subcategories):
```groq
// First get the category and its subcategories
{
  "category": *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    "type": categoryType->slug.current
  },
  "subcategories": *[
    _type == "category" && 
    parent._ref in *[_type == "category" && slug.current == $slug]._id
  ]._id
} {
  "artworks": *[
    _type == "artwork" && (
      // Match based on category type
      (
        $type == "field-of-art" && (
          fieldOfArt._ref == category._id ||
          fieldOfArt._ref in subcategories
        )
      ) ||
      (
        $type == "body-of-work" && (
          bodyOfWork._ref == category._id ||
          bodyOfWork._ref in subcategories
        )
      ) ||
      (
        $type == "god-mode" && (
          category._id in extraCategories[]._ref ||
          count(extraCategories[_ref in subcategories]) > 0
        )
      )
    )
  ] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    "image": mainImage,
    "artist": artist->name,
    "year": year
  }
}.artworks
```

### Component Structure

```
/components
  /navigation
    - HierarchicalNavigation.jsx (main container)
    - CategoryTypeList.jsx (first level)
    - CategoryList.jsx (second level)
    - CategoryDetail.jsx (third level with artworks)
    - BreadcrumbNav.jsx (breadcrumb component)
  /artwork
    - ArtworkGrid.jsx (responsive grid layout)
    - ArtworkCard.jsx (preview card)
    - ArtworkDetail.jsx (detail view)
  /ui
    - SortDropdown.jsx (sorting options)
    - FilterBar.jsx (active filters display)
    - Pagination.jsx (if needed)
```

### Design & Aesthetics

- Use a clean, minimal design that puts focus on the artwork
- Include subtle animations for transitions between views
- Implement a responsive layout that works well on mobile
- Ensure proper spacing between elements for readability
- Use consistent typography and color scheme
- Consider light/dark mode support

## Performance Considerations

- Implement virtualized lists for large collections
- Use proper image optimization (responsive sizes, lazy loading)
- Cache navigation structure and category data
- Use SWR or React Query for data fetching
- Consider implementing incremental static regeneration for popular pages

## Accessibility Requirements

- Ensure keyboard navigation works throughout
- Add proper ARIA attributes to interactive elements
- Maintain sufficient color contrast
- Include focus indicators for keyboard users
- Test with screen readers

Please implement this navigation system with a focus on clean, maintainable code and a high-quality user experience that showcases the artwork effectively.
