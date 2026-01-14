import type { Metadata } from 'next'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.privacy.title,
  description: PAGE_METADATA.privacy.description,
  keywords: PAGE_METADATA.privacy.keywords,
  openGraph: {
    title: `${PAGE_METADATA.privacy.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.privacy.description,
    url: `${SITE_CONFIG.url}/privacy`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.privacy.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.privacy.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy`,
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
