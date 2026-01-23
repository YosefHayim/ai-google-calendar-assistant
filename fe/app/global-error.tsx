'use client'

import * as Sentry from '@sentry/nextjs'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="font-sans">
        <div className="flex min-h-screen items-center justify-center bg-muted p-4 dark:bg-secondary">
          <div className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-sm dark:bg-secondary">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 dark:bg-red-900/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-destructive dark:text-red-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-foreground dark:text-primary-foreground">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-muted-foreground dark:text-muted-foreground">
              A critical error occurred. Please try again or contact support if the problem persists.
            </p>
            <details className="mb-6">
              <summary className="cursor-pointer text-sm font-medium text-zinc-700 hover:text-foreground dark:text-zinc-300 dark:hover:text-primary-foreground">
                View error details
              </summary>
              <div className="mt-3 space-y-2">
                <div className="rounded-md bg-destructive/5 p-3 dark:bg-red-900/10">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {error.name}: {error.message}
                  </p>
                </div>
                {error.digest && (
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">Error ID: {error.digest}</p>
                )}
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
