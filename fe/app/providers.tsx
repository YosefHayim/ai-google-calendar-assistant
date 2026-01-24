'use client'

import { useEffect, useState } from 'react'

import { AuthProvider } from '@/contexts/AuthContext'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { ENV } from '@/lib/constants'
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext'
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner'
import { ImpersonationProvider } from '@/contexts/ImpersonationContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { PostHogProvider } from '@/contexts/PostHogContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SocketProvider } from '@/contexts/SocketContext'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { createQueryClient } from '@/lib/query'
import dynamic from 'next/dynamic'
import { initWebVitals } from '@/lib/web-vitals'

const PostHogPageview = dynamic(
  () => import('@/components/shared/PostHogPageview').then((mod) => mod.PostHogPageview),
  {
    loading: () => null,
    ssr: false,
  },
)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  // Initialize Web Vitals monitoring
  useEffect(() => {
    initWebVitals()
  }, [])

  return (
    <PostHogProvider>
      <PostHogPageview />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="theme"
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <AuthProvider>
              <FeatureFlagProvider>
                <ImpersonationProvider>
                  <ImpersonationBanner />
                  <CommandPalette />
                  <SocketProvider>
                    <NotificationProvider>{children}</NotificationProvider>
                  </SocketProvider>
                </ImpersonationProvider>
              </FeatureFlagProvider>
            </AuthProvider>
          </LanguageProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              className:
                'rounded-xl bg-card text-foreground border shadow-lg w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[356px] sm:max-w-[420px] mx-auto gap-3 p-4',
              duration: 4000,
              classNames: {
                success: 'border-green-300',
                error: 'border-red-300',
                warning: 'border-amber-300',
                info: 'border-blue-300',
                title: 'text-sm font-semibold text-foreground',
                description: 'text-[13px] text-muted-foreground',
              },
            }}
            richColors
            closeButton
          />
        </ThemeProvider>
        {ENV.IS_DEVELOPMENT && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </PostHogProvider>
  )
}
