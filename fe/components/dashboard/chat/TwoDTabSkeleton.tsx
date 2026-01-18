'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare } from 'lucide-react'
import React from 'react'

const TwoDTabSkeleton: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10 bg-background dark:bg-secondary flex flex-col md:flex-row items-center justify-center p-4">
      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center transition-all duration-700 w-full md:w-1/2">
        {/* Avatar Circle Skeleton */}
        <div className="relative flex items-center justify-center w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px]">
          <div className="absolute inset-0 rounded-full bg-accent dark:bg-secondary blur-[100px] opacity-20" />
          <Skeleton className="w-full h-full rounded-full" />
        </div>

        {/* Text Skeleton */}
        <div className="mt-8 text-center relative z-10 px-4">
          <Skeleton className="h-8 w-64 mb-2 mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>
      </div>

      {/* Conversation Context Sidebar Skeleton */}
      <div className="hidden md:flex flex-col w-1/2 h-[70%] border-l border dark:border px-8 py-4">
        <div className="flex items-center gap-2 mb-6 text-muted-foreground">
          <MessageSquare className="w-3.5 h-3.5" />
          <Skeleton className="h-3 w-24" />
        </div>

        <div className="flex-1 space-y-4">
          {/* Assistant message skeleton */}
          <div className="flex flex-col">
            <Skeleton className="h-16 w-[90%] rounded-xl rounded-tl-none" />
            <div className="flex items-center gap-2 mt-1 px-1">
              <Skeleton className="w-3 h-3 rounded" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>

          {/* User message skeleton */}
          <div className="flex flex-col items-end">
            <Skeleton className="h-12 w-[75%] rounded-xl rounded-tr-none" />
            <div className="flex items-center gap-2 mt-1 px-1">
              <Skeleton className="h-2 w-12" />
            </div>
          </div>

          {/* Assistant message skeleton */}
          <div className="flex flex-col">
            <Skeleton className="h-20 w-[85%] rounded-xl rounded-tl-none" />
            <div className="flex items-center gap-2 mt-1 px-1">
              <Skeleton className="w-3 h-3 rounded" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwoDTabSkeleton
