import type { Metadata } from 'next'
import RegisterPage from '@/components/auth/RegisterPage'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.register.title,
  description: PAGE_METADATA.register.description,
  keywords: PAGE_METADATA.register.keywords,
  openGraph: {
    title: `${PAGE_METADATA.register.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.register.description,
    url: `${SITE_CONFIG.url}/register`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.register.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.register.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/register`,
  },
}

export default function Register() {
  return <RegisterPage />
}
