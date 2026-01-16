'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { CheckCircle2, XCircle, AlertCircle, MessageCircle } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Button } from '@/components/ui/button'

function DataDeletionContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const status = searchParams.get('status') || 'success'
  const error = searchParams.get('error')

  const isSuccess = status === 'success' && code
  const isError = status === 'error' || error

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-6">
      <div className="max-w-lg w-full text-center">
        {isSuccess ? (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              Data Deleted Successfully
            </h1>

            <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              Your WhatsApp data has been permanently deleted from Ally. This includes your account information,
              conversation history, and any linked preferences.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 mb-8">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Confirmation Code</p>
              <p className="font-mono text-lg text-zinc-900 dark:text-zinc-100 select-all">{code}</p>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
              Please save this confirmation code for your records. You may need it if you contact support regarding this
              deletion request.
            </p>
          </>
        ) : isError ? (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              Deletion Failed
            </h1>

            <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              We encountered an issue while processing your data deletion request. Please try again or contact our
              support team for assistance.
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800 mb-8">
                <p className="text-sm text-red-600 dark:text-red-400">{decodeURIComponent(error)}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>

            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              Data Deletion Status
            </h1>

            <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              This page shows the status of your data deletion request. If you arrived here without a confirmation code,
              please check your request status through WhatsApp or contact support.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/">Return to Home</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/contact">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">What happens next?</h2>
          <ul className="text-left text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium">
                1
              </span>
              <span>Your WhatsApp phone number has been unlinked from your Ally account</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium">
                2
              </span>
              <span>All conversation history and preferences have been permanently removed</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium">
                3
              </span>
              <span>You can reconnect WhatsApp to Ally anytime by starting a new conversation</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
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
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-pulse text-zinc-400">Loading...</div>
          </div>
        }
      >
        <DataDeletionContent />
      </Suspense>
    </MarketingLayout>
  )
}
