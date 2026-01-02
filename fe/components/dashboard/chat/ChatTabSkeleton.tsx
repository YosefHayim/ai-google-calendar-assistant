'use client'

import { Skeleton, SkeletonMessageBubble } from '@/components/ui/skeleton'

import React from 'react'

const ChatTabSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full relative overflow-hidden">
      {/* Chat Messages Area */}
      <div className="h-full overflow-y-auto px-4 pt-24 pb-32">
        <div className="space-y-8">
          {/* Assistant message skeleton */}
          <SkeletonMessageBubble isUser={false} />

          {/* User message skeleton */}
          <SkeletonMessageBubble isUser={true} />

          {/* Assistant message skeleton */}
          <SkeletonMessageBubble isUser={false} />

          {/* User message skeleton */}
          <SkeletonMessageBubble isUser={true} />
        </div>
      </div>

      {/* Input Section Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-white dark:from-zinc-950 via-white/80 to-transparent">
        <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 gap-2">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <Skeleton className="flex-1 h-12 rounded-lg" />
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default ChatTabSkeleton
