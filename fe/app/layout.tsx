import '@/styles/globals.css'

import { BASE_METADATA, generateOrganizationSchema, generateSoftwareApplicationSchema } from '@/lib/constants/seo'
import type { Metadata, Viewport } from 'next'

import { JsonLd } from '@/components/shared/JsonLd'
import { Providers } from '@/app/providers'
import Script from 'next/script'

export const metadata: Metadata = {
  ...BASE_METADATA,
  verification: {
    google: 'google-site-verification-code',
  },
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
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
        <Script
          src="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Playfair+Display:wght@400..900&display=swap"
          strategy="afterInteractive"
        />
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
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
