'use client'

import { Clock, Target, TrendingUp, Zap } from 'lucide-react'

import type { FocusTimeMetrics } from '@/types/analytics'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface FocusTimeTrackerProps {
  data: FocusTimeMetrics
  totalDays: number
  isLoading?: boolean
}

const FocusTimeTracker: React.FC<FocusTimeTrackerProps> = ({ data, totalDays, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-background bg-secondary p-4 shadow-sm sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg sm:h-8 sm:w-8" />
          <Skeleton className="h-4 w-28 sm:h-5 sm:w-32" />
        </div>
        <Skeleton className="mb-4 h-3 w-40 sm:mb-6 sm:h-4 sm:w-48" />
        <div className="space-y-2 sm:space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full sm:h-12" />
          ))}
        </div>
      </div>
    )
  }

  const focusStats = [
    {
      icon: Zap,
      label: 'Focus Blocks',
      value: data.totalFocusBlocks,
      suffix: 'blocks',
      description: '2+ hour uninterrupted periods',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Clock,
      label: 'Avg Block Length',
      value: data.averageFocusBlockLength,
      suffix: 'hrs',
      description: 'Average duration per block',
      color: 'text-accent',
      bgColor: 'bg-accent/10/30',
    },
    {
      icon: TrendingUp,
      label: 'Longest Block',
      value: data.longestFocusBlock,
      suffix: 'hrs',
      description: 'Best focus session',
      color: 'text-primary',
      bgColor: 'bg-primary/10/30',
    },
    {
      icon: Target,
      label: 'Focus Time',
      value: data.focusTimePercentage,
      suffix: '%',
      description: 'Of total waking hours',
      color: 'text-accent',
      bgColor: 'bg-accent/10/30',
    },
  ]

  const getFocusQuality = (percentage: number): { label: string; color: string } => {
    if (percentage >= 70) return { label: 'Excellent', color: 'text-primary' }
    if (percentage >= 50) return { label: 'Good', color: 'text-accent' }
    if (percentage >= 30) return { label: 'Fair', color: 'text-secondary' }
    return { label: 'Needs Improvement', color: 'text-destructive' }
  }

  const quality = getFocusQuality(data.focusTimePercentage)

  return (
    <div className="rounded-xl bg-background bg-secondary p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-secondary sm:h-8 sm:w-8">
            <Target className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />
          </div>
          <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">Focus Time</h3>
        </div>
        <span className={`flex-shrink-0 text-xs font-medium sm:text-sm ${quality.color}`}>{quality.label}</span>
      </div>
      <p className="mb-3 ml-9 text-[10px] text-muted-foreground sm:mb-4 sm:ml-10 sm:text-xs">
        Deep work blocks over {totalDays} days
      </p>

      <div className="space-y-2 sm:space-y-2">
        {focusStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 rounded-lg bg-muted bg-secondary/50 p-2 transition-colors hover:bg-secondary sm:gap-3 sm:p-3"
          >
            <div
              className={`h-8 w-8 rounded-lg sm:h-10 sm:w-10 ${stat.bgColor} flex flex-shrink-0 items-center justify-center`}
            >
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-xs font-medium text-foreground text-muted-foreground sm:text-sm">
                  {stat.label}
                </span>
                <span className="flex-shrink-0 text-base font-bold text-foreground sm:text-lg">
                  {stat.value}
                  <span className="ml-0.5 text-[10px] font-normal text-muted-foreground sm:ml-1 sm:text-xs">
                    {stat.suffix}
                  </span>
                </span>
              </div>
              <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Focus Progress Bar */}
      <div className="mt-3 border border-t pt-3 sm:mt-4 sm:pt-4">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] sm:mb-2 sm:text-xs">
          <span className="truncate text-muted-foreground">Focus vs Meeting Time</span>
          <span className="flex-shrink-0 font-medium text-foreground text-muted-foreground">
            {data.focusTimePercentage}% focus
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-accent bg-secondary sm:h-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent transition-all duration-500"
            style={{ width: `${Math.min(100, data.focusTimePercentage)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default FocusTimeTracker
