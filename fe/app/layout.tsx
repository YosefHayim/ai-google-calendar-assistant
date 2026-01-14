import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Providers } from '@/app/providers'

export const metadata: Metadata = {
  title: 'Ask Ally | The AI Secretary for your Google Calendar',
  description:
    'Your intelligent calendar assistant powered by AI. Manage your Google Calendar with natural language commands.',
  metadataBase: new URL('https://askally.io'),
  openGraph: {
    title: 'Ask Ally | The AI Secretary for your Google Calendar',
    description:
      'Your intelligent calendar assistant powered by AI. Manage your Google Calendar with natural language commands.',
    url: 'https://askally.io',
    siteName: 'Ask Ally',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask Ally | The AI Secretary for your Google Calendar',
    description: 'Your intelligent calendar assistant powered by AI.',
  },
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
      </head>
      <body className="font-sans bg-background text-foreground" suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
