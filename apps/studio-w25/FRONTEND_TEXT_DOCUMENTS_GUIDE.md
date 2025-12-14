# Text Documents Frontend Integration Guide

## Schema Overview

The `textDocument` schema provides rich text content management with the following structure:

### Core Fields
- **title** (string, required): Document title
- **author** (string): Author name  
- **date** (date): Publication/creation date
- **language** (string): Language code (en, de, fr, other)
- **textContent** (text): Main text content (plain text, not rich text)
- **weblink** (url): External link to original source
- **category** (string): Document category (review, statement, exhibition, catalog, interview, other)
- **originalPdf** (file): PDF attachment
- **notes** (text): Internal notes
- **showOnWebsite** (boolean): Visibility flag (default: true)

## GROQ Queries

### 1. Fetch All Published Text Documents
```groq
*[_type == "textDocument" && showOnWebsite == true] | order(date desc) {
  _id,
  title,
  author,
  date,
  language,
  category,
  weblink,
  "slug": slug.current,
  "excerpt": string::startsWith(textContent, 200)
}
```

### 2. Fetch Single Text Document
```groq
*[_type == "textDocument" && _id == $id && showOnWebsite == true][0] {
  _id,
  title,
  author,
  date,
  language,
  textContent,
  weblink,
  category,
  notes,
  "originalPdf": originalPdf.asset->url,
  "slug": slug.current
}
```

### 3. Fetch by Category
```groq
*[_type == "textDocument" && category == $category && showOnWebsite == true] | order(date desc) {
  _id,
  title,
  author,
  date,
  language,
  weblink,
  "slug": slug.current,
  "excerpt": string::startsWith(textContent, 200)
}
```

### 4. Fetch by Language
```groq
*[_type == "textDocument" && language == $language && showOnWebsite == true] | order(date desc) {
  _id,
  title,
  author,
  date,
  category,
  weblink,
  "slug": slug.current,
  "excerpt": string::startsWith(textContent, 200)
}
```

### 5. Search Text Documents
```groq
*[_type == "textDocument" && showOnWebsite == true && (
  title match $searchTerm + "*" ||
  author match $searchTerm + "*" ||
  textContent match $searchTerm + "*"
)] | order(date desc) {
  _id,
  title,
  author,
  date,
  category,
  language,
  "slug": slug.current,
  "excerpt": string::startsWith(textContent, 200)
}
```

## Frontend Implementation Examples

### React Component Structure
```jsx
// components/texts/
├── TextList.jsx           // List all texts
├── TextCard.jsx           // Individual text preview
├── TextDetail.jsx         // Full text display
├── TextFilters.jsx        // Category/language filters
├── TextSearch.jsx         // Search functionality
└── CategoryBadge.jsx      // Category styling
```

### Data Fetching Hook (React)
```javascript
import { useEffect, useState } from 'react';
import { client } from '../sanity/client';

export function useTexts(filters = {}) {
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTexts = async () => {
      try {
        setLoading(true);
        
        let query = `*[_type == "textDocument" && showOnWebsite == true`;
        
        // Add filters
        if (filters.category) {
          query += ` && category == "${filters.category}"`;
        }
        if (filters.language) {
          query += ` && language == "${filters.language}"`;
        }
        
        query += `] | order(date desc) {
          _id,
          title,
          author,
          date,
          language,
          category,
          weblink,
          "excerpt": string::startsWith(textContent, 200)
        }`;
        
        const result = await client.fetch(query);
        setTexts(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTexts();
  }, [filters]);

  return { texts, loading, error };
}
```

### Text Display Components

#### TextCard.jsx
```jsx
export function TextCard({ text }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="text-card">
      <div className="text-card__header">
        <h3 className="text-card__title">
          <Link to={`/texts/${text._id}`}>{text.title}</Link>
        </h3>
        <CategoryBadge category={text.category} />
      </div>
      
      <div className="text-card__meta">
        {text.author && (
          <span className="text-card__author">by {text.author}</span>
        )}
        {text.date && (
          <span className="text-card__date">{formatDate(text.date)}</span>
        )}
        {text.language && (
          <span className="text-card__language">{text.language.toUpperCase()}</span>
        )}
      </div>
      
      {text.excerpt && (
        <p className="text-card__excerpt">{text.excerpt}...</p>
      )}
      
      {text.weblink && (
        <a 
          href={text.weblink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-card__external-link"
        >
          Read Full Article →
        </a>
      )}
    </article>
  );
}
```

