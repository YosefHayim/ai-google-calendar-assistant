import type { Metadata } from 'next'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.compare.title,
  description: PAGE_METADATA.compare.description,
  keywords: PAGE_METADATA.compare.keywords,
  openGraph: {
    title: `${PAGE_METADATA.compare.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.compare.description,
    url: `${SITE_CONFIG.url}/compare`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.compare.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.compare.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/compare`,
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
