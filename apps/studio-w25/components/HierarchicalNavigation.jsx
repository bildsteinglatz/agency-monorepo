import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { client } from '../utils/sanityClient';

/**
 * Hierarchical Navigation Component for Artwork Categories
 * 
 * Displays a four-level navigation structure:
 * 1. Category Types (Field of Art, Body of Work, God Mode)
 * 2. Categories within the selected type
 * 3. Artwork preview for selected category
 * 4. Links to artwork detail pages
 */
const HierarchicalNavigation = () => {
  const router = useRouter();
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // Fetch category types on initial load
  useEffect(() => {
    const fetchCategoryTypes = async () => {
      try {
        const result = await client.fetch(`
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
              "count": count(*[_type == "artwork" && references(^._id)])
            }
          }
        `);
        
        setCategoryTypes(result);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching category types:', error);
        setIsLoading(false);
      }
    };
    
    fetchCategoryTypes();
  }, []);
  
  // Handle category type selection
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedCategory(null);
    setChildCategories([]);
    setBreadcrumbs([{ title: type.title, slug: type.slug }]);
    
    // Update URL to reflect selection
    router.push(`/works/${type.slug}`, undefined, { shallow: true });
  };
  
  // Handle category selection
  const handleCategorySelect = async (category, isChild = false) => {
    setSelectedCategory(category);
    
    // Update breadcrumbs
    if (isChild) {
      setBreadcrumbs([...breadcrumbs, { title: category.title, slug: category.slug }]);
    } else {
      setBreadcrumbs([
        { title: selectedType.title, slug: selectedType.slug },
        { title: category.title, slug: category.slug }
      ]);
    }
    
    // Fetch child categories if any
    if (category.hasChildren) {
      try {
        const children = await client.fetch(`
          *[_type == "category" && parent._ref == $categoryId] | order(sortOrder asc) {
            _id,
            title,
            "slug": slug.current,
            "hasChildren": count(*[_type == "category" && parent._ref == ^._id]) > 0,
            "count": count(*[_type == "artwork" && references(^._id)])
          }
        `, { categoryId: category._id });
        
        setChildCategories(children);
      } catch (error) {
        console.error('Error fetching child categories:', error);
      }
    } else {
      setChildCategories([]);
    }
    
    // Update URL to reflect selection
    const urlPath = isChild 
      ? `/works/${selectedType.slug}/${breadcrumbs[1].slug}/${category.slug}`
      : `/works/${selectedType.slug}/${category.slug}`;
    
    router.push(urlPath, undefined, { shallow: true });
  };
  
  // Navigate using breadcrumbs
  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      // First level - category type
      const type = categoryTypes.find(t => t.slug === breadcrumbs[0].slug);
      handleTypeSelect(type);
    } else if (index === 1 && breadcrumbs.length > 1) {
      // Second level - parent category
      const parentCategory = selectedType.categories.find(
        c => c.slug === breadcrumbs[1].slug
      );
      handleCategorySelect(parentCategory);
    }
    // Truncate breadcrumbs at the clicked index
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };
  
  return (
    <div className="hierarchical-navigation">
      {isLoading ? (
        <div className="loading">Loading navigation...</div>
      ) : (
        <>
          {/* Breadcrumb navigation */}
          {breadcrumbs.length > 0 && (
            <div className="breadcrumbs">
              <a href="/works">Home</a>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.slug}>
                  <span className="separator">/</span>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleBreadcrumbClick(index);
                    }}
                  >
                    {crumb.title}
                  </a>
                </React.Fragment>
              ))}
            </div>
          )}
          
          {/* First level: Category Types */}
          {!selectedType && (
            <div className="category-types">
              <h2>Browse by Category</h2>
              <div className="type-grid">
                {categoryTypes.map(type => (
                  <div 
                    key={type._id} 
                    className="type-card"
                    onClick={() => handleTypeSelect(type)}
                  >
                    <h3>{type.title}</h3>
                    <div className="category-count">
                      {type.categories.length} {type.categories.length === 1 ? 'category' : 'categories'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Second level: Categories within selected type */}
          {selectedType && !selectedCategory && (
            <div className="categories">
              <h2>{selectedType.title}</h2>
              <div className="category-grid">
                {selectedType.categories.map(category => (
                  <div 
                    key={category._id} 
                    className="category-card"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <h3>{category.title}</h3>
                    {category.hasChildren && (
                      <div className="subcategory-indicator">
                        Has subcategories
                      </div>
                    )}
                    <div className="artwork-count">
                      {category.count} {category.count === 1 ? 'artwork' : 'artworks'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Child categories if present */}
          {selectedCategory && childCategories.length > 0 && (
            <div className="child-categories">
              <h3>Browse {selectedCategory.title}</h3>
              <div className="category-grid">
                {childCategories.map(child => (
                  <div 
                    key={child._id} 
                    className="category-card"
                    onClick={() => handleCategorySelect(child, true)}
                  >
                    <h4>{child.title}</h4>
                    <div className="artwork-count">
                      {child.count} {child.count === 1 ? 'artwork' : 'artworks'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* You would add artwork display here - third level */}
          {selectedCategory && (
            <ArtworkPreview 
              categoryId={selectedCategory._id} 
              categoryType={selectedType.slug}
            />
          )}
        </>
      )}
      
      <style jsx>{`
        .hierarchical-navigation {
          margin: 2rem 0;
        }
        
        .loading {
          padding: 2rem;
          text-align: center;
          background: #f9f9f9;
          border-radius: 0.5rem;
        }
        
        .breadcrumbs {
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 0.5rem;
        }
        
        .breadcrumbs a {
          color: #333;
          text-decoration: none;
        }
        
        .breadcrumbs a:hover {
          text-decoration: underline;
        }
        
        .separator {
          margin: 0 0.5rem;
          color: #999;
        }
        
        .type-grid,
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        
        .type-card,
        .category-card {
          padding: 1.5rem;
          background: #f9f9f9;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .type-card:hover,
        .category-card:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        h2 {
          margin: 0 0 1rem;
          font-size: 1.75rem;
        }
        
        h3 {
          margin: 0 0 0.75rem;
          font-size: 1.25rem;
        }
        
        h4 {
          margin: 0 0 0.5rem;
          font-size: 1.1rem;
        }
        
        .category-count,
        .artwork-count {
          color: #666;
          font-size: 0.9rem;
        }
        
        .subcategory-indicator {
          font-size: 0.8rem;
          color: #0070f3;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

// Artwork Preview Component for the third navigation level
const ArtworkPreview = ({ categoryId, categoryType }) => {
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        // Determine which field to query based on category type
        let queryField = '';
        switch (categoryType) {
          case 'field-of-art':
            queryField = 'fieldOfArt';
            break;
          case 'body-of-work':
            queryField = 'bodyOfWork';
            break;
          default:
            queryField = 'extraCategories[]';
        }
        
        // Query for artworks that reference this category
        const query = categoryType === 'god-mode'
          ? `*[_type == "artwork" && $categoryId in extraCategories[]._ref]`
          : `*[_type == "artwork" && ${queryField}._ref == $categoryId]`;
        
        const result = await client.fetch(`
          ${query} | order(title asc) [0...12] {
            _id,
            title,
            "slug": slug.current,
            "image": mainImage,
            "artist": artist->name
          }
        `, { categoryId });
        
        setArtworks(result);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setIsLoading(false);
      }
    };
    
    if (categoryId) {
      fetchArtworks();
    }
  }, [categoryId, categoryType]);
  
  if (isLoading) {
    return <div className="loading">Loading artworks...</div>;
  }
  
  return (
    <div className="artwork-preview">
      <h3>Artworks {artworks.length > 0 ? `(${artworks.length})` : ''}</h3>
      
      {artworks.length > 0 ? (
        <div className="artwork-grid">
          {artworks.map(artwork => (
            <a 
              key={artwork._id}
              href={`/works/artwork/${artwork.slug}`}
              className="artwork-card"
            >
              {artwork.image && (
                <div className="artwork-image">
                  <img 
                    src={artwork.image.url} 
                    alt={artwork.title} 
                  />
                </div>
              )}
              <div className="artwork-details">
                <h4>{artwork.title}</h4>
                {artwork.artist && <p>{artwork.artist}</p>}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="no-artworks">
          No artworks found in this category
        </div>
      )}
      
      <style jsx>{`
        .artwork-preview {
          margin-top: 2rem;
        }
        
        .artwork-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .artwork-card {
          text-decoration: none;
          color: inherit;
          display: block;
          border-radius: 0.5rem;
          overflow: hidden;
          transition: transform 0.2s ease;
        }
        
        .artwork-card:hover {
          transform: translateY(-2px);
        }
        
        .artwork-image {
          aspect-ratio: 1 / 1;
          background: #f0f0f0;
          overflow: hidden;
        }
        
        .artwork-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .artwork-details {
          padding: 0.75rem;
        }
        
        .artwork-details h4 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
        }
        
        .artwork-details p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }
        
        .no-artworks {
          padding: 2rem;
          text-align: center;
          background: #f9f9f9;
          border-radius: 0.5rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default HierarchicalNavigation;
