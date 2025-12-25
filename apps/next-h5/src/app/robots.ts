import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/staff/'],
    },
    sitemap: 'https://halle5.at/sitemap.xml',
  };
}
