'use client'

import React from 'react'
import { Loader2, AlertCircle, RefreshCw, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoadingViewProps {
  message?: string
}

export const GapLoadingView: React.FC<LoadingViewProps> = ({ message = 'Analyzing your calendar...' }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
    <div className="flex flex-col items-center justify-center h-48">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  </div>
)

interface ErrorViewProps {
  onRetry: () => void
}

export const GapErrorView: React.FC<ErrorViewProps> = ({ onRetry }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">Unable to Load Gaps</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-sm">
        We couldn&apos;t analyze your calendar. Please try again.
      </p>
      <Button onClick={onRetry} variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>
  </div>
)

export const GapEmptyView: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
        <CalendarCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">All Caught Up!</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
        Your calendar looks well-organized. Ally will notify you when new time gaps are detected.
      </p>
    </div>
  </div>
)
