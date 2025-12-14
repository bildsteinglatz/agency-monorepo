# Advanced Querying & Data Relationships Guide

## Complete Schema Relationships

### Document Types Overview
```
artist          → Individual artists
artwork         → Art pieces with categories and exhibitions
category        → Hierarchical categorization system
categoryType    → Category type definitions (field-of-art, body-of-work, year, god-mode)
exhibition      → Exhibitions with venues and artists
textDocument    → Text content (reviews, statements, etc.)
venue           → Exhibition venues and locations
```

### Key Relationships
```
artwork → artist[]          // Multiple artists per artwork
artwork → category[]        // Multiple categories per field
artwork → exhibition[]      // Exhibition history
exhibition → artist[]       // Participating artists
exhibition → venue          // Single venue per exhibition
category → categoryType     // Type classification
```

## Advanced GROQ Patterns

### 1. Complete Artwork Data with All Relations
```groq
*[_type == "artwork"] {
  _id,
  title,
  mainImage,
  "artists": artist[]->{
    _id,
    name,
    "slug": slug.current,
    mainImage,
    bio
  },
  year,
  size,
  technique,
  edition,
  serialNumber,
  availability,
  price,
  content,
  notes,
  showOnWebsite,
  
  // Category relationships
  "fieldOfArt": fieldOfArt[]->{
    _id,
    title,
    "type": categoryType->name
  },
  "bodyOfWork": bodyOfWork[]->{
    _id,
    title,
    "type": categoryType->name
  },
  "yearCategory": year->{
    _id,
    title,
    "type": categoryType->name
  },
  
  // Exhibition history
  "exhibitions": *[_type == "exhibition" && references(^._id)] {
    _id,
    title,
    year,
    exhibitionType,
    "venue": venue->{
      name,
      location,
      "slug": slug.current
    }
  },
  
  // Full image gallery
  "gallery": gallery[]{
    asset,
    caption,
    alt,
    "url": asset->url,
    "metadata": asset->metadata {
      dimensions,
      size
    }
  }
}
```

### 2. Exhibition with Complete Context
```groq
*[_type == "exhibition"] {
  _id,
  title,
  year,
  exhibitionType,
  text,
  weblink,
  mainImage,
  
  // All participating artists with their info
  "artists": artist[]->{
    _id,
    name,
    "slug": slug.current,
    mainImage,
    bio,
    website,
    
    // Count of artworks by this artist
    "artworkCount": count(*[_type == "artwork" && references(^._id)])
  },
  
  // Venue with complete information
  "venue": venue->{
    _id,
    name,
    location,
    address,
    website,
    description,
    "slug": slug.current,
    
    // Other exhibitions at this venue
    "otherExhibitions": *[_type == "exhibition" && venue._ref == ^._id && ^._id != ^^._id] | order(year desc) [0...5] {
      title,
      year,
      "slug": slug.current
    }
  },
  
  // Featured artworks in this exhibition
  "artworks": *[_type == "artwork" && references(^._id)] {
    _id,
    title,
    mainImage,
    "artists": artist[]->name
  },
  
  // Gallery with captions
  "gallery": gallery[]{
    asset,
    caption,
    alt,
    "url": asset->url
  }
}
```

### 3. Artist Profile with Complete Portfolio
```groq
*[_type == "artist" && _id == $artistId][0] {
  _id,
  name,
  bio,
  mainImage,
  website,
  "slug": slug.current,
  
  // All artworks by this artist
  "artworks": *[_type == "artwork" && references(^._id)] | order(year desc) {
    _id,
    title,
    year,
    mainImage,
    "slug": slug.current,
    
    // Categories for each artwork
    "fieldOfArt": fieldOfArt[]->title,
    "bodyOfWork": bodyOfWork[]->title
  },
  
  // All exhibitions featuring this artist
  "exhibitions": *[_type == "exhibition" && references(^._id)] | order(year desc) {
    _id,
    title,
    year,
    exhibitionType,
    "venue": venue->{
      name,
      location
    },
    "slug": slug.current
  },
  
  // Statistics
  "stats": {
    "totalArtworks": count(*[_type == "artwork" && references(^._id)]),
    "totalExhibitions": count(*[_type == "exhibition" && references(^._id)]),
    "firstExhibition": *[_type == "exhibition" && references(^._id)] | order(year asc)[0].year,
    "latestExhibition": *[_type == "exhibition" && references(^._id)] | order(year desc)[0].year
  }
}
```

### 4. Category-Based Filtering
```groq
// Get all artworks in a specific field of art
*[_type == "artwork" && count(fieldOfArt[@ -> categoryType->slug.current == "field-of-art" && @ -> title == $categoryName]) > 0] {
  _id,
  title,
  mainImage,
  "artists": artist[]->name,
  year
}

// Get artworks by body of work series
*[_type == "artwork" && count(bodyOfWork[@ -> categoryType->slug.current == "body-of-work" && @ -> title == $seriesName]) > 0] {
  _id,
  title,
  mainImage,
  "artists": artist[]->name,
  year
}

// Get artworks from specific year category
*[_type == "artwork" && year -> categoryType->slug.current == "year" && year -> title == $yearString] {
  _id,
  title,
  mainImage,
  "artists": artist[]->name
}
```

