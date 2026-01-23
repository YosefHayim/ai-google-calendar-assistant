'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton loading state for InsightCard
 * Matches the layout and dimensions of the actual InsightCard component
 */
const InsightCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-background bg-secondary p-3 shadow-sm sm:gap-3 sm:p-4 md:gap-4 md:p-6">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Icon skeleton */}
        <Skeleton className="h-7 w-7 shrink-0 rounded-md sm:h-8 sm:w-8" />
        {/* Title skeleton */}
        <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {/* Value skeleton */}
        <Skeleton className="h-6 w-14 sm:h-8 sm:w-16" />
        {/* Description skeleton */}
        <Skeleton className="h-3 w-full sm:h-4" />
        <Skeleton className="h-3 w-3/4 sm:h-4" />
      </div>
    </div>
  )
}

export default InsightCardSkeleton
