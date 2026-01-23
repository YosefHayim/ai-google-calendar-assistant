'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-xl bg-background bg-secondary p-3 sm:p-5',
            i === 0 && 'col-span-1 row-span-2 sm:col-span-2',
          )}
        >
          <Skeleton className="mb-2 h-4 w-16 sm:mb-3 sm:w-20" />
          <Skeleton className={cn('mb-2', i === 0 ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-6 w-20 sm:h-8 sm:w-24')} />
          <Skeleton className="h-3 w-24 sm:w-32" />
        </div>
      ))}
    </div>
  )
}