#### TextDetail.jsx
```jsx
export function TextDetail({ textId }) {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchText = async () => {
      const query = `*[_type == "textDocument" && _id == $id && showOnWebsite == true][0] {
        _id,
        title,
        author,
        date,
        language,
        textContent,
        weblink,
        category,
        "originalPdf": originalPdf.asset->url
      }`;
      
      const result = await client.fetch(query, { id: textId });
      setText(result);
      setLoading(false);
    };
    
    fetchText();
  }, [textId]);

  if (loading) return <div>Loading...</div>;
  if (!text) return <div>Text not found</div>;

  return (
    <article className="text-detail">
      <header className="text-detail__header">
        <h1 className="text-detail__title">{text.title}</h1>
        
        <div className="text-detail__meta">
          <CategoryBadge category={text.category} />
          {text.author && <span>by {text.author}</span>}
          {text.date && <span>{formatDate(text.date)}</span>}
          {text.language && <span>{text.language.toUpperCase()}</span>}
        </div>
        
        <div className="text-detail__actions">
          {text.weblink && (
            <a href={text.weblink} target="_blank" rel="noopener noreferrer">
              Read Original →
            </a>
          )}
          {text.originalPdf && (
            <a href={text.originalPdf} target="_blank" rel="noopener noreferrer">
              Download PDF
            </a>
          )}
        </div>
      </header>
      
      <div className="text-detail__content">
        <div className="text-content">
          {text.textContent.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
```

## Category System
Available categories with suggested styling:
- **review** → 🔍 Reviews & Criticism
- **statement** → ✍️ Artist Statements  
- **exhibition** → 🎨 Exhibition Texts
- **catalog** → 📚 Catalog Essays
- **interview** → 🎤 Interviews
- **other** → 📄 Other

## Language Support
- **en** → English
- **de** → German
- **fr** → French  
- **other** → Other languages

## URL Structure Recommendations
```
/texts                          // All texts
/texts/reviews                  // By category
/texts/en                       // By language
/texts/2023                     // By year
/texts/search?q=painting        // Search
/texts/[id]                     // Individual text
```

## SEO & Meta Tags
```jsx
export function TextDetailMeta({ text }) {
  return (
    <Helmet>
      <title>{text.title}</title>
      <meta name="description" content={text.excerpt} />
      <meta name="author" content={text.author} />
      <meta property="og:title" content={text.title} />
      <meta property="og:description" content={text.excerpt} />
      <meta property="og:type" content="article" />
      {text.date && (
        <meta property="article:published_time" content={text.date} />
      )}
      {text.author && (
        <meta property="article:author" content={text.author} />
      )}
    </Helmet>
  );
}
```

## Important Notes

### Data Handling
- **textContent is plain text** (not rich text/portable text)
- **Split paragraphs** on double newlines (`\n\n`)
- **Check showOnWebsite** flag for all queries
- **Handle missing fields** gracefully (author, date, weblink can be null)

### File Attachments
- **originalPdf**: Access via `originalPdf.asset->url`
- **PDF files only** - validate file type in UI

### Performance
- **Use excerpts** for list views (first 200 characters)
- **Implement pagination** for large collections
- **Cache frequently accessed texts**
- **Lazy load full content** on detail pages

### Content Formatting
```javascript
// Format text content for display
function formatTextContent(textContent) {
  return textContent
    .split('\n\n')                    // Split paragraphs
    .filter(paragraph => paragraph.trim())  // Remove empty paragraphs
    .map(paragraph => paragraph.trim())     // Clean whitespace
}
```

This schema provides a robust foundation for managing text documents with proper categorization, multilingual support, and flexible content presentation.
