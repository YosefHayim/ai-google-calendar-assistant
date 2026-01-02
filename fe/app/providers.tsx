'use client'

import { Cursor, CursorProvider } from '@/components/ui/animated-cursor'

import { AuthProvider } from '@/context/AuthContext'
import { ENV } from '@/lib/constants'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { createQueryClient } from '@/lib/query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient once per session using the configured factory
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
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
      {ENV.IS_DEVELOPMENT && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
