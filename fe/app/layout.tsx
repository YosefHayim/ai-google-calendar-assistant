import '@/styles/globals.css'

import type { Metadata, Viewport } from 'next'
import { Providers } from '@/app/providers'
import { BASE_METADATA, generateOrganizationSchema, generateSoftwareApplicationSchema } from '@/lib/constants/seo'
import { JsonLd } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  ...BASE_METADATA,
  verification: {
    google: 'google-site-verification-code',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Playfair+Display:wght@400..900&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={[generateOrganizationSchema(), generateSoftwareApplicationSchema()]} />
      </head>
      <body className="font-sans bg-background text-foreground" suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
