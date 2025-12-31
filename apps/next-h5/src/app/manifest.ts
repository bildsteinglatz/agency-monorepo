import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Halle 5 | Ateliers & Werkstätten',
    short_name: 'Halle 5',
    description: 'Offene Ateliers, Werkstätten und Kunstproduktion in Dornbirn.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#fdc800',
    icons: [
      {
        src: '/Halle-5.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Halle-5.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/Halle-5.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
