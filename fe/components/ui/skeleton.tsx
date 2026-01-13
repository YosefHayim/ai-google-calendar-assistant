'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800', className)} style={style} />
}

// Card skeleton with icon, title, and value
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 sm:p-6 shadow-sm',
        className,
      )}
    >
      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-md mb-3 sm:mb-4" />
      <Skeleton className="h-6 sm:h-8 w-14 sm:w-16 mb-1.5 sm:mb-2" />
      <Skeleton className="h-3 w-20 sm:w-24" />
    </div>
  )
}

// Insight card skeleton
export function SkeletonInsightCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4',
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-md shrink-0" />
        <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
      </div>
      <div>
        <Skeleton className="h-6 sm:h-7 w-14 sm:w-16 mb-1.5 sm:mb-2" />
        <Skeleton className="h-3 sm:h-4 w-full" />
      </div>
    </div>
  )
}

// Deterministic heights for skeleton chart bars to avoid hydration mismatch
const CHART_BAR_HEIGHTS = [45, 72, 38, 65, 28, 55, 80, 42, 68, 35, 58, 48]

// Chart skeleton (column chart)
export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-4 sm:p-6',
        className,
      )}
    >
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
          <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded" />
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
        </div>
        <Skeleton className="h-3 w-36 sm:w-48" />
      </div>
      <div className="h-48 sm:h-64 flex items-end justify-between gap-1 sm:gap-2 px-2 sm:px-4">
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
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6',
        className,
      )}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="h-64 relative px-4">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <div
            key={ratio}
            className="absolute left-4 right-4 h-px bg-zinc-200 dark:bg-zinc-800 opacity-50"
            style={{ top: `${ratio * 100}%` }}
          />
        ))}
        {/* Animated line path skeleton */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <path
            d="M 20,160 Q 80,120 140,130 T 260,90 T 380,70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-300 dark:text-zinc-700"
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
              className="absolute w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"
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
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-4 sm:p-6 flex flex-col xl:flex-row items-center gap-4 sm:gap-6 h-full',
        className,
      )}
    >
      <div className="relative w-32 h-32 sm:w-44 sm:h-44 flex-shrink-0">
        <Skeleton className="w-full h-full rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-zinc-950" />
        </div>
      </div>
      <div className="w-full space-y-1.5 sm:space-y-2">
        <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-3 sm:mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm flex-shrink-0" />
            <Skeleton className="flex-1 h-3 sm:h-4" />
            <Skeleton className="w-6 sm:w-8 h-3 sm:h-4 flex-shrink-0" />
            <Skeleton className="w-6 sm:w-8 h-2.5 sm:h-3 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

// List skeleton
export function SkeletonList({ items = 4, className }: SkeletonProps & { items?: number }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-4 sm:p-6',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex-shrink-0" />
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
        </div>
        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 rounded flex-shrink-0" />
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-start gap-2 sm:gap-3">
            <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-md shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-3 sm:h-4 w-3/4 mb-1 sm:mb-1.5" />
              <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16" />
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
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-4 sm:p-6',
        className,
      )}
    >
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded" />
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
        </div>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2">
            <Skeleton className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" />
            <Skeleton className="flex-1 h-3 sm:h-4" />
            <Skeleton className="w-10 sm:w-12 h-3 sm:h-4 rounded flex-shrink-0" />
          </div>
        ))}
      </div>
      <Skeleton className="w-full h-8 sm:h-9 mt-4 sm:mt-6 rounded-md" />
    </div>
  )
}

// Heatmap skeleton
export function SkeletonHeatmap({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-48 rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {Array.from({ length: 52 }).map((_, colIdx) => (
              <Skeleton key={colIdx} className="w-2.5 h-2.5 rounded-sm" />
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
    <div
      className={cn(
        'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <Skeleton className="w-11 h-11 rounded-md" />
        <Skeleton className="w-24 h-6 rounded-full" />
      </div>
      <Skeleton className="h-5 w-24 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-6" />
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  )
}

// Message bubble skeleton for chat
export function SkeletonMessageBubble({ isUser = false, className }: SkeletonProps & { isUser?: boolean }) {
  return (
    <div className={cn('flex mb-6', isUser ? 'justify-end' : 'justify-start', className)}>
      <div
        className={cn(
          'px-4 py-3 rounded-md shadow-sm max-w-[85%] md:max-w-[75%]',
          isUser
            ? 'bg-primary/20 rounded-tr-none'
            : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none',
        )}
      >
        <Skeleton className={cn('h-4 mb-2', isUser ? 'w-32' : 'w-48')} />
        <Skeleton className={cn('h-4', isUser ? 'w-24' : 'w-64')} />
      </div>
    </div>
  )
}
