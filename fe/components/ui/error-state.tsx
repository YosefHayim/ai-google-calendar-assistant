'use client'

import * as React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  title?: string
  onRetry?: () => void
  retryLabel?: string
  fullPage?: boolean
  icon?: React.ReactNode
  className?: string
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  title,
  onRetry,
  retryLabel = 'Try again',
  fullPage = false,
  icon,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        fullPage ? 'min-h-[300px] p-8' : 'p-6',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/20">
        {icon || <AlertCircle className="h-6 w-6 text-red-400" />}
      </div>
      {title && <h3 className="font-semibold text-foreground">{title}</h3>}
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 gap-2">
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
