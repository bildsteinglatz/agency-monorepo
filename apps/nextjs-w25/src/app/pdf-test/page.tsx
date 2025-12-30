import { client } from '@/sanity/client';
import PdfGenerator from '@/components/PdfGenerator';

const INLINE_PLACEHOLDER_IMAGE =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGxAH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAo//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AR//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Ah//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IR//2gAMAwEAAgADAAAAEA//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8QP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8QP//Z';

async function getFirstArtwork() {
  try {
    const artwork = await client.fetch(`
      *[_type == "artwork" && showOnWebsite == true && defined(mainImage)][0] {
        _id,
        title,
        year,
        technique,
        size,
        "imageUrl": mainImage.asset->url,
        artist-> {
          name
        }
      }
    `);
    return artwork;
  } catch (error) {
    console.error('Failed to fetch artwork:', error);
    return null;
  }
}

export default async function PdfTest() {
  const artwork = await getFirstArtwork();
  
  const mockArtwork = artwork ? {
    imageUrl: artwork.imageUrl || INLINE_PLACEHOLDER_IMAGE,
    title: artwork.title || 'Untitled',
    artist: artwork.artist?.name || 'Bildstein | Glatz',
    year: artwork.year?.toString() || '',
    technique: artwork.technique || '',
    size: artwork.size || '',
    description: `${artwork.title || 'Artwork'} by ${artwork.artist?.name || 'Bildstein | Glatz'}`,
  } : {
    imageUrl: INLINE_PLACEHOLDER_IMAGE,
    title: 'No artwork found',
    artist: 'Bildstein | Glatz',
    year: '2025',
    technique: '',
    size: '',
    description: 'Please add artworks to Sanity CMS',
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PDF Generator Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Mock Artwork Data</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-semibold">Artist:</dt>
              <dd>{mockArtwork.artist} &lt; </dd>
            </div>
            <div>
              <dt className="font-semibold">Title:</dt>
              <dd>{mockArtwork.title}, {mockArtwork.year}</dd>
            </div>
            <div>
              <dt className="font-semibold">Technique:</dt>
              <dd>{mockArtwork.technique}</dd>
            </div>
            <div>
              <dt className="font-semibold">Size:</dt>
              <dd>{mockArtwork.size}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Generate PDF</h2>
          <PdfGenerator {...mockArtwork} />
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">Testing Checklist:</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✓ Click button and verify PDF downloads</li>
            <li>✓ Check PDF filename matches artwork title</li>
            <li>✓ Verify A4 dimensions (210mm × 297mm)</li>
            <li>✓ Confirm image quality is high-resolution</li>
            <li>✓ Check all text fields are visible and properly formatted</li>
            <li>✓ Verify footer with contact and disclaimer appears</li>
            <li>✓ Test with different image URLs (portrait/landscape)</li>
            <li>✓ Test error handling with invalid image URL</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
