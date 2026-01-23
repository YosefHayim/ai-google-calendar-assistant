'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-accent bg-secondary', className)} style={style} />
}

// Card skeleton with icon, title, and value
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-md border-border bg-background bg-secondary p-4 shadow-sm sm:p-6', className)}>
      <Skeleton className="mb-3 h-8 w-8 rounded-md sm:mb-4 sm:h-10 sm:w-10" />
      <Skeleton className="mb-1.5 h-6 w-14 sm:mb-2 sm:h-8 sm:w-16" />
      <Skeleton className="h-3 w-20 sm:w-24" />
    </div>
  )
}

// Insight card skeleton
export function SkeletonInsightCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border-border bg-background bg-secondary p-3 shadow-sm sm:gap-3 sm:p-4 md:gap-4 md:p-6',
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="h-7 w-7 shrink-0 rounded-md sm:h-8 sm:w-8" />
        <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
      </div>
      <div>
        <Skeleton className="mb-1.5 h-6 w-14 sm:mb-2 sm:h-7 sm:w-16" />
        <Skeleton className="h-3 w-full sm:h-4" />
      </div>
    </div>
  )
}

// Deterministic heights for skeleton chart bars to avoid hydration mismatch
const CHART_BAR_HEIGHTS = [45, 72, 38, 65, 28, 55, 80, 42, 68, 35, 58, 48]

// Chart skeleton (column chart)
export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-md border-border bg-background bg-secondary p-4 shadow-sm sm:p-6', className)}>
      <div className="mb-4 sm:mb-6">
        <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
          <Skeleton className="h-4 w-4 rounded sm:h-5 sm:w-5" />
          <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
        </div>
        <Skeleton className="h-3 w-36 sm:w-48" />
      </div>
      <div className="flex h-48 items-end justify-between gap-1 px-2 sm:h-64 sm:gap-2 sm:px-4">
        {CHART_BAR_HEIGHTS.map((height, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  )
}

// Line chart skeleton
export function SkeletonLineChart({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-md border-border bg-background bg-secondary p-6 shadow-sm', className)}>
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="relative h-64 px-4">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <div
            key={ratio}
            className="absolute left-4 right-4 h-px bg-accent bg-secondary opacity-50"
            style={{ top: `${ratio * 100}%` }}
          />
        ))}
        {/* Animated line path skeleton */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <path
            d="M 20,160 Q 80,120 140,130 T 260,90 T 380,70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
            opacity="0.5"
          />
        </svg>
        {/* Dots along the line */}
        {Array.from({ length: 8 }).map((_, i) => {
          const x = 20 + (i / 7) * 360
          const y = 160 - (i / 7) * 60 - Math.sin(i) * 20
          return (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-muted"
              style={{
                left: `${(x / 400) * 100}%`,
                top: `${(y / 200) * 100}%`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// Time allocation donut skeleton
export function SkeletonDonutChart({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center gap-4 rounded-md border-border bg-background bg-secondary p-4 shadow-sm sm:gap-6 sm:p-6 xl:flex-row',
        className,
      )}
    >
      <div className="relative h-32 w-32 flex-shrink-0 sm:h-44 sm:w-44">
        <Skeleton className="h-full w-full rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-background bg-secondary sm:h-24 sm:w-24" />
        </div>
      </div>
      <div className="w-full space-y-1.5 sm:space-y-2">
        <Skeleton className="mb-3 h-4 w-24 sm:mb-4 sm:h-5 sm:w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-2 w-2 flex-shrink-0 rounded-sm sm:h-2.5 sm:w-2.5" />
            <Skeleton className="h-3 flex-1 sm:h-4" />
            <Skeleton className="h-3 w-6 flex-shrink-0 sm:h-4 sm:w-8" />
            <Skeleton className="h-2.5 w-6 flex-shrink-0 sm:h-3 sm:w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

// List skeleton
export function SkeletonList({ items = 4, className }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn('rounded-md border-border bg-background bg-secondary p-4 shadow-sm sm:p-6', className)}>
      <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 flex-shrink-0 rounded sm:h-4 sm:w-4" />
          <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
        </div>
        <Skeleton className="h-3 w-12 flex-shrink-0 rounded sm:h-4 sm:w-16" />
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-start gap-2 sm:gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-md sm:h-8 sm:w-8" />
            <div className="min-w-0 flex-1">
              <Skeleton className="mb-1 h-3 w-3/4 sm:mb-1.5 sm:h-4" />
              <Skeleton className="h-2.5 w-14 sm:h-3 sm:w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Calendar sources skeleton
export function SkeletonCalendarSources({ items = 4, className }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn('rounded-md border-border bg-background bg-secondary p-4 shadow-sm sm:p-6', className)}>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded sm:h-4 sm:w-4" />
          <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
        </div>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-1.5 sm:gap-3 sm:p-2">
            <Skeleton className="h-2 w-2 flex-shrink-0 rounded-full sm:h-2.5 sm:w-2.5" />
            <Skeleton className="h-3 flex-1 sm:h-4" />
            <Skeleton className="h-3 w-10 flex-shrink-0 rounded sm:h-4 sm:w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-4 h-8 w-full rounded-md sm:mt-6 sm:h-9" />
    </div>
  )
}

// Heatmap skeleton
export function SkeletonHeatmap({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-md border-border bg-background bg-secondary p-6 shadow-sm', className)}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-48 rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {Array.from({ length: 52 }).map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-2.5 w-2.5 rounded-sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Integration card skeleton
export function SkeletonIntegrationCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-md border-border bg-background bg-secondary p-6 shadow-sm', className)}>
      <div className="mb-6 flex items-start justify-between">
        <Skeleton className="h-11 w-11 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-5 w-24" />
      <Skeleton className="mb-1 h-4 w-full" />
      <Skeleton className="mb-6 h-4 w-3/4" />
      <div className="border-t border-border pt-4">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  )
}

// Message bubble skeleton for chat
export function SkeletonMessageBubble({ isUser = false, className }: SkeletonProps & { isUser?: boolean }) {
  return (
    <div className={cn('mb-6 flex', isUser ? 'justify-end' : 'justify-start', className)}>
      <div
        className={cn(
          'max-w-[85%] rounded-md px-4 py-3 shadow-sm md:max-w-[75%]',
          isUser ? 'rounded-tr-none bg-primary/20' : 'rounded-tl-none border-border bg-background bg-secondary',
        )}
      >
        <Skeleton className={cn('mb-2 h-4', isUser ? 'w-32' : 'w-48')} />
        <Skeleton className={cn('h-4', isUser ? 'w-24' : 'w-64')} />
      </div>
    </div>
  )
}
