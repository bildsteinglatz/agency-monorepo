/**
 * Example artwork page component demonstrating PdfGenerator integration
 * This shows how to fetch data from Sanity and pass it to the PDF generator
 */

import { client } from '@/lib/sanity';
import imageUrlBuilder from '@sanity/image-url';
import PdfGenerator from '@/components/PdfGenerator';

// Initialize image URL builder
const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source).width(1200).quality(90).url();
}

export default function ArtworkExample({ artwork }) {
  if (!artwork) {
    return <div>Artwork not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Artwork Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Left: Image */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {artwork.mainImage ? (
                <img
                  src={urlFor(artwork.mainImage)}
                  alt={artwork.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400">No image available</div>
              )}
            </div>

            {/* Right: Details */}
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {artwork.title}
              </h1>

              {artwork.artist && (
                <p className="text-2xl text-gray-700 mb-6">
                  {artwork.artist}
                </p>
              )}

              <div className="space-y-2 text-lg text-gray-600 mb-8">
                {artwork.year && (
                  <p>
                    <span className="font-semibold">Year:</span> {artwork.year}
                  </p>
                )}
                {artwork.technique && (
                  <p>
                    <span className="font-semibold">Technique:</span>{' '}
                    {artwork.technique}
                  </p>
                )}
                {artwork.size && (
                  <p>
                    <span className="font-semibold">Size:</span> {artwork.size}
                  </p>
                )}
                {artwork.availability && (
                  <p>
                    <span className="font-semibold">Availability:</span>{' '}
                    <span
                      className={
                        artwork.availability === 'available'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {artwork.availability.toUpperCase()}
                    </span>
                  </p>
                )}
              </div>

              {artwork.description && (
                <div className="prose prose-lg mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* PDF Download Button */}
              <div className="mt-auto pt-8 border-t">
                <PdfGenerator
                  imageUrl={urlFor(artwork.mainImage)}
                  title={artwork.title}
                  artist={artwork.artist}
                  year={artwork.year?.toString()}
                  technique={artwork.technique}
                  size={artwork.size}
                  description={artwork.description}
                  contact="W25 Gallery | gallery@w25.art | +43 123 456 789"
                  disclaimer="This artwork information is provided for reference purposes only. Prices and availability are subject to change without notice. All images and content © 2025 W25 Gallery. All rights reserved."
                  buttonClassName="w-full sm:w-auto px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Optional: Exhibition History */}
          {artwork.exhibitionHistory && artwork.exhibitionHistory.length > 0 && (
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold mb-6">Exhibition History</h2>
              <ul className="space-y-3">
                {artwork.exhibitionHistory.map((exhibition, idx) => (
                  <li key={idx} className="text-gray-700">
                    {exhibition.title} ({exhibition.year})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Fetch artwork data from Sanity
export async function getStaticProps({ params }) {
  const query = `*[_type == 'artwork' && slug.current == $slug][0] {
    _id,
    title,
    mainImage,
    "artist": artist->name,
    year,
    technique,
    size,
    availability,
    "description": pt::text(content),
    "exhibitionHistory": exhibitionHistory[]-> {
      title,
      year
    }
  }`;

  const artwork = await client.fetch(query, { slug: params.slug });

  if (!artwork) {
    return { notFound: true };
  }

  return {
    props: { artwork },
    revalidate: 60, // Revalidate every minute
  };
}

// Generate static paths for all artworks
export async function getStaticPaths() {
  const paths = await client.fetch(
    `*[_type == 'artwork' && defined(slug.current)][].slug.current`
  );

  return {
    paths: paths.map((slug) => ({ params: { slug } })),
    fallback: 'blocking',
  };
}
