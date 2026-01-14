import type { Metadata } from 'next'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.help.title,
  description: PAGE_METADATA.help.description,
  keywords: PAGE_METADATA.help.keywords,
  openGraph: {
    title: `${PAGE_METADATA.help.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.help.description,
    url: `${SITE_CONFIG.url}/help`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.help.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.help.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/help`,
  },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
