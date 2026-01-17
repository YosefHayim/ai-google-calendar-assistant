import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ask Ally - AI Calendar Assistant',
    short_name: 'Ask Ally',
    description:
      'AI-powered calendar assistant that helps you manage your Google Calendar with natural language commands, voice input, and smart scheduling.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#F54A00',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['productivity', 'utilities', 'business'],
    lang: 'en',
    dir: 'ltr',
    prefer_related_applications: false,
  }
}
