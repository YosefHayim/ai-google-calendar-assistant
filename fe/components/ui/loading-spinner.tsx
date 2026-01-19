'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  overlay?: boolean
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-2',
}

/**
 * Consistent loading spinner component used across the application.
 * Use overlay=true for full-container overlays (like loading a conversation).
 */
export function LoadingSpinner({ size = 'md', className, overlay = false, text }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-muted border-t-foreground -secondary -t-primary-foreground',
        sizeClasses[size],
        className,
      )}
    />
  )

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-background/80 dark:bg-secondary/80 z-20 flex flex-col items-center justify-center gap-3">
        {spinner}
        {text && <p className="text-sm text-muted-foreground dark:text-muted-foreground">{text}</p>}
      </div>
    )
  }

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        {spinner}
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">{text}</p>
      </div>
    )
  }

  return spinner
}

/**
 * Centered loading spinner for tab content or sections
 */
export function LoadingSection({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}
