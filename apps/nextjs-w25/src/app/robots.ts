import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bildstein-glatz.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/premium-content/', '/user-settings/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
