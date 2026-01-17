import '@/styles/globals.css'

import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Providers } from '@/app/providers'
import { JsonLd } from '@/components/shared/JsonLd'
import { BASE_METADATA, generateOrganizationSchema, generateSoftwareApplicationSchema } from '@/lib/constants/seo'

export const metadata: Metadata = {
  ...BASE_METADATA,
  verification: {
    google: 'google-site-verification-code',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Playfair+Display:wght@400..900&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={[generateOrganizationSchema(), generateSoftwareApplicationSchema()]} />
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-47MKM3CTD8" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-47MKM3CTD8');
          `}
        </Script>
        {/* Lemon Squeezy Affiliate Tracking */}
        <Script id="lemonsqueezy-affiliate-config" strategy="beforeInteractive">
          {`window.lemonSqueezyAffiliateConfig = { store: "ally-ai-google-calendar-assitant" };`}
        </Script>
        <Script src="https://lmsqueezy.com/affiliate.js" strategy="afterInteractive" />
      </head>
      <body className="bg-background font-sans text-foreground" suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
