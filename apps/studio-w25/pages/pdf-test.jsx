// Quick Test Component for PDF Generator
// Use this to test the PDF generation without full Sanity integration

import PdfGenerator from '@/components/PdfGenerator';

export default function PdfTest() {
  const mockArtwork = {
    imageUrl: 'https://cdn.sanity.io/images/yh2vvooq/production/your-image-id.jpg',
    title: 'Abstract Composition #7',
    artist: 'Maria Schmidt',
    year: '2024',
    technique: 'Oil on Canvas',
    size: '120 × 100 cm',
    description: 'This vibrant abstract composition explores the intersection of color and form, creating a dynamic visual experience that challenges traditional perspectives.',
    contact: 'W25 Gallery | gallery@w25.art | +43 123 456 789',
    disclaimer: '© 2025 W25 Gallery. All rights reserved. This document is for informational purposes only.',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PDF Generator Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Mock Artwork Data</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dd>{mockArtwork.artist}</dd>
            </div>
            <div>
              <dd>{mockArtwork.title}</dd>
               <dt className="font-semibold">, </dt>
               <dd>{mockArtwork.year}</dd>
            </div>
            <div>
              <dd>{mockArtwork.technique}</dd>
            </div>
            <div>
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
