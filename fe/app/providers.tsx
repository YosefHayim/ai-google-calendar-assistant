'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { CommandPalette } from '@/components/shared/CommandPalette'
import dynamic from 'next/dynamic'
import { ENV } from '@/lib/constants'
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext'
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner'
import { ImpersonationProvider } from '@/contexts/ImpersonationContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SocketProvider } from '@/contexts/SocketContext'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { createQueryClient } from '@/lib/query'
import { useState } from 'react'

const PostHogProvider = dynamic(() => import('@/contexts/PostHogContext').then(mod => ({ default: mod.PostHogProvider })), {
  loading: () => null,
  ssr: false,
})

const PostHogPageview = dynamic(() => import('@/components/shared/PostHogPageview'), {
  loading: () => null,
  ssr: false,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

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
                'bg-background dark:bg-secondary border dark:border text-foreground dark:text-primary-foreground w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[356px] sm:max-w-[420px] mx-auto',
              duration: 4000,
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
