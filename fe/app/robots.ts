import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/constants/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/callback/', '/auth/', '/loading/', '/shared/'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/callback/', '/auth/', '/loading/', '/shared/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/callback/', '/auth/', '/loading/', '/shared/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/callback/', '/auth/', '/loading/', '/shared/'],
      },
      {
        userAgent: 'Anthropic-AI',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/callback/', '/auth/', '/loading/', '/shared/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/callback/', '/auth/', '/loading/', '/shared/'],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  }
}