### 5. Cross-Document Search
```groq
// Search across artworks, exhibitions, and texts
{
  "artworks": *[_type == "artwork" && (
    title match $searchTerm + "*" ||
    artist[]->name match $searchTerm + "*" ||
    technique match $searchTerm + "*"
  )][0...10] {
    _id,
    title,
    mainImage,
    "type": "artwork",
    "artists": artist[]->name
  },
  
  "exhibitions": *[_type == "exhibition" && (
    title match $searchTerm + "*" ||
    artist[]->name match $searchTerm + "*" ||
    venue->name match $searchTerm + "*"
  )][0...10] {
    _id,
    title,
    year,
    "type": "exhibition",
    "venue": venue->name
  },
  
  "texts": *[_type == "textDocument" && showOnWebsite == true && (
    title match $searchTerm + "*" ||
    author match $searchTerm + "*" ||
    textContent match $searchTerm + "*"
  )][0...10] {
    _id,
    title,
    author,
    "type": "textDocument",
    category
  }
}
```

### 6. Timeline and Chronological Data
```groq
// Complete timeline of activities
{
  "timeline": [
    ...*[_type == "exhibition"] {
      _id,
      "date": year,
      "type": "exhibition",
      title,
      "venue": venue->name,
      "artists": artist[]->name
    },
    ...*[_type == "artwork" && defined(year)] {
      _id,
      "date": year->title,
      "type": "artwork", 
      title,
      "artists": artist[]->name
    },
    ...*[_type == "textDocument" && showOnWebsite == true && defined(date)] {
      _id,
      "date": date,
      "type": "textDocument",
      title,
      author,
      category
    }
  ] | order(date desc)
}
```

## Complex Filtering Patterns

### Multi-Category Filters
```javascript
// Frontend filter building
function buildArtworkQuery(filters) {
  let conditions = ['_type == "artwork"'];
  
  if (filters.fieldOfArt?.length) {
    const fieldConditions = filters.fieldOfArt.map(cat => 
      `count(fieldOfArt[@ -> title == "${cat}"]) > 0`
    );
    conditions.push(`(${fieldConditions.join(' || ')})`);
  }
  
  if (filters.bodyOfWork?.length) {
    const bodyConditions = filters.bodyOfWork.map(cat => 
      `count(bodyOfWork[@ -> title == "${cat}"]) > 0`
    );
    conditions.push(`(${bodyConditions.join(' || ')})`);
  }
  
  if (filters.year?.length) {
    const yearConditions = filters.year.map(year => 
      `year -> title == "${year}"`
    );
    conditions.push(`(${yearConditions.join(' || ')})`);
  }
  
  if (filters.artist?.length) {
    const artistConditions = filters.artist.map(artist => 
      `count(artist[@ -> name == "${artist}"]) > 0`
    );
    conditions.push(`(${artistConditions.join(' || ')})`);
  }
  
  return `*[${conditions.join(' && ')}]`;
}
```

## Performance Optimization

### 1. Efficient Pagination
```groq
// Get total count and paginated results
{
  "total": count(*[_type == "artwork" && showOnWebsite == true]),
  "artworks": *[_type == "artwork" && showOnWebsite == true] | order(_createdAt desc) [$offset...$limit] {
    _id,
    title,
    mainImage,
    "artists": artist[]->name,
    year
  }
}
```

### 2. Selective Field Loading
```groq
// Light version for lists
*[_type == "artwork"] {
  _id,
  title,
  mainImage,
  "artistNames": artist[]->name,
  "yearTitle": year->title
}

// Heavy version for detail pages  
*[_type == "artwork" && _id == $id][0] {
  // ... all fields including relations
}
```

### 3. Cached Aggregations
```groq
// Get category counts for filters
{
  "fieldOfArtCounts": *[_type == "category" && categoryType->slug.current == "field-of-art"] {
    "category": title,
    "count": count(*[_type == "artwork" && references(^._id)])
  },
  
  "bodyOfWorkCounts": *[_type == "category" && categoryType->slug.current == "body-of-work"] {
    "category": title,
    "count": count(*[_type == "artwork" && references(^._id)])
  }
}
```

## Error Handling Patterns

### Safe Reference Resolution
```groq
// Handle missing references gracefully
*[_type == "artwork"] {
  _id,
  title,
  "artists": artist[defined(@)]->{
    name,
    "slug": slug.current
  },
  "venue": venue->{
    name,
    location
  } | null,
  "categories": {
    "fieldOfArt": fieldOfArt[defined(@)]->title,
    "bodyOfWork": bodyOfWork[defined(@)]->title
  }
}
```

This advanced querying guide provides patterns for complex data retrieval, relationship traversal, and performance optimization across your entire Sanity dataset.
