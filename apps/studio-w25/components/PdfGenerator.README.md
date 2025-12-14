# PDF Generator Component

Production-ready component for generating high-quality A4 PDFs of artwork details on w25.vercel.app.

## Installation

```bash
npm install jspdf html2canvas
```

## Basic Usage

```jsx
import PdfGenerator from '@/components/PdfGenerator';

export default function ArtworkPage({ artwork }) {
  return (
    <div>
      {/* Your artwork display */}
      <h1>{artwork.title}</h1>
      <img src={artwork.imageUrl} alt={artwork.title} />
      
      {/* PDF Download Button */}
      <PdfGenerator
        imageUrl={artwork.imageUrl}
        title={artwork.title}
        artist={artwork.artist?.name}
        year={artwork.year}
        technique={artwork.technique}
        size={artwork.size}
        description={artwork.description}
        contact="info@w25.art"
        disclaimer="© 2025 W25 Gallery. All rights reserved."
      />
    </div>
  );
}
```

## Usage with Sanity CMS Data

### Example GROQ Query
```groq
*[_type == 'artwork' && slug.current == $slug][0] {
  _id,
  title,
  "imageUrl": mainImage.asset->url,
  "artist": artist->name,
  year,
  technique,
  size,
  "description": pt::text(content),
  availability
}
```

### Next.js Integration
```jsx
import { client } from '@/lib/sanity';
import PdfGenerator from '@/components/PdfGenerator';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source).width(1200).quality(90).url();
}

export default function ArtworkDetailPage({ artwork }) {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Artwork Display */}
        <img 
          src={urlFor(artwork.mainImage)} 
          alt={artwork.title}
          className="w-full mb-8"
        />
        
        <h1 className="text-4xl font-bold mb-4">{artwork.title}</h1>
        <p className="text-xl mb-2">{artwork.artist}</p>
        <p className="text-gray-600 mb-8">
          {artwork.year} • {artwork.technique} • {artwork.size}
        </p>
        
        {/* PDF Download */}
        <PdfGenerator
          imageUrl={urlFor(artwork.mainImage)}
          title={artwork.title}
          artist={artwork.artist}
          year={artwork.year?.toString()}
          technique={artwork.technique}
          size={artwork.size}
          description={artwork.description}
          contact="gallery@w25.art | +43 123 456 789"
          disclaimer="This artwork information is provided for reference only. Availability and pricing subject to change. © 2025 W25 Gallery."
          buttonClassName="px-8 py-4 bg-black text-white hover:bg-gray-800 transition"
        />
      </div>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const artwork = await client.fetch(
    `*[_type == 'artwork' && slug.current == $slug][0] {
      title,
      mainImage,
      "artist": artist->name,
      year,
      technique,
      size,
      "description": pt::text(content)
    }`,
    { slug: params.slug }
  );

  return { props: { artwork } };
}
```

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `imageUrl` | string | Yes | - | Full URL to artwork image (use Sanity CDN URL) |
| `title` | string | No | 'Untitled' | Artwork title |
| `artist` | string | No | '' | Artist name |
| `year` | string | No | '' | Year of creation |
| `technique` | string | No | '' | Technique/medium |
| `size` | string | No | '' | Dimensions |
| `description` | string | No | '' | Artwork description |
| `contact` | string | No | 'contact@w25.art' | Contact information |
| `disclaimer` | string | No | - | Legal disclaimer text |
| `buttonClassName` | string | No | - | Custom Tailwind classes for button |

## Technical Details

### A4 Dimensions
- **Physical:** 210mm × 297mm
- **Digital (96 DPI):** 794px × 1123px
- **Template padding:** 40px all sides

### Image Quality
- Canvas scale: 2× for high-resolution output
- JPEG quality: 95%
- CORS enabled for Sanity CDN images

### Error Handling
- Image loading timeout: 15 seconds
- Automatic fallback if image fails to load
- User-friendly error messages displayed below button
- Template cleanup on error

## Troubleshooting

### CORS Issues with Sanity Images
Ensure your Sanity project allows CORS from your domain. Add to `sanity.json`:
```json
{
  "api": {
    "cors": {
      "allowOrigins": ["https://w25.vercel.app", "http://localhost:3000"]
    }
  }
}
```

### Images Not Loading
1. Verify the image URL is accessible
2. Check browser console for CORS errors
3. Ensure `crossOrigin="anonymous"` attribute is present
4. Try using `useCORS: true` and `allowTaint: true` in html2canvas options

### PDF Quality Issues
- Increase `scale` parameter in html2canvas (2-3 recommended)
- Use high-resolution source images (min 1200px width)
- Adjust JPEG quality parameter (0.85-0.95)

### Layout Breaking
- Test with various content lengths
- Add overflow handling for long descriptions
- Consider pagination for multi-page content

## Customization Examples

### Custom Button Styles
```jsx
<PdfGenerator
  {...artworkProps}
  buttonClassName="group relative px-6 py-3 overflow-hidden rounded-lg bg-gradient-to-r from-black to-gray-800 text-white transition-all hover:scale-105"
/>
```

### Multi-Language Support
```jsx
const t = useTranslation();

<PdfGenerator
  {...artworkProps}
  contact={t('contact.email')}
  disclaimer={t('legal.disclaimer')}
/>
```

### Analytics Tracking
```jsx
const handleDownload = () => {
  // Track download event
  analytics.track('pdf_download', {
    artwork_id: artwork._id,
    artwork_title: artwork.title
  });
};

// Wrap the component or modify onClick handler
```

## Performance Considerations

- PDF generation is CPU-intensive; disable button during generation
- Consider server-side generation for large catalogs
- Cache generated PDFs if artwork data doesn't change frequently
- Lazy-load the component if not immediately visible

## License

MIT
