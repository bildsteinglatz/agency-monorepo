import { MetadataRoute } from 'next';
import { client } from '@/sanity/client';
import groq from 'groq';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://halle5.at';
  
  // Fetch last modified dates for main pages
  const query = groq`{
    "home": *[_type == "halle5Info"][0]._updatedAt,
    "about": *[_type == "aboutPage"][0]._updatedAt,
    "artists": *[_type == "artist"] | order(_updatedAt desc)[0]._updatedAt,
    "atelierAAA": *[_type == "atelierAAA"][0]._updatedAt,
    "events": *[_type == "event"] | order(_updatedAt desc)[0]._updatedAt,
    "member": *[_type == "membership"] | order(_updatedAt desc)[0]._updatedAt,
    "workshops": *[_type == "workshop"] | order(_updatedAt desc)[0]._updatedAt,
    "visit": *[_type == "visitPage"][0]._updatedAt,
    "pinguin": *[_type == "pinguin"][0]._updatedAt,
    "konzept": *[_type == "halle5Konzept"][0]._updatedAt,
    "partners": *[_type == "partnerTexts"][0]._updatedAt,
    "imprint": *[_type == "imprint"][0]._updatedAt,
  }`;

  let lastMods: any = {};
  try {
    lastMods = await client.fetch(query);
  } catch (e) {
    console.error('Sitemap fetch error:', e);
  }

  const routes = [
    { path: '', lastMod: lastMods.home, priority: 1 },
    { path: '/about', lastMod: lastMods.about, priority: 0.8 },
    { path: '/artists', lastMod: lastMods.artists, priority: 0.8 },
    { path: '/atelier-aaa', lastMod: lastMods.atelierAAA, priority: 0.8 },
    { path: '/events', lastMod: lastMods.events, priority: 0.8 },
    { path: '/member', lastMod: lastMods.member, priority: 0.8 },
    { path: '/workshops', lastMod: lastMods.workshops, priority: 0.8 },
    { path: '/visit', lastMod: lastMods.visit, priority: 0.8 },
    { path: '/pinguin', lastMod: lastMods.pinguin, priority: 0.8 },
    { path: '/konzept', lastMod: lastMods.konzept, priority: 0.8 },
    { path: '/partners', lastMod: lastMods.partners, priority: 0.8 },
    { path: '/imprint', lastMod: lastMods.imprint, priority: 0.5 },
    { path: '/visitor-checkin', lastMod: lastMods.home, priority: 0.5 },
    { path: '/virtual-painting', lastMod: lastMods.home, priority: 0.5 },
    { path: '/pong', lastMod: lastMods.home, priority: 0.3 },
    { path: '/pottery', lastMod: lastMods.home, priority: 0.3 },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: route.lastMod ? new Date(route.lastMod) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: route.priority,
  }));

  return routes;
}
