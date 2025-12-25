import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Halle 5 | Ateliers & Werkstätten',
    short_name: 'Halle 5',
    description: 'Offene Ateliers, Werkstätten und Kunstproduktion in Dornbirn.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#FF3100',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
