import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/constants/seo'
import { BLOG_POSTS } from '@/lib/data/blog-posts'

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

interface SitemapPage {
  route: string
  changeFrequency: ChangeFrequency
  priority: number
  lastModified?: Date | string
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url
  const currentDate = new Date()

  const staticPages: SitemapPage[] = [
    { route: '', changeFrequency: 'weekly', priority: 1.0 },
    { route: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { route: '/register', changeFrequency: 'monthly', priority: 0.9 },
    { route: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { route: '/blog', changeFrequency: 'daily', priority: 0.8 },
    { route: '/help', changeFrequency: 'weekly', priority: 0.7 },
    { route: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/changelog', changeFrequency: 'weekly', priority: 0.7 },
    { route: '/careers', changeFrequency: 'weekly', priority: 0.6 },
    { route: '/integrations/slack', changeFrequency: 'monthly', priority: 0.6 },
    { route: '/login', changeFrequency: 'monthly', priority: 0.5 },
    { route: '/waitinglist', changeFrequency: 'monthly', priority: 0.5 },
    { route: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { route: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ]

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: post.featured ? 0.8 : 0.6,
  }))

  const staticSitemap: MetadataRoute.Sitemap = staticPages.map(
    ({ route, changeFrequency, priority, lastModified }) => ({
      url: `${baseUrl}${route}`,
      lastModified: lastModified || currentDate,
      changeFrequency,
      priority,
    }),
  )

  return [...staticSitemap, ...blogPages]
}
