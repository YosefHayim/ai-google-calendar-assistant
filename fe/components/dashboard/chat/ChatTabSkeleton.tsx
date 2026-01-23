'use client'

import { Skeleton, SkeletonMessageBubble } from '@/components/ui/skeleton'

import React from 'react'

const ChatTabSkeleton: React.FC = () => {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden">
      {/* Chat Messages Area */}
      <div className="h-full overflow-y-auto px-4 pb-32 pt-24">
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
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-4">
        <div className="relative flex items-center gap-2 rounded-2xl bg-background bg-secondary p-2 shadow-2xl">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default ChatTabSkeleton
