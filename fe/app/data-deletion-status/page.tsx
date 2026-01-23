'use client'

import { AlertCircle, CheckCircle2, MessageCircle, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function DataDeletionContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const status = searchParams.get('status') || 'success'
  const error = searchParams.get('error')

  const isSuccess = status === 'success' && code
  const isError = status === 'error' || error

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        {isSuccess ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="mb-4 text-3xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-4xl">
              Data Deleted Successfully
            </h1>

            <p className="mb-6 leading-relaxed text-zinc-600 dark:text-muted-foreground">
              Your WhatsApp data has been permanently deleted from Ally. This includes your account information,
              conversation history, and any linked preferences.
            </p>

            <div className="mb-8 rounded-xl bg-muted p-6 dark:bg-secondary/50">
              <p className="mb-2 text-sm text-muted-foreground dark:text-muted-foreground">Confirmation Code</p>
              <p className="select-all font-mono text-lg text-foreground dark:text-primary-foreground">{code}</p>
            </div>

            <p className="mb-8 text-sm text-muted-foreground dark:text-muted-foreground">
              Please save this confirmation code for your records. You may need it if you contact support regarding this
              deletion request.
            </p>
          </>
        ) : isError ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 dark:bg-red-900/30">
              <XCircle className="h-8 w-8 text-destructive dark:text-red-400" />
            </div>

            <h1 className="mb-4 text-3xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-4xl">
              Deletion Failed
            </h1>

            <p className="mb-6 leading-relaxed text-zinc-600 dark:text-muted-foreground">
              We encountered an issue while processing your data deletion request. Please try again or contact our
              support team for assistance.
            </p>

            {error && (
              <div className="-red-800 mb-8 rounded-xl border-destructive/20 bg-destructive/5 p-4 dark:bg-red-900/20">
                <p className="text-sm text-destructive dark:text-red-400">
                  {(() => {
                    try {
                      return decodeURIComponent(error)
                    } catch {
                      return error
                    }
                  })()}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertCircle className="h-8 w-8 text-amber-700 dark:text-amber-400" />
            </div>

            <h1 className="mb-4 text-3xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-4xl">
              Data Deletion Status
            </h1>

            <p className="mb-6 leading-relaxed text-zinc-600 dark:text-muted-foreground">
              This page shows the status of your data deletion request. If you arrived here without a confirmation code,
              please check your request status through WhatsApp or contact support.
            </p>
          </>
        )}

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild variant="default">
            <Link href="/">Return to Home</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/contact">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>

        <div className="mt-12 border border-t pt-8">
          <h2 className="mb-4 text-lg font-medium text-foreground dark:text-primary-foreground">What happens next?</h2>
          <ul className="space-y-3 text-left text-sm text-zinc-600 dark:text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium dark:bg-zinc-700">
                1
              </span>
              <span>Your WhatsApp phone number has been unlinked from your Ally account</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium dark:bg-zinc-700">
                2
              </span>
              <span>All conversation history and preferences have been permanently removed</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium dark:bg-zinc-700">
                3
              </span>
              <span>You can reconnect WhatsApp to Ally anytime by starting a new conversation</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 text-xs text-muted-foreground dark:text-muted-foreground">
          This deletion was requested through Meta&apos;s data deletion process.
          <br />
          For questions about our data practices, see our{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export default function DataDeletionStatusPage() {
  return (
    <MarketingLayout>
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        }
      >
        <DataDeletionContent />
      </Suspense>
    </MarketingLayout>
  )
}
