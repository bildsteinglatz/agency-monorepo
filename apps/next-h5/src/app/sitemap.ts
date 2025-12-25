import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://halle5.at';
  
  const routes = [
    '',
    '/about',
    '/artists',
    '/atelier-aaa',
    '/events',
    '/member',
    '/workshops',
    '/visit',
    '/pinguin',
    '/konzept',
    '/partners',
    '/imprint',
    '/register',
    '/virtual-painting',
    '/pong',
    '/pottery',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
