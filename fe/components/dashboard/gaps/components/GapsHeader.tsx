'use client'

import { Calendar, RotateCw, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import React from 'react'
import { formatDate } from '@/lib/formatUtils'

interface GapsHeaderProps {
  analyzedRange?: {
    start: string
    end: string
  }
  totalGaps: number
  onRefresh: () => void
  isRefreshing: boolean
}

export function GapsHeader({ analyzedRange, totalGaps, onRefresh, isRefreshing }: GapsHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground dark:text-primary-foreground">
              Gap Analysis
            </h1>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Discover scheduling opportunities in your calendar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <InteractiveHoverButton
            text="Refresh"
            loadingText="Analyzing..."
            isLoading={isRefreshing}
            Icon={<RotateCw className="h-4 w-4" />}
            onClick={onRefresh}
            className="h-9"
          />
        </div>
      </div>

      {analyzedRange && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Analyzing period: {formatDate(new Date(analyzedRange.start), 'SHORT')} -{' '}
              {formatDate(new Date(analyzedRange.end), 'SHORT')}
            </span>
          </div>
          <div className="hidden sm:block text-muted-foreground/60">•</div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{totalGaps} potential gaps identified</span>
          </div>
        </div>
      )}
    </div>
  )
}
