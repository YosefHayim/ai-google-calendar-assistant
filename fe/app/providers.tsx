'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ENV } from '@/lib/constants'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { createQueryClient } from '@/lib/query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="theme"
        disableTransitionOnChange={false}
      >
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            className:
              'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[356px] sm:max-w-[420px] mx-auto',
            duration: 4000,
          }}
          richColors
          closeButton
        />
      </ThemeProvider>
      {ENV.IS_DEVELOPMENT && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
