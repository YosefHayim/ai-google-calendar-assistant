import type { Metadata } from 'next'
import LoginPage from '@/components/auth/LoginPage'
import { Suspense } from 'react'
import { PAGE_METADATA, SITE_CONFIG } from '@/lib/constants/seo'

export const metadata: Metadata = {
  title: PAGE_METADATA.login.title,
  description: PAGE_METADATA.login.description,
  keywords: PAGE_METADATA.login.keywords,
  openGraph: {
    title: `${PAGE_METADATA.login.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.login.description,
    url: `${SITE_CONFIG.url}/login`,
    type: 'website',
  },
  twitter: {
    title: `${PAGE_METADATA.login.title} | ${SITE_CONFIG.name}`,
    description: PAGE_METADATA.login.description,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/login`,
  },
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark:bg-[#030303]">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPage />
    </Suspense>
  )
}
