'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton loading state for InsightCard
 * Matches the layout and dimensions of the actual InsightCard component
 */
const InsightCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center gap-3">
        {/* Icon skeleton */}
        <Skeleton className="w-8 h-8 rounded-md shrink-0" />
        {/* Title skeleton */}
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        {/* Value skeleton */}
        <Skeleton className="h-8 w-16" />
        {/* Description skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export default InsightCardSkeleton
