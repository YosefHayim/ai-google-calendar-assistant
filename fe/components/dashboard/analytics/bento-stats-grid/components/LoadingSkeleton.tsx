'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`bg-background dark:bg-secondary border border dark:border rounded-xl p-3 sm:p-5 ${i === 0 ? 'col-span-1 sm:col-span-2 row-span-2' : ''}`}
        >
          <Skeleton className="h-4 w-16 sm:w-20 mb-2 sm:mb-3" />
          <Skeleton className={`${i === 0 ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-6 sm:h-8 w-20 sm:w-24'} mb-2`} />
          <Skeleton className="h-3 w-24 sm:w-32" />
        </div>
      ))}
    </div>
  )
}
