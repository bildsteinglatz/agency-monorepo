# Artwork Filtering Guide

## URL-basierte Filterung

Die Kunstwerke können direkt über URL-Parameter gefiltert und aufgerufen werden. Die URL-Struktur ist dabei einfach und intuitiv gestaltet:

```
/works/?field=drawing&body=zeichnungen&year=2020&extra=exhibitions&sort=relevance
```

## Parameter-Übersicht

Die Filter-Parameter entsprechen den vier Kategorietypen im Schema:

| URL-Parameter | Kategorie-Typ | Beispiele | Beschreibung |
|---------------|---------------|-----------|--------------|
| `field` | field-of-art | drawing, painting, sculpture | Künstlerische Disziplin |
| `body` | body-of-work | heroes, loop, zeichnungen | Serie oder Werkreihe |
| `year` | year | 2020, 2019, 2018 | Jahr der Entstehung |
| `extra` | god-mode | exhibitions, themes | Zusätzliche Kategorien |
| `sort` | - | relevance, year-desc, title-asc | Sortieroptionen |

## Beispiel-URLs

Hier sind einige Beispiele für Filter-URLs:

### 1. Alle Zeichnungen anzeigen
```
/works/?field=drawing
```

Die entsprechende GROQ-Abfrage:
```groq
*[_type == "artwork" && fieldOfArt->slug.current == "drawing"]
```

### 2. Alle Werke aus der Serie "Heroes"
```
/works/?body=heroes
```

Die entsprechende GROQ-Abfrage:
```groq
*[_type == "artwork" && bodyOfWork->slug.current == "heroes"]
```

### 3. Alle Werke aus dem Jahr 2020
```
/works/?year=2020
```

Die entsprechende GROQ-Abfrage:
```groq
*[_type == "artwork" && year == 2020]
```

### 4. Alle Werke mit dem Tag "exhibitions"
```
/works/?extra=exhibitions
```

Die entsprechende GROQ-Abfrage:
```groq
*[_type == "artwork" && "exhibitions" in extraCategories[]->slug.current]
```

### 5. Kombination mehrerer Filter
```
/works/?field=painting&body=heroes&year=2020
```

Die entsprechende GROQ-Abfrage:
```groq
*[_type == "artwork" && 
  fieldOfArt->slug.current == "painting" && 
  bodyOfWork->slug.current == "heroes" &&
  year == 2020
]
```

### 6. Mit Sortierung
```
/works/?field=drawing&sort=year-desc
```

## Sortieroptionen

Die folgenden Sortieroptionen sind verfügbar:

| Option | Beschreibung |
|--------|--------------|
| `relevance` | Nach Relevanz (Standard) |
| `year-desc` | Neueste zuerst |
| `year-asc` | Älteste zuerst |
| `title-asc` | A-Z nach Titel |
| `title-desc` | Z-A nach Titel |

## Implementierung im Frontend

### GROQ-Abfrage aus URL-Parametern erstellen

```javascript
function buildFilterQuery(filters) {
  const { field, body, year, extra } = filters;
  
  const conditions = [];
  
  if (field) {
    conditions.push(`fieldOfArt->slug.current == "${field}"`);
  }
  
  if (body) {
    conditions.push(`bodyOfWork->slug.current == "${body}"`);
  }
  
  if (year) {
    conditions.push(`yearCategory->slug.current == "${year}"`);
  }
  
  if (extra) {
    conditions.push(`"${extra}" in extraCategories[]->slug.current`);
  }
  
  const filterString = conditions.length > 0 
    ? ` && ${conditions.join(' && ')}` 
    : '';
    
  return `
    *[_type == "artwork"${filterString}] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      "image": mainImage,
      "artist": artist->name,
      "fieldOfArt": fieldOfArt->title,
      "bodyOfWork": bodyOfWork->title,
      "year": yearCategory->title
    }
  `;
}
```

### Implementierung mit URL-Synchronisierung

```javascript
// Im Frontend (z.B. React)
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { client } from '../utils/sanityClient';

function ArtworksPage() {
  const router = useRouter();
  const { field, body, year, extra, sort = 'relevance' } = router.query;
  const [artworks, setArtworks] = useState([]);
  
  useEffect(() => {
    if (!router.isReady) return;
    
    // Erstelle Filter-Objekt aus URL-Parametern
    const filters = {
      field: field || null,
      body: body || null,
      year: year || null,
      extra: extra || null
    };
    
    // Erstelle GROQ-Abfrage
    const query = buildFilterQuery(filters);
    
    // Führe Abfrage aus
    client.fetch(query).then(result => {
      setArtworks(result);
    });
  }, [router.isReady, field, body, year, extra]);
  
  // Filter-Handler
  const handleFilterChange = (type, value) => {
    // Update URL und Parameter
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        [type]: value
      }
    }, undefined, { shallow: true });
  };
  
  // Filter löschen
  const clearFilter = (type) => {
    const newQuery = { ...router.query };
    delete newQuery[type];
    
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
  };
  
  // Render Filter-Interface und Ergebnisse
  return (
    <div>
      {/* Filter-Interface */}
      {/* Artwork-Grid */}
    </div>
  );
}
```

## Unterstützung für `categoryType` als Referenz oder String

Das Filtersystem unterstützt sowohl `categoryType` als String-Feld als auch als Referenz-Feld im Schema. Die GROQ-Abfragen sind entsprechend angepasst:

