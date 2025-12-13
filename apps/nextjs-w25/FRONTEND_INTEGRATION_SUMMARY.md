# Frontend Integration Summary

## 🎯 Quick Start Guide

### Sanity Client Setup
```javascript
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true, // Use CDN for better performance
});
```

## 📋 Complete Schema Overview

### Core Document Types
1. **artwork** - Main art pieces with images, categories, and metadata
2. **artist** - Artist profiles and biographies  
3. **exhibition** - Exhibition information with venues and participants
4. **venue** - Locations where exhibitions take place
5. **textDocument** - Text content (reviews, statements, catalog essays)
6. **publication** - Books and publications with detailed metadata
7. **category** - Hierarchical categorization system
8. **categoryType** - Category type definitions (field-of-art, body-of-work, year, god-mode)

### Key Relationships
```
artwork → artist[]          (many-to-many)
artwork → category[]        (via fieldOfArt, bodyOfWork, year fields)
exhibition → artist[]       (many-to-many)
exhibition → venue          (many-to-one)
category → categoryType     (many-to-one)
```

## 🔍 Essential GROQ Queries

### 1. All Artworks for Gallery View
```groq
*[_type == "artwork" && showOnWebsite == true] | order(_createdAt desc) {
  _id,
  title,
  mainImage,
  "artists": artist[]->{
    _id,
    name,
    "slug": slug.current
  },
  "yearCategory": year->title,
  "fieldOfArt": fieldOfArt[]->title,
  "bodyOfWork": bodyOfWork[]->title,
  size,
  technique,
  availability
}
```

### 2. Single Artwork Detail
```groq
*[_type == "artwork" && _id == $id][0] {
  _id,
  title,
  mainImage,
  "gallery": gallery[]{
    asset,
    caption,
    alt,
    "url": asset->url
  },
  "artists": artist[]->{
    _id,
    name,
    bio,
    "slug": slug.current,
    mainImage,
    website
  },
  year,
  size,
  technique,
  edition,
  serialNumber,
  availability,
  price,
  content,
  "fieldOfArt": fieldOfArt[]->{
    _id,
    title
  },
  "bodyOfWork": bodyOfWork[]->{
    _id, 
    title
  },
  "yearCategory": year->{
    _id,
    title
  },
  "exhibitions": *[_type == "exhibition" && references(^._id)] {
    _id,
    title,
    year,
    "venue": venue->{
      name,
      location
    }
  }
}
```

### 3. All Exhibitions
```groq
*[_type == "exhibition"] | order(year desc) {
  _id,
  title,
  year,
  exhibitionType,
  mainImage,
  "artists": artist[]->name,
  "venue": venue->{
    name,
    location
  }
}
```

### 4. All Text Documents
```groq
*[_type == "textDocument" && showOnWebsite == true] | order(date desc) {
  _id,
  title,
  author,
  date,
  category,
  language,
  "excerpt": string::startsWith(textContent, 200),
  weblink
}
```

### 3. Publications
```groq
*[_type == "publication"] | order(bookFacts.publishedDate desc) {
  _id,
  title,
  mainImage,
  bookFacts {
    publisher,
    edition,
    isbn,
    publishedDate,
    price,
    availability
  },
  "pdfUrl": pdf.asset->url
}
```

### 4. Texts
```groq
*[_type == "textDocument"] | order(date desc) {
  _id,
  title,
  author,
  date,
  category,
  "pdfUrl": originalPdf.asset->url,
  "mainImageUrl": mainImage.asset->url
}
```

## 🎨 Category System Deep Dive

### Category Types (Crucial for Filtering)
- **field-of-art**: Medium/discipline (Painting, Sculpture, Photography, etc.)
- **body-of-work**: Thematic series or collections
- **year**: Chronological categories (2020, 2021, etc.)  
- **god-mode**: Administrative/special categories

### Category Filtering Pattern
```groq
// Filter artworks by field of art
*[_type == "artwork" && count(fieldOfArt[@ -> categoryType->slug.current == "field-of-art" && @ -> title == "Painting"]) > 0]

// Filter by body of work
*[_type == "artwork" && count(bodyOfWork[@ -> categoryType->slug.current == "body-of-work" && @ -> title == "Heroes Series"]) > 0]

// Filter by year
*[_type == "artwork" && year -> categoryType->slug.current == "year" && year -> title == "2023"]
```

## 📱 Frontend Component Recommendations

### Artwork Components
- `ArtworkGrid` - Gallery view with filtering
- `ArtworkDetail` - Full artwork page
- `ArtworkCard` - Individual artwork preview
- `CategoryFilters` - Filter by category types
- `ImageGallery` - Multiple image display with lightbox

### Exhibition Components
- `ExhibitionList` - All exhibitions
- `ExhibitionDetail` - Full exhibition info
- `ExhibitionCard` - Preview card
- `VenueInfo` - Venue details display

### Text Components  
- `TextList` - All text documents
- `TextDetail` - Full text display
- `TextCard` - Text preview
- `CategoryBadge` - Text category styling

## 🔧 Critical Implementation Notes

### Image Handling
```javascript
// Image URL construction
const imageUrl = urlFor(image)
  .width(800)
  .height(600)
  .format('webp')
  .url();

// Responsive images
const imageUrlSet = [
  urlFor(image).width(400).url() + ' 400w',
  urlFor(image).width(800).url() + ' 800w',
  urlFor(image).width(1200).url() + ' 1200w'
].join(', ');
```

### Visibility Flags
- **artwork.showOnWebsite** - Controls public visibility
- **textDocument.showOnWebsite** - Controls text visibility
- Always filter by these flags in public queries

### Text Content Formatting
```javascript
// textDocument.textContent is plain text, split on double newlines
const formatText = (content) => {
  return content
    .split('\n\n')
    .filter(paragraph => paragraph.trim())
    .map(paragraph => paragraph.trim());
};
```

### Error Handling for References
```groq
// Safe reference resolution
"artists": artist[defined(@)]->{
  name,
  "slug": slug.current
}
```

## 🚀 Performance Best Practices

1. **Use CDN**: Set `useCdn: true` for public data
2. **Paginate**: Use `[0...20]` slice notation for large datasets
3. **Select Fields**: Only fetch needed fields in list views
4. **Cache Queries**: Implement query caching with SWR/React Query
5. **Image Optimization**: Always specify dimensions and format

## 🔒 Security Considerations

- No authentication tokens needed for public data
- API tokens have been sanitized from all scripts
- Use `showOnWebsite` flags to respect content visibility
- Validate user inputs for search and filtering

## 📚 Documentation Files

1. **FRONTEND_TEXT_DOCUMENTS_GUIDE.md** - Comprehensive text document integration
2. **FRONTEND_ADVANCED_QUERYING.md** - Complex queries and relationships
3. **CLEANUP_REPORT.md** - Details of removed interference code

## ✅ Ready to Go!

Your Sanity Studio is fully configured with:
- ✅ Clean schema definitions (7 document types)
- ✅ Proper category system with working filters  
- ✅ No build interference from old code
- ✅ Sanitized API tokens for security
- ✅ Complete documentation for frontend integration

The studio is production-ready and your frontend team has everything needed to build a comprehensive art portfolio website!
