import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/constants/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url

  const pages: Array<{
    route: string
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority: number
  }> = [
    { route: '', changeFrequency: 'weekly', priority: 1.0 },
    { route: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { route: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { route: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/help', changeFrequency: 'weekly', priority: 0.7 },
    { route: '/blog', changeFrequency: 'weekly', priority: 0.7 },
    { route: '/changelog', changeFrequency: 'weekly', priority: 0.6 },
    { route: '/integrations/slack', changeFrequency: 'monthly', priority: 0.6 },
    { route: '/register', changeFrequency: 'monthly', priority: 0.6 },
    { route: '/login', changeFrequency: 'monthly', priority: 0.5 },
    { route: '/waitinglist', changeFrequency: 'monthly', priority: 0.5 },
    { route: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { route: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ]

  return pages.map(({ route, changeFrequency, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