### Mit `categoryType` als Referenz-Feld:

```groq
// Alle Kategorien vom Typ "field-of-art"
*[_type == "category" && categoryType->slug.current == "field-of-art"]

// Alle Kunstwerke aus der Kategorie "drawing"
*[_type == "artwork" && fieldOfArt->slug.current == "drawing"]
```

### Mit `categoryType` als String-Feld:

```groq
// Alle Kategorien vom Typ "field-of-art"
*[_type == "category" && categoryType == "field-of-art"]

// Alle Kunstwerke aus der Kategorie "drawing"
*[_type == "artwork" && fieldOfArt->slug.current == "drawing"]
```

## Hybrid Hierarchische Navigation

Die Kunstwerke können auch über eine hierarchische Navigation durchsucht werden, die sowohl eine Kategorietyp-Struktur als auch eine Eltern-Kind-Beziehung unterstützt.

### Navigationsstruktur

Die Navigation ist in vier Ebenen organisiert:

1. **Erste Ebene**: Kategorietypen (Kunstbereich, Werkreihe, Jahr, Spezial)
2. **Zweite Ebene**: Kategorien innerhalb jedes Typs
3. **Dritte Ebene**: Vorschau der gefilterten Kunstwerke
4. **Vierte Ebene**: Detailansicht einzelner Kunstwerke

### Schema-Design für Hierarchische Navigation

Um diese hierarchische Navigation zu unterstützen, wurde das Schema so erweitert:

```typescript
// category.ts
{
  name: 'category',
  title: 'Kategorie',
  type: 'document',
  fields: [
    // ...
    {
      name: 'categoryType',
      title: 'Kategorie-Typ',
      type: 'reference',
      to: [{ type: 'categoryType' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'parent',
      title: 'Übergeordnete Kategorie',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Optional: Übergeordnete Kategorie für hierarchische Navigation'
    }
    // ...
  ]
}
```

### GROQ-Abfragen für Hierarchische Navigation

#### Alle Top-Level-Kategorien eines Typs abrufen:

```groq
// Alle Hauptkategorien vom Typ "field-of-art" ohne Eltern
*[
  _type == "category" && 
  categoryType->slug.current == "field-of-art" && 
  !defined(parent)
] | order(sortOrder asc) {
  _id,
  title,
  "slug": slug.current,
  "children": *[_type == "category" && parent._ref == ^._id] | order(sortOrder asc) {
    _id,
    title,
    "slug": slug.current
  }
}
```

#### Kategoriepfad (Breadcrumbs) für eine Kategorie abrufen:

```groq
// Vollständigen Pfad für eine Kategorie abrufen
*[_type == "category" && slug.current == "drawing"][0] {
  _id,
  title,
  "slug": slug.current,
  "path": [
    ...*[_type == "category" && references(^.parent._ref)]->{
      _id, title, "slug": slug.current
    },
    {
      _id, title, "slug": slug.current
    }
  ]
}
```

#### Kunstwerke basierend auf Kategoriepfad filtern:

```groq
// Kunstwerke mit der Kategorie "drawing" und deren Unterkategorien
*[
  _type == "artwork" && 
  (
    fieldOfArt->slug.current == "drawing" ||
    fieldOfArt->parent->slug.current == "drawing"
  )
] {
  _id,
  title,
  "slug": slug.current,
  "image": mainImage
}
```

### Frontend-Implementierung

Die hierarchische Navigation kann im Frontend wie folgt implementiert werden:

```javascript
// Fetch category structure for navigation
async function fetchCategoryNavigation() {
  // Get all category types
  const categoryTypes = await client.fetch(`
    *[_type == "categoryType"] | order(sortOrder asc) {
      _id,
      title,
      "slug": slug.current,
      "categories": *[
        _type == "category" && 
        references(^._id) && 
        !defined(parent)
      ] | order(sortOrder asc) {
        _id,
        title,
        "slug": slug.current,
        "hasChildren": count(*[_type == "category" && parent._ref == ^._id]) > 0
      }
    }
  `);
  
  return categoryTypes;
}

// Fetch children for a specific category
async function fetchCategoryChildren(categoryId) {
  return client.fetch(`
    *[_type == "category" && parent._ref == $categoryId] | order(sortOrder asc) {
      _id,
      title,
      "slug": slug.current,
      "hasChildren": count(*[_type == "category" && parent._ref == ^._id]) > 0
    }
  `, { categoryId });
}
```

## Kombinierter Ansatz für URLs und Navigation

Die URL-basierte Filterung und die hierarchische Navigation können kombiniert werden:

- **URL-Parameter** bleiben für direkte Filter und Sharing bestehen
- **Navigations-URLs** können hierarchische Pfade verwenden

Beispiel für hierarchische Navigations-URLs:

```
/works/field-of-art/drawing
/works/body-of-work/heroes/early-works
/works/year/2020
```

## Weitere Beispiele und Dokumentation

Für detailliertere GROQ-Abfragen und Beispiele siehe die Datei `examples/groq-examples.js`, die verschiedene Filterkombinationen und Sortierungen zeigt.

Die vollständige Implementierung der Filter-Komponenten finden Sie in den entsprechenden Komponenten-Dateien:

- `components/ArtworkFilters.jsx`
- `components/EnhancedFilterBar.jsx`
- `components/HierarchicalNavigation.jsx`
- `pages/works.jsx`
