import type { Metadata } from 'next'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.waitinglist.title,
  description: PAGE_METADATA.waitinglist.description,
  keywords: PAGE_METADATA.waitinglist.keywords,
  openGraph: {
    title: `${PAGE_METADATA.waitinglist.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.waitinglist.description,
    url: `${SITE_CONFIG.url}/waitinglist`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.waitinglist.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.waitinglist.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/waitinglist`,
  },
}

export default function WaitinglistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
