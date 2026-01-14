import type { Metadata } from 'next'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.pricing.title,
  description: PAGE_METADATA.pricing.description,
  keywords: PAGE_METADATA.pricing.keywords,
  openGraph: {
    title: `${PAGE_METADATA.pricing.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.pricing.description,
    url: `${SITE_CONFIG.url}/pricing`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.pricing.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.pricing.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/pricing`,
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
