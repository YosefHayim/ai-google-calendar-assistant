import type { Metadata } from 'next'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.changelog.title,
  description: PAGE_METADATA.changelog.description,
  keywords: PAGE_METADATA.changelog.keywords,
  openGraph: {
    title: `${PAGE_METADATA.changelog.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.changelog.description,
    url: `${SITE_CONFIG.url}/changelog`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.changelog.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.changelog.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/changelog`,
  },
}

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
