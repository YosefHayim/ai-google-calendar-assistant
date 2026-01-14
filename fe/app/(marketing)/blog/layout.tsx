import type { Metadata } from 'next'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.blog.title,
  description: PAGE_METADATA.blog.description,
  keywords: PAGE_METADATA.blog.keywords,
  openGraph: {
    title: `${PAGE_METADATA.blog.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.blog.description,
    url: `${SITE_CONFIG.url}/blog`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.blog.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.blog.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/blog`,
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
