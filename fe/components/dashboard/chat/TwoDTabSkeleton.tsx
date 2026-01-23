'use client'

import { MessageSquare } from 'lucide-react'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const TwoDTabSkeleton: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background bg-secondary p-4 md:flex-row">
      {/* Avatar Section */}
      <div className="flex w-full flex-col items-center justify-center transition-all duration-700 md:w-1/2">
        {/* Avatar Circle Skeleton */}
        <div className="relative flex h-[280px] w-[280px] items-center justify-center sm:h-[320px] sm:w-[320px] md:h-[450px] md:w-[450px]">
          <div className="absolute inset-0 rounded-full bg-accent bg-secondary opacity-20 blur-[100px]" />
          <Skeleton className="h-full w-full rounded-full" />
        </div>

        {/* Text Skeleton */}
        <div className="relative z-10 mt-8 px-4 text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-64" />
          <Skeleton className="mx-auto h-6 w-48" />
        </div>
      </div>

      {/* Conversation Context Sidebar Skeleton */}
      <div className="hidden h-[70%] w-1/2 flex-col border-l px-8 py-4 md:flex">
        <div className="mb-6 flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          <Skeleton className="h-3 w-24" />
        </div>

        <div className="flex-1 space-y-4">
          {/* Assistant message skeleton */}
          <div className="flex flex-col">
            <Skeleton className="h-16 w-[90%] rounded-xl rounded-tl-none" />
            <div className="mt-1 flex items-center gap-2 px-1">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>

          {/* User message skeleton */}
          <div className="flex flex-col items-end">
            <Skeleton className="h-12 w-[75%] rounded-xl rounded-tr-none" />
            <div className="mt-1 flex items-center gap-2 px-1">
              <Skeleton className="h-2 w-12" />
            </div>
          </div>

          {/* Assistant message skeleton */}
          <div className="flex flex-col">
            <Skeleton className="h-20 w-[85%] rounded-xl rounded-tl-none" />
            <div className="mt-1 flex items-center gap-2 px-1">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwoDTabSkeleton
