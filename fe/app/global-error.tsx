'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="font-sans">
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
          <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-red-600 dark:text-red-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Something went wrong</h2>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              A critical error occurred. Please try again or contact support if the problem persists.
            </p>
            <details className="mb-6">
              <summary className="cursor-pointer text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
                View error details
              </summary>
              <div className="mt-3 space-y-2">
                <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/10">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {error.name}: {error.message}
                  </p>
                </div>
                {error.digest && <p className="text-xs text-zinc-500 dark:text-zinc-400">Error ID: {error.digest}</p>}
              </div>
            </details>
            <div className="flex gap-2">
              <Button onClick={() => reset()}>Try again</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
