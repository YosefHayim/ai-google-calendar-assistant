import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/constants/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url

  const staticPages = [
    '',
    '/pricing',
    '/about',
    '/contact',
    '/help',
    '/blog',
    '/changelog',
    '/privacy',
    '/terms',
    '/waitinglist',
    '/login',
    '/register',
  ]

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : route === '/changelog' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/pricing' ? 0.9 : 0.8,
  }))
}
