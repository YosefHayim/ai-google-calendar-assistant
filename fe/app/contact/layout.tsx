import type { Metadata } from 'next'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.contact.title,
  description: PAGE_METADATA.contact.description,
  keywords: PAGE_METADATA.contact.keywords,
  openGraph: {
    title: `${PAGE_METADATA.contact.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.contact.description,
    url: `${SITE_CONFIG.url}/contact`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.contact.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.contact.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
