import type { Metadata } from 'next'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.terms.title,
  description: PAGE_METADATA.terms.description,
  keywords: PAGE_METADATA.terms.keywords,
  openGraph: {
    title: `${PAGE_METADATA.terms.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.terms.description,
    url: `${SITE_CONFIG.url}/terms`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.terms.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.terms.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/terms`,
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
